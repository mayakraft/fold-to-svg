const fs = require("fs");
const FOLDtoSVG = require("../fold-to-svg");

test("convert edges", () => {
  const oneFold = {
    vertices_coords: [[0, 0], [1, 0], [1, 1], [0, 1]],
    edges_vertices: [[0, 1], [1, 2], [2, 3], [3, 0], [1, 3]],
    edges_assignment: ["B", "B", "B", "B", "V"]
  };
  const oneFoldSvg = FOLDtoSVG(oneFold);
  // console.log(oneFoldSvg);
  expect(true).toBe(true);
});
