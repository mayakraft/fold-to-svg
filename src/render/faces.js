/**
 * fold to svg (c) Robby Kraft
 */
import {
  make_faces_coloring_from_faces_matrix,
  make_faces_coloring,
} from "../graph/make";
import * as K from "../keys";

import { polygon } from "../../include/svg";

// todo: include sorting with "facesOrder"

const faces_sorted_by_layer = function (faces_layer) {
  return faces_layer.map((layer, i) => ({ layer, i }))
    .sort((a, b) => a.layer - b.layer)
    .map(el => el.i);
};

const make_faces_sidedness = function (graph) {
  // determine coloring of each face
  let coloring = graph[K.faces_re_coloring];
  if (coloring == null) {
    coloring = (K.faces_re_matrix in graph)
      ? make_faces_coloring_from_faces_matrix(graph[K.faces_re_matrix])
      : make_faces_coloring(graph, 0);
    // replace this with a face-vertex-winding-order calculator
  }
  return coloring.map(c => (c ? K.front : K.back));
};

const finalize_faces = function (graph, svg_faces) {
  const isFoldedForm = typeof graph.frame_classes === K.object
    && graph.frame_classes !== null
    && !(graph.frame_classes.includes(K.creasePattern));
  const orderIsCertain = graph[K.faces_re_layer] != null
    && graph[K.faces_re_layer].length === graph[K.faces_vertices].length;
  // todo: include other ways of determining faces_ordering
  if (orderIsCertain && isFoldedForm) {
    // only if face order is known
    make_faces_sidedness(graph)
      .forEach((side, i) => svg_faces[i][K.setAttributeNS](null, K._class, side));
  }
  return (orderIsCertain
    ? faces_sorted_by_layer(graph[K.faces_re_layer]).map(i => svg_faces[i])
    : svg_faces);
};

export const faces_vertices_polygon = function (graph) {
  if (K.faces_vertices in graph === false
    || K.vertices_coords in graph === false) {
    return [];
  }
  const svg_faces = graph[K.faces_vertices]
    .map(fv => fv.map(v => graph[K.vertices_coords][v]))
    .map(face => polygon(face));
  svg_faces.forEach((face, i) => face[K.setAttributeNS](null, K.index, i)); // `${i}`));
  return finalize_faces(graph, svg_faces);
};

export const faces_edges_polygon = function (graph) {
  if (K.faces_edges in graph === false
    || K.edges_vertices in graph === false
    || K.vertices_coords in graph === false) {
    return [];
  }
  const svg_faces = graph[K.faces_edges]
    .map(face_edges => face_edges
      .map(edge => graph[K.edges_vertices][edge])
      .map((vi, i, arr) => {
        const next = arr[(i + 1) % arr.length];
        return (vi[1] === next[0] || vi[1] === next[1] ? vi[0] : vi[1]);
      }).map(v => graph[K.vertices_coords][v]))
    .map(face => polygon(face));
  svg_faces.forEach((face, i) => face[K.setAttributeNS](null, K.index, i)); // `${i}`));
  return finalize_faces(graph, svg_faces);
};
