import { useState, useRef } from "react";

/**
 * VoiceButton — provides:
 * 1. 🎤 Speech-to-Text: user speaks, text goes to chat input
 * 2. 🔊 Text-to-Speech: reads AI reply aloud
 *
 * Uses Web Speech API (SpeechRecognition + SpeechSynthesis).
 */

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

// Map our lang codes to BCP-47 speech codes
const SPEECH_LANG_MAP = {
  en: "en-US",
  hi: "hi-IN",
  sa: "hi-IN", // Sanskrit fallback to Hindi voice
};

export default function VoiceButton({ lang, onTranscript }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  function startListening() {
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = SPEECH_LANG_MAP[lang] || "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript?.(transcript);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  return (
    <button
      type="button"
      onClick={listening ? stopListening : startListening}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
        listening
          ? "bg-red-600 hover:bg-red-500 text-white animate-pulse"
          : "bg-slate-700 hover:bg-slate-600 text-slate-200"
      }`}
      title={listening ? "Stop listening" : "Speak your question"}
    >
      {listening ? "⏹ Stop" : "🎤"}
    </button>
  );
}

/**
 * Speak text aloud using SpeechSynthesis.
 * Call this function with the AI reply text.
 */
export function speakText(text, lang = "en", rate = 0.9) {
  if (!window.speechSynthesis) return;

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  // Clean markdown formatting for better speech
  const cleanText = text
    .replace(/```[\s\S]*?```/g, "... code block skipped ...")
    .replace(/\$\$[\s\S]*?\$\$/g, "... equation ...")
    .replace(/\$[^$]+\$/g, "equation")
    .replace(/[#*_`~]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = SPEECH_LANG_MAP[lang] || "en-US";
  utterance.rate = rate;
  utterance.pitch = 1;

  // Try to find a matching voice
  const voices = window.speechSynthesis.getVoices();
  const targetLang = SPEECH_LANG_MAP[lang] || "en-US";
  const matchedVoice = voices.find((v) => v.lang.startsWith(targetLang.split("-")[0]));
  if (matchedVoice) utterance.voice = matchedVoice;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
