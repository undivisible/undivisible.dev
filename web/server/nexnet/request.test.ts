import { expect, test } from "bun:test";
import { boundedRequest, MAX_REQUEST_BYTES } from "./request";

test("preserves a signed API body's exact bytes when forwarding", async () => {
  const payload = '{"event":"祁明思", "sequence": 12}';
  const result = await boundedRequest(
    new Request("https://example.test/v1/post", {
      method: "POST",
      body: payload,
    }),
  );
  expect(result).toBeInstanceOf(Request);
  expect(await result.text()).toBe(payload);
});

test("caps streaming bodies even without Content-Length", async () => {
  let cancelled = false;
  const body = new ReadableStream({
    pull(controller) {
      controller.enqueue(new Uint8Array(MAX_REQUEST_BYTES / 2));
    },
    cancel() {
      cancelled = true;
    },
  });
  const result = await boundedRequest(
    new Request("https://example.test/v1/post", { method: "POST", body }),
  );
  expect(result).toBeInstanceOf(Response);
  expect((result as Response).status).toBe(413);
  expect(cancelled).toBe(true);
});
