import { t } from "../lib/i18n.js";

const SUBJECTS = [
  { id: "coding", icon: "💻" },
  { id: "math", icon: "🧮" },
  { id: "physics", icon: "🔭" },
];

export default function SubjectSelector({ value, onChange, lang }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
        {t(lang, "subject")}
      </div>
      <div className="flex gap-2">
        {SUBJECTS.map((s) => (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={`flex-1 px-3 py-2 rounded-lg border text-sm transition ${
              value === s.id
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-slate-800 border-slate-700 hover:bg-slate-700"
            }`}
          >
            <span className="mr-1">{s.icon}</span>
            {t(lang, `subjects.${s.id}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
