"use client";
// The small things on the bench beside the hero arm. A hit from the gripper
// knocks a thing off the bench. It then falls down the page and comes to rest
// on the straight line below the "projects" heading.
import { useEffect, useRef } from "react";
import { armHand } from "@/components/Art";

// Each thing: where it stands on the bench (arm units), its half size, and its drawing.
// The drawing has its origin at the bottom centre of the thing.
const ITEMS: { x: number; r: number; up?: number; node: React.ReactNode }[] = [
  { x: 120, r: 26, node: <path className="n" d="M-30 -26l6 26h48l6 -26" /> },                 // tray
  { x: 120, r: 10, up: 3, node: <circle className="b" cy="-10" r="10" /> },                    // ball in the tray
  { x: 205, r: 14, node: <path d="M-12 -28h24l-4 28h-16z" /> },                                // cup
  { x: 275, r: 17, node: <rect className="b" x="-9" y="-34" width="18" height="34" rx="2" /> }, // rectangle
  { x: 340, r: 14, node: <path d="M0 -27l15 27h-30z" /> },                                     // triangle
];
type Thing = { el: SVGSVGElement; state: "rest" | "fall" | "settle" | "down"; x: number; y: number; vx: number; vy: number; a: number; va: number };

export default function Props() {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = layer.current!, arm = document.querySelector<SVGSVGElement>(".d-arm");
    const line = document.querySelector<HTMLElement>("#projects .proj");
    if (!arm || !line) return;
    const things: Thing[] = [...root.querySelectorAll<SVGSVGElement>("svg")].map((el) => ({ el, state: "rest", x: 0, y: 0, vx: 0, vy: 0, a: 0, va: 0 }));
    let raf = 0, last = performance.now();
    const frame = (now: number) => {
      const h = Math.min(40, now - last) / 1000; last = now;
      const m = arm.getScreenCTM(), box = root.getBoundingClientRect();
      if (m) {
        const k = m.a; // page px for one arm unit
        const at = (x: number, y: number) => ({ x: m.a * x + m.e - box.left, y: m.d * y + m.f - box.top });
        const hand = at(armHand.x, armHand.y), lr = line.getBoundingClientRect(), floor = lr.top - box.top;
        const lo = lr.left - box.left, hi = lr.right - box.left; // the ends of the line that the things land on
        things.forEach((t, i) => {
          const it = ITEMS[i], r = it.r * k;
          if (t.state === "rest") {
            const p = at(it.x, 3.5 - (it.up ?? 0));
            t.x = p.x; t.y = p.y; t.a = 0;
            if (armHand.live && Math.hypot(hand.x - t.x, hand.y - (t.y - r)) < r + 15 * k) {
              t.state = "fall";
              t.vx = Math.max(-600, Math.min(600, armHand.vx * k * 0.7)) + (Math.random() - 0.5) * 120;
              t.vy = Math.min(-160, armHand.vy * k * 0.5) - 120;
              t.va = (Math.random() - 0.5) * 500 + t.vx * 0.6;
            }
          } else if (t.state === "fall") {
            t.vy += 2200 * h; t.x += t.vx * h; t.y += t.vy * h; t.a += t.va * h;
            if (t.x < lo + r || t.x > hi - r) { t.x = Math.max(lo + r, Math.min(hi - r, t.x)); t.vx *= -0.5; }
            if (t.y >= floor) {
              t.y = floor;
              if (Math.abs(t.vy) < 140) { t.state = "settle"; t.vy = 0; t.vx = 0; t.va = Math.round(t.a / 360) * 360; }
              else { t.vy *= -0.36; t.vx *= 0.7; t.va *= 0.6; }
            }
          } else {
            // On the line: the thing turns upright, then it stays.
            t.y = floor;
            if (t.state === "settle") { t.a += (t.va - t.a) * Math.min(1, h * 12); if (Math.abs(t.va - t.a) < 0.5) { t.a = 0; t.state = "down"; } }
          }
          t.el.style.transform = `translate(${t.x.toFixed(1)}px, ${t.y.toFixed(1)}px) rotate(${t.a.toFixed(1)}deg) scale(${k.toFixed(4)})`;
        });
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="props" ref={layer} aria-hidden="true">
      {ITEMS.map((it, i) => <svg key={i} width="1" height="1">{it.node}</svg>)}
    </div>
  );
}
