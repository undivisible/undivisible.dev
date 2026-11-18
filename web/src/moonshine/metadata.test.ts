import { expect, test } from "bun:test";
import type { RenderContext } from "@tschk/moonshine-framework";
import { metadata as homepage } from "../app/page";
import { metadata as root } from "../app/layout";
import { metadata as agent } from "../app/agent/page";
import { createStaticRenderer, type DocumentOptions } from "./renderer";
import type { Metadata } from "./next";

const options: DocumentOptions = {
  lang: "en",
  fontVariableCss: "",
  stylesheet: "/site.css",
  clientEntries: {},
  metadata: { root, index: homepage, agent },
};

function context(id: string): RenderContext {
  return {
    request: new Request(`https://undivisible.dev/${id}`),
    route: {
      id,
      path: `/${id}`,
      file: new URL("../app/agent/page.tsx", import.meta.url).pathname,
      mode: "static",
      runtime: "bun",
      decision: "metadata test",
      clientEntries: [],
    },
    params: {},
    data: undefined,
    signal: new AbortController().signal,
  };
}

test("homepage emits the selected OG banner and Twitter large-image card in raw HTML", async () => {
  const html = await createStaticRenderer(options).prerender(context("index"));
  for (const [property, value] of Object.entries({
    "og:title": "undivisible.dev",
    "og:description": "Max Carter — software systems builder.",
    "og:type": "website",
    "og:url": "https://undivisible.dev/",
    "og:image": "https://undivisible.dev/og/home.png",
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:image:type": "image/png",
    "og:image:alt":
      "Max Carter’s integrated ASCII banner with his homepage introduction and project links.",
  })) {
    expect(html).toContain(`<meta property="${property}" content="${value}"/>`);
  }
  for (const [name, value] of Object.entries({
    "twitter:card": "summary_large_image",
    "twitter:title": "undivisible.dev",
    "twitter:description": "Max Carter — software systems builder.",
    "twitter:image": "https://undivisible.dev/og/home.png",
    "twitter:image:alt":
      "Max Carter’s integrated ASCII banner with his homepage introduction and project links.",
  })) {
    expect(html).toContain(`<meta name="${name}" content="${value}"/>`);
  }
  expect(html).toContain("<title>undivisible.dev</title>");
  expect(html).toContain(
    '<meta name="description" content="Max Carter — software systems builder."/>',
  );
  expect(html).toContain(
    '<link rel="alternate" type="text/plain" href="/llms.txt" title="LLM index"/>',
  );
  expect(html).toContain('<link rel="icon"');
});

test("other routes do not inherit homepage social metadata", async () => {
  const renderer = createStaticRenderer(options);
  for (const id of ["agent", "lab", "not-found"]) {
    const response = await renderer.render(context(id));
    const html = await response.text();
    expect(response.headers.get("content-type")).toBe(
      "text/html; charset=utf-8",
    );
    expect(html).not.toContain('property="og:');
    expect(html).not.toContain('name="twitter:');
    expect(html).not.toContain('rel="canonical"');
    expect(html).not.toContain("https://undivisible.dev/og/home.png");
    expect(html).toContain('<link rel="alternate" type="text/plain"');
    if (id === "agent")
      expect(html).toContain("<title>Agent mode · undivisible.dev</title>");
  }
});

test("social values, canonical and existing metadata are escaped by the public renderer", async () => {
  const value = 'Max & "ASCII" <banner>';
  const escaped = "Max &amp; &quot;ASCII&quot; &lt;banner&gt;";
  const url = 'https://undivisible.dev/?a=1&b="<banner>"';
  const escapedUrl =
    "https://undivisible.dev/?a=1&amp;b=&quot;&lt;banner&gt;&quot;";
  const metadata: Metadata = {
    title: value,
    description: value,
    robots: "noindex",
    alternates: {
      canonical: url,
      types: { "text/plain": [{ url, title: value }] },
    },
    icons: { icon: url },
    openGraph: {
      title: value,
      description: value,
      type: "website",
      url,
      images: [
        { url, width: 1200, height: 630, type: "image/png", alt: value },
        { url: "/second.png" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: value,
      description: value,
      images: [{ url, alt: value }],
    },
  };
  const html = await createStaticRenderer({
    ...options,
    metadata: { root: metadata },
  }).prerender(context("test"));
  for (const property of ["og:title", "og:description", "og:image:alt"]) {
    expect(html).toContain(
      `<meta property="${property}" content="${escaped}"/>`,
    );
  }
  for (const name of [
    "description",
    "twitter:title",
    "twitter:description",
    "twitter:image:alt",
  ]) {
    expect(html).toContain(`<meta name="${name}" content="${escaped}"/>`);
  }
  expect(html).toContain(`<meta property="og:url" content="${escapedUrl}"/>`);
  expect(html).toContain(`<meta property="og:image" content="${escapedUrl}"/>`);
  expect(html).toContain('<meta property="og:image" content="/second.png"/>');
  expect(html).toContain(
    `<meta name="twitter:image" content="${escapedUrl}"/>`,
  );
  expect(html).toContain(`<link rel="canonical" href="${escapedUrl}"/>`);
  expect(html).toContain(
    `<link rel="alternate" type="text/plain" href="${escapedUrl}" title="${escaped}"/>`,
  );
  expect(html).toContain(`<link rel="icon" href="${escapedUrl}"/>`);
  expect(html).toContain(`<title>${escaped}</title>`);
  expect(html).toContain('<meta name="robots" content="noindex"/>');
  expect(html).not.toContain(value);
  expect(html).not.toContain("undefined");
});
