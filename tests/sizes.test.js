const fs = require("fs");
const FoldToSvg = require("../fold-to-svg");
const outputDir = "./tests/output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);

test("one edge scale", () => {
  // this is the current hard-coded style setting for this library
  // a percentage of the canvas-size
  const DefaultScale = 0.005;

  const twoVertices_1 = { vertices_coords: [[0, 0], [1, 1]] };
  const twoVertices_800 = { vertices_coords: [[0, 0], [800, 800]] };

  const oneEdge1 = {
    vertices_coords: [[0, 0], [1, 1]],
    edges_vertices: [[0, 1]],
    edges_assignment: ["V"],
  };
  const oneEdge800 = {
    vertices_coords: [[0, 0], [800, 800]],
    edges_vertices: [[0, 1]],
    edges_assignment: ["V"],
  };

  const smallVertices = FoldToSvg(twoVertices_1, {output: "svg", vertices: true });
  const largeVertices = FoldToSvg(twoVertices_800, {output: "svg", vertices: true });
  expect(smallVertices.childNodes[0].childNodes[0].getAttribute("r")).toBe(String(DefaultScale));
  expect(largeVertices.childNodes[0].childNodes[0].getAttribute("r")).toBe(String(DefaultScale * 800));

  const small = FoldToSvg(oneEdge1, {output: "svg"});
  const large = FoldToSvg(oneEdge800, {output: "svg"});
  expect(small.getAttribute("stroke-width")).toBe(String(DefaultScale));
  expect(large.getAttribute("stroke-width")).toBe(String(DefaultScale * 800));
  expect(small.getAttribute("viewBox")).toBe("0 0 1 1");
  expect(large.getAttribute("viewBox")).toBe("0 0 800 800");

  fs.writeFile(`${outputDir}/two-vertices-1x1.svg`, FoldToSvg(twoVertices_1, {vertices: true}), () => {});
  fs.writeFile(`${outputDir}/two-vertices-800x800.svg`, FoldToSvg(twoVertices_800, {vertices: true}), () => {});
  fs.writeFile(`${outputDir}/one-edge-1x1.svg`, FoldToSvg(oneEdge1), () => {});
  fs.writeFile(`${outputDir}/one-edge-800x800.svg`, FoldToSvg(oneEdge800), () => {});
});
