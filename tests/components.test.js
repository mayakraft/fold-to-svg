const FOLDtoSVG = require("../fold-to-svg");

test("vertices", () => {
  const points = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const graph = { vertices_coords: points };

  const circles = FOLDtoSVG.vertices_circle(graph);

  // there is one <circle> element for every one of the vertices_coords
  const test1 = points.map((_, i) => circles[i].nodeName === "circle")
    .reduce((a, b) => a && b, true);
  expect(test1).toBe(true);

  // each of these <circle> elements have a "cx" and "cy" attribute that matches the input
  const test2 = circles.map(v => [
    parseFloat(v.getAttribute("cx")),
    parseFloat(v.getAttribute("cy"))
  ]).map((center, i) => center[0] === points[i][0] && center[1] === points[i][1])
    .reduce((a, b) => a && b, true);
  expect(test2).toBe(true);
});


// 0: "vertices_circle"
// 1: "edges_path_data"
// 2: "edges_by_assignment_paths_data"
// 3: "edges_path"
// 4: "edges_line"
// 5: "faces_vertices_polygon"
// 6: "faces_edges_polygon"