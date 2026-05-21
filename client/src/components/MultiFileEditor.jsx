import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { runCode, getRuntimes, generateTests } from "../lib/api.js";
import { t } from "../lib/i18n.js";
import { useSettings } from "../lib/settings.jsx";

// Popular languages shown first
const POPULAR = [
  "python", "javascript", "typescript", "java", "c", "c++",
  "go", "rust", "ruby", "php", "kotlin", "swift", "bash",
  "lua", "csharp", "r", "haskell", "perl", "scala", "dart",
];

const STARTERS = {
  python: 'print("Hello, BrainCoder!")\n',
  javascript: 'console.log("Hello, BrainCoder!");\n',
  typescript: 'const msg: string = "Hello, BrainCoder!";\nconsole.log(msg);\n',
  java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, BrainCoder!");\n  }\n}\n',
  "c++": '#include <iostream>\nint main() {\n  std::cout << "Hello, BrainCoder!" << std::endl;\n  return 0;\n}\n',
  c: '#include <stdio.h>\nint main() {\n  printf("Hello, BrainCoder!\\n");\n  return 0;\n}\n',
  go: 'package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello, BrainCoder!")\n}\n',
  rust: 'fn main() {\n    println!("Hello, BrainCoder!");\n}\n',
  ruby: 'puts "Hello, BrainCoder!"\n',
  php: '<?php\necho "Hello, BrainCoder!\\n";\n',
  bash: 'echo "Hello, BrainCoder!"\n',
  kotlin: 'fun main() {\n    println("Hello, BrainCoder!")\n}\n',
  swift: 'print("Hello, BrainCoder!")\n',
  lua: 'print("Hello, BrainCoder!")\n',
  csharp: 'using System;\nclass Program {\n  static void Main() {\n    Console.WriteLine("Hello, BrainCoder!");\n  }\n}\n',
  r: 'cat("Hello, BrainCoder!\\n")\n',
  haskell: 'main = putStrLn "Hello, BrainCoder!"\n',
  perl: 'print "Hello, BrainCoder!\\n";\n',
  scala: 'object Main extends App {\n  println("Hello, BrainCoder!")\n}\n',
  dart: 'void main() {\n  print("Hello, BrainCoder!");\n}\n',
};

// File extension to language map
const EXT_TO_LANG = {
  py: "python", js: "javascript", ts: "typescript", java: "java",
  c: "c", cpp: "c++", cc: "c++", h: "c", hpp: "c++",
  go: "go", rs: "rust", rb: "ruby", php: "php",
  sh: "bash", lua: "lua", cs: "csharp", r: "r",
  hs: "haskell", pl: "perl", scala: "scala", dart: "dart",
  kt: "kotlin", swift: "swift",
};

// Map to Monaco editor language
function toMonacoLang(lang) {
  const map = {
    "c++": "cpp", csharp: "csharp", typescript: "typescript",
    javascript: "javascript", python: "python", java: "java",
    go: "go", rust: "rust", ruby: "ruby", php: "php",
    kotlin: "kotlin", swift: "swift", bash: "shell",
    lua: "lua", r: "r", haskell: "haskell", perl: "perl",
    scala: "scala", dart: "dart", c: "c",
  };
  return map[lang] || lang;
}

// Default file extension for a language
function defaultExt(lang) {
  const map = {
    python: "py", javascript: "js", typescript: "ts", java: "java",
    c: "c", "c++": "cpp", go: "go", rust: "rs", ruby: "rb",
    php: "php", bash: "sh", lua: "lua", csharp: "cs", r: "r",
    haskell: "hs", perl: "pl", scala: "scala", dart: "dart",
    kotlin: "kt", swift: "swift",
  };
  return map[lang] || "txt";
}

export default function MultiFileEditor({ lang, onExplain, onFix, loadedProblem, onProblemLoaded, pendingCode, onCodeLoaded }) {
  const { settings } = useSettings();
  const [language, setLanguage] = useState("python");
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState("*");
  const [allLangs, setAllLangs] = useState(POPULAR);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [busy, setBusy] = useState(false);
  const [problemTitle, setProblemTitle] = useState("");

  // Multi-file state
  const [files, setFiles] = useState([
    { name: `main.py`, content: STARTERS.python },
  ]);
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [renaming, setRenaming] = useState(null); // index being renamed
  const [renameValue, setRenameValue] = useState("");

  // Test cases
  const [tests, setTests] = useState([]);
  const [testBusy, setTestBusy] = useState(false);
  const [showTests, setShowTests] = useState(false);

  // Fetch runtimes
  useEffect(() => {
    getRuntimes()
      .then(({ runtimes }) => {
        setVersions(runtimes);
        const all = [...new Set(runtimes.map((r) => r.language))];
        const popular = POPULAR.filter((l) => all.includes(l));
        const rest = all.filter((l) => !POPULAR.includes(l)).sort();
        setAllLangs([...popular, ...rest]);
      })
      .catch(() => {});
  }, []);

  // Handle loaded problem
  useEffect(() => {
    if (loadedProblem) {
      const pLang = loadedProblem.language || "python";
      setLanguage(pLang);
      setFiles([{ name: `main.${defaultExt(pLang)}`, content: loadedProblem.starterCode || "" }]);
      setActiveFileIdx(0);
      setStdin("");
      setOutput("");
      setMetrics(null);
      setProblemTitle(loadedProblem.title || "");
      if (loadedProblem.testCases?.length > 0) {
        setTests(loadedProblem.testCases.map((tc) => ({
          stdin: tc.stdin, expected: tc.expected,
          description: tc.description || "Test case",
          result: null, passed: null,
        })));
        setShowTests(true);
      } else {
        setTests([]);
        setShowTests(false);
      }
      onProblemLoaded?.();
    }
  }, [loadedProblem]);

  // Handle code loaded from chat (Load to Editor button)
  useEffect(() => {
    if (pendingCode && pendingCode.code) {
      const cLang = pendingCode.language || language;
      setLanguage(cLang);
      const ext = defaultExt(cLang);
      setFiles((prev) => {
        const newName = `main.${ext}`;
        if (prev.length === 0) return [{ name: newName, content: pendingCode.code }];
        const updated = [...prev];
        updated[0] = {
          name: prev[0].name.includes(`.${ext}`) ? prev[0].name : newName,
          content: pendingCode.code,
        };
        return updated;
      });
      setActiveFileIdx(0);
      setOutput("");
      setMetrics(null);
      onCodeLoaded?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCode]);

  const langVersions = versions.filter((v) => v.language === language);
  const activeFile = files[activeFileIdx] || files[0];

  function changeLanguage(id) {
    setLanguage(id);
    setSelectedVersion("*");
    const ext = defaultExt(id);
    setFiles([{ name: `main.${ext}`, content: STARTERS[id] || `// ${id}\n` }]);
    setActiveFileIdx(0);
    setOutput("");
    setMetrics(null);
    setTests([]);
    setShowTests(false);
    setProblemTitle("");
  }

  function updateActiveFile(content) {
    setFiles((prev) =>
      prev.map((f, i) => (i === activeFileIdx ? { ...f, content } : f))
    );
  }

  // File tab operations
  function addFile() {
    const ext = defaultExt(language);
    let num = files.length + 1;
    let name = `file${num}.${ext}`;
    while (files.some((f) => f.name === name)) {
      num++;
      name = `file${num}.${ext}`;
    }
    setFiles([...files, { name, content: "" }]);
    setActiveFileIdx(files.length);
  }

  function removeFile(idx) {
    if (files.length <= 1) return; // must keep at least 1 file
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    if (activeFileIdx >= next.length) setActiveFileIdx(next.length - 1);
    else if (activeFileIdx === idx) setActiveFileIdx(0);
  }

  function startRename(idx) {
    setRenaming(idx);
    setRenameValue(files[idx].name);
  }

  function finishRename() {
    if (renaming !== null && renameValue.trim()) {
      setFiles((prev) =>
        prev.map((f, i) => (i === renaming ? { ...f, name: renameValue.trim() } : f))
      );
    }
    setRenaming(null);
  }

  // Run code (multi-file mode sends all files to Piston)
  async function run() {
    setBusy(true);
    setOutput("");
    setMetrics(null);
    try {
      const res = await runCode({
        language,
        version: selectedVersion,
        code: files[0].content, // main file content
        stdin,
        // Send additional files via the files array
        ...(files.length > 1 && {
          files: files.map((f) => ({ name: f.name, content: f.content })),
        }),
      });
      const merged =
        (res.stdout || "") + (res.stderr ? `\n[stderr]\n${res.stderr}` : "");
      setOutput(merged || "(no output)");
      setMetrics({
        networkMs: res.networkMs,
        version: res.version,
        exitCode: res.exitCode,
        lang: res.language,
      });
    } catch (e) {
      setOutput(`[error] ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  function handleExplain() {
    if (onExplain && activeFile.content.trim()) {
      onExplain(activeFile.content, language);
    }
  }

  function handleFix() {
    if (onFix && activeFile.content.trim()) {
      onFix(activeFile.content, language, output);
    }
  }

  async function handleGenerateTests() {
    if (!files[0].content.trim()) return;
    setTestBusy(true);
    setShowTests(true);
    setTests([]);
    try {
      const { tests: generated } = await generateTests({
        language,
        code: files[0].content,
        count: 4,
        userApiKey: settings.userApiKey,
      });
      setTests(generated.map((t) => ({ ...t, result: null, passed: null })));
    } catch (e) {
      setTests([{ description: `Error: ${e.message}`, stdin: "", expected: "", result: null, passed: null }]);
    } finally {
      setTestBusy(false);
    }
  }

  async function runTests() {
    setTestBusy(true);
    const results = [...tests];
    for (let i = 0; i < results.length; i++) {
      try {
        const res = await runCode({
          language,
          version: selectedVersion,
          code: files[0].content,
          stdin: results[i].stdin,
        });
        const got = (res.stdout || "").trimEnd();
        const expected = (results[i].expected || "").trimEnd();
        results[i] = { ...results[i], result: got, passed: got === expected };
      } catch (e) {
        results[i] = { ...results[i], result: `[error] ${e.message}`, passed: false };
      }
    }
    setTests(results);
    setTestBusy(false);
  }

  const passCount = tests.filter((t) => t.passed === true).length;
  const totalTests = tests.filter((t) => t.passed !== null).length;

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-slate-800 flex-wrap flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400 deva">📝 {t(lang, "codeEditor")}</span>
          {problemTitle && (
            <span className="text-xs bg-cyan-900/50 border border-cyan-700 text-cyan-300 px-2 py-0.5 rounded">
              📚 {problemTitle}
            </span>
          )}
          {files.length > 1 && (
            <span className="text-xs text-slate-500">
              ({files.length} files)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs"
          >
            {allLangs.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          {langVersions.length > 1 && (
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs"
            >
              <option value="*">latest</option>
              {langVersions.map((v) => (
                <option key={v.version} value={v.version}>v{v.version}</option>
              ))}
            </select>
          )}

          <button onClick={run} disabled={busy}
            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-medium deva">
            ▶ {busy ? t(lang, "running") : t(lang, "run")}
          </button>
          <button onClick={handleExplain} disabled={!activeFile.content.trim()}
            className="px-3 py-1 rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-xs font-medium">
            🧠 Explain
          </button>
          <button onClick={handleFix} disabled={!activeFile.content.trim()}
            className="px-3 py-1 rounded bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-xs font-medium">
            🔧 Fix
          </button>
          <button onClick={handleGenerateTests} disabled={testBusy || !files[0].content.trim()}
            className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-xs font-medium">
            🎯 Tests
          </button>
        </div>
      </div>

      {/* File tabs */}
      <div className="flex items-center gap-1 px-3 py-1 border-b border-slate-800 bg-slate-950/50 overflow-x-auto flex-shrink-0">
        {files.map((file, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer border transition group ${
              idx === activeFileIdx
                ? "bg-slate-700 border-slate-600 text-slate-100"
                : "bg-slate-800/50 border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
            onClick={() => setActiveFileIdx(idx)}
          >
            {renaming === idx ? (
              <input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={finishRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") finishRename();
                  if (e.key === "Escape") setRenaming(null);
                }}
                className="bg-slate-900 border border-slate-600 rounded px-1 text-xs w-24 focus:outline-none"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                onDoubleClick={(e) => { e.stopPropagation(); startRename(idx); }}
                title="Double-click to rename"
              >
                {file.name}
              </span>
            )}
            {files.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                title="Remove file"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addFile}
          className="px-2 py-1 text-xs text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded border border-transparent hover:border-slate-700 transition"
          title="Add new file"
        >
          + New
        </button>
      </div>

      {/* Scrollable content area: editor + stdin + output + tests */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        {/* Monaco Editor (fixed reasonable height so it can coexist with scroll) */}
        <div className="h-[320px] min-h-[280px] flex-shrink-0 border-b border-slate-800">
          <Editor
            height="100%"
            language={toMonacoLang(language)}
            value={activeFile.content}
            onChange={(v) => updateActiveFile(v ?? "")}
            theme={settings.editorTheme}
            options={{
              fontSize: settings.editorFontSize,
              tabSize: settings.tabSize,
              insertSpaces: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Stdin */}
        <div className="border-b border-slate-800 flex-shrink-0">
          <div className="px-4 py-1 text-xs text-slate-400 deva">📥 Input (stdin)</div>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Program input here (e.g. for input()/scanf)..."
            className="w-full bg-slate-950 text-xs text-slate-200 px-4 py-2 resize-none h-[60px] placeholder:text-slate-600 focus:outline-none"
          />
        </div>

        {/* Output + Metrics */}
        <div className="border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-1">
            <span className="text-xs text-slate-400 deva">{t(lang, "output")}</span>
            {metrics && (
              <span className="text-xs text-slate-500">
                ⏱ {metrics.networkMs}ms | v{metrics.version} |{" "}
                {metrics.exitCode === 0 ? (
                  <span className="text-emerald-400">exit 0 ✓</span>
                ) : (
                  <span className="text-red-400">exit {metrics.exitCode}</span>
                )}
              </span>
            )}
          </div>
          <pre className="px-4 pb-3 text-xs text-slate-200 whitespace-pre-wrap min-h-[60px] max-h-[200px] overflow-auto">
            {output}
          </pre>
        </div>

        {/* Test Cases Panel */}
        {showTests && (
          <div className="px-4 py-2 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">
                🎯 Test Cases{" "}
                {totalTests > 0 && (
                  <span className={passCount === totalTests ? "text-emerald-400" : "text-orange-400"}>
                    ({passCount}/{totalTests} passed)
                  </span>
                )}
              </span>
              <div className="flex gap-2">
                <button onClick={runTests} disabled={testBusy || tests.length === 0}
                  className="px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-xs">
                  ▶ Run All
                </button>
                <button onClick={() => setShowTests(false)}
                  className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs">
                  ✕
                </button>
              </div>
            </div>
            {testBusy && tests.length === 0 && (
              <div className="text-xs text-slate-400 italic">AI is generating test cases...</div>
            )}
            <div className="space-y-1">
              {tests.map((tc, i) => (
                <div key={i}
                  className={`text-xs px-2 py-1 rounded border ${
                    tc.passed === true ? "border-emerald-700 bg-emerald-950/40"
                    : tc.passed === false ? "border-red-700 bg-red-950/40"
                    : "border-slate-700 bg-slate-800"
                  }`}>
                  <div className="flex items-center gap-2">
                    <span>{tc.passed === true ? "✅" : tc.passed === false ? "❌" : "⬜"}</span>
                    <span className="font-medium">{tc.description}</span>
                  </div>
                  {tc.stdin && (
                    <div className="text-slate-400 ml-6">
                      stdin: <code className="text-slate-300">{tc.stdin}</code>
                    </div>
                  )}
                  <div className="text-slate-400 ml-6">
                    expected: <code className="text-slate-300">{tc.expected}</code>
                  </div>
                  {tc.result !== null && (
                    <div className="text-slate-400 ml-6">
                      got: <code className={tc.passed ? "text-emerald-300" : "text-red-300"}>{tc.result}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
