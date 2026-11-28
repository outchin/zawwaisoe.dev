// Turns Notion-exported Markdown into Markdown that react-markdown + remark-gfm render well.
// Notion puts every block on its own line with no blank line between them, which Markdown
// reads as one paragraph (and "text\n---" as a heading). It also exports tables and columns
// as HTML, where Markdown inside the cells (`code`, **bold**) is not parsed.
// Safe to run on already-clean Markdown: the output does not change on a second run.

const FENCE = /^(\s*)(```|~~~)\s*(.*)$/;
const LIST = /^\s*([-*+]|\d+[.)])\s/;
const QUOTE = /^\s*>/;
const TABLE_ROW = /^\s*\|/;
const BOX_DRAWING = /[│─┌┐└┘├┤┬┴┼▼▲►◄→←↓↑]/;
const LOOKS_LIKE_CODE = /(=>|\bconst |\blet |\bfunction\b|\breturn\b|;\s*$|\{\s*$)/m;

/** <columns><column>…</column></columns> → the columns' content one after the other. */
function unwrapColumns(text) {
  return text.replace(/^[ \t]*<columns>[ \t]*\n([\s\S]*?)^[ \t]*<\/columns>[ \t]*$/gm, (_m, body) =>
    body
      .split("\n")
      .filter((l) => !/^\s*<\/?column\b[^>]*>\s*$/.test(l))
      .map((l) => l.replace(/^\t{1,2}/, ""))
      .join("\n")
      .replace(/^/, "\n")
      .concat("\n"),
  );
}

/** Notion <table> → GFM pipe table (first row is the header). */
function htmlTableToGfm(html) {
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((r) =>
    [...r[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((c) =>
      c[1].trim().replace(/\s*\n\s*/g, "<br>").replace(/(?<!\\)\|/g, "\\|") || " ",
    ),
  );
  if (rows.length === 0) return html;
  const width = Math.max(...rows.map((r) => r.length));
  const line = (cells) => `| ${Array.from({ length: width }, (_, i) => cells[i] ?? " ").join(" | ")} |`;
  return ["", line(rows[0]), line(Array(width).fill("---")), ...rows.slice(1).map(line), ""].join("\n");
}

/** Split into fenced-code and prose segments so prose fixes never touch code. */
function segments(lines) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const open = lines[i].match(FENCE);
    if (open) {
      let j = i + 1;
      while (j < lines.length && !(lines[j].match(FENCE)?.[2] === open[2] && !lines[j].match(FENCE)[3])) j++;
      out.push({ code: true, lines: lines.slice(i, j + 1) });
      i = j + 1;
    } else {
      const start = i;
      while (i < lines.length && !FENCE.test(lines[i])) i++;
      out.push({ code: false, lines: lines.slice(start, i) });
    }
  }
  return out;
}

function fixFence(block) {
  const [first, ...rest] = block;
  const [, indent, mark, rawLang] = first.match(FENCE);
  let lang = rawLang.trim().toLowerCase();
  if (lang === "plain text" || lang === "plain" || lang === "plaintext") lang = "text";
  const body = rest.slice(0, -1).join("\n");
  // ASCII/box diagrams tagged as a programming language → plain text
  if (lang === "javascript" && BOX_DRAWING.test(body) && !LOOKS_LIKE_CODE.test(body)) lang = "text";
  return [`${indent}${mark}${lang}`, ...rest];
}

function kind(line, prev) {
  if (!line.trim()) return "blank";
  if (QUOTE.test(line)) return "quote";
  if (TABLE_ROW.test(line)) return "table";
  if (LIST.test(line)) return "list";
  if (prev === "list" && /^(\t| {2,})\S/.test(line)) return "list"; // nested content under an item
  return "block"; // paragraph, heading, rule, image, html line: each is its own block
}

/** Put a blank line between blocks; keep list items, table rows and quote lines together. */
function separateBlocks(lines) {
  const out = [];
  let prev = "blank";
  for (const line of lines) {
    const k = kind(line, prev);
    if (k !== "blank" && prev !== "blank") {
      if (k !== prev || k === "block") out.push("");
      // consecutive quote lines are separate lines in Notion, not one wrapped paragraph
      else if (k === "quote" && line.replace(/^\s*>\s?/, "").trim() && !LIST.test(line.replace(/^\s*>\s?/, "")) && out.at(-1).replace(/^\s*>\s?/, "").trim()) out.push(">");
    }
    out.push(line);
    prev = k;
  }
  return out;
}

export function normalizeMarkdown(md) {
  const lines = unwrapColumns(md.replace(/\r\n/g, "\n")).split("\n");
  const parts = segments(lines).map((seg) => {
    if (seg.code) return { code: true, lines: fixFence(seg.lines) };
    const prose = seg.lines.join("\n").replace(/<table[^>]*>[\s\S]*?<\/table>/g, htmlTableToGfm);
    return { code: false, lines: separateBlocks(prose.split("\n")) };
  });

  const out = [];
  for (const part of parts) {
    // fenced code gets a blank line on each side
    if (part.code && out.length && out.at(-1).trim()) out.push("");
    if (!part.code && out.length && part.lines.find((l) => l.trim()) && out.at(-1).trim()) out.push("");
    out.push(...part.lines);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
