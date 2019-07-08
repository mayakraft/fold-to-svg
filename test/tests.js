const fs = require("fs");
const FOLD_SVG = require("../fold-svg");

try {
  FOLD_SVG.toSVG("{\"key\": invalid json}");
  console.log("test failed! invalid json should throw an error");
} catch (error) {
  // success. invalid json caught
}

fs.readFile("./test/examples/single-vertex.fold", (err, data) => {
  const singleVertex = JSON.parse(data);
  const frame0 = FOLD_SVG.toSVG(singleVertex);
  const frame1 = FOLD_SVG.toSVG(singleVertex, { frame: 1, shadows: true, padding: 0.1 });
  [frame0, frame1].forEach((frame, i) => {
    fs.writeFile(`./test/output/test-frame-${i}.svg`, frame, (err2) => {
      if (err2) { throw err2; }
      console.log(`FOLD -> SVG result at output/test-frame-${i}.svg`);
    });
  });
});

fs.readFile("./test/examples/crane.fold", (err, data) => {
  const crane1 = FOLD_SVG.toSVG(JSON.parse(data));
  fs.writeFile("./test/output/test-crane1.svg", crane1, (err2) => {
    if (err2) { throw err2; }
    console.log("FOLD -> SVG result at output/test-crane1.svg");
  });
  fs.readFile("./test/examples/byrne.css", "utf8", (err3, cssData) => {
    const options = {
      stylesheet: cssData,
      padding: 0.02,
    };
    const crane2 = FOLD_SVG.toSVG(JSON.parse(data), options);
    fs.writeFile("./test/output/test-crane2.svg", crane2, (err4) => {
      if (err4) { throw err4; }
      console.log("FOLD -> SVG result at output/test-crane2.svg");
    });
  });
});

fs.readFile("./test/examples/diagram.fold", (err, data) => {
  const diagram = JSON.parse(data);
  // const frame0 = FOLD_SVG.toSVG(diagram);
  const frame1 = FOLD_SVG.toSVG(diagram, { frame: 1, shadows: true, padding: 0.1 });
  // [frame0, frame1]
  [frame1].forEach((frame, i) => {
    fs.writeFile(`./test/output/test-diagram-${i}.svg`, frame, (err2) => {
      if (err2) { throw err2; }
      console.log(`FOLD -> SVG result at output/test-diagram-${i}.svg`);
    });
  });
});
