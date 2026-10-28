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

try {
  vm.setNowPlaying(
    JSON.parse(document.documentElement.dataset.albumTrack ?? "null"),
  );
} catch {
  /* Wait for the next valid track event. */
}
window.addEventListener("site:album-track", (event) =>
  vm.setNowPlaying((event as CustomEvent<unknown>).detail),
);
