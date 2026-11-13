// Reads the contact sheet selection and makes web-size copies of the chosen
// photos in public/photos/client, plus src/content/photos.json for the site.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = "/home/jj/Documents/Freelance";
const selection = process.argv[2] || "/home/jj/Downloads/photo-selection.txt";

// Source folder prefix -> the shoot it belongs to on the site.
const SHOOTS = [
  ["WEDDING - GABRIEL & YL", "Weddings", "Gabriel & YL", "gabriel-yl"],
  ["ROM - BQ & A", "Weddings", "BQ & A", "bq-a"],
  ["YERA", "Brands", "YERA", "yera"],
  ["YE TRADITION", "Brands", "YE Tradition", "ye-tradition"],
  ["PR Salon", "Brands", "PR Salon", "pr-salon"],
  ["ACAI SPOT", "Brands", "Acai Spot", "acai-spot"],
  ["ABCC", "Events", "ABCC", "abcc"],
  ["PACIFIC LICENSING", "Events", "Pacific Licensing", "pacific-licensing"],
  ["NTU EFINITY", "Events", "NTU Efinity", "ntu-efinity"],
  ["NTU UOC Bash", "Events", "NTU UOC Bash", "ntu-uoc-bash"],
];

const paths = readFileSync(selection, "utf8").split("\n").filter(Boolean);
const shoots = SHOOTS.map(([prefix, group, name, slug]) => ({ prefix, group, name, slug, photos: [] }));
const jobs = [];
for (const p of paths) {
  const s = shoots.find((x) => p.startsWith(x.prefix + "/"));
  if (!s) { console.warn("no shoot for", p); continue; }
  const file = `${String(s.photos.length + 1).padStart(2, "0")}.webp`;
  s.photos.push({ src: `/photos/client/${s.slug}/${file}` });
  jobs.push({ from: join(SRC, p), to: join(root, "public/photos/client", s.slug, file), photo: s.photos.at(-1) });
}

rmSync(join(root, "public/photos/client"), { recursive: true, force: true });
for (const s of shoots) if (s.photos.length) mkdirSync(join(root, "public/photos/client", s.slug), { recursive: true });

let next = 0;
async function worker() {
  while (next < jobs.length) {
    const j = jobs[next++];
    await run("convert", [j.from, "-auto-orient", "-resize", "1800x1800>", "-quality", "80", j.to]);
    const { stdout } = await run("identify", ["-format", "%w %h", j.to]);
    [j.photo.w, j.photo.h] = stdout.trim().split(" ").map(Number);
  }
}
await Promise.all(Array.from({ length: 8 }, worker));

const out = shoots.filter((s) => s.photos.length).map(({ group, name, slug, photos }) => ({ group, name, slug, photos }));
writeFileSync(join(root, "src/content/photos.json"), JSON.stringify(out, null, 1) + "\n");
console.log(out.map((s) => `${s.photos.length}\t${s.group}\t${s.name}`).join("\n"));
