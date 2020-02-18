/**
 * fold to svg (c) Robby Kraft
 */
import vkXML from "../../include/vkbeautify-xml";
import window from "../environment/window";
import { bounding_rect } from "../FOLD/boundary";
import { flatten_frame } from "../FOLD/file_frames";
import { all_classes } from "../FOLD/class";
import { shadowFilter } from "../svg/effects";
import * as SVG from "../../include/svg";
import Options from "../options/options";
import recursiveFill from "../options/recursiveFill";
import * as K from "../keys";

// components
import { boundaries_polygon } from "./boundaries";
import { vertices_circle } from "./vertices";
import { edges_path } from "./edges";
import {
  faces_vertices_polygon,
  faces_edges_polygon
} from "./faces";

// there is a built in preference to using faces_vertices, due to it
// requiring fewer components to be present, and preparation being faster
const faces_draw_function = function (graph) {
  return graph[K.faces_vertices] != null
    ? faces_vertices_polygon(graph)
    : faces_edges_polygon(graph);
};

const component_draw_function = {
  vertices: vertices_circle,
  edges: edges_path,
  faces: faces_draw_function,
  boundaries: boundaries_polygon
};

/**
 * options are, generally, to draw everything possible.
 * specify a frame number otherwise it will render the top level
 *
 * input type should be "object". type should already be checked
 *
 * 1. get the graph, run a few tests on it, gather some properties
 * 2. initialize a set of options that take properties as input
 * 3. create and draw svg
 *
 */
const fold_to_svg = function (input, options = {}) {
  // get the FOLD input
  const graph = (typeof options.file_frame === "number"
    ? flatten_frame(input, options.file_frame)
    : input);
  const bounds = bounding_rect(graph);
  const vmin = Math.min(bounds[2], bounds[3]);

  // options
  recursiveFill(options, Options(vmin));

  const svg = SVG.svg();
  SVG.setViewBox(svg, ...bounds, options.padding);
  const classValue = all_classes(graph);
  if (classValue !== "") { svg[K.setAttributeNS](null, K._class, classValue); }

  Object.keys(options.attributes.svg)
    .forEach(style => svg[K.setAttributeNS](null, style, options.attributes.svg[style]));

  // if we need a DEFS section, add it here
  const defs = (options.stylesheet != null || options.shadows != null
    ? SVG.defs(svg)
    : undefined);
  if (options.stylesheet != null) {
    const style = SVG.style(defs);
    // wrap style in CDATA section
    const strokeVar = options.attributes.svg[K.stroke_width]
      ? options.attributes.svg[K.stroke_width] : vmin / 200;
    const cdata = (new window.DOMParser())
      .parseFromString("<xml></xml>", "application/xml")
      .createCDATASection(`\n* { --${K.stroke_width}: ${strokeVar}; }\n${options.stylesheet}`);
    style[K.appendChild](cdata);
  }
  if (options.shadows != null) {
    const shadowOptions = (typeof options.shadows === K.object && options.shadows !== null
      ? options.shadows
      : { blur: vmin / 200 });
    defs[K.appendChild](shadowFilter(shadowOptions));
  }

  // draw
  const groups = { };
  [K.boundaries, K.edges, K.faces, K.vertices].filter(key => options[key] === true)
    .forEach((key) => {
      groups[key] = SVG.group();
      groups[key][K.setAttributeNS](null, K._class, key);
    });
  // draw geometry into groups
  Object.keys(groups)
    .filter(key => component_draw_function[key] !== undefined)
    .forEach(key => component_draw_function[key](graph, options)
      .forEach(a => groups[key][K.appendChild](a)));
  // append geometry to SVG, if geometry exists
  Object.keys(groups)
    .filter(key => groups[key].childNodes.length > 0)
    .forEach(key => svg[K.appendChild](groups[key]));

  // apply specific style: edges
  if (groups.edges) {
    const edgeClasses = [K.unassigned, K.mark, K.valley, K.mountain, K.boundary];
    Object.keys(options.attributes.edges)
      .filter(key => !edgeClasses.includes(key))
      .forEach(key => groups.edges[K.setAttributeNS](null, key, options.attributes.edges[key]));
    Array.from(groups.edges.childNodes)
      .forEach(child => Object.keys(options.attributes.edges[child.getAttribute(K._class)] || {})
        .forEach(key => child[K.setAttributeNS](null, key, options.attributes.edges[child.getAttribute(K._class)][key])));
  }
  // faces
  if (groups.faces) {
    const faceClasses = [K.front, K.back];
    Object.keys(options.attributes.faces)
      .filter(key => !faceClasses.includes(key))
      .forEach(key => groups.faces[K.setAttributeNS](null, key, options.attributes.faces[key]));
    Array.from(groups.faces.childNodes)
      .forEach(child => Object.keys(options.attributes.faces[child.getAttribute(K._class)] || {})
        .forEach(key => child[K.setAttributeNS](null, key, options.attributes.faces[child.getAttribute(K._class)][key])));
    if (options.shadows != null) {
      Array.from(groups.faces.childNodes).forEach(f => f[K.setAttributeNS](null, "filter", "url(#shadow)"));
    }
  }
  // vertices. simpler, no classes
  if (groups.vertices) {
    Object.keys(options.attributes.vertices)
      .filter(key => key !== "r")
      .forEach(key => groups.vertices[K.setAttributeNS](null, key, options.attributes.vertices[key]));
    Array.from(groups.vertices.childNodes)
      .forEach(child => child[K.setAttributeNS](null, "r", options.attributes.vertices.r));
  }
  // boundaries. simple.
  if (groups.boundaries) {
    Object.keys(options.attributes.boundaries)
      .forEach(key => groups.boundaries[K.setAttributeNS](null, key, options.attributes.boundaries[key]));
  }

  // return
  if (options.output === "svg") { return svg; }
  const stringified = (new window.XMLSerializer()).serializeToString(svg);
  const beautified = vkXML(stringified);
  return beautified;
};

export default fold_to_svg;
