import { DurableObject } from "cloudflare:workers";
import { Gateway, type GatewaySocket, type SocketData } from "./nexnet/gateway";
import { configFromEnv } from "./nexnet/config";
import { DevChainClient } from "./nexnet/chain";
import { Store } from "./nexnet/store";
import { Challenges } from "./nexnet/challenges";
import { boundedRequest } from "./nexnet/request";

type Env = {
  ASSETS: Fetcher;
  NEXNET: DurableObjectNamespace;
  NEXNET_ORIGIN: string;
  NEXNET_ENABLED?: string;
  NEXNET_OWNER_IDENTITY?: string;
};

type SocketAttachment = Omit<SocketData, "channels" | "timer"> & {
  channels: string[];
};

/** One coordinated personal network per site; preview and production are separate. */
export class NexnetNetwork extends DurableObject<Env> {
  private readonly gateway: Gateway;
  private readonly sockets = new Map<WebSocket, GatewaySocket>();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS authority (id INTEGER PRIMARY KEY CHECK(id=1), state TEXT NOT NULL)",
    );
    const chain = new DevChainClient({
      load: () =>
        ctx.storage.sql
          .exec<{ state: string }>("SELECT state FROM authority WHERE id=1")
          .toArray()[0]?.state ?? null,
      save: (serialized) => {
        ctx.storage.sql.exec(
          "INSERT INTO authority(id,state) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state",
          serialized,
        );
      },
    });
    const origin = new URL(env.NEXNET_ORIGIN);
    this.gateway = new Gateway(
      configFromEnv({
        NEXNET_MODE: "dev-chain",
        NEXNET_AUDIENCE: origin.origin,
        NEXNET_RP_ID: origin.hostname,
        NEXNET_ORIGINS: origin.origin,
        NEXNET_OWNER_IDENTITY: env.NEXNET_OWNER_IDENTITY,
      }),
      chain,
      new Store(ctx.storage),
      new Challenges(ctx.storage),
    );
    for (const socket of ctx.getWebSockets())
      this.gateway.resumeSocket(this.wrapSocket(socket));
  }

  private wrapSocket(socket: WebSocket, initial?: SocketData): GatewaySocket {
    const existing = this.sockets.get(socket);
    if (existing) return existing;
    const saved = socket.deserializeAttachment() as SocketAttachment | null;
    const data: SocketData = initial ?? {
      tokenHash: saved?.tokenHash ?? null,
      channels: new Set((saved?.channels as ("public" | "updates")[]) ?? []),
      ready: saved?.ready ?? false,
      timer: null,
    };
    const persist = () =>
      socket.serializeAttachment({
        tokenHash: data.tokenHash,
        channels: [...data.channels],
        ready: data.ready,
      } satisfies SocketAttachment);
    const wrapped: GatewaySocket = {
      data,
      send(message) {
        persist();
        socket.send(message);
      },
      close(code, reason) {
        socket.close(code, reason);
      },
    };
    persist();
    this.sockets.set(socket, wrapped);
    return wrapped;
  }

  override async fetch(request: Request): Promise<Response> {
    let upgrade: Response | undefined;
    const response = await this.gateway.handle(request, {
      requestIP: (req) => ({
        address: req.headers.get("CF-Connecting-IP") ?? "unknown",
      }),
      upgrade: (_req, { data }) => {
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);
        this.ctx.acceptWebSocket(server);
        this.gateway.onSocketOpen(this.wrapSocket(server, data));
        upgrade = new Response(null, { status: 101, webSocket: client });
        return true;
      },
    });
    return (
      response ?? upgrade ?? new Response("Invalid upgrade", { status: 400 })
    );
  }

  override async webSocketMessage(
    socket: WebSocket,
    message: string | ArrayBuffer,
  ): Promise<void> {
    if (typeof message !== "string" || message.length > 8192) {
      socket.close(1009, "Invalid frame");
      return;
    }
    await this.gateway.onSocketMessage(this.wrapSocket(socket), message);
  }

  override webSocketClose(socket: WebSocket): void {
    this.gateway.onSocketClose(this.wrapSocket(socket));
    this.sockets.delete(socket);
  }

  override webSocketError(socket: WebSocket): void {
    this.webSocketClose(socket);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path.startsWith("/v1/")) {
      if (env.NEXNET_ENABLED === "false")
        return Response.json(
          {
            error: {
              code: "unconfigured",
              message: "Nexnet is temporarily unavailable",
            },
          },
          { status: 503, headers: { "cache-control": "no-store" } },
        );
      const origin = request.headers.get("Origin");
      if (origin !== null && origin !== env.NEXNET_ORIGIN)
        return Response.json(
          { error: { code: "forbidden", message: "Origin not allowed" } },
          { status: 403 },
        );
      const bounded = await boundedRequest(request);
      if (bounded instanceof Response) return bounded;
      const id = env.NEXNET.idFromName(new URL(env.NEXNET_ORIGIN).hostname);
      return env.NEXNET.get(id).fetch(bounded);
    }
    return env.ASSETS.fetch(request);
  },
};
