import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const guestRoot = "file:///usr/share/undesk/web";

function offlineCss(css: string): string {
  return css.replace(
    /url\((["']?)(\/(?!\/)[^)"']+)\1\)/g,
    (_, quote: string, path: string) =>
      `url(${quote}${guestRoot}${path}${quote})`,
  );
}

/** Root-relative host URLs must resolve inside the guest's offline web folder. */
export function offlineHtml(html: string): string {
  const converted = offlineCss(
    html.replace(
      /\b(href|src)="(\/(?!\/)[^\"]*)"/g,
      (_, attribute: string, path: string) => {
        const routes: Record<string, string> = {
          "/": "/index.html",
          "/simple/": "/simple/index.html",
          "/agent": "/agent.html",
          "/agent/": "/agent.html",
          "/lab/": "/lab/index.html",
        };
        return `${attribute}="${guestRoot}${routes[path] ?? path}"`;
      },
    ),
  );
  // NetSurf has basic CSS support; retain a readable layout without flex/grid.
  return converted.replace(
    "</head>",
    `<style>
.profile-page{padding:24px;font-family:sans-serif}
.profile-header,.profile-header nav,.profile-section-heading,.profile-lab,.profile-footer,.profile-projects{display:block}
.profile-header a,.profile-links a{display:inline-block;margin-right:20px;padding:8px 0}
.profile-section-heading>*{display:block;margin:8px 0}
.profile-projects li{margin-bottom:28px}
.profile-intro{padding:40px 0}
.profile-intro h1 span{display:none}
</style></head>`,
  );
}

export async function prepareOfflineWeb(
  source: string,
  destination: string,
): Promise<void> {
  await mkdir(destination, { recursive: true });
  for (const name of ["index.html", "agent.html", "simple/index.html"]) {
    const html = await readFile(join(source, name), "utf8");
    const target = join(destination, name);
    await mkdir(join(target, ".."), { recursive: true });
    await writeFile(target, offlineHtml(html));
  }
  for (const name of [
    "resume.md",
    "agent.md",
    "llms.txt",
    "llms-full.txt",
    "now.md",
    "favicon.svg",
  ]) {
    await cp(join(source, name), join(destination, name));
  }
  await cp(join(source, "assets"), join(destination, "assets"), {
    recursive: true,
    filter: (path) => !path.endsWith(".js"),
  });
  for (const name of await readdir(join(destination, "assets"))) {
    if (!name.endsWith(".css")) continue;
    const path = join(destination, "assets", name);
    await writeFile(path, offlineCss(await readFile(path, "utf8")));
  }
  await cp(join(source, "fonts"), join(destination, "fonts"), {
    recursive: true,
  });
  await mkdir(join(destination, "lab"), { recursive: true });
  await writeFile(
    join(destination, "lab/index.html"),
    offlineHtml(`<!doctype html>
<html lang="en"><meta charset="utf-8"><title>Linux lab — offline</title>
<body><h1>Linux lab</h1><p>You are already inside the Linux machine. Its start and stop controls are in the host browser.</p>
<p><a href="/simple/">Simple version</a> · <a href="/">Home</a></p></body></html>`),
  );
  await writeFile(
    join(destination, "start.html"),
    offlineHtml(`<!doctype html>
<html lang="en"><meta charset="utf-8"><title>undivisible.dev — offline</title>
<body><h1>undivisible.dev, offline</h1><p>This machine has no network. These pages were included in the image.</p>
<ul><li><a href="/">Home</a></li><li><a href="/simple/">Simple version</a></li>
<li><a href="/agent">Agent index</a></li><li><a href="/resume.md">Published résumé</a></li></ul></body></html>`),
  );
}

if (import.meta.main) {
  const [source, destination] = process.argv.slice(2);
  if (!source || !destination)
    throw new Error(
      "Usage: prepare-os-web.ts <static output> <guest web folder>",
    );
  await prepareOfflineWeb(source, destination);
}
