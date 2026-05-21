import "dotenv/config";
import express from "express";
import cors from "cors";
import chatRouter from "./routes/chat.js";
import runRouter from "./routes/run.js";

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "BrainCoder server" });
});

app.use("/api/chat", chatRouter);
app.use("/api/run", runRouter);

app.listen(PORT, () => {
  console.log(`BrainCoder server listening on http://localhost:${PORT}`);
});
