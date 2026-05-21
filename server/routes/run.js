import { Router } from "express";

const router = Router();

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

router.post("/", async (req, res) => {
  try {
    const {
      language = "python",
      version = "*",
      code = "",
      stdin = "",
      args = [],
      files,
    } = req.body;

    // Default: single-file submission with `code`.
    // Optional: caller may pass `files: [{name, content}, ...]` for multi-file.
    const payloadFiles =
      Array.isArray(files) && files.length > 0
        ? files
        : [{ content: code }];

    const start = Date.now();
    const r = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        version,
        files: payloadFiles,
        stdin,
        args,
      }),
    });
    const networkMs = Date.now() - start;

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: `Piston error: ${text}` });
    }

    const data = await r.json();
    res.json({
      stdout: data.run?.stdout ?? "",
      stderr: data.run?.stderr ?? "",
      output: data.run?.output ?? "",
      exitCode: data.run?.code ?? null,
      signal: data.run?.signal ?? null,
      compile: data.compile
        ? {
            stdout: data.compile.stdout ?? "",
            stderr: data.compile.stderr ?? "",
            code: data.compile.code ?? null,
          }
        : null,
      language: data.language,
      version: data.version,
      networkMs,
    });
  } catch (err) {
    console.error("[/api/run] error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
