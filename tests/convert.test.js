const fs = require("fs");
const FoldToSvg = require("../fold-to-svg");
const outputDir = "./tests/output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);

test("load and convert 1", () => {
  const singleVertex = fs.readFileSync("./tests/examples/single-vertex.fold", "utf8");
  const frame0 = FoldToSvg(singleVertex);
  const frame1 = FoldToSvg(singleVertex, { file_frame: 1, padding: 0.02 });
  const desc = ["unfolded", "folded"];
  [frame0, frame1].forEach((frame, i) => {
    fs.writeFile(`${outputDir}/single-vertex-${desc[i]}.svg`, frame, () => {});
  });
});

test("load and convert crane without style", () => {
  const craneFold = fs.readFileSync("./tests/examples/crane.fold", "utf8");
  const craneSVG = FoldToSvg(craneFold);
  fs.writeFile(`${outputDir}/cp-crane.svg`, craneSVG, () => {});
});

test("load and convert crane with style", () => {
  const craneFold = fs.readFileSync("./tests/examples/crane.fold", "utf8");
  const stylesheet = fs.readFileSync("./tests/examples/byrne.css", "utf8");
  const options = {
    stylesheet: stylesheet,
    padding: 0.02,
  };
  const craneSVGStyled = FoldToSvg(craneFold, options);
  fs.writeFile(`${outputDir}/cp-crane-stylesheet.svg`, craneSVGStyled, () => {});
});
