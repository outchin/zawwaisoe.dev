export type BlogFilter = { section?: string; topic?: string; tag?: string };

/** /blog URL for a filter. Order is section → topic → tag; empty parts are dropped. */
export function blogHref({ section, topic, tag }: BlogFilter) {
  const q = new URLSearchParams();
  if (section) q.set("section", section);
  if (topic) q.set("topic", topic);
  if (tag) q.set("tag", tag);
  const s = q.toString();
  return s ? `/blog?${s}` : "/blog";
}
