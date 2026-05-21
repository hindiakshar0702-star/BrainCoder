// Thin API client for the BrainCoder backend.

export async function sendChat({ messages, subject, level, language }) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, subject, level, language }),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error || `Chat failed (${res.status})`);
  }
  return res.json(); // { reply }
}

export async function runCode({ language, code, stdin = "" }) {
  const res = await fetch("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language, code, stdin }),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error || `Run failed (${res.status})`);
  }
  return res.json(); // { stdout, stderr, output, exitCode }
}
