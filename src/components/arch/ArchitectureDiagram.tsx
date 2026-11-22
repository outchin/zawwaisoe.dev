"use client";

import { useState, useSyncExternalStore } from "react";
import { IsoStage } from "./IsoStage";
import { Stage } from "./Stage";
import type { Architecture } from "./types";
import { usePlayer } from "./usePlayer";
import "./arch.css";

type View = "2d" | "3d";
const VIEW_KEY = "arch:view";

// The chosen view lives in localStorage and is shared by every diagram on the page.
const viewListeners = new Set<() => void>();
function subscribeView(cb: () => void) {
  viewListeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    viewListeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
const readView = (): View => (localStorage.getItem(VIEW_KEY) === "2d" ? "2d" : "3d");
const serverView = (): View => "3d";
function saveView(v: View) {
  localStorage.setItem(VIEW_KEY, v);
  viewListeners.forEach((l) => l());
}

/**
 * An interactive architecture diagram: one scene, shown flat (2D) or as a
 * 2.5D floor (3D), with named flows that play requests across it.
 */
export function ArchitectureDiagram({ architecture }: { architecture: Architecture }) {
  const { scene, flows } = architecture;
  const view = useSyncExternalStore(subscribeView, readView, serverView);
  const [active, setActive] = useState<string | null>(null);
  const player = usePlayer();

  const run = (id: string) => {
    const flow = flows.find((f) => f.id === id);
    if (!flow) return;
    setActive(id);
    void player.play(flow.lanes, { stagger: flow.stagger });
  };

  const StageView = view === "3d" ? IsoStage : Stage;
  const note = flows.find((f) => f.id === active)?.note;

  return (
    <div className="arch">
      <div className="arch-bar">
        <div className="arch-flows" role="group" aria-label="Play a request flow">
          {flows.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`arch-btn${active === f.id ? " is-on" : ""}`}
              onClick={() => run(f.id)}
            >
              ▶ {f.label}
            </button>
          ))}
        </div>
        <div className="arch-segmented" role="group" aria-label="View">
          {(["2d", "3d"] as const).map((v) => (
            <button key={v} type="button" className={view === v ? "is-on" : undefined} onClick={() => saveView(v)}>
              {v.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <StageView scene={scene} packets={player.packets} marks={player.marks} caption={player.caption} />

      <p className="arch-note">
        {note ?? <span className="arch-hint">Pick a flow above to watch a request move through the system.</span>}
      </p>
    </div>
  );
}
