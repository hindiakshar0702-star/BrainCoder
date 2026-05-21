import { useState } from "react";
import { useSettings } from "../lib/settings.jsx";

/**
 * Settings modal with the Top 10 essentials.
 * Closes on backdrop click, Esc, or × button.
 */
export default function SettingsModal({ open, onClose }) {
  const { settings, update, updateDefault, resetAll } = useSettings();
  const [confirmReset, setConfirmReset] = useState(false);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b border-slate-700 bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-100">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 text-xl leading-none"
            title="Close (Esc)"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* 1. Theme */}
          <Section title="1. 🎨 Theme">
            <Radios
              value={settings.theme}
              onChange={(v) => update({ theme: v })}
              options={[
                { value: "dark", label: "🌙 Dark" },
                { value: "light", label: "☀️ Light" },
                { value: "system", label: "💻 System" },
              ]}
            />
          </Section>

          {/* 2. Chat font size */}
          <Section title="2. 💬 Chat Font Size">
            <Radios
              value={settings.chatFontSize}
              onChange={(v) => update({ chatFontSize: v })}
              options={[
                { value: "sm", label: "Small" },
                { value: "md", label: "Medium" },
                { value: "lg", label: "Large" },
              ]}
            />
          </Section>

          {/* 3. Defaults */}
          <Section title="3. 🎯 Default Selections">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Subject">
                <Select
                  value={settings.defaults.subject}
                  onChange={(v) => updateDefault({ subject: v })}
                  options={[
                    { value: "coding", label: "💻 Coding" },
                    { value: "math", label: "🧮 Mathematics" },
                    { value: "physics", label: "🔭 Physics" },
                  ]}
                />
              </Field>
              <Field label="Level">
                <Select
                  value={settings.defaults.level}
                  onChange={(v) => updateDefault({ level: v })}
                  options={[
                    { value: "beginner", label: "🌱 Beginner" },
                    { value: "intermediate", label: "🌿 Intermediate" },
                    { value: "advanced", label: "🌳 Advanced" },
                  ]}
                />
              </Field>
              <Field label="UI Language">
                <Select
                  value={settings.defaults.lang}
                  onChange={(v) => updateDefault({ lang: v })}
                  options={[
                    { value: "en", label: "English" },
                    { value: "hi", label: "हिन्दी" },
                    { value: "sa", label: "संस्कृतम्" },
                  ]}
                />
              </Field>
              <Field label="Code Lang (Math/Physics)">
                <Select
                  value={settings.defaults.codeLang}
                  onChange={(v) => updateDefault({ codeLang: v })}
                  options={[
                    { value: "python", label: "🐍 Python" },
                    { value: "javascript", label: "🟨 JavaScript" },
                    { value: "java", label: "☕ Java" },
                    { value: "c++", label: "🔵 C++" },
                    { value: "c", label: "🅒 C" },
                    { value: "go", label: "🐹 Go" },
                    { value: "rust", label: "🦀 Rust" },
                  ]}
                />
              </Field>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              These will be applied next time you open the app.
            </p>
          </Section>

          {/* 4. Save chat history */}
          <Section title="4. 💾 Save Chat History">
            <Toggle
              checked={settings.saveHistory}
              onChange={(v) => update({ saveHistory: v })}
              label="Remember chat between sessions (stored in your browser)"
            />
          </Section>

          {/* 5. Auto-load code */}
          <Section title="5. 📝 Auto-Load Code to Editor">
            <Toggle
              checked={settings.autoLoadCode}
              onChange={(v) => update({ autoLoadCode: v })}
              label="When AI replies with code, send the first block to the editor"
            />
          </Section>

          {/* 6. Speech rate */}
          <Section title="6. 🔊 Speech Rate (Read Aloud)">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">0.5x</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.speechRate}
                onChange={(e) =>
                  update({ speechRate: parseFloat(e.target.value) })
                }
                className="flex-1 accent-indigo-500"
              />
              <span className="text-xs text-slate-400">2x</span>
              <span className="text-sm font-medium text-slate-200 w-12 text-right">
                {settings.speechRate.toFixed(1)}x
              </span>
            </div>
          </Section>

          {/* 7. Editor theme */}
          <Section title="7. 🎨 Code Editor Theme">
            <Radios
              value={settings.editorTheme}
              onChange={(v) => update({ editorTheme: v })}
              options={[
                { value: "vs-dark", label: "🌙 VS Dark" },
                { value: "vs-light", label: "☀️ VS Light" },
                { value: "hc-black", label: "🔲 High Contrast" },
              ]}
            />
          </Section>

          {/* 8. Editor font size */}
          <Section title="8. 🔤 Editor Font Size">
            <Radios
              value={String(settings.editorFontSize)}
              onChange={(v) => update({ editorFontSize: parseInt(v, 10) })}
              options={[
                { value: "12", label: "12px" },
                { value: "13", label: "13px" },
                { value: "14", label: "14px" },
                { value: "16", label: "16px" },
              ]}
            />
          </Section>

          {/* 9. Tab size */}
          <Section title="9. ⇆ Tab Size">
            <Radios
              value={String(settings.tabSize)}
              onChange={(v) => update({ tabSize: parseInt(v, 10) })}
              options={[
                { value: "2", label: "2 spaces" },
                { value: "4", label: "4 spaces" },
                { value: "8", label: "8 spaces" },
              ]}
            />
          </Section>

          {/* 10. BYOK API key */}
          <Section title="10. 🔑 Your Gemini API Key (BYOK)">
            <input
              type="password"
              value={settings.userApiKey}
              onChange={(e) => update({ userApiKey: e.target.value })}
              placeholder="Optional — paste your own Gemini key (overrides server key)"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-500 mt-2">
              Get a free key at{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline"
              >
                aistudio.google.com/app/apikey
              </a>
              . Stored only in your browser.
            </p>
          </Section>

          {/* Danger zone — Clear all data */}
          <Section title="🗑️ Danger Zone">
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="px-4 py-2 rounded-lg bg-red-900/40 border border-red-700 text-red-300 hover:bg-red-900/60 text-sm font-medium"
              >
                Clear all settings & chat history
              </button>
            ) : (
              <div className="flex gap-2 items-center">
                <span className="text-sm text-red-300">Are you sure?</span>
                <button
                  onClick={() => {
                    resetAll();
                    setConfirmReset(false);
                    onClose();
                    location.reload();
                  }}
                  className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-sm font-medium"
                >
                  Yes, clear everything
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ---------- small helper components ---------- */

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-200 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400 mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function Radios({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-lg border text-sm transition ${
            value === o.value
              ? "bg-indigo-600 border-indigo-500 text-white"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <span
        className={`relative inline-block w-11 h-6 rounded-full transition ${
          checked ? "bg-emerald-600" : "bg-slate-700"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </span>
      <span className="text-sm text-slate-300">{label}</span>
    </label>
  );
}
