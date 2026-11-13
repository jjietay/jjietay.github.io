"use client";
// Edit mode for the first screen. Open the home page with "?edit" at the end of
// the address. Then you can drag each drawing, the note and the arm, turn them
// with the mouse wheel, and save the positions to a file.
import { useEffect, useState } from "react";
import layout from "@/content/hero-layout.json";

type Pos = { dx: number; dy: number; rot: number; scale: number };
const KEY = "hero-layout-3";
const DEF = layout as Record<string, Pos>;
const zero = (): Pos => ({ dx: 0, dy: 0, rot: 0, scale: 1 });

export default function Arrange() {
  const [on, setOn] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!new URLSearchParams(location.search).has("edit")) return;
    setOn(true);
    const hero = document.querySelector<HTMLElement>(".hero")!;
    const items = [...hero.querySelectorAll<HTMLElement | SVGElement>("[data-mv]")];
    const saved: Record<string, Pos> = JSON.parse(localStorage.getItem(KEY) || "{}");
    const base = new Map(items.map((el) => [el, (parseFloat(getComputedStyle(el).rotate) || 0) - (DEF[el.dataset.mv!]?.rot ?? 0)]));
    const pos = new Map(items.map((el) => [el, { ...zero(), ...DEF[el.dataset.mv!], ...saved[el.dataset.mv!] }]));
    hero.classList.add("editing");

    const apply = (el: HTMLElement | SVGElement) => {
      const p = pos.get(el)!, w = hero.clientWidth, h = hero.clientHeight;
      el.style.translate = `${(p.dx / 100) * w}px ${(p.dy / 100) * h}px`;
      el.style.rotate = `${base.get(el)! + p.rot}deg`;
      el.style.scale = String(p.scale);
    };
    const report = () => {
      const out: Record<string, Pos> = {};
      items.forEach((el) => {
        const p = pos.get(el)!;
        out[el.dataset.mv!] = { dx: +p.dx.toFixed(2), dy: +p.dy.toFixed(2), rot: +p.rot.toFixed(1), scale: +p.scale.toFixed(2) };
      });
      localStorage.setItem(KEY, JSON.stringify(out));
      setText(JSON.stringify({ screen: [innerWidth, innerHeight], hero: [hero.clientWidth, hero.clientHeight], items: out }, null, 1));
    };
    items.forEach(apply); report();

    const offs = items.map((el) => {
      let start: { x: number; y: number; dx: number; dy: number } | null = null;
      const down = (e: Event) => {
        const ev = e as PointerEvent, p = pos.get(el)!;
        ev.preventDefault(); ev.stopPropagation();
        start = { x: ev.clientX, y: ev.clientY, dx: p.dx, dy: p.dy };
        el.setPointerCapture(ev.pointerId);
      };
      const move = (e: Event) => {
        if (!start) return;
        const ev = e as PointerEvent, p = pos.get(el)!;
        p.dx = start.dx + ((ev.clientX - start.x) / hero.clientWidth) * 100;
        p.dy = start.dy + ((ev.clientY - start.y) / hero.clientHeight) * 100;
        apply(el);
      };
      const up = () => { if (start) { start = null; report(); } };
      const wheel = (e: Event) => {
        const ev = e as WheelEvent, p = pos.get(el)!;
        ev.preventDefault();
        if (ev.shiftKey) p.scale = Math.min(3, Math.max(0.3, p.scale * (ev.deltaY + ev.deltaX < 0 ? 1.05 : 0.95)));
        else p.rot += ev.deltaY < 0 ? 3 : -3;
        apply(el); report();
      };
      const stop = (e: Event) => e.preventDefault();
      el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
      el.addEventListener("wheel", wheel, { passive: false }); el.addEventListener("click", stop, true);
      return () => {
        el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
        el.removeEventListener("wheel", wheel); el.removeEventListener("click", stop, true);
      };
    });
    const resize = () => items.forEach(apply);
    addEventListener("resize", resize);
    const reset = () => { items.forEach((el) => { pos.set(el, { ...zero(), ...DEF[el.dataset.mv!] }); apply(el); }); report(); };
    document.addEventListener("hero-reset", reset);
    return () => { offs.forEach((f) => f()); removeEventListener("resize", resize); document.removeEventListener("hero-reset", reset); hero.classList.remove("editing"); };
  }, []);

  if (!on) return null;
  const save = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    a.download = "hero-layout.json"; a.click(); URL.revokeObjectURL(a.href);
  };
  return (
    <aside className="arrange">
      <b>edit mode</b>
      <p>Drag a part to move it. Wheel: turn. Shift + wheel: size.</p>
      <div>
        <button type="button" onClick={save}>save to file</button>
        <button type="button" onClick={() => navigator.clipboard.writeText(text)}>copy</button>
        <button type="button" onClick={() => document.dispatchEvent(new Event("hero-reset"))}>reset</button>
      </div>
    </aside>
  );
}
