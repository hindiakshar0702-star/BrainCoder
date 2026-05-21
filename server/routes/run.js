import { Router } from "express";

const router = Router();

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

// Map our editor language ids -> Piston language names.
const LANG_MAP = {
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  java: "java",
  c: "c",
  cpp: "c++",
  csharp: "csharp",
  go: "go",
  rust: "rust",
  ruby: "ruby",
  php: "php",
  kotlin: "kotlin",
  swift: "swift",
  r: "rscript",
  bash: "bash",
  lua: "lua",
  sql: "sqlite3",
};

router.post("/", async (req, res) => {
  try {
    const { language = "python", code = "", stdin = "" } = req.body;
    const piston = LANG_MAP[language] || language;

    const r = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: piston,
        version: "*",
        files: [{ content: code }],
        stdin,
      }),
    });

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
      language: data.language,
      version: data.version,
    });
  } catch (err) {
    console.error("[/api/run] error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
