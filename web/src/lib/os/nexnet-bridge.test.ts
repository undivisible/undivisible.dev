import { describe, expect, test } from "bun:test";
import { nexnetGatewayUrl } from "./nexnet-bridge";

const prod = { hostname: "undivisible.dev", search: "" };
const local = (search: string) => ({ hostname: "127.0.0.1", search });

describe("nexnetGatewayUrl", () => {
  test("is absent unless a gateway is configured", () => {
    expect(nexnetGatewayUrl(undefined, prod)).toBeNull();
    expect(nexnetGatewayUrl("", prod)).toBeNull();
  });

  test("uses the configured https origin and drops any path", () => {
    expect(nexnetGatewayUrl("https://chat.example.test/v1/x", prod)).toBe(
      "https://chat.example.test",
    );
  });

  test("refuses plain http and junk for non-loopback gateways", () => {
    expect(nexnetGatewayUrl("http://chat.example.test", prod)).toBeNull();
    expect(nexnetGatewayUrl("javascript:alert(1)", prod)).toBeNull();
    expect(nexnetGatewayUrl("not a url", prod)).toBeNull();
  });

  test("allows loopback http for local development", () => {
    expect(nexnetGatewayUrl("http://127.0.0.1:8799", prod)).toBe(
      "http://127.0.0.1:8799",
    );
  });

  test("the query override only works on a local host", () => {
    expect(
      nexnetGatewayUrl(undefined, local("?nexnet=http://127.0.0.1:9000")),
    ).toBe("http://127.0.0.1:9000");
    expect(
      nexnetGatewayUrl(undefined, {
        hostname: "undivisible.dev",
        search: "?nexnet=https://evil.example.test",
      }),
    ).toBeNull();
    expect(
      nexnetGatewayUrl("https://chat.example.test", {
        hostname: "undivisible.dev",
        search: "?nexnet=https://evil.example.test",
      }),
    ).toBe("https://chat.example.test");
  });
});
