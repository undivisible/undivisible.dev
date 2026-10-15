import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { vm } from "@/lib/os/vm";
import Page from "@/app/lab/page";

hydrateRoot(document.body, createElement(Page), {
  onUncaughtError: () => window.dispatchEvent(new Event("site:mode-failed")),
});

vm.setAlbumColors(document.documentElement.dataset.albumColors?.split(" "));
window.addEventListener("site:album-palette", (event) =>
  vm.setAlbumColors((event as CustomEvent<unknown>).detail),
);
