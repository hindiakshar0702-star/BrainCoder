import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble.jsx";
import VoiceButton, { speakText, stopSpeaking } from "./VoiceButton.jsx";
import { sendChat } from "../lib/api.js";
import { t } from "../lib/i18n.js";

// Map markdown language tags to internal language names
const LANG_NORMALIZE = {
  cpp: "c++", "c++": "c++", cxx: "c++", cc: "c++", c: "c",
  py: "python", python: "python", python3: "python",
  js: "javascript", javascript: "javascript", node: "javascript",
  ts: "typescript", typescript: "typescript",
  java: "java", go: "go", golang: "go",
  rs: "rust", rust: "rust",
  rb: "ruby", ruby: "ruby",
  cs: "csharp", csharp: "csharp", "c#": "csharp",
  php: "php", kt: "kotlin", kotlin: "kotlin", swift: "swift",
  bash: "bash", sh: "bash", shell: "bash", zsh: "bash",
  lua: "lua", r: "r", haskell: "haskell", hs: "haskell",
  perl: "perl", pl: "perl", scala: "scala", dart: "dart",
};

/**
 * Pull the first fenced code block (with a language tag) from a markdown string.
 * Returns { code, language } or null if none.
 */
function extractFirstCodeBlock(markdown) {
  if (!markdown) return null;
  const re = /```([\w+#-]+)?\s*\n([\s\S]*?)\n```/;
  const match = markdown.match(re);
  if (!match) return null;
  const rawLang = (match[1] || "").toLowerCase();
  const code = match[2];
  const language = LANG_NORMALIZE[rawLang] || rawLang || "python";
  return { code, language };
}

export default function ChatWindow({
  subject,
  level,
  lang,
  codeLang,
  injectedPrompt,
  onInjectedHandled,
  onLoadCode,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  // Handle injected prompts from CodeRunner (Explain / Fix)
  useEffect(() => {
    if (injectedPrompt) {
      send(injectedPrompt);
      onInjectedHandled?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [injectedPrompt]);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setError("");
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const { reply } = await sendChat({
        messages: next,
        subject,
        level,
        language: lang,
        codeLang,
      });
      setMessages([...next, { role: "assistant", content: reply }]);

      // 🚀 Auto-load: extract first code block from reply and send it to the editor
      const block = extractFirstCodeBlock(reply);
      if (block && onLoadCode) {
        onLoadCode(block.code, block.language);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function clearChat() {
    setMessages([]);
    setError("");
    stopSpeaking();
    setSpeaking(false);
  }

  function handleSpeak(text) {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      speakText(text, lang);
      setSpeaking(true);
      const checkDone = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setSpeaking(false);
          clearInterval(checkDone);
        }
      }, 500);
    }
  }

  function handleVoiceTranscript(transcript) {
    setInput(transcript);
  }

  const examplePrompt = t(lang, `examples.${subject}`);

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 flex-shrink-0">
        <div className="text-sm text-slate-400 deva">💬 Chat</div>
        <button
          onClick={clearChat}
          className="text-xs text-slate-400 hover:text-slate-200 deva"
        >
          {t(lang, "clearChat")}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-slate-300 space-y-3 deva">
            <h2 className="text-lg font-semibold">
              {t(lang, "welcomeTitle")}
            </h2>
            <p className="text-slate-400">{t(lang, "welcomeBody")}</p>
            <div className="text-sm text-slate-400">
              {t(lang, "exampleHeading")}
            </div>
            <button
              onClick={() => send(examplePrompt)}
              className="block w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg deva"
            >
              {examplePrompt}
            </button>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i}>
            <MessageBubble role={m.role} content={m.content} />
            {/* Read aloud button on AI messages */}
            {m.role === "assistant" && (
              <div className="flex justify-start mt-1 ml-1">
                <button
                  onClick={() => handleSpeak(m.content)}
                  className="text-xs text-slate-500 hover:text-slate-300 px-2 py-0.5 rounded hover:bg-slate-800 transition"
                  title="Read aloud"
                >
                  🔊 Read aloud
                </button>
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className="text-slate-400 text-sm italic deva">
            {t(lang, "thinking")}
          </div>
        )}
        {error && (
          <div className="text-red-400 text-sm border border-red-900 bg-red-950/40 rounded p-2">
            {error}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2 p-3 border-t border-slate-800 flex-shrink-0"
      >
        <VoiceButton lang={lang} onTranscript={handleVoiceTranscript} />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t(lang, "askPlaceholder")}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 deva"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm font-medium deva"
        >
          {t(lang, "send")}
        </button>
      </form>
    </div>
  );
}
