# 🧠 BrainCoder

**AI Teacher Agent** that teaches **Coding (all languages)**, **Mathematics**, and **Physics** — from Beginner to Advanced — in **संस्कृत / हिन्दी / English**.

Includes:
- 💬 Chat with an AI tutor (Google Gemini)
- 📝 Monaco code editor with syntax highlighting
- ▶️ **Run code in the browser** for 50+ languages (via Piston API)
- 🧮 Beautiful math equation rendering (KaTeX)
- 🌐 Trilingual UI: Sanskrit, Hindi, English
- 🎯 Difficulty levels: Beginner / Intermediate / Advanced

---

## 📁 Project Structure

```
BrainCoder/
├── client/   # React + Vite + Tailwind frontend
└── server/   # Express backend (Gemini + Piston proxy)
```

---

## 🚀 Quick Start

### 1. Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY (free: https://aistudio.google.com/app/apikey)
npm run dev
```
Backend runs on `http://localhost:5000`.

### 2. Frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 🔑 Get a Free Gemini API Key
1. Visit <https://aistudio.google.com/app/apikey>
2. Click **Create API Key** → copy it
3. Paste into `server/.env` as `GEMINI_API_KEY=...`

---

## 🧪 How Code Execution Works
Code is sent to the free **[Piston API](https://github.com/engineer-man/piston)** which executes it in a sandboxed environment and returns stdout/stderr. No API key required.

Supported languages include: Python, JavaScript, TypeScript, Java, C, C++, C#, Go, Rust, Ruby, PHP, Kotlin, Swift, R, Bash, and many more.

---

## 📜 License
MIT
