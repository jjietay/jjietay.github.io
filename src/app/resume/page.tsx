import type { Metadata } from "next";
import { Nav } from "@/components/Sketch";
import { T } from "@/components/Tape";
import { person } from "@/content/site";
import { resume } from "@/content/resume";

export const metadata: Metadata = { title: "Resume" };

const SECTIONS = ["profile", "skills", "experience", "projects", "education", "more"];

type Item = { title: string; org: string; when: string; points: string[] };

function Entry({ item }: { item: Item }) {
  return (
    <div className="res-item">
      <h3>{item.title}</h3>
      <div className="res-meta"><span>{item.org}</span><span>{item.when}</span></div>
      <ul>{item.points.map((p) => <li key={p}><T>{p}</T></li>)}</ul>
    </div>
  );
}

export default function ResumePage() {
  return (
    <>
      <Nav here="resume" />
      <main>
        <div className="res">
          <header className="res-top">
            <h1><mark>{person.name}</mark></h1>
            <p>{resume.headline}. Singapore.</p>
          </header>
        <article className="res-sheet">

          <section className="res-sec" id="profile"><h2>Profile</h2><p><T>{resume.profile}</T></p></section>
          <section className="res-sec" id="skills">
            <h2>Skills</h2>
            <dl>{resume.skills.map(([k, v]) => <div key={k} style={{ display: "contents" }}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </section>
          <section className="res-sec" id="experience"><h2>Experience</h2><div>{resume.experience.map((e) => <Entry key={e.title} item={e} />)}</div></section>
          <section className="res-sec" id="projects"><h2>Projects</h2><div>{resume.projects.map((e) => <Entry key={e.title} item={e} />)}</div></section>
          <section className="res-sec" id="education"><h2>Education</h2><div><Entry item={resume.education} /></div></section>
          <section className="res-sec" id="more">
            <h2>More</h2>
            <dl>{resume.more.map(([k, v]) => <div key={k} style={{ display: "contents" }}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </section>
        </article>
        <aside className="res-note">
          <b>contact</b>
          <p><a href={`mailto:${person.email}`}>{person.email}</a></p>
          <p><a href={person.linkedin} target="_blank" rel="noreferrer">linkedin</a>, <a href={person.github} target="_blank" rel="noreferrer">github</a>, <a href={person.knowledge} target="_blank" rel="noreferrer">knowledge space</a></p>
          <b>file</b>
          <p><a href={person.resumePdf} target="_blank" rel="noreferrer">[ open the pdf ]</a></p>
          <b>on this page</b>
          <ol className="leaders">{SECTIONS.map((x) => <li key={x}><a href={`#${x}`}><span>{x}</span></a></li>)}</ol>
        </aside>
        </div>
      </main>
    </>
  );
}
