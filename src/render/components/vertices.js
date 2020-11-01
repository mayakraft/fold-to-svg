/**
 * fold to svg (c) Robby Kraft
 */
import * as K from "../../keys";
import Libraries from "../../environment/libraries";

export const vertices_circle = function (graph, options) {
  if (K.vertices_coords in graph === false) {
    return [];
  }
  const svg_vertices = graph[K.vertices_coords]
    .map(v => Libraries.SVG.circle(v[0], v[1], 0.01)); // radius overwritten in "style"
  svg_vertices.forEach((c, i) => c[K.setAttributeNS](null, K.index, i));
  return svg_vertices;
};

