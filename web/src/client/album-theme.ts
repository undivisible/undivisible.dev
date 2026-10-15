import {
  deriveAlbumPalette,
  extractColorsFromCanvasImage,
} from "../lib/album-theme";
import { fetchLastFmRecent } from "../lib/lastfmClient";

let currentArt = "";
let refreshing = false;

async function refresh() {
  if (refreshing || document.hidden) return;
  refreshing = true;
  try {
    const { track } = await fetchLastFmRecent();
    const art = track?.albumArt;
    if (!art || art === currentArt) return;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    const loaded = new Promise<boolean>((resolve) => {
      const timeout = window.setTimeout(() => resolve(false), 10000);
      const finish = (success: boolean) => {
        window.clearTimeout(timeout);
        resolve(success);
      };
      image.onload = () => finish(true);
      image.onerror = () => finish(false);
    });
    image.src = art;
    if (!(await loaded)) return;
    const colors = extractColorsFromCanvasImage(image);
    const palette = colors && deriveAlbumPalette(colors);
    if (!palette) return;
    for (const [name, value] of Object.entries(palette)) {
      const property = name.replace(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`,
      );
      document.documentElement.style.setProperty(`--album-${property}`, value);
    }
    currentArt = art;
    document.documentElement.dataset.albumColors = colors.join(" ");
    window.dispatchEvent(
      new CustomEvent("site:album-palette", { detail: colors }),
    );
  } catch {
    // Keep the last usable palette when music or artwork is unavailable.
  } finally {
    refreshing = false;
  }
}

void refresh();
window.setInterval(() => void refresh(), 60000);
document.addEventListener("visibilitychange", () => void refresh());
