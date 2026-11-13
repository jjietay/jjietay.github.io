"use client";
// The lists in the notes have a small square box before each link. When a link
// brings the screen to its section, the box gets a tick, and the tick stays.
import { useEffect } from "react";

export default function Checks() {
  useEffect(() => {
    const tick = (hash: string) =>
      document.querySelectorAll<HTMLAnchorElement>(".leaders a").forEach((a) => { if (a.hash === hash) a.classList.add("done"); });
    if (location.hash) tick(location.hash);
    let wait = 0;
    const click = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>(".leaders a");
      if (!a || !a.hash) return;
      // Tick when the screen stops at the section. The timer is for browsers without the scrollend event, and for a section that is already in place.
      const done = () => { clearTimeout(wait); removeEventListener("scrollend", done); tick(a.hash); };
      clearTimeout(wait);
      addEventListener("scrollend", done, { once: true });
      wait = window.setTimeout(done, 900);
    };
    document.addEventListener("click", click);
    return () => { document.removeEventListener("click", click); clearTimeout(wait); };
  }, []);
  return null;
}
