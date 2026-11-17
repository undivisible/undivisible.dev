// Observe actual canvas glyphs and colours, not only the animation's state label.
(() => {
  const frames = [];
  let frame;
  const prototype = CanvasRenderingContext2D.prototype;
  const clear = prototype.clearRect;
  const draw = prototype.fillText;
  let mainBounds;
  let clockBounds;
  prototype.clearRect = function (...args) {
    if (this.canvas.matches(".landing-field canvas:not(.invisible)")) {
      if (frame) frames.push(frame);
      frame = {
        state: this.canvas.dataset.revealState,
        text: "",
        chroma: 0,
        hour: "",
      };
      mainBounds = document
        .querySelector(".landing-content")
        .getBoundingClientRect();
      const time = [
        ...document.querySelectorAll(
          "[data-time-scrubber] > div > a:has(> span)",
        ),
      ]
        .map((link) => link.children[1])
        .find((time) => Number(time?.textContent.slice(0, 2)) > 2);
      if (time?.firstChild) {
        const range = document.createRange();
        range.setStart(time.firstChild, 0);
        range.setEnd(time.firstChild, 2);
        const rect = range.getBoundingClientRect();
        const cellWidth = this.measureText("M").width;
        clockBounds = {
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          left: (Math.floor(rect.left / cellWidth) + 0.5) * cellWidth,
          cellWidth,
        };
      }
    }
    return clear.apply(this, args);
  };
  prototype.fillText = function (text, x, y) {
    if (frame && this.canvas.matches(".landing-field canvas:not(.invisible)")) {
      if (
        this.globalAlpha === 1 &&
        y >= mainBounds.top &&
        y <= mainBounds.bottom
      )
        frame.text += text;
      if (
        this.globalAlpha === 1 &&
        clockBounds?.width &&
        y >= clockBounds.top &&
        y <= clockBounds.bottom &&
        x >= clockBounds.left - 0.1 &&
        x < clockBounds.left + clockBounds.cellWidth * 2 - 0.1
      )
        frame.hour += text;
      if (this.globalAlpha < 0.5) {
        const rgb = this.fillStyle.match(/[\d.]+/g)?.map(Number);
        if (rgb?.length === 3)
          frame.chroma = Math.max(
            frame.chroma,
            Math.max(...rgb) - Math.min(...rgb),
          );
        else if (/^#[\da-f]{6}$/i.test(this.fillStyle)) {
          const channels = [1, 3, 5].map((start) =>
            parseInt(this.fillStyle.slice(start, start + 2), 16),
          );
          frame.chroma = Math.max(
            frame.chroma,
            Math.max(...channels) - Math.min(...channels),
          );
        }
      }
    }
    return draw.apply(this, arguments);
  };
  window.checkLandingReveal = (reduced = false) => {
    const settled = frames.filter((frame) => frame.state === "complete");
    if (!settled.length || !settled.at(-1).text.startsWith("hi,i’mmaxcarter."))
      throw new Error(
        "Real page copy did not resolve: " +
          JSON.stringify({
            settled: settled.length,
            text: settled.at(-1)?.text.slice(0, 80),
          }),
      );
    const phases = [...new Set(frames.map((frame) => frame.state))];
    if (reduced) {
      if (phases.some((phase) => phase !== "complete"))
        throw new Error("Reduced motion must skip typing and colour animation");
    } else {
      if (phases.join() !== "typing,color,complete")
        throw new Error("Wrong reveal sequence: " + phases);
      const typing = frames.filter((frame) => frame.state === "typing");
      if (
        !typing.some(
          (frame) =>
            frame.text.length > 5 &&
            frame.text.length < settled[0].text.length / 2,
        )
      )
        throw new Error("Page text did not progressively type on");
      const real = settled.at(-1).text;
      if (typing.some((frame) => !real.startsWith(frame.text)))
        throw new Error(
          "Text must resolve directly from the background, not random replacement copy",
        );
      const hours = typing
        .map((frame) => frame.hour)
        .filter((hour) => /^\d{2}$/.test(hour))
        .map(Number);
      const target = Number(settled.at(-1).hour);
      if (
        !hours.includes(0) ||
        (target > 1 && !hours.some((hour) => hour > 0 && hour < target))
      )
        throw new Error(
          "Actual clock numbers did not count from zero: " + hours.join(),
        );
      if (frames.some((frame) => frame.state === "typing" && frame.chroma > 1))
        throw new Error("Colours appeared before text resolved");
      const color = frames.filter((frame) => frame.state === "color");
      if (
        !color.some(
          (frame) =>
            frame.chroma > 2 && frame.chroma < settled.at(-1).chroma * 0.8,
        )
      )
        throw new Error("Colours did not fade progressively");
    }
    const style = getComputedStyle(document.querySelector(".landing"));
    const context = document.createElement("canvas").getContext("2d");
    context.font = `${style.fontSize} ${style.fontFamily}`;
    if (
      Math.abs(
        context.measureText("i").width - context.measureText("M").width,
      ) > 0.01
    )
      throw new Error("Text font is not monospaced");
    return {
      result: "PASS actual canvas reveal and monospaced font",
      reduced,
      phases,
    };
  };
  window.landingRevealReady = () =>
    frames.some((frame) => frame.state === "complete");
  window.resetLandingReveal = () => {
    frames.length = 0;
    frame = undefined;
  };
  window.checkLandingViewTransition = (reduced = false) => {
    const dissolve = frames.filter((frame) => frame.state === "dissolving");
    if (reduced) {
      if (frames.some((frame) => frame.state !== "complete"))
        throw new Error("Reduced-motion navigation must be immediate");
    } else if (
      !dissolve.length ||
      dissolve.at(-1).text.length >= dissolve[0].text.length / 3 ||
      !frames.some((frame) => frame.state === "typing")
    )
      throw new Error(
        "Navigation did not dissolve into background and reveal the next view",
      );
    return "PASS background/text view transition";
  };
})();
