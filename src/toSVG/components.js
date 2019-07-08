import {
  polygon,
  circle,
  line,
} from "../../include/svg";

import {
  get_boundary,
  faces_coloring_from_faces_matrix,
  faces_coloring,
} from "../graph";

const CREASE_NAMES = {
  B: "boundary", b: "boundary",
  M: "mountain", m: "mountain",
  V: "valley",   v: "valley",
  F: "mark",     f: "mark",
  U: "mark",     u: "mark",
}; // easy to remember: "fuck you, mark"

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
      ? faces_coloring_from_faces_matrix(graph["faces_re:matrix"])
      : faces_coloring(graph, 0);
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

const make_edge_assignment_names = function (graph) {
  return (graph.edges_vertices == null || graph.edges_assignment == null
    || graph.edges_vertices.length !== graph.edges_assignment.length
    ? []
    : graph.edges_assignment.map(a => CREASE_NAMES[a]));
};

const svgBoundaries = function (graph) {
  // todo this needs to be able to handle multiple boundaries
  if ("edges_vertices" in graph === false
    || "vertices_coords" in graph === false) {
    return [];
  }
  const boundary = get_boundary(graph)
    .vertices
    .map(v => graph.vertices_coords[v]);
  const p = polygon(boundary);
  p.setAttribute("class", "boundary");
  return [p];
};

const svgVertices = function (graph, options) {
  if ("vertices_coords" in graph === false) {
    return [];
  }
  const radius = options && options.radius ? options.radius : 0.01;
  const svg_vertices = graph.vertices_coords
    .map(v => circle(v[0], v[1], radius));
  svg_vertices.forEach((c, i) => c.setAttribute("id", `${i}`));
  return svg_vertices;
};

const svgEdges = function (graph) {
  if ("edges_vertices" in graph === false
    || "vertices_coords" in graph === false) {
    return [];
  }
  const svg_edges = graph.edges_vertices
    .map(ev => ev.map(v => graph.vertices_coords[v]))
    .map(e => line(e[0][0], e[0][1], e[1][0], e[1][1]));
  svg_edges.forEach((edge, i) => edge.setAttribute("id", `${i}`));
  make_edge_assignment_names(graph)
    .forEach((a, i) => svg_edges[i].setAttribute("class", a));
  return svg_edges;
};

const svgFacesVertices = function (graph) {
  if ("faces_vertices" in graph === false
    || "vertices_coords" in graph === false) {
    return [];
  }
  const svg_faces = graph.faces_vertices
    .map(fv => fv.map(v => graph.vertices_coords[v]))
    .map(face => polygon(face));
  svg_faces.forEach((face, i) => face.setAttribute("id", `${i}`));
  return finalize_faces(graph, svg_faces);
};

const svgFacesEdges = function (graph) {
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
  svg_faces.forEach((face, i) => face.setAttribute("id", `${i}`));
  return finalize_faces(graph, svg_faces);
};

const svgFaces = function (graph) {
  if ("faces_vertices" in graph === true) {
    return svgFacesVertices(graph);
  }
  if ("faces_edges" in graph === true) {
    return svgFacesEdges(graph);
  }
  return [];
};

export default {
  vertices: svgVertices,
  edges: svgEdges,
  faces: svgFaces,
  boundaries: svgBoundaries,
};
