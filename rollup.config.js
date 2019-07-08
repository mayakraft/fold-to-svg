// import minify from "rollup-plugin-babel-minify";
import { string } from "rollup-plugin-string";
import cleanup from "rollup-plugin-cleanup";

module.exports = {
  input: "src/index.js",
  output: {
    name: "fold_svg",
    file: "fold-svg.js",
    format: "umd",
    // format: "es",
    banner: "/* (c) Robby Kraft, MIT License */",
  },
  plugins: [
    // minify(),
    cleanup({
      comments: "none",
      maxEmptyLines: 0,
    }),
    string({
      include: "**/*.css", // allows .fold files to be imported as a module
    }),
  ],
};
