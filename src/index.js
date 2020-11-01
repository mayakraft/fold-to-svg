/**
 * fold to svg (c) Robby Kraft
 */
import window from "./environment/window";
import vkXML from "../include/vkbeautify-xml";
import { vertices_circle } from "./render/components/vertices";
import { boundaries_polygon } from "./render/components/boundaries";
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
import { get_object } from "./environment/javascript";
import linker from "./environment/linker";
import render_into_svg from "./render/index";
import K from "./keys";
import make_options from "./options/make_options";
import render_components from "./render/components/index";
import Libraries from "./environment/libraries";
import use from "./environment/use";

const svg = () => {
  const svgImage = window.document[K.createElementNS](Libraries.SVG.NS, K.svg);
  svgImage.setAttribute("version", "1.1");
  svgImage.setAttribute("xmlns", Libraries.SVG.NS);
  return svgImage;
};

const FoldToSvg = (arg, options = {}) => {
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

// // get the FOLD input
// const graph = (typeof options.file_frame === K.number
//   ? flatten_frame(input, options.file_frame)
//   : input);

Object.assign(FoldToSvg, {
  vertices_circle,
  boundaries_polygon,
  edges_path_data,
  edges_by_assignment_paths_data,
  edges_path,
  edges_line,
  faces_vertices_polygon,
  faces_edges_polygon,
  render_components,
  render_into_svg,
  linker: linker.bind(FoldToSvg),
  use,
});

export default FoldToSvg;
