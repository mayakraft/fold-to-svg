/**
 * fold to svg (c) Robby Kraft
 */
import math from "../../include/math";

export const make_vertices_edges = function ({ edges_vertices }) {
  if (!edges_vertices) { return undefined; }
  const vertices_edges = [];
  edges_vertices.forEach((ev, i) => ev
    .forEach((v) => {
      if (vertices_edges[v] === undefined) {
        vertices_edges[v] = [];
      }
      vertices_edges[v].push(i);
    }));
  return vertices_edges;
};

// todo: make_edges_faces c-clockwise
export const make_edges_vertices = function ({
  edges_vertices, faces_edges
}) {
  if (!edges_vertices || !faces_edges) { return undefined; }
  const edges_faces = Array
    .from(Array(edges_vertices.length))
    .map(() => []);
  // todo: does not arrange counter-clockwise
  faces_edges.forEach((face, f) => {
    const hash = [];
    // use an intermediary hash to handle the case where faces visit one
    // vertex multiple times. otherwise there are redundant indices.
    face.forEach((edge) => { hash[edge] = f; });
    hash.forEach((fa, e) => edges_faces[e].push(fa));
  });
  return edges_faces;
};

// faces_faces is a set of faces edge-adjacent to a face. for every face.
export const make_faces_faces = function ({ faces_vertices }) {
  if (!faces_vertices) { return undefined; }
  const nf = faces_vertices.length;
  const faces_faces = Array.from(Array(nf)).map(() => []);
  const edgeMap = {};
  faces_vertices.forEach((vertices_index, idx1) => {
    if (vertices_index === undefined) { return; } // todo: necessary?
    const n = vertices_index.length;
    vertices_index.forEach((v1, i, vs) => {
      let v2 = vs[(i + 1) % n];
      if (v2 < v1) { [v1, v2] = [v2, v1]; }
      const key = `${v1} ${v2}`;
      if (key in edgeMap) {
        const idx2 = edgeMap[key];
        faces_faces[idx1].push(idx2);
        faces_faces[idx2].push(idx1);
      } else {
        edgeMap[key] = idx1;
      }
    });
  });
  return faces_faces;
};

export const make_edges_edges = function ({
  edges_vertices, vertices_edges
}) {
  if (!edges_vertices || !vertices_edges) { return undefined; }
  return edges_vertices.map((ev, i) => {
    const vert0 = ev[0];
    const vert1 = ev[1];
    const side0 = vertices_edges[vert0].filter(e => e !== i);
    const side1 = vertices_edges[vert1].filter(e => e !== i);
    return side0.concat(side1);
  });
};

// todo: make_edges_faces c-clockwise
export const make_edges_faces = function ({
  edges_vertices, faces_edges
}) {
  if (!edges_vertices || !faces_edges) { return undefined; }
  const edges_faces = Array
    .from(Array(edges_vertices.length))
    .map(() => []);
  // todo: does not arrange counter-clockwise
  faces_edges.forEach((face, f) => {
    const hash = [];
    // use an intermediary hash to handle the case where faces visit one
    // vertex multiple times. otherwise there are redundant indices.
    face.forEach((edge) => { hash[edge] = f; });
    hash.forEach((fa, e) => edges_faces[e].push(fa));
  });
  return edges_faces;
};

export const make_edges_length = function ({ vertices_coords, edges_vertices }) {
  if (!vertices_coords || !edges_vertices) { return undefined; }
  return edges_vertices
    .map(ev => ev.map(v => vertices_coords[v]))
    .map(edge => math.core.distance(...edge));
};

const assignment_angles = {
  M: -180,
  m: -180,
  V: 180,
  v: 180
};

export const make_edges_foldAngle = function ({ edges_assignment }) {
  if (!edges_assignment) { return undefined; }
  return edges_assignment.map(a => assignment_angles[a] || 0);
};

/**
 * for fast backwards lookup, this builds a dictionary with keys as vertices
 * that compose an edge "6 11" always sorted smallest to largest, with a space.
 * the value is the index of the edge.
 */
export const make_vertex_pair_to_edge_map = function ({ edges_vertices }) {
  if (!edges_vertices) { return {}; } // todo, should this return undefined?
  const map = {};
  edges_vertices
    .map(ev => ev.sort((a, b) => a - b).join(" "))
    .forEach((key, i) => { map[key] = i; });
  return map;
};

/**
 * build vertices_faces from faces_vertices
 */
export const make_vertices_faces = function ({
  vertices_coords, faces_vertices
}) {
  if (!vertices_coords || !faces_vertices) { return undefined; }
  const vertices_faces = Array.from(Array(vertices_coords.length))
    .map(() => []);
  faces_vertices.forEach((face, f) => {
    const hash = [];
    // use an intermediary hash to handle the case where faces visit one
    // vertex multiple times. otherwise there are redundant indices.
    face.forEach((vertex) => { hash[vertex] = f; });
    hash.forEach((fa, v) => vertices_faces[v].push(fa));
  });
  return vertices_faces;
};

// root_face will become the root node
export const make_face_walk_tree = function (graph, root_face = 0) {
  const edge_map = make_vertex_pair_to_edge_map(graph);
  // console.log("edge_map", edge_map)
  const new_faces_faces = make_faces_faces(graph);
  if (new_faces_faces.length <= 0) {
    return [];
  }
  let visited = [root_face];
  const list = [[{
    face: root_face,
    parent: undefined,
    edge: undefined,
    level: 0,
  }]];
  // let current_level = 0;
  do {
    // current_level += 1;
    list[list.length] = list[list.length - 1].map((current) => {
      const unique_faces = new_faces_faces[current.face]
        .filter(f => visited.indexOf(f) === -1);
      visited = visited.concat(unique_faces);
      return unique_faces.map((f) => {
        const edge_vertices = graph.faces_vertices[f]
          .filter(v => graph.faces_vertices[current.face].indexOf(v) !== -1)
          .sort((a, b) => a - b);
        const edge = edge_map[edge_vertices.join(" ")];
        return {
          face: f,
          parent: current.face,
          // level: current_level,
          edge,
          edge_vertices,
        };
      });
    }).reduce((prev, curr) => prev.concat(curr), []);
  } while (list[list.length - 1].length > 0);
  if (list.length > 0 && list[list.length - 1].length === 0) { list.pop(); }
  return list;
};

// /////////////////////////////////////////////
// MATRICES
// /////////////////////////////////////////////

/**
 * this face coloring skips marks joining the two faces separated by it.
 * it relates directly to if a face is flipped or not (determinant > 0)
 */
export const make_faces_coloring_from_faces_matrix = function (faces_matrix) {
  return faces_matrix
    .map(m => m[0] * m[3] - m[1] * m[2])
    .map(c => c >= 0);
};
/**
 * true/false: which face shares color with root face
 * the root face (and any similar-color face) will be marked as true
 */
export const make_faces_coloring = function (graph, root_face = 0) {
  const coloring = [];
  coloring[root_face] = true;
  make_face_walk_tree(graph, root_face)
    .forEach((level, i) => level
      .forEach((entry) => { coloring[entry.face] = (i % 2 === 0); }));
  return coloring;
};
