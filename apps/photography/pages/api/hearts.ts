import { Redis } from "@upstash/redis";
import type { NextApiRequest, NextApiResponse } from "next";

// Shared ❤️ tally per photograph, stored in Upstash Redis.
//
// This route is the ONLY thing that talks to Redis — the browser just calls
// GET/POST /api/hearts. The credentials are plain server env vars (no
// NEXT_PUBLIC_ prefix, never imported client-side), so they can't leak into
// the bundle.
//
// Redis.fromEnv() picks up UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN.
// The KV_REST_API_* fallback covers Vercel's Upstash Marketplace integration,
// which sets those names instead. With nothing configured the route reports
// "not persisted" and the client falls back to its own localStorage count.
const KEY = "pg:hearts:v1";

const redis: Redis | null = (() => {
  try {
    return Redis.fromEnv();
  } catch {
    // fromEnv() throws when the UPSTASH_* vars are absent.
  }
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
})();

const safeParse = (s: string): { path?: unknown } | null => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (!redis) {
    return res.status(200).json({ hearts: {}, persisted: false });
  }

  try {
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? safeParse(req.body) : req.body;
      const path = typeof body?.path === "string" ? body.path.slice(0, 400) : null;
      if (!path) return res.status(400).json({ error: "path required" });
      const count = await redis.hincrby(KEY, path, 1);
      return res.status(200).json({ path, count, persisted: true });
    }

    const hearts = (await redis.hgetall<Record<string, number>>(KEY)) ?? {};
    return res.status(200).json({ hearts, persisted: true });
  } catch {
    // A flaky store must not take the gallery down.
    return res.status(200).json({ hearts: {}, persisted: false });
  }
}
