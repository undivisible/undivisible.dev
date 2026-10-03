# Nexnet guest shell

`overlay/usr/bin/nexnet` is the static Linux candidate from the Nexnet terminal
handoff, source commit `f0dbc9bfb735171e6e3fff795da065b8a1df8503`. Its embedded
Crepuscularity `.crepus` template owns the app layout. The Rust loop owns local
navigation and the memory-only draft. It uses locked `crepuscularity-tui 0.4.24`;
the independent upstream source review accepted its offline boundary.

- Target: `i686-unknown-linux-musl`, ELF32 Intel 80386, static and stripped.
- Bytes: 1,428,296.
- SHA-256: `0d3317281c09bac7e75b6f1655577114ce25a1628d689956d6cb3e7253652c57`.
- Source/build manifest SHA-256:
  `dfe42a0ff7511df6561e22fdbb91062e8220edf2b6ae6d8672e21dcd4534941b`.
- Built with cached stable Rust 1.98.1, cargo-zigbuild 0.23.0 and Zig 0.16.0,
  locked offline dependencies and one build job. The website copies this verified
  executable; it does not rebuild or modify Nexnet source during site builds.
- ISC notice: `overlay/usr/share/doc/nexnet/LICENSE`.

The existing desktop scans `/usr/bin`. Its non-builtin console handover runs
Nexnet on real tty1 and restarts the desktop when it exits. Type `nexnet` in the
launcher; there is no replacement wrapper, new daemon or compositor builtin.

`1` Updates, `2` Public chat, `3` Identity; Tab cycles pages. Updates cannot be
edited. In Public chat, e or Enter edits a local draft. Enter refuses submission
and retains the draft. Ordinary letters including q are text while editing.
Esc leaves the editor; q outside the editor or Ctrl+C exits. Quit discards the
memory-only draft. Sign-in, sessions, network, posting and IPC are absent.
The website's touch controls include a labeled Ctrl+C button to exit even while
editing a draft.

The Linux virtual console has a 16-color palette and the existing bitmap font.
Init sets that palette to the desktop colors. Full RGB app styles can fall back
to the console foreground/background; CJK glyphs are limited by its font. This
does not establish full Unicode rendering or the windowed terminal's support.
The website's touch keyboard sends ASCII commands. The app supports local UTF-8
drafts on terminals that provide them. Keep the existing Linux-primary theme
and static Simple fallback when packaging this shell.
