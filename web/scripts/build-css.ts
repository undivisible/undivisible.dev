import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { createGenerator, type UnocssPluginContext } from "@unocss/core";
import transformerDirectives from "@unocss/transformer-directives";
import MagicString from "magic-string";
import { transform } from "lightningcss";
import config from "../uno.config";

async function readStyles(file: string): Promise<string> {
  const source = await readFile(file, "utf8");
  const imports = [...source.matchAll(/@import\s+"(\.\/[^\"]+)";/g)];
  let css = source;
  for (const match of imports)
    css = css.replace(
      match[0],
      await readStyles(resolve(dirname(file), match[1]!)),
    );
  return css;
}

export async function buildStyles(projectDir: string): Promise<Uint8Array> {
  const uno = await createGenerator(config);
  const styles = new MagicString(
    await readStyles(join(projectDir, "src/index.css")),
  );
  const directives = transformerDirectives();
  // This transformer uses only the generator from the bundler context.
  await directives.transform?.(styles, "site.css", {
    uno,
  } as UnocssPluginContext);
  const sources: string[] = [];
  for await (const file of new Bun.Glob("src/**/*.{ts,tsx}").scan(projectDir))
    sources.push(await readFile(join(projectDir, file), "utf8"));
  const utilities = await uno.generate(sources.join("\n"));
  return transform({
    filename: "site.css",
    code: Buffer.from(`${utilities.css}\n${styles.toString()}`),
    minify: true,
  }).code;
}
