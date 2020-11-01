/**
 * fold to svg (c) Robby Kraft
 */
import { svg } from "../include/svg";
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
import * as K from "./keys";
import make_options from "./options/make_options";
import render_components from "./render/components/index";

const FoldToSvg = (graph, options = {}) => {
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
});

// FoldToSvg.vertices_circle = vertices_circle;
// FoldToSvg.edges_path_data = edges_path_data;
// FoldToSvg.edges_by_assignment_paths_data = edges_by_assignment_paths_data;
// FoldToSvg.edges_path = edges_path;
// FoldToSvg.edges_line = edges_line;
// FoldToSvg.faces_vertices_polygon = faces_vertices_polygon;
// FoldToSvg.faces_edges_polygon = faces_edges_polygon;
// FoldToSvg.linker = linker.bind(FoldToSvg);

export default FoldToSvg;
