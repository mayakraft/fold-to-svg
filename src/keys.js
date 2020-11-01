/**
 * fold to svg (c) Robby Kraft
 */
export const coords = "coords";
export const vertices = "vertices";
export const edges = "edges";
export const faces = "faces";
export const boundaries = "boundaries";
export const frame = "frame";
export const file = "file";

export const vertices_coords = `${vertices}_${coords}`;
export const edges_vertices = `${edges}_${vertices}`;
export const faces_vertices = `${faces}_${vertices}`;
export const faces_edges = `${faces}_${edges}`;
export const edges_assignment = `${edges}_assignment`;
export const faces_re_coloring = `${faces}_re:coloring`;
export const faces_re_matrix = `${faces}_re:matrix`;
export const faces_re_layer = `${faces}_re:layer`;
export const frame_parent = `${frame}_parent`;
export const frame_inherit = `${frame}_inherit`;
export const frame_classes = `${frame}_classes`;
export const file_frames = `${file}_frames`;
export const file_classes = `${file}_classes`;

export const boundary = "boundary";
export const mountain = "mountain";
export const valley = "valley";
export const mark = "mark";
export const unassigned = "unassigned";
export const creasePattern = "creasePattern";
export const front = "front";
export const back = "back";

export const svg = "svg";
export const _class = "class";
export const index = "index";
export const object = "object";
export const string = "string";
export const number = "number";
export const _function = "function";
export const _undefined = "undefined";

export const black = "black";
export const white = "white";
export const lightgray = "lightgray";
export const stroke_width = "stroke-width";

// extra compression if we use bracket notation to call these functions
export const createElementNS = "createElementNS";
export const setAttributeNS = "setAttributeNS";
export const appendChild = "appendChild";
