const fs = require("fs");
const FoldToSvg = require("../fold-to-svg");
const outputDir = "./tests/output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);

// this tests extremely simple fold files and trivial cases
test("empty FOLD object", () => {
  const emptySvg = FoldToSvg({}, {output: "svg"});
  expect(emptySvg.childNodes.length).toBe(0);
  fs.writeFile(`${outputDir}/empty.svg`, FoldToSvg({}), () => {});
});

test("one vertex FOLD object", () => {
  const oneVertex = { vertices_coords: [[0.5, 0.5]] };
  const oneVertexSvgHidden = FoldToSvg(oneVertex, {output: "svg"});
  expect(oneVertexSvgHidden.childNodes.length).toBe(0);
  const oneVertexSvgVisible = FoldToSvg(oneVertex, {output: "svg", vertices: true});
  expect(oneVertexSvgVisible.childNodes.length).toBe(1);
  expect(oneVertexSvgHidden.getAttribute("viewBox")).toBe("0.5 0.5 0 0");
  expect(oneVertexSvgVisible.getAttribute("viewBox")).toBe("0.5 0.5 0 0");
});

test("two vertex FOLD object", () => {
  const twoVertex = { vertices_coords: [[2,3],[9,8]] };
  const twoVertexSvg = FoldToSvg(twoVertex, {output: "svg", vertices: true});
  expect(twoVertexSvg.childNodes.length).toBe(1);
  expect(twoVertexSvg.childNodes[0].childNodes.length).toBe(2);
  fs.writeFile(`${outputDir}/two-vertices.svg`, FoldToSvg(twoVertex, {vertices: true}), () => {});
});

test("one edge FOLD object", () => {
  const oneEdge = {
    vertices_coords: [[0, 0], [1, 1]],
    edges_vertices: [[0, 1]],
    edges_assignment: ["V"],
  };
  const oneEdgeSvg = FoldToSvg(oneEdge, {output: "svg"});
  // expect(oneEdgeSvg.childNodes.length).toBe(1);
  fs.writeFile(`${outputDir}/one-edge-1-1.svg`, FoldToSvg(oneEdge), () => {});
});
