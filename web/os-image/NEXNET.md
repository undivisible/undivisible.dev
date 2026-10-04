# Nexnet in the Linux guest

`overlay/usr/bin/nexnet` is the Crepuscularity terminal chat from
`tschk/nexnet` (`terminal/`, crate `nexnet-term`, `crepuscularity-tui 0.4.24`),
built for `i686-unknown-linux-musl`.

- Source commit: `eae24c4d2a78bd2cbdadcd4b9e7068ec13adfe83` on the nexnet
  branch `feat/web-terminal-identity` (not yet pushed or merged at the time of
  writing; replace this line with the merge commit when it lands).
- ELF32 Intel 80386, static, stripped, 1,012,568 bytes.
- SHA-256: `b1207ed4fbe331189c6599a767bd36c0befd2b2d848e0f85150f545fbc771d57`.
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

- SHA-256: `b6a0d6b9a13cbc4e18c0f79a2e9b001e0c7558cceb645cbe3efdb493528354c9`,
  from the same source commit.
- It keeps the wallet in this browser's IndexedDB, signs challenges and events,
  and calls the gateway with `fetch`. It can register and use a WebAuthn passkey
  (footer button "add a passkey") once an identity exists.
- SSH-key sign-in is a Linux-terminal feature (`nexnet-agent` with
  `ssh-keygen`) and is not available in the browser.

## Gateway endpoint

`NEXT_PUBLIC_NEXNET_GATEWAY_URL` selects the gateway at build time. It must be
an `https` origin (or loopback `http`). Unset means the UI shows the gateway as
unconfigured and reading and posting stay off. No endpoint is built in. On
`localhost`, `127.0.0.1` and `[::1]` only, `?nexnet=<origin>` overrides it for
development. The gateway must list this site's origin in `NEXNET_ORIGINS`, and its `NEXNET_AUDIENCE` must equal the gateway's own https origin: the bridge refuses to sign a sign-in challenge for any other audience.

## Keys

`1` Updates, `2` Public chat, `3` Identity (`c` create, `s` method, Enter sign
in, `o` sign out); Tab cycles pages; `e` or Enter edits; Esc leaves the editor;
`q` outside the editor or Ctrl+C exits. The Linux console has 16 colours;
`init` sets them to the desktop palette. Keep the Linux-primary theme and the
static Simple fallback.
