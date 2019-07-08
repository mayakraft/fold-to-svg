const fs = require("fs");
// const { test, expect } = require("jest");
const fold_svg = require("../fold-svg");

test("boundary points", () => {
  fs.readFile("./test/examples/single-vertex.fold", (err, data) => {
    const singleVertex = JSON.parse(data);
    const boundaries = fold_svg.components.boundaries(singleVertex);
    expect(boundaries.length).toBe(1);
    expect(boundaries[0].tagName).toBe("polygon");
    const boundaryPoints = boundaries[0].getAttribute("points")
      .split(" ")
      .filter(e => e !== "");
    expect(boundaries[0].getAttribute("points")).toBe("0,0 1,0 1,0.76470588235294 1,1 0,1 ");
    expect(boundaryPoints.length).toBe(5);

    // const frame0 = fold_svg.toSVG(singleVertex);
    // const frame1 = fold_svg.toSVG(singleVertex, { frame: 1, shadows: true, padding: 0.1 });
    // [frame0, frame1].forEach((frame, i) => {
    //   fs.writeFile(`./test/output/test-frame-${i}.svg`, frame, (err2) => {
    //     if (err2) { throw err2; }
    //     console.log(`FOLD -> SVG result at output/test-frame-${i}.svg`);
    //   });
    // });
  });
});
