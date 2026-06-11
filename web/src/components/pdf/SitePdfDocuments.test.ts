import { createElement } from "react";
import { expect, test } from "bun:test";
import { renderToBuffer } from "@react-pdf/renderer";
import { SitePdfDocument } from "./SitePdfDocuments";

test("site pdf documents render as pdf buffers", async () => {
  for (const target of ["resume", "brief"] as const) {
    const buffer = await renderToBuffer(
      createElement(SitePdfDocument, { target }),
    );
    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
    expect(buffer.byteLength).toBeGreaterThan(1000);
  }
});
