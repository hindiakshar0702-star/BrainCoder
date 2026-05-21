import { useEffect, useState } from "react";
import SubjectSelector from "./components/SubjectSelector.jsx";
import LevelSelector from "./components/LevelSelector.jsx";
import LanguageSelector from "./components/LanguageSelector.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import MultiFileEditor from "./components/MultiFileEditor.jsx";
import PracticeProblems from "./components/PracticeProblems.jsx";
import CodeLangSelector from "./components/CodeLangSelector.jsx";
import SettingsModal from "./components/SettingsModal.jsx";
import { useSettings } from "./lib/settings.jsx";
import { t } from "./lib/i18n.js";

export default function App() {
  const { settings } = useSettings();

  // Initialize from saved defaults the first time
  const [subject, setSubject] = useState(settings.defaults.subject);
  const [level, setLevel] = useState(settings.defaults.level);
  const [lang, setLang] = useState(settings.defaults.lang);
  const [codeLang, setCodeLang] = useState(settings.defaults.codeLang);
  const [showProblems, setShowProblems] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // If saved defaults change (e.g. user toggles in settings), update once
  useEffect(() => {
    setSubject(settings.defaults.subject);
    setLevel(settings.defaults.level);
    setLang(settings.defaults.lang);
    setCodeLang(settings.defaults.codeLang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    settings.defaults.subject,
    settings.defaults.level,
    settings.defaults.lang,
    settings.defaults.codeLang,
  ]);

  // Esc opens/closes settings
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && showSettings) setShowSettings(false);
      if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault();
        setShowSettings(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showSettings]);

  // Injected prompts from CodeRunner -> ChatWindow
  const [injectedPrompt, setInjectedPrompt] = useState(null);
  // Code loaded from chat -> editor
  const [pendingCode, setPendingCode] = useState(null);
  // Problem loaded into editor
  const [loadedProblem, setLoadedProblem] = useState(null);

  function handleExplain(code, language) {
    const prompt = `Please explain this ${language} code step by step:\n\n\`\`\`${language}\n${code}\n\`\`\``;
    setInjectedPrompt(prompt);
  }

  function handleFix(code, language, errorOutput) {
    const prompt = `I have this ${language} code that produces an error. Please fix it and explain what was wrong.\n\n**Code:**\n\`\`\`${language}\n${code}\n\`\`\`\n\n**Error/Output:**\n\`\`\`\n${errorOutput}\n\`\`\``;
    setInjectedPrompt(prompt);
  }

  function handleLoadProblem(problem) {
    setLoadedProblem(problem);
    setShowProblems(false);
  }

  function handleLoadCode(code, language) {
    setPendingCode({ code, language });
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-6 py-3 border-b border-slate-800 bg-slate-950 flex-shrink-0">
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
            {(subject === "math" || subject === "physics") && (
              <div className="min-w-[160px]">
                <CodeLangSelector value={codeLang} onChange={setCodeLang} />
              </div>
            )}
            <button
              onClick={() => setShowProblems(!showProblems)}
              className={`px-3 py-2 rounded-lg border text-sm transition ${
                showProblems
                  ? "bg-cyan-600 border-cyan-500 text-white"
                  : "bg-slate-800 border-slate-700 hover:bg-slate-700"
              }`}
            >
              📚 Practice
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="px-3 py-2 rounded-lg border bg-slate-800 border-slate-700 hover:bg-slate-700 text-sm"
              title="Settings (Ctrl+,)"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* Practice Problems Panel (collapsible) */}
      {showProblems && (
        <div className="border-b border-slate-800 bg-slate-950/80 flex-shrink-0 max-h-[40vh] overflow-y-auto">
          <PracticeProblems
            subject={subject}
            level={level}
            lang={lang}
            onLoadProblem={handleLoadProblem}
          />
        </div>
      )}

      {/* Main split: chat (left) + code runner (right) */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 p-3 min-h-0 overflow-hidden">
        <div className="min-h-0 h-full overflow-hidden">
          <ChatWindow
            subject={subject}
            level={level}
            lang={lang}
            codeLang={codeLang}
            injectedPrompt={injectedPrompt}
            onInjectedHandled={() => setInjectedPrompt(null)}
            onLoadCode={handleLoadCode}
          />
        </div>
        <div className="min-h-0 h-full overflow-hidden">
          <MultiFileEditor
            lang={lang}
            onExplain={handleExplain}
            onFix={handleFix}
            loadedProblem={loadedProblem}
            onProblemLoaded={() => setLoadedProblem(null)}
            pendingCode={pendingCode}
            onCodeLoaded={() => setPendingCode(null)}
          />
        </div>
      </main>

      {/* Settings modal */}
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
