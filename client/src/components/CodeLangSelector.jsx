/**
 * Selector for the programming language used to compute Math/Physics answers.
 * Only relevant when subject is "math" or "physics".
 */

const CODE_LANGS = [
  { id: "python", label: "🐍 Python" },
  { id: "javascript", label: "🟨 JavaScript" },
  { id: "java", label: "☕ Java" },
  { id: "c++", label: "🔵 C++" },
  { id: "c", label: "🅒 C" },
  { id: "go", label: "🐹 Go" },
  { id: "rust", label: "🦀 Rust" },
];

export default function CodeLangSelector({ value, onChange }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
        Code Lang
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
        title="Programming language used to solve math/physics problems"
      >
        {CODE_LANGS.map((l) => (
          <option key={l.id} value={l.id}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
