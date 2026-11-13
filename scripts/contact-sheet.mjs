// Builds .contact-sheet/index.html from the thumbnails made by thumbs.sh.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", ".contact-sheet");
const paths = readFileSync(join(dir, "list.txt"), "utf8").split("\n").filter(Boolean);
const groups = new Map();
for (const p of paths) {
  const thumb = createHash("md5").update(p).digest("hex").slice(0, 16) + ".jpg";
  if (!existsSync(join(dir, "thumbs", thumb))) continue;
  const g = p.slice(2, p.lastIndexOf("/"));
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push({ p: p.slice(2), thumb });
}
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const body = [...groups].map(([g, items]) => `
<section data-group="${esc(g)}">
  <h2>${esc(g)} <small><b class="n">0</b> of ${items.length} chosen</small></h2>
  <div class="grid">${items.map((i) => `<button type="button" data-p="${esc(i.p)}" title="${esc(i.p)}"><img loading="lazy" src="thumbs/${i.thumb}" alt=""></button>`).join("")}</div>
</section>`).join("");

writeFileSync(join(dir, "index.html"), `<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Photo contact sheet</title>
<style>
  body { margin: 0; font: 14px/1.4 system-ui, sans-serif; background: #1b1512; color: #f4ecdd; }
  header { position: sticky; top: 0; z-index: 2; display: flex; flex-wrap: wrap; gap: 12px 20px; align-items: center; padding: 14px 20px; background: #2a1a12; border-bottom: 1px solid #7a2e17; }
  header p { margin: 0; flex: 1 1 320px; }
  header button { font: inherit; font-weight: 600; padding: 9px 16px; border: 0; border-radius: 99px; background: #e2532b; color: #fff; cursor: pointer; }
  header button.plain { background: none; border: 1px solid #f4ecdd; color: inherit; }
  section { padding: 22px 20px 6px; }
  h2 { margin: 0 0 12px; font-size: 20px; } h2 small { font-weight: 400; opacity: .7; margin-left: 10px; font-size: 13px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 8px; }
  .grid button { padding: 0; border: 0; background: #000; cursor: pointer; position: relative; aspect-ratio: 1; }
  .grid img { width: 100%; height: 100%; object-fit: contain; display: block; }
  .grid button[aria-pressed="true"] { outline: 4px solid #e2532b; outline-offset: -4px; }
  .grid button[aria-pressed="true"]::after { content: "✓"; position: absolute; top: 6px; right: 6px; width: 26px; height: 26px; border-radius: 50%; background: #e2532b; color: #fff; font-weight: 700; line-height: 26px; }
  textarea { width: 100%; height: 140px; margin-top: 10px; }
  dialog { max-width: 720px; width: 90vw; }
</style>
<header>
  <p>Click each photo that you want on the website. Aim for 3 to 8 for each folder. Your choices stay saved in this browser. <b id="total">0</b> chosen.</p>
  <button id="save" type="button">Save selection file</button>
  <button id="show" type="button" class="plain">Show as text</button>
  <button id="clear" type="button" class="plain">Clear all</button>
</header>
${body}
<dialog id="dlg"><p>Copy this text and paste it to Claude.</p><textarea id="txt" readonly></textarea><form method="dialog"><button>Close</button></form></dialog>
<script>
  const KEY = "contact-sheet-v1";
  let chosen = new Set(); try { chosen = new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {}
  const buttons = [...document.querySelectorAll(".grid button")];
  function paint() {
    buttons.forEach((b) => b.setAttribute("aria-pressed", chosen.has(b.dataset.p)));
    document.querySelectorAll("section").forEach((s) => { s.querySelector(".n").textContent = s.querySelectorAll('[aria-pressed="true"]').length; });
    document.getElementById("total").textContent = chosen.size;
    try { localStorage.setItem(KEY, JSON.stringify([...chosen])); } catch {}
  }
  buttons.forEach((b) => b.addEventListener("click", () => { chosen.has(b.dataset.p) ? chosen.delete(b.dataset.p) : chosen.add(b.dataset.p); paint(); }));
  const text = () => buttons.map((b) => b.dataset.p).filter((p) => chosen.has(p)).join("\\n");
  document.getElementById("save").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text() + "\\n"], { type: "text/plain" })); a.download = "photo-selection.txt"; a.click(); };
  document.getElementById("show").onclick = () => { document.getElementById("txt").value = text(); document.getElementById("dlg").showModal(); };
  document.getElementById("clear").onclick = () => { if (chosen.size && document.getElementById("clear").dataset.arm) { chosen.clear(); paint(); delete document.getElementById("clear").dataset.arm; document.getElementById("clear").textContent = "Clear all"; } else { document.getElementById("clear").dataset.arm = 1; document.getElementById("clear").textContent = "Click again to clear"; } };
  paint();
</script></html>`);
console.log([...groups].map(([g, i]) => `${i.length}\t${g}`).join("\n"));
