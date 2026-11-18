import { createRoot } from "react-dom/client";
import Ascii from "@/components/Ascii";
import { extractColorsFromCanvasImage } from "@/lib/album-theme";
import { fetchLastFmRecent } from "@/lib/lastfmClient";

const { track } = await fetchLastFmRecent({ snapshotFallback: false });
const image = new Image();
image.crossOrigin = "anonymous";
const loaded = await new Promise<boolean>((resolve) => {
  const timeout = window.setTimeout(() => resolve(false), 10000);
  const finish = (success: boolean) => {
    window.clearTimeout(timeout);
    resolve(success);
  };
  image.onload = () => finish(true);
  image.onerror = () => finish(false);
  if (track?.albumArt) image.src = track.albumArt;
  else finish(false);
});
const colors = loaded
  ? extractColorsFromCanvasImage(image, 8)?.slice(0, 5)
  : undefined;
await document.fonts.load('30px "JetBrains Mono"');
await document.fonts.ready;

const root = document.getElementById("banner");
if (!root) throw new Error("Missing OG banner root");
const app = createRoot(root);
app.render(
  <div className="landing" data-view="home">
    <div className="landing-field" aria-hidden="true">
      <Ascii colors={colors} ready staticFrame />
    </div>
    <main className="landing-content">
      <p>hi, i’m max carter.</p>
      <p>i make things for people.</p>
      <p>[undivisible.dev]</p>
    </main>
  </div>,
);

const deadline = performance.now() + 15000;
while (!document.querySelector("canvas[data-reveal-state=complete]")) {
  if (performance.now() > deadline) throw new Error("OG composition timed out");
  await new Promise(requestAnimationFrame);
}
const source = document.querySelector<HTMLCanvasElement>(
  "canvas[data-reveal-state=complete]",
);
const field = document.querySelector("canvas");
if (
  !source ||
  source.dataset.contentCells !== "61" ||
  field?.width !== 67 ||
  field.height !== 15
)
  throw new Error("Selected OG grid did not render");
const canvas = document.createElement("canvas");
canvas.width = 1200;
canvas.height = 630;
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("OG canvas unavailable");
ctx.fillStyle = "#0a0b0e";
ctx.fillRect(0, 0, 1200, 630);
ctx.drawImage(source, 0, 0, 1200, 630);
const poster = new Image(1200, 630);
poster.alt = "hi, i’m max carter. i make things for people. [undivisible.dev]";
poster.src = canvas.toDataURL("image/png");
await poster.decode();
app.unmount();
root.replaceChildren(poster);
poster.dataset.ogReady = "true";
poster.dataset.albumArt = track?.albumArt ?? "";
poster.dataset.palette = colors?.join(" ") ?? "default";
