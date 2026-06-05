import { expect, test } from "bun:test";
import {
  applyReadmeStackFallbacks,
  type ReadmeBundle,
} from "@/lib/profile-readme";

test("readme stack fallback keeps previous stacks when fresh sync has none", () => {
  const previous: ReadmeBundle = {
    mainHeroQuote: "",
    mainProjects: [],
    utilities: [
      {
        key: "rs_ai",
        name: "rs_ai",
        href: "https://github.com/undivisible/rs_ai",
        desc: "old",
        stack: "Rust, Swift.",
      },
    ],
    miniapps: [],
  };
  const fresh: ReadmeBundle = {
    mainHeroQuote: "",
    mainProjects: [],
    utilities: [
      {
        key: "rs_ai",
        name: "rs_ai",
        href: "https://github.com/undivisible/rs_ai",
        desc: "new",
      },
    ],
    miniapps: [],
  };

  expect(applyReadmeStackFallbacks(fresh, previous).utilities[0]?.stack).toBe(
    "Rust, Swift.",
  );
});
