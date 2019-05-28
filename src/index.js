// import * as Import from "./import";
import {
  svg_to_fold,
} from "./toFOLD";

// FOLD to SVG
import components from "./toSVG/components";
import fold_to_svg from "./toSVG/render";

// import {
//   svgBoundaries,
//   svgVertices,
//   svgEdges,
//   svgFacesVertices,
//   svgFacesEdges,
// } from "./toSVG";

// const core = {
//   svgBoundaries,
//   svgVertices,
//   svgEdges,
//   svgFacesVertices,
//   svgFacesEdges,
// };

const convert = {
  components,
  toSVG: (input, options) => {
    if (typeof input === "object" && input !== null) {
      return fold_to_svg(input, options);
    }
    if (typeof input === "string" || input instanceof String) {
      try {
        const obj = JSON.parse(input);
        return fold_to_svg(obj, options);
      } catch (error) {
        throw error;
      }
    }
    return "";
  },
  toFOLD: (input, options) => {
    if (typeof input === "string") {
      const svg = (new DOMParser())
        .parseFromString(input, "text/xml").documentElement;
      return svg_to_fold(svg, options);
    }
    // if (input instanceof Document) {
    return svg_to_fold(input, options);
    // let fold = svg_to_fold(result, options);
  },
};

export default convert;
