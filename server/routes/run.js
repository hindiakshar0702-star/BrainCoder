import { Router } from "express";

const router = Router();

// Judge0 CE free public instance
const JUDGE0_URL = "https://ce.judge0.com";

// Map our language names -> Judge0 language IDs
// Full list: https://ce.judge0.com/languages
const LANG_ID_MAP = {
  python: 71,       // Python 3
  javascript: 63,   // JavaScript (Node.js)
  typescript: 74,   // TypeScript
  java: 62,         // Java
  c: 50,            // C (GCC)
  "c++": 54,        // C++ (GCC)
  cpp: 54,          // C++ (GCC)
  csharp: 51,       // C#
  go: 60,           // Go
  rust: 73,         // Rust
  ruby: 72,         // Ruby
  php: 68,          // PHP
  kotlin: 78,       // Kotlin
  swift: 83,        // Swift
  r: 80,            // R
  bash: 46,         // Bash
  lua: 64,          // Lua
  perl: 85,         // Perl
  scala: 81,        // Scala
  haskell: 61,      // Haskell
  dart: 90,         // Dart
  sql: 82,          // SQL (SQLite)
};

// Encode source code and stdin to base64
function toBase64(str) {
  return Buffer.from(str || "").toString("base64");
}

function fromBase64(str) {
  if (!str) return "";
  return Buffer.from(str, "base64").toString("utf-8");
}

router.post("/", async (req, res) => {
  try {
    const {
      language = "python",
      code = "",
      stdin = "",
    } = req.body;

    const languageId = LANG_ID_MAP[language] || LANG_ID_MAP.python;

    const start = Date.now();

    // Submit code to Judge0 with wait=true (synchronous, waits for result)
    const submitRes = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language_id: languageId,
        source_code: toBase64(code),
        stdin: toBase64(stdin),
      }),
    });

    const networkMs = Date.now() - start;

    if (!submitRes.ok) {
      const text = await submitRes.text();
      return res.status(502).json({ error: `Judge0 error (${submitRes.status}): ${text}` });
    }

    const data = await submitRes.json();

    // Decode base64 outputs
    const stdout = fromBase64(data.stdout);
    const stderr = fromBase64(data.stderr);
    const compileOutput = fromBase64(data.compile_output);

    // Status: https://ce.judge0.com/statuses
    // 3 = Accepted, 5 = TLE, 6 = Compilation Error, 11 = Runtime Error, etc.
    const status = data.status || {};
    const exitCode = status.id === 3 ? 0 : (status.id || 1);

    res.json({
      stdout,
      stderr,
      output: stdout + (stderr ? `\n${stderr}` : "") + (compileOutput ? `\n${compileOutput}` : ""),
      exitCode,
      signal: null,
      compile: compileOutput ? { stdout: "", stderr: compileOutput, code: status.id === 6 ? 1 : 0 } : null,
      language: language,
      version: data.language?.name || language,
      networkMs,
      statusDescription: status.description || "",
      time: data.time,
      memory: data.memory,
    });
  } catch (err) {
    console.error("[/api/run] error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
