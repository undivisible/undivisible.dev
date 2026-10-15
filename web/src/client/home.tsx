import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import Page from "@/app/main/page";

hydrateRoot(document.body, createElement(Page), {
  onUncaughtError: () => window.dispatchEvent(new Event("site:mode-failed")),
});
