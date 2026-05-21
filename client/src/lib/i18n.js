import en from "../i18n/en.json";
import hi from "../i18n/hi.json";
import sa from "../i18n/sa.json";

const DICTS = { en, hi, sa };

export function t(lang, path) {
  const dict = DICTS[lang] || DICTS.en;
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), dict) ?? path;
}
