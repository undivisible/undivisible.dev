import { defineConfig } from "@tschk/moonshine-framework";

export default defineConfig({
  runtime: "bun",
  adapter: "bun",
  renderer: "react",
  routesDir: "src/app",
  convention: "next-app",
});
