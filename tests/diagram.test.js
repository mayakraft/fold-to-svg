const fs = require("fs");
const FoldToSvg = require("../fold-to-svg");
const outputDir = "./tests/output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);

test("diagram complex", () => {
  const data = fs.readFileSync("./tests/examples/diagram.fold", "utf8");
  // const diagram = JSON.parse(data);
  const svg = FoldToSvg(data, { file_frame: 1, padding: 0.02 });
  fs.writeFile(`${outputDir}/diagram-complex.svg`, svg, () => {});
  expect(true).toBe(true);
});

test("diagram 1", () => {
  const data = fs.readFileSync("./tests/examples/diagram-1.fold", "utf8");
  // const diagram = JSON.parse(data);
  const svg = FoldToSvg(data, { padding: 0.02 });
  fs.writeFile(`${outputDir}/diagram-simple-1.svg`, svg, () => {});
  expect(true).toBe(true);
});

test("diagram 2", () => {
  const data = fs.readFileSync("./tests/examples/diagram-2.fold", "utf8");
  // const diagram = JSON.parse(data);
  const svg = FoldToSvg(data, { padding: 0.02, attributes: {faces: {front: {fill: "bisque" }}}});
  fs.writeFile(`${outputDir}/diagram-simple-2.svg`, svg, () => {});
  expect(true).toBe(true);
});

test("diagram 3 unfolded", () => {
  const data = fs.readFileSync("./tests/examples/diagram-3.fold", "utf8");
  // const diagram = JSON.parse(data);
  const svg = FoldToSvg(data, { padding: 0.02, attributes: {faces: {front: {fill: "bisque" }}}});
  fs.writeFile(`${outputDir}/diagram-simple-3-unfolded.svg`, svg, () => {});
  expect(true).toBe(true);
});

test("diagram 3 folded", () => {
  const data = fs.readFileSync("./tests/examples/diagram-3.fold", "utf8");
  // const diagram = JSON.parse(data);
  const svg = FoldToSvg(data, { padding: 0.02, file_frame: 1, attributes: {faces: {front: {fill: "bisque" }}}});
  fs.writeFile(`${outputDir}/diagram-simple-3-folded.svg`, svg, () => {});
  expect(true).toBe(true);
});
