import { useState } from "react";
import PROBLEMS from "../data/problems.js";
import { t } from "../lib/i18n.js";

export default function PracticeProblems({
  subject,
  level,
  lang,
  onLoadProblem,
}) {
  const [expanded, setExpanded] = useState(null);
  const [showHints, setShowHints] = useState({});

  const problems = PROBLEMS[subject]?.[level] || [];

  function toggleHint(id) {
    setShowHints((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function loadProblem(problem) {
    onLoadProblem?.(problem);
  }

  if (problems.length === 0) {
    return (
      <div className="text-xs text-slate-500 italic p-3">
        No practice problems available for this combination yet.
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3 max-h-[400px] overflow-y-auto">
      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2 deva">
        📚 Practice Problems ({problems.length})
      </div>
      {problems.map((p) => (
        <div
          key={p.id}
          className="border border-slate-700 rounded-lg bg-slate-800/50 overflow-hidden"
        >
          {/* Problem header */}
          <button
            onClick={() => setExpanded(expanded === p.id ? null : p.id)}
            className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-700/50 transition"
          >
            <span className="text-sm font-medium text-slate-200">
              {p.title}
            </span>
            <span className="text-xs text-slate-500">
              {expanded === p.id ? "▲" : "▼"}
            </span>
          </button>

          {/* Expanded content */}
          {expanded === p.id && (
            <div className="px-3 pb-3 space-y-2 border-t border-slate-700">
              <div className="text-xs text-slate-300 mt-2 whitespace-pre-wrap deva">
                {p.description}
              </div>

              {/* Hints */}
              {p.hints && p.hints.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleHint(p.id)}
                    className="text-xs text-amber-400 hover:text-amber-300"
                  >
                    {showHints[p.id] ? "Hide Hints ▲" : "💡 Show Hints ▼"}
                  </button>
                  {showHints[p.id] && (
                    <ul className="mt-1 space-y-1">
                      {p.hints.map((h, i) => (
                        <li
                          key={i}
                          className="text-xs text-amber-200/80 pl-3 border-l-2 border-amber-600"
                        >
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Test cases count */}
              {p.testCases && (
                <div className="text-xs text-slate-500">
                  🎯 {p.testCases.length} test case
                  {p.testCases.length > 1 ? "s" : ""} included
                </div>
              )}

              {/* Load button */}
              <button
                onClick={() => loadProblem(p)}
                className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white"
              >
                📝 Load in Editor
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
