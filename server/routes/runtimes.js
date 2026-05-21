import { Router } from "express";

const router = Router();

const PISTON_RUNTIMES_URL = "https://emkc.org/api/v2/piston/runtimes";

// Simple in-memory cache (Piston runtimes change rarely).
let cache = { data: null, fetchedAt: 0 };
const TTL_MS = 60 * 60 * 1000; // 1 hour

router.get("/", async (_req, res) => {
  try {
    const now = Date.now();
    if (cache.data && now - cache.fetchedAt < TTL_MS) {
      return res.json({ runtimes: cache.data, cached: true });
    }
    const r = await fetch(PISTON_RUNTIMES_URL);
    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: `Piston error: ${text}` });
    }
    const data = await r.json();
    cache = { data, fetchedAt: now };
    res.json({ runtimes: data, cached: false });
  } catch (err) {
    console.error("[/api/runtimes] error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
