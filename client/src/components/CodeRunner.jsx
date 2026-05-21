import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { runCode, getRuntimes, generateTests } from "../lib/api.js";
import { t } from "../lib/i18n.js";

// Popular languages shown first; rest dynamically from Piston.
const POPULAR = [
  "python",
  "javascript",
  "typescript",
  "java",
  "c",
  "c++",
  "go",
  "rust",
  "ruby",
  "php",
  "kotlin",
  "swift",
  "bash",
  "lua",
  "csharp",
  "r",
  "haskell",
  "perl",
  "scala",
  "dart",
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

// Map Piston language names to Monaco editor language ids.
function toMonacoLang(lang) {
  const map = {
    "c++": "cpp",
    csharp: "csharp",
    typescript: "typescript",
    javascript: "javascript",
    python: "python",
    java: "java",
    go: "go",
    rust: "rust",
    ruby: "ruby",
    php: "php",
    kotlin: "kotlin",
    swift: "swift",
    bash: "shell",
    lua: "lua",
    r: "r",
    haskell: "haskell",
    perl: "perl",
    scala: "scala",
    dart: "dart",
    c: "c",
  };
  return map[lang] || lang;
}

export default function CodeRunner({ lang, onExplain, onFix, loadedProblem, onProblemLoaded }) {
  const [language, setLanguage] = useState("python");
  const [versions, setVersions] = useState([]); // [{language, version, aliases}]
  const [selectedVersion, setSelectedVersion] = useState("*");
  const [allLangs, setAllLangs] = useState(POPULAR);
  const [code, setCode] = useState(STARTERS.python);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [metrics, setMetrics] = useState(null); // { networkMs, version, exitCode }
  const [busy, setBusy] = useState(false);
  const [problemTitle, setProblemTitle] = useState("");

  // Test cases feature
  const [tests, setTests] = useState([]); // [{stdin, expected, description, result?, passed?}]
  const [testBusy, setTestBusy] = useState(false);
  const [showTests, setShowTests] = useState(false);

  // Fetch all runtimes once
  useEffect(() => {
    getRuntimes()
      .then(({ runtimes }) => {
        setVersions(runtimes);
        // Build unique language list, popular first, then rest alphabetically.
        const all = [...new Set(runtimes.map((r) => r.language))];
        const popular = POPULAR.filter((l) => all.includes(l));
        const rest = all.filter((l) => !POPULAR.includes(l)).sort();
        setAllLangs([...popular, ...rest]);
      })
      .catch(() => {});
  }, []);

  // Handle loaded problem from PracticeProblems
  useEffect(() => {
    if (loadedProblem) {
      setLanguage(loadedProblem.language || "python");
      setCode(loadedProblem.starterCode || "");
      setStdin("");
      setOutput("");
      setMetrics(null);
      setProblemTitle(loadedProblem.title || "");
      // Load built-in test cases if available
      if (loadedProblem.testCases && loadedProblem.testCases.length > 0) {
        setTests(
          loadedProblem.testCases.map((tc) => ({
            stdin: tc.stdin,
            expected: tc.expected,
            description: tc.description || `Test case`,
            result: null,
            passed: null,
          }))
        );
        setShowTests(true);
      } else {
        setTests([]);
        setShowTests(false);
      }
      onProblemLoaded?.();
    }
  }, [loadedProblem]);

  // Get version options for current language
  const langVersions = versions.filter((v) => v.language === language);

  function changeLanguage(id) {
    setLanguage(id);
    setSelectedVersion("*");
    if (STARTERS[id]) setCode(STARTERS[id]);
    else setCode(`// ${id}\n`);
    setOutput("");
    setMetrics(null);
    setTests([]);
    setShowTests(false);
  }

  async function run() {
    setBusy(true);
    setOutput("");
    setMetrics(null);
    try {
      const res = await runCode({
        language,
        version: selectedVersion,
        code,
        stdin,
      });
      const merged =
        (res.stdout || "") +
        (res.stderr ? `\n[stderr]\n${res.stderr}` : "");
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

  // Feature 4: Explain this code (sends to chat)
  function handleExplain() {
    if (onExplain && code.trim()) {
      onExplain(code, language);
    }
  }

  // Feature 5: Fix my code (sends error + code to chat)
  function handleFix() {
    if (onFix && code.trim()) {
      onFix(code, language, output);
    }
  }

  // Feature: Auto-grader test cases
  async function handleGenerateTests() {
    if (!code.trim()) return;
    setTestBusy(true);
    setShowTests(true);
    setTests([]);
    try {
      const { tests: generated } = await generateTests({
        language,
        code,
        count: 4,
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
          code,
          stdin: results[i].stdin,
        });
        const got = (res.stdout || "").trimEnd();
        const expected = (results[i].expected || "").trimEnd();
        results[i] = {
          ...results[i],
          result: got,
          passed: got === expected,
        };
      } catch (e) {
        results[i] = {
          ...results[i],
          result: `[error] ${e.message}`,
          passed: false,
        };
      }
    }
    setTests(results);
    setTestBusy(false);
  }

  const passCount = tests.filter((t) => t.passed === true).length;
  const totalTests = tests.filter((t) => t.passed !== null).length;

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      {/* Header toolbar */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-slate-800 flex-wrap flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400 deva">
            📝 {t(lang, "codeEditor")}
          </span>
          {problemTitle && (
            <span className="text-xs bg-cyan-900/50 border border-cyan-700 text-cyan-300 px-2 py-0.5 rounded">
              📚 {problemTitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Language selector (all 80+) */}
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs"
            title={t(lang, "selectLang")}
          >
            {allLangs.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {/* Version selector */}
          {langVersions.length > 1 && (
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs"
              title="Version"
            >
              <option value="*">latest</option>
              {langVersions.map((v) => (
                <option key={v.version} value={v.version}>
                  v{v.version}
                </option>
              ))}
            </select>
          )}

          {/* Run button */}
          <button
            onClick={run}
            disabled={busy}
            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-medium deva"
          >
            ▶ {busy ? t(lang, "running") : t(lang, "run")}
          </button>

          {/* Explain button */}
          <button
            onClick={handleExplain}
            disabled={!code.trim()}
            className="px-3 py-1 rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-xs font-medium"
            title="Send code to AI for explanation"
          >
            🧠 Explain
          </button>

          {/* Fix button */}
          <button
            onClick={handleFix}
            disabled={!code.trim()}
            className="px-3 py-1 rounded bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-xs font-medium"
            title="Send code + error to AI for fix"
          >
            🔧 Fix
          </button>

          {/* Test cases */}
          <button
            onClick={handleGenerateTests}
            disabled={testBusy || !code.trim()}
            className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-xs font-medium"
            title="Generate test cases with AI"
          >
            🎯 Tests
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-[200px]">
        <Editor
          height="100%"
          language={toMonacoLang(language)}
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

      {/* Stdin input area */}
      <div className="border-t border-slate-800">
        <div className="px-4 py-1 text-xs text-slate-400 deva">📥 Input (stdin)</div>
        <textarea
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          placeholder="Program input here (e.g. for input()/scanf)..."
          className="w-full bg-slate-950 text-xs text-slate-200 px-4 py-2 resize-none h-[50px] placeholder:text-slate-600 focus:outline-none"
        />
      </div>

      {/* Output + Metrics */}
      <div className="border-t border-slate-800">
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
        <pre className="px-4 pb-3 text-xs text-slate-200 whitespace-pre-wrap min-h-[50px] max-h-[150px] overflow-auto">
          {output}
        </pre>
      </div>

      {/* Test Cases Panel */}
      {showTests && (
        <div className="border-t border-slate-800 px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">
              🎯 Test Cases{" "}
              {totalTests > 0 && (
                <span
                  className={
                    passCount === totalTests
                      ? "text-emerald-400"
                      : "text-orange-400"
                  }
                >
                  ({passCount}/{totalTests} passed)
                </span>
              )}
            </span>
            <div className="flex gap-2">
              <button
                onClick={runTests}
                disabled={testBusy || tests.length === 0}
                className="px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-xs"
              >
                ▶ Run All
              </button>
              <button
                onClick={() => setShowTests(false)}
                className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
          {testBusy && tests.length === 0 && (
            <div className="text-xs text-slate-400 italic">
              AI is generating test cases...
            </div>
          )}
          <div className="space-y-1 max-h-[150px] overflow-auto">
            {tests.map((tc, i) => (
              <div
                key={i}
                className={`text-xs px-2 py-1 rounded border ${
                  tc.passed === true
                    ? "border-emerald-700 bg-emerald-950/40"
                    : tc.passed === false
                    ? "border-red-700 bg-red-950/40"
                    : "border-slate-700 bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>
                    {tc.passed === true
                      ? "✅"
                      : tc.passed === false
                      ? "❌"
                      : "⬜"}
                  </span>
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
                    got:{" "}
                    <code
                      className={
                        tc.passed ? "text-emerald-300" : "text-red-300"
                      }
                    >
                      {tc.result}
                    </code>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
