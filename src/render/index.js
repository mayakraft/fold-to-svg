/**
 * fold to svg (c) Robby Kraft
 */
import vkXML from "../../include/vkbeautify-xml";
import math from "../../include/math";
import window from "../environment/window";
import defaultStyle from "../styles/default.css";
import { bounding_rect } from "../FOLD/boundary";
import { flatten_frame } from "../FOLD/file_frames";
import { all_classes } from "../FOLD/class";
import { recursive_freeze } from "../FOLD/object";
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
const faces_draw_function = function (graph) {
  return graph.faces_vertices != null
    ? faces_vertices_polygon(graph)
    : faces_edges_polygon(graph);
};

const component_draw_function = {
  vertices: vertices_circle,
  edges: edges_path,
  faces: faces_draw_function,
  boundaries: boundaries_polygon,
};

const attributes = recursive_freeze({
  svg: {
    width: "500px",
    height: "500px",
    stroke: "black",
    fill: "none",
    "stroke-linejoin": "bevel",
  },
  groups: {
    boundaries: {},
    faces: { stroke: "none" },
    edges: {},
    vertices: { stroke: "none", fill: "black" },
  },
  faces: {
    front: { stroke: "black", fill: "gray" },
    back: { stroke: "black", fill: "white" },
  },
  edges: {
    boundary: {},
    mountain: { stroke: "red" },
    valley: { stroke: "blue" },
    mark: { stroke: "gray" },
    unassigned: { stroke: "lightgray" },
  }
});

const defaults = Object.freeze({
  input: "string", // "string", "svg"
  output: "string", // "string", "svg"

  // attributes style
  attributes: attributes,

  padding: null,
  file_frame: null,
  stylesheet: null,
  shadows: null,

  // show / hide. is it visible?
  diagrams: true, // if "re:diagrams" exists
  boundaries: true,
  faces: true,
  edges: true,
  vertices: false,
});

/**
 * options are, generally, to draw everything possible.
 * specify a frame number otherwise it will render the top level
 *
 * input type should be "object". type should already be checked
 */
const fold_to_svg = function (input, options = defaults) {
  // sanitize options
  Object.keys(defaults)
    .filter(k => !(k in options))
    .forEach((k) => { options[k] = defaults[k]});

  // get the FOLD input
  const graph = (typeof options.file_frame === "number"
    ? flatten_frame(input, options.file_frame)
    : input);

  const svg = SVG.svg();
  const bounds = bounding_rect(graph);
  const vmin = Math.min(bounds[2], bounds[3]);
  SVG.setViewBox(svg, ...bounds, options.padding);
  svg.setAttribute("stroke-width", vmin / 100);
  // copy file/frame classes to top level
  const classValue = all_classes(graph);
  if (classValue !== "") { svg.setAttribute("class", classValue); }

  Object.keys(options.attributes.svg)
    .forEach(style => svg.setAttribute(style, options.attributes.svg[style]));

  // if we need a DEFS section, add it here
  const defs = (options.stylesheet != null || options.shadows != null
    ? SVG.defs(svg)
    : undefined);
  if (options.stylesheet != null) {
    // const vmin = bounds[2] > bounds[3] ? bounds[3] : bounds[2];
    // const innerStyle = `\nsvg { --crease-width: ${vmin * 0.005}; }\n${o.stylesheet}`;
    const style = SVG.style(defs);
    // wrap style in CDATA section
    const cdata = (new window.DOMParser())
      .parseFromString("<xml></xml>", "application/xml")
      .createCDATASection(options.stylesheet);
    style.appendChild(cdata);
  }
  if (options.shadows != null) {
    defs.appendChild(shadowFilter());
  }

  // draw
  const groups = { };
  ["boundaries", "edges", "faces", "vertices"].filter(key => options[key] === true)
    .forEach((key) => {
      groups[key] = SVG.group();
      groups[key].setAttribute("class", key);
      Object.keys(options.attributes.groups[key])
        .forEach(style => groups[key].setAttribute(style, options.attributes.groups[key][style]));
    });
  // draw geometry into groups
  Object.keys(groups)
    .forEach(key => component_draw_function[key](graph, options)
      .forEach(a => groups[key].appendChild(a)));
  // append geometry to SVG, if geometry exists
  Object.keys(groups)
    .filter(key => groups[key].childNodes.length > 0)
    .forEach(key => svg.appendChild(groups[key]));

  // apply specific style: edges
  Object.keys(options.attributes.edges)
    .forEach(assignment => Array.from(groups.edges.childNodes)
      .filter(child => assignment === child.getAttribute("class"))
      .forEach(child => Object.keys(options.attributes.edges[assignment])
        .forEach(key => child.setAttribute(key, options.attributes.edges[assignment][key]))));
  // faces
  Object.keys(options.attributes.faces)
    .forEach(assignment => Array.from(groups.faces.childNodes)
      .filter(child => assignment === child.getAttribute("class"))
      .forEach(child => Object.keys(options.attributes.faces[assignment])
        .forEach(key => child.setAttribute(key, options.attributes.faces[assignment][key]))));
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

  // return
  if (options.output === "svg") { return svg; }
  const stringified = (new window.XMLSerializer()).serializeToString(svg);
  const beautified = vkXML(stringified);
  return beautified;
};

export default fold_to_svg;
