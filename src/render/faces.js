import {
  make_faces_coloring_from_faces_matrix,
  make_faces_coloring,
} from "../FOLD/make";

import { polygon } from "../svg/svg";

const faces_sorted_by_layer = function (faces_layer) {
  return faces_layer.map((layer, i) => ({ layer, i }))
    .sort((a, b) => a.layer - b.layer)
    .map(el => el.i);
};

const make_faces_sidedness = function (graph) {
  // determine coloring of each face
  let coloring = graph["faces_re:coloring"];
  if (coloring == null) {
    coloring = ("faces_re:matrix" in graph)
      ? make_faces_coloring_from_faces_matrix(graph["faces_re:matrix"])
      : make_faces_coloring(graph, 0);
    // replace this with a face-vertex-winding-order calculator
  }
  return coloring.map(c => (c ? "front" : "back"));
};

const finalize_faces = function (graph, svg_faces) {
  const orderIsCertain = graph["faces_re:layer"] != null
    && graph["faces_re:layer"].length === graph.faces_vertices.length;
  // todo: include other ways of determining faces_ordering
  if (orderIsCertain) {
    // only if face order is known
    make_faces_sidedness(graph)
      .forEach((side, i) => svg_faces[i].setAttribute("class", side));
  }
  return (orderIsCertain
    ? faces_sorted_by_layer(graph["faces_re:layer"]).map(i => svg_faces[i])
    : svg_faces);
};

export const faces_vertices_polygon = function (graph) {
  if ("faces_vertices" in graph === false
    || "vertices_coords" in graph === false) {
    return [];
  }
  const svg_faces = graph.faces_vertices
    .map(fv => fv.map(v => graph.vertices_coords[v]))
    .map(face => polygon(face));
  svg_faces.forEach((face, i) => face.setAttribute("index", i)); // `${i}`));
  return finalize_faces(graph, svg_faces);
};

export const faces_edges_polygon = function (graph) {
  if ("faces_edges" in graph === false
    || "edges_vertices" in graph === false
    || "vertices_coords" in graph === false) {
    return [];
  }
  const svg_faces = graph.faces_edges
    .map(face_edges => face_edges
      .map(edge => graph.edges_vertices[edge])
      .map((vi, i, arr) => {
        const next = arr[(i + 1) % arr.length];
        return (vi[1] === next[0] || vi[1] === next[1] ? vi[0] : vi[1]);
      }).map(v => graph.vertices_coords[v]))
    .map(face => polygon(face));
  svg_faces.forEach((face, i) => face.setAttribute("index", i)); // `${i}`));
  return finalize_faces(graph, svg_faces);
};
