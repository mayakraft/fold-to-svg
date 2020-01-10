const FoldToSvg = require("../fold-to-svg");

test("edges without assignment", () => {
  const oneFold = {
    vertices_coords: [[0, 0], [2, 0], [2, 2], [0, 2]],
    edges_vertices: [[0, 1], [1, 2], [2, 3], [3, 0], [1, 3]]
  };
  const oneFoldSvg = FoldToSvg(oneFold);
  // console.log(oneFoldSvg);
  expect(true).toBe(true);
});


test("edges with assignment", () => {
  const oneFold = {
    vertices_coords: [[0, 0], [1, 0], [1, 1], [0, 1]],
    edges_vertices: [[0, 1], [1, 2], [2, 3], [3, 0], [1, 3]],
    edges_assignment: ["B", "B", "B", "B", "V"]
  };
  const oneFoldSvg = FoldToSvg(oneFold);
  // console.log(oneFoldSvg);
  expect(true).toBe(true);
});
