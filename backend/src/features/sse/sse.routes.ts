import { Router } from "express";
import type { Response } from "express";
import { requireSession } from "../auth/auth.middleware";
import { apiLimiter } from "../../middleware/rateLimiter";
import redis from "../../lib/redis";
import logger from "../../lib/logger";

const router = Router();
router.use(apiLimiter);

// Process-level fanout: one shared Redis subscriber, in-memory map of userId → active responses.
// This avoids one Redis connection per SSE client (which exhausts maxclients at scale).
const clients = new Map<string, Set<Response>>();
const sharedSubscriber = redis.duplicate();

let subscriberPromise: Promise<void> | null = null;

function ensureSubscriber(): Promise<void> {
  if (!subscriberPromise) {
    subscriberPromise = (async () => {
      await sharedSubscriber.connect();
      await sharedSubscriber.pSubscribe("sse:user:*", (rawMessage, channel) => {
        const userId = channel.slice("sse:user:".length);
        const targets = clients.get(userId);
        if (!targets || targets.size === 0) return;
        let frame: string;
        try {
          const parsed = JSON.parse(rawMessage) as { type: string; data: unknown };
          frame = `event: ${parsed.type}\ndata: ${JSON.stringify(parsed.data)}\n\n`;
        } catch {
          return; // malformed publish — ignore
        }
        for (const res of targets) {
          try { res.write(frame); } catch { /* client already disconnected */ }
        }
      });
    })().catch((err) => {
      logger.error("SSE shared subscriber init failed", { err });
      subscriberPromise = null; // allow retry on next request
      throw err;
    });
  }
  return subscriberPromise;
}

// Connect eagerly so the first request doesn't pay the connect latency
ensureSubscriber().catch(() => { /* logged above */ });

router.get("/", requireSession, async (req, res) => {
  const userId = req.user!.id;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  try {
    await ensureSubscriber();
  } catch (err) {
    logger.error("SSE shared subscriber unavailable", { err, userId });
    res.end();
    return;
  }

  res.write("event: connected\ndata: {}\n\n");

  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId)!.add(res);

  const PRESENCE_TTL = 60; // seconds — must exceed heartbeat interval
  const presenceKey = `presence:user:${userId}`;
  redis.set(presenceKey, "1", { EX: PRESENCE_TTL }).catch(() => { /* non-fatal */ });

  const heartbeat = setInterval(() => {
    res.write(": ping\n\n");
    // Full SET (not EXPIRE) so we recreate the key if another replica deleted it on their disconnect.
    redis.set(presenceKey, "1", { EX: PRESENCE_TTL }).catch(() => { /* non-fatal */ });
  }, 25000);

  const cleanup = () => {
    clearInterval(heartbeat);
    const set = clients.get(userId);
    if (set) {
      set.delete(res);
      if (set.size === 0) clients.delete(userId);
      // Do not DEL the Redis key — another replica may still have this user connected
      // and relies on its heartbeat to keep the TTL alive. The key expires naturally.
    }
  };

  req.on("close", cleanup);
  req.on("error", cleanup);
});

// Returns which of the requested user IDs currently have an active SSE connection.
// Queries Redis so results are accurate across all backend replicas.
router.get("/presence", requireSession, async (req, res) => {
  const ids = String(req.query["ids"] ?? "").split(",").filter(Boolean).slice(0, 50);
  if (ids.length === 0) { res.json({ online: [] }); return; }
  const keys = ids.map((id) => `presence:user:${id}`);
  const values = await redis.mGet(keys);
  const online = ids.filter((_, i) => values[i] !== null);
  res.json({ online });
});

export default router;
