import {
  line,
  path,
} from "../svg/svg";


const edges_assignment_names = {
  B: "boundary",
  b: "boundary",
  M: "mountain",
  m: "mountain",
  V: "valley",
  v: "valley",
  F: "mark",
  f: "mark",
  U: "unassigned",
  u: "unassigned",
};

// todo: testing. i suspect this is faster than running .toLower() on every string
const edges_assignment_to_lowercase = {
  B: "b",
  b: "b",
  M: "m",
  m: "m",
  V: "v",
  v: "v",
  F: "f",
  f: "f",
  U: "u",
  u: "u",
};

const edges_coords = function ({ vertices_coords, edges_vertices }) {
  if (edges_vertices == null || vertices_coords == null) {
    return [];
  }
  return edges_vertices.map(ev => ev.map(v => vertices_coords[v]));
};

/**
 * @returns an object with 5 keys, each value is an array 
 * {b:[], m:[], v:[], f:[], u:[]}
 * arrays contain the unique indices of each edge from the edges_ arrays sorted by assignment
 */
const edges_indices_classes = function ({ edges_assignment }) {
  const assignment_indices = {b:[], m:[], v:[], f:[], u:[]};
  edges_assignment.map(a => edges_assignment_to_lowercase[a])
    .forEach((a, i) => assignment_indices[a].push(i));
  return assignment_indices;
}

const make_edges_assignment_names = function (graph) {
  return (graph.edges_vertices == null || graph.edges_assignment == null
    || graph.edges_vertices.length !== graph.edges_assignment.length
    ? []
    : graph.edges_assignment.map(a => edges_assignment_names[a]));
};

const edges = function (graph) {
  if (graph.edges_vertices == null || graph.vertices_coords == null) {
    return [];
  }

  const svg_edges = graph.edges_vertices
    .map(ev => ev.map(v => graph.vertices_coords[v]))
    .map(e => line(e[0][0], e[0][1], e[1][0], e[1][1]));
  svg_edges.forEach((edge, i) => edge.setAttribute("id", `${i}`));
  make_edges_assignment_names(graph)
    .forEach((a, i) => svg_edges[i].setAttribute("class", a));
  return svg_edges;
};

/**
 * segment is a line segment in the form: [[x1, y1], [x2, y2]]
 */
const segment_to_path = function (s) {
  return `M${s[0][0]} ${s[0][1]}L${s[1][0]} ${s[1][1]}`;
};

export const edges_path_data = function (graph) {
  return edges_coords(graph).map(segment => segment_to_path(segment)).join("");
};

export const edges_by_assignment_paths_data = function (graph) {
  if (graph.edges_vertices == null
    || graph.vertices_coords == null
    || graph.edges_assignment == null) {
    return [];
  }
  const segments = edges_coords(graph);
  const assignment_sorted_edges = edges_indices_classes(graph);
  const paths = Object.keys(assignment_sorted_edges)
    .map(assignment => assignment_sorted_edges[assignment].map(i => segments[i]))
    .map(segments => segments.map(segment => segment_to_path(segment)).join(""));
  const result = {};
  Object.keys(assignment_sorted_edges).map((key, i) => {
    if (paths[i] !== "") {
      result[key] = paths[i];
    }
  });
  return result;
};

/**
 * @returns an array of SVG Path elements.
 * if edges_assignment exists, there will be as many paths as there are types of edges
 * if no edges_assignment exists, there will be an array of 1 path.
 */
export const edges_path = function (graph) {
  // no edges_assignment exists, create one large path
  if (graph.edges_assignment == null) {
    return [path(edges_path_data(graph))];
  }
  // split up each path based on 
  const ds = edges_by_assignment_paths_data(graph);
  return Object.keys(ds).map(assignment => {
    const p = path(ds[assignment]);
    p.setAttributeNS(null, "class", edges_assignment_names[assignment]);
    return p;
  });
};

export const edges_line = function (graph) {
  const lines = edges_coords(graph).map(e => line(e[0][0], e[0][1], e[1][0], e[1][1]));
  // keep track of each svg's index in the 
  lines.forEach((l, i) => l.setAttributeNS(null, "index", i)) // `${i}`))
  make_edges_assignment_names(graph)
    .forEach((a, i) => lines[i].setAttributeNS(null, "class", a));
  return lines;
};

// can return edges as a flat list of line()s
// can return them in groups by edges_assignment
// can return them in 

// can return 5 paths. each is a 

