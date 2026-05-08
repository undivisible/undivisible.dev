import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import path from "node:path";

function readRootEnv(name: string) {
  if (process.env[name]) {
    return process.env[name];
  }

  try {
    const envFile = readFileSync(
      path.resolve(import.meta.dirname, "../..", ".env"),
      "utf8",
    );
    const line = envFile
      .split(/\r?\n/)
      .find((entry) => entry.trimStart().startsWith(`${name}=`));

    if (!line) {
      return undefined;
    }

    return line
      .slice(line.indexOf("=") + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
  } catch {
    return undefined;
  }
}

const nextConfig: NextConfig = {
  output: "export",
  env: {
    NEXT_PUBLIC_LASTFM_API_KEY: readRootEnv("NEXT_PUBLIC_LASTFM_API_KEY"),
    NEXT_PUBLIC_LASTFM_USERNAME: readRootEnv("NEXT_PUBLIC_LASTFM_USERNAME"),
  },
};

export default nextConfig;
