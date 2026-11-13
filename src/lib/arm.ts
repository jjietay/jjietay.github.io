// A planar model of the UR5e, drawn side-on. Units are SVG px in the arm's
// own frame: origin at the centre of the base on the bench, y points down.
// 425 mm upper arm and 392 mm forearm, at 192 px per 425 mm.
export const ARM = { L1: 192, L2: 176, L3: 36, SY: -52, MM: 425 / 192 };

export type ArmState = {
  x: number; y: number;   // commanded tool point
  phi: number;            // tool direction, degrees (90 = straight down)
  grip: number;           // 0 = closed on the block, 1 = open
  held: number;           // 1 while the block is in the gripper
  bx: number; by: number; // block position when it is not held
};

export const HOME: ArmState = { x: 150, y: -150, phi: 70, grip: 1, held: 0, bx: 150, by: -11 };

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export function solve(s: Pick<ArmState, "x" | "y" | "phi">) {
  const { L1, L2, L3, SY } = ARM;
  const ph = rad(s.phi);
  let wx = s.x - L3 * Math.cos(ph);
  let wy = s.y - SY - L3 * Math.sin(ph);
  let d = Math.hypot(wx, wy) || 1;
  const max = L1 + L2 - 2, min = Math.abs(L1 - L2) + 24;
  const lim = Math.min(Math.max(d, min), max);
  wx *= lim / d; wy *= lim / d; d = lim;
  const a2 = Math.acos(Math.min(1, Math.max(-1, (d * d - L1 * L1 - L2 * L2) / (2 * L1 * L2))));
  const a1 = Math.atan2(wy, wx) - Math.atan2(L2 * Math.sin(a2), L1 + L2 * Math.cos(a2));
  const a3 = ph - a1 - a2;
  const ex = L1 * Math.cos(a1), ey = SY + L1 * Math.sin(a1);
  return { a1, a2, a3, ex, ey, tx: wx + L3 * Math.cos(ph), ty: wy + SY + L3 * Math.sin(ph) };
}

export const arc = (cx: number, cy: number, r: number, from: number, to: number) => {
  const x1 = cx + r * Math.cos(from), y1 = cy + r * Math.sin(from);
  const x2 = cx + r * Math.cos(to), y2 = cy + r * Math.sin(to);
  const large = Math.abs(to - from) > Math.PI ? 1 : 0;
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${r} ${r} 0 ${large} ${to > from ? 1 : 0} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
};

/** Finds the arm parts under `root` once, and returns a function that draws a state. */
export function createArm(root: Element) {
  const q = <T extends Element = SVGElement>(sel: string) => root.querySelector<T>(sel);
  const j1 = q('[data-j="1"]'), j2 = q('[data-j="2"]'), j3 = q('[data-j="3"]');
  const fa = q('[data-f="a"]'), fb = q('[data-f="b"]');
  const arc1 = q('[data-arc="1"]'), arc2 = q('[data-arc="2"]');
  const lab1 = q('[data-lab="1"]'), lab2 = q('[data-lab="2"]');
  const block = q("[data-block]");
  const ro = (k: string) => q<HTMLElement>(`[data-ro="${k}"]`);
  const r1 = ro("j1"), r2 = ro("j2"), r3 = ro("j3"), rx = ro("x"), rz = ro("z");
  const { L1, L2, SY, MM } = ARM;

  return (s: ArmState) => {
    const k = solve(s);
    j1?.setAttribute("transform", `translate(0 ${SY}) rotate(${deg(k.a1).toFixed(2)})`);
    j2?.setAttribute("transform", `translate(${L1} 0) rotate(${deg(k.a2).toFixed(2)})`);
    j3?.setAttribute("transform", `translate(${L2} 0) rotate(${deg(k.a3).toFixed(2)})`);
    const g = 11 + s.grip * 8;
    fa?.setAttribute("y", (-g - 4).toFixed(1));
    fb?.setAttribute("y", g.toFixed(1));

    // Angle dimensions that follow the joints.
    arc1?.setAttribute("d", arc(0, SY, 36, 0, k.a1));
    arc2?.setAttribute("d", arc(k.ex, k.ey, 30, k.a1, k.a1 + k.a2));
    const m1 = k.a1 / 2, m2 = k.a1 + k.a2 / 2;
    if (lab1) { lab1.setAttribute("x", (54 * Math.cos(m1)).toFixed(1)); lab1.setAttribute("y", (SY + 54 * Math.sin(m1) + 3).toFixed(1)); lab1.textContent = `${(-deg(k.a1)).toFixed(0)}°`; }
    if (lab2) { lab2.setAttribute("x", (k.ex + 46 * Math.cos(m2)).toFixed(1)); lab2.setAttribute("y", (k.ey + 46 * Math.sin(m2) + 3).toFixed(1)); lab2.textContent = `${deg(k.a2).toFixed(0)}°`; }

    const bx = s.held > 0.5 ? k.tx : s.bx, by = s.held > 0.5 ? k.ty : s.by;
    block?.setAttribute("transform", `translate(${bx.toFixed(1)} ${by.toFixed(1)})`);

    if (r1) r1.textContent = (-deg(k.a1)).toFixed(1).padStart(6, " ") + "°";
    if (r2) r2.textContent = deg(k.a2).toFixed(1).padStart(6, " ") + "°";
    if (r3) r3.textContent = deg(k.a3).toFixed(1).padStart(6, " ") + "°";
    if (rx) rx.textContent = (k.tx * MM).toFixed(0).padStart(4, " ");
    if (rz) rz.textContent = (-k.ty * MM).toFixed(0).padStart(4, " ");
  };
}
