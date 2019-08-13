// this tests extremely simple fold files
// ensuring all trivial cases are taken care of

const fs = require("fs");
const drawFold = require("../fold-draw");

const outputDir = "./tests/output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);

const empty = {};

const one_vertex = {
  frame_classes: ["creasePattern"],
  vertices_coords: [[0.5, 0.5]],
};

const one_edge = {
  frame_classes: ["creasePattern"],
  vertices_coords: [[0, 0], [1, 1]],
  edges_vertices: [[0, 1]],
  edges_assignment: ["V"],
};

test("empty FOLD object", () => {
  fs.writeFile("./tests/output/empty.svg", drawFold.svg(empty), (error) => {
    if (error) { throw error; }
    expect(error).toBe(null);
  });
});

test("one vertex FOLD object", () => {
  fs.writeFile("./tests/output/one-vertex.svg", drawFold.svg(one_vertex), (error) => {
    if (error) { throw error; }
    expect(error).toBe(null);
  });
});

test("one edge FOLD object", () => {
  fs.writeFile("./tests/output/one-edge.svg", drawFold.svg(one_edge), (error) => {
    if (error) { throw error; }
    expect(error).toBe(null);
  });
});