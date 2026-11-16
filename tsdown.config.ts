import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  /* ESM only. Nothing consumes this from `require`, and shipping CJS would
     double the surface that has to stay correct. */
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  /* One module per source file, so a `"use client"` boundary can sit on the
     files that need it instead of the whole bundle (see `check:rsc`). */
  unbundle: true,
  /* rolldown warns on every kept directive although it keeps them; `check:rsc`
     fails the build if one is lost, so this one warning code is dropped. */
  inputOptions: {
    onLog(level, log, defaultHandler) {
      if (log.code !== "MODULE_LEVEL_DIRECTIVE") defaultHandler(level, log);
    },
  },
  /* React must be the host's instance, not a second copy — hence the peer
     dependency, and hence keeping it out of the bundle. */
  deps: { neverBundle: ["react", "react-dom", "react/jsx-runtime"] },
});
