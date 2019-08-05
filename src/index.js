import {
  svgBoundaries,
  svgVertices,
  svgEdges,
  svgFacesVertices,
  svgFacesEdges,
} from "./toSVG/components";

import fold_to_svg from "./toSVG/render";

const getObject = function (input) {
  if (typeof input === "object" && input !== null) {
    return input;
  }
  if (typeof input === "string" || input instanceof String) {
    try {
      const obj = JSON.parse(input);
      return obj;
    } catch (error) {
      throw error;
    }
  }
  throw new Error("couldn't recognize input. looking for string or object");
};

const svg = function (input, options) {
  try {
    const fold = getObject(input);
    return fold_to_svg(fold, options);
  } catch (error) {
    throw error;
  }
};

const webGL = function () {
  // empty. todo
};

const foldDraw = {
  svg,
  webGL,
  components: {
    svg: {
      boundaries: svgBoundaries,
      vertices: svgVertices,
      edges: svgEdges,
      faces: svgFacesVertices,
      faces_vertices: svgFacesVertices,
      faces_edges: svgFacesEdges,
    },
    webGL: { },
  },
};

export default foldDraw;
