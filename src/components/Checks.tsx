"use client";
// The lists in the notes have a small square box before each link. When a link
// brings the screen to its section, the box gets a tick, and the tick stays.
// On the home page, the top bar also marks "projects" or "experience" while that
// section is on the screen, the same as it marks "resume" on the resume page.
import { useEffect } from "react";
import { usePathname } from "next/navigation";

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
  const path = usePathname();
  useEffect(() => {
    const pairs = [...document.querySelectorAll<HTMLAnchorElement>(".sk-nav a")]
      .map((a) => [a, a.hash && a.pathname === location.pathname ? document.getElementById(a.hash.slice(1)) : null] as const)
      .filter((x): x is readonly [HTMLAnchorElement, HTMLElement] => !!x[1]);
    if (!pairs.length) return;
    // The section in use is the last one whose top is above the middle of the screen.
    const mark = () => {
      let on: HTMLAnchorElement | null = null;
      for (const [a, sec] of pairs) if (sec.getBoundingClientRect().top < innerHeight * 0.5) on = a;
      for (const [a] of pairs) a.classList.toggle("here", a === on);
    };
    mark();
    addEventListener("scroll", mark, { passive: true });
    addEventListener("resize", mark);
    return () => { removeEventListener("scroll", mark); removeEventListener("resize", mark); for (const [a] of pairs) a.classList.remove("here"); };
  }, [path]);
  return null;
}
