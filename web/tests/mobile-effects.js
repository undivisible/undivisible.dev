import { createAsciiShader } from "../src/lib/visuals/ascii-shader";

// Model the minimum 10-bit mediump mantissa instead of trusting desktop GPU precision.
const shaderSource = WebGLRenderingContext.prototype.shaderSource;
WebGLRenderingContext.prototype.shaderSource = function (shader, source) {
  if (source.includes("precision mediump float")) {
    source = source.replace(
      "return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);",
      `float h = sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123;
       float step = exp2(floor(log2(max(abs(h), 0.00001))) - 10.0);
       return fract(floor(h / step + 0.5) * step);`,
    );
  }
  return shaderSource.call(this, shader, source);
};
window.checkMobileShader = () => {
  const canvas = document.createElement("canvas");
  const shader = createAsciiShader(canvas, () => [
    [0, 0, 0],
    [0.82, 0.75, 0.56],
    [0.38, 0.13, 0.69],
    [0.5, 0.31, 0.13],
    [0.69, 0.75, 0.13],
  ]);
  if (!shader) throw new Error("WebGL unavailable");
  shader.resize(412, 740, 49, 37);
  shader.render(5000);
  const gl = canvas.getContext("webgl");
  const pixels = new Uint8Array(49 * 37 * 4);
  gl.readPixels(0, 0, 49, 37, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  const colors = new Set();
  for (let i = 0; i < pixels.length; i += 4)
    colors.add(`${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`);
  shader.dispose();
  if (colors.size < 2)
    throw new Error("Mobile precision collapses the album field to one color");
  return "PASS colored shader with minimum mediump precision emulation";
};
window.musicFadeFrames = [];
const fillText = CanvasRenderingContext2D.prototype.fillText;
CanvasRenderingContext2D.prototype.fillText = function (text, x, y) {
  const status = document.querySelector(".now-playing-status");
  if (
    status &&
    text === "l" &&
    this.canvas.matches(".landing-field canvas:not(.invisible)")
  ) {
    const rect = status.getBoundingClientRect();
    const height = parseFloat(getComputedStyle(status).lineHeight);
    if (
      Math.floor((rect.top + rect.height / 2) / height) ===
        Math.floor(y / height) &&
      Math.abs(x - rect.left) < 10
    )
      window.musicFadeFrames.push(this.globalAlpha);
  }
  return fillText.apply(this, arguments);
};
window.checkMusicFade = () => {
  const steps = window.musicFadeFrames.filter(
    (alpha) => alpha > 0 && alpha < 1,
  );
  if (steps.length < 4 || steps[0] > 0.4)
    throw new Error("Canvas skips the music fade: " + JSON.stringify(steps));
  return "PASS actual canvas music glyphs fade progressively from low opacity";
};
window.checkVisibleAlbumColor = async () => {
  document.documentElement.dataset.albumColors =
    "#000000 #d0c090 #6020b0 #805020 #b0c020";
  window.dispatchEvent(new Event("site:album-palette"));
  await new Promise((resolve) =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    ),
  );
  const canvas = document.querySelector("canvas[data-content-cells]");
  const pixels = canvas
    .getContext("2d")
    .getImageData(0, 0, canvas.width, canvas.height).data;
  let chromatic = false;
  for (let i = 0; i < pixels.length; i += 4) {
    const rgb = [pixels[i], pixels[i + 1], pixels[i + 2]];
    if (pixels[i + 3] > 0 && Math.max(...rgb) - Math.min(...rgb) > 10) {
      chromatic = true;
      break;
    }
  }
  if (!chromatic)
    throw new Error(
      "The visible ASCII canvas is monochrome despite a colored album palette",
    );
  return "PASS album colors reach visible background/shape pixels under mobile precision emulation";
};
