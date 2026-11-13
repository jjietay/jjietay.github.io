import Link from "next/link";
import Arrange from "@/components/Arrange";
import { ArmArt } from "@/components/Art";
import { FigClay, FigGraph, FigSentinel, FigSpectro, FigTank, FigVla } from "@/components/Figs";
import Props from "@/components/Props";
import Skills from "@/components/Skills";
import { Arrow, Coil, Nav, Plus, Star, Zig, mv } from "@/components/Sketch";
import { T } from "@/components/Tape";
import { experience, person, projects } from "@/content/site";
import { resume } from "@/content/resume";

const FIGS: Record<string, React.ReactNode> = {
  "P-01": <FigVla />, "P-02": <FigTank />, "P-03": <FigSentinel />, "P-04": <FigClay />, "P-05": <FigGraph />,
};
const anchor = (id: string) => id.toLowerCase();

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Props />
        <section className="hero">
          <div className="hero-l">
            <h1 {...mv("heading")}><mark>robotics and ai</mark><br />for real robots</h1>
            <p className="sub" {...mv("sub")}>I build embodied AI for real robots.<br />Final-year EEE at NTU.</p>
            <a className="lnk" href="#projects" {...mv("link")}>[ see the projects ]</a>
            <div className="armwrap" {...mv("arm")}><ArmArt /></div>
          </div>
          <div className="hero-r">
          <div className="note pinned" {...mv("note")}>
            <i className="pin" />
            <b>projects</b>
            <ol className="leaders">
              {projects.map((p) => <li key={p.id}><a href={`#${anchor(p.id)}`}><span>{p.title}</span><em>{p.kind}</em></a></li>)}
            </ol>
            <b>experience</b>
            <ol className="leaders">
              <li><a href="#experience"><span>{experience.role}</span><em>{experience.org.split(",")[0]}</em></a></li>
            </ol>
            <b>more</b>
            <p><Link href="/resume">resume</Link>, <Link href="/creative">creative</Link></p>
          </div>
          <Star />
          </div>
          <Arrow c="main" /><Coil c="c1" />
          <Arrange />
        </section>

        <section className="sec" id="projects">
          <h2><mark>projects</mark></h2><Arrow c="down" /><Plus c="sp" />
          {projects.map((p) => (
            <article className="proj" key={p.id} id={anchor(p.id)}>
              <header>
                <h3>{p.title}</h3>
                <p className="meta">{p.kind}. {p.when}</p>
                <ul className="tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
              </header>
              <div>
                <p><T>{p.text}</T></p>
                {FIGS[p.id]}
                {p.href && <a className="lnk" href={p.href} target="_blank" rel="noreferrer">[ {p.linkLabel} ]</a>}
              </div>
            </article>
          ))}
        </section>

        <section className="sec" id="experience">
          <h2><mark>experience</mark></h2><Coil c="sc" />
          <article className="proj">
            <header>
              <h3>{experience.role}</h3>
              <p className="meta">{experience.org}. {experience.when}</p>
            </header>
            <div>
              <ul className="checks">{experience.points.map((x) => <li key={x}><T>{x}</T></li>)}</ul>
              <FigSpectro />
            </div>
          </article>
        </section>

        <section className="sec" id="skills">
          <h2><mark>skills</mark></h2><Star c="ss" />
          <Skills />
          <dl className="skills">{resume.skills.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </section>

        <section className="sec" id="contact">
          <h2><mark>contact</mark></h2><Zig c="sz" /><Arrow c="toc" />
          <div className="note contact">
            <p>Write to <a href={`mailto:${person.email}`}>{person.email}</a>.</p>
            <p><a href={person.github} target="_blank" rel="noreferrer">GitHub</a>, <a href={person.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>, <a href={person.knowledge} target="_blank" rel="noreferrer">Knowledge Space</a>, <Link href="/resume">resume</Link></p>
          </div>
        </section>
      </main>
    </>
  );
}
