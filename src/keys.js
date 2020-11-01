/**
 * fold to svg (c) Robby Kraft
 */
const keys = [
  "coords",
  "vertices",
  "edges",
  "faces",
  "boundaries",
  "frame",
  "file",
  "boundary",
  "mountain",
  "valley",
  "mark",
  "unassigned",
  "creasePattern",
  "front",
  "back",
  "svg",
  "class",
  "index",
  "object",
  "string",
  "number",
  "function",
  "undefined",
  "black",
  "white",
  "lightgray",
  "stroke-width",
  "createElementNS",
  "setAttributeNS",
  "appendChild",
  "vertices_coords",
  "edges_vertices",
  "faces_vertices",
  "faces_edges",
  "edges_assignment",
  "faces_re_coloring",
  "faces_re_matrix",
  "faces_re_layer",
  "frame_parent",
  "frame_inherit",
  "frame_classes",
  "file_frames",
  "file_classes",
];

const Keys = {};
keys.forEach(key => Keys[key] = key);

export default Keys;
