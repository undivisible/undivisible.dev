type Emulator = {
  add_listener(name: string, listener: () => void): void;
  run(): Promise<void>;
  destroy(): Promise<void>;
};

/** v86 cannot be destroyed before initialization and must never autostart a stale run. */
export function emulatorLifecycle(
  emulator: Emulator,
  options: {
    current: () => boolean;
    ready: () => void;
    failed: (error: unknown) => void;
  },
) {
  let initialized = false;
  let disposed = false;
  let destroying = false;
  const destroy = () => {
    if (!initialized || destroying) return;
    destroying = true;
    void emulator.destroy().catch(options.failed);
  };
  emulator.add_listener("emulator-ready", () => {
    initialized = true;
    if (disposed || !options.current()) {
      destroy();
      return;
    }
    options.ready();
    if (disposed || !options.current()) {
      destroy();
      return;
    }
    void emulator.run().catch(options.failed);
  });
  return () => {
    disposed = true;
    destroy();
  };
}
