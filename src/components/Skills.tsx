"use client";
// The skills as hand-drawn icons in a box. Each icon is a ball with simple
// physics: you can drag it, throw it, and push the others with it. A press on
// an empty place pushes the icons near it away.
import { useEffect, useRef } from "react";

// Each drawing fits a 60 by 60 box with its centre at 0,0. Where a tool has a
// well-known mark, the drawing is a simple sketch of it. The others are small pictures.
const SKILLS: [string, React.ReactNode][] = [
  ["Python", <><path className="b" d="M-2 -18h8a6 6 0 0 1 6 6v8h-16a6 6 0 0 0-6 6v-12a8 8 0 0 1 8-8z" /><path className="w" d="M2 18h-8a6 6 0 0 1-6-6v-8h16a6 6 0 0 0 6-6v12a8 8 0 0 1-8 8z" /><circle className="i" cx="-1" cy="-13" r="1.7" /><circle className="i" cx="1" cy="13" r="1.7" /></>],
  ["C++", <><path className="b" d="M0 -20l17 10v20l-17 10-17-10v-20z" /><path d="M-3 -6a7 7 0 1 0 0 12M3 0h7M6.5 -3.5v7M12 0h6M15 -3v6" /></>],
  ["PyTorch", <><path d="M0 -20l-9 9a13 13 0 1 0 18 0" /><circle className="i" cx="6" cy="-13" r="2.3" /></>],
  ["LeRobot", <><rect className="w" x="-14" y="-9" width="28" height="22" rx="5" /><circle className="b" cx="-6" cy="0" r="3.5" /><circle className="b" cx="6" cy="0" r="3.5" /><path d="M-5 8h10M0 -9v-7" /><circle className="i" cy="-17" r="2.2" /></>],
  ["Hugging Face", <><circle className="b" cy="-2" r="15" /><circle className="i" cx="-5" cy="-6" r="1.8" /><circle className="i" cx="5" cy="-6" r="1.8" /><path d="M-6 1q6 6 12 0M-18 10q4-7 8 0M10 10q4-7 8 0" /></>],
  ["Claude API", <><path d="M0 -19v11M0 8v11M-19 0h11M8 0h11M-13 -13l7 7M6 6l7 7M13 -13l-7 7M-6 6l-7 7" /></>],
  ["faster-whisper", <><rect className="b" x="-6" y="-19" width="12" height="23" rx="6" /><path d="M-12 0a12 12 0 0 0 24 0M0 12v7M-6 19h12" /></>],
  ["ONNX", <><path className="t" d="M0 -17l15 8.5v17l-15 8.5-15-8.5v-17zM0 -17v34M-15 -8.5l30 17M15 -8.5l-30 17" /><circle className="b" r="4.5" />{[[0, -17], [15, -8.5], [15, 8.5], [0, 17], [-15, 8.5], [-15, -8.5]].map(([x, y]) => <circle key={`${x}${y}`} className="w" cx={x} cy={y} r="3" />)}</>],
  ["OpenVINO", <><rect className="b" x="-11" y="-11" width="22" height="22" rx="2" /><path d="M-5 -11v-7M5 -11v-7M-5 11v7M5 11v7M-11 -5h-7M-11 5h-7M11 -5h7M11 5h7" /></>],
  ["ROS 2", <>{[-11, 0, 11].flatMap((y) => [-11, 0, 11].map((x) => <circle key={`${x}${y}`} className={x === y ? "b" : "i"} cx={x} cy={y} r="3.6" />))}</>],
  ["Nav2", <><circle r="17" /><path className="b" d="M0 -12l5 12-5 12-5-12z" /></>],
  ["SLAM Toolbox", <><path className="b" d="M0 19c-10-12-13-17-13-23a13 13 0 0 1 26 0c0 6-3 11-13 23z" /><circle className="w" cy="-5" r="4.5" /></>],
  ["robot_localization", <><circle r="12" /><path d="M0 -20v10M0 10v10M-20 0h10M10 0h10" /><circle className="b" r="3.5" /></>],
  ["micro-ROS", <><rect x="-14" y="-14" width="28" height="28" rx="4" />{[-6, 6].flatMap((y) => [-6, 6].map((x) => <circle key={`${x}${y}`} className="i" cx={x} cy={y} r="2.8" />))}</>],
  ["MuJoCo", <><path className="w" d="M0 -18l16 8v18l-16 8-16-8v-18z" /><path className="b" d="M0 -18l16 8-16 8-16-8z" /><path d="M0 -2v18" /></>],
  ["Foxglove", <><rect className="w" x="-17" y="-13" width="34" height="26" rx="3" /><path d="M-12 6l7-9 6 5 10-11" /></>],
  ["UR5e", <><path d="M-16 17h14M-9 15l-2-17 16-8 8 5" /><circle className="b" cx="-9" cy="15" r="4.5" /><circle className="b" cx="-11" cy="-2" r="4" /><circle className="b" cx="5" cy="-10" r="3.5" /></>],
  ["RealSense", <><rect className="w" x="-20" y="-8" width="40" height="16" rx="8" /><circle className="b" cx="-11" r="4" /><circle className="b" cx="11" r="4" /><circle className="i" r="1.8" /></>],
  ["DSP (STFT)", <><path d="M-19 0c4-18 8-18 12 0s8 18 12 0 5-13 14-7" /></>],
  ["USRP SDR", <><path d="M0 19v-21M-8 19h16M-8 -9a11 11 0 0 1 16 0M-14 -14a19 19 0 0 1 28 0" /><circle className="b" cy="-3" r="3.5" /></>],
  ["HDF5", <><path className="b" d="M0 -16l16 7-16 7-16-7z" /><path d="M-16 0l16 7 16-7M-16 8l16 7 16-7" /></>],
  ["Zarr", <><rect className="b" x="-5" y="-5" width="10" height="10" /><path d="M-15 -15h30v30h-30zM-5 -15v30M5 -15v30M-15 -5h30M-15 5h30" /></>],
  ["CMake", <><path className="w" d="M0 -19l19 36h-38z" /><path className="b" d="M0 -19l19 36-23-14z" /><path d="M-19 17l15-14" /></>],
  ["Git", <><path className="b" d="M0 -20l20 20-20 20-20-20z" /><path d="M-6 -8l6 6v10M0 -2l7 5" /><circle className="w" cx="-6" cy="-8" r="3" /><circle className="w" cy="9" r="3" /><circle className="w" cx="8" cy="4" r="3" /></>],
  ["Linux", <><ellipse className="b" cy="2" rx="13" ry="17" /><ellipse className="w" cy="7" rx="7.5" ry="10" /><circle className="i" cx="-4" cy="-8" r="1.7" /><circle className="i" cx="4" cy="-8" r="1.7" /><path d="M-3 -3h6l-3 4zM-11 19h7M4 19h7" /></>],
  ["uv", <><path className="b" d="M4 -19l-14 21h9l-3 17 14-21h-9z" /></>],
  ["pytest", <><path d="M-18 -15h36" /><rect className="b" x="-15" y="-9" width="6" height="14" /><rect className="w" x="-7" y="-9" width="6" height="24" /><rect className="b" x="1" y="-9" width="6" height="9" /><rect className="w" x="9" y="-9" width="6" height="18" /></>],
  ["Sphinx", <><path className="w" d="M-13 -17h19l7 7v27h-26z" /><path d="M6 -17v7h7M-7 -2h14M-7 5h14M-7 12h9" /></>],
];
const R = 44, GRAV = 1900;
type Body = { el: HTMLElement; art: SVGElement; x: number; y: number; vx: number; vy: number; a: number; va: number; in: boolean; live: boolean };

export default function Skills() {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = box.current!;
    const els = [...root.querySelectorAll<HTMLElement>(".chip")];
    let W = root.clientWidth, H = root.clientHeight;
    const place = (b: Body) => { b.el.style.transform = `translate(${(b.x - R).toFixed(1)}px, ${(b.y - R).toFixed(1)}px)`; b.art.style.transform = `rotate(${b.a.toFixed(1)}deg)`; };
    // Each icon waits outside the left side of the box. They come in one after the other.
    const bodies: Body[] = els.map((el) => ({ el, art: el.querySelector("svg")!, x: -R * 2, y: R + 20, vx: 0, vy: 0, a: 0, va: 0, in: false, live: false }));
    bodies.forEach((b) => { b.el.style.transform = `translate(${-R * 4}px, 0)`; });
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // No motion: put the icons in rows.
      const per = Math.max(1, Math.floor(W / (2 * R + 8)));
      bodies.forEach((b, i) => { b.x = R + 4 + (i % per) * (2 * R + 8); b.y = H - R - Math.floor(i / per) * (2 * R + 14) - 14; place(b); });
      root.style.minHeight = `${Math.ceil(bodies.length / per) * (2 * R + 14) + 20}px`;
      return;
    }
    const ptr = { x: 0, y: 0 };
    let grab: Body | null = null, raf = 0, last = 0, on = false, clock = 0;
    const local = (e: PointerEvent) => { const r = root.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; };
    const down = (e: PointerEvent) => {
      local(e);
      const hit = [...bodies].reverse().find((b) => b.live && Math.hypot(b.x - ptr.x, b.y - ptr.y) < R);
      if (hit) { grab = hit; root.setPointerCapture(e.pointerId); root.classList.add("grabbing"); e.preventDefault(); }
      else bodies.forEach((b) => { // a push from an empty place
        const dx = b.x - ptr.x, dy = b.y - ptr.y, d = Math.hypot(dx, dy) || 1;
        if (d < 240) { const k = (1 - d / 240) * 1300; b.vx += (dx / d) * k; b.vy += (dy / d) * k - 250; b.va += (Math.random() - 0.5) * 140; }
      });
    };
    const move = (e: PointerEvent) => local(e);
    const up = () => { grab = null; root.classList.remove("grabbing"); };

    const step = (h: number) => {
      for (const b of bodies) {
        if (!b.live) continue;
        if (b === grab) { b.vx = Math.max(-2600, Math.min(2600, (ptr.x - b.x) * 22)); b.vy = Math.max(-2600, Math.min(2600, (ptr.y - b.y) * 22)); }
        else b.vy += GRAV * h;
        b.x += b.vx * h; b.y += b.vy * h; b.a += b.va * h;
        // The turn dies out, and an icon that is almost at rest turns upright again.
        b.va *= 1 - Math.min(1, 2.5 * h);
        if (Math.hypot(b.vx, b.vy) < 60) b.a += (Math.round(b.a / 360) * 360 - b.a) * Math.min(1, 5 * h);
        if (b.x > R) b.in = true;
        if (b.in && b.x < R) { b.x = R; b.vx = Math.abs(b.vx) * 0.45; } else if (b.x > W - R) { b.x = W - R; b.vx = -Math.abs(b.vx) * 0.45; }
        if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy) * 0.4; }
        if (b.y > H - R) { b.y = H - R; b.vy = Math.abs(b.vy) > 120 ? -b.vy * 0.32 : 0; b.vx *= 1 - Math.min(1, 3 * h); b.va = (b.vx / R) * 14; }
      }
      for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], b = bodies[j];
        if (!a.live || !b.live) continue;
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01;
        if (d >= 2 * R) continue;
        const nx = dx / d, ny = dy / d, over = 2 * R - d, wa = a === grab ? 0 : b === grab ? 1 : 0.5;
        a.x -= nx * over * wa; a.y -= ny * over * wa; b.x += nx * over * (1 - wa); b.y += ny * over * (1 - wa);
        const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (vn < 0) { const p = -vn * 0.62; if (a !== grab) { a.vx -= nx * p * (b === grab ? 2 : 1); a.vy -= ny * p * (b === grab ? 2 : 1); } if (b !== grab) { b.vx += nx * p * (a === grab ? 2 : 1); b.vy += ny * p * (a === grab ? 2 : 1); } }
      }
    };
    const tick = (now: number) => {
      const dt = Math.min(34, now - last) / 1000; last = now;
      // One icon comes in from the left each 130 ms.
      clock += dt * 1000;
      bodies.forEach((b, i) => {
        if (!b.live && clock > i * 130) { b.live = true; b.x = -R; b.y = R + 14 + Math.random() * 50; b.vx = 520 + Math.random() * 520; b.vy = -80 - Math.random() * 160; b.va = 20 + Math.random() * 40; }
      });
      for (let i = 0; i < 3; i++) step(dt / 3);
      bodies.forEach((b) => { if (b.live) place(b); });
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !on) { on = true; last = performance.now(); raf = requestAnimationFrame(tick); }
      else if (!e.isIntersecting && on) { on = false; cancelAnimationFrame(raf); }
    }, { threshold: 0.15 });
    io.observe(root);
    const ro = new ResizeObserver(() => { W = root.clientWidth; H = root.clientHeight; });
    ro.observe(root);
    root.addEventListener("pointerdown", down); root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", up); root.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      root.removeEventListener("pointerdown", down); root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", up); root.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <div className="skillwrap">
      <div className="skillbox" ref={box} aria-hidden="true">
        {SKILLS.map(([name, art]) => (
          <div className="chip" key={name}>
            <svg viewBox="-30 -30 60 60">{art}</svg>
            <span>{name}</span>
          </div>
        ))}
      </div>
      <p className="hint">drag and throw the skills. press an empty place to push them.</p>
    </div>
  );
}
