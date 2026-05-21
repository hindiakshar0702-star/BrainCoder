/**
 * Resilient Gemini API wrapper with retry + fallback model logic.
 *
 * - Tries primary model first
 * - Retries up to MAX_RETRIES_PER_MODEL with exponential backoff on 503 / overload
 * - Falls back to backup models in order if all retries on primary fail
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Models tried in order. If first is overloaded, fall back to next.
const MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
];

const MAX_RETRIES_PER_MODEL = 2;
const INITIAL_BACKOFF_MS = 800;

function isRetryableError(err) {
  const msg = (err?.message || "").toLowerCase();
  return (
    err?.status === 503 ||
    err?.status === 429 ||
    err?.status === 500 ||
    msg.includes("503") ||
    msg.includes("overload") ||
    msg.includes("high demand") ||
    msg.includes("rate limit") ||
    msg.includes("unavailable") ||
    msg.includes("try again")
  );
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Run a Gemini call with retry + model fallback.
 *
 * @param {Object} opts
 * @param {string} opts.apiKey
 * @param {string} [opts.systemInstruction]
 * @param {Object} [opts.generationConfig]
 * @param {(model: any) => Promise<any>} opts.run
 *        Receives the SDK model instance. Should call generateContent / startChat etc.
 * @returns {Promise<{result: any, modelUsed: string}>}
 */
export async function callGeminiWithFallback({
  apiKey,
  systemInstruction,
  generationConfig,
  run,
}) {
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastErr;

  for (const modelName of MODEL_FALLBACK_CHAIN) {
    for (let attempt = 0; attempt < MAX_RETRIES_PER_MODEL; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          ...(systemInstruction ? { systemInstruction } : {}),
          ...(generationConfig ? { generationConfig } : {}),
        });
        const result = await run(model);
        if (attempt > 0 || modelName !== MODEL_FALLBACK_CHAIN[0]) {
          console.log(
            `[gemini] succeeded with model=${modelName} attempt=${attempt + 1}`
          );
        }
        return { result, modelUsed: modelName };
      } catch (err) {
        lastErr = err;
        const retryable = isRetryableError(err);
        const isLastAttemptOnThisModel = attempt === MAX_RETRIES_PER_MODEL - 1;

        console.warn(
          `[gemini] model=${modelName} attempt=${attempt + 1} failed:`,
          err?.message || err
        );

        // Hard error (auth, bad request) → don't retry, don't fall back
        if (!retryable) throw err;

        if (!isLastAttemptOnThisModel) {
          const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
          await sleep(backoff);
          continue;
        }
        // Last attempt on this model failed → try next model in chain
        break;
      }
    }
  }

  throw new Error(
    `All Gemini models are currently unavailable. Last error: ${
      lastErr?.message || "unknown"
    }`
  );
}
