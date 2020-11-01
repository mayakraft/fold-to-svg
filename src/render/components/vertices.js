/**
 * fold to svg (c) Robby Kraft
 */
import { circle } from "../../../include/svg";
import * as K from "../../keys";

export const vertices_circle = function (graph, options) {
  if (K.vertices_coords in graph === false) {
    return [];
  }
  const radius = options && options.radius ? options.radius : 0.01;
  const svg_vertices = graph[K.vertices_coords]
    .map(v => circle(v[0], v[1], radius));
  svg_vertices.forEach((c, i) => c[K.setAttributeNS](null, K.index, i));
  return svg_vertices;
};

