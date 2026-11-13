import { Fragment } from "react";

const NB = " "; // a space that the browser cannot break a line at

/** Joins the last words of a text, so that no word stands alone on the last line.
 *  It joins two words, or three when the last two are short (for example "at 2 Hz."). */
function noOrphan(text: string) {
  const w = text.trimEnd().split(" ");
  if (w.length < 4) return text;
  const n = (w[w.length - 1] + w[w.length - 2]).replace(/[\[\]]/g, "").length < 10 ? 3 : 2;
  return w.slice(0, -n).join(" ") + " " + w.slice(-n).join(NB);
}

/** Renders text, with a highlight behind each [[marked]] phrase. */
export function T({ children }: { children: string }) {
  return (
    <>
      {noOrphan(children).split(/\[\[(.+?)\]\]/g).map((part, i) =>
        i % 2 ? <mark className="tape" key={i}>{part}</mark> : <Fragment key={i}>{part}</Fragment>
      )}
    </>
  );
}
