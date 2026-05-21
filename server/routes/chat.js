import { Router } from "express";
import { buildSystemPrompt } from "../prompts/systemPrompts.js";
import { callGeminiWithFallback } from "../lib/gemini.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const {
      messages = [],
      subject = "coding",
      level = "beginner",
      language = "en",
      codeLang = "python",
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured on the server.",
      });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages[] is required." });
    }

    const systemInstruction = buildSystemPrompt({
      subject,
      level,
      language,
      codeLang,
    });

    // Convert app messages -> Gemini history format.
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const last = messages[messages.length - 1];

    const { result, modelUsed } = await callGeminiWithFallback({
      apiKey: process.env.GEMINI_API_KEY,
      systemInstruction,
      run: async (model) => {
        const chat = model.startChat({ history });
        return chat.sendMessage(last.content);
      },
    });

    const reply = result.response.text();
    res.json({ reply, modelUsed });
  } catch (err) {
    console.error("[/api/chat] error:", err);
    res.status(503).json({
      error:
        err.message ||
        "AI service is temporarily unavailable. Please try again in a moment.",
    });
  }
});

export default router;
