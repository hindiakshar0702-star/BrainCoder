import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "braincoder.settings";

export const DEFAULT_SETTINGS = {
  // 1. Theme
  theme: "dark", // 'dark' | 'light' | 'system'

  // 2. Chat font size
  chatFontSize: "md", // 'sm' | 'md' | 'lg'

  // 3. Default selections (sticky between sessions)
  defaults: {
    subject: "coding",
    level: "beginner",
    lang: "en",
    codeLang: "python",
  },

  // 4. Save chat history toggle
  saveHistory: true,

  // 5. Auto-load code from chat to editor
  autoLoadCode: true,

  // 6. Speech rate for "Read aloud"
  speechRate: 0.9, // 0.5 - 2.0

  // 7. Editor theme
  editorTheme: "vs-dark", // 'vs-dark' | 'vs-light' | 'hc-black'

  // 8. Editor font size
  editorFontSize: 13, // 12 / 13 / 14 / 16

  // 9. Tab size
  tabSize: 4, // 2 / 4 / 8

  // 10. BYOK — user's own Gemini API key (optional)
  userApiKey: "",
};

function deepMerge(base, patch) {
  const out = { ...base };
  for (const k of Object.keys(patch || {})) {
    if (
      patch[k] &&
      typeof patch[k] === "object" &&
      !Array.isArray(patch[k]) &&
      base[k] &&
      typeof base[k] === "object"
    ) {
      out[k] = deepMerge(base[k], patch[k]);
    } else {
      out[k] = patch[k];
    }
  }
  return out;
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return deepMerge(DEFAULT_SETTINGS, parsed);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Apply theme to <html data-theme="...">
  useEffect(() => {
    const root = document.documentElement;
    const t = settings.theme;
    if (t === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      root.dataset.theme = mql.matches ? "dark" : "light";
      const handler = (e) => {
        root.dataset.theme = e.matches ? "dark" : "light";
      };
      mql.addEventListener?.("change", handler);
      return () => mql.removeEventListener?.("change", handler);
    } else {
      root.dataset.theme = t;
    }
  }, [settings.theme]);

  function update(patch) {
    setSettings((s) => ({ ...s, ...patch }));
  }

  function updateDefault(patch) {
    setSettings((s) => ({ ...s, defaults: { ...s.defaults, ...patch } }));
  }

  function resetAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("braincoder.chatHistory");
    } catch {}
    setSettings(DEFAULT_SETTINGS);
  }

  return (
    <SettingsContext.Provider
      value={{ settings, update, updateDefault, resetAll }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}

// Convenience helpers
export const CHAT_FONT_PX = { sm: "12px", md: "14px", lg: "16px" };
