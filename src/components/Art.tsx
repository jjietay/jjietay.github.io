"use client";
// The two drawings of the site, in one style: a UR5e arm and a camera.
// Both follow the pointer with the same slow lag.
import { useEffect, useRef } from "react";
import { ARM, HOME, createArm, solve, type ArmState } from "@/lib/arm";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const LAG = 420; // ms

/** The gripper of the hero arm, in the arm's own units. The things on the bench read it. */
export const armHand = { x: 0, y: 0, vx: 0, vy: 0, live: false };

export function ArmArt() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current!;
    const base = createArm(svg);
    const sparks = svg.querySelector("[data-sparks]");
    // The three short lines stay beside the wrist and fan out from it.
    const draw = (st: ArmState, dt: number) => {
      base(st);
      const k = solve(st), a = k.a1 + k.a2, ph = (st.phi * Math.PI) / 180;
      const wx = k.ex + ARM.L2 * Math.cos(a), wy = k.ey + ARM.L2 * Math.sin(a);
      sparks?.setAttribute("transform", `translate(${(wx + 20).toFixed(1)} ${(wy - 22).toFixed(1)})`);
      const hx = wx + 44 * Math.cos(ph), hy = wy + 44 * Math.sin(ph);
      if (dt > 0) { armHand.vx = ((hx - armHand.x) / dt) * 1000; armHand.vy = ((hy - armHand.y) / dt) * 1000; }
      armHand.x = hx; armHand.y = hy;
    };
    const s: ArmState = { ...HOME, x: 215, y: -215, phi: 80 };
    draw(s, 0);
    if (still()) return;
    armHand.live = true;
    const goal = { x: s.x, y: s.y, grip: 1 };
    let moved = -1e9, last = performance.now(), raf = 0;
    const hero = svg.closest(".hero");
    const onMove = (e: PointerEvent) => {
      const m = svg.getScreenCTM();
      if (!m) return;
      // Below the first screen (from "projects" down), the arm moves by itself.
      if (hero && e.clientY > hero.getBoundingClientRect().bottom) { moved = -1e9; return; }
      moved = performance.now();
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      // The gripper stays at the right of the base. To the left of it, the arm would have to flip over.
      goal.x = clamp(p.x, 45, 400); goal.y = clamp(p.y, -400, -16);
    };
    const onDown = () => { goal.grip = 0; };
    const onUp = () => { goal.grip = 1; };
    const tick = (now: number) => {
      const dt = Math.min(50, now - last); last = now;
      if (now - moved > 2600) { // no pointer: move slowly without it
        goal.x = 215 + 120 * Math.sin(now / 2300); goal.y = -220 + 90 * Math.sin(now / 1500);
      }
      const k = 1 - Math.exp(-dt / LAG);
      s.x += (goal.x - s.x) * k; s.y += (goal.y - s.y) * k;
      s.phi = 80 + (s.x - 190) * 0.055;
      s.grip += (goal.grip - s.grip) * (1 - Math.exp(-dt / 90));
      draw(s, dt);
      raf = requestAnimationFrame(tick);
    };
    addEventListener("pointermove", onMove); addEventListener("pointerdown", onDown); addEventListener("pointerup", onUp);
    raf = requestAnimationFrame(tick);
    return () => {
      armHand.live = false; cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove); removeEventListener("pointerdown", onDown); removeEventListener("pointerup", onUp);
    };
  }, []);

  const { L1, L2, SY } = ARM;
  const butt = { strokeLinecap: "butt" } as const;
  return (
    <svg ref={ref} className="d-art d-arm" viewBox="-110 -440 540 462" aria-hidden="true">
      <path className="ol" d="M-100 6H420" strokeWidth="5" />
      <rect className="sh c-o" x="-40" y="-20" width="80" height="24" rx="4" />
      <path className="ol" d={`M0 -20V${SY}`} strokeWidth="44" style={butt} />
      <path className="fl" d={`M0 -18V${SY}`} strokeWidth="34" style={butt} />
      <g data-j="1">
        <path className="ol" d={`M0 0H${L1}`} strokeWidth="42" /><path className="fl" d={`M0 0H${L1}`} strokeWidth="32" />
        <g data-j="2">
          <path className="ol" d={`M0 0H${L2}`} strokeWidth="35" /><path className="fl" d={`M0 0H${L2}`} strokeWidth="25" />
          <g data-j="3">
            <path className="ol" d="M0 0H16" strokeWidth="24" style={butt} /><path className="fl" d="M0 0H14" strokeWidth="14" style={butt} />
            <rect className="sh c-o" x="14" y="-26" width="10" height="52" rx="2" />
            <rect className="c-i" data-f="a" x="24" y="-23" width="34" height="5" />
            <rect className="c-i" data-f="b" x="24" y="19" width="34" height="5" />
            <circle className="sh c-b" r="15" /><circle className="c-i" r="4" />
          </g>
          <circle className="sh c-b" r="19" /><circle className="c-i" r="5" />
        </g>
      </g>
      <circle className="sh c-b" cy={SY} r="24" /><circle className="c-i" cy={SY} r="6" />
      <path className="ol" data-sparks="" d="M2 -10L5 -26M7 -7L18 -18M10 -2L26 -5" strokeWidth="4" />
    </svg>
  );
}

// Six shutter blades. Each has one corner on the rim, the next corner on the rim, and one at the centre.
const BLADES = Array.from({ length: 6 }, (_, i) => {
  const a = (i * Math.PI) / 3 - Math.PI / 2, b = a + Math.PI / 3, R = 74;
  return [222 + R * Math.cos(a), 236 + R * Math.sin(a), 222 + R * Math.cos(b), 236 + R * Math.sin(b)].map((v) => +v.toFixed(1));
});

/** A press inside the nearest [data-snap] element fires the shutter. */
export function CamArt() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const cam = ref.current!;
    if (still()) return;
    const iris = cam.querySelector<SVGGElement>("[data-iris]")!;
    const goal = { x: 0, y: 0 }, eye = { x: 0, y: 0 };
    let moved = -1e9, last = performance.now(), raf = 0;
    const onMove = (e: PointerEvent) => {
      moved = performance.now();
      const r = cam.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 320) * 13;
      goal.x = (dx / d) * k; goal.y = (dy / d) * k;
    };
    const tick = (now: number) => {
      const dt = Math.min(60, now - last); last = now;
      if (now - moved > 2600) { goal.x = 9 * Math.sin(now / 1900); goal.y = 6 * Math.cos(now / 1300); }
      const k = 1 - Math.exp(-dt / LAG);
      eye.x += (goal.x - eye.x) * k; eye.y += (goal.y - eye.y) * k;
      iris.setAttribute("transform", `translate(${eye.x.toFixed(2)} ${eye.y.toFixed(2)})`);
      raf = requestAnimationFrame(tick);
    };
    const zone = cam.closest<HTMLElement>("[data-snap]");
    const snap = (e: PointerEvent) => {
      if ((e.target as Element).closest("a, button, header")) return;
      cam.classList.remove("snap"); void cam.getBoundingClientRect(); cam.classList.add("snap");
    };
    addEventListener("pointermove", onMove);
    zone?.addEventListener("pointerdown", snap);
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); removeEventListener("pointermove", onMove); zone?.removeEventListener("pointerdown", snap); };
  }, []);

  return (
    <svg ref={ref} className="d-art d-cam" viewBox="0 0 420 372" aria-hidden="true">
      <path className="ol" d="M10 356H410" strokeWidth="5" />
      <path className="sh c-o" d="M150 122l22-36h76l22 36z" />
      <rect className="sh c-y" x="86" y="100" width="46" height="22" rx="4" />
      <rect className="sh c-p" x="52" y="120" width="316" height="212" rx="20" />
      <rect className="sh c-o" x="52" y="170" width="46" height="112" />
      <rect className="sh c-y" data-flash="" x="298" y="142" width="46" height="26" rx="3" />
      <circle className="sh c-p" cx="222" cy="236" r="84" />
      <circle className="sh c-b" cx="222" cy="236" r="62" />
      <circle className="ol" cx="222" cy="236" r="42" strokeWidth="3" />
      {/* a reflection on the glass. It moves a little with the pointer. */}
      <g data-iris="">
        <path className="fl" d="M193 222a32 32 0 0 1 22 -18" strokeWidth="7" />
        <circle className="c-p" cx="246" cy="258" r="5" />
      </g>
      {/* the leaf shutter: six blades that turn about points on the rim. A press closes them. */}
      <clipPath id="lens"><circle cx="222" cy="236" r="60" /></clipPath>
      <g clipPath="url(#lens)">
        {BLADES.map(([px, py, qx, qy], i) => (
          <path key={i} className="blade" d={`M${px} ${py}L${qx} ${qy}L222 236z`} style={{ transformOrigin: `${px}px ${py}px` }} />
        ))}
      </g>
    </svg>
  );
}
