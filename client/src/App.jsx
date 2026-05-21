import { useState } from "react";
import SubjectSelector from "./components/SubjectSelector.jsx";
import LevelSelector from "./components/LevelSelector.jsx";
import LanguageSelector from "./components/LanguageSelector.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import CodeRunner from "./components/CodeRunner.jsx";
import { t } from "./lib/i18n.js";

export default function App() {
  const [subject, setSubject] = useState("coding");
  const [level, setLevel] = useState("beginner");
  const [lang, setLang] = useState("en");

  // Injected prompts from CodeRunner -> ChatWindow
  const [injectedPrompt, setInjectedPrompt] = useState(null);

  function handleExplain(code, language) {
    const prompt = `Please explain this ${language} code step by step:\n\n\`\`\`${language}\n${code}\n\`\`\``;
    setInjectedPrompt(prompt);
  }

  function handleFix(code, language, errorOutput) {
    const prompt = `I have this ${language} code that produces an error. Please fix it and explain what was wrong.\n\n**Code:**\n\`\`\`${language}\n${code}\n\`\`\`\n\n**Error/Output:**\n\`\`\`\n${errorOutput}\n\`\`\``;
    setInjectedPrompt(prompt);
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="px-6 py-3 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-2xl font-bold tracking-tight">
              🧠 {t(lang, "appTitle")}
            </div>
            <div className="text-xs text-slate-400 deva">
              {t(lang, "tagline")}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="min-w-[180px]">
              <SubjectSelector
                value={subject}
                onChange={setSubject}
                lang={lang}
              />
            </div>
            <div className="min-w-[200px]">
              <LevelSelector value={level} onChange={setLevel} lang={lang} />
            </div>
            <div className="min-w-[180px]">
              <LanguageSelector value={lang} onChange={setLang} />
            </div>
          </div>
        </div>
      </header>

      {/* Main split: chat (left) + code runner (right) */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 p-3 min-h-0">
        <ChatWindow
          subject={subject}
          level={level}
          lang={lang}
          injectedPrompt={injectedPrompt}
          onInjectedHandled={() => setInjectedPrompt(null)}
        />
        <CodeRunner
          lang={lang}
          onExplain={handleExplain}
          onFix={handleFix}
        />
      </main>
    </div>
  );
}
