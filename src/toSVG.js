/**
 * ## options
 * ### boolean
 * - render layers, with their default setting:
 *   - "vertices": false
 *   - "edges": true
 *   - "faces_vertices": true
 *   - "faces_edges": false
 *   - "boundaries": true
 *
 * - "diagram" if the "re:diagrams" exists, render arrows and lines...
 *
 * - "style" incorporate a stylesheet (default/custom) into <svg> header
 *     options: "attributes", "inline", "css". default "css"
 *
 * ### data
 * ["width"] width of SVG (not viewport, which is in FOLD coordinate space)
 * ["height"] height of SVG (not viewport, which is in FOLD coordinate space)
 * ["stylesheet"] CSS style to be placed in the header
 * ["frame"] render a certain frame in "file_frames", default: top level
 *
 * // maybe soon...
 * "shadows": folded faces have little edge shadows
 * ["svg"] initialize an SVG to draw into. by default this will create one
 * ["foldAngle"] show fold-angles as alpha values for stroke
 */

import defaultStyle from "./styles/default.css";

import vkXML from "../include/vkbeautify-xml";

import { shadowFilter } from "./effects";

import {
  DOMParser,
  XMLSerializer,
} from "./window";

import {
  bounding_rect,
  get_boundary_vertices,
  faces_matrix_coloring,
  faces_coloring,
  flatten_frame,
} from "./graph";

import {
  svg,
  style,
  group,
  setViewBox,
  polygon,
  circle,
  line,
  arcArrow,
} from "../include/svg";

const CREASE_NAMES = {
  B: "boundary", b: "boundary",
  M: "mountain", m: "mountain",
  V: "valley",   v: "valley",
  F: "mark",     f: "mark",
  U: "mark",     u: "mark",
}; // easy to remember: "fuck you, mark"

const DISPLAY_NAME = {
  vertices: "vertices",
  edges: "creases",
  faces: "faces",
  boundaries: "boundaries",
};

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
      ? faces_matrix_coloring(graph["faces_re:matrix"])
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

export const svgBoundaries = function (graph) {
  // todo this needs to be able to handle multiple boundaries
  if ("edges_vertices" in graph === false
    || "vertices_coords" in graph === false) {
    return [];
  }
  const boundary = get_boundary_vertices(graph)
    .map(v => graph.vertices_coords[v]);
  const p = polygon(boundary);
  p.setAttribute("class", "boundary");
  return [p];
};

export const svgVertices = function (graph, options) {
  if ("vertices_coords" in graph === false) {
    return [];
  }
  const radius = options && options.radius ? options.radius : 0.01;
  const svg_vertices = graph.vertices_coords
    .map(v => circle(v[0], v[1], radius));
  svg_vertices.forEach((c, i) => c.setAttribute("id", `${i}`));
  return svg_vertices;
};

export const svgEdges = function (graph) {
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

export const svgFacesVertices = function (graph) {
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

export const svgFacesEdges = function (graph) {
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

const components = {
  vertices: svgVertices,
  edges: svgEdges,
  faces: svgFaces,
  boundaries: svgBoundaries,
};

const renderInstructions = function (graph, renderGroup) {
  if (graph["re:diagrams"] === undefined) { return; }
  if (graph["re:diagrams"].length === 0) { return; }
  Array.from(graph["re:diagrams"]).forEach((instruction) => {
    // draw crease lines
    if ("re:diagram_lines" in instruction === true) {
      instruction["re:diagram_lines"].forEach((crease) => {
        const creaseClass = ("re:diagram_line_classes" in crease)
          ? crease["re:diagram_line_classes"].join(" ")
          : "valley"; // unspecified should throw error really
        const pts = crease["re:diagram_line_coords"];
        if (pts !== undefined) {
          const l = line(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
          l.setAttribute("class", creaseClass);
          renderGroup.appendChild(l);
        }
      });
    }
    // draw arrows and instruction markings
    if ("re:diagram_arrows" in instruction === true) {
      instruction["re:diagram_arrows"].forEach((arrowInst) => {
        if (arrowInst["re:diagram_arrow_coords"].length === 2) {
          // start is [0], end is [1]
          const p = arrowInst["re:diagram_arrow_coords"];
          let side = p[0][0] < p[1][0];
          if (Math.abs(p[0][0] - p[1][0]) < 0.1) { // xs are ~ the same
            side = p[0][1] < p[1][1]
              ? p[0][0] < 0.5
              : p[0][0] > 0.5;
          }
          if (Math.abs(p[0][1] - p[1][1]) < 0.1) { // if ys are the same
            side = p[0][0] < p[1][0]
              ? p[0][1] > 0.5
              : p[0][1] < 0.5;
          }
          const arrow = arcArrow(p[0], p[1], { side });
          renderGroup.appendChild(arrow);
        }
      });
    }
  });
};

/**
 * specify a frame number otherwise it will render the top level
 */
export const fold_to_svg = function (fold, options = {}) {
  const _svg = svg();
  let graph = fold;
  const groups = {
    boundaries: true,
    faces: true,
    edges: true,
    vertices: false,
  };
  const o = {
    width: options.width || "500px",
    height: options.height || "500px",
    style: options.style || true,
    stylesheet: options.stylesheet || defaultStyle,
    shadows: options.shadows || false,
    padding: options.padding || 0,
  };
  if (options != null && options.frame != null) {
    graph = flatten_frame(fold, options.frame);
  }
  // copy file/frame classes to top level
  const file_classes = (graph.file_classes != null
    ? graph.file_classes : []).join(" ");
  const frame_classes = graph.frame_classes != null
    ? graph.frame_classes : [].join(" ");
  const top_level_classes = [file_classes, frame_classes]
    .filter(s => s !== "")
    .join(" ");
  _svg.setAttribute("class", top_level_classes);
  _svg.setAttribute("width", o.width);
  _svg.setAttribute("height", o.height);

  const styleElement = style();
  _svg.appendChild(styleElement);

  Object.keys(groups)
    .filter(key => groups[key] === false)
    .forEach(key => delete groups[key]);
  Object.keys(groups).forEach((key) => {
    groups[key] = group();
    groups[key].setAttribute("class", DISPLAY_NAME[key]);
    _svg.appendChild(groups[key]);
  });

  // draw geometry into groups
  Object.keys(groups)
    .forEach(key => components[key](graph)
      .forEach(a => groups[key].appendChild(a)));

  if ("re:diagrams" in graph) {
    const instructionLayer = group();
    _svg.appendChild(instructionLayer);
    renderInstructions(graph, instructionLayer);
  }

  if (o.shadows) {
    const shadow_id = "face_shadow";
    const filter = shadowFilter(shadow_id);
    _svg.appendChild(filter);
    Array.from(groups.faces.childNodes)
      .forEach(f => f.setAttribute("filter", `url(#${shadow_id})`));
  }

  const rect = bounding_rect(graph);
  setViewBox(_svg, ...rect, o.padding);

  // fill CSS style with --crease-width, and custom or a default style
  const vmin = rect[2] > rect[3] ? rect[3] : rect[2];
  const innerStyle = (o.style
    ? `\nsvg { --crease-width: ${vmin * 0.005}; }\n${o.stylesheet}`
    : `\nsvg { --crease-width: ${vmin * 0.005}; }\n`);

  // wrap style in CDATA section
  const docu = (new DOMParser())
    .parseFromString("<xml></xml>", "application/xml");
  const cdata = docu.createCDATASection(innerStyle);
  styleElement.appendChild(cdata);

  const stringified = (new XMLSerializer()).serializeToString(_svg);
  const beautified = vkXML(stringified);
  return beautified;
};

// export const updateFaces = function (graph, group) {
//  let facesV = graph.faces_vertices
//    .map(fv => fv.map(v => graph.vertices_coords[v]));
//  let strings = facesV
//    .map(face => face.reduce((a, b) => a + b[0] + "," + b[1] + " ", ""));
//  Array.from(group.children)
//    .sort((a,b) => parseInt(a.id) - parseInt(b.id))
//    .forEach((face, i) => face.setAttribute("points", strings[i]));
// };

// export const updateCreases = function (graph, group) {
//  let edges = graph.edges_vertices
//    .map(ev => ev.map(v => graph.vertices_coords[v]));

//  Array.from(group.children)
//    // .sort((a,b) => parseInt(a.id) - parseInt(b.id))
//    .forEach((line,i) => {
//      line.setAttribute("x1", edges[i][0][0]);
//      line.setAttribute("y1", edges[i][0][1]);
//      line.setAttribute("x2", edges[i][1][0]);
//      line.setAttribute("y2", edges[i][1][1]);
//    });
// };
