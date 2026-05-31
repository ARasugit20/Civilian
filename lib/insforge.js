import { createClient } from "@insforge/sdk";

export const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
});

export async function upsertProfile(user) {
  if (!user?.id) return;

  const row = {
    id: user.id,
    email: user.email || null,
    display_name: user.name || null,
    avatar_url: user.image || null,
  };

  try {
    const { error } = await insforge.database.from("profiles").upsert(row, { onConflict: "id" });
    if (error) throw error;
    return;
  } catch {
    // Fallback if upsert is unavailable on this SDK version.
  }

  const { data: existing } = await insforge.database.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (existing?.id) {
    await insforge.database
      .from("profiles")
      .update({ display_name: row.display_name, avatar_url: row.avatar_url, email: row.email })
      .eq("id", user.id);
    return;
  }

  await insforge.database.from("profiles").insert([{ ...row, created_at: new Date().toISOString() }]);
}
