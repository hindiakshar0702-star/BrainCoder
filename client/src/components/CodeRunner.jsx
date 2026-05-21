import { useState } from "react";
import Editor from "@monaco-editor/react";
import { runCode } from "../lib/api.js";
import { t } from "../lib/i18n.js";

const LANGUAGES = [
  { id: "python", label: "Python", starter: 'print("Hello, BrainCoder!")\n' },
  {
    id: "javascript",
    label: "JavaScript",
    starter: 'console.log("Hello, BrainCoder!");\n',
  },
  {
    id: "typescript",
    label: "TypeScript",
    starter:
      'const msg: string = "Hello, BrainCoder!";\nconsole.log(msg);\n',
  },
  {
    id: "java",
    label: "Java",
    starter:
      'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, BrainCoder!");\n  }\n}\n',
  },
  {
    id: "cpp",
    label: "C++",
    starter:
      '#include <iostream>\nint main() {\n  std::cout << "Hello, BrainCoder!" << std::endl;\n  return 0;\n}\n',
  },
  {
    id: "c",
    label: "C",
    starter:
      '#include <stdio.h>\nint main() {\n  printf("Hello, BrainCoder!\\n");\n  return 0;\n}\n',
  },
  {
    id: "go",
    label: "Go",
    starter:
      'package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello, BrainCoder!")\n}\n',
  },
  {
    id: "rust",
    label: "Rust",
    starter:
      'fn main() {\n    println!("Hello, BrainCoder!");\n}\n',
  },
  { id: "ruby", label: "Ruby", starter: 'puts "Hello, BrainCoder!"\n' },
  { id: "php", label: "PHP", starter: '<?php\necho "Hello, BrainCoder!\\n";\n' },
  {
    id: "bash",
    label: "Bash",
    starter: 'echo "Hello, BrainCoder!"\n',
  },
];

export default function CodeRunner({ lang }) {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(LANGUAGES[0].starter);
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);

  function changeLanguage(id) {
    setLanguage(id);
    const found = LANGUAGES.find((l) => l.id === id);
    if (found) setCode(found.starter);
  }

  async function run() {
    setBusy(true);
    setOutput("");
    try {
      const res = await runCode({ language, code });
      const merged =
        (res.stdout || "") +
        (res.stderr ? `\n[stderr]\n${res.stderr}` : "");
      setOutput(merged || "(no output)");
    } catch (e) {
      setOutput(`[error] ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-slate-800">
        <div className="text-sm text-slate-400 deva">
          📝 {t(lang, "codeEditor")}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs"
            title={t(lang, "selectLang")}
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          <button
            onClick={run}
            disabled={busy}
            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-medium deva"
          >
            ▶ {busy ? t(lang, "running") : t(lang, "run")}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[240px]">
        <Editor
          height="100%"
          language={language === "cpp" ? "cpp" : language}
          value={code}
          onChange={(v) => setCode(v ?? "")}
          theme="vs-dark"
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      <div className="border-t border-slate-800">
        <div className="px-4 py-1 text-xs text-slate-400 deva">
          {t(lang, "output")}
        </div>
        <pre className="px-4 pb-3 text-xs text-slate-200 whitespace-pre-wrap min-h-[60px] max-h-[200px] overflow-auto">
          {output}
        </pre>
      </div>
    </div>
  );
}
