import type { JSX, ReactNode } from "react";
import { usePacketMotion } from "./motion";
import type { NodeKind, NodePanel, Scene, SceneNode, Tone } from "./types";
import type { ActivePacket, Caption, NodeMark } from "./usePlayer";

/*
 * The 2D stage: an SVG layer (groups, links, packets) under HTML glass cards (nodes).
 * Nodes are HTML so they get real backdrop blur; both layers share the scene's
 * coordinate space (width × height), mapped to % of the container.
 */

function linkPath(a: SceneNode, b: SceneNode) {
  const mx = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
}

export const ICON: Record<NodeKind, JSX.Element> = {
  client: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>
  ),
  mobile: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></svg>
  ),
  browser: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /><path d="M6 6.5h.01M8.5 6.5h.01" /></svg>
  ),
  server: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="7" rx="2" /><rect x="3" y="13" width="18" height="7" rx="2" /><circle cx="7" cy="7.5" r="1" /><circle cx="7" cy="16.5" r="1" /></svg>
  ),
  job: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
  ),
  db: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="5.5" rx="8" ry="3" /><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13" /><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></svg>
  ),
  cache: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2.5 5 13.5h6l-1 8 8-11h-6l1-8z" /></svg>
  ),
  external: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18.5h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.1 9.6 4.5 4.5 0 0 0 7 18.5z" /></svg>
  ),
  index: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="4" rx="1" /><rect x="3" y="17" width="6" height="4" rx="1" /><rect x="15" y="17" width="6" height="4" rx="1" /><path d="M12 7v5M6 17v-5h12v5" /></svg>
  ),
  rows: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M3 14h18M9 9v11" /></svg>
  ),
};

/** "what is happening now", big, top-left. Used by both views. */
export function CaptionBox({ caption, title }: { caption: Caption; title?: string }) {
  return (
    <div key={`${caption.node}-${caption.tag}`} className={`stage-caption t-${caption.tone}`} aria-live="polite">
      <span className="stage-caption-node">{title ?? caption.node}</span>
      <span className="stage-caption-tag">{caption.tag}</span>
      {caption.ms !== undefined && <span className="stage-caption-ms">{caption.ms} ms</span>}
    </div>
  );
}

export interface StageProps {
  scene: Scene;
  packets: ActivePacket[];
  marks: Record<string, NodeMark[]>;
  /** what is happening now: shown large, top-left; its node is highlighted */
  caption?: Caption | null;
  /** small text under the stage */
  footer?: ReactNode;
  /** small live tables pinned to nodes */
  panels?: Record<string, NodePanel>;
}

/** A node's mini table; a changed row flashes (keyed by its value). Used by both views. */
export function PanelView({ panel }: { panel: NodePanel }) {
  return (
    <dl className="node-panel">
      {panel.rows.map((r, i) => (
        <div key={`${i}-${r.label}-${r.value}`} className={r.changed ? "is-changed" : undefined}>
          <dt>{r.label}</dt>
          {r.value !== undefined && <dd>{r.value}</dd>}
        </div>
      ))}
    </dl>
  );
}

export function Stage({ scene, packets, marks, caption, footer, panels }: StageProps) {
  const byId = Object.fromEntries(scene.nodes.map((n) => [n.id, n]));
  const { pathRef, dotRef } = usePacketMotion(packets);

  const activeLinks = new Map<string, Tone>(packets.map((p) => [p.link, p.tone]));

  return (
    <figure className="stage" style={{ aspectRatio: `${scene.width} / ${scene.height}` }}>
      <svg className="stage-svg" viewBox={`0 0 ${scene.width} ${scene.height}`} aria-hidden="true">
        <defs>
          <filter id="pkt-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        {scene.groups?.map((g) => (
          <g key={g.id} className="stage-group">
            <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={30} />
            <text x={g.x + g.w / 2} y={g.y + 26} textAnchor="middle">{g.label}</text>
          </g>
        ))}
        {scene.links.map((l) => {
          const tone = activeLinks.get(l.id);
          return (
            <path
              key={l.id}
              ref={pathRef(l.id)}
              d={linkPath(byId[l.from], byId[l.to])}
              className={`stage-link${tone ? ` is-active t-${tone}` : ""}`}
            />
          );
        })}
        {packets.map((p) => (
          <g key={p.id} ref={dotRef(p.id)} className={`stage-packet t-${p.tone}`} style={{ opacity: 0 }}>
            <circle r={22} className="halo" filter="url(#pkt-glow)" />
            <circle r={11} className="core" />
            {p.label && <text y={-24} textAnchor="middle">{p.label}</text>}
          </g>
        ))}
      </svg>

      {scene.nodes.map((n) => {
        const nodeMarks = marks[n.id] ?? [];
        const last = nodeMarks[nodeMarks.length - 1];
        return (
          <div
            key={n.id}
            className={`stage-node kind-${n.kind}${last ? ` t-${last.tone} is-marked` : ""}${caption?.node === n.id ? " is-current" : ""}${panels?.[n.id]?.absent ? " is-absent" : ""}`}
            style={{ left: `${(n.x / scene.width) * 100}%`, top: `${(n.y / scene.height) * 100}%` }}
          >
            {last && <span key={last.seq} className="stage-ring" aria-hidden="true" />}
            <div className="stage-node-head">
              <span className="stage-icon">{ICON[n.kind]}</span>
              <div>
                <div className="stage-node-title">{n.title}</div>
                {n.subtitle && <div className="stage-node-sub">{n.subtitle}</div>}
              </div>
            </div>
            {panels?.[n.id] && <PanelView panel={panels[n.id]} />}
            {nodeMarks.length > 0 && (
              <div className="stage-tags" aria-live="polite">
                {nodeMarks.map((m) => (
                  <span key={m.seq} className={`stage-tag t-${m.tone}`}>
                    {m.tag}
                    {m.ms !== undefined && <em>{m.ms} ms</em>}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {caption && <CaptionBox caption={caption} title={byId[caption.node]?.title} />}
      {footer && <figcaption className="stage-footer">{footer}</figcaption>}
    </figure>
  );
}
