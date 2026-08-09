"use client";

/**
 * The one real machine on the page.
 *
 * v86 emulating an i686 PC in wasm, booting the actual Alpenglow browser
 * build out of /public/v86 — the same kernel bzImage (Linux 7.1.3, built
 * from tschk/alpenglow's v86-i686 config) and the same initramfs (busybox
 * branded Alpenglow, bash, fastfetch, oil/wax, vro, the docs) that
 * alpenglow.tsc.hk boots. Serial console on ttyS0; the kernel config has no
 * VT and no framebuffer, so the terminal IS the machine.
 *
 * One VM per page. Windows attach to it and detach from it; closing the
 * window doesn't power anything off.
 */

type Progress = { message: string; percent: number | null; ready: boolean };

type V86Emulator = {
  add_listener(name: string, handler: (arg: unknown) => void): void;
  serial0_send(text: string): void;
  destroy(): void;
};

const SERIAL_BUFFER_MAX = 262_144;

class VmManager {
  private emulator: V86Emulator | null = null;
  private starting = false;
  private buffer = "";
  private serialListeners = new Set<(chunk: string) => void>();
  private progressListeners = new Set<(progress: Progress) => void>();
  private progress: Progress = { message: "cold", percent: null, ready: false };
  cols = 100;
  rows = 28;

  get running(): boolean {
    return this.emulator !== null;
  }
  get ready(): boolean {
    return this.progress.ready;
  }

  /** Boot, once. Later calls are free. */
  async start(cols?: number, rows?: number): Promise<void> {
    if (this.emulator || this.starting || typeof window === "undefined") return;
    this.starting = true;
    if (cols) this.cols = cols;
    if (rows) this.rows = rows;

    try {
      // The library stays an asset, imported at runtime like the alpenglow
      // site does it, so the bundler never sees 350 KB of emulator.
      const libUrl = "/v86/libv86.mjs";
      const { V86 } = (await import(/* @vite-ignore */ libUrl)) as {
        V86: new (options: Record<string, unknown>) => V86Emulator;
      };

      this.emit({ message: "loading the machine", percent: 0, ready: false });

      const emulator = new V86({
        wasm_path: "/v86/v86.wasm",
        screen_container: null,
        bios: { url: "/v86/seabios.bin" },
        vga_bios: { url: "/v86/vgabios.bin" },
        bzimage: { url: "/v86/alpenglow-v86-vmlinuz" },
        initrd: { url: "/v86/alpenglow-v86-initrd.cpio.gz" },
        cmdline: `console=ttyS0 rdinit=/init quiet loglevel=2 alpenglow.cols=${this.cols} alpenglow.rows=${this.rows}`,
        memory_size: 256 * 1024 * 1024,
        autostart: true,
      });
      this.emulator = emulator;

      emulator.add_listener("serial0-output-byte", (byte) => {
        if (byte === 0xff) return;
        const ch = String.fromCharCode(byte as number);
        this.buffer = (this.buffer + ch).slice(-SERIAL_BUFFER_MAX);
        for (const listener of this.serialListeners) listener(ch);
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
          message: "download failed — the machine needs the real site",
          percent: this.progress.percent,
          ready: false,
        });
      });

      emulator.add_listener("emulator-ready", () => {
        this.emit({ message: "booting", percent: 100, ready: true });
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

  send(text: string): void {
    this.emulator?.serial0_send(text);
  }

  /** Attach a terminal: replay what happened, then follow along. */
  attachSerial(listener: (chunk: string) => void): () => void {
    if (this.buffer) listener(this.buffer);
    this.serialListeners.add(listener);
    return () => this.serialListeners.delete(listener);
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

/** Module-level: the machine outlives every component that looks at it. */
export const vm = new VmManager();
export type { Progress as VmProgress };
