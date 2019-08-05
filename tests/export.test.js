const fs = require("fs");
const FOLD_SVG = require("../fold-draw");

const outputDir = "./tests/output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);

test("convert and export files", () => {
  fs.readFile("./tests/examples/single-vertex.fold", (err, data) => {
    const singleVertex = JSON.parse(data);
    const frame0 = FOLD_SVG.svg(singleVertex);
    const frame1 = FOLD_SVG.svg(singleVertex, { frame: 1, shadows: true, padding: 0.1 });
    [frame0, frame1].forEach((frame, i) => {
      fs.writeFile(`./tests/output/test-frame-${i}.svg`, frame, (err2) => {
        if (err2) { throw err2; }
        // console.log(`FOLD -> SVG result at output/test-frame-${i}.svg`);
        expect(err2).toBe(null);
      });
    });
  });

  fs.readFile("./tests/examples/crane.fold", (err, data) => {
    const crane1 = FOLD_SVG.svg(JSON.parse(data));
    fs.writeFile("./tests/output/test-crane1.svg", crane1, (err2) => {
      if (err2) { throw err2; }
      // console.log("FOLD -> SVG result at output/test-crane1.svg");
      expect(err2).toBe(null);
    });
    fs.readFile("./tests/examples/byrne.css", "utf8", (err3, cssData) => {
      const options = {
        stylesheet: cssData,
        padding: 0.02,
      };
      const crane2 = FOLD_SVG.svg(JSON.parse(data), options);
      fs.writeFile("./tests/output/test-crane2.svg", crane2, (err4) => {
        if (err4) { throw err4; }
        // console.log("FOLD -> SVG result at output/test-crane2.svg");
        expect(err4).toBe(null);
      });
    });
  });

  fs.readFile("./tests/examples/diagram.fold", (err, data) => {
    const diagram = JSON.parse(data);
    const svg = FOLD_SVG.svg(diagram, { frame: 1, shadows: true, padding: 0.1 });
    fs.writeFile("./tests/output/test-diagram.svg", svg, (err2) => {
      if (err2) { throw err2; }
      // console.log("FOLD -> SVG result at output/test-diagram.svg");
      expect(err2).toBe(null);
    });
  });
});
