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

import vkXML from "../../include/vkbeautify-xml";
import math from "../../include/math";
import window from "../environment/window";
import defaultStyle from "../styles/default.css";
import { bounding_rect } from "../FOLD/boundary";
import { flatten_frame } from "../FOLD/file_frames";
import { all_classes } from "../FOLD/class";
import { shadowFilter } from "../svg/effects";
import * as SVG from "../svg/svg";

// components
import { boundaries_polygon } from "./boundaries";
import { vertices_circle } from "./vertices";
import { edges_path } from "./edges";
import {
  faces_vertices_polygon,
  faces_edges_polygon
} from "./faces";
import renderDiagrams from "./diagrams";

// there is a built in preference to using faces_vertices, due to it
// requiring fewer components to be present, and preparation being faster
const faces_function = function (graph) {
  return graph.faces_vertices != null
    ? faces_vertices_polygon(graph)
    : faces_edges_polygon(graph);
};

const components = {
  vertices: vertices_circle,
  edges: edges_path,
  faces: faces_function,
  boundaries: boundaries_polygon,
};

const defaults = Object.freeze({
  input: "string", // "string", "svg"
  output: "string", // "string", "svg"

  padding: null,
  viewBox: null, // type is an array of 4 numbers: x y w h
  file_frame: null,

  // show / hide. is it visible?
  diagrams: true, // if "re:diagrams" exists
  boundaries: true,
  faces: true,
  edges: true,
  vertices: false,
});

const stringToObject = function (input) {
  return (typeof input === "string" || input instanceof String
    ? JSON.parse(input)
    : input);
};

const default_svg_style = Object.freeze({
  width: "500px",
  height: "500px",
  stroke: "black",
  fill: "none",
  "stroke-linejoin": "bevel",
})

const default_component_styles = Object.freeze({
  boundaries: {},
  faces: { stroke: "none" },
  edges: {},
  vertices: { stroke: "none", fill: "black" },
});

const default_face_assignment_styles = Object.freeze({
  front: { stroke: "black", fill: "gray" },
  back: { stroke: "black", fill: "white" },
});

const default_edge_assignment_styles = Object.freeze({
  boundary: {},
  mountain: { stroke: "red" },
  valley: { stroke: "blue" },
  mark: { stroke: "gray" },
  unassigned: {},
});

/**
 * options are, generally, to draw everything possible.
 * specify a frame number otherwise it will render the top level
 * draw
 */
const fold_to_svg = function (input, options = defaults) {
  // sanitize options
  Object.keys(defaults)
    .filter(k => !(k in options))
    .forEach((k) => { options[k] = defaults[k]});

  // get the FOLD input
  const graph = (typeof options.file_frame === "number"
    ? flatten_frame(stringToObject(input), options.file_frame)
    : stringToObject(input));

  // clean vertices, back up original values
  // if (graph.vertices_coords != null) {
  //   graph.vertices_coordsPreClean = graph.vertices_coords;
  //   graph.vertices_coords = JSON.parse(JSON.stringify(graph.vertices_coords))
  //     .map(v => v.map(n => math.core.clean_number(n)));
  // }
  const svg = SVG.svg();

  Object.keys(default_svg_style)
    .forEach(style => svg.setAttribute(style, default_svg_style[style]));

  // copy file/frame classes to top level
  if (typeof parseFloat(options.width) === "number" && !isNaN(parseFloat(options.width))) {
    svg.setAttribute("width", options.width);
  }
  if (typeof parseFloat(options.height) === "number" && !isNaN(parseFloat(options.height))) {
    svg.setAttribute("height", options.height);
  }
  const classValue = all_classes(graph);
  if (classValue !== "") { svg.setAttribute("class", classValue); }

  // if we need a DEFS section, add it here
  // const styleElement = style();
  // svg.appendChild(styleElement);

  // draw
  const groups = { };
  ["boundaries", "edges", "faces", "vertices"].filter(key => options[key] === true)
    .forEach((key) => {
      groups[key] = SVG.group();
      groups[key].setAttribute("class", key);
      Object.keys(default_component_styles[key])
        .forEach(style => groups[key].setAttribute(style, default_component_styles[key][style]));
    });
  // draw geometry into groups
  Object.keys(groups)
    .forEach(key => components[key](graph)
      .forEach(a => groups[key].appendChild(a)));
  // append geometry to SVG, if geometry exists
  Object.keys(groups)
    .filter(key => groups[key].childNodes.length > 0)
    .forEach(key => svg.appendChild(groups[key]));

  // apply specific style: edges
  Object.keys(default_edge_assignment_styles)
    .forEach(assignment => Array.from(groups.edges.childNodes)
      .filter(child => assignment === child.getAttribute("class"))
      .forEach(child => Object.keys(default_edge_assignment_styles[assignment])
        .forEach(key => child.setAttribute(key, default_edge_assignment_styles[assignment][key]))));
  // faces
  Object.keys(default_face_assignment_styles)
    .forEach(assignment => Array.from(groups.faces.childNodes)
      .filter(child => assignment === child.getAttribute("class"))
      .forEach(child => Object.keys(default_face_assignment_styles[assignment])
        .forEach(key => child.setAttribute(key, default_face_assignment_styles[assignment][key]))));
  // if exists, draw diagram instructions, arrows
  // if ("re:diagrams" in graph && o.diagram) {
  //   const instructionLayer = group();
  //   svg.appendChild(instructionLayer);
  //   renderDiagrams(graph, instructionLayer);
  // }

  // if (o.shadows) {
  //   const shadow_id = "face_shadow";
  //   const filter = shadowFilter(shadow_id);
  //   svg.appendChild(filter);
  //   Array.from(groups.faces.childNodes)
  //     .forEach(f => f.setAttribute("filter", `url(#${shadow_id})`));
  // }

  const rect = bounding_rect(graph);
  if (options.viewBox !== null &&
    (typeof options.viewBox === "string" || typeof options.viewBox === "object")) {
    SVG.setViewBox(svg, ...options.viewBox, options.padding);
  } else {
    SVG.setViewBox(svg, ...rect, options.padding);
  }

  const vmin = Math.min(rect[2], rect[3]);
  if (vmin !== 0) {
    svg.setAttribute("stroke-width", vmin / 100);
  }

  // finished with graph
  // if (graph.vertices_coordsPreClean != null) {
  //   graph.vertices_coords = graph.vertices_coordsPreClean;
  //   delete graph.vertices_coordsPreClean;
  // }

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

  // return
  if (options.output === "svg") { return svg; }
  const stringified = (new window.XMLSerializer()).serializeToString(svg);
  const beautified = vkXML(stringified);
  return beautified;
};

export default fold_to_svg;
