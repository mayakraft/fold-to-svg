/**
 * fold to svg (c) Robby Kraft
 */
import { get_boundary } from "../FOLD/boundary";
import { polygon } from "../svg/svg";

export const boundaries_polygon = function (graph) {
  // todo this needs to be able to handle multiple boundaries
  if ("vertices_coords" in graph === false
    || "edges_vertices" in graph === false
    || "edges_assignment" in graph === false) {
    return [];
  }
  const boundary = get_boundary(graph)
    .vertices
    .map(v => graph.vertices_coords[v]);
  if (boundary.length === 0) { return []; }
  const p = polygon(boundary);
  p.setAttribute("class", "boundary");
  return [p];
};
