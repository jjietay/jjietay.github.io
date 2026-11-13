"use client";
import { useEffect, useRef, useState } from "react";

export type Photo = { src: string; w?: number; h?: number; title?: string };
const thumb = (src: string) => src.replace("/photos/", "/photos/thumb/");

/** A wall of photos. Select one to see it large. */
export default function Gallery({ photos, label }: { photos: Photo[]; label: string }) {
  const [at, setAt] = useState<number | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const n = photos.length;

  useEffect(() => {
    if (at !== null && !dlg.current!.open) dlg.current!.showModal();
  }, [at]);

  const step = (d: number) => setAt((v) => (v === null ? v : (v + d + n) % n));
  const p = at === null ? null : photos[at];

  return (
    <>
      <ul className="d-wall">
        {photos.map((ph, k) => (
          <li key={ph.src}>
            <button type="button" onClick={() => setAt(k)} aria-label={`Open photo ${k + 1} of ${n}, ${ph.title ?? label}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb(ph.src)} width={ph.w} height={ph.h} alt={ph.title ?? `${label}, photo ${k + 1}`} loading="lazy" decoding="async" />
              {ph.title && <span>{ph.title}</span>}
            </button>
          </li>
        ))}
      </ul>
      {p && (
        <dialog ref={dlg} className="d-zoom" aria-label={`${label}, photo ${at! + 1} of ${n}`} onClose={(e) => { e.stopPropagation(); setAt(null); }}
          onClick={(e) => { if (e.target === dlg.current) dlg.current!.close(); }}
          onKeyDown={(e) => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={p.src} src={p.src} width={p.w} height={p.h} alt={p.title ?? `${label}, photo ${at! + 1}`} />
          <div className="d-zoombar">
            <button type="button" onClick={() => step(-1)}>Back</button>
            <span>{p.title ? `${p.title}, ` : ""}{at! + 1} of {n}</span>
            <button type="button" onClick={() => step(1)}>Next</button>
            <button type="button" onClick={() => dlg.current!.close()}>Close</button>
          </div>
        </dialog>
      )}
    </>
  );
}
