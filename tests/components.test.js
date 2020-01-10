const FoldToSvg = require("../fold-to-svg");

test("vertices", () => {
  const points = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const graph = { vertices_coords: points };
  const circles = FoldToSvg.vertices_circle(graph);
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

test("edges path data", () => {
  const graph = {
    vertices_coords: [[0, 0], [1, 0], [1, 1], [0, 1]],
    edges_vertices: [[0, 1], [1, 2], [2, 3], [3, 0], [1, 3]],
    edges_assignment: ["B", "B", "B", "B", "V"]
  };
  const path_data = FoldToSvg.edges_path_data(graph);
  // todo, this can be optimized, if the last point is the same as the next, no need to "move to"
  expect(path_data).toBe("M0 0L1 0M1 0L1 1M1 1L0 1M0 1L0 0M1 0L0 1");
  const paths_data = FoldToSvg.edges_by_assignment_paths_data(graph);
  expect(paths_data.b).toBe("M0 0L1 0M1 0L1 1M1 1L0 1M0 1L0 0");
  expect(paths_data.v).toBe("M1 0L0 1");
});

test("edges line", () => {
  const graph = {
    vertices_coords: [[0, 0], [1, 0], [1, 1], [0, 1]],
    edges_vertices: [[0, 1], [1, 2], [2, 3], [3, 0], [1, 3]],
    edges_assignment: ["B", "B", "B", "B", "V"]
  };
  const lines = FoldToSvg.edges_line(graph);
  const test1 = graph.edges_vertices.map((_, i) => lines[i].nodeName === "line")
    .reduce((a, b) => a && b, true);
  const test2 = ["boundary", "boundary", "boundary", "boundary", "valley"]
    .map((a, i) => lines[i].getAttribute("class") === a)
    .reduce((a, b) => a && b, true);
  expect(test1).toBe(true);
  expect(test2).toBe(true);
});

test("edges path", () => {
  const graph = {
    vertices_coords: [[0, 0], [1, 0], [1, 1], [0, 1]],
    edges_vertices: [[0, 1], [1, 2], [2, 3], [3, 0], [1, 3], [0, 2]],
    edges_assignment: ["B", "b", "b", "B", "v", "M"]
  };
  const paths = FoldToSvg.edges_path(graph);
  const test1 = paths.map(p => ["boundary", "mountain", "valley"].includes(p.getAttribute("class")))
    .reduce((a, b) => a && b, true);
  expect(test1).toBe(true);
  const test2 = paths.filter(p => p.getAttribute("class") === "boundary")
    .shift()
    .getAttribute("d") === "M0 0L1 0M1 0L1 1M1 1L0 1M0 1L0 0";
  expect(test2).toBe(true);
});

test("faces vertices", () => {
  const graph = {
    vertices_coords: [[0, 0], [1, 0], [1, 1], [0, 1]],
    edges_vertices: [[0, 1], [1, 2], [2, 3], [3, 0], [1, 3]],
    faces_vertices: [[0, 1, 3], [1, 2, 3]],
    faces_edges: [[0, 4, 3], [1, 2, 4]],
    edges_assignment: ["B", "B", "B", "B", "V"]
  };
  const polygons = FoldToSvg.faces_vertices_polygon(graph);
  const test1 = ["0,0 1,0 0,1", "1,0 1,1 0,1"]
    .map((p, i) => polygons[i].getAttribute("points") === p)
    .reduce((a, b) => a && b, true);
  expect(test1).toBe(true);  
});

test("faces edges", () => {
  const graph = {
    vertices_coords: [[0, 0], [1, 0], [1, 1], [0, 1]],
    edges_vertices: [[0, 1], [1, 2], [2, 3], [3, 0], [1, 3]],
    faces_vertices: [[0, 1, 3], [1, 2, 3]],
    faces_edges: [[0, 4, 3], [1, 2, 4]],
    edges_assignment: ["B", "B", "B", "B", "V"]
  };
  const polygons = FoldToSvg.faces_edges_polygon(graph);
  const test1 = Array.from(Array(2))
    .map((p, i) => polygons[i].nodeName === "polygon")
    .reduce((a, b) => a && b, true);
  expect(test1).toBe(true);  
});
