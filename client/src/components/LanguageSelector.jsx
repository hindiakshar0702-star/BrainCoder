import { t } from "../lib/i18n.js";

const LANGS = [
  { id: "en", label: "EN" },
  { id: "hi", label: "हिन्दी" },
  { id: "sa", label: "संस्कृतम्" },
];

export default function LanguageSelector({ value, onChange }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
        {t(value, "language")}
      </div>
      <div className="flex gap-2">
        {LANGS.map((l) => (
          <button
            key={l.id}
            onClick={() => onChange(l.id)}
            className={`flex-1 px-3 py-2 rounded-lg border text-sm transition deva ${
              value === l.id
                ? "bg-amber-600 border-amber-500 text-white"
                : "bg-slate-800 border-slate-700 hover:bg-slate-700"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
