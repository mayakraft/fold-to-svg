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
  diagrams: renderDiagrams,
};

const makeDefaults = (vmin = 1) => recursive_freeze({
  input: "string", // "string", "svg"
  output: "string", // "string", "svg"

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

  // attributes style
  attributes: {
    svg: {
      width: "500px",
      height: "500px",
      stroke: "black",
      fill: "none",
      "stroke-linejoin": "bevel",
      "stroke-width": vmin / 200,
    },
    boundaries: {
      fill: "white",
    },
    faces: {
      stroke: "none",
      /* these below will be applied onto specific elements based on class */
      front: { stroke: "black", fill: "gray" },
      back: { stroke: "black", fill: "white" },
    },
    edges: {
      /* these below will be applied onto specific elements based on class */
      boundary: {},
      mountain: { stroke: "red" },
      valley: { stroke: "blue" },
      mark: { stroke: "lightgray" },
      unassigned: { stroke: "lightgray" },
    },
    vertices: {
      stroke: "none",
      fill: "black",
      /* these below will be applied onto specific elements */
      r: vmin / 200
    }
  }
});

const recursiveAssign = function (target, source) {
  Object.keys(source).forEach((key) => {
    if (typeof source[key] === "object" && source[key] !== null) {
      if (!(key in target)) { target[key] = {}; }
      recursiveAssign(target[key], source[key])
    } else if (!(key in target)) {
      target[key] = source[key];
    }
  });
};

/**
 * options are, generally, to draw everything possible.
 * specify a frame number otherwise it will render the top level
 *
 * input type should be "object". type should already be checked
 */
const fold_to_svg = function (input, options = {}) {
  // get the FOLD input
  const graph = (typeof options.file_frame === "number"
    ? flatten_frame(input, options.file_frame)
    : input);
  const bounds = bounding_rect(graph);
  const vmin = Math.min(bounds[2], bounds[3]);

  // sanitize options
  recursiveAssign(options, makeDefaults(vmin));

  const svg = SVG.svg();
  SVG.setViewBox(svg, ...bounds, options.padding);
  const classValue = all_classes(graph);
  if (classValue !== "") { svg.setAttribute("class", classValue); }

  Object.keys(options.attributes.svg)
    .forEach(style => svg.setAttribute(style, options.attributes.svg[style]));

  // if we need a DEFS section, add it here
  const defs = (options.stylesheet != null || options.shadows != null
    ? SVG.defs(svg)
    : undefined);
  if (options.stylesheet != null) {
    const style = SVG.style(defs);
    // wrap style in CDATA section
    const cdata = (new window.DOMParser())
      .parseFromString("<xml></xml>", "application/xml")
      // `\nsvg { --crease-width: ${vmin * 0.005}; }\n${options.stylesheet}`
      .createCDATASection(options.stylesheet);
    style.appendChild(cdata);
  }
  if (options.shadows != null) {
    const shadowOptions = (typeof options.shadows === "object" && options.shadows !== null
      ? options.shadows
      : { blur: vmin / 200 });
    defs.appendChild(shadowFilter(shadowOptions));
  }
  // override diagrams to false if there is no diagram information
  options.diagrams = !!(options.diagrams && (graph["re:diagrams"] != null));

  // draw
  const groups = { };
  ["boundaries", "edges", "faces", "vertices", "diagrams"].filter(key => options[key] === true)
    .forEach((key) => {
      groups[key] = SVG.group();
      groups[key].setAttribute("class", key);
    });
  // draw geometry into groups
  Object.keys(groups)
    .filter(key => component_draw_function[key] !== undefined)
    .forEach(key => component_draw_function[key](graph, options)
      .forEach(a => groups[key].appendChild(a)));
  // append geometry to SVG, if geometry exists
  Object.keys(groups)
    .filter(key => groups[key].childNodes.length > 0)
    .forEach(key => svg.appendChild(groups[key]));

  // apply specific style: edges
  if (groups.edges) {
    const edgeClasses = ["unassigned", "mark", "valley", "mountain", "boundary"];
    Object.keys(options.attributes.edges)
      .filter(key => !edgeClasses.includes(key))
      .forEach(key => groups.edges.setAttribute(key, options.attributes.edges[key]));
    Array.from(groups.edges.childNodes)
      .forEach(child => Object.keys(options.attributes.edges[child.getAttribute("class")] || {})
        .forEach(key => child.setAttribute(key, options.attributes.edges[child.getAttribute("class")][key])));
  }
  // faces
  if (groups.faces) {
    const faceClasses = ["front", "back"];
    Object.keys(options.attributes.faces)
      .filter(key => !faceClasses.includes(key))
      .forEach(key => groups.faces.setAttribute(key, options.attributes.faces[key]));
    Array.from(groups.faces.childNodes)
      .forEach(child => Object.keys(options.attributes.faces[child.getAttribute("class")] || {})
        .forEach(key => child.setAttribute(key, options.attributes.faces[child.getAttribute("class")][key])));
    if (options.shadows != null) {
      Array.from(groups.faces.childNodes).forEach(f => f.setAttribute("filter", "url(#shadow)"));
    }
  }
  // vertices. simpler, no classes
  if (groups.vertices) {
    Object.keys(options.attributes.vertices)
      .filter(key => key !== "r")
      .forEach(key => groups.vertices.setAttribute(key, options.attributes.vertices[key]));
    Array.from(groups.vertices.childNodes)
      .forEach(child => child.setAttribute("r", options.attributes.vertices.r));
  }
  // boundaries. simple.
  if (groups.boundaries) {
    Object.keys(options.attributes.boundaries)
      .forEach(key => groups.boundaries.setAttribute(key, options.attributes.boundaries[key]));
  }

  // return
  if (options.output === "svg") { return svg; }
  const stringified = (new window.XMLSerializer()).serializeToString(svg);
  const beautified = vkXML(stringified);
  return beautified;
};

export default fold_to_svg;
