"use client";
// The small things on the bench beside the hero arm. A hit from the gripper
// knocks a thing off the bench. It then falls down the page and comes to rest
// on the straight line below the "projects" heading, on the flat side that is
// nearest when it lands. It does not have to stand upright. Two things at
// rest on the line cannot overlap.
import { useEffect, useRef } from "react";
import { armHand } from "@/components/Art";

// Each thing, in arm units, drawn round its own centre:
//   w, h  half width and half height
//   lie   the ways it can lie at rest, as [angle in degrees, distance from its centre to the ground]
type Item = { w: number; h: number; ball?: boolean; lie: [number, number][]; node: React.ReactNode };
const ITEMS: Item[] = [
  { w: 12, h: 14, lie: [[0, 14], [180, 14], [82, 10], [-82, 10]], node: <path d="M-12 -14h24l-4 28h-16z" /> },                            // cup
  { w: 12, h: 12, ball: true, lie: [[0, 12]], node: <circle className="b" r="12" /> },                                                     // ball
  { w: 15, h: 13.5, lie: [[0, 9], [119, 8.7], [-119, 8.7]], node: <path d="M0 -18l15 27h-30z" /> },                                          // triangle
];
type Thing = { el: SVGSVGElement; state: "rest" | "fall" | "settle" | "down"; x: number; y: number; vx: number; vy: number; a: number; va: number; ta: number; off: number };
const rad = Math.PI / 180;
const wrap = (d: number) => (((d % 360) + 540) % 360) - 180; // an angle as -180 to 180

export default function Props() {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = layer.current!, arm = document.querySelector<SVGSVGElement>(".d-arm");
    const line = document.querySelector<HTMLElement>("#projects .proj");
    if (!arm || !line) return;
    const things: Thing[] = [...root.querySelectorAll<SVGSVGElement>("svg")].map((el) => ({ el, state: "rest", x: 0, y: 0, vx: 0, vy: 0, a: 0, va: 0, ta: 0, off: 0 }));
    // Each page load puts the things at new places on the bench, in a new order, with a gap between them.
    // The places are from 75 to 335 in arm units. The gripper reaches about 365 at bench height, so it can hit each one.
    const slots = ITEMS.map((_, i) => Math.max(75, Math.min(335, 85 + i * ((325 - 85) / (ITEMS.length - 1)) + (Math.random() - 0.5) * 50)));
    const xs = slots.map((v) => ({ v, o: Math.random() })).sort((p, q) => p.o - q.o).map((q) => Math.round(q.v));
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
          const it = ITEMS[i], r = Math.max(it.w, it.h) * k;
          if (t.state === "rest") {
            const p = at(xs[i], 3.5 - it.lie[0][1]);
            t.x = p.x; t.y = p.y; t.a = 0;
            if (armHand.live && Math.hypot(hand.x - t.x, hand.y - t.y) < r + 15 * k) {
              t.state = "fall";
              t.vx = Math.max(-600, Math.min(600, armHand.vx * k * 0.7)) + (Math.random() - 0.5) * 120;
              t.vy = Math.min(-160, armHand.vy * k * 0.5) - 120;
              t.va = (Math.random() - 0.5) * 500 + t.vx * 0.6;
            }
          } else if (t.state === "fall") {
            // the distance from the centre to the ground, for the present angle
            const ext = it.ball ? it.h * k : (Math.abs(it.w * Math.sin(t.a * rad)) + Math.abs(it.lie[0][1] * Math.cos(t.a * rad))) * k;
            t.vy += 2200 * h; t.x += t.vx * h; t.y += t.vy * h; t.a += t.va * h;
            if (t.x < lo + r || t.x > hi - r) { t.x = Math.max(lo + r, Math.min(hi - r, t.x)); t.vx *= -0.5; }
            if (t.y >= floor - ext) {
              t.y = floor - ext;
              if (Math.abs(t.vy) < 150) {
                // It comes to rest on the flat side that is nearest to its present angle.
                let best = it.lie[0], gap = 1e9;
                for (const s of it.lie) { const d = Math.abs(wrap(s[0] - t.a)); if (d < gap) { gap = d; best = s; } }
                t.state = "settle"; t.vy = 0; t.vx = 0; t.ta = it.ball ? t.a : t.a + wrap(best[0] - t.a); t.off = best[1] * k;
              } else { t.vy *= -0.36; t.vx *= 0.7; t.va *= 0.6; }
            }
          } else if (t.state === "settle") {
            const e = Math.min(1, h * 12);
            t.a += (t.ta - t.a) * e; t.y += (floor - t.off - t.y) * e;
            if (Math.abs(t.ta - t.a) < 0.5) { t.a = t.ta; t.state = "down"; }
          } else t.y = floor - t.off;
        });
        // On the line, two things cannot be in the same place. Each thing that is at rest keeps its
        // order from left to right and moves to the side until it has its own place.
        const down = things.map((t, i) => {
          const it = ITEMS[i];
          return { t, hw: (it.ball ? it.w : Math.abs(it.w * Math.cos(t.ta * rad)) + Math.abs(it.h * Math.sin(t.ta * rad))) * k };
        }).filter((q) => q.t.state === "settle" || q.t.state === "down").sort((p, q) => p.t.x - q.t.x);
        const want = down.map((q) => q.t.x);
        let cur = lo;
        down.forEach((q, n) => { want[n] = Math.max(want[n], cur + q.hw); cur = want[n] + q.hw + 8; });
        cur = hi;
        for (let n = down.length - 1; n >= 0; n--) { want[n] = Math.min(want[n], cur - down[n].hw); cur = want[n] - down[n].hw - 8; }
        down.forEach((q, n) => { q.t.x += (want[n] - q.t.x) * Math.min(1, h * 10); });
        things.forEach((t) => {
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
