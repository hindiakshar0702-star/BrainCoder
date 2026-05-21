import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

export default function MessageBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 deva prose-chat shadow-sm ${
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-slate-800/80 text-slate-100 border border-slate-700/80"
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex, [rehypeHighlight, { ignoreMissing: true }]]}
          components={{
            // Add a small language-tag header above fenced code blocks.
            // Inline code stays as-is.
            code({ node, inline, className, children, ...props }) {
              const match = /language-([\w+#-]+)/.exec(className || "");
              if (inline || !match) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            // Wrap each <pre> with a nice header bar.
            pre({ node, children, ...props }) {
              // children is the <code> element rendered above
              const codeEl = Array.isArray(children) ? children[0] : children;
              const className = codeEl?.props?.className || "";
              const match = /language-([\w+#-]+)/.exec(className);
              const lang = match ? match[1] : "code";

              return (
                <div className="my-2 rounded-md overflow-hidden border border-slate-700/80">
                  <div className="flex items-center justify-between bg-slate-950 px-3 py-1 border-b border-slate-700/80">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      {lang}
                    </span>
                    <span className="text-[10px] text-emerald-400">
                      ↗ loaded to editor
                    </span>
                  </div>
                  <pre {...props}>{children}</pre>
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
