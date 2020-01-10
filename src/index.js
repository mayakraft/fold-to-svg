// import {
//   svgBoundaries,
//   svgVertices,
//   svgEdges,
//   svgFacesVertices,
//   svgFacesEdges,
// } from "./render/components";

import { vertices_circle } from "./render/vertices";

import {
  edges_path_data,
  edges_by_assignment_paths_data,
  edges_path,
  edges_line
} from "./render/edges";

import {
  faces_vertices_polygon,
  faces_edges_polygon
} from "./render/faces";

import render from "./render/index";

const getObject = function (input) {
  if (input == null) {
    return {};
  }
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
  throw new TypeError("couldn't recognize input. looking for string or object");
};

const FoldToSvg = function (input, options) {
  try {
    const fold = getObject(input);
    return render(fold, options);
  } catch (error) {
    throw error;
  }
};

FoldToSvg.vertices_circle = vertices_circle;
FoldToSvg.edges_path_data = edges_path_data;
FoldToSvg.edges_by_assignment_paths_data = edges_by_assignment_paths_data;
FoldToSvg.edges_path = edges_path;
FoldToSvg.edges_line = edges_line;
FoldToSvg.faces_vertices_polygon = faces_vertices_polygon;
FoldToSvg.faces_edges_polygon = faces_edges_polygon;

// FoldToSvg.components = {
//   boundaries: svgBoundaries,
//   vertices: svgVertices,
//   edges: svgEdges,
//   faces: svgFacesVertices,
//   faces_vertices: svgFacesVertices,
//   faces_edges: svgFacesEdges
// };

export default FoldToSvg;
