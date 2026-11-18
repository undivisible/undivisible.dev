import { expect, test } from "bun:test";
import { renderOgImage } from "./og";

test("each image fetch renders again, including conditional requests, without caching or caller URL overrides", async () => {
  let generation = 0;
  const browser = {
    async quickAction(
      _action: "screenshot",
      options: BrowserRunScreenshotOptions,
    ) {
      expect(options.cacheTTL).toBe(0);
      expect(options.viewport).toEqual({
        width: 1200,
        height: 630,
        deviceScaleFactor: 1,
      });
      expect(options.waitForSelector?.selector).toBe("img[data-og-ready]");
      expect("url" in options && new URL(options.url).pathname).toBe(
        "/og/render",
      );
      expect("url" in options && new URL(options.url).origin).toBe(
        "https://undivisible.dev",
      );
      return new Response(`fresh PNG ${++generation}`, {
        headers: { "Content-Type": "image/png" },
      });
    },
  };
  const request = () =>
    new Request(
      "https://undivisible.dev/og/home.png?url=https://untrusted.invalid",
      {
        headers: { "If-None-Match": '"old-image"' },
      },
    );
  const first = await renderOgImage(request(), {
    BROWSER: browser,
  });
  const second = await renderOgImage(request(), {
    BROWSER: browser,
  });
  expect(first.status).toBe(200);
  expect(second.status).toBe(200);
  expect(await first.text()).toBe("fresh PNG 1");
  expect(await second.text()).toBe("fresh PNG 2");
  expect(first.headers.get("X-OG-Render-Id")).not.toBe(
    second.headers.get("X-OG-Render-Id"),
  );
  for (const response of [first, second]) {
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.has("ETag")).toBe(false);
  }
});

test("a browser failure is an uncached error, not a saved banner", async () => {
  const response = await renderOgImage(
    new Request("https://undivisible.dev/og/home.png"),
    {
      BROWSER: {
        async quickAction() {
          return new Response("unavailable", { status: 503 });
        },
      },
    },
  );
  expect(response.status).toBe(503);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(response.headers.has("X-OG-Render-Id")).toBe(false);
});
