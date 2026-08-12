import {
  createElement,
  Fragment,
  type ComponentType,
  type FunctionComponent,
  type ReactNode,
} from "react";
import { renderToReadableStream } from "react-dom/server";
import type { RenderContext, Renderer } from "@tschk/moonshine-framework";
import { fontHrefs } from "@/moonshine/font-google";
import type { Metadata } from "@/moonshine/next";

export type DocumentOptions = {
  lang: string;
  fontVariableCss: string;
  stylesheet: string;
  clientEntries: Record<string, string>;
  metadata: Record<string, Metadata>;
};

type PageProps = {
  params: Record<string, string>;
  data: unknown;
};

type LayoutProps = PageProps & { children?: ReactNode };

const moduleCache = new Map<string, unknown>();

async function loadModule(file: string): Promise<Record<string, unknown>> {
  const cached = moduleCache.get(file);
  if (cached) return cached as Record<string, unknown>;
  const mod = (await import(file)) as Record<string, unknown>;
  moduleCache.set(file, mod);
  return mod;
}

async function loadComponent(file: string): Promise<ComponentType<unknown>> {
  const mod = await loadModule(file);
  return (mod.default ?? mod) as ComponentType<unknown>;
}

async function buildBody(context: RenderContext): Promise<ReactNode> {
  const { route, params, data } = context;
  const Page = (await loadComponent(
    route.file,
  )) as FunctionComponent<PageProps>;
  const pageProps = { params, data };
  let body: ReactNode = createElement(Page, pageProps);

  if (route.layouts) {
    for (let i = route.layouts.length - 1; i >= 0; i--) {
      const Layout = (await loadComponent(
        route.layouts[i]!,
      )) as FunctionComponent<LayoutProps>;
      body = createElement(Layout, { ...pageProps, children: body });
    }
  }

  return body;
}

function alternateLinks(metadata: Metadata): ReactNode[] {
  const types = metadata.alternates?.types;
  if (!types) return [];
  const links: ReactNode[] = [];
  for (const [type, entries] of Object.entries(types)) {
    for (const entry of entries) {
      links.push(
        createElement("link", {
          key: `${type}:${entry.url}`,
          rel: "alternate",
          type,
          href: entry.url,
          ...(entry.title ? { title: entry.title } : {}),
        }),
      );
    }
  }
  return links;
}

function head(
  metadata: Metadata,
  options: DocumentOptions,
  clientEntry: string | undefined,
): ReactNode {
  const children: ReactNode[] = [
    createElement("meta", { key: "charset", charSet: "utf-8" }),
    createElement("meta", {
      key: "viewport",
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    }),
    createElement("link", {
      key: "preconnect-googleapis",
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    }),
    createElement("link", {
      key: "preconnect-gstatic",
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "",
    }),
  ];

  for (const href of fontHrefs()) {
    children.push(
      createElement("link", { key: href, rel: "stylesheet", href }),
    );
  }

  children.push(
    createElement("style", {
      key: "font-variables",
      dangerouslySetInnerHTML: { __html: options.fontVariableCss },
    }),
  );

  children.push(
    createElement("link", {
      key: "stylesheet",
      rel: "stylesheet",
      href: options.stylesheet,
    }),
  );

  if (clientEntry) {
    children.push(
      createElement("script", {
        key: "client",
        type: "module",
        src: clientEntry,
      }),
    );
  }

  if (metadata.robots) {
    children.push(
      createElement("meta", {
        key: "robots",
        name: "robots",
        content: metadata.robots,
      }),
    );
  }
  if (metadata.title) {
    children.push(createElement("title", { key: "title" }, metadata.title));
  }
  if (metadata.description) {
    children.push(
      createElement("meta", {
        key: "description",
        name: "description",
        content: metadata.description,
      }),
    );
  }
  children.push(...alternateLinks(metadata));
  if (metadata.icons?.icon) {
    children.push(
      createElement("link", {
        key: "icon",
        rel: "icon",
        href: metadata.icons.icon,
      }),
    );
  }

  return createElement("head", null, children);
}

async function toHtml(element: ReactNode, signal?: AbortSignal) {
  const stream = await renderToReadableStream(element, { signal });
  await stream.allReady;
  return new Response(stream).text();
}

export function resolveMetadata(
  options: DocumentOptions,
  routeId: string,
): Metadata {
  const base = options.metadata.root ?? {};
  const page = options.metadata[routeId] ?? {};
  return {
    ...base,
    ...page,
    alternates: page.alternates ?? base.alternates,
    icons: page.icons ?? base.icons,
  };
}

export function createStaticRenderer(options: DocumentOptions): Renderer {
  async function document(context: RenderContext): Promise<string> {
    const body = await buildBody(context);
    const metadata = resolveMetadata(options, context.route.id);
    const clientEntry = options.clientEntries[context.route.id];
    const tree = createElement(
      "html",
      { lang: options.lang, suppressHydrationWarning: true },
      head(metadata, options, clientEntry),
      createElement(
        "body",
        { suppressHydrationWarning: true },
        createElement(Fragment, null, body),
      ),
    );
    return toHtml(tree, context.signal);
  }

  return {
    name: "undivisible-static",
    async prerender(context) {
      return document(context);
    },
    async render(context) {
      return new Response(await document(context), {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    },
  };
}
