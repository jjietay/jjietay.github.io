"use client";
// One hand-drawn, moving figure for each project. Each figure reacts to the
// pointer. A figure runs only while it is on screen, and it shows one still
// frame when the visitor asks for reduced motion.
import { useEffect, useRef } from "react";

type Ptr = { x: number; y: number; inside: boolean; down: boolean; click: { x: number; y: number } | null };
type Make = (svg: SVGSVGElement, ptr: Ptr) => (t: number, dt: number) => void;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const f = (n: number) => n.toFixed(1);
const get = (svg: SVGSVGElement) => (k: string) => svg.querySelector<SVGElement>(`[data-a="${k}"]`)!;

function useFig(make: Make) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current!;
    const ptr: Ptr = { x: 0, y: 0, inside: false, down: false, click: null };
    const frame = make(svg, ptr);
    const local = (e: PointerEvent) => {
      const m = svg.getScreenCTM();
      return m ? new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()) : null;
    };
    const move = (e: PointerEvent) => { const p = local(e); if (p) { ptr.x = p.x; ptr.y = p.y; ptr.inside = true; } };
    const leave = () => { ptr.inside = false; };
    const down = (e: PointerEvent) => { const p = local(e); if (p) { ptr.x = p.x; ptr.y = p.y; ptr.inside = true; ptr.down = true; ptr.click = { x: p.x, y: p.y }; } };
    const up = () => { ptr.down = false; };
    svg.addEventListener("pointermove", move); svg.addEventListener("pointerleave", leave); svg.addEventListener("pointerdown", down); addEventListener("pointerup", up); addEventListener("pointercancel", up);
    frame(0, 0);
    let raf = 0, last = 0, on = false, io: IntersectionObserver | null = null;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const tick = (now: number) => { const dt = Math.min(50, now - last); last = now; frame(now, dt); raf = requestAnimationFrame(tick); };
      io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !on) { on = true; last = performance.now(); raf = requestAnimationFrame(tick); }
        else if (!e.isIntersecting && on) { on = false; cancelAnimationFrame(raf); }
      });
      io.observe(svg);
    }
    return () => {
      cancelAnimationFrame(raf); io?.disconnect();
      svg.removeEventListener("pointermove", move); svg.removeEventListener("pointerleave", leave); svg.removeEventListener("pointerdown", down); removeEventListener("pointerup", up); removeEventListener("pointercancel", up);
    };
  }, [make]);
  return ref;
}

const Box = ({ label, hint, children, r }: { label: string; hint: string; children: React.ReactNode; r: React.RefObject<SVGSVGElement | null> }) => (
  <figure className="figbox">
    <svg ref={r} className="fig" viewBox="0 0 480 250" role="img" aria-label={label}>{children}</svg>
    <figcaption>{hint}</figcaption>
  </figure>
);

/* 1. The UR5e moves an orange to a tray. The visitor can do it too: the arm
      follows the pointer, a press closes the gripper, and a release drops the orange. */
// The tray is a real shape: two walls on the bench. The orange bounces on them,
// and the gripper cannot go through them.
const TRAY = 320, RIM = 192, OR = 9;
const WALLS = [[286, RIM, 294, 219], [354, RIM, 346, 219]];
const zone = (x: number) => (x <= 268 ? 0 : x >= 308 && x <= 332 ? 1 : x >= 372 ? 2 : -1); // left of the tray, in it, right of it

const makeVla: Make = (svg, ptr) => {
  const q = get(svg), S = { x: 150, y: 185 }, L1 = 100, L2 = 95;
  const tool = { x: 230, y: 120, vx: 0, vy: 0 }, o = { x: 240, y: 208, vx: 0, vy: 0 };
  let held = false, phase = 0, wait = 0, grip = 1, manual = false, away = 0, was = false, lost = 0;
  const inTray = () => Math.abs(o.x - TRAY) < 27 && o.y > 196;
  const bounce = (ax: number, ay: number, bx: number, by: number) => {
    const ex = bx - ax, ey = by - ay, t = clamp(((o.x - ax) * ex + (o.y - ay) * ey) / (ex * ex + ey * ey), 0, 1);
    const dx = o.x - (ax + ex * t), dy = o.y - (ay + ey * t), d = Math.hypot(dx, dy);
    if (d >= OR + 1.5) return;
    const nx = d ? dx / d : 0, ny = d ? dy / d : -1, vn = o.vx * nx + o.vy * ny;
    o.x += nx * (OR + 1.5 - d); o.y += ny * (OR + 1.5 - d);
    if (vn < 0) { o.vx -= 1.45 * vn * nx; o.vy -= 1.45 * vn * ny; }
  };
  return (_t, dt) => {
    const s = Math.max(dt, 1) / 1000, px = tool.x, py = tool.y;
    ptr.click = null;
    away = ptr.inside || ptr.down ? 0 : away + dt;
    if (ptr.inside && !manual) { manual = true; held = false; }
    if (manual && away > 1800) { manual = false; held = false; phase = inTray() || o.x < 196 || o.x > 266 ? 7 : 0; wait = 0; }
    if (manual) {
      // The arm follows the pointer. A press grips the orange if it is between the fingers.
      const k = Math.min(1, dt / 130);
      let nx = tool.x + (clamp(ptr.x, 185, 345) - tool.x) * k, ny = tool.y + (clamp(ptr.y + 8, 70, 210) - tool.y) * k;
      if (ny > RIM - 2) { // below the rim: the walls of the tray stop the gripper
        const z = tool.y > RIM - 2 ? zone(tool.x) : zone(nx);
        if (z === 0) nx = Math.min(nx, 268); else if (z === 1) nx = clamp(nx, 308, 332); else if (z === 2) nx = Math.max(nx, 372); else ny = RIM - 2;
      }
      tool.x = nx; tool.y = ny;
      if (ptr.down && !was && Math.hypot(o.x - tool.x, o.y - (tool.y - 2)) < 17) held = true;
      if (!ptr.down && held) { held = false; o.vx = clamp(tool.vx, -500, 500); o.vy = clamp(tool.vy, -500, 500); }
      was = ptr.down;
      grip += ((ptr.down ? 0 : 1) - grip) * Math.min(1, dt / 90);
    } else {
      // No pointer: the arm does the task by itself.
      const g = ([[o.x, 160], [o.x, 210], null, [tool.x, 150], [TRAY, 150], [TRAY, 196], null, [230, 120]] as (number[] | null)[])[phase];
      if (g) {
        const dx = g[0] - tool.x, dy = g[1] - tool.y, d = Math.hypot(dx, dy), step = 150 * s;
        if (d <= step) {
          tool.x = g[0]; tool.y = g[1];
          if (phase === 7) { wait += dt; if (wait > 1100) { wait = 0; phase = 0; if (inTray() || o.x < 196 || o.x > 266) Object.assign(o, { x: 205 + Math.random() * 55, y: 150, vx: 0, vy: 0 }); } }
          else phase++;
        } else { tool.x += (dx / d) * step; tool.y += (dy / d) * step; }
      } else {
        wait += dt;
        grip += ((phase === 2 ? 0 : 1) - grip) * Math.min(1, dt / 90);
        if (wait > 280) { wait = 0; if (phase === 2) held = Math.hypot(o.x - tool.x, o.y - (tool.y - 2)) < 17; else { held = false; o.vx = 0; o.vy = 0; } phase++; }
      }
    }
    tool.vx = (tool.x - px) / s; tool.vy = (tool.y - py) / s;
    // The orange: in the gripper, or free. A free orange falls, and bounces on the bench and on the tray.
    if (held) Object.assign(o, { x: tool.x, y: tool.y - 2, vx: 0, vy: 0 });
    else for (let i = 0; i < 4; i++) {
      const h = s / 4;
      o.vy += 1500 * h; o.x += o.vx * h; o.y += o.vy * h;
      for (const [ax, ay, bx, by] of WALLS) bounce(ax, ay, bx, by);
      if (o.y >= 208) { o.y = 208; o.vy = Math.abs(o.vy) > 140 ? -o.vy * 0.4 : 0; o.vx *= 1 - Math.min(1, 5 * h); }
      if (o.x < 30 || o.x > 450) { o.x = clamp(o.x, 30, 450); o.vx *= -0.4; }
    }
    // An orange at the right of the tray, at the left of the arm's reach, or below the bench line is out of reach. It comes back.
    lost = !held && (o.x > 356 || o.x < 184 || o.y > 211) ? lost + dt : 0;
    if (lost > 700) { Object.assign(o, { x: 215 + Math.random() * 40, y: 120, vx: 0, vy: 0 }); lost = 0; if (!manual) { phase = 7; wait = 0; } }
    const W = { x: tool.x, y: tool.y - 22 };
    const d = clamp(Math.hypot(W.x - S.x, W.y - S.y), 8, L1 + L2 - 1), a = Math.atan2(W.y - S.y, W.x - S.x);
    const e = a - Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    const E = { x: S.x + L1 * Math.cos(e), y: S.y + L1 * Math.sin(e) };
    const l1 = `M${S.x} ${S.y}L${f(E.x)} ${f(E.y)}`, l2 = `M${f(E.x)} ${f(E.y)}L${f(W.x)} ${f(W.y)}`, w = 7 + grip * 6;
    q("o1").setAttribute("d", l1); q("f1").setAttribute("d", l1); q("o2").setAttribute("d", l2); q("f2").setAttribute("d", l2);
    q("grip").setAttribute("d", `M${f(W.x)} ${f(W.y)}v5M${f(W.x - 14)} ${f(W.y + 5)}h28M${f(W.x - w)} ${f(W.y + 5)}V${f(tool.y)}M${f(W.x + w)} ${f(W.y + 5)}V${f(tool.y)}`);
    q("j1").setAttribute("cx", f(E.x)); q("j1").setAttribute("cy", f(E.y)); q("j2").setAttribute("cx", f(W.x)); q("j2").setAttribute("cy", f(W.y));
    q("orange").setAttribute("cx", f(o.x)); q("orange").setAttribute("cy", f(o.y));
  };
};
export function FigVla() {
  const r = useFig(makeVla);
  return (
    <Box r={r} label="A drawn robot arm moves an orange to a tray" hint="hold the mouse button to grip the orange. release it over the tray">
      <g className="wobg">
        <path className="k t" d="M28 20h214v38H78l-16 15 3-15H28z" />
        <path className="k" d="M20 219H460M286 192l8 27h52l8-27M133 219v-14h34v14M150 205V185" />
        <circle className="k b" data-a="orange" r="9" />
        <path className="k" data-a="o1" style={{ strokeWidth: 18 }} /><path className="fl" data-a="f1" style={{ strokeWidth: 12 }} />
        <path className="k" data-a="o2" style={{ strokeWidth: 16 }} /><path className="fl" data-a="f2" style={{ strokeWidth: 10 }} />
        <path className="k" data-a="grip" />
        <circle className="k b" cx="150" cy="185" r="10" /><circle className="k b" data-a="j1" r="8" /><circle className="k b" data-a="j2" r="6.5" />
      </g>
      <text x="135" y="43.5" textAnchor="middle">“put the orange in the tray”</text>
    </Box>
  );
}

/* 2. The tank drives to the pointer, round the obstacles, with its lidar on. */
const OBS = [[150, 92, 22], [300, 160, 28], [366, 72, 16]];
const WAY = [[400, 190], [240, 58], [80, 60], [90, 190], [420, 60]];
const makeTank: Make = (svg, ptr) => {
  const q = get(svg), tank = { x: 80, y: 180, h: 0 }, pts: { x: number; y: number; born: number }[] = [];
  let wp = 0, ang = 0;
  return (now, dt) => {
    const s = dt / 1000;
    let goal = WAY[wp];
    if (ptr.inside) goal = [clamp(ptr.x, 40, 440), clamp(ptr.y, 40, 210)];
    else if (Math.hypot(goal[0] - tank.x, goal[1] - tank.y) < 22) { wp = (wp + 1) % WAY.length; goal = WAY[wp]; }
    const gx = goal[0] - tank.x, gy = goal[1] - tank.y, gd = Math.hypot(gx, gy) || 1;
    let dx = gx / gd, dy = gy / gd;
    for (const [cx, cy, r] of OBS) {
      const vx = tank.x - cx, vy = tank.y - cy, v = Math.hypot(vx, vy) || 1, gap = v - r;
      if (gap < 44) { const k = ((44 - gap) / 44) * 2; dx += (vx / v) * k - (vy / v) * k * 0.6; dy += (vy / v) * k + (vx / v) * k * 0.6; }
    }
    let dh = Math.atan2(dy, dx) - tank.h;
    dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    tank.h += clamp(dh, -2.6 * s, 2.6 * s);
    const v = gd > 14 ? 62 * Math.max(0.15, Math.cos(dh)) : 0;
    tank.x = clamp(tank.x + Math.cos(tank.h) * v * s, 42, 438); tank.y = clamp(tank.y + Math.sin(tank.h) * v * s, 42, 208);
    for (const [cx, cy, r] of OBS) {
      const vx = tank.x - cx, vy = tank.y - cy, d = Math.hypot(vx, vy) || 1;
      if (d < r + 18) { tank.x = cx + (vx / d) * (r + 18); tank.y = cy + (vy / d) * (r + 18); }
    }
    // The lidar head turns 1.6 times each second. Each ray goes to the first wall or obstacle.
    // The hit points stay for a little more than one turn, and the old ones fade.
    const sweep = Math.PI * 2 * 1.6 * s, n = Math.max(1, Math.ceil(sweep / 0.045));
    let hx = tank.x, hy = tank.y;
    for (let i = 1; i <= n; i++) {
      const a = ang + (sweep * i) / n, ux = Math.cos(a), uy = Math.sin(a);
      let t = Math.min(ux > 0 ? (458 - tank.x) / ux : ux < 0 ? (22 - tank.x) / ux : 1e9, uy > 0 ? (228 - tank.y) / uy : uy < 0 ? (22 - tank.y) / uy : 1e9);
      for (const [cx, cy, r] of OBS) {
        const px = cx - tank.x, py = cy - tank.y, pr = px * ux + py * uy, pp = px * px + py * py - pr * pr;
        if (pr > 0 && pp < r * r) t = Math.min(t, pr - Math.sqrt(r * r - pp));
      }
      hx = tank.x + ux * t; hy = tank.y + uy * t;
      pts.push({ x: hx, y: hy, born: now });
    }
    ang += sweep;
    while (pts.length && now - pts[0].born > 700) pts.shift();
    const d = ["", "", "", ""];
    for (const p of pts) d[Math.min(3, Math.floor((now - p.born) / 175))] += `M${f(p.x)} ${f(p.y)}h.1`;
    d.forEach((path, i) => q(`h${i}`).setAttribute("d", path));
    // The beam, and the rays of the last 90 ms behind it.
    let fan = "";
    for (let i = pts.length - 1; i >= 0 && now - pts[i].born < 90; i -= 2) fan += `M${f(tank.x)} ${f(tank.y)}L${f(pts[i].x)} ${f(pts[i].y)}`;
    q("fan").setAttribute("d", fan);
    q("rays").setAttribute("d", `M${f(tank.x)} ${f(tank.y)}L${f(hx)} ${f(hy)}`);
    q("lid").setAttribute("transform", `rotate(${f(((ang - tank.h) * 180) / Math.PI)})`);
    q("tank").setAttribute("transform", `translate(${f(tank.x)} ${f(tank.y)}) rotate(${f((tank.h * 180) / Math.PI)})`);
    q("goal").setAttribute("transform", `translate(${f(goal[0])} ${f(goal[1])})`);
  };
};
export function FigTank() {
  const r = useFig(makeTank);
  return (
    <Box r={r} label="A drawn tank robot drives round obstacles with lidar rays" hint="the lidar turns and marks the walls. your pointer steers the tank">
      <path className="ray fan" data-a="fan" /><path className="ray" data-a="rays" />
      <g className="wobg">
        <path className="k" d="M22 22H458V228H22z" />
        {OBS.map(([x, y, rr]) => <circle key={x} className="k b" cx={x} cy={y} r={rr} />)}
        <path className="k t" data-a="goal" d="M-6 -6L6 6M6 -6L-6 6" />
      </g>
      {[1, 0.7, 0.45, 0.22].map((o, i) => <path key={i} className="hit" data-a={`h${i}`} style={{ opacity: o }} />)}
      <g data-a="tank" className="wobg">
        <rect className="k w" x="-17" y="-11" width="34" height="22" rx="3" />
        <path className="k" d="M-19 -15H19M-19 15H19" style={{ strokeWidth: 5 }} />
        <path className="k t" d="M9 0H17" /><circle className="k b" r="6.5" /><path className="k t" data-a="lid" d="M0 0H6.5" />
      </g>
    </Box>
  );
}

/* 3. A drone in the sky makes the three sensor signals rise. */
const makeSentinel: Make = (svg, ptr) => {
  const q = get(svg), drone = { x: 136, y: 110 };
  let p = 0;
  const rows = [60, 125, 190];
  return (t, dt) => {
    const inSky = ptr.inside && ptr.x > 30 && ptr.x < 242 && ptr.y > 30 && ptr.y < 220;
    const gx = ptr.inside ? ptr.x : 136 + 170 * Math.sin(t / 2600), gy = ptr.inside ? ptr.y : 112 + 52 * Math.sin(t / 1700);
    const k = Math.min(1, dt / 260);
    drone.x += (gx - drone.x) * k; drone.y += (gy - drone.y) * k;
    const here = ptr.inside ? inSky : drone.x > 40 && drone.x < 232;
    p += ((here ? 1 : 0) - p) * Math.min(1, dt / 320);
    const d = q("drone");
    d.setAttribute("transform", `translate(${f(clamp(drone.x, 44, 228))} ${f(clamp(drone.y, 44, 206))}) rotate(${f(6 * Math.sin(t / 300))})`);
    d.style.opacity = f(clamp(p * 1.4, 0, 1));
    rows.forEach((y, r) => {
      let path = "";
      for (let i = 0; i <= 44; i++) {
        const x = 290 + i * 3.75, u = t / 1000;
        const sig = r === 0 ? Math.sign(Math.sin(i * 0.5 + u * 3)) * 0.8 : r === 1 ? Math.sin(i * 1.7 + u * 9) * Math.sin(i * 0.2 + u) : Math.sin(i * 0.8 + u * 5) * (0.5 + 0.5 * Math.sin(i * 0.15 - u * 2));
        const noise = Math.sin(i * 12.9 + r * 7 + Math.floor(u * 8) * 3.1) * 1.6;
        path += `${i ? "L" : "M"}${f(x)} ${f(y + noise + p * 15 * sig)}`;
      }
      q(`w${r}`).setAttribute("d", path);
    });
    q("tick").style.opacity = p > 0.5 ? "1" : "0";
    q("verdict").textContent = p > 0.5 ? "drone: yes" : "drone: no";
  };
};
export function FigSentinel() {
  const r = useFig(makeSentinel);
  return (
    <Box r={r} label="A drawn drone in the sky makes camera, RF and audio signals rise" hint="move your pointer into the sky to fly the drone">
      <g className="wobg">
        <path className="k" d="M22 22H250V228H22z" />
        <path className="k t" d="M44 196c14-12 26-12 38 0s26 12 38 0M150 58c8-10 22-10 28 0 12-4 22 6 16 16h-52c-8-6-2-18 8-16z" />
        <g data-a="drone">
          <ellipse className="k b" rx="13" ry="8" /><path className="k" d="M-13 -3L-27 -11M13 -3L27 -11M-36 -12h18M18 -12h18M-7 8l-4 8M7 8l4 8" />
        </g>
        <path className="k t" data-a="w0" /><path className="k t" data-a="w1" /><path className="k t" data-a="w2" />
        <path className="k t" d="M290 224h14v14h-14z" /><path className="k" data-a="tick" d="M292 230l5 6 10-14" />
      </g>
      <text x="290" y="36">camera</text><text x="290" y="101">rf</text><text x="290" y="166">audio</text>
      <text x="316" y="236" data-a="verdict">drone: no</text><text x="34" y="42">sky</text>
    </Box>
  );
}

/* 4. The clay ball hops through the four steps of the engine. */
const STEPS = ["script", "check", "voice", "video"];
const makeClay: Make = (svg, ptr) => {
  const q = get(svg), X = [75, 185, 295, 405], TOP = 110;
  let at = 0, to = 0, u = 1, wait = 0, land = 1;
  return (_t, dt) => {
    if (ptr.click) { ptr.click = null; if (u >= 1) wait = 1e6; }
    if (u < 1) {
      u = Math.min(1, u + dt / (to === 0 ? 900 : 600));
      if (u >= 1) { at = to; land = 0; wait = 0; }
    } else {
      wait += dt; land = Math.min(1, land + dt / 180);
      if (wait > (at === 3 ? 1700 : 800)) { to = (at + 1) % 4; u = 0; }
    }
    const x = u < 1 ? X[at] + (X[to] - X[at]) * u : X[at];
    const y = u < 1 ? TOP - (to === 0 ? 70 : 46) * Math.sin(Math.PI * u) : TOP;
    const sq = u < 1 ? 0 : Math.sin(Math.PI * land) * 0.28;
    q("ball").setAttribute("transform", `translate(${f(x)} ${f(y + sq * 13)}) scale(${f(1 + sq)} ${(1 - sq).toFixed(2)})`);
    STEPS.forEach((_, i) => { q(`t${i}`).style.opacity = (u < 1 && to === 0 ? false : i <= at) ? "1" : "0"; });
  };
};
export function FigClay() {
  const r = useFig(makeClay);
  return (
    <Box r={r} label="A drawn clay ball hops through the steps script, check, voice and video" hint="click to send the clay ball to the next step">
      <g className="wobg">
        {[75, 185, 295, 405].map((x, i) => (
          <g key={x}>
            <path className="k" d={`M${x - 40} 123h80v54h-80z`} />
            {i < 3 && <path className="k t" d={`M${x + 46} 150h18m-6-5l6 5-6 5`} />}
            <path className="k" data-a={`t${i}`} d={`M${x - 10} 200l7 8 14-18`} />
          </g>
        ))}
        <g data-a="ball"><circle className="k b" r="13" /><circle className="i" cx="-4.5" cy="-2" r="1.8" /><circle className="i" cx="4.5" cy="-2" r="1.8" /></g>
      </g>
      {STEPS.map((s, i) => <text key={s} x={[75, 185, 295, 405][i]} y="154" textAnchor="middle">{s}</text>)}
    </Box>
  );
}

/* 5. Linked notes that move away from the pointer. */
const N = [[60, 60], [130, 120], [70, 180], [190, 50], [220, 150], [160, 205], [280, 95], [300, 200], [340, 40], [370, 140], [420, 85], [430, 195], [250, 30], [110, 30]];
const E = [[0, 1], [1, 2], [1, 3], [1, 4], [2, 5], [4, 5], [3, 6], [4, 6], [6, 8], [6, 9], [4, 7], [7, 9], [9, 10], [9, 11], [8, 10], [3, 12], [12, 8], [0, 13], [13, 3], [7, 11]];
const makeGraph: Make = (svg, ptr) => {
  const q = get(svg), nodes = [...svg.querySelectorAll<SVGCircleElement>("[data-n]")];
  const p = N.map(([x, y]) => ({ x, y, vx: 0, vy: 0 }));
  return (t, dt) => {
    const s = dt / 1000;
    let near = -1, best = 70;
    p.forEach((n, i) => {
      const hx = N[i][0] + 5 * Math.sin(t / 1300 + i * 1.7), hy = N[i][1] + 5 * Math.cos(t / 1700 + i * 2.3);
      let ax = (hx - n.x) * 26, ay = (hy - n.y) * 26;
      if (ptr.inside) {
        const dx = n.x - ptr.x, dy = n.y - ptr.y, d = Math.hypot(dx, dy) || 1;
        if (d < best) { best = d; near = i; }
        if (d < 90) { ax += (dx / d) * (90 - d) * 30; ay += (dy / d) * (90 - d) * 30; }
      }
      n.vx = (n.vx + ax * s) * 0.9; n.vy = (n.vy + ay * s) * 0.9;
      n.x = clamp(n.x + n.vx * s, 16, 464); n.y = clamp(n.y + n.vy * s, 16, 234);
    });
    q("edges").setAttribute("d", E.map(([a, b]) => `M${f(p[a].x)} ${f(p[a].y)}L${f(p[b].x)} ${f(p[b].y)}`).join(""));
    nodes.forEach((c, i) => {
      c.setAttribute("cx", f(p[i].x)); c.setAttribute("cy", f(p[i].y));
      c.setAttribute("r", i === near ? "12" : i % 4 === 1 ? "9" : "6.5"); c.classList.toggle("b", i === near || i % 4 === 1);
    });
  };
};
export function FigGraph() {
  const r = useFig(makeGraph);
  return (
    <Box r={r} label="A drawn graph of linked notes that moves away from the pointer" hint="move your pointer over the notes">
      <g className="wobg">
        <path className="k t" data-a="edges" />
        {N.map(([x, y], i) => <circle key={i} data-n="" className="k w" cx={x} cy={y} r="6.5" />)}
      </g>
    </Box>
  );
}

/* 6. Two RF spectrograms (waterfalls). Time moves down (new rows appear at the top). A drone link shows as
      short hopping bursts, and the model output changes to "yes". */
const COLS = 24, ROWS = 14, PX = [22, 254], PY = 36, CW = 8.5, CH = 11.7;
const makeSpectro: Make = (svg, ptr) => {
  const q = get(svg), cells = [...svg.querySelectorAll<SVGRectElement>("[data-c]")];
  const grid = PX.map(() => Array.from({ length: ROWS }, () => new Array<number>(COLS).fill(0)));
  const wifi = [{ left: 0, col: 4 }, { left: 0, col: 12 }];
  let acc = 1e9, seen = 0, since = 0;
  const paint = () => cells.forEach((c, i) => {
    const v = grid[Math.floor(i / (ROWS * COLS))][Math.floor(i / COLS) % ROWS][i % COLS];
    c.style.fill = v > 0.62 ? "var(--ink)" : "var(--blue)"; c.style.opacity = (v > 0.62 ? 0.9 : Math.min(1, v * 1.7)).toFixed(2);
  });
  return (t, dt) => {
    acc += dt; seen = Math.max(0, seen - dt);
    if (acc < 110) return;
    acc = 0;
    // Which band has a drone now: the band under the pointer, or one band from time to time.
    const inY = ptr.inside && ptr.y > PY - 6 && ptr.y < PY + ROWS * CH + 6;
    let band = -1, centre = 12;
    if (ptr.inside) since = t;
    if (ptr.inside) { PX.forEach((x, b) => { if (inY && ptr.x > x && ptr.x < x + COLS * CW) { band = b; centre = Math.floor((ptr.x - x) / CW); } }); }
    else {
      // With no pointer, a drone comes by itself. The cycle starts again from a quiet part each time the
      // pointer leaves, so the picture does not change at the moment the pointer goes away.
      const u = ((t - since) / 1000) % 9;
      if (u > 4.5 && u < 8) { band = Math.floor((t - since) / 9000) % 2; centre = 7 + Math.round(5 * (1 + Math.sin(t / 2100))); }
    }
    grid.forEach((g, b) => {
      const row = Array.from({ length: COLS }, () => 0.09 + Math.random() * 0.17);
      const w = wifi[b];
      if (w.left > 0) { w.left--; for (let c = w.col; c < w.col + 6 && c < COLS; c++) row[c] = 0.36 + Math.random() * 0.12; }
      else if (Math.random() < (b ? 0.03 : 0.07)) { w.left = 3 + Math.floor(Math.random() * 5); w.col = Math.floor(Math.random() * (COLS - 6)); }
      if (b === band) {
        seen = 900;
        for (let n = 0; n < 2; n++) { const c = clamp(centre + Math.round((Math.random() - 0.5) * 12), 0, COLS - 2); row[c] = 1; row[c + 1] = 0.9; }
      }
      g.pop(); g.unshift(row);
    });
    paint();
    q("tick").style.opacity = seen > 0 ? "1" : "0";
    q("verdict").textContent = seen > 0 ? "drone: yes" : "drone: no";
  };
};
export function FigSpectro() {
  const r = useFig(makeSpectro);
  return (
    <Box r={r} label="Two drawn RF spectrograms, for 2.4 GHz and 5.8 GHz, with drone signals that hop" hint="move your pointer over a band to fly a drone there">
      <g className="wobg">
        {PX.map((x) => Array.from({ length: ROWS * COLS }, (_, i) => (
          <rect key={`${x}-${i}`} data-c="" x={x + (i % COLS) * CW + 0.8} y={PY + Math.floor(i / COLS) * CH + 0.8} width={CW - 1.6} height={CH - 1.6} style={{ fill: "var(--blue)", opacity: 0 }} />
        )))}
        {PX.map((x) => <path key={x} className="k" d={`M${x - 3} ${PY - 3}h${COLS * CW + 6}v${ROWS * CH + 6}h-${COLS * CW + 6}z`} />)}
        <path className="k t" d="M22 224h14v14h-14z" /><path className="k" data-a="tick" d="M24 230l5 6 10-14" />
      </g>
      <text x="22" y="24">2.4 ghz</text><text x="254" y="24">5.8 ghz</text>
      <text x="48" y="236" data-a="verdict">drone: no</text><text x="458" y="236" textAnchor="end">se-resnet-18, cpu</text>
    </Box>
  );
}
