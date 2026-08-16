import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  /* ESM only. Nothing consumes this from `require`, and shipping CJS would
     double the surface that has to stay correct. */
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  /* React must be the host's instance, not a second copy — hence the peer
     dependency, and hence keeping it out of the bundle. */
  deps: { neverBundle: ["react", "react-dom", "react/jsx-runtime"] },
});
