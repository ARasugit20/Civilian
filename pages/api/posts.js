import { auth } from "../../lib/auth";
import { insforge } from "../../lib/insforge";
import {
  FALLBACK_POSTS,
  withDbTimeout,
  resolveFeedPosts,
} from "../../lib/postsFeed";

async function geocodeLocation(location) {
  try {
    const query = encodeURIComponent(`${location}, Tempe, Arizona`);
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1&country=US`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.features?.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
  } catch (e) {
    console.error("Geocoding failed:", e);
  }
  return { lat: null, lng: null };
}

async function fetchPostsList({ sort, filterType, userId }) {
  let query = insforge.database.from("posts").select("*");

  if (sort === "trending") query = query.order("echo_count", { ascending: false });
  else if (sort === "urgent") query = query.order("urgency_score", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  if (filterType) query = query.eq("issue_type", filterType);
  if (userId) query = query.eq("user_id", userId);

  try {
    const { data, error } = await withDbTimeout(() => query, undefined, "posts list");
    return resolveFeedPosts({ data, error, sort, filterType, userId });
  } catch (err) {
    console.warn("DB unavailable for posts:", err.message);
    return resolveFeedPosts({ data: null, error: err, sort, filterType, userId });
  }
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { id, user_id: userId, echoed, issue_type: filterType } = req.query;

    if (id) {
      if (String(id).startsWith("fallback-")) {
        const post = FALLBACK_POSTS.find((p) => p.id === id);
        if (post) return res.status(200).json(post);
        return res.status(404).json({ error: "Not found" });
      }

      try {
        const { data, error } = await withDbTimeout(
          () => insforge.database.from("posts").select("*").eq("id", id).single(),
          undefined,
          "post by id"
        );
        if (error) throw error;
        return res.status(200).json(data);
      } catch (err) {
        const post = FALLBACK_POSTS.find((p) => p.id === id);
        if (post) return res.status(200).json(post);
        return res.status(404).json({ error: "Post not found" });
      }
    }

    if (echoed === "1") {
      const session = await auth(req, res);
      if (!session?.user?.id) return res.status(200).json([]);

      try {
        const { data: echoRows, error: echoError } = await withDbTimeout(
          () => insforge.database.from("echoes").select("post_id").eq("user_id", session.user.id),
          undefined,
          "echoed post ids"
        );

        if (echoError || !echoRows?.length) return res.status(200).json([]);

        const postIds = echoRows.map((row) => row.post_id).filter(Boolean);
        if (!postIds.length) return res.status(200).json([]);

        const echoedPosts = [];
        for (const postId of postIds) {
          const { data: post } = await withDbTimeout(
            () => insforge.database.from("posts").select("*").eq("id", postId).maybeSingle(),
            undefined,
            "echoed post"
          );
          if (post) echoedPosts.push(post);
        }
        return res.status(200).json(echoedPosts);
      } catch (err) {
        console.warn("DB unavailable for echoed posts:", err.message);
        return res.status(200).json([]);
      }
    }

    const sort = req.query.sort || "new";
    const posts = await fetchPostsList({ sort, filterType, userId });
    return res.status(200).json(posts);
  }

  if (req.method === "POST") {
    const {
      complaint,
      formal_request,
      department,
      official_name,
      official_email,
      issue_type,
      location,
      video_url,
      urgency_score,
    } = req.body;

    const { lat, lng } = await geocodeLocation(location || "Tempe, Arizona");

    const newPost = {
      complaint,
      formal_request,
      department,
      official_name,
      official_email,
      issue_type,
      location,
      lat,
      lng,
      echo_count: 1,
      status: "pending",
      video_url: video_url || null,
      urgency_score: urgency_score ? Number(urgency_score) : null,
    };

    const session = await auth(req, res);
    if (session?.user?.id) {
      newPost.user_id = session.user.id;
      newPost.user_display_name = session.user.name || null;
      newPost.user_avatar = session.user.image || null;
    }

    try {
      const { data, error } = await withDbTimeout(
        () => insforge.database.from("posts").insert([newPost]).select().single(),
        undefined,
        "post insert"
      );
      if (error) throw new Error(error.message);
      return res.status(200).json(data);
    } catch (err) {
      console.error("DB save failed:", err.message);
      return res.status(503).json({
        error: "save_failed",
        message: "Your complaint could not be saved right now. Please try again. Your text has not been lost.",
      });
    }
  }

  return res.status(405).end();
}
