const FoldToSvg = require("../fold-to-svg");

test("type test", () => {
  const testInputString = FoldToSvg("{}");
  const testInputObject = FoldToSvg({});
  const testInputStringOutputSvg = FoldToSvg("{}", {output: "svg"});
  const testInputStringOutputString = FoldToSvg("{}", {output: "string"});
  const testInputObjectOutputSvg = FoldToSvg({}, {output: "svg"});
  const testInputObjectOutputString = FoldToSvg({}, {output: "string"});

  expect(testInputObject.constructor.name).toBe("String");
  expect(testInputString.constructor.name).toBe("String");
  expect(testInputStringOutputSvg.constructor.name).toBe("Element");
  expect(testInputStringOutputString.constructor.name).toBe("String");
  expect(testInputObjectOutputSvg.constructor.name).toBe("Element");
  expect(testInputObjectOutputString.constructor.name).toBe("String");
});
