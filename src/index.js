/**
 * fold to svg (c) Robby Kraft
 */
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
import { get_object } from "./environment/javascript";
import linker from "./environment/linker";
import render from "./render/index";
import * as K from "./keys";

const FoldToSvg = function (input, options) {
  try {
    const graph = get_object(input);
    return render(graph, options);
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
FoldToSvg.linker = linker.bind(FoldToSvg);

export default FoldToSvg;
