import { useCallback, useEffect, useRef, useState } from "react";
import type { Hop, Tone } from "./types";

export interface ActivePacket {
  id: number;
  link: string;
  reverse: boolean;
  tone: Tone;
  label?: string;
  start: number;
  dur: number;
}
/** What is happening right now, shown big on the stage. */
export interface Caption {
  node: string;
  tone: Tone;
  tag: string;
  ms?: number;
}
export interface NodeMark {
  tone: Tone;
  tag: string;
  ms?: number;
  lane: number;
  /** increases on every mark: used as a React key to restart the pulse animation */
  seq: number;
}

/** Base durations at 1×, ms. Slow enough to read each hop. */
const TRAVEL = 1300;
const TRAVEL_QUICK = 750;
const PULSE = 1300;

const TONE_RANK: Record<Tone, number> = { neutral: 0, info: 1, ok: 2, replay: 3, error: 4 };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const REDUCED = "(prefers-reduced-motion: reduce)";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = matchMedia(REDUCED);
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/**
 * Plays lanes of hops on the stage. One lane = one request; lanes play side by side
 * (parallel requests), hops within a lane play in order. A new play() cancels the old one.
 */
export function usePlayer(speed = 1) {
  const [packets, setPackets] = useState<ActivePacket[]>([]);
  const [marks, setMarks] = useState<Record<string, NodeMark[]>>({});
  const [playing, setPlaying] = useState(false);
  const [caption, setCaption] = useState<Caption | null>(null);
  const gen = useRef(0);
  const seq = useRef(0);
  const reduced = usePrefersReducedMotion();

  const play = useCallback(
    /** onEvent: called when a pulse with an `event` plays */
    async (lanes: Hop[][], opts: { stagger?: number; onEvent?: (event: string) => void } = {}) => {
      const stagger = opts.stagger ?? 400;
      const my = ++gen.current;
      const alive = () => gen.current === my;
      setPackets([]);
      setMarks({});
      setCaption(null);
      setPlaying(true);

      const runLane = async (lane: Hop[], index: number) => {
        if (!reduced) await sleep((index * stagger) / speed);
        for (const hop of lane) {
          if (!alive()) return;
          if (hop.kind === "travel") {
            if (reduced) continue;
            const dur = (hop.quick ? TRAVEL_QUICK : TRAVEL) / speed;
            const p: ActivePacket = {
              id: ++seq.current,
              link: hop.link,
              reverse: !!hop.reverse,
              tone: hop.tone,
              label: hop.label,
              start: performance.now(),
              dur,
            };
            setPackets((ps) => [...ps, p]);
            await sleep(dur);
            setPackets((ps) => ps.filter((x) => x.id !== p.id));
          } else {
            const mark: NodeMark = { tone: hop.tone, tag: hop.tag, ms: hop.ms, lane: index, seq: ++seq.current };
            // keep one mark per lane on each node, so parallel requests all stay visible
            setMarks((m) => ({ ...m, [hop.node]: [...(m[hop.node] ?? []).filter((x) => x.lane !== index), mark] }));
            setCaption({ node: hop.node, tone: hop.tone, tag: hop.tag, ms: hop.ms });
            if (hop.event) opts.onEvent?.(hop.event);
            if (!reduced) await sleep(PULSE / speed);
          }
        }
      };

      await Promise.all(lanes.map(runLane));
      if (!alive()) return;
      // several requests: end on all their outcomes, not just whichever finished last
      if (lanes.length > 1) {
        const ends = lanes
          .map((lane) => [...lane].reverse().find((h) => h.kind === "pulse"))
          .filter((h): h is Extract<Hop, { kind: "pulse" }> => !!h);
        const worst = ends.reduce<Tone>((t, h) => (TONE_RANK[h.tone] > TONE_RANK[t] ? h.tone : t), "neutral");
        const tags = [...new Set(ends.map((h) => h.tag))];
        if (ends.length) setCaption({ node: ends[0].node, tone: worst, tag: tags.join(" · ") });
      }
      setPlaying(false);
    },
    [speed, reduced],
  );

  const clear = useCallback(() => {
    gen.current++;
    setPackets([]);
    setMarks({});
    setCaption(null);
    setPlaying(false);
  }, []);

  useEffect(() => () => void gen.current++, []);

  return { packets, marks, caption, playing, play, clear };
}
