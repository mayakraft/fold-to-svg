const fs = require("fs");
const FoldToSvg = require("../fold-to-svg");
const outputDir = "./tests/output";
fs.existsSync(outputDir) || fs.mkdirSync(outputDir);

test("diagram step", () => {
  fs.readFile("./tests/examples/diagram.fold", "utf8", (err, data) => {
    const diagram = JSON.parse(data);
    const svg = FoldToSvg(diagram, { file_frame: 1, padding: 0.02, diagram: true });
    fs.writeFile(`${outputDir}/diagram-step.svg`, svg, () => {});
  });
});
