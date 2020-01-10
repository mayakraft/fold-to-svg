/**
 * fold to svg (c) Robby Kraft
 */
import { circle } from "../svg/svg";

export const vertices_circle = function (graph, options) {
  if ("vertices_coords" in graph === false) {
    return [];
  }
  const radius = options && options.radius ? options.radius : 0.01;
  const svg_vertices = graph.vertices_coords
    .map(v => circle(v[0], v[1], radius));
  svg_vertices.forEach((c, i) => c.setAttribute("id", `${i}`));
  return svg_vertices;
};

