/**
 * fold to svg (c) Robby Kraft
 */
import vkXML from "../include/vkbeautify-xml";
import * as K from "./keys";
import Libraries from "./environment/libraries";
import linker from "./environment/linker";
import use from "./environment/use";
import window from "./environment/window";
import { get_object } from "./environment/javascript";
import make_options from "./options/make_options";
import render_into_svg from "./render/index";
// expose these methods in the top-level export
import render_components from "./render/components/index";
import { boundaries_polygon } from "./render/components/boundaries";
import { vertices_circle } from "./render/components/vertices";
import {
  edges_path_data,
  edges_by_assignment_paths_data,
  edges_path,
  edges_line
} from "./render/components/edges";
import {
  faces_vertices_polygon,
  faces_edges_polygon
} from "./render/components/faces";

const svg = () => {
  const svgImage = window.document[K.createElementNS](Libraries.SVG.NS, K.svg);
  svgImage.setAttribute("version", "1.1");
  svgImage.setAttribute("xmlns", Libraries.SVG.NS);
  return svgImage;
};

const FoldToSvg = (arg, options = {}) => {
  // get the input from a string or an object
  const graph = get_object(arg);
  // options
  make_options(graph, options);
  // render
  const element = render_into_svg(svg(), graph, options);
  // return
  if (options.output === K.svg) { return element; }
  const stringified = (new window.XMLSerializer()).serializeToString(element);
  const beautified = vkXML(stringified);
  return beautified;
};

Object.assign(FoldToSvg, {
  render_into_svg,
  render_components,
  options: make_options,
  boundaries_polygon,
  vertices_circle,
  edges_path_data,
  edges_by_assignment_paths_data,
  edges_path,
  edges_line,
  faces_vertices_polygon,
  faces_edges_polygon,
  linker: linker.bind(FoldToSvg),
  use,
});

export default FoldToSvg;
