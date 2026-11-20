"use client";

import { useRef, useState, type HTMLAttributes } from "react";

/**
 * Replaces the default <pre> rendering inside blog post Markdown with a
 * version that has a hover "Copy" button, so YAML/bash snippets can be
 * copied without manual text selection.
 */
export function CodeBlock(props: HTMLAttributes<HTMLPreElement>) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = preRef.current?.textContent ?? "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fail silently.
    }
  }

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy code"
        className="absolute right-2 top-2 z-10 rounded border border-border bg-background-elevated px-2 py-1 font-sans text-xs text-muted opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:border-accent hover:text-foreground focus-visible:opacity-100"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- read-only content container */}
      <pre ref={preRef} {...props} />
    </div>
  );
}
