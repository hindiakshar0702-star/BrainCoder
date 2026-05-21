import { t } from "../lib/i18n.js";

const LEVELS = ["beginner", "intermediate", "advanced"];

export default function LevelSelector({ value, onChange, lang }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
        {t(lang, "level")}
      </div>
      <div className="flex gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => onChange(l)}
            className={`flex-1 px-3 py-2 rounded-lg border text-sm transition ${
              value === l
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "bg-slate-800 border-slate-700 hover:bg-slate-700"
            }`}
          >
            {t(lang, `levels.${l}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
