/* (c) Robby Kraft, MIT License */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.FoldToSvg = factory());
}(this, (function () { 'use strict';

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

  const isBrowser = typeof window !== Keys.undefined
    && typeof window.document !== Keys.undefined;
  const isNode = typeof process !== Keys.undefined
    && process.versions != null
    && process.versions.node != null;

  const htmlString = "<!DOCTYPE html><title>.</title>";
  const win = (function () {
    let w = {};
    if (isNode) {
      const { DOMParser, XMLSerializer } = require("xmldom");
      w.DOMParser = DOMParser;
      w.XMLSerializer = XMLSerializer;
      w.document = new DOMParser().parseFromString(htmlString, "text/html");
    } else if (isBrowser) {
      w = window;
    }
    return w;
  }());

  function vkXML (text, step) {
    const ar = text.replace(/>\s{0,}</g, "><")
      .replace(/</g, "~::~<")
      .replace(/\s*xmlns\:/g, "~::~xmlns:")
      .split("~::~");
    const len = ar.length;
    let inComment = false;
    let deep = 0;
    let str = "";
    const space = (step != null && typeof step === "string" ? step : "\t");
    const shift = ["\n"];
    for (let si = 0; si < 100; si += 1) {
      shift.push(shift[si] + space);
    }
    for (let ix = 0; ix < len; ix += 1) {
      if (ar[ix].search(/<!/) > -1) {
        str += shift[deep] + ar[ix];
        inComment = true;
        if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1
          || ar[ix].search(/!DOCTYPE/) > -1) {
          inComment = false;
        }
      } else if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
        str += ar[ix];
        inComment = false;
      } else if (/^<\w/.exec(ar[ix - 1]) && /^<\/\w/.exec(ar[ix])
        && /^<[\w:\-\.\,]+/.exec(ar[ix - 1])
        == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace("/", "")) {
        str += ar[ix];
        if (!inComment) { deep -= 1; }
      } else if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) === -1
        && ar[ix].search(/\/>/) === -1) {
        str = !inComment ? str += shift[deep++] + ar[ix] : str += ar[ix];
      } else if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
        str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix];
      } else if (ar[ix].search(/<\//) > -1) {
        str = !inComment ? str += shift[--deep] + ar[ix] : str += ar[ix];
      } else if (ar[ix].search(/\/>/) > -1) {
        str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix];
      } else if (ar[ix].search(/<\?/) > -1) {
        str += shift[deep] + ar[ix];
      } else if (ar[ix].search(/xmlns\:/) > -1 || ar[ix].search(/xmlns\=/) > -1) {
        str += shift[deep] + ar[ix];
      } else {
        str += ar[ix];
      }
    }
    return (str[0] === "\n") ? str.slice(1) : str;
  }

  const NS = "http://www.w3.org/2000/svg";
  const g = function (parent) {
    const g = win.document[Keys.createElementNS](NS, "g");
    if (parent) { parent[Keys.appendChild](g); }
    return g;
  };
  const defs = function (parent) {
    const defs = win.document[Keys.createElementNS](NS, "defs");
    if (parent) { parent[Keys.appendChild](defs); }
    return defs;
  };
  const style = function (parent) {
    const s = win.document[Keys.createElementNS](NS, "style");
    s[Keys.setAttributeNS](null, "type", "text/css");
    if (parent) { parent[Keys.appendChild](s); }
    return s;
  };
  const line = function (x1, y1, x2, y2) {
    const shape = win.document[Keys.createElementNS](NS, "line");
    shape[Keys.setAttributeNS](null, "x1", x1);
    shape[Keys.setAttributeNS](null, "y1", y1);
    shape[Keys.setAttributeNS](null, "x2", x2);
    shape[Keys.setAttributeNS](null, "y2", y2);
    return shape;
  };
  const circle = function (x, y, radius) {
    const shape = win.document[Keys.createElementNS](NS, "circle");
    shape[Keys.setAttributeNS](null, "cx", x);
    shape[Keys.setAttributeNS](null, "cy", y);
    shape[Keys.setAttributeNS](null, "r", radius);
    return shape;
  };
  const polygon = function (pointsArray) {
    const shape = win.document[Keys.createElementNS](NS, "polygon");
    const pointsString = pointsArray.map(p => `${p[0]},${p[1]}`).join(" ");
    shape[Keys.setAttributeNS](null, "points", pointsString);
    return shape;
  };
  const path = function (d) {
    const p = win.document[Keys.createElementNS](NS, "path");
    p[Keys.setAttributeNS](null, "d", d);
    return p;
  };
  const SVG = {
    NS,
    g,
    defs,
    style,
    line,
    circle,
    polygon,
    path,
  };

  const libraries = {
    SVG,
  };

  const vertices_circle = function (graph, options) {
    if (Keys.vertices_coords in graph === false) {
      return [];
    }
    const radius = options && options.radius ? options.radius : 0.01;
    const svg_vertices = graph[Keys.vertices_coords]
      .map(v => libraries.SVG.circle(v[0], v[1], radius));
    svg_vertices.forEach((c, i) => c[Keys.setAttributeNS](null, Keys.index, i));
    return svg_vertices;
  };

  const make_vertices_edges = function ({ edges_vertices }) {
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
  const make_faces_faces = function ({ faces_vertices }) {
    if (!faces_vertices) { return undefined; }
    const nf = faces_vertices.length;
    const faces_faces = Array.from(Array(nf)).map(() => []);
    const edgeMap = {};
    faces_vertices.forEach((vertices_index, idx1) => {
      if (vertices_index === undefined) { return; }
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
  const make_vertex_pair_to_edge_map = function ({ edges_vertices }) {
    if (!edges_vertices) { return {}; }
    const map = {};
    edges_vertices
      .map(ev => ev.sort((a, b) => a - b).join(" "))
      .forEach((key, i) => { map[key] = i; });
    return map;
  };
  const make_face_walk_tree = function (graph, root_face = 0) {
    const edge_map = make_vertex_pair_to_edge_map(graph);
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
    do {
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
            edge,
            edge_vertices,
          };
        });
      }).reduce((prev, curr) => prev.concat(curr), []);
    } while (list[list.length - 1].length > 0);
    if (list.length > 0 && list[list.length - 1].length === 0) { list.pop(); }
    return list;
  };
  const make_faces_coloring_from_faces_matrix = function (faces_matrix) {
    return faces_matrix
      .map(m => m[0] * m[3] - m[1] * m[2])
      .map(c => c >= 0);
  };
  const make_faces_coloring = function (graph, root_face = 0) {
    const coloring = [];
    coloring[root_face] = true;
    make_face_walk_tree(graph, root_face)
      .forEach((level, i) => level
        .forEach((entry) => { coloring[entry.face] = (i % 2 === 0); }));
    return coloring;
  };

  const bounding_rect = function (graph) {
    if (graph[Keys.vertices_coords] == null
      || graph[Keys.vertices_coords].length <= 0) {
      return [0, 0, 0, 0];
    }
    const dimension = graph[Keys.vertices_coords][0].length;
    const min = Array(dimension).fill(Infinity);
    const max = Array(dimension).fill(-Infinity);
    graph[Keys.vertices_coords].forEach(v => v.forEach((n, i) => {
      if (n < min[i]) { min[i] = n; }
      if (n > max[i]) { max[i] = n; }
    }));
    return (isNaN(min[0]) || isNaN(min[1]) || isNaN(max[0]) || isNaN(max[1])
      ? [0, 0, 0, 0]
      : [min[0], min[1], max[0] - min[0], max[1] - min[1]]);
  };
  const get_boundary = function (graph) {
    if (graph[Keys.edges_assignment] == null) { return { vertices: [], edges: [] }; }
    const edges_vertices_b = graph[Keys.edges_assignment]
      .map(a => a === "B" || a === "b");
    const vertices_edges = make_vertices_edges(graph);
    const edge_walk = [];
    const vertex_walk = [];
    let edgeIndex = -1;
    for (let i = 0; i < edges_vertices_b.length; i += 1) {
      if (edges_vertices_b[i]) { edgeIndex = i; break; }
    }
    if (edgeIndex === -1) {
      return { vertices: [], edges: [] };
    }
    edges_vertices_b[edgeIndex] = false;
    edge_walk.push(edgeIndex);
    vertex_walk.push(graph[Keys.edges_vertices][edgeIndex][0]);
    let nextVertex = graph[Keys.edges_vertices][edgeIndex][1];
    while (vertex_walk[0] !== nextVertex) {
      vertex_walk.push(nextVertex);
      edgeIndex = vertices_edges[nextVertex]
        .filter(v => edges_vertices_b[v])
        .shift();
      if (edgeIndex === undefined) { return { vertices: [], edges: [] }; }
      if (graph[Keys.edges_vertices][edgeIndex][0] === nextVertex) {
        [, nextVertex] = graph[Keys.edges_vertices][edgeIndex];
      } else {
        [nextVertex] = graph[Keys.edges_vertices][edgeIndex];
      }
      edges_vertices_b[edgeIndex] = false;
      edge_walk.push(edgeIndex);
    }
    return {
      vertices: vertex_walk,
      edges: edge_walk,
    };
  };

  const boundaries_polygon = (graph) => {
    if (Keys.vertices_coords in graph === false
      || Keys.edges_vertices in graph === false
      || Keys.edges_assignment in graph === false) {
      return [];
    }
    const boundary = get_boundary(graph)
      .vertices
      .map(v => graph[Keys.vertices_coords][v]);
    if (boundary.length === 0) { return []; }
    const p = libraries.SVG.polygon(boundary);
    p[Keys.setAttributeNS](null, Keys.class, Keys.boundary);
    return [p];
  };

  const edges_assignment_names = {
    B: Keys.boundary,
    b: Keys.boundary,
    M: Keys.mountain,
    m: Keys.mountain,
    V: Keys.valley,
    v: Keys.valley,
    F: Keys.mark,
    f: Keys.mark,
    U: Keys.unassigned,
    u: Keys.unassigned
  };
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
  const edges_indices_classes = function (graph) {
    const assignment_indices = { u:[], f:[], v:[], m:[], b:[] };
    graph[Keys.edges_assignment].map(a => edges_assignment_to_lowercase[a])
      .forEach((a, i) => assignment_indices[a].push(i));
    return assignment_indices;
  };
  const make_edges_assignment_names = function (graph) {
    return (graph[Keys.edges_vertices] == null || graph[Keys.edges_assignment] == null
      || graph[Keys.edges_vertices].length !== graph[Keys.edges_assignment].length
      ? []
      : graph[Keys.edges_assignment].map(a => edges_assignment_names[a]));
  };
  const segment_to_path = function (s) {
    return `M${s[0][0]} ${s[0][1]}L${s[1][0]} ${s[1][1]}`;
  };
  const edges_path_data = function (graph) {
    const path_data = edges_coords(graph).map(segment => segment_to_path(segment)).join("");
    return path_data === "" ? undefined : path_data;
  };
  const edges_by_assignment_paths_data = function (graph) {
    if (graph[Keys.edges_vertices] == null
      || graph[Keys.vertices_coords] == null
      || graph[Keys.edges_assignment] == null) {
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
  const edges_path = function (graph) {
    if (graph[Keys.edges_assignment] == null) {
      const d = edges_path_data(graph);
      return d === undefined ? [] : [libraries.SVG.path(d)];
    }
    const ds = edges_by_assignment_paths_data(graph);
    return Object.keys(ds).map(assignment => {
      const p = libraries.SVG.path(ds[assignment]);
      p[Keys.setAttributeNS](null, Keys.class, edges_assignment_names[assignment]);
      return p;
    });
  };
  const edges_line = function (graph) {
    const lines = edges_coords(graph).map(e => libraries.SVG.line(e[0][0], e[0][1], e[1][0], e[1][1]));
    lines.forEach((l, i) => l[Keys.setAttributeNS](null, Keys.index, i));
    make_edges_assignment_names(graph)
      .forEach((a, i) => lines[i][Keys.setAttributeNS](null, Keys.class, a));
    return lines;
  };

  const faces_sorted_by_layer = function (faces_layer) {
    return faces_layer.map((layer, i) => ({ layer, i }))
      .sort((a, b) => a.layer - b.layer)
      .map(el => el.i);
  };
  const make_faces_sidedness = function (graph) {
    let coloring = graph[Keys.faces_re_coloring];
    if (coloring == null) {
      coloring = (Keys.faces_re_matrix in graph)
        ? make_faces_coloring_from_faces_matrix(graph[Keys.faces_re_matrix])
        : make_faces_coloring(graph, 0);
    }
    return coloring.map(c => (c ? Keys.front : Keys.back));
  };
  const finalize_faces = function (graph, svg_faces) {
    const isFoldedForm = typeof graph.frame_classes === Keys.object
      && graph.frame_classes !== null
      && !(graph.frame_classes.includes(Keys.creasePattern));
    const orderIsCertain = graph[Keys.faces_re_layer] != null
      && graph[Keys.faces_re_layer].length === graph[Keys.faces_vertices].length;
    if (orderIsCertain && isFoldedForm) {
      make_faces_sidedness(graph)
        .forEach((side, i) => svg_faces[i][Keys.setAttributeNS](null, Keys.class, side));
    }
    return (orderIsCertain
      ? faces_sorted_by_layer(graph[Keys.faces_re_layer]).map(i => svg_faces[i])
      : svg_faces);
  };
  const faces_vertices_polygon = function (graph) {
    if (Keys.faces_vertices in graph === false
      || Keys.vertices_coords in graph === false) {
      return [];
    }
    const svg_faces = graph[Keys.faces_vertices]
      .map(fv => fv.map(v => graph[Keys.vertices_coords][v]))
      .map(face => libraries.SVG.polygon(face));
    svg_faces.forEach((face, i) => face[Keys.setAttributeNS](null, Keys.index, i));
    return finalize_faces(graph, svg_faces);
  };
  const faces_edges_polygon = function (graph) {
    if (Keys.faces_edges in graph === false
      || Keys.edges_vertices in graph === false
      || Keys.vertices_coords in graph === false) {
      return [];
    }
    const svg_faces = graph[Keys.faces_edges]
      .map(face_edges => face_edges
        .map(edge => graph[Keys.edges_vertices][edge])
        .map((vi, i, arr) => {
          const next = arr[(i + 1) % arr.length];
          return (vi[1] === next[0] || vi[1] === next[1] ? vi[0] : vi[1]);
        }).map(v => graph[Keys.vertices_coords][v]))
      .map(face => libraries.SVG.polygon(face));
    svg_faces.forEach((face, i) => face[Keys.setAttributeNS](null, Keys.index, i));
    return finalize_faces(graph, svg_faces);
  };

  const recursive_freeze = function (input) {
    Object.freeze(input);
    if (input === undefined) {
      return input;
    }
    Object.getOwnPropertyNames(input).filter(prop => input[prop] !== null
      && (typeof input[prop] === Keys.object || typeof input[prop] === Keys.function)
      && !Object.isFrozen(input[prop]))
      .forEach(prop => recursive_freeze(input[prop]));
    return input;
  };
  const recursive_assign = (target, source) => {
    Object.keys(source).forEach((key) => {
      if (typeof source[key] === Keys.object && source[key] !== null) {
        if (!(key in target)) { target[key] = {}; }
        recursive_assign(target[key], source[key]);
      } else if (typeof target === Keys.object && !(key in target)) {
        target[key] = source[key];
      }
    });
    return target;
  };
  const get_object = (input) => {
    if (input == null) {
      return {};
    }
    if (typeof input === Keys.object && input !== null) {
      return input;
    }
    if (typeof input === Keys.string || input instanceof String) {
      try {
        const obj = JSON.parse(input);
        return obj;
      } catch (error) {
        return {};
      }
    }
    return {};
  };

  const linker = function (parent) {
  };

  const none = "none";
  const five_hundred_px = "500px";
  var Options = (vmin = 1) => recursive_freeze({
    input: Keys.string,
    output: Keys.string,
    padding: null,
    file_frame: null,
    stylesheet: null,
    shadows: null,
    boundaries: true,
    faces: true,
    edges: true,
    vertices: false,
    attributes: {
      svg: {
        width: five_hundred_px,
        height: five_hundred_px,
        stroke: Keys.black,
        fill: none,
        "stroke-linejoin": "bevel",
        "stroke-width": vmin / 200,
      },
      circle: {
        r: vmin / 200,
      },
      boundaries: {
        fill: Keys.white,
      },
      faces: {
        stroke: none,
        front: { stroke: Keys.black, fill: Keys.lightgray },
        back: { stroke: Keys.black, fill: Keys.white },
      },
      edges: {
        boundary: {},
        mountain: { stroke: "red" },
        valley: { stroke: "blue" },
        mark: { stroke: Keys.lightgray },
        unassigned: { stroke: Keys.lightgray },
      },
      vertices: {
        stroke: none,
        fill: Keys.black,
      }
    }
  });

  const make_options = (graph, options = {}) => {
    const bounds = bounding_rect(graph);
    const vmin = Math.min(bounds[2], bounds[3]);
    recursive_assign(options, Options(vmin));
    if (options.shadows) {
      recursive_assign(options, { attributes: { faces: {
        front: { filter: "url(#shadow)" },
        back: { filter: "url(#shadow)" },
      }}});
    }
    return options;
  };

  const component_classes = {
    vertices: [],
    edges: [Keys.unassigned, Keys.mark, Keys.valley, Keys.mountain, Keys.boundary],
    faces: [Keys.front, Keys.back],
    boundaries: [],
  };
  const style_component = (group, { attributes }, component) => {
    const classes = component_classes[component] || [];
    Array.from(group.childNodes)
      .filter(child => attributes[child.nodeName])
      .forEach(child => Object.keys(attributes[child.nodeName])
        .forEach(attr => child[Keys.setAttributeNS](null, attr, attributes[child.nodeName][attr])));
    Object.keys(attributes[component])
      .filter(key => !classes.includes(key))
      .forEach(key => group[Keys.setAttributeNS](null, key, attributes[component][key]));
    if (classes.length === 0) { return; }
    Array.from(group.childNodes)
      .forEach(child => Object.keys(attributes[component][child.getAttribute(Keys.class)] || {})
        .forEach(key => child[Keys.setAttributeNS](null, key, attributes[component][child.getAttribute(Keys.class)][key])));
  };

  const faces_draw_function = graph => (graph[Keys.faces_vertices] != null
    ? faces_vertices_polygon(graph)
    : faces_edges_polygon(graph));
  const draw_func = {
    vertices: vertices_circle,
    edges: edges_path,
    faces: faces_draw_function,
    boundaries: boundaries_polygon
  };
  const render_components = (graph, options = {}) => {
    if (!options.attributes) {
      options.attributes = {};
    }
    return [Keys.boundaries, Keys.edges, Keys.faces, Keys.vertices]
    .filter(key => options[key] === true)
    .map(key => {
      const group = libraries.SVG.g();
      group[Keys.setAttributeNS](null, Keys.class, key);
      draw_func[key](graph, options)
        .forEach(a => group[Keys.appendChild](a));
      style_component(group, options, key);
      return group;
    })
    .filter(group => group.childNodes.length > 0);
  };

  const { document } = win;
  const shadow_defaults = Object.freeze({
    blur: 0.005,
    opacity: 0.3,
    color: Keys.black,
  });
  const result = "result";
  const _in = "in";
  const blur = "blur";
  const offsetColor = "offsetColor";
  const offsetBlur = "offsetBlur";
  const feMergeNode = "feMergeNode";
  const two_hundred = "200%";
  const shadowFilter = function (options = shadow_defaults) {
    const id_name = "shadow";
    if (typeof options !== Keys.object || options === null) { options = {}; }
    Object.keys(shadow_defaults)
      .filter(key => !(key in options))
      .forEach((key) => { options[key] = shadow_defaults[key]; });
    const filter = document[Keys.createElementNS](libraries.SVG.NS, "filter");
    filter[Keys.setAttributeNS](null, "width", two_hundred);
    filter[Keys.setAttributeNS](null, "height", two_hundred);
    filter[Keys.setAttributeNS](null, "id", id_name);
    const gaussian = document[Keys.createElementNS](libraries.SVG.NS, "feGaussianBlur");
    gaussian[Keys.setAttributeNS](null, _in, "SourceAlpha");
    gaussian[Keys.setAttributeNS](null, "stdDeviation", options.blur);
    gaussian[Keys.setAttributeNS](null, result, blur);
    const offset = document[Keys.createElementNS](libraries.SVG.NS, "feOffset");
    offset[Keys.setAttributeNS](null, _in, blur);
    offset[Keys.setAttributeNS](null, result, offsetBlur);
    const flood = document[Keys.createElementNS](libraries.SVG.NS, "feFlood");
    flood[Keys.setAttributeNS](null, "flood-color", options.color);
    flood[Keys.setAttributeNS](null, "flood-opacity", options.opacity);
    flood[Keys.setAttributeNS](null, result, offsetColor);
    const composite = document[Keys.createElementNS](libraries.SVG.NS, "feComposite");
    composite[Keys.setAttributeNS](null, _in, offsetColor);
    composite[Keys.setAttributeNS](null, "in2", offsetBlur);
    composite[Keys.setAttributeNS](null, "operator", _in);
    composite[Keys.setAttributeNS](null, result, offsetBlur);
    const merge = document[Keys.createElementNS](libraries.SVG.NS, "feMerge");
    const mergeNode1 = document[Keys.createElementNS](libraries.SVG.NS, feMergeNode);
    const mergeNode2 = document[Keys.createElementNS](libraries.SVG.NS, feMergeNode);
    mergeNode2[Keys.setAttributeNS](null, _in, "SourceGraphic");
    merge[Keys.appendChild](mergeNode1);
    merge[Keys.appendChild](mergeNode2);
    filter[Keys.appendChild](gaussian);
    filter[Keys.appendChild](offset);
    filter[Keys.appendChild](flood);
    filter[Keys.appendChild](composite);
    filter[Keys.appendChild](merge);
    return filter;
  };

  const make_defs = (graph, options) => {
    const bounds = bounding_rect(graph);
    const vmin = Math.min(bounds[2], bounds[3]);
    const defs = libraries.SVG.defs();
    if (options.stylesheet != null) {
      const style = libraries.SVG.style();
      defs[Keys.appendChild](style);
      const strokeVar = options.attributes.svg[Keys.stroke_width]
        ? options.attributes.svg[Keys.stroke_width] : vmin / 200;
      const cdata = (new win.DOMParser())
        .parseFromString("<xml></xml>", "application/xml")
        .createCDATASection(`\n* { --${Keys.stroke_width}: ${strokeVar}; }\n${options.stylesheet}`);
      style[Keys.appendChild](cdata);
    }
    if (options.shadows != null) {
      const shadowOptions = (typeof options.shadows === Keys.object && options.shadows !== null
        ? options.shadows
        : { blur: vmin / 200 });
      defs[Keys.appendChild](shadowFilter(shadowOptions));
    }
    return (options.stylesheet != null || options.shadows != null
      ? defs
      : undefined);
  };

  const graph_classes = function (graph) {
    const file_classes = (graph[Keys.file_classes] != null
      ? graph[Keys.file_classes] : []).join(" ");
    const frame_classes = (graph[Keys.frame_classes] != null
      ? graph[Keys.frame_classes] : []).join(" ");
    return [file_classes, frame_classes]
      .filter(s => s !== "")
      .join(" ");
  };

  const makeViewBox = function (x, y, width, height, padding = 0) {
    const scale = 1.0;
    const d = (width / scale) - width;
    const X = (x - d) - padding;
    const Y = (y - d) - padding;
    const W = (width + d * 2) + padding * 2;
    const H = (height + d * 2) + padding * 2;
    return [X, Y, W, H].join(" ");
  };
  const make_svg_attributes = (graph, options) => {
    const bounds = bounding_rect(graph);
    const vmin = Math.min(bounds[2], bounds[3]);
    const attributes = {
      viewBox: makeViewBox(...bounds, options.padding),
    };
    const classValue = graph_classes(graph);
    if (classValue !== "") {
      attributes[Keys.class] = classValue;
    }
    Object.assign(attributes, options.attributes.svg);
    return attributes;
  };

  const render_into_svg = (svg, graph, options) => {
    make_options(graph, options);
    const defs = make_defs(graph, options);
    if (defs) { svg[Keys.appendChild](defs); }
    render_components(graph, options)
      .forEach(group => svg[Keys.appendChild](group));
    const attrs = make_svg_attributes(graph, options);
    Object.keys(attrs).forEach(attr => svg[Keys.setAttributeNS](null, attr, attrs[attr]));
    return svg;
  };

  const use = (library) => {
    if (library.NS) {
      libraries.SVG = library;
    }
  };

  const svg = () => {
    const svgImage = win.document[Keys.createElementNS](libraries.SVG.NS, Keys.svg);
    svgImage.setAttribute("version", "1.1");
    svgImage.setAttribute("xmlns", libraries.SVG.NS);
    return svgImage;
  };
  const FoldToSvg = (arg, options = {}) => {
    const graph = get_object(arg);
    make_options(graph, options);
    const element = render_into_svg(svg(), graph, options);
    if (options.output === Keys.svg) { return element; }
    const stringified = (new win.XMLSerializer()).serializeToString(element);
    const beautified = vkXML(stringified);
    return beautified;
  };
  Object.assign(FoldToSvg, {
    vertices_circle,
    boundaries_polygon,
    edges_path_data,
    edges_by_assignment_paths_data,
    edges_path,
    edges_line,
    faces_vertices_polygon,
    faces_edges_polygon,
    render_components,
    render_into_svg,
    linker: linker.bind(FoldToSvg),
    use,
  });

  return FoldToSvg;

})));
