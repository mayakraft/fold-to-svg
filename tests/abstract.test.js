const FoldToSvg = require("../fold-to-svg");

test("abstract graph test", () => {
  const abstractGraph = {
    edges_vertices:[[0,1], [1,2], [2,3]],
    faces_edges:[[0,1,2]]
  };
  const abstractSVG = FoldToSvg(abstractGraph, {output: "svg"});
  expect(abstractSVG.childNodes.length).toBe(0);
});
