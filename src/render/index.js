/**
 * ## options
 * ### boolean
 * - render layers, with their default setting:
 *   - "vertices": false
 *   - "edges": true
 *   - "faces_vertices": true
 *   - "faces_edges": false
 *   - "boundaries": true
 *
 * - "diagram" if the "re:diagrams" exists, render arrows and lines...
 *
 * - "style" incorporate a stylesheet (default/custom) into <svg> header
 *     options: "attributes", "inline", "css". default "css"
 *
 * ### data
 * ["width"] width of SVG (not viewport, which is in FOLD coordinate space)
 * ["height"] height of SVG (not viewport, which is in FOLD coordinate space)
 * ["stylesheet"] CSS style to be placed in the header
 * ["frame"] render a certain frame in "file_frames", default: top level
 *
 * // maybe soon...
 * "shadows": folded faces have little edge shadows
 * ["svg"] initialize an SVG to draw into. by default this will create one
 * ["foldAngle"] show fold-angles as alpha values for stroke
 */

import defaultStyle from "../styles/default.css";
import vkXML from "../../include/vkbeautify-xml";
import { shadowFilter } from "../svg/effects";
import renderDiagrams from "./diagrams";

// import {
//   svgBoundaries,
//   svgVertices,
//   svgEdges,
//   svgFacesVertices,
//   svgFacesEdges,
// } from "./components";

import { boundaries_polygon } from "./boundaries";
import { vertices_circle } from "./vertices";
import { edges_path } from "./edges";
import {
  faces_vertices_polygon,
  faces_edges_polygon
} from "./faces";

import window from "../environment/window";

import { bounding_rect } from "../FOLD/boundary";
import { flatten_frame } from "../FOLD/file_frames";

import {
  svg,
  group,
  style,
  setViewBox,
} from "../svg/svg";

const svgFaces = function (graph) {
  if ("faces_vertices" in graph === true) {
    return faces_vertices_polygon(graph);
  }
  if ("faces_edges" in graph === true) {
    return faces_edges_polygon(graph);
  }
  return [];
};

const components = {
  vertices: vertices_circle,
  edges: edges_path,
  faces: svgFaces,
  boundaries: boundaries_polygon,
};

const all_classes = function (graph) {
  const file_classes = (graph.file_classes != null
    ? graph.file_classes : []).join(" ");
  const frame_classes = (graph.frame_classes != null
    ? graph.frame_classes : []).join(" ");
  return [file_classes, frame_classes]
    .filter(s => s !== "")
    .join(" ");
};

const clean_number = function (num, places = 14) {
  return parseFloat(num.toFixed(places));
};

/**
 * options are, generally, to draw everything possible.
 * specify a frame number otherwise it will render the top level
 * draw
 */
const fold_to_svg = function (fold, options = {}) {
  let graph = fold;
  // clean vertices, back up original values
  if (graph.vertices_coords != null) {
    graph.vertices_coordsPreClean = graph.vertices_coords;
    graph.vertices_coords = JSON.parse(JSON.stringify(graph.vertices_coords))
      .map(v => v.map(n => clean_number(n)));
  }

  const o = {
    defaults: true,
    width: "500px",
    height: "500px",
    inlineStyle: true,
    stylesheet: defaultStyle,
    shadows: false,
    padding: 0,
    viewBox: null, // type is an array of 4 numbers: x y w h
    // show / hide components. is visible?
    diagram: true, // if there is an "re:diagrams" frame, draw it.
    boundaries: true,
    faces: true,
    edges: true,
    vertices: false,
  };
  Object.assign(o, options);
  if (o.frame != null) {
    graph = flatten_frame(fold, o.frame);
  }
  if (o.svg == null) {
    o.svg = svg();
  }
  // copy file/frame classes to top level
  const classValue = all_classes(graph);
  if (classValue !== "") { o.svg.setAttribute("class", classValue); }
  o.svg.setAttribute("width", o.width);
  o.svg.setAttribute("height", o.height);

  // const styleElement = style();
  // o.svg.appendChild(styleElement);

  const groups = { };
  ["boundaries", "faces", "edges", "vertices"].filter(key => o[key])
    .forEach((key) => {
      groups[key] = group();
      groups[key].setAttribute("class", key);
    });
  // draw geometry into groups
  Object.keys(groups)
    .forEach(key => components[key](graph)
      .forEach(a => groups[key].appendChild(a)));

  Object.keys(groups)
    .filter(key => groups[key].childNodes.length > 0)
    .forEach(key => o.svg.appendChild(groups[key]));

  // if exists, draw diagram instructions, arrows
  if ("re:diagrams" in graph && o.diagram) {
    const instructionLayer = group();
    o.svg.appendChild(instructionLayer);
    renderDiagrams(graph, instructionLayer);
  }

  if (o.shadows) {
    const shadow_id = "face_shadow";
    const filter = shadowFilter(shadow_id);
    o.svg.appendChild(filter);
    Array.from(groups.faces.childNodes)
      .forEach(f => f.setAttribute("filter", `url(#${shadow_id})`));
  }

  const rect = bounding_rect(graph);
  if (o.viewBox != null) {
    setViewBox(o.svg, ...o.viewBox, o.padding);
  } else {
    setViewBox(o.svg, ...rect, o.padding);
  }
  // finished with graph
  if (graph.vertices_coordsPreClean != null) {
    graph.vertices_coords = graph.vertices_coordsPreClean;
    delete graph.vertices_coordsPreClean;
  }

  // fill CSS style with --crease-width, and custom or a default style
  // if (o.inlineStyle) {
  //   const vmin = rect[2] > rect[3] ? rect[3] : rect[2];
  //   const innerStyle = `\nsvg { --crease-width: ${vmin * 0.005}; }\n${o.stylesheet}`;
  //   // wrap style in CDATA section
  //   const docu = (new window.DOMParser())
  //     .parseFromString("<xml></xml>", "application/xml");
  //   const cdata = docu.createCDATASection(innerStyle);
  //   styleElement.appendChild(cdata);
  // }

  const stringified = (new window.XMLSerializer()).serializeToString(o.svg);
  const beautified = vkXML(stringified);
  return beautified;
};

export default fold_to_svg;
