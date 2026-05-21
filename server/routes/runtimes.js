import { Router } from "express";

const router = Router();

const JUDGE0_URL = "https://ce.judge0.com";

// Simple in-memory cache (language list changes rarely).
let cache = { data: null, fetchedAt: 0 };
const TTL_MS = 60 * 60 * 1000; // 1 hour

router.get("/", async (_req, res) => {
  try {
    const now = Date.now();
    if (cache.data && now - cache.fetchedAt < TTL_MS) {
      return res.json({ runtimes: cache.data, cached: true });
    }

    const r = await fetch(`${JUDGE0_URL}/languages`);
    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: `Judge0 error: ${text}` });
    }

    const data = await r.json();

    // Transform to a format similar to what the frontend expects
    // Judge0 returns: [{ id: 71, name: "Python (3.8.1)" }, ...]
    const runtimes = data.map((lang) => ({
      language: lang.name.split("(")[0].trim().toLowerCase(),
      version: (lang.name.match(/\(([^)]+)\)/) || [])[1] || "",
      id: lang.id,
      fullName: lang.name,
    }));

    cache = { data: runtimes, fetchedAt: now };
    res.json({ runtimes, cached: false });
  } catch (err) {
    console.error("[/api/runtimes] error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
