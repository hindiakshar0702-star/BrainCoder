import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildSystemPrompt } from "../prompts/systemPrompts.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const {
      messages = [],
      subject = "coding",
      level = "beginner",
      language = "en",
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured on the server.",
      });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages[] is required." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const systemInstruction = buildSystemPrompt({ subject, level, language });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction,
    });

    // Convert app messages -> Gemini history format.
    // Gemini expects roles "user" and "model".
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const last = messages[messages.length - 1];

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(last.content);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error("[/api/chat] error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
