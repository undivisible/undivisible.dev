"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * telekinesis, the web build: an agent that codes in a workspace that lives
 * in this window — with the visitor's own model.
 *
 * Bring a key, it stays in localStorage on your machine, and every request
 * goes from your browser straight to your provider. Nothing routes through
 * this site — it can't, there's no server; this page is static files.
 *
 * The workspace is a small virtual filesystem the model edits through
 * tools. index.html previews live in the pane. Real execution — a full
 * container filesystem the agent can run commands in — is what
 * cloudflare/computer is for, and wiring the workspace onto it is the
 * planned backend once this site has a worker in front of it.
 */

type Provider = "anthropic" | "openai";
type Msg = { role: "user" | "assistant" | "tool"; text: string };
type Files = Record<string, string>;

const STORAGE_KEY = "tk-web";
const START_FILES: Files = {
  "index.html": `<!doctype html>
<title>workspace</title>
<style>body{background:#111;color:#eee;font:16px system-ui;display:grid;place-items:center;height:100vh;margin:0}</style>
<p>ask the agent to build something.</p>
`,
};

const SYSTEM = [
  "You are telekinesis, a coding agent embedded in max carter's website, which is styled as the alpenglow desktop.",
  "You work on a small virtual filesystem via tools: list_files, read_file, write_file, delete_file.",
  "The user sees index.html rendered live in a preview pane. Prefer single-file builds: inline CSS and JS in index.html unless asked otherwise.",
  "Be terse. Do the work with tools, then answer in one or two lowercase sentences.",
].join(" ");

const TOOLS = [
  {
    name: "list_files",
    description: "List every file in the workspace.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "read_file",
    description: "Read one file.",
    input_schema: {
      type: "object",
      properties: { path: { type: "string" } },
      required: ["path"],
      additionalProperties: false,
    },
  },
  {
    name: "write_file",
    description: "Create or overwrite one file with full contents.",
    input_schema: {
      type: "object",
      properties: { path: { type: "string" }, content: { type: "string" } },
      required: ["path", "content"],
      additionalProperties: false,
    },
  },
  {
    name: "delete_file",
    description: "Delete one file.",
    input_schema: {
      type: "object",
      properties: { path: { type: "string" } },
      required: ["path"],
      additionalProperties: false,
    },
  },
];

export function TelekinesisApp() {
  const [provider, setProvider] = useState<Provider>("anthropic");
  const [key, setKey] = useState("");
  const [model, setModel] = useState("claude-sonnet-5");
  const [files, setFiles] = useState<Files>(START_FILES);
  const [openFile, setOpenFile] = useState("index.html");
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const filesRef = useRef(files);
  filesRef.current = files;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (saved?.files) setFiles(saved.files);
      if (saved?.key) setKey(saved.key);
      if (saved?.provider) setProvider(saved.provider);
      if (saved?.model) setModel(saved.model);
    } catch {
      /* fresh start */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ files, key, provider, model }),
    );
  }, [files, key, provider, model]);

  const runTool = useCallback((name: string, args: Record<string, string>) => {
    const current = filesRef.current;
    switch (name) {
      case "list_files":
        return Object.keys(current).join("\n") || "(empty)";
      case "read_file":
        return current[args.path ?? ""] ?? `no such file: ${args.path}`;
      case "write_file":
        setFiles((state) => ({ ...state, [args.path ?? "file"]: args.content ?? "" }));
        return `wrote ${args.path}`;
      case "delete_file":
        setFiles((state) => {
          const next = { ...state };
          delete next[args.path ?? ""];
          return next;
        });
        return `deleted ${args.path}`;
      default:
        return `unknown tool ${name}`;
    }
  }, []);

  const send = useCallback(async () => {
    const ask = input.trim();
    if (!ask || busy || !key) return;
    setInput("");
    setBusy(true);
    setMsgs((current) => [...current, { role: "user", text: ask }]);

    try {
      if (provider === "anthropic") {
        // Anthropic allows browser calls when the caller owns that decision.
        type Block =
          | { type: "text"; text: string }
          | { type: "tool_use"; id: string; name: string; input: Record<string, string> };
        const convo: Array<{ role: string; content: unknown }> = [
          { role: "user", content: ask },
        ];
        for (let turn = 0; turn < 12; turn++) {
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-api-key": key,
              "anthropic-version": "2023-06-01",
              "anthropic-dangerous-direct-browser-access": "true",
            },
            body: JSON.stringify({
              model,
              max_tokens: 4096,
              system: SYSTEM,
              tools: TOOLS,
              messages: convo,
            }),
          });
          if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
          const data = (await res.json()) as { content: Block[]; stop_reason: string };
          convo.push({ role: "assistant", content: data.content });
          const toolUses = data.content.filter(
            (block): block is Extract<Block, { type: "tool_use" }> =>
              block.type === "tool_use",
          );
          const text = data.content
            .filter((block): block is Extract<Block, { type: "text" }> => block.type === "text")
            .map((block) => block.text)
            .join("");
          if (text.trim())
            setMsgs((current) => [...current, { role: "assistant", text: text.trim() }]);
          if (!toolUses.length) break;
          convo.push({
            role: "user",
            content: toolUses.map((use) => {
              const result = runTool(use.name, use.input);
              setMsgs((current) => [
                ...current,
                { role: "tool", text: `${use.name} ${use.input.path ?? ""}`.trim() },
              ]);
              return { type: "tool_result", tool_use_id: use.id, content: result };
            }),
          });
        }
      } else {
        type Call = { id: string; function: { name: string; arguments: string } };
        const convo: Array<Record<string, unknown>> = [
          { role: "system", content: SYSTEM },
          { role: "user", content: ask },
        ];
        for (let turn = 0; turn < 12; turn++) {
          const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
              model,
              messages: convo,
              tools: TOOLS.map((tool) => ({
                type: "function",
                function: {
                  name: tool.name,
                  description: tool.description,
                  parameters: tool.input_schema,
                },
              })),
            }),
          });
          if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
          const data = (await res.json()) as {
            choices: Array<{ message: { content?: string; tool_calls?: Call[] } }>;
          };
          const message = data.choices[0]?.message;
          if (!message) break;
          convo.push({ ...message, role: "assistant" });
          if (message.content?.trim())
            setMsgs((current) => [
              ...current,
              { role: "assistant", text: message.content!.trim() },
            ]);
          if (!message.tool_calls?.length) break;
          for (const call of message.tool_calls) {
            const args = JSON.parse(call.function.arguments || "{}");
            const result = runTool(call.function.name, args);
            setMsgs((current) => [
              ...current,
              { role: "tool", text: `${call.function.name} ${args.path ?? ""}`.trim() },
            ]);
            convo.push({ role: "tool", tool_call_id: call.id, content: result });
          }
        }
      }
    } catch (error) {
      setMsgs((current) => [
        ...current,
        { role: "assistant", text: `error: ${String(error).slice(0, 300)}` },
      ]);
    } finally {
      setBusy(false);
    }
  }, [input, busy, key, provider, model, runTool]);

  const preview = files["index.html"] ?? "";

  return (
    <div className="tk">
      {!key ? (
        <div className="tk-setup">
          <p className="tk-lede">
            an agent that codes in this window, with <em>your</em> model. the
            key stays in your browser's storage and requests go from your
            browser straight to the provider — this site is static files and
            has no server to route anything through.
          </p>
          <div className="tk-setup-row">
            <select
              value={provider}
              onChange={(event) => {
                const next = event.target.value as Provider;
                setProvider(next);
                setModel(next === "anthropic" ? "claude-sonnet-5" : "gpt-5.2");
              }}
              aria-label="provider"
            >
              <option value="anthropic">anthropic</option>
              <option value="openai">openai</option>
            </select>
            <input
              type="password"
              placeholder={provider === "anthropic" ? "sk-ant-…" : "sk-…"}
              onKeyDown={(event) => {
                if (event.key === "Enter")
                  setKey((event.target as HTMLInputElement).value.trim());
              }}
              aria-label="api key"
            />
          </div>
          <p className="tk-fine">
            press enter to save. the real telekinesis is a desktop app on the
            rotary harness — this is its window-sized cousin. real command
            execution (a container filesystem behind the workspace, via
            cloudflare/computer) is the planned next step.
          </p>
        </div>
      ) : (
        <div className="tk-main">
          <div className="tk-left">
            <div className="tk-msgs">
              {msgs.length === 0 ? (
                <p className="tk-hint">
                  try: "make index.html a page that says hello in ten scripts"
                </p>
              ) : null}
              {msgs.map((msg, index) => (
                <p key={index} className={`tk-msg tk-${msg.role}`}>
                  {msg.role === "tool" ? `⚙ ${msg.text}` : msg.text}
                </p>
              ))}
              {busy ? <p className="tk-msg tk-busy">working…</p> : null}
            </div>
            <div className="tk-input-row">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void send();
                }}
                placeholder="tell it what to build"
                aria-label="prompt"
              />
              <button type="button" onClick={() => void send()} disabled={busy}>
                run
              </button>
            </div>
            <div className="tk-meta">
              <input
                className="tk-model"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                aria-label="model id"
              />
              <button type="button" onClick={() => setKey("")}>
                forget key
              </button>
            </div>
          </div>
          <div className="tk-right">
            <div className="tk-tabs">
              <button
                type="button"
                data-on={tab === "preview" || undefined}
                onClick={() => setTab("preview")}
              >
                preview
              </button>
              <button
                type="button"
                data-on={tab === "code" || undefined}
                onClick={() => setTab("code")}
              >
                files
              </button>
            </div>
            {tab === "preview" ? (
              <iframe
                className="tk-preview"
                title="workspace preview"
                sandbox="allow-scripts"
                srcDoc={preview}
              />
            ) : (
              <div className="tk-files">
                <div className="tk-file-list">
                  {Object.keys(files).map((path) => (
                    <button
                      key={path}
                      type="button"
                      data-on={path === openFile || undefined}
                      onClick={() => setOpenFile(path)}
                    >
                      {path}
                    </button>
                  ))}
                </div>
                <textarea
                  className="tk-editor"
                  value={files[openFile] ?? ""}
                  onChange={(event) =>
                    setFiles((state) => ({ ...state, [openFile]: event.target.value }))
                  }
                  spellCheck={false}
                  aria-label={`contents of ${openFile}`}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
