import { string } from "rollup-plugin-string";
import cleanup from "rollup-plugin-cleanup";
import babel from "rollup-plugin-babel";
import minify from "rollup-plugin-babel-minify";

module.exports = [{
  input: "src/index.js",
  output: {
    name: "fold_svg",
    file: "fold-svg.js",
    format: "umd",
    // format: "es",
    banner: "/* (c) Robby Kraft, MIT License */",
  },
  plugins: [
    cleanup({
      comments: "none",
      maxEmptyLines: 0,
    }),
    babel({
      babelrc: false,
      presets: [["@babel/env", { modules: false }]],
    }),
    string({
      include: "**/*.css", // allows .fold files to be imported as a module
    }),
  ],
},
{
  input: "src/index.js",
  output: {
    name: "fold_svg",
    file: "fold-svg.min.js",
    format: "umd",
    // format: "es",
    banner: "/* (c) Robby Kraft, MIT License */",
  },
  plugins: [
    cleanup({ comments: "none" }),
    babel({
      babelrc: false,
      presets: [["@babel/env", { modules: false }]],
    }),
    minify({ mangle: { names: false } }),
    string({
      include: "**/*.css", // allows .fold files to be imported as a module
    }),
  ],
}];
