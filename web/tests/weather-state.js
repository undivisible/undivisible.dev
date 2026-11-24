// Browser-only upstream fixture; the site still owns request and rendering behavior.
(() => {
  const upstreamFetch = window.fetch.bind(window);
  const pending = [];
  window.weatherFixture = {
    pending,
    complete(status, payload) {
      const request = pending.shift();
      if (!request) throw new Error("No pending weather request");
      request.resolve(Response.json(payload, { status }));
    },
  };
  window.fetch = (input, init) => {
    const url = new URL(
      input instanceof Request ? input.url : input,
      location.href,
    );
    if (url.hostname !== "api.open-meteo.com")
      return upstreamFetch(input, init);
    if (url.searchParams.get("current") === "is_day")
      return Promise.resolve(
        Response.json({
          current: { is_day: 1 },
          daily: {
            sunrise: [1794956400, 1795042800],
            sunset: [1794999600, 1795086000],
          },
        }),
      );
    return new Promise((resolve, reject) => {
      const request = { resolve, reject, url: url.href };
      pending.push(request);
      init?.signal?.addEventListener(
        "abort",
        () => {
          const index = pending.indexOf(request);
          if (index >= 0) pending.splice(index, 1);
          reject(init.signal.reason);
        },
        { once: true },
      );
    });
  };
})();
