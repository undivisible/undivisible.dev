# Vendored Nexnet Packages

Runtime source vendored from the Nexnet repository for the internal Cloudflare
gateway (`web/server/nexnet`). This is a personal site-backed development
authority, not a consensus blockchain.

- Upstream: `https://github.com/tschk/nexnet` branch `feat/web-terminal-identity`
- Upstream commit: `41f3f61cb03ca941b05d23e67169ee42ac8764b0`
- License: ISC (see `vendor/LICENSE`)
- Tests (`*.test.ts`) intentionally excluded.

| Path               | Vendored from                                  |
| ------------------ | ---------------------------------------------- |
| `vendor/types/`    | `packages/types/src`                           |
| `vendor/protocol/` | `packages/protocol/src`                        |
| `vendor/crypto/`   | `packages/crypto/src`                          |
| `../chain.ts`      | `packages/client/src/chain-stub.ts` (modified) |

## chain.ts modifications

Copied from `packages/client/src/chain-stub.ts`. `DevChainClient` keeps its name
but is no longer a consensus blockchain stub — it is the in-memory development
authority for this gateway.

- Removed `node:fs` and `node:path` imports (Workers have no filesystem).
- Replaced disk persistence with an injected synchronous persistence interface:
  `constructor(storage?: { load(): string | null; save(serialized: string): void })`.
  When provided, `storage.load()` (if it returns a string) restores state at
  construction; `persist()` serializes the same `PersistedState` and calls
  `storage.save(JSON.stringify(state))`. Without storage the client is purely
  in-memory.
- No filesystem paths are referenced.

`@nexnet/*` import aliases are preserved untouched; bundling is configured
separately by the gateway owner.

`protocol/ssh.ts` explicitly sets the standard `ignoreBOM: false` TextDecoder
default to satisfy the Workers runtime types.
