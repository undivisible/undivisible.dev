"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Chrome's built-in Prompt API — a small language model that ships with the
 * browser and runs entirely on the visitor's machine. Nothing here touches a
 * server: no key, no request, no log.
 *
 * Two surfaces exist in the wild and we support both — `LanguageModel` on the
 * global (Chrome 138+) and the older `window.ai.languageModel`.
 */

type Availability =
  | "unavailable"
  | "downloadable"
  | "downloading"
  | "available";

type PromptSession = {
  prompt(input: string, options?: { signal?: AbortSignal }): Promise<string>;
  promptStreaming(
    input: string,
    options?: { signal?: AbortSignal },
  ): AsyncIterable<string>;
  destroy?(): void;
};

type CreateOptions = {
  initialPrompts?: Array<{ role: string; content: string }>;
  temperature?: number;
  topK?: number;
  monitor?: (monitor: EventTarget) => void;
  signal?: AbortSignal;
};

type LanguageModelApi = {
  availability?(): Promise<Availability>;
  capabilities?(): Promise<{ available: "no" | "after-download" | "readily" }>;
  create(options?: CreateOptions): Promise<PromptSession>;
  params?(): Promise<{ defaultTemperature: number; defaultTopK: number }>;
};

declare global {
  interface Window {
    LanguageModel?: LanguageModelApi;
    ai?: { languageModel?: LanguageModelApi };
  }
}

function getApi(): LanguageModelApi | null {
  if (typeof window === "undefined") return null;
  return window.LanguageModel ?? window.ai?.languageModel ?? null;
}

async function readAvailability(api: LanguageModelApi): Promise<Availability> {
  if (typeof api.availability === "function") return api.availability();
  if (typeof api.capabilities === "function") {
    const { available } = await api.capabilities();
    if (available === "readily") return "available";
    if (available === "after-download") return "downloadable";
    return "unavailable";
  }
  return "unavailable";
}

export type PromptApiState =
  | "checking"
  /** No `LanguageModel` on the global at all. */
  | "absent"
  /** The API is here but says it can't serve this page — usually a
   *  cross-origin frame, where permissions policy blocks it. */
  | "blocked"
  | "downloadable"
  | "downloading"
  | "ready"
  | "running"
  | "failed";

export type PromptApi = {
  state: PromptApiState;
  /** 0–1 while the model downloads, otherwise null. */
  progress: number | null;
  /** The API object exists, whatever availability() claims about it. */
  present: boolean;
  /** True when a first token could arrive without a download. */
  supported: boolean;
  /**
   * Streams a completion. Calls `onToken` with the text so far. Resolves with
   * the final text, or null if the model isn't there.
   */
  run(
    prompt: string,
    onToken: (text: string) => void,
  ): Promise<string | null>;
};

export function usePromptApi(system: string): PromptApi {
  const [state, setState] = useState<PromptApiState>("checking");
  const [progress, setProgress] = useState<number | null>(null);
  const sessionRef = useRef<PromptSession | null>(null);
  const systemRef = useRef(system);
  systemRef.current = system;

  const present = getApi() !== null;

  useEffect(() => {
    const api = getApi();
    if (!api) {
      setState("absent");
      return;
    }
    let cancelled = false;
    void readAvailability(api)
      .then((availability) => {
        if (cancelled) return;
        if (availability === "available") setState("ready");
        // The object exists but won't serve — almost always a cross-origin
        // frame where permissions policy blocks it, not a missing model.
        else if (availability === "unavailable") setState("blocked");
        else
          setState(
            availability === "downloading" ? "downloading" : "downloadable",
          );
      })
      .catch(() => {
        if (!cancelled) setState("blocked");
      });
    return () => {
      cancelled = true;
      sessionRef.current?.destroy?.();
      sessionRef.current = null;
    };
  }, []);

  const run = useCallback(
    async (prompt: string, onToken: (text: string) => void) => {
      const api = getApi();
      if (!api) {
        setState("absent");
        return null;
      }
      try {
        setState("running");
        if (!sessionRef.current) {
          sessionRef.current = await api.create({
            initialPrompts: [{ role: "system", content: systemRef.current }],
            temperature: 1,
            topK: 8,
            monitor(monitor) {
              monitor.addEventListener("downloadprogress", (event) => {
                const loaded = (event as ProgressEvent).loaded;
                setProgress(typeof loaded === "number" ? loaded : null);
                setState("downloading");
              });
            },
          });
          setProgress(null);
        }
        const session = sessionRef.current;
        let text = "";
        // Newer builds stream deltas; older ones stream the whole string each
        // time. Detect which by seeing if the chunk continues what we have.
        for await (const chunk of session.promptStreaming(prompt)) {
          text = chunk.startsWith(text) && chunk.length >= text.length
            ? chunk
            : text + chunk;
          onToken(text);
        }
        setState("ready");
        return text;
      } catch {
        setState("failed");
        return null;
      }
    },
    [],
  );

  return {
    state,
    progress,
    present,
    supported: state === "ready" || state === "running",
    run,
  };
}
