import { CaptionBox, ICON, PanelView, type StageProps } from "./Stage";
import { usePacketMotion } from "./motion";
import type { NodeKind, SceneNode, Tone } from "./types";

/*
 * The 2.5D view of the same scene: the floor plan (scene x/y) is rotated and
 * squashed into a dimetric projection, nodes become solids, packets roll across
 * the floor. Text stays flat (HTML labels on top), so it is as readable as in 2D.
 */

const ANGLE = (21 * Math.PI) / 180;
const COS = Math.cos(ANGLE);
const SIN = Math.sin(ANGLE);
const SQUASH = 0.56;
/** the floor is stretched in depth: rotating squeezes columns (same x, different y) together */
const DEPTH = 1.4;

interface Pt {
  x: number;
  y: number;
}
const proj = (x: number, y0: number): Pt => {
  const y = y0 * DEPTH;
  return { x: x * COS - y * SIN, y: (x * SIN + y * COS) * SQUASH };
};
const pts = (ps: Pt[]) => ps.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
const lerp = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const up = (p: Pt, h: number): Pt => ({ x: p.x, y: p.y - h });

type BoxSolid = { w: number; d: number; h: number };
type CylSolid = { r: number; h: number };

/** footprint (floor units) and height (screen px) per kind */
const SOLID: Record<NodeKind, BoxSolid | CylSolid> = {
  server: { w: 170, d: 110, h: 118 },
  client: { w: 124, d: 80, h: 34 },
  /** a phone standing up: thin and tall */
  mobile: { w: 64, d: 26, h: 100 },
  /** a screen: wide and thin */
  browser: { w: 130, d: 26, h: 84 },
  job: { w: 110, d: 90, h: 58 },
  external: { w: 140, d: 100, h: 40 },
  /** one cylinder = one database server */
  db: { r: 58, h: 72 },
  /** in-memory store: a shorter cylinder */
  cache: { r: 50, h: 44 },
  /** a B-tree standing on a plinth */
  index: { w: 150, d: 90, h: 104 },
  /** stacked row slabs (the table's rows) */
  rows: { w: 170, d: 110, h: 74 },
};
const isCyl = (k: NodeKind) => k === "db" || k === "cache";
const cylOf = (n: SceneNode) => SOLID[n.kind] as CylSolid;
const heightOf = (n: SceneNode) => SOLID[n.kind].h;
/** floor footprint of any kind */
const boxOf = (n: SceneNode) => {
  if (isCyl(n.kind)) {
    const { r } = cylOf(n);
    return { w: r * 2, d: r * 2 };
  }
  return SOLID[n.kind] as BoxSolid;
};

function floorRect(x: number, y: number, w: number, h: number): Pt[] {
  return [proj(x, y), proj(x + w, y), proj(x + w, y + h), proj(x, y + h)];
}

/** same curve as the 2D link, sampled in floor space then projected, so packets follow the floor */
function linkPath(a: SceneNode, b: SceneNode) {
  const mx = (a.x + b.x) / 2;
  const P = [
    { x: a.x, y: a.y },
    { x: mx, y: a.y },
    { x: mx, y: b.y },
    { x: b.x, y: b.y },
  ];
  const out: Pt[] = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    const k = [(1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t ** 2, t ** 3];
    out.push(proj(k.reduce((s, kk, j) => s + kk * P[j].x, 0), k.reduce((s, kk, j) => s + kk * P[j].y, 0)));
  }
  return "M " + out.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ");
}

/** a box on the floor at (x, y), lifted by `lift` px; `rack` draws server slots on the right face */
function Box({ x, y, w, d, h, lift = 0, rack = false }: { x: number; y: number; w: number; d: number; h: number; lift?: number; rack?: boolean }) {
  const c = up(proj(x, y), lift);
  const base = floorRect(x - w / 2, y - d / 2, w, d).map((p) => up(p, lift));
  const top = base.map((p) => up(p, h));
  // the two side faces whose bottom edge is in front of the centre are the visible ones
  const faces = [0, 1, 2, 3]
    .map((i) => {
      const j = (i + 1) % 4;
      const mid = lerp(base[i], base[j], 0.5);
      return { i, j, mid };
    })
    .filter((f) => f.mid.y > c.y)
    .sort((a, b) => a.mid.y - b.mid.y);

  return (
    <>
      {faces.map(({ i, j, mid }) => {
        const quad = [base[i], base[j], top[j], top[i]];
        const side = mid.x < c.x ? "left" : "right";
        return (
          <g key={i}>
            <polygon points={pts(quad)} className={`iso-face iso-${side}`} />
            {rack &&
              side === "right" &&
              [0.28, 0.5, 0.72].map((f) => {
                const a = lerp(base[i], top[i], f);
                const b = lerp(base[j], top[j], f);
                return (
                  <g key={f}>
                    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="iso-rack" />
                    <circle cx={lerp(a, b, 0.12).x} cy={lerp(a, b, 0.12).y - 9} r={3} className="iso-led" />
                  </g>
                );
              })}
          </g>
        );
      })}
      <polygon points={pts(top)} className="iso-face iso-top" />
      <polygon points={pts(top)} className="iso-tint" />
    </>
  );
}

function Prism({ node }: { node: SceneNode }) {
  const { w, d, h } = SOLID[node.kind] as BoxSolid;
  return <Box x={node.x} y={node.y} w={w} d={d} h={h} rack={node.kind === "server"} />;
}

/** the table's rows: thin slabs stacked like sheets */
function RowStack({ node }: { node: SceneNode }) {
  const { w, d, h } = SOLID.rows as BoxSolid;
  const n = 5;
  const gap = 4;
  const slab = (h - gap * (n - 1)) / n;
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <Box key={i} x={node.x} y={node.y} w={w} d={d} h={slab} lift={i * (slab + gap)} />
      ))}
    </>
  );
}

/** a B-tree on a plinth: root → 2 inner pages → 4 leaf pages (drawn flat, facing the viewer) */
function Tree({ node }: { node: SceneNode }) {
  const { w, d, h } = SOLID.index as BoxSolid;
  const plinth = 12;
  const c = up(proj(node.x, node.y), plinth);
  const page = { w: 30, h: 13 };
  const levels = [
    { y: c.y - h + 8, xs: [0] },
    { y: c.y - h * 0.55, xs: [-38, 38] },
    { y: c.y - 22, xs: [-57, -19, 19, 57] },
  ];
  const edges: [Pt, Pt][] = [];
  levels.slice(1).forEach((lv, li) => {
    const parent = levels[li];
    lv.xs.forEach((x, k) => {
      const px = parent.xs[Math.floor(k / (lv.xs.length / parent.xs.length))];
      edges.push([{ x: c.x + px, y: parent.y + page.h }, { x: c.x + x, y: lv.y }]);
    });
  });
  return (
    <>
      <Box x={node.x} y={node.y} w={w} d={d} h={plinth} />
      {edges.map(([a, b], i) => (
        <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="iso-tree-edge" />
      ))}
      {levels.map((lv, li) =>
        lv.xs.map((x) => (
          <g key={`${li}-${x}`}>
            <rect x={c.x + x - page.w / 2 + 2.5} y={lv.y + 3} width={page.w} height={page.h} rx={3} className="iso-tree-depth" />
            <rect
              x={c.x + x - page.w / 2}
              y={lv.y}
              width={page.w}
              height={page.h}
              rx={3}
              className={`iso-tree-page${li === levels.length - 1 ? " is-leaf" : ""}`}
            />
          </g>
        )),
      )}
    </>
  );
}

function Cylinder({ node }: { node: SceneNode }) {
  const { r, h } = cylOf(node);
  const c = proj(node.x, node.y);
  const ry = r * SQUASH;
  const body = `M ${c.x - r} ${c.y - h} L ${c.x - r} ${c.y} A ${r} ${ry} 0 0 0 ${c.x + r} ${c.y} L ${c.x + r} ${c.y - h} Z`;
  const bands = node.kind === "cache" ? [1 / 2] : [1 / 3, 2 / 3];
  return (
    <>
      <path d={body} className="iso-cyl" />
      {bands.map((f) => (
        <path key={f} d={`M ${c.x - r} ${c.y - h * f} A ${r} ${ry} 0 0 0 ${c.x + r} ${c.y - h * f}`} className="iso-band" />
      ))}
      <ellipse cx={c.x} cy={c.y - h} rx={r} ry={ry} className="iso-face iso-top" />
      <ellipse cx={c.x} cy={c.y - h} rx={r} ry={ry} className="iso-tint" />
    </>
  );
}

function Solid({ node }: { node: SceneNode }) {
  if (isCyl(node.kind)) return <Cylinder node={node} />;
  if (node.kind === "index") return <Tree node={node} />;
  if (node.kind === "rows") return <RowStack node={node} />;
  return <Prism node={node} />;
}

/** where a node's flat label is pinned: above or below the solid, or beside it at mid height */
function labelAnchor(n: SceneNode, side: NonNullable<SceneNode["labelSide"]>): Pt {
  const c = proj(n.x, n.y);
  const h = heightOf(n);
  const cyl = isCyl(n.kind);
  if (side === "top") return up(c, h + (cyl ? cylOf(n).r * SQUASH : 14));
  if (side === "bottom") return up(c, -(cyl ? cylOf(n).r * SQUASH : boxOf(n).d * SQUASH * 0.6) - 12);
  let half: number;
  if (cyl) half = cylOf(n).r;
  else {
    const { w, d } = boxOf(n);
    half = Math.max(...floorRect(n.x - w / 2, n.y - d / 2, w, d).map((p) => Math.abs(p.x - c.x)));
  }
  const gap = 16;
  return { x: side === "right" ? c.x + half + gap : c.x - half - gap, y: c.y - h * 0.55 };
}

export function IsoStage({ scene, packets, marks, caption, footer, panels }: StageProps) {
  const byId = Object.fromEntries(scene.nodes.map((n) => [n.id, n]));
  const { pathRef, dotRef } = usePacketMotion(packets);
  const activeLinks = new Map<string, Tone>(packets.map((p) => [p.link, p.tone]));

  // view box: the projected floor, plus room above the tallest labels
  const floor = floorRect(0, 0, scene.width, scene.height);
  // labels need ~120 above the tallest solid, the caption another ~120
  const labelRoom = Math.min(...scene.nodes.map((n) => proj(n.x, n.y).y - heightOf(n))) - 240;
  // side labels need room beside their solid (≈ the widest tag)
  const SIDE_ROOM = 320;
  const sideX = (side: "left" | "right") => scene.nodes.filter((n) => n.labelSide === side).map((n) => labelAnchor(n, side).x);
  const minX = Math.min(...floor.map((p) => p.x - 30), ...sideX("left").map((x) => x - SIDE_ROOM));
  const maxX = Math.max(...floor.map((p) => p.x + 30), ...sideX("right").map((x) => x + SIDE_ROOM));
  const minY = Math.min(labelRoom, Math.min(...floor.map((p) => p.y)) - 20);
  const maxY = Math.max(...floor.map((p) => p.y)) + 40;
  const W = maxX - minX;
  const H = maxY - minY;
  const pct = (p: Pt) => ({ left: `${((p.x - minX) / W) * 100}%`, top: `${((p.y - minY) / H) * 100}%` });

  const SLAB = 16;
  const grid: [Pt, Pt][] = [];
  for (let x = 0; x <= scene.width; x += 75) grid.push([proj(x, 0), proj(x, scene.height)]);
  for (let y = 0; y <= scene.height; y += 75) grid.push([proj(0, y), proj(scene.width, y)]);

  // painter's algorithm: farther solids first
  const solids = [...scene.nodes].sort((a, b) => proj(a.x, a.y).y - proj(b.x, b.y).y);

  return (
    <figure className="stage iso-stage" style={{ aspectRatio: `${W.toFixed(0)} / ${H.toFixed(0)}` }}>
      <svg className="stage-svg" viewBox={`${minX} ${minY} ${W} ${H}`} aria-hidden="true">
        <defs>
          <linearGradient id="iso-floor" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" className="iso-floor-a" />
            <stop offset="1" className="iso-floor-b" />
          </linearGradient>
          <linearGradient id="iso-cyl" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" className="iso-cyl-a" />
            <stop offset="0.55" className="iso-cyl-b" />
            <stop offset="1" className="iso-cyl-c" />
          </linearGradient>
          <linearGradient id="iso-cache" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" className="iso-cache-a" />
            <stop offset="0.55" className="iso-cache-b" />
            <stop offset="1" className="iso-cache-c" />
          </linearGradient>
          <filter id="iso-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <filter id="pkt-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* floor slab */}
        <polygon points={pts(floor.map((p) => ({ x: p.x, y: p.y + 26 })))} className="iso-floor-shadow" filter="url(#iso-blur)" />
        <polygon points={pts([floor[3], floor[2], up(floor[2], -SLAB), up(floor[3], -SLAB)])} className="iso-face iso-left" />
        <polygon points={pts([floor[2], floor[1], up(floor[1], -SLAB), up(floor[2], -SLAB)])} className="iso-face iso-right" />
        <polygon points={pts(floor)} className="iso-floor" />
        {grid.map(([a, b], i) => (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="iso-grid" />
        ))}

        {scene.groups?.map((g) => {
          const r = floorRect(g.x, g.y, g.w, g.h);
          // outside the middle of the left edge: inside the group is where solids and their labels stand
          const label = lerp(r[0], r[3], 0.5);
          return (
            <g key={g.id} className="iso-group">
              <polygon points={pts(r)} />
              <text x={label.x - 14} y={label.y + 5} textAnchor="end">{g.label}</text>
            </g>
          );
        })}

        {scene.links.map((l) => {
          const tone = activeLinks.get(l.id);
          return (
            <path
              key={l.id}
              ref={pathRef(l.id)}
              d={linkPath(byId[l.from], byId[l.to])}
              className={`stage-link iso-link${tone ? ` is-active t-${tone}` : ""}`}
            />
          );
        })}

        {solids.map((n) => {
          const nodeMarks = marks[n.id] ?? [];
          const last = nodeMarks[nodeMarks.length - 1];
          const c = proj(n.x, n.y);
          const r = isCyl(n.kind) ? cylOf(n).r : Math.max(boxOf(n).w, boxOf(n).d) * 0.62;
          return (
            <g
              key={n.id}
              className={`iso-block kind-${n.kind}${last ? ` t-${last.tone} is-marked` : ""}${caption?.node === n.id ? " is-current" : ""}${panels?.[n.id]?.absent ? " is-absent" : ""}`}
            >
              <ellipse cx={c.x + 10} cy={c.y + 8} rx={r * 1.05} ry={r * SQUASH * 0.9} className="iso-shadow" filter="url(#iso-blur)" />
              {last && <ellipse key={last.seq} cx={c.x} cy={c.y} rx={r * 1.15} ry={r * 1.15 * SQUASH} className="iso-ring" />}
              <g className="iso-solid">
                <Solid node={n} />
              </g>
            </g>
          );
        })}

        {packets.map((p) => (
          <g key={p.id} ref={dotRef(p.id)} className={`stage-packet iso-packet t-${p.tone}`} style={{ opacity: 0 }}>
            <ellipse rx={12} ry={5} className="iso-pkt-shadow" />
            <circle cy={-16} r={22} className="halo" filter="url(#pkt-glow)" />
            <circle cy={-16} r={11} className="core" />
            <circle cx={-3.5} cy={-20} r={3.5} className="iso-pkt-shine" />
            {p.label && <text y={-38} textAnchor="middle">{p.label}</text>}
          </g>
        ))}
      </svg>

      {scene.nodes.map((n) => {
        const nodeMarks = marks[n.id] ?? [];
        const last = nodeMarks[nodeMarks.length - 1];
        const side = n.labelSide ?? "top";
        const anchor = labelAnchor(n, side);
        return (
          <div
            key={n.id}
            style={pct(anchor)}
            className={`iso-label side-${side} kind-${n.kind}${last ? ` t-${last.tone} is-marked` : ""}${caption?.node === n.id ? " is-current" : ""}${panels?.[n.id]?.absent ? " is-absent" : ""}`}
          >
            {nodeMarks.length > 0 && (
              <div className="iso-tags" aria-live="polite">
                {nodeMarks.map((m) => (
                  <span key={m.seq} className={`stage-tag t-${m.tone}`}>
                    {m.tag}
                    {m.ms !== undefined && <em>{m.ms} ms</em>}
                  </span>
                ))}
              </div>
            )}
            <div className="iso-head">
              <div className="iso-name">
                <span className="stage-icon">{ICON[n.kind]}</span>
                <span className="stage-node-title">{n.title}</span>
              </div>
              {panels?.[n.id] && <PanelView panel={panels[n.id]} />}
            </div>
          </div>
        );
      })}

      {caption && <CaptionBox caption={caption} title={byId[caption.node]?.title} />}
      {footer && <figcaption className="stage-footer">{footer}</figcaption>}
    </figure>
  );
}
