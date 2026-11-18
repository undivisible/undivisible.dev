export async function renderOgImage(
  request: Request,
  env: {
    BROWSER: {
      quickAction(
        action: "screenshot",
        options: BrowserRunScreenshotOptions,
      ): Promise<Response>;
    };
  },
): Promise<Response> {
  const headers = new Headers({ "Cache-Control": "no-store" });
  if (request.method !== "GET" && request.method !== "HEAD") {
    headers.set("Allow", "GET, HEAD");
    return new Response("Method not allowed", { status: 405, headers });
  }
  const id = crypto.randomUUID();
  const url = new URL("/og/render", request.url);
  url.searchParams.set("render", id);
  try {
    const image = await env.BROWSER.quickAction("screenshot", {
      url: url.href,
      cacheTTL: 0,
      viewport: { width: 1200, height: 630, deviceScaleFactor: 1 },
      waitForSelector: { selector: "img[data-og-ready]", timeout: 40000 },
      screenshotOptions: { type: "png" },
      gotoOptions: { timeout: 15000, waitUntil: "domcontentloaded" },
    });
    if (
      !image.ok ||
      !image.headers.get("content-type")?.startsWith("image/png")
    ) {
      const detail = (await image.text()).slice(0, 1000);
      throw new Error(`Browser screenshot ${image.status}: ${detail}`);
    }
    headers.set("Content-Type", "image/png");
    headers.set("X-OG-Render-Id", id);
    headers.set("X-OG-Generated-At", new Date().toISOString());
    const duration = image.headers.get("X-Browser-Ms-Used");
    if (duration) headers.set("X-Browser-Ms-Used", duration);
    if (request.method === "HEAD") {
      await image.body?.cancel();
      return new Response(null, { headers });
    }
    return new Response(image.body, { headers });
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "og-render-failed",
        renderId: id,
        message:
          error instanceof Error ? error.message : "Unknown browser error",
      }),
    );
    return new Response("Banner rendering temporarily unavailable", {
      status: 503,
      headers,
    });
  }
}
