const fs = require("fs");
const FOLD_SVG = require("../fold-svg");

const svg = FOLD_SVG.toSVG({
  frame_classes: ["creasePattern"], vertices_coords: [[0, 0], [1, 1]], edges_vertices: [[0, 1]], edges_assignment: ["V"],
});

fs.writeFile("./test/output/blank.svg", svg, (err2) => {
  // expect(err2).toBe(null);
  if (err2) { throw err2; }
  console.log("FOLD -> SVG result at output/blank.svg");
});
