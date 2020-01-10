const FoldToSvg = require("../fold-to-svg");

test("viewBox tests", () => {
  const empty = FoldToSvg({}, {output: "svg"});
  const abstractGraph = FoldToSvg({edges_vertices:[[0,1], [1,2], [2,3]], faces_edges:[[0,1,2]]}, {output: "svg"});
  const oneVertex = FoldToSvg({vertices_coords:[[2, 3]]}, {output: "svg"});
  const twoVertex = FoldToSvg({vertices_coords:[[9, 8], [2, 3]]}, {output: "svg"});
  const twoVertex2 = FoldToSvg({vertices_coords:[[-9, -8], [2, 3]]}, {output: "svg"});
  const twoVertexPadding = FoldToSvg({vertices_coords:[[9, 8], [2, 3]]}, {output: "svg", padding: 1});

  expect(empty.getAttribute("viewBox")).toBe("0 0 0 0");
  expect(abstractGraph.getAttribute("viewBox")).toBe("0 0 0 0");
  expect(oneVertex.getAttribute("viewBox")).toBe("2 3 0 0");
  expect(twoVertex.getAttribute("viewBox")).toBe("2 3 7 5");
  expect(twoVertex2.getAttribute("viewBox")).toBe("-9 -8 11 11");
  expect(twoVertexPadding.getAttribute("viewBox")).toBe("1 2 9 7");
});
