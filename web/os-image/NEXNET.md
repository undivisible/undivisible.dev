# Nexnet in the Linux guest

`overlay/usr/bin/nexnet` is the Crepuscularity terminal chat from
`tschk/nexnet` (`terminal/`, crate `nexnet-term`, `crepuscularity-tui 0.4.24`),
built for `i686-unknown-linux-musl`.

- Source commit: `41f3f61cb03ca941b05d23e67169ee42ac8764b0` on the nexnet
  branch `feat/web-terminal-identity` (published to `tschk/nexnet`).
- ELF32 Intel 80386, static, stripped, 1,014,232 bytes.
- SHA-256: `55f5d9ed025adf89d37774e3a98c31d471855016b8341357be7ce174f2ae3c61`.
- Built with `cargo zigbuild --release --target i686-unknown-linux-musl`
  (Rust 1.98.1, Zig 0.16.0). The website copies this executable; it does not
  rebuild Nexnet source.
- ISC notice: `overlay/usr/share/doc/nexnet/LICENSE`.

## How it signs in and posts

The guest has no network and holds no keys. The UI speaks newline-delimited JSON
(`docs/terminal-agent.md` in nexnet) over `/dev/hvc0`, a virtio console that
`vm.ts` enables, with every line prefixed `@@nexnet `. `init` exports
`NEXNET_SERIAL=/dev/hvc0`, so the launcher's plain `nexnet` command uses it.
The UI switches the device to raw mode itself.

On the host page, `public/nexnet/bridge.js` answers those lines. It is the
nexnet `packages/agent` browser bundle (`bun run build:browser`):

- SHA-256: `0edd1b7a2d70ab0d1a57e61ab42e65dccf72fe73b218a741c5625ba8306ffdb4`,
  from the same source commit.
- It keeps the wallet in this browser's IndexedDB, signs challenges and events,
  and calls the gateway with `fetch`. It can register and use a WebAuthn passkey
  (footer button "add a passkey") once an identity exists.
- SSH-key sign-in is a Linux-terminal feature (`nexnet-agent` with
  `ssh-keygen`) and is not available in the browser.

## Internal gateway and storage

The site Worker serves the existing Nexnet `/v1/*` API on its own origin. No
separate hostname or external server is needed. `NEXNET_ORIGIN` in each Wrangler
config fixes the sign-in audience, allowed origin and WebAuthn RP ID; none comes
from an untrusted request. Preview uses `next.undivisible.dev`, production uses
`undivisible.dev`, and their SQLite-backed Durable Objects are separate.

The browser defaults to its own origin. `NEXT_PUBLIC_NEXNET_GATEWAY_URL` is an
optional external override; an explicit empty value disables Nexnet. On loopback
hosts only, `?nexnet=<origin>` can override it for development.

`server/nexnet/` adapts the upstream gateway, signed protocol and development
identity authority for Workers. Identity roots, credential commitments, passkey
counters and device authorizations are saved in the authority table. Messages,
device sequences and sessions use the upstream schema and synchronous SQLite
transactions. Single-use pending challenges also persist across eviction.
WebSocket subscriptions use hibernation attachments. Wallet private keys remain
in the browser; the server stores public identity and credential data, never
wallet secrets. This is a site-backed authority, not a consensus blockchain.

`server/nexnet/vendor/README.md` records upstream source, license and adaptations.
The browser bridge and Linux terminal executable still use the source above.

## Adding your passkey and entries

1. Launch the first suggestion, `nexnet`. Press `3` for Identity, then `c` to
   create a browser-held wallet. Press Enter to sign in with that wallet.
2. Open host **Controls** and choose **add a passkey**. Complete your browser's
   authenticator prompt. Restart Nexnet to choose passkey sign-in on Identity.
3. Press `2` for Public chat, then `e` to write and Enter to submit.

The `updates` channel remains owner-only. Set the server's non-secret
`NEXNET_OWNER_IDENTITY` to your public identity ID to enable your identity to post
there. It is deliberately never assigned to the first registrant automatically.
Public chat retains the existing 24-hour inactivity policy; Updates are retained.
A preview passkey belongs to the preview domain, so register your real passkey
on production after the authenticated release is approved.

## Local verification

`bun run dev:worker` starts the site and API on `http://localhost:8790` using local
SQLite storage. The `--local-upstream` setting keeps the local Origin intact,
which matters for WebSocket and passkey validation. The browser test in
`tests/nexnet-browser.py` checks wallet and passkey sign-in, signed posts,
owner-only Updates, WebSocket delivery, reload persistence and request boundaries.
Its optional local restart command pauses passkey verification after challenge
issuance, restarts the Worker, then verifies the saved challenge can be consumed.

## Keys

`1` Updates, `2` Public chat, `3` Identity (`c` create, `s` method, Enter sign
in, `o` sign out); Tab cycles pages; `e` or Enter edits; Esc leaves the editor;
`q` outside the editor or Ctrl+C exits. A paste never submits: newlines become spaces (bracketed paste, or an Enter arriving within 8 ms of the previous editor key on the Linux console). The Linux console has 16 colours;
`init` sets them to the desktop palette. Keep the Linux-primary theme and the
static Simple fallback.

## Disabling the API without losing accounts

For a failed authenticated rollout, set `NEXNET_ENABLED=false` and redeploy the
same Worker with its existing Durable Object binding and migration. API requests
return 503 while static pages keep working. This preserves identity, passkey,
session and message tables; reverting code never rolls back that data.
