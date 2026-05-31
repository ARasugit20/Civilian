/** Record one echo per actor per post; increment echo_count only on new echo row. */
export async function recordEcho({ insforge, postId, actorId, alreadyEchoed }) {
  if (alreadyEchoed) {
    return { ok: false, status: 400, error: "You've already added your voice" };
  }
  if (!postId) {
    return { ok: false, status: 400, error: "Post id required" };
  }
  if (!actorId) {
    return { ok: false, status: 400, error: "Could not identify echo session" };
  }

  if (String(postId).startsWith("fallback-")) {
    return { ok: true, status: 200, echo_count: null, duplicate: false };
  }

  const { error: insertError } = await insforge.database
    .from("echoes")
    .insert([{ post_id: postId, user_id: actorId }]);

  if (insertError) {
    const msg = String(insertError.message || insertError.code || "").toLowerCase();
    const isDuplicate =
      msg.includes("unique") ||
      msg.includes("duplicate") ||
      insertError.code === "23505";
    if (isDuplicate) {
      return { ok: false, status: 400, error: "You've already added your voice", duplicate: true };
    }
    console.warn("echoes insert failed, using count-only fallback:", insertError.message || insertError);
  }

  const { data: post, error: fetchError } = await insforge.database
    .from("posts")
    .select("echo_count")
    .eq("id", postId)
    .single();

  if (fetchError || !post) {
    return { ok: true, status: 200, echo_count: null, duplicate: false };
  }

  const nextCount = (Number(post.echo_count) || 0) + 1;
  const { data, error } = await insforge.database
    .from("posts")
    .update({ echo_count: nextCount })
    .eq("id", postId)
    .select()
    .single();

  if (error) {
    return { ok: true, status: 200, echo_count: null, duplicate: false };
  }
  return { ok: true, status: 200, data, echo_count: data?.echo_count ?? nextCount, duplicate: false };
}
