// CDP_URL=$(agent-browser get cdp-url) bun web/tests/landing-hover-load.js URL [hover|cold]
// Uses real Chromium pointer input and cold network requests, not synthetic DOM hover events.
const origin = process.argv[2] ?? "http://localhost:4321";
const mode = process.argv[3] ?? "hover";
const socket = new WebSocket(process.env.CDP_URL);
await new Promise((resolve) =>
  socket.addEventListener("open", resolve, { once: true }),
);
let sequence = 0;
const pending = new Map();
let onEvent = () => {};
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id) return onEvent(message);
  const request = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) request.reject(new Error(JSON.stringify(message.error)));
  else request.resolve(message.result);
});
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params, sessionId }));
  });
try {
  const { targetInfos } = await send("Target.getTargets");
  const target = targetInfos.find((target) => target.type === "page");
  await send("Target.activateTarget", { targetId: target.targetId });
  const { sessionId } = await send("Target.attachToTarget", {
    targetId: target.targetId,
    flatten: true,
  });
  const cdp = (method, params) => send(method, params, sessionId);
  const evaluate = async (expression) => {
    const response = await cdp("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (response.exceptionDetails)
      throw new Error(JSON.stringify(response.exceptionDetails));
    return response.result.value;
  };
  const wait = (condition) =>
    evaluate(`(async () => {
    const start = performance.now();
    while (!(${condition})) {
      if (performance.now() - start > 20000) throw new Error('Timed out: ' + ${JSON.stringify(condition)});
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  })()`);
  await cdp("Page.enable");
  if (mode === "cold") {
    await cdp("Network.enable");
    await cdp("Network.setCacheDisabled", { cacheDisabled: true });
    await cdp("Page.addScriptToEvaluateOnNewDocument", {
      source: await Bun.file(
        new URL("./landing-reveal.js", import.meta.url),
      ).text(),
    });
    await cdp("Page.addScriptToEvaluateOnNewDocument", {
      source: `
      window.semanticFlashes = [];
      window.shaderTimes = [];
      const locations = new WeakMap();
      const getLocation = WebGLRenderingContext.prototype.getUniformLocation;
      const uniform = WebGLRenderingContext.prototype.uniform1f;
      WebGLRenderingContext.prototype.getUniformLocation = function(program, name) {
        const location = getLocation.call(this, program, name);
        if (location) locations.set(location, name);
        return location;
      };
      WebGLRenderingContext.prototype.uniform1f = function(location, value) {
        if (this.canvas.closest('.landing-field') && locations.get(location) === 'u_time' &&
            !document.querySelector('canvas[data-reveal-state=complete]')) shaderTimes.push(value);
        return uniform.call(this, location, value);
      };
      requestAnimationFrame(function observe() {
        const page = document.querySelector('.landing');
        if (page && !page.classList.contains('ascii-text-composed') &&
            getComputedStyle(page).visibility === 'visible')
          semanticFlashes.push(performance.now());
        requestAnimationFrame(observe);
      });
    `,
    });
    const delays = [];
    onEvent = (event) => {
      if (event.method !== "Fetch.requestPaused") return;
      const { requestId, request } = event.params;
      const delay = request.url.includes("/fonts/")
        ? 1800
        : request.url.includes("/assets/")
          ? 1200
          : 2400;
      delays.push(request.url.split("?")[0]);
      void Bun.sleep(delay).then(() =>
        cdp("Fetch.continueRequest", { requestId }),
      );
    };
    await cdp("Fetch.enable", {
      patterns: [
        { urlPattern: "*/assets/*" },
        { urlPattern: "*/fonts/*" },
        { urlPattern: "*ws.audioscrobbler.com/*" },
        { urlPattern: "*/now.md*" },
      ],
    });
    await cdp("Page.navigate", { url: origin });
    await wait("window.landingRevealReady?.()");
    const result = await evaluate(`(() => {
      if (semanticFlashes.length) throw new Error('Final DOM copy flashed before canvas: ' + semanticFlashes.length + ' frames');
      if (shaderTimes[0] !== 0) throw new Error('Shader started after zero: ' + shaderTimes[0]);
      if (shaderTimes.some((time, index) => index && time - shaderTimes[index - 1] > 0.051)) throw new Error('Animation jumped over an unpainted interval');
      return checkLandingReveal();
    })()`);
    console.log(
      "PASS cold load with delayed scripts/styles/fonts/data",
      JSON.stringify({ result, delayedRequests: delays.length }),
    );
    await cdp("Fetch.disable");
    await cdp("Page.addScriptToEvaluateOnNewDocument", {
      source: `const context = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(type, ...options) {
          return type.startsWith('webgl') ? null : context.call(this, type, ...options);
        };`,
    });
    await cdp("Page.navigate", { url: origin });
    await wait("!!document.querySelector('.landing.ascii-text-fallback')");
    if (
      await evaluate(
        "getComputedStyle(document.querySelector('.landing')).visibility !== 'visible'",
      )
    )
      throw new Error("GPU fallback left the landing copy hidden");
    console.log("PASS readable semantic fallback when WebGL is unavailable");
  } else {
    await cdp("Page.navigate", { url: origin });
    await wait(
      "!!document.querySelector('canvas[data-reveal-state=complete]')",
    );
    let pointer = { x: 0, y: 0 };
    const move = async (x, y, inspect) => {
      const start = pointer;
      for (let step = 1; step <= 24; step++) {
        pointer = {
          x: start.x + ((x - start.x) * step) / 24,
          y: start.y + ((y - start.y) * step) / 24,
        };
        await cdp("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          ...pointer,
        });
        await Bun.sleep(16);
        if (inspect) await inspect(pointer);
      }
    };
    const box = (selector) =>
      evaluate(
        `document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect().toJSON()`,
      );
    let crossedAdjacent = 0;
    const click = async (selector) => {
      const bounds = await evaluate(
        `document.querySelector(${JSON.stringify(selector)}).getClientRects()[0].toJSON()`,
      );
      await move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      await cdp("Input.dispatchMouseEvent", {
        type: "mousePressed",
        ...pointer,
        button: "left",
        clickCount: 1,
      });
      await cdp("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        ...pointer,
        button: "left",
        clickCount: 1,
      });
    };
    const approach = async (key, edge) => {
      const owner = await box(`[data-project-key="${key}"]`);
      const right = await evaluate("innerWidth - 10");
      await move(right, 10);
      await move(right, owner.bottom - 3);
      await move(owner.right - 3, owner.bottom - 3);
      await wait(
        `document.querySelector('#project-preview strong')?.textContent === ${JSON.stringify(key)}`,
      );
      const card = await box("#project-preview");
      let fixed;
      await move(
        edge === "right" ? card.right - 20 : card.left + 20,
        card.top + 36,
        async (point) => {
          const state = await evaluate(`(() => {
          const card = document.querySelector('#project-preview');
          return card ? { name: card.querySelector('strong').textContent, box: card.getBoundingClientRect().toJSON(), events: getComputedStyle(card).pointerEvents,
            neighbor: document.elementFromPoint(${point.x}, ${point.y})?.closest('[data-project-key]')?.dataset.projectKey } : null;
        })()`);
          if (!state || state.name !== key || state.events === "none")
            throw new Error(
              "Card lost ownership or cannot receive pointer input during diagonal approach: " +
                key,
            );
          if (state.neighbor && state.neighbor !== key) crossedAdjacent++;
          if (
            point.x < owner.left ||
            point.x > owner.right ||
            point.y < owner.top ||
            point.y > owner.bottom
          ) {
            if (
              fixed &&
              (Math.abs(state.box.left - fixed.left) > 1 ||
                Math.abs(state.box.top - fixed.top) > 1)
            )
              throw new Error("Card moved away during approach");
            fixed = state.box;
          }
        },
      );
      if (
        !(await evaluate(
          "!!document.elementFromPoint(" +
            pointer.x +
            "," +
            pointer.y +
            ")?.closest('#project-preview')",
        ))
      )
        throw new Error("Pointer did not reach the card");
      await click(".landing-preview-close");
      await wait("!document.querySelector('#project-preview')");
      await move(10, 10);
      console.log(
        "PASS real diagonal approach, stable owner/card and close interaction",
        key,
        edge,
      );
    };
    const navigate = async (selector) => {
      const bounds = await box(selector);
      const right = await evaluate("innerWidth - 10");
      await move(right, 10);
      await move(right, bounds.top + 3);
      await move(bounds.right - 3, bounds.top + 3);
      await click(selector);
    };
    await approach("moonshine", "left");
    await approach("alpenglow", "right");
    await navigate("[data-more]");
    await wait(
      "document.querySelector('.landing').dataset.view === 'projects' && !!document.querySelector('canvas[data-reveal-state=complete]')",
    );
    await approach("alpenglow", "right");
    await approach("alphabets", "left");
    const alpenglow = await box("[data-project-key=alpenglow]");
    await move(10, alpenglow.top + 4);
    await move(alpenglow.left + 4, alpenglow.top + 4);
    await wait(
      "document.querySelector('#project-preview strong')?.textContent === 'alpenglow'",
    );
    await move(10, 10);
    await wait("!document.querySelector('#project-preview')");
    const alphabets = await box("[data-project-key=alphabets]");
    await move(10, alphabets.top + 4);
    await move(alphabets.left + 4, alphabets.top + 4);
    await wait(
      "document.querySelector('#project-preview strong')?.textContent === 'alphabets'",
    );
    await move(10, 10);
    await navigate("[data-back]");
    await wait(
      "document.querySelector('.landing').dataset.view === 'home' && !!document.querySelector('canvas[data-reveal-state=complete]')",
    );
    if (await evaluate("!!document.querySelector('#project-preview')"))
      throw new Error("back inherited a preview");
    if (!crossedAdjacent)
      throw new Error("No approach crossed an adjacent project control");
    console.log(
      "PASS leaving corridor, adjacent project switching, More/back dismissal",
      { crossedAdjacent },
    );
    const owner = await box("[data-project-key=alpenglow]");
    await move(1430, 10);
    await move(1430, owner.bottom - 3);
    await move(owner.right - 3, owner.bottom - 3);
    await wait(
      "document.querySelector('#project-preview strong')?.textContent === 'alpenglow'",
    );
    const card = await box("#project-preview");
    await move(card.left + 30, card.top + 36);
    let requested;
    onEvent = (event) => {
      if (event.method === "Page.frameRequestedNavigation")
        requested = event.params.url;
    };
    await click(".landing-preview-languages a");
    for (let frame = 0; frame < 100 && !requested; frame++) await Bun.sleep(20);
    if (requested !== "https://github.com/tschk/alpenglow#languages")
      throw new Error(
        "Card language link did not receive the real click: " + requested,
      );
    console.log("PASS reachable GitHub language link received a real click");
  }
} finally {
  socket.close();
}
