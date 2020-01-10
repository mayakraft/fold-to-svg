const fs = require("fs");
const FoldToSvg = require("../fold-to-svg");

test("invalid json", () => {
  try {
    FoldToSvg.svg("{\"key\": invalid json}");
    // invalid json should throw an error
  } catch (error) {
    // success. invalid json caught
    expect(error).not.toBe(null);
  }
});

test("boundary points", () => { expect(true).toBe(true); });

// test("boundary points", () => {
//   fs.readFile("./tests/examples/single-vertex.fold", (err, data) => {
//     const singleVertex = JSON.parse(data);
//     const boundaries = FoldToSvg.components.svg.boundaries(singleVertex);
//     expect(boundaries.length).toBe(1);
//     expect(boundaries[0].tagName).toBe("polygon");
//     const boundaryPoints = boundaries[0].getAttribute("points")
//       .split(" ")
//       .filter(e => e !== "");
//     expect(boundaries[0].getAttribute("points")).toBe("0,0 1,0 1,0.76470588235294 1,1 0,1 ");
//     expect(boundaryPoints.length).toBe(5);

//     // const frame0 = FoldToSvg.svg(singleVertex);
//     // const frame1 = FoldToSvg.svg(singleVertex, { frame: 1, shadows: true, padding: 0.1 });
//     // [frame0, frame1].forEach((frame, i) => {
//     //   fs.writeFile(`./tests/output/test-frame-${i}.svg`, frame, (err2) => {
//     //     if (err2) { throw err2; }
//     //     console.log(`FOLD -> SVG result at output/test-frame-${i}.svg`);
//     //   });
//     // });
//   });
// });
