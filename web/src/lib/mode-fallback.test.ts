import { expect, test } from "bun:test";
import { installModeFallback } from "./mode-fallback";

function browserFor(
  mode: "os" | "main" | "simple",
  preferred: string | null = null,
  pathname = mode === "os" ? "/" : `/${mode}/`,
) {
  let now = 0;
  let sequence = 0;
  const timers = new Map<number, { at: number; run: () => void }>();
  const listeners = new Map<string, Array<(event: unknown) => void>>();
  const visits: string[] = [];
  const browser = {
    location: {
      pathname,
      href: `https://undivisible.dev${pathname}`,
      origin: "https://undivisible.dev",
      replace: (path: string) => visits.push(path),
    },
    localStorage: {
      getItem: () => preferred,
      setItem: (_key: string, value: string) => {
        preferred = value;
      },
    },
    setTimeout: (run: () => void, delay: number) => {
      timers.set(++sequence, { at: now + delay, run });
      return sequence;
    },
    clearTimeout: (id: number) => timers.delete(id),
    addEventListener: (name: string, run: (event: unknown) => void) => {
      listeners.set(name, [...(listeners.get(name) ?? []), run]);
    },
  };
  installModeFallback(mode, browser as unknown as Window);
  return {
    visits,
    preference: () => preferred,
    emit: (name: string, event = {}) =>
      listeners.get(name)?.forEach((run) => run(event)),
    advance: (ms: number) => {
      now += ms;
      for (const [id, timer] of [...timers]) {
        if (timer.at <= now) {
          timers.delete(id);
          timer.run();
        }
      }
    },
    browser,
  };
}

test("slow OS goes to main, then simple if the main document also stalls", () => {
  const b = browserFor("os");
  b.advance(11999);
  expect(b.visits).toEqual([]);
  b.advance(1);
  expect(b.visits).toEqual(["/main/"]);
  b.emit("site:mode-ready"); // A late OS boot must not cancel the pending-navigation limit.
  b.advance(5000);
  expect(b.visits).toEqual(["/main/", "/simple/"]);
});

test("main startup gets five seconds and cannot loop back to OS", () => {
  const b = browserFor("main");
  b.advance(5000);
  expect(b.visits).toEqual(["/simple/"]);
  b.emit("site:mode-failed");
  expect(b.visits).toHaveLength(1);
});

test("ready or deliberately stopped mode cancels fallback; explicit restart rearms it", () => {
  const b = browserFor("os");
  b.emit("site:mode-ready");
  b.advance(20000);
  expect(b.visits).toEqual([]);
  b.emit("site:mode-start");
  b.advance(12000);
  expect(b.visits).toEqual(["/main/"]);
});

test("startup script errors fail immediately, but optional image errors do not", () => {
  const b = browserFor("os");
  b.emit("error", { target: { tagName: "IMG" } });
  expect(b.visits).toEqual([]);
  b.emit("error", {
    target: {
      tagName: "SCRIPT",
      src: "https://undivisible.dev/assets/client.js",
    },
  });
  expect(b.visits).toEqual(["/main/"]);
});

test("explicit OS failure after readiness still falls back", () => {
  const b = browserFor("os");
  b.emit("site:mode-ready");
  b.emit("error", { target: b.browser });
  expect(b.visits).toEqual([]);
  b.emit("site:mode-failed");
  expect(b.visits).toEqual(["/main/"]);
});

test("unhandled startup failures take main to simple", () => {
  const b = browserFor("main");
  b.emit("unhandledrejection");
  expect(b.visits).toEqual(["/simple/"]);
});

test("blocked third-party analytics does not trigger fallback", () => {
  const b = browserFor("os");
  b.emit("error", {
    target: {
      tagName: "SCRIPT",
      src: "https://static.cloudflareinsights.com/beacon.min.js",
    },
  });
  expect(b.visits).toEqual([]);
});

test("explicit choices bypass errors and timers, and root remembers the choice", () => {
  for (const mode of ["os", "main", "simple"] as const) {
    const b = browserFor(mode, mode);
    b.emit("site:mode-failed");
    b.advance(60000);
    expect(b.visits).toEqual([]);
  }
  expect(browserFor("os", "main").visits).toEqual(["/main/"]);
  expect(browserFor("os", "simple").visits).toEqual(["/simple/"]);
});

test("clicking a mode link remembers it, including from Simple", () => {
  const b = browserFor("simple");
  b.emit("click", {
    button: 0,
    target: {
      closest: () => ({
        href: "https://undivisible.dev/lab/",
        target: "",
        hasAttribute: () => false,
      }),
    },
  });
  expect(b.preference()).toBe("os");
});
