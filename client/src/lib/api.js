// Thin API client for the BrainCoder backend.

export async function sendChat({
  messages,
  subject,
  level,
  language,
  codeLang,
  userApiKey,
}) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      subject,
      level,
      language,
      codeLang,
      userApiKey,
    }),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error || `Chat failed (${res.status})`);
  }
  return res.json(); // { reply }
}

export async function runCode({
  language,
  version = "*",
  code,
  stdin = "",
  args = [],
  files,
}) {
  const body = { language, version, code, stdin, args };
  if (files && files.length > 0) body.files = files;
  const res = await fetch("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error || `Run failed (${res.status})`);
  }
  return res.json();
}

export async function getRuntimes() {
  const res = await fetch("/api/runtimes");
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error || `Runtimes fetch failed (${res.status})`);
  }
  return res.json();
}

export async function generateTests({ language, code, count = 4, userApiKey }) {
  const res = await fetch("/api/generate-tests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language, code, count, userApiKey }),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error || `Generate tests failed (${res.status})`);
  }
  return res.json();
}
