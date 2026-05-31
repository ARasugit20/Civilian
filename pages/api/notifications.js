import { auth } from "../../lib/auth";
import { insforge } from "../../lib/insforge";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const session = await auth(req, res);
  if (!session?.user?.id) {
    return res.status(200).json([]);
  }

  try {
    const { data, error } = await insforge.database
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.warn("notifications fetch:", error.message);
      return res.status(200).json([]);
    }

    return res.status(200).json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.warn("notifications:", err?.message || err);
    return res.status(200).json([]);
  }
}
