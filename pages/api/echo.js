import { auth } from "../../lib/auth";
import { recordEcho } from "../../lib/echoService";
import { getEchoActorId } from "../../lib/echoIdentity";
import { insforge } from "../../lib/insforge";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { id, alreadyEchoed } = req.body;
  const session = await auth(req, res);
  const actorId = getEchoActorId(req, session?.user?.id);

  const outcome = await recordEcho({
    insforge,
    postId: id,
    actorId,
    alreadyEchoed: !!alreadyEchoed,
  });

  if (!outcome.ok) {
    return res.status(outcome.status).json({ error: outcome.error });
  }
  if (outcome.data) return res.status(200).json(outcome.data);
  return res.status(200).json({ echo_count: outcome.echo_count });
}
