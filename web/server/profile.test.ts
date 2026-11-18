import { expect, test } from "bun:test";
import {
  createProfileHandler,
  PROFILE_FRESH_MS,
  PROFILE_MAX_AGE_MS,
} from "./profile";

const request = (file = "now.md", init?: RequestInit) =>
  new Request(`https://site.test/api/profile/${file}`, init);

test("portfolio responses exclude private copy and never revive last-good data on verification failure", async () => {
  let now = 1_000_000;
  let status = 200;
  const handle = createProfileHandler({
    now: () => now,
    fetchUpstream: async (input, init) => {
      if (new URL(String(input)).hostname === "github.com") {
        expect(new Headers(init?.headers).get("Authorization")).toBeNull();
        return new Response(null, {
          status: String(input).endsWith("/private") ? 404 : status,
        });
      }
      return new Response(
        "## tools\n- **[visible](https://github.com/example/public)** — visible.\n- **[private](https://github.com/example/private)** — hidden.",
      );
    },
  });
  const first = await handle(request("README.md"));
  expect(first.headers.get("X-Portfolio-Policy")).toBe("public-v1");
  expect(await first.text()).not.toContain("hidden");
  now += PROFILE_FRESH_MS;
  status = 429;
  const failed = await handle(request("README.md"));
  expect(failed.status).toBe(503);
  expect(await failed.text()).not.toContain("visible");
  status = 200;
  expect((await handle(request("README.md"))).status).toBe(200);
});

test("only fixed public files are fetched, without forwarding caller credentials or query URLs", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const handle = createProfileHandler({
    fetchUpstream: async (input, init) => {
      calls.push({ url: String(input), init });
      return new Response("public");
    },
  });
  expect((await handle(request("secret.md"))).status).toBe(404);
  expect((await handle(request("README.md", { method: "POST" }))).status).toBe(
    405,
  );
  expect(calls).toHaveLength(0);
  await handle(
    request("README.md?url=https://private.test", {
      headers: { Authorization: "secret", Cookie: "session=private" },
    }),
  );
  await handle(request());
  await handle(request("resume.md", { method: "HEAD" }));
  expect(
    calls.map((call) => new URL(call.url).origin + new URL(call.url).pathname),
  ).toEqual(
    ["README.md", "now.md", "resume.md"].map(
      (file) =>
        `https://raw.githubusercontent.com/undivisible/undivisible/main/${file}`,
    ),
  );
  for (const { url } of calls)
    expect(new URL(url).searchParams.has("profile_minute")).toBe(true);
  for (const { init } of calls) {
    expect(new Headers(init?.headers).get("Authorization")).toBeNull();
    expect(new Headers(init?.headers).get("Cookie")).toBeNull();
    expect(init?.redirect).toBe("manual");
    expect(init?.cache).toBe("no-store");
  }
});

test("raw CDN revalidation advances a server-owned minute query, never a caller-supplied query", async () => {
  let now = 120_000;
  const urls: string[] = [];
  const handle = createProfileHandler({
    now: () => now,
    fetchUpstream: async (input) => {
      urls.push(String(input));
      return new Response("current");
    },
  });
  await handle(
    request("now.md?profile_minute=attacker&url=https://private.test"),
  );
  now += PROFILE_FRESH_MS;
  await handle(request());
  expect(urls.map((url) => new URL(url).search)).toEqual([
    "?profile_minute=2",
    "?profile_minute=3",
  ]);
});

test("redirects are rejected rather than followed outside the allowlist", async () => {
  const handle = createProfileHandler({
    fetchUpstream: async (_input, init) => {
      expect(init?.redirect).toBe("manual");
      return new Response(null, {
        status: 302,
        headers: { Location: "https://private.test" },
      });
    },
  });
  expect((await handle(request())).status).toBe(503);
});

test("published changes refresh after 60s; failures never extend the five-minute stale deadline", async () => {
  let now = 1_000_000;
  let body = "old";
  let fail = false;
  let calls = 0;
  const handle = createProfileHandler({
    now: () => now,
    fetchUpstream: async () => {
      calls++;
      if (fail) throw new Error("offline");
      return new Response(body);
    },
  });
  expect(await (await handle(request())).text()).toBe("old");
  body = "格致";
  now += PROFILE_FRESH_MS - 1;
  expect(await (await handle(request())).text()).toBe("old");
  expect(calls).toBe(1);
  now++;
  expect(await (await handle(request())).text()).toBe("格致");
  const lastSuccess = now;
  fail = true;
  now += PROFILE_FRESH_MS;
  const stale = await handle(request());
  expect(await stale.text()).toBe("格致");
  expect(stale.headers.get("X-Profile-Stale")).toBe("true");
  expect(stale.headers.get("X-Profile-Fetched-At")).toBe(String(lastSuccess));
  now = lastSuccess + PROFILE_MAX_AGE_MS;
  expect((await handle(request())).status).toBe(503);
});

test("empty now and deleted now clear the status; other 404s invalidate old content", async () => {
  let now = 1_000_000;
  let status = 200;
  let body = "old";
  const handle = createProfileHandler({
    now: () => now,
    fetchUpstream: async () => new Response(body, { status }),
  });
  await handle(request());
  await handle(request("README.md"));
  now += PROFILE_FRESH_MS;
  body = "";
  expect(await (await handle(request())).text()).toBe("");
  now += PROFILE_FRESH_MS;
  status = 404;
  const deleted = await handle(request());
  expect(deleted.status).toBe(200);
  expect(await deleted.text()).toBe("");
  expect((await handle(request("README.md"))).status).toBe(404);
  status = 500;
  expect((await handle(request("README.md"))).status).toBe(503);
});

test("upstream timeout is bounded and concurrent reads share the same fetch", async () => {
  let calls = 0;
  const handle = createProfileHandler({
    timeoutMs: 10,
    fetchUpstream: async (_input, init) => {
      calls++;
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener(
          "abort",
          () => reject(init.signal?.reason),
          { once: true },
        );
      });
    },
  });
  const responses = await Promise.all([handle(request()), handle(request())]);
  expect(responses.map((response) => response.status)).toEqual([503, 503]);
  expect(calls).toBe(1);
});
