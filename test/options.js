const fs = require("fs");
const foldify = require("../foldify");

const fold_file = {
  frame_classes: ["creasePattern"],
  vertices_coords: [[0, 0], [1, 1]],
  edges_vertices: [[0, 1]],
  edges_assignment: ["V"],
};

fs.writeFile("./test/output/blank.svg", foldify.toSVG(fold_file), (error) => {
  if (error) { throw error; }
  console.log("FOLD -> SVG result at output/blank.svg");
});

fs.writeFile("./test/output/blank.svg", foldify.toSVG(fold_file), (error) => {
  if (error) { throw error; }
  console.log("FOLD -> SVG result at output/blank.svg");
});
