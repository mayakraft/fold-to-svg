/**
 * fold to svg (c) Robby Kraft
 */
import * as K from "../../keys";
import Libraries from "../../environment/libraries";
import { get_boundary } from "../../../src/graph/boundary";

export const boundaries_polygon = (graph) => {
  // todo this needs to be able to handle multiple boundaries
  if (K.vertices_coords in graph === false
    || K.edges_vertices in graph === false
    || K.edges_assignment in graph === false) {
    return [];
  }
  const boundary = get_boundary(graph)
    .vertices
    .map(v => graph[K.vertices_coords][v]);
  if (boundary.length === 0) { return []; }
  const p = Libraries.SVG.polygon(boundary);
  p[K.setAttributeNS](null, K._class, K.boundary);
  return [p];
};