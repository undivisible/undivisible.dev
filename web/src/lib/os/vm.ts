"use client";

/**
 * The machine that is the page.
 *
 * v86 emulating an i686 PC in wasm. The kernel is Linux 7.1.3 built from
 * tschk/alpenglow's v86-i686 config with the console turned back on — VT,
 * fbcon, VESA, PS/2 keyboard — because this build has a screen to draw on.
 * The initramfs is alpenglow's real browser image (busybox branded
 * Alpenglow, bash, fastfetch, oil/wax, vro, the docs) overlaid with
 * alpenglowed-sh: the bar, the sky palette, the launcher and the apps, all
 * ordinary executables running on the real kernel.
 *
 * tty1 is the desktop. ttyS0 stays a bash debug console, and also carries
 * `@@open <url>` lines — how an app inside the machine asks the host
 * browser to open a real tab.
 */

type Progress = { message: string; percent: number | null; ready: boolean };

type V86Emulator = {
  add_listener(name: string, handler: (arg: unknown) => void): void;
  serial0_send(text: string): void;
  keyboard_send_text(text: string): void;
  destroy(): void;
};

class VmManager {
  private emulator: V86Emulator | null = null;
  private starting = false;
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

      const emulator = new V86({
        wasm_path: "/v86/v86.wasm",
        screen_container: screen,
        bios: { url: "/v86/seabios.bin" },
        vga_bios: { url: "/v86/vgabios.bin" },
        bzimage: { url: "/v86/alpenglowed-vmlinuz" },
        initrd: { url: "/v86/alpenglowed-initrd.cpio.gz" },
        cmdline: "console=ttyS0 console=tty1 rdinit=/init loglevel=4 vga=0x344",
        memory_size: 256 * 1024 * 1024,
        vga_memory_size: 8 * 1024 * 1024,
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

  /** Types into the machine's PS/2 keyboard — for touch keyboards. */
  typeText(text: string): void {
    this.emulator?.keyboard_send_text(text);
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
