import Link from "next/link";
import layout from "@/content/hero-layout.json";
import Checks from "./Checks";

/** Marks a part of the first screen as movable, and gives it the saved position.
 *  The numbers come from the edit mode (the home page address with "?edit"). */
export function mv(name: string) {
  const p = (layout as Record<string, { dx: number; dy: number; rot: number; scale: number }>)[name];
  const style = p ? ({ "--mx": `${p.dx}vw`, "--my": `calc(${p.dy / 100} * (100svh - 62px))`, "--mr": `${p.rot}deg`, "--ms": p.scale } as React.CSSProperties) : undefined;
  return { "data-mv": name, style };
}

/** The top bar. Creative is the one small entry to the photo and video page. */
export function Nav({ here }: { here?: "resume" | "creative" }) {
  return (
    <nav className="sk-nav" aria-label="Main">
      <Checks />
      <Link href="/" className="me">juen jie tay</Link>
      <Link href="/#projects">projects</Link>
      <Link href="/#experience">experience</Link>
      <Link href="/resume" aria-current={here === "resume" ? "page" : undefined}>resume</Link>
      <Link href="/creative" aria-current={here === "creative" ? "page" : undefined}>creative</Link>
    </nav>
  );
}

const D = ({ c, box, d }: { c: string; box: string; d: string }) => (
  <svg className={`doo ${c}`} {...(c.includes("mini") || c.includes("still") || c.includes("down") || c.includes("toc") || /\bs[a-z]\b/.test(c) ? {} : mv(c.trim().replace(/\s+/g, "-")))} viewBox={box} aria-hidden="true"><path d={d} /></svg>
);
export const Arrow = ({ c = "" }: { c?: string }) => <D c={`arrow ${c}`} box="0 0 120 50" d="M4 30C30 4 62 46 108 16M96 10l13 6-8 12" />;
export const Star = ({ c = "" }: { c?: string }) => <D c={`star ${c}`} box="0 0 40 40" d="M20 4v32M4 20h32M9 9l22 22M31 9L9 31" />;
export const Coil = ({ c = "" }: { c?: string }) => <D c={`coil ${c}`} box="0 0 64 40" d="M4 20c6-18 14-18 14 0s8 18 14 0 8-18 14 0 8 18 14 0" />;
export const Plus = ({ c = "" }: { c?: string }) => <D c={`plus ${c}`} box="0 0 20 20" d="M10 2v16M2 10h16" />;
export const Zig = ({ c = "" }: { c?: string }) => <D c={`zig ${c}`} box="0 0 24 44" d="M16 2L4 22h14L8 42" />;
