import type { ReactNode } from "react";
import { Fragment } from "react";

function splitBold(segment: string, keyBase: string): ReactNode[] {
  const chunks = segment.split(/(\*\*[^*]+\*\*)/g);
  return chunks.map((chunk, i) => {
    const m = chunk.match(/^\*\*([^*]+)\*\*$/);
    if (m) {
      return <strong key={`${keyBase}-b-${i}`}>{m[1]}</strong>;
    }
    return <Fragment key={`${keyBase}-t-${i}`}>{splitLinks(chunk, `${keyBase}-l-${i}`)}</Fragment>;
  });
}

function splitLinks(text: string, keyBase: string): ReactNode {
  const out: ReactNode[] = [];
  let rest = text;
  let n = 0;
  while (rest.length > 0) {
    const open = rest.indexOf("[");
    if (open === -1) {
      out.push(rest);
      break;
    }
    if (open > 0) {
      out.push(rest.slice(0, open));
      rest = rest.slice(open);
      continue;
    }
    const m = rest.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/);
    if (!m) {
      out.push("[");
      rest = rest.slice(1);
      continue;
    }
    out.push(
      <a
        key={`${keyBase}-a-${n}`}
        href={m[2]}
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-2"
      >
        {m[1]}
      </a>,
    );
    rest = rest.slice(m[0].length);
    n += 1;
  }
  return out;
}

function formatLine(line: string, key: string): ReactNode {
  return splitBold(line, key);
}

export function formatNowMarkdown(text: string): ReactNode {
  const paras = text.trim().split(/\n\n+/);
  return paras.map((p, i) => (
    <p key={`p-${i}`} className="mb-4 last:mb-0 leading-relaxed">
      {p.split("\n").map((line, li) => (
        <Fragment key={`ln-${i}-${li}`}>
          {li > 0 ? <br /> : null}
          {formatLine(line, `p${i}-l${li}`)}
        </Fragment>
      ))}
    </p>
  ));
}
