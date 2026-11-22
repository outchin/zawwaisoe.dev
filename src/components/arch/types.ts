/*
 * Architecture stage: a scene (layout) + hops (what to animate).
 * Ported from node_allin1/apps/web/src/stage (see docs/ARCHITECTURE-DIAGRAMS.md).
 */

export type Tone = "neutral" | "info" | "ok" | "replay" | "error";

/**
 * What a node stands for. Decides the 2D icon and the 3D solid, so it has to mean
 * something: one cylinder = one database server.
 *
 * client = a person · mobile = a phone app · browser = a web app ·
 * server = an app server · job = a scheduled job / worker ·
 * db = a database server · cache = an in-memory store (Redis) ·
 * external = a third-party service (Firebase, Stripe, S3 …) ·
 * index = a B-tree inside a table · rows = a table's rows
 */
export type NodeKind =
  | "client"
  | "mobile"
  | "browser"
  | "server"
  | "job"
  | "db"
  | "cache"
  | "external"
  | "index"
  | "rows";

export interface SceneNode {
  id: string;
  /** centre on the floor plan (scene units, not px) */
  x: number;
  y: number;
  title: string;
  subtitle?: string;
  kind: NodeKind;
  /** 3D view: where the flat label sits relative to the solid (default top) */
  labelSide?: "top" | "bottom" | "left" | "right";
}
export interface SceneLink {
  id: string;
  from: string;
  to: string;
}
/** a dashed box on the floor, e.g. a cluster or a VPC */
export interface SceneGroup {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Scene {
  width: number;
  height: number;
  nodes: SceneNode[];
  links: SceneLink[];
  groups?: SceneGroup[];
}

export type Hop =
  | { kind: "travel"; link: string; reverse?: boolean; tone: Tone; label?: string; quick?: boolean }
  | { kind: "pulse"; node: string; tone: Tone; tag: string; ms?: number; event?: string };

/** A small live table pinned to a node (e.g. what a DB table holds now). */
export interface NodePanel {
  rows: { label: string; value?: string; changed?: boolean }[];
  /** the thing this node stands for doesn't exist yet: drawn ghosted */
  absent?: boolean;
}

/** One button on the diagram: a named flow, played as lanes (one lane = one request). */
export interface Flow {
  id: string;
  label: string;
  /** one line under the stage explaining what the flow shows */
  note: string;
  lanes: Hop[][];
  /** delay between lane starts, ms (default 400) */
  stagger?: number;
}

/** Everything one project's diagram needs. */
export interface Architecture {
  scene: Scene;
  flows: Flow[];
}
