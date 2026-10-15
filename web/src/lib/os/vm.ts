"use client";

import {
  cssToGuest,
  guestDelta,
  type MachineStage,
} from "@/lib/os/machine-input";
import { emulatorLifecycle } from "@/lib/os/emulator-lifecycle";
import {
  attachNexnetBridge,
  nexnetGatewayUrl,
  type NexnetBridge,
  type NexnetEmulator,
} from "@/lib/os/nexnet-bridge";

/**
 * The machine that is the page.
 *
 * v86 emulating an i686 PC in wasm. The kernel is Linux 7.1.3 built from
 * tschk/alpenglow's v86-i686 config with the console turned back on — VT,
 * fbcon, VESA, PS/2 keyboard — because this build has a screen to draw on.
 * The initramfs is alpenglow's real browser image (busybox branded
 * Alpenglow, bash, fastfetch, oil/wax, vro, the docs) overlaid with
 * undesk: the bar, the sky palette, the launcher and the apps, all
 * ordinary executables running on the real kernel.
 *
 * tty1 is the desktop. ttyS0 stays a bash debug console, and also carries
 * `@@open <url>` lines — how an app inside the machine asks the host
 * browser to open a real tab.
 */

type Progress = {
  message: string;
  percent: number | null;
  ready: boolean;
  stage: MachineStage;
};

/** The guest mode to match the element it renders into. Width is a multiple
 *  of 8 (VBE convention); axes stay within the compositor's MAXW/MAXH and the
 *  32 MB of emulated VRAM. Aspect is preserved so CSS fill has no gutters. */
function screenResolution(el: HTMLElement): string {
  // Full retina (≈1920×1200) is too many pixels for an emulated i686 composite
  // every frame. 1.5× is sharp on a laptop; we clamp inside MAXW/MAXH without
  // independently squashing width/height (that mismatch caused letterboxing).
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const rect = el.getBoundingClientRect();
  const cssW = Math.max(1, rect.width);
  const cssH = Math.max(1, rect.height);
  const MAX_W = 1600;
  const MAX_H = 1200;
  const MIN_W = 1024;
  const MIN_H = 640;

  let w = Math.round((cssW * dpr) / 8) * 8;
  let h = Math.max(1, Math.round(cssH * dpr));

  const fit = (sw: number, sh: number, maxW: number, maxH: number) => {
    if (sw <= maxW && sh <= maxH) return { w: sw, h: sh };
    const scale = Math.min(maxW / sw, maxH / sh);
    return {
      w: Math.max(8, Math.round((sw * scale) / 8) * 8),
      h: Math.max(1, Math.round(sh * scale)),
    };
  };

  ({ w, h } = fit(w, h, MAX_W, MAX_H));
  if (w < MIN_W || h < MIN_H) {
    const scale = Math.max(MIN_W / w, MIN_H / h);
    ({ w, h } = fit(
      Math.round((w * scale) / 8) * 8,
      Math.round(h * scale),
      MAX_W,
      MAX_H,
    ));
  }
  return `${w}x${h}`;
}

type V86Emulator = {
  add_listener(name: string, handler: (arg: unknown) => void): void;
  serial0_send(text: string): void;
  keyboard_send_text(text: string): Promise<void>;
  lock_mouse(): Promise<void>;
  destroy(): Promise<void>;
  run(): Promise<void>;
  keyboard_set_enabled(enabled: boolean): void;
  keyboard_send_scancodes(codes: number[]): Promise<void>;
  bus: { send(name: string, data: unknown): void };
};

class VmManager {
  private nexnet: NexnetBridge | null = null;
  private emulator: V86Emulator | null = null;
  private starting = false;
  private controller: AbortController | null = null;
  private disposeEmulator: (() => void) | null = null;
  private keyboardCaptured = false;
  private startupTimeout: ReturnType<typeof setTimeout> | undefined;
  private guestW = 1024;
  private guestH = 700;
  private serialLine = "";
  private progressListeners = new Set<(progress: Progress) => void>();
  private progress: Progress = {
    message: "cold",
    percent: null,
    ready: false,
    stage: "cold",
  };
  private openListener: ((url: string) => void) | null = null;
  private cursorX = 0;
  private cursorY = 0;
  private cursorSeeded = false;

  get running(): boolean {
    return this.emulator !== null;
  }
  get ready(): boolean {
    return this.progress.ready;
  }

  /** Power on, rendering into `screen` (a div holding a text div + canvas). */
  async start(screen: HTMLElement): Promise<void> {
    if (this.emulator || this.starting || typeof window === "undefined") return;
    this.starting = true;
    const controller = new AbortController();
    this.controller = controller;
    const isCurrent = () =>
      this.controller === controller && !controller.signal.aborted;
    this.startupTimeout = setTimeout(() => {
      if (!isCurrent()) return;
      this.stop();
      this.emit({
        message:
          "Startup timed out. Stop the machine and try again, or use the simple version.",
        percent: null,
        ready: false,
        stage: "failed",
      });
    }, 90_000);

    try {
      const libUrl = "/v86/libv86.mjs";
      const { V86 } = (await import(/* @vite-ignore */ libUrl)) as {
        V86: new (options: Record<string, unknown>) => V86Emulator;
      };
      if (!isCurrent()) return;

      this.emit({
        message: "loading the machine",
        percent: 0,
        ready: false,
        stage: "loading",
      });

      // Fetch the initrd ourselves and gunzip it on the host — native speed —
      // so the emulated cpu never pays for decompressing a 10 MB archive.
      // The wire stays gzip; v86 gets the raw cpio buffer.
      const initrdRes = await fetch("/v86/undesk-initrd.cpio.gz", {
        signal: controller.signal,
      });
      if (!initrdRes.ok || !initrdRes.body) {
        throw new Error(`initrd fetch failed (${initrdRes.status})`);
      }
      const total = Number(initrdRes.headers.get("content-length")) || 0;
      let seen = 0;
      const counted = new TransformStream<Uint8Array, Uint8Array>({
        transform: (chunk, controller) => {
          seen += chunk.byteLength;
          if (total > 0 && isCurrent()) {
            const percent = (seen / total) * 60;
            this.emit({
              message: `loading alpenglow ${Math.round(percent)}%`,
              percent,
              ready: false,
              stage: "loading",
            });
          }
          controller.enqueue(chunk);
        },
      });
      const gunzip = new DecompressionStream(
        "gzip",
      ) as unknown as ReadableWritablePair<Uint8Array, Uint8Array>;
      const initrdBuffer = await new Response(
        initrdRes.body.pipeThrough(counted).pipeThrough(gunzip),
      ).arrayBuffer();
      if (!isCurrent()) return;

      // Fetch every machine file with the current run's abort signal. v86's
      // own downloader cannot be cancelled during initialization.
      const asset = async (path: string) => {
        const response = await fetch(path, { signal: controller.signal });
        if (!response.ok)
          throw new Error(`Machine file failed to load (${response.status})`);
        return response.arrayBuffer();
      };
      const [bios, vgaBios, kernel, wasm] = await Promise.all([
        asset("/v86/seabios.bin"),
        asset("/v86/vgabios.bin"),
        asset("/v86/undesk-vmlinuz"),
        asset("/v86/v86.wasm"),
      ]);
      const wasmModule = await WebAssembly.compile(wasm);
      if (!isCurrent()) return;

      const emulator = new V86({
        wasm_path: "/v86/v86.wasm",
        wasm_fn: async (imports: WebAssembly.Imports) =>
          (await WebAssembly.instantiate(wasmModule, imports)).exports,
        screen_container: screen,
        bios: { buffer: bios },
        vga_bios: { buffer: vgaBios },
        bzimage: { buffer: kernel },
        initrd: { buffer: initrdBuffer },
        // video= asks bochs-drm for a real mode (vga= is ignored under v86's
        // fast bzImage loader). Match the machine to the window it's shown
        // in, so it renders native pixels instead of upscaling a fixed
        // image into blocks — clamped to the compositor's max and the VRAM.
        cmdline: `console=ttyS0 console=tty1 rdinit=/init loglevel=4 video=${(() => {
          const res = screenResolution(screen);
          const [w, h] = res.split("x").map(Number);
          this.guestW = w ?? 1024;
          this.guestH = h ?? 700;
          return res;
        })()}`,
        // 512 MB so a browser and the desktop have real headroom; 32 MB of
        // VRAM so a large framebuffer fits (1920x1200x32 is ~9.2 MB).
        memory_size: 512 * 1024 * 1024,
        vga_memory_size: 32 * 1024 * 1024,
        virtio_console: true,
        autostart: false,
      });
      this.emulator = emulator;
      emulator.keyboard_set_enabled(this.keyboardCaptured);
      void attachNexnetBridge(
        emulator as unknown as NexnetEmulator,
        nexnetGatewayUrl(
          process.env.NEXT_PUBLIC_NEXNET_GATEWAY_URL,
          window.location,
        ),
        isCurrent,
      ).then(
        (bridge) => {
          if (bridge && isCurrent()) this.nexnet = bridge;
          else bridge?.close();
        },
        () => undefined,
      );

      // The serial line is the machine's voice to the host: watch for
      // @@open lines from the sites app; everything else is debug.
      emulator.add_listener("serial0-output-byte", (byte) => {
        if (!isCurrent()) return;
        const ch = String.fromCharCode(byte as number);
        if (ch === "\n") {
          const line = this.serialLine;
          this.serialLine = "";
          const match = line.match(/@@open (\S+)/);
          if (match?.[1]) this.openListener?.(match[1]);
          // The desktop drew its first frame — now it's ready, not merely
          // when the emulator started (that still shows the boot log).
          if (line.includes("@@desktop")) {
            clearTimeout(this.startupTimeout);
            this.emit({
              message: "ready",
              percent: 100,
              ready: true,
              stage: "ready",
            });
          }
          return;
        }
        this.serialLine = (this.serialLine + ch).slice(-500);
      });

      emulator.add_listener("download-progress", (event) => {
        if (!isCurrent()) return;
        const e = event as {
          lengthComputable?: boolean;
          total?: number;
          loaded?: number;
          file_index?: number;
          file_count?: number;
        };
        if (e.lengthComputable && e.total && e.file_count) {
          const percent =
            (((e.file_index ?? 0) + (e.loaded ?? 0) / e.total) / e.file_count) *
            100;
          this.emit({
            message: `loading alpenglow ${Math.round(percent)}%`,
            percent,
            ready: false,
            stage: "loading",
          });
        }
      });

      emulator.add_listener("download-error", () => {
        if (!isCurrent()) return;
        this.stop();
        this.emit({
          message:
            "The machine files could not be loaded. Stop the machine and try again, or use the simple version.",
          percent: this.progress.percent,
          ready: false,
          stage: "failed",
        });
      });

      this.disposeEmulator = emulatorLifecycle(emulator, {
        current: isCurrent,
        failed: (error) => {
          if (!isCurrent()) return;
          this.stop();
          this.emit({
            message: `Machine failed: ${String(error)}`,
            percent: null,
            ready: false,
            stage: "failed",
          });
        },
        ready: () => {
          emulator.keyboard_set_enabled(this.keyboardCaptured);
          // Downloaded and started — but keep `ready` false so the cover holds
          // over the kernel boot log until the desktop signals @@desktop.
          this.emit({
            message: "booting the machine",
            percent: 100,
            ready: false,
            stage: "booting",
          });
        },
      });
    } catch (error) {
      if (controller.signal.aborted) return;
      this.stop();
      this.emit({
        message: `failed: ${error instanceof Error ? error.message : String(error)}`,
        percent: null,
        ready: false,
        stage: "failed",
      });
    } finally {
      if (this.controller === controller) this.starting = false;
    }
  }

  /** Release the VM and any pending download when leaving or stopping the lab. */
  stop(): void {
    this.controller?.abort();
    this.controller = null;
    clearTimeout(this.startupTimeout);
    this.startupTimeout = undefined;
    this.emulator?.keyboard_set_enabled(false);
    this.nexnet?.close();
    this.nexnet = null;
    this.disposeEmulator?.();
    this.disposeEmulator = null;
    this.emulator = null;
    this.starting = false;
    this.openListener = null;
    this.serialLine = "";
    this.cursorSeeded = false;
    this.keyboardCaptured = false;
    this.emit({ message: "cold", percent: null, ready: false, stage: "cold" });
  }

  /** Types into the machine's PS/2 keyboard — for touch keyboards. */
  async typeText(text: string): Promise<void> {
    const emulator = this.emulator;
    if (!emulator || !this.ready) return;
    emulator.keyboard_set_enabled(true);
    try {
      await emulator.keyboard_send_text(text);
    } finally {
      if (this.emulator === emulator)
        emulator.keyboard_set_enabled(this.keyboardCaptured);
    }
  }

  captureKeyboard(enabled: boolean): void {
    this.keyboardCaptured = enabled;
    this.emulator?.keyboard_set_enabled(enabled);
  }

  nexnetPasskeyAvailable(): boolean {
    return this.nexnet?.passkeySupported() ?? false;
  }

  async registerNexnetPasskey(): Promise<void> {
    if (!this.nexnet) throw new Error("The machine is not running");
    await this.nexnet.registerPasskey();
  }

  /** Ctrl+C for touch users: exit a console app or interrupt its command. */
  async interrupt(): Promise<void> {
    if (!this.ready) return;
    await this.emulator?.keyboard_send_scancodes([0x1d, 0x2e, 0xae, 0x9d]);
  }

  releaseKeyboard(): void {
    // Close the guest launcher too, then return Tab/Enter to the host page.
    void this.emulator?.keyboard_send_scancodes([0x01, 0x81]);
    this.captureKeyboard(false);
  }

  /** Capture the pointer for the machine's PS/2 mouse. Esc releases it. */
  async lockMouse(): Promise<boolean> {
    if (!this.emulator) return false;
    try {
      await this.emulator.lock_mouse();
      return true;
    } catch {
      return false;
    }
  }

  /** Touch: a finger-move in css pixels becomes a PS/2 mouse delta in guest
   *  pixels. Touch screens have no pointer lock, so this is the only way a
   *  phone can move the machine's cursor. */
  touchDelta(dxCss: number, dyCss: number, rectW: number, rectH: number): void {
    if (rectW <= 0 || rectH <= 0) return;
    const dx = Math.round((dxCss * this.guestW) / rectW);
    const dy = Math.round((dyCss * this.guestH) / rectH);
    if (dx === 0 && dy === 0) return;
    this.sendGuestDelta(dx, dy);
  }

  touchAt(xCss: number, yCss: number, rectW: number, rectH: number): void {
    const to = cssToGuest(xCss, yCss, rectW, rectH, this.guestW, this.guestH);
    if (!this.cursorSeeded) {
      this.sendGuestDelta(-this.guestW, -this.guestH);
      this.sendGuestDelta(to.x, to.y);
      this.cursorX = to.x;
      this.cursorY = to.y;
      this.cursorSeeded = true;
      return;
    }
    const { dx, dy } = guestDelta({ x: this.cursorX, y: this.cursorY }, to);
    this.cursorX = to.x;
    this.cursorY = to.y;
    this.sendGuestDelta(dx, dy);
  }

  private sendGuestDelta(dx: number, dy: number): void {
    if (dx === 0 && dy === 0) return;
    // v86 drops relative deltas unless it believes the pointer is locked —
    // touch never locks, so claim it. The guest inverts y (PS/2: up is +).
    this.emulator?.bus.send("mouse-pointer-lock", true);
    this.emulator?.bus.send("mouse-delta", [dx, -dy]);
  }

  /** Press or release the machine's left mouse button (taps, drags). */
  touchButton(down: boolean): void {
    this.emulator?.bus.send("mouse-pointer-lock", true);
    this.emulator?.bus.send("mouse-click", [down, false, false]);
  }

  /** The in-machine browsers own the keyboard and have no quit key — this
   *  kills them over the ttyS0 bash console, and init brings the desktop
   *  back. The escape hatch for "stuck in netsurf". */
  exitBrowser(): void {
    this.emulator?.serial0_send("\x03\npkill netsurf-fb; pkill links\n");
  }

  onOpenRequest(listener: (url: string) => void): void {
    this.openListener = listener;
  }

  attachProgress(listener: (progress: Progress) => void): () => void {
    listener(this.progress);
    this.progressListeners.add(listener);
    return () => this.progressListeners.delete(listener);
  }

  private emit(progress: Progress) {
    this.progress = progress;
    for (const listener of this.progressListeners) listener(progress);
  }
}

export const vm = new VmManager();
export type { Progress as VmProgress };
