"use client";

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

type Progress = { message: string; percent: number | null; ready: boolean };

/** The guest mode to match the element it renders into. Width is a multiple
 *  of 8 (VBE convention); both axes are clamped to the compositor's MAXW/MAXH
 *  and stay within the 32 MB of emulated VRAM. */
function screenResolution(el: HTMLElement): string {
  // Full retina density means up to 1920x1200 = 2.3M pixels pushed through
  // an emulated i686 on every composite — the whole desktop feels slow.
  // 1.25x is visually close on a laptop and roughly halves the pixel work.
  const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
  const rect = el.getBoundingClientRect();
  const cap = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));
  const w = cap(Math.round((rect.width * dpr) / 8) * 8, 1024, 1600);
  const h = cap(Math.round(rect.height * dpr), 700, 1000);
  return `${w}x${h}`;
}

type V86Emulator = {
  add_listener(name: string, handler: (arg: unknown) => void): void;
  serial0_send(text: string): void;
  keyboard_send_text(text: string): void;
  lock_mouse(): void;
  destroy(): void;
  bus: { send(name: string, data: unknown): void };
};

class VmManager {
  private emulator: V86Emulator | null = null;
  private starting = false;
  private guestW = 1024;
  private guestH = 700;
  private serialLine = "";
  private progressListeners = new Set<(progress: Progress) => void>();
  private progress: Progress = { message: "cold", percent: null, ready: false };
  private openListener: ((url: string) => void) | null = null;

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

    try {
      const libUrl = "/v86/libv86.mjs";
      const { V86 } = (await import(/* @vite-ignore */ libUrl)) as {
        V86: new (options: Record<string, unknown>) => V86Emulator;
      };

      this.emit({ message: "loading the machine", percent: 0, ready: false });

      // Fetch the initrd ourselves and gunzip it on the host — native speed —
      // so the emulated cpu never pays for decompressing a 10 MB archive.
      // The wire stays gzip; v86 gets the raw cpio buffer.
      const initrdRes = await fetch("/v86/undesk-initrd.cpio.gz");
      if (!initrdRes.ok || !initrdRes.body) {
        throw new Error(`initrd fetch failed (${initrdRes.status})`);
      }
      const total = Number(initrdRes.headers.get("content-length")) || 0;
      let seen = 0;
      const counted = new TransformStream<Uint8Array, Uint8Array>({
        transform: (chunk, controller) => {
          seen += chunk.byteLength;
          if (total > 0) {
            const percent = (seen / total) * 60;
            this.emit({
              message: `loading alpenglow ${Math.round(percent)}%`,
              percent,
              ready: false,
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

      const emulator = new V86({
        wasm_path: "/v86/v86.wasm",
        screen_container: screen,
        bios: { url: "/v86/seabios.bin" },
        vga_bios: { url: "/v86/vgabios.bin" },
        bzimage: { url: "/v86/undesk-vmlinuz" },
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
        autostart: true,
      });
      this.emulator = emulator;

      // The serial line is the machine's voice to the host: watch for
      // @@open lines from the sites app; everything else is debug.
      emulator.add_listener("serial0-output-byte", (byte) => {
        const ch = String.fromCharCode(byte as number);
        if (ch === "\n") {
          const line = this.serialLine;
          this.serialLine = "";
          const match = line.match(/@@open (\S+)/);
          if (match?.[1]) this.openListener?.(match[1]);
          // The desktop drew its first frame — now it's ready, not merely
          // when the emulator started (that still shows the boot log).
          if (line.includes("@@desktop")) {
            this.emit({ message: "ready", percent: 100, ready: true });
          }
          return;
        }
        this.serialLine = (this.serialLine + ch).slice(-500);
      });

      emulator.add_listener("download-progress", (event) => {
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
          });
        }
      });

      emulator.add_listener("download-error", () => {
        this.emit({
          message:
            "the kernel and initrd could not be fetched — this frame blocks requests. it boots on the site.",
          percent: this.progress.percent,
          ready: false,
        });
      });

      emulator.add_listener("emulator-ready", () => {
        // Downloaded and started — but keep `ready` false so the cover holds
        // over the kernel boot log until the desktop signals @@desktop.
        this.emit({ message: "booting the machine", percent: 100, ready: false });
      });
    } catch (error) {
      this.emit({
        message: `failed: ${error instanceof Error ? error.message : String(error)}`,
        percent: null,
        ready: false,
      });
    } finally {
      this.starting = false;
    }
  }

  /** Types into the machine's PS/2 keyboard — for touch keyboards. */
  typeText(text: string): void {
    this.emulator?.keyboard_send_text(text);
  }

  /** Capture the pointer for the machine's PS/2 mouse. Esc releases it. */
  lockMouse(): void {
    this.emulator?.lock_mouse();
  }

  /** Touch: a finger-move in css pixels becomes a PS/2 mouse delta in guest
   *  pixels. Touch screens have no pointer lock, so this is the only way a
   *  phone can move the machine's cursor. */
  touchDelta(dxCss: number, dyCss: number, rectW: number, rectH: number): void {
    if (rectW <= 0 || rectH <= 0) return;
    const dx = Math.round((dxCss * this.guestW) / rectW);
    const dy = Math.round((dyCss * this.guestH) / rectH);
    if (dx === 0 && dy === 0) return;
    // The guest inverts y (PS/2 convention: positive is up).
    this.emulator?.bus.send("mouse-delta", [dx, -dy]);
  }

  /** Press or release the machine's left mouse button (taps, drags). */
  touchButton(down: boolean): void {
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
