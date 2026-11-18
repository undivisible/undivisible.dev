import { createRoot } from "react-dom/client";
import Ascii from "@/components/Ascii";
import { extractColorsFromCanvasImage } from "@/lib/album-theme";

const image = new Image();
const loaded = await new Promise<boolean>((resolve) => {
  const timeout = window.setTimeout(() => resolve(false), 10000);
  const finish = (success: boolean) => {
    window.clearTimeout(timeout);
    resolve(success);
  };
  image.onload = () => finish(true);
  image.onerror = () => finish(false);
  image.src = "/artwork";
});
const colors = loaded
  ? extractColorsFromCanvasImage(image, 8)?.slice(0, 5)
  : undefined;
await document.fonts.load('30px "JetBrains Mono"');
await document.fonts.ready;

const root = document.getElementById("banner");
if (!root) throw new Error("Missing OG banner root");
createRoot(root).render(
  <div className="landing" data-view="home">
    <div className="landing-field" aria-hidden="true">
      <Ascii colors={colors} ready />
    </div>
    <main className="landing-content">
      <p>hi, i’m max carter.</p>
      <p>i make things for people.</p>
      <p>[undivisible.dev]</p>
    </main>
  </div>,
);
