import { expect, test } from "bun:test";
import { installLabFallback } from "./mode-fallback";

function browserFor() {
  let now = 0;
  let sequence = 0;
  const timers = new Map<number, { at: number; run: () => void }>();
  const listeners = new Map<string, Array<(event: unknown) => void>>();
  const visits: string[] = [];
  const browser = {
    location: {
      href: "https://undivisible.dev/lab/",
      origin: "https://undivisible.dev",
      replace: (path: string) => visits.push(path),
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
  installLabFallback(browser as unknown as Window);
  return {
    visits,
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

test("a slow lab returns to the static portfolio after twelve seconds", () => {
  const b = browserFor();
  b.advance(11999);
  expect(b.visits).toEqual([]);
  b.advance(1);
  expect(b.visits).toEqual(["/"]);
  b.emit("site:mode-ready");
  b.advance(12000);
  expect(b.visits).toEqual(["/"]);
});

test("ready cancels fallback and restarting the lab rearms it", () => {
  const b = browserFor();
  b.emit("site:mode-ready");
  b.advance(20000);
  expect(b.visits).toEqual([]);
  b.emit("site:mode-start");
  b.advance(12000);
  expect(b.visits).toEqual(["/"]);
});

test("a critical local asset or explicit startup failure returns home", () => {
  const assetFailure = browserFor();
  assetFailure.emit("error", {
    target: {
      tagName: "SCRIPT",
      src: "https://undivisible.dev/assets/client.js",
    },
  });
  expect(assetFailure.visits).toEqual(["/"]);

  const startupFailure = browserFor();
  startupFailure.emit("site:mode-failed");
  expect(startupFailure.visits).toEqual(["/"]);
});

test("optional analytics and images do not eject the visitor", () => {
  const b = browserFor();
  b.emit("error", { target: { tagName: "IMG" } });
  b.emit("error", {
    target: {
      tagName: "SCRIPT",
      src: "https://static.cloudflareinsights.com/beacon.min.js",
    },
  });
  b.emit("error", {
    target: {
      tagName: "SCRIPT",
      src: "https://undivisible.dev/assets/album-theme.js",
      hasAttribute: (name: string) => name === "data-optional",
    },
  });
  expect(b.visits).toEqual([]);
});

test("unhandled startup rejections return to the portfolio", () => {
  const b = browserFor();
  b.emit("unhandledrejection");
  expect(b.visits).toEqual(["/"]);
});
