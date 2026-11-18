import {
  DEFAULT_PROFILE_MARKDOWN_URL,
  DEFAULT_RESUME_MARKDOWN_URL,
} from "../src/lib/parse-readme-markdown";
import { createPublicPortfolioFilter } from "../src/lib/public-portfolio";
import { landingProjectsFromReadme } from "../src/data/readme-projects.generated";

const sources = new Map([
  [
    "/api/profile/README.md",
    "https://raw.githubusercontent.com/undivisible/undivisible/main/README.md",
  ],
  ["/api/profile/now.md", DEFAULT_PROFILE_MARKDOWN_URL],
  ["/api/profile/resume.md", DEFAULT_RESUME_MARKDOWN_URL],
]);

export const PROFILE_FRESH_MS = 60_000;
export const PROFILE_MAX_AGE_MS = 5 * 60_000;

type Entry = { body: string; at: number };

export function createProfileHandler({
  fetchUpstream = fetch,
  now = Date.now,
  timeoutMs = 5000,
}: {
  fetchUpstream?: typeof fetch;
  now?: () => number;
  timeoutMs?: number;
} = {}) {
  const cache = new Map<string, Entry>();
  const pending = new Map<string, Promise<Entry>>();
  const publicPortfolio = createPublicPortfolioFilter({
    fetchUpstream,
    now,
    timeoutMs,
  });
  const associations = new Map(
    landingProjectsFromReadme.flatMap((project) =>
      project.github
        ? [[project.href, project.github.repository] as const]
        : [],
    ),
  );

  return async (request: Request): Promise<Response> => {
    const path = new URL(request.url).pathname;
    const source = sources.get(path);
    const headers = new Headers({
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    });
    if (!source) return new Response("Not found", { status: 404, headers });
    if (request.method !== "GET" && request.method !== "HEAD") {
      headers.set("Allow", "GET, HEAD");
      return new Response("Method not allowed", { status: 405, headers });
    }
    let entry = cache.get(path);
    let status = 200;
    if (!entry || now() - entry.at >= PROFILE_FRESH_MS) {
      let loading = pending.get(path);
      if (!loading) {
        loading = (async () => {
          const upstream = new URL(source);
          // Raw GitHub caches bytes at its CDN despite fetch's no-store policy.
          upstream.searchParams.set(
            "profile_minute",
            String(Math.floor(now() / PROFILE_FRESH_MS)),
          );
          const response = await fetchUpstream(upstream.href, {
            signal: AbortSignal.timeout(timeoutMs),
            cache: "no-store",
            redirect: "manual",
            headers: { Accept: "text/plain" },
          });
          if (response.status === 404) {
            cache.delete(path);
            if (path !== "/api/profile/now.md") throw new Error("not-found");
          } else if (!response.ok) throw new Error("upstream-failed");
          const body = response.status === 404 ? "" : await response.text();
          const fresh = {
            body:
              path === "/api/profile/README.md"
                ? await publicPortfolio(body, associations)
                : body,
            at: now(),
          };
          cache.set(path, fresh);
          return fresh;
        })();
        pending.set(path, loading);
      }
      try {
        entry = await loading;
      } catch (error) {
        console.warn(
          JSON.stringify({
            event: "profile-upstream-failed",
            path,
            message:
              error instanceof Error ? error.message : "Unknown upstream error",
          }),
        );
        if (error instanceof Error && error.message === "not-found") {
          entry = undefined;
          status = 404;
        } else {
          entry = cache.get(path);
          if (
            path === "/api/profile/README.md" ||
            !entry ||
            now() - entry.at >= PROFILE_MAX_AGE_MS
          ) {
            cache.delete(path);
            entry = undefined;
            status = 503;
          }
        }
      } finally {
        if (pending.get(path) === loading) pending.delete(path);
      }
    }
    if (entry) {
      if (path === "/api/profile/README.md")
        headers.set("X-Portfolio-Policy", "public-v1");
      headers.set("X-Profile-Fetched-At", String(entry.at));
      headers.set(
        "X-Profile-Stale",
        String(now() - entry.at >= PROFILE_FRESH_MS),
      );
    }
    return new Response(
      request.method === "HEAD"
        ? null
        : (entry?.body ?? "Profile content unavailable"),
      { status, headers },
    );
  };
}

export const handleProfile = createProfileHandler();
