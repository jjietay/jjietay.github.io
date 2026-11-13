import { Fragment } from "react";

/** Renders text, with a highlight behind each [[marked]] phrase. */
export function T({ children }: { children: string }) {
  return (
    <>
      {children.split(/\[\[(.+?)\]\]/g).map((part, i) =>
        i % 2 ? <mark className="tape" key={i}>{part}</mark> : <Fragment key={i}>{part}</Fragment>
      )}
    </>
  );
}
