"use client";

import { useEffect, useState } from "react";

export function KeyboardHints() {
  const [pressed, setPressed] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      setPressed((keys) => {
        if (keys.has(event.code)) return keys;
        return new Set(keys).add(event.code);
      });
    };
    const up = (event: KeyboardEvent) => {
      setPressed((keys) => {
        const next = new Set(keys);
        next.delete(event.code);
        return next;
      });
    };
    const clear = () => setPressed(new Set());
    window.addEventListener("keydown", down, true);
    window.addEventListener("keyup", up, true);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down, true);
      window.removeEventListener("keyup", up, true);
      window.removeEventListener("blur", clear);
    };
  }, []);

  return (
    <div className="machine-keyboard-hints" aria-label="Keyboard shortcuts">
      <span className="machine-keyboard-hint">
        <kbd data-pressed={pressed.has("Escape")}>Esc</kbd>
        <span>release</span>
      </span>
      <span className="machine-keyboard-hint">
        <kbd data-pressed={pressed.has("Tab")}>Tab</kbd>
        <span>switch windows</span>
      </span>
      <span className="machine-keyboard-hint">
        <kbd
          data-pressed={
            pressed.has("ControlLeft") || pressed.has("ControlRight")
          }
        >
          Ctrl
        </kbd>
        <span aria-hidden="true">+</span>
        <kbd data-pressed={pressed.has("KeyC")}>C</kbd>
        <span>interrupt terminal</span>
      </span>
    </div>
  );
}
