import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export async function loadRootEnv(): Promise<void> {
  let text: string;
  try {
    text = await readFile(resolve(import.meta.dir, "../../.env"), "utf8");
  } catch {
    return;
  }
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const name = trimmed.slice(0, eq).trim();
    if (process.env[name] !== undefined) continue;
    process.env[name] = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
  }
}
