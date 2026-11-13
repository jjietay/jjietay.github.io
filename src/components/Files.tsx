"use client";
import { useEffect, useRef, useState } from "react";

export type FileItem = {
  id: string;
  name: string;                 // the file name under the icon
  type: "doc" | "folder" | "film";
  meta?: string;                // a short second line
  wide?: boolean;               // a wider window, for galleries
  cover?: string;               // a picture on the card
  coverAt?: string;             // the part of the picture to show, as a CSS position
  body: React.ReactNode;        // the content of the window
};

/** A row of files. Each file opens in its own window. */
export default function Files({ items }: { items: FileItem[] }) {
  const [open, setOpen] = useState<FileItem | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open && !dlg.current!.open) dlg.current!.showModal();
  }, [open]);

  return (
    <>
      <ul className="d-files">
        {items.map((f) => (
          <li key={f.id}>
            <button type="button" onClick={() => setOpen(f)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {f.cover && <img className="cover" src={f.cover} alt="" loading="lazy" decoding="async" style={{ objectPosition: f.coverAt }} />}
              <span>{f.name}</span>
              {f.meta && <small>{f.meta}</small>}
            </button>
          </li>
        ))}
      </ul>
      {open && (
        <dialog ref={dlg} className={`d-dlg${open.wide ? " wide" : ""}`} aria-label={open.name}
          onClose={(e) => { if (e.target === dlg.current) setOpen(null); }} onClick={(e) => { if (e.target === dlg.current) dlg.current!.close(); }}>
          <header>
            <b>{open.name}</b>
            <button type="button" className="x" onClick={() => dlg.current!.close()}>[ close ]</button>
          </header>
          <div className="d-dlgbody">{open.body}</div>
        </dialog>
      )}
    </>
  );
}
