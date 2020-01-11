const fs = require("fs");
const FoldToSvg = require("../fold-to-svg");
const outputDir = "./tests/output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);

test("show and hide components", () => {
  const craneFold = fs.readFileSync("./tests/examples/crane.fold", "utf8");
  // const craneFaces = FoldToSvg(craneFold, {
  //   attributes: { faces: { fill:"lightgray", stroke:"black" } },
  //   padding: 0.02, boundaries: false, edges: false
  // });
  // fs.writeFile(`${outputDir}/cp-crane-faces-only.svg`, craneFaces, () => {});

  const craneVertices = FoldToSvg(craneFold, {
    padding: 0.02, boundaries: false, faces: false, edges: false, vertices: true
  });
  fs.writeFile(`${outputDir}/cp-crane-vertices-only.svg`, craneVertices, () => {});

  const craneEdges = FoldToSvg(craneFold, {
    padding: 0.02, boundaries: false, faces: false
  });
  fs.writeFile(`${outputDir}/cp-crane-edges-only.svg`, craneEdges, () => {});
});

