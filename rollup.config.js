import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import cleanup from "rollup-plugin-cleanup";
import { string } from "rollup-plugin-string";

module.exports = [{
  input: "src/index.js",
  output: {
    name: "FoldToSvg",
    file: "fold-to-svg.js",
    format: "umd",
    // format: "es",
    banner: "/* (c) Robby Kraft, MIT License */",
  },
  plugins: [
    nodeResolve(),
    babel({
      babelHelpers: "bundled",
      presets: ["@babel/preset-env"]
    }),
    cleanup(),
    terser({
      compress: { properties: false }
    }),
    string({
      include: "**/*.css", // allows .fold files to be imported as a module
    }),
  ],
}];
