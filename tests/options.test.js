const fs = require("fs");
const drawFold = require("../fold-draw");

const outputDir = "./tests/output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);

const fold_file = {
  frame_classes: ["creasePattern"],
  vertices_coords: [[0, 0], [1, 1]],
  edges_vertices: [[0, 1]],
  edges_assignment: ["V"],
};

test("convert and export files", () => {
  fs.writeFile("./tests/output/blank.svg", drawFold.svg(fold_file), (error) => {
    if (error) { throw error; }
    // console.log("FOLD -> SVG result at output/blank.svg");
    expect(error).toBe(null);
  });
});

test("convert and export files", () => {
  fs.writeFile("./tests/output/blank.svg", drawFold.svg(fold_file), (error) => {
    if (error) { throw error; }
    // console.log("FOLD -> SVG result at output/blank.svg");
    expect(error).toBe(null);
  });
});
