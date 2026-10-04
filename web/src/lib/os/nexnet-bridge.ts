export type NexnetEmulator = {
  add_listener(name: string, handler: (arg: unknown) => void): void;
  bus: { send(name: string, data: unknown): void };
};

type BridgeModule = {
  createBridge(
    options: { gatewayUrl: string | null },
    send: (frame: string) => void,
  ): {
    feed(bytes: Uint8Array): void;
    registerPasskey(): Promise<void>;
    passkeySupported(): boolean;
    hasWallet(): Promise<boolean>;
    close(): void;
  };
};

export type NexnetBridge = {
  registerPasskey(): Promise<void>;
  passkeySupported(): boolean;
  hasWallet(): Promise<boolean>;
  close(): void;
};

const CHUNK = 2048;

export function nexnetGatewayUrl(
  configured: string | undefined,
  location: Pick<Location, "hostname" | "search">,
): string | null {
  const local =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === "[::1]";
  const override = local
    ? new URLSearchParams(location.search).get("nexnet")
    : null;
  const value = override ?? configured ?? null;
  if (!value) return null;
  try {
    const url = new URL(value);
    const loopback =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

function loadModule(url: string): Promise<unknown> {
  return import(/* @vite-ignore */ url);
}

export async function attachNexnetBridge(
  emulator: NexnetEmulator,
  gatewayUrl: string | null,
  isCurrent: () => boolean,
): Promise<NexnetBridge | null> {
  const module = (await loadModule("/nexnet/bridge.js")) as BridgeModule;
  if (!isCurrent()) return null;
  const encoder = new TextEncoder();
  const bridge = module.createBridge({ gatewayUrl }, (frame) => {
    const bytes = encoder.encode(frame);
    for (let at = 0; at < bytes.length; at += CHUNK) {
      emulator.bus.send(
        "virtio-console0-input-bytes",
        bytes.slice(at, at + CHUNK),
      );
    }
  });
  emulator.add_listener("virtio-console0-output-bytes", (bytes) => {
    if (bytes instanceof Uint8Array) bridge.feed(bytes);
  });
  return bridge;
}
