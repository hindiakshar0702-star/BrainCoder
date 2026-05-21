import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { language = "python", code = "", count = 4 } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res
        .status(500)
        .json({ error: "GEMINI_API_KEY is not configured." });
    }
    if (!code.trim()) {
      return res.status(400).json({ error: "code is required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `You are a strict autograder.
Given the following ${language} program, generate exactly ${count} test cases.
Each test case has:
- "stdin": the exact stdin input the program should receive (string, may include newlines, can be empty "")
- "expected": the EXACT expected stdout the program should produce (string, trim trailing whitespace)
- "description": short human-friendly label

Return STRICT JSON in this shape (no prose, no markdown):
{ "tests": [ { "stdin": "...", "expected": "...", "description": "..." } ] }

If the program does not read stdin, set "stdin" to "".
Cover edge cases (empty input, large numbers, special characters) where relevant.

Program:
\`\`\`${language}
${code}
\`\`\``;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return res
        .status(502)
        .json({ error: "AI returned non-JSON", raw: text });
    }

    const tests = Array.isArray(parsed?.tests) ? parsed.tests : [];
    res.json({ tests });
  } catch (err) {
    console.error("[/api/generate-tests] error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
