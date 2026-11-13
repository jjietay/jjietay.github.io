import type { Metadata } from "next";
import Link from "next/link";
import { CamArt } from "@/components/Art";
import Files, { type FileItem } from "@/components/Files";
import Gallery from "@/components/Gallery";
import { Nav, Star } from "@/components/Sketch";
import { T } from "@/components/Tape";
import { person, projects, street } from "@/content/site";
import shoots from "@/content/photos.json";

export const metadata: Metadata = {
  title: "Creative",
  description: "Photo and video by Juen Jie Tay: weddings, brands, events and the street in Singapore.",
};

const GROUPS = ["Weddings", "Brands", "Events"];
const thumb = (src: string) => src.replace("/photos/", "/photos/thumb/");
// The cover of each card is square. This is the part of each photo that the card shows.
const AT: Record<string, string> = {
  "gabriel-yl": "50% 30%", "bq-a": "50% 45%", yera: "50% 75%", "ye-tradition": "50% 40%", "pr-salon": "50% 50%", "acai-spot": "50% 50%",
  abcc: "36% 50%", "pacific-licensing": "50% 50%", "ntu-efinity": "50% 60%", "ntu-uoc-bash": "50% 50%",
};
const clay = projects.find((p) => p.id === "P-04")!;

export default function CreativePage() {
  const group = (g: string): FileItem[] => shoots.filter((s) => s.group === g).map((s) => ({
    id: s.slug, name: s.name, type: "folder", meta: `${s.photos.length} photos`, wide: true, cover: thumb(s.photos[0].src), coverAt: AT[s.slug],
    body: <Gallery photos={s.photos} label={s.name} />,
  }));
  const own: FileItem[] = [
    { id: "street", name: "Street", type: "folder", meta: `${street.length} photos`, wide: true, cover: thumb(street[0].src), coverAt: "50% 85%", body: <Gallery photos={street} label="Street" /> },
    {
      id: "vanda", name: "Atelier Vanda", type: "film", meta: "Video, 70 s", cover: "/video/atelier-vanda.webp",
      body: (
        <article className="doc film">
          <video src="/video/atelier-vanda.mp4" poster="/video/atelier-vanda.webp" controls playsInline preload="none" aria-label="Atelier Vanda intro video" />
          <div><h3>Atelier Vanda</h3><p>The intro video for Atelier v&amp;a in Singapore. It is 70 seconds long.</p></div>
        </article>
      ),
    },
    {
      id: "clay", name: clay.title, type: "doc", meta: clay.kind, cover: "/photos/clayducation-room.webp", coverAt: "42% 50%",
      body: (
        <article className="doc">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="scene" src="/photos/clayducation-room.webp" alt="A Clayducation scene: the clay mascot in a room with a tank robot, a camera and a robot arm" />
          <h3>{clay.title}</h3>
          <p className="meta">{clay.kind}. {clay.when}</p>
          <p><T>{clay.text}</T></p>
          <a className="lnk" href={clay.href} target="_blank" rel="noreferrer">[ {clay.linkLabel} ]</a>
        </article>
      ),
    },
  ];
  return (
    <>
      <Nav here="creative" />
      <main>
        <section className="hero small" data-snap="">
          <div className="hero-l">
            <h1><mark>photo and video</mark><br />for people and brands</h1>
            <p className="sub">I did freelance photo and video from Oct 2024 to Jan 2026.</p>
            <p className="sub">Open a set to see the photos.</p>
            <Link className="lnk" href="/">[ back to embodied ai ]</Link>
          </div>
          <div className="camwrap"><CamArt /><Star c="still" /></div>
        </section>
        {GROUPS.map((g) => (
          <section className="sec" key={g}><h2><mark>{g}</mark></h2><Files items={group(g)} /></section>
        ))}
        <section className="sec"><h2><mark>street, video and clayducation</mark></h2><Files items={own} /></section>
        <section className="sec">
          <h2><mark>contact</mark></h2>
          <div className="note contact"><p>I do not take bookings now. To talk about the work, write to <a href={`mailto:${person.email}`}>{person.email}</a>.</p></div>
        </section>
      </main>
    </>
  );
}
