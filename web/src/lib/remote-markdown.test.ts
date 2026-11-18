import { afterEach, expect, spyOn, test } from "bun:test";
import { createProfileHandler } from "../../server/profile";
import {
  fetchNowStatus,
  fetchReadmeMarkdown,
  fetchRemoteMarkdown,
  fetchResumeMarkdownCached,
  readRemoteMarkdownCache,
  REMOTE_MARKDOWN_MAX_AGE_MS,
} from "./remote-markdown";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalStorage = Object.getOwnPropertyDescriptor(
  globalThis,
  "localStorage",
);
const storage = new Map<string, string>();
const mocks: Array<{ mockRestore(): void }> = [];

function browser() {
  storage.clear();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {},
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
  });
}

afterEach(() => {
  for (const mock of mocks.splice(0)) mock.mockRestore();
  if (originalWindow)
    Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
  if (originalStorage)
    Object.defineProperty(globalThis, "localStorage", originalStorage);
  else Reflect.deleteProperty(globalThis, "localStorage");
});

test("defaults go through runtime profile endpoints and observe controlled upstream updates", async () => {
  browser();
  let now = 1_000_000;
  mocks.push(spyOn(Date, "now").mockImplementation(() => now));
  let body = "old";
  const handle = createProfileHandler({
    now: () => now,
    fetchUpstream: async () => new Response(body),
  });
  const paths: string[] = [];
  mocks.push(
    spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      paths.push(String(input));
      return handle(new Request(`https://site.test${input}`));
    }),
  );
  expect(await fetchNowStatus()).toBe("old");
  body = "格致";
  now += 60_000;
  expect(await fetchNowStatus()).toBe("格致");
  await fetchReadmeMarkdown();
  await fetchResumeMarkdownCached();
  expect(paths).toEqual([
    "/api/profile/now.md",
    "/api/profile/now.md",
    "/api/profile/README.md",
    "/api/profile/resume.md",
  ]);
});

test("stale proxy responses retain upstream age; repeated failures cannot renew localStorage indefinitely", async () => {
  browser();
  let now = 1_000_000;
  const fetchedAt = now;
  mocks.push(spyOn(Date, "now").mockImplementation(() => now));
  const fetchMock = spyOn(globalThis, "fetch").mockImplementation(
    async () =>
      new Response("old", {
        headers: { "X-Profile-Fetched-At": String(fetchedAt) },
      }),
  );
  mocks.push(fetchMock);
  expect(await fetchRemoteMarkdown("/test")).toBe("old");
  now += 120_000;
  expect(await fetchRemoteMarkdown("/test", { forceRefresh: true })).toBe(
    "old",
  );
  fetchMock.mockImplementation(async () => {
    throw new Error("offline");
  });
  now = fetchedAt + REMOTE_MARKDOWN_MAX_AGE_MS - 1;
  expect(await fetchRemoteMarkdown("/test")).toBe("old");
  now++;
  expect(await fetchRemoteMarkdown("/test")).toBeNull();
  expect(readRemoteMarkdownCache("/test")).toBeNull();
});

test("empty text replaces old text, 404 clears it, and malformed/future cache timestamps are rejected", async () => {
  browser();
  const fetchMock = spyOn(globalThis, "fetch").mockImplementation(
    async () => new Response("old"),
  );
  mocks.push(fetchMock);
  await fetchRemoteMarkdown("/test");
  fetchMock.mockImplementation(async () => new Response(""));
  expect(await fetchRemoteMarkdown("/test", { forceRefresh: true })).toBe("");
  expect(readRemoteMarkdownCache("/test")).toBe("");
  fetchMock.mockImplementation(
    async () => new Response("missing", { status: 404 }),
  );
  expect(await fetchRemoteMarkdown("/test", { forceRefresh: true })).toBeNull();
  expect(storage.size).toBe(0);
  for (const entry of [
    { body: "bad", at: Date.now() + 1000 },
    { body: 4, at: Date.now() },
    { body: "bad", at: "now" },
  ]) {
    storage.set("undivisible-remote-md:v4:/test", JSON.stringify(entry));
    expect(readRemoteMarkdownCache("/test")).toBeNull();
  }
});

test("portfolio ignores and deletes legacy caches, rejects unverified responses and fails closed offline", async () => {
  browser();
  const url = "/api/profile/README.md";
  storage.set(
    `undivisible-remote-md:v3:${url}`,
    JSON.stringify({ body: "private cached copy", at: Date.now() }),
  );
  const fetchMock = spyOn(globalThis, "fetch").mockImplementation(
    async () => new Response("unverified copy"),
  );
  mocks.push(fetchMock);
  expect(await fetchReadmeMarkdown()).toBeNull();
  expect(storage.size).toBe(0);
  fetchMock.mockImplementation(
    async () =>
      new Response("verified public", {
        headers: { "X-Portfolio-Policy": "public-v1" },
      }),
  );
  expect(await fetchReadmeMarkdown()).toBe("verified public");
  expect(storage.size).toBe(0);
  fetchMock.mockImplementation(async () => {
    throw new Error("offline");
  });
  expect(await fetchReadmeMarkdown()).toBeNull();
});
