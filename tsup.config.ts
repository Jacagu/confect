import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/server/schema-to-validator.ts",
    "src/server/schema.ts",
    "src/server/index.ts",
    "src/react/**/*.ts",
  ],
  dts: true,
  sourcemap: true,
  clean: true,
  format: ["esm", "cjs"],
});
