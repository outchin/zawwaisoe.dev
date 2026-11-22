import { useEffect, useRef } from "react";
import type { ActivePacket } from "./usePlayer";

/*
 * Shared by the 2D and 3D stages: moves every in-flight packet along its link's
 * SVG path. The stages register path and packet elements through the returned refs.
 * Runs on requestAnimationFrame and writes to the DOM directly (no React re-render per frame).
 */

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export function usePacketMotion(packets: ActivePacket[]) {
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const dotRefs = useRef(new Map<number, SVGGElement>());

  useEffect(() => {
    if (packets.length === 0) return;
    let raf = 0;
    const tick = (now: number) => {
      for (const p of packets) {
        const path = pathRefs.current[p.link];
        const dot = dotRefs.current.get(p.id);
        if (!path || !dot) continue;
        const t = ease(Math.min(1, Math.max(0, (now - p.start) / p.dur)));
        const len = path.getTotalLength();
        const pt = path.getPointAtLength((p.reverse ? 1 - t : t) * len);
        dot.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
        dot.style.opacity = "1";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [packets]);

  const pathRef = (id: string) => (el: SVGPathElement | null) => {
    pathRefs.current[id] = el;
  };
  const dotRef = (id: number) => (el: SVGGElement | null) => {
    if (el) dotRefs.current.set(id, el);
    else dotRefs.current.delete(id);
  };
  return { pathRef, dotRef };
}
