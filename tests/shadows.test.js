const fs = require("fs");
const FoldToSvg = require("../fold-to-svg");
const outputDir = "./tests/output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);

test("shadows test", () => {
  const diagram = fs.readFileSync("./tests/examples/diagram-fold.fold", "utf8");
  const diagram800 = JSON.parse(diagram);
  diagram800.vertices_coords = diagram800.vertices_coords.map(v => v.map(n => n * 800));
  const diagramSvg1 = FoldToSvg(diagram, {
    shadows: true, padding: 0.02
  });
  const diagramSvg800 = FoldToSvg(diagram800, {
    shadows: true, padding: 16
  });
  const diagramSvgBlur = FoldToSvg(diagram, {
    shadows: { blur: 0.02 }, padding: 0.02
  });
  const diagramSvgDark = FoldToSvg(diagram, {
    shadows: { opacity: 1.0 }, padding: 0.02
  });
  const diagramSvgColor = FoldToSvg(diagram, {
    shadows: { color: "#e53" }, padding: 0.02
  });
  fs.writeFile(`${outputDir}/shadows-1x1.svg`, diagramSvg1, () => {});
  fs.writeFile(`${outputDir}/shadows-800x800.svg`, diagramSvg800, () => {});
  fs.writeFile(`${outputDir}/shadows-large.svg`, diagramSvgBlur, () => {});
  fs.writeFile(`${outputDir}/shadows-dark.svg`, diagramSvgDark, () => {});
  fs.writeFile(`${outputDir}/shadows-color.svg`, diagramSvgColor, () => {});
  expect(true).toBe(true);
});
