const fs = require("fs");
const FoldToSvg = require("../fold-to-svg");
const outputDir = "./tests/output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);

test("one edge scale", () => {
  const oneEdge1_1 = {
    vertices_coords: [[0, 0], [1, 1]],
    edges_vertices: [[0, 1]],
    edges_assignment: ["V"],
  };
  const oneEdge800_800 = {
    vertices_coords: [[0, 0], [800, 800]],
    edges_vertices: [[0, 1]],
    edges_assignment: ["V"],
  };

  const small = FoldToSvg(oneEdge1_1, {output: "svg"});
  const large = FoldToSvg(oneEdge800_800, {output: "svg"});
  expect(small.getAttribute("stroke-width")).toBe("0.01");
  expect(large.getAttribute("stroke-width")).toBe("8");
  expect(small.getAttribute("viewBox")).toBe("0 0 1 1");
  expect(large.getAttribute("viewBox")).toBe("0 0 800 800");

  fs.writeFile(`${outputDir}/one-edge-1-1.svg`, FoldToSvg(oneEdge1_1), () => {});
  fs.writeFile(`${outputDir}/one-edge-800-800.svg`, FoldToSvg(oneEdge800_800), () => {});
});
