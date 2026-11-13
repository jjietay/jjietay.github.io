"use client";
// The small things on the bench beside the hero arm: a cup, a ball and a
// triangle. Each page load puts them at new places. They only stand there.
// The arm moves above them and does not touch them.
import { useEffect, useRef } from "react";

// Each thing is drawn round its own centre, in arm units. `h` is its half height.
const ITEMS: { h: number; node: React.ReactNode }[] = [
  { h: 14, node: <path d="M-12 -14h24l-4 28h-16z" /> },      // cup
  { h: 12, node: <circle className="b" r="12" /> },           // ball
  { h: 9, node: <path d="M0 -18l15 27h-30z" /> },             // triangle
];

export default function Props() {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = layer.current!, arm = document.querySelector<SVGSVGElement>(".d-arm");
    if (!arm) return;
    const els = [...root.querySelectorAll<SVGSVGElement>("svg")];
    // New places on the bench, in a new order, with a gap between the things.
    const slots = ITEMS.map((_, i) => Math.max(75, Math.min(335, 85 + i * ((325 - 85) / (ITEMS.length - 1)) + (Math.random() - 0.5) * 50)));
    const xs = slots.map((v) => ({ v, o: Math.random() })).sort((p, q) => p.o - q.o).map((q) => q.v);
    const place = () => {
      const m = arm.getScreenCTM(), box = root.getBoundingClientRect();
      if (!m) return;
      els.forEach((el, i) => {
        const x = m.a * xs[i] + m.e - box.left, y = m.d * (3.5 - ITEMS[i].h) + m.f - box.top;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${m.a.toFixed(4)})`;
      });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(document.body);
    addEventListener("resize", place);
    return () => { ro.disconnect(); removeEventListener("resize", place); };
  }, []);

  return (
    <div className="props" ref={layer} aria-hidden="true">
      {ITEMS.map((it, i) => <svg key={i} width="1" height="1">{it.node}</svg>)}
    </div>
  );
}
