export const isFolded = function (graph) {
  if (graph.frame_classes == null) { return false; }
  return graph.frame_classes.includes("foldedForm");
};

const make_vertices_edges = function (graph) {
  const vertices_edges = graph.vertices_coords.map(() => []);
  graph.edges_vertices.forEach((ev, i) => ev
    .forEach(v => vertices_edges[v].push(i)));
  return vertices_edges;
};

export const get_boundary = function (graph) {
  const edges_vertices_b = graph.edges_assignment
    .map(a => a === "B" || a === "b");
  const vertices_edges = make_vertices_edges(graph);
  const edge_walk = [];
  const vertex_walk = [];
  let edgeIndex = -1;
  for (let i = 0; i < edges_vertices_b.length; i += 1) {
    if (edges_vertices_b[i]) { edgeIndex = i; break; }
  }
  edges_vertices_b[edgeIndex] = false;
  edge_walk.push(edgeIndex);
  vertex_walk.push(graph.edges_vertices[edgeIndex][0]);
  let nextVertex = graph.edges_vertices[edgeIndex][1];
  while (vertex_walk[0] !== nextVertex) {
    vertex_walk.push(nextVertex);
    edgeIndex = vertices_edges[nextVertex]
      .filter(v => edges_vertices_b[v])
      .shift();
    if (graph.edges_vertices[edgeIndex][0] === nextVertex) {
      [, nextVertex] = graph.edges_vertices[edgeIndex];
    } else {
      [nextVertex] = graph.edges_vertices[edgeIndex];
    }
    edges_vertices_b[edgeIndex] = false;
    edge_walk.push(edgeIndex);
  }
  return {
    vertices: vertex_walk,
    edges: edge_walk,
  };
};

export const bounding_rect = function (graph) {
  if ("vertices_coords" in graph === false
    || graph.vertices_coords.length <= 0) {
    return [0, 0, 0, 0];
  }
  const dimension = graph.vertices_coords[0].length;
  const min = Array(dimension).fill(Infinity);
  const max = Array(dimension).fill(-Infinity);
  graph.vertices_coords.forEach(v => v.forEach((n, i) => {
    if (n < min[i]) { min[i] = n; }
    if (n > max[i]) { max[i] = n; }
  }));
  return (isNaN(min[0]) || isNaN(min[1]) || isNaN(max[0]) || isNaN(max[1])
    ? [0, 0, 0, 0]
    : [min[0], min[1], max[0] - min[0], max[1] - min[1]]);
};

/**
 * fragment splits overlapping edges at their intersections
 * and joins new edges at a new shared vertex.
 * this destroys and rebuilds all face data with face walking
 */
export const fragment = function (graph, epsilon = Geom.core.EPSILON) {

  const EPSILON = 1e-12;
  const horizSort = function (a,b){ return a[0] - b[0]; }
  const vertSort = function (a,b){ return a[1] - b[1]; }
  // const horizSort2 = function (a,b){
  //  return a.intersection[0] - b.intersection[0]; }
  // const vertSort2 = function (a,b){
  //  return a.intersection[1] - b.intersection[1]; }

  const equivalent = function (a, b) {
    for (var i = 0; i < a.length; i++) {
      if (Math.abs(a[i] - b[i]) > epsilon) {
        return false;
      }
    }
    return true;
  }

  let edge_count = graph.edges_vertices.length;
  let edges = graph.edges_vertices.map(ev => [
    graph.vertices_coords[ev[0]],
    graph.vertices_coords[ev[1]]
  ]);

  let edges_vector = edges.map(e => [e[1][0] - e[0][0], e[1][1] - e[0][1]]);
  let edges_magnitude = edges_vector.map(e => Math.sqrt(e[0]*e[0]+e[1]*e[1]));
  let edges_normalized = edges_vector
    .map((e,i) => [e[0]/edges_magnitude[i], e[1]/edges_magnitude[i]]);
  let edges_horizontal = edges_normalized.map(e => Math.abs(e[0]) > 0.7);//.707

  let crossings = Array.from(Array(edge_count - 1)).map(_ => []);
  for (let i = 0; i < edges.length-1; i++) {
    for (let j = i+1; j < edges.length; j++) {
      crossings[i][j] = Geom.core.intersection.edge_edge_exclusive(
        edges[i][0], edges[i][1],
        edges[j][0], edges[j][1]
      )
    }
  }

  let edges_intersections = Array.from(Array(edge_count)).map(_ => []);
  for (let i = 0; i < edges.length-1; i++) {
    for (let j = i+1; j < edges.length; j++) {
      if (crossings[i][j] != null) {
        // warning - these are shallow pointers
        edges_intersections[i].push(crossings[i][j]);
        edges_intersections[j].push(crossings[i][j]);
      }
    }
  }

  // let edges_intersections2 = Array.from(Array(edge_count)).map(_ => []);
  // for (let i = 0; i < edges.length-1; i++) {
  //  for (let j = i+1; j < edges.length; j++) {
  //    if (crossings[i][j] != null) {
  //      // warning - these are shallow pointers
  //      edges_intersections2[i].push({edge:j, intersection:crossings[i][j]});
  //      edges_intersections2[j].push({edge:i, intersection:crossings[i][j]});
  //    }
  //  }
  // }

  edges.forEach((e,i) => e.sort(edges_horizontal[i] ? horizSort : vertSort));

  edges_intersections.forEach((e,i) => 
    e.sort(edges_horizontal[i] ? horizSort : vertSort)
  )
  // edges_intersections2.forEach((e,i) => 
  //  e.sort(edges_horizontal[i] ? horizSort2 : vertSort2)
  // )

  let new_edges = edges_intersections
    .map((e,i) => [edges[i][0], ...e, edges[i][1]])
    .map(ev => 
      Array.from(Array(ev.length-1))
        .map((_,i) => [ev[i], ev[(i+1)]])
    );

  // remove degenerate edges
  new_edges = new_edges
    .map(edgeGroup => edgeGroup
      .filter(e => false === e
        .map((_,i) => Math.abs(e[0][i] - e[1][i]) < epsilon)
        .reduce((a,b) => a && b, true)
      )
    );

  // let edge_map = new_edges.map(edge => edge.map(_ => counter++));
  let edge_map = new_edges
    .map((edge,i) => edge.map(_ => i))
    .reduce((a,b) => a.concat(b), []);

  let vertices_coords = new_edges
    .map(edge => edge.reduce((a,b) => a.concat(b), []))
    .reduce((a,b) => a.concat(b), [])
  let counter = 0;
  let edges_vertices = new_edges
    .map(edge => edge.map(_ => [counter++, counter++]))
    .reduce((a,b) => a.concat(b), []);

  let vertices_equivalent = Array
    .from(Array(vertices_coords.length)).map(_ => []);
  for (var i = 0; i < vertices_coords.length-1; i++) {
    for (var j = i+1; j < vertices_coords.length; j++) {
      vertices_equivalent[i][j] = equivalent(
        vertices_coords[i],
        vertices_coords[j]
      );
    }
  }

  // console.log(vertices_equivalent);

  let vertices_map = vertices_coords.map(vc => undefined)

  vertices_equivalent.forEach((row,i) => row.forEach((eq,j) => {
    if (eq){
      vertices_map[j] = vertices_map[i] === undefined ? i : vertices_map[i];
    }
  }));
  let vertices_remove = vertices_map.map(m => m !== undefined);
  vertices_map.forEach((map,i) => {
    if(map === undefined) { vertices_map[i] = i; }
  });

  // console.log("vertices_map", vertices_map);

  edges_vertices.forEach((edge,i) => edge.forEach((v,j) => {
    edges_vertices[i][j] = vertices_map[v];
  }));

  let flat = {
    vertices_coords,
    edges_vertices
  }

  // console.log("edges_vertices", edges_vertices);
  // console.log("vertices_remove", vertices_remove);
  let vertices_remove_indices = vertices_remove
    .map((rm,i) => rm ? i : undefined)
    .filter(i => i !== undefined);
  Graph.remove_vertices(flat, vertices_remove_indices);

  // console.log(flat);

  // convert.edges_vertices_to_vertices_vertices_sorted(flat);
  // convert.vertices_vertices_to_faces_vertices(flat);
  // convert.faces_vertices_to_faces_edges(flat);

  return flat;
};

// faces_faces is a set of faces edge-adjacent to a face. for every face.
export const make_faces_faces = function (graph) {
  const nf = graph.faces_vertices.length;
  const faces_faces = Array.from(Array(nf)).map(() => []);
  const edgeMap = {};
  graph.faces_vertices.forEach((vertices_index, idx1) => {
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

/**
 * this face coloring skips marks joining the two faces separated by it.
 * it relates directly to if a face is flipped or not (determinant > 0)
 */
export const faces_coloring_from_faces_matrix = function (faces_matrix) {
  return faces_matrix
    .map(m => m[0] * m[3] - m[1] * m[2])
    .map(c => c >= 0);
};
/**
 * true/false: which face shares color with root face
 * the root face (and any similar-color face) will be marked as true
 */
export const faces_coloring = function (graph, root_face = 0){
  const coloring = [];
  coloring[root_face] = true;
  make_face_walk_tree(graph, root_face).forEach((level, i) => {
    level.forEach((entry) => { coloring[entry.face] = (i % 2 === 0); });
  });
  return coloring;
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

export const clone = function (o) {
  // from https://jsperf.com/deep-copy-vs-json-stringify-json-parse/5
  let newO;
  let i;
  if (typeof o !== "object") {
    return o;
  }
  if (!o) {
    return o;
  }
  if (Object.prototype.toString.apply(o) === "[object Array]") {
    newO = [];
    for (i = 0; i < o.length; i += 1) {
      newO[i] = clone(o[i]);
    }
    return newO;
  }
  newO = {};
  for (i in o) {
    if (o.hasOwnProperty(i)) {
      newO[i] = clone(o[i]);
    }
  }
  return newO;
};

export const flatten_frame = function (fold_file, frame_num) {
  if ("file_frames" in fold_file === false
    || fold_file.file_frames.length < frame_num) {
    return fold_file;
  }
  const dontCopy = ["frame_parent", "frame_inherit"];
  const memo = { visited_frames: [] };
  const recurse = function (recurse_fold, frame, orderArray) {
    if (memo.visited_frames.indexOf(frame) !== -1) {
      throw new Error("encountered a cycle in file_frames. can't flatten.");
    }
    memo.visited_frames.push(frame);
    orderArray = [frame].concat(orderArray);
    if (frame === 0) { return orderArray; }
    if (recurse_fold.file_frames[frame - 1].frame_inherit
       && recurse_fold.file_frames[frame - 1].frame_parent != null) {
      return recurse(recurse_fold, recurse_fold.file_frames[frame - 1].frame_parent, orderArray);
    }
    return orderArray;
  };
  return recurse(fold_file, frame_num, []).map((frame) => {
    if (frame === 0) {
      // for frame 0 (the key frame) don't copy over file_frames array
      const swap = fold_file.file_frames;
      fold_file.file_frames = null;
      const copy = clone(fold_file);
      fold_file.file_frames = swap;
      delete copy.file_frames;
      dontCopy.forEach(key => delete copy[key]);
      return copy;
    }
    const outerCopy = clone(fold_file.file_frames[frame - 1]);
    dontCopy.forEach(key => delete outerCopy[key]);
    return outerCopy;
  }).reduce((prev, curr) => Object.assign(prev, curr), {});
};
