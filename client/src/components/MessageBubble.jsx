import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// Map markdown language tags to our internal language names (Judge0/Piston compatible)
const LANG_NORMALIZE = {
  cpp: "c++",
  "c++": "c++",
  cxx: "c++",
  cc: "c++",
  c: "c",
  py: "python",
  python: "python",
  python3: "python",
  js: "javascript",
  javascript: "javascript",
  node: "javascript",
  ts: "typescript",
  typescript: "typescript",
  java: "java",
  go: "go",
  golang: "go",
  rs: "rust",
  rust: "rust",
  rb: "ruby",
  ruby: "ruby",
  cs: "csharp",
  csharp: "csharp",
  "c#": "csharp",
  php: "php",
  kt: "kotlin",
  kotlin: "kotlin",
  swift: "swift",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  lua: "lua",
  r: "r",
  haskell: "haskell",
  hs: "haskell",
  perl: "perl",
  pl: "perl",
  scala: "scala",
  dart: "dart",
  sql: "sql",
};

export default function MessageBubble({ role, content, onLoadCode }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 deva prose-chat ${
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-slate-800 text-slate-100 border border-slate-700"
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            // Override fenced code blocks to add a "Load to Editor" button
            code({ node, inline, className, children, ...props }) {
              const match = /language-([\w+#-]+)/.exec(className || "");
              const codeText = String(children).replace(/\n$/, "");

              // Inline code (no language) → render as-is
              if (inline || !match) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }

              // Fenced code block with language tag
              const rawLang = match[1].toLowerCase();
              const normalizedLang = LANG_NORMALIZE[rawLang] || rawLang;

              return (
                <div className="relative group my-2">
                  {/* Language label + Load button header */}
                  <div className="flex items-center justify-between bg-slate-950 border border-slate-700 border-b-0 rounded-t-md px-3 py-1">
                    <span className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                      {rawLang}
                    </span>
                    {!isUser && onLoadCode && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onLoadCode(codeText, normalizedLang);
                        }}
                        className="text-[11px] px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
                        title="Load this code into the editor"
                      >
                        📝 Load to Editor
                      </button>
                    )}
                  </div>
                  <pre className="!mt-0 !rounded-t-none border border-slate-700">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
