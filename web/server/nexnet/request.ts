export const MAX_REQUEST_BYTES = 64 * 1024;

/** Buffer only bounded API bodies before forwarding them across the DO binding. */
export async function boundedRequest(
  request: Request,
): Promise<Request | Response> {
  if (!request.body) return request;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    length += next.value.byteLength;
    if (length > MAX_REQUEST_BYTES) {
      await reader.cancel();
      return Response.json(
        { error: { code: "invalid", message: "Request body exceeds 64 KiB" } },
        { status: 413 },
      );
    }
    chunks.push(next.value);
  }
  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const headers = new Headers(request.headers);
  headers.delete("content-length");
  return new Request(request, { body, headers });
}
