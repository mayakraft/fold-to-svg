/* (c) Robby Kraft, MIT License */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.FoldToSvg = factory());
}(this, (function () { 'use strict';

  const coords = "coords";
  const vertices = "vertices";
  const edges = "edges";
  const faces = "faces";
  const boundaries = "boundaries";
  const frame = "frame";
  const file = "file";
  const vertices_coords = `${vertices}_${coords}`;
  const edges_vertices = `${edges}_${vertices}`;
  const faces_vertices = `${faces}_${vertices}`;
  const faces_edges = `${faces}_${edges}`;
  const edges_assignment = `${edges}_assignment`;
  const faces_re_coloring = `${faces}_re:coloring`;
  const faces_re_matrix = `${faces}_re:matrix`;
  const faces_re_layer = `${faces}_re:layer`;
  const frame_classes = `${frame}_classes`;
  const file_classes = `${file}_classes`;
  const boundary = "boundary";
  const mountain = "mountain";
  const valley = "valley";
  const mark = "mark";
  const unassigned = "unassigned";
  const creasePattern = "creasePattern";
  const front = "front";
  const back = "back";
  const svg = "svg";
  const _class = "class";
  const index = "index";
  const object = "object";
  const string = "string";
  const _function = "function";
  const _undefined = "undefined";
  const black = "black";
  const white = "white";
  const lightgray = "lightgray";
  const stroke_width = "stroke-width";
  const createElementNS = "createElementNS";
  const setAttributeNS = "setAttributeNS";
  const appendChild = "appendChild";

  const isBrowser = typeof window !== _undefined
    && typeof window.document !== _undefined;
  const isNode = typeof process !== _undefined
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

  const svgNS = "http://www.w3.org/2000/svg";
  const svg$1 = function () {
    const svgImage = win.document[createElementNS](svgNS, "svg");
    svgImage.setAttribute("version", "1.1");
    svgImage.setAttribute("xmlns", svgNS);
    return svgImage;
  };
  const g = function (parent) {
    const g = win.document[createElementNS](svgNS, "g");
    if (parent) { parent[appendChild](g); }
    return g;
  };
  const defs = function (parent) {
    const defs = win.document[createElementNS](svgNS, "defs");
    if (parent) { parent[appendChild](defs); }
    return defs;
  };
  const style = function (parent) {
    const s = win.document[createElementNS](svgNS, "style");
    s[setAttributeNS](null, "type", "text/css");
    if (parent) { parent[appendChild](s); }
    return s;
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
  const line = function (x1, y1, x2, y2) {
    const shape = win.document[createElementNS](svgNS, "line");
    shape[setAttributeNS](null, "x1", x1);
    shape[setAttributeNS](null, "y1", y1);
    shape[setAttributeNS](null, "x2", x2);
    shape[setAttributeNS](null, "y2", y2);
    return shape;
  };
  const circle = function (x, y, radius) {
    const shape = win.document[createElementNS](svgNS, "circle");
    shape[setAttributeNS](null, "cx", x);
    shape[setAttributeNS](null, "cy", y);
    shape[setAttributeNS](null, "r", radius);
    return shape;
  };
  const polygon = function (pointsArray) {
    const shape = win.document[createElementNS](svgNS, "polygon");
    const pointsString = pointsArray.map(p => `${p[0]},${p[1]}`).join(" ");
    shape[setAttributeNS](null, "points", pointsString);
    return shape;
  };
  const path = function (d) {
    const p = win.document[createElementNS](svgNS, "path");
    p[setAttributeNS](null, "d", d);
    return p;
  };

  const vertices_circle = function (graph, options) {
    if (vertices_coords in graph === false) {
      return [];
    }
    const radius = options && options.radius ? options.radius : 0.01;
    const svg_vertices = graph[vertices_coords]
      .map(v => circle(v[0], v[1], radius));
    svg_vertices.forEach((c, i) => c[setAttributeNS](null, index, i));
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
    if (graph[vertices_coords] == null
      || graph[vertices_coords].length <= 0) {
      return [0, 0, 0, 0];
    }
    const dimension = graph[vertices_coords][0].length;
    const min = Array(dimension).fill(Infinity);
    const max = Array(dimension).fill(-Infinity);
    graph[vertices_coords].forEach(v => v.forEach((n, i) => {
      if (n < min[i]) { min[i] = n; }
      if (n > max[i]) { max[i] = n; }
    }));
    return (isNaN(min[0]) || isNaN(min[1]) || isNaN(max[0]) || isNaN(max[1])
      ? [0, 0, 0, 0]
      : [min[0], min[1], max[0] - min[0], max[1] - min[1]]);
  };
  const get_boundary = function (graph) {
    if (graph[edges_assignment] == null) { return { vertices: [], edges: [] }; }
    const edges_vertices_b = graph[edges_assignment]
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
    vertex_walk.push(graph[edges_vertices][edgeIndex][0]);
    let nextVertex = graph[edges_vertices][edgeIndex][1];
    while (vertex_walk[0] !== nextVertex) {
      vertex_walk.push(nextVertex);
      edgeIndex = vertices_edges[nextVertex]
        .filter(v => edges_vertices_b[v])
        .shift();
      if (edgeIndex === undefined) { return { vertices: [], edges: [] }; }
      if (graph[edges_vertices][edgeIndex][0] === nextVertex) {
        [, nextVertex] = graph[edges_vertices][edgeIndex];
      } else {
        [nextVertex] = graph[edges_vertices][edgeIndex];
      }
      edges_vertices_b[edgeIndex] = false;
      edge_walk.push(edgeIndex);
    }
    return {
      vertices: vertex_walk,
      edges: edge_walk,
    };
  };

  const boundaries_polygon = function (graph) {
    if (vertices_coords in graph === false
      || edges_vertices in graph === false
      || edges_assignment in graph === false) {
      return [];
    }
    const boundary$1 = get_boundary(graph)
      .vertices
      .map(v => graph[vertices_coords][v]);
    if (boundary$1.length === 0) { return []; }
    const p = polygon(boundary$1);
    p[setAttributeNS](null, _class, boundary);
    return [p];
  };

  const edges_assignment_names = {
    B: boundary,
    b: boundary,
    M: mountain,
    m: mountain,
    V: valley,
    v: valley,
    F: mark,
    f: mark,
    U: unassigned,
    u: unassigned
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
    graph[edges_assignment].map(a => edges_assignment_to_lowercase[a])
      .forEach((a, i) => assignment_indices[a].push(i));
    return assignment_indices;
  };
  const make_edges_assignment_names = function (graph) {
    return (graph[edges_vertices] == null || graph[edges_assignment] == null
      || graph[edges_vertices].length !== graph[edges_assignment].length
      ? []
      : graph[edges_assignment].map(a => edges_assignment_names[a]));
  };
  const segment_to_path = function (s) {
    return `M${s[0][0]} ${s[0][1]}L${s[1][0]} ${s[1][1]}`;
  };
  const edges_path_data = function (graph) {
    const path_data = edges_coords(graph).map(segment => segment_to_path(segment)).join("");
    return path_data === "" ? undefined : path_data;
  };
  const edges_by_assignment_paths_data = function (graph) {
    if (graph[edges_vertices] == null
      || graph[vertices_coords] == null
      || graph[edges_assignment] == null) {
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
    if (graph[edges_assignment] == null) {
      const d = edges_path_data(graph);
      return d === undefined ? [] : [path(d)];
    }
    const ds = edges_by_assignment_paths_data(graph);
    return Object.keys(ds).map(assignment => {
      const p = path(ds[assignment]);
      p[setAttributeNS](null, _class, edges_assignment_names[assignment]);
      return p;
    });
  };
  const edges_line = function (graph) {
    const lines = edges_coords(graph).map(e => line(e[0][0], e[0][1], e[1][0], e[1][1]));
    lines.forEach((l, i) => l[setAttributeNS](null, index, i));
    make_edges_assignment_names(graph)
      .forEach((a, i) => lines[i][setAttributeNS](null, _class, a));
    return lines;
  };

  const faces_sorted_by_layer = function (faces_layer) {
    return faces_layer.map((layer, i) => ({ layer, i }))
      .sort((a, b) => a.layer - b.layer)
      .map(el => el.i);
  };
  const make_faces_sidedness = function (graph) {
    let coloring = graph[faces_re_coloring];
    if (coloring == null) {
      coloring = (faces_re_matrix in graph)
        ? make_faces_coloring_from_faces_matrix(graph[faces_re_matrix])
        : make_faces_coloring(graph, 0);
    }
    return coloring.map(c => (c ? front : back));
  };
  const finalize_faces = function (graph, svg_faces) {
    const isFoldedForm = typeof graph.frame_classes === object
      && graph.frame_classes !== null
      && !(graph.frame_classes.includes(creasePattern));
    const orderIsCertain = graph[faces_re_layer] != null
      && graph[faces_re_layer].length === graph[faces_vertices].length;
    if (orderIsCertain && isFoldedForm) {
      make_faces_sidedness(graph)
        .forEach((side, i) => svg_faces[i][setAttributeNS](null, _class, side));
    }
    return (orderIsCertain
      ? faces_sorted_by_layer(graph[faces_re_layer]).map(i => svg_faces[i])
      : svg_faces);
  };
  const faces_vertices_polygon = function (graph) {
    if (faces_vertices in graph === false
      || vertices_coords in graph === false) {
      return [];
    }
    const svg_faces = graph[faces_vertices]
      .map(fv => fv.map(v => graph[vertices_coords][v]))
      .map(face => polygon(face));
    svg_faces.forEach((face, i) => face[setAttributeNS](null, index, i));
    return finalize_faces(graph, svg_faces);
  };
  const faces_edges_polygon = function (graph) {
    if (faces_edges in graph === false
      || edges_vertices in graph === false
      || vertices_coords in graph === false) {
      return [];
    }
    const svg_faces = graph[faces_edges]
      .map(face_edges => face_edges
        .map(edge => graph[edges_vertices][edge])
        .map((vi, i, arr) => {
          const next = arr[(i + 1) % arr.length];
          return (vi[1] === next[0] || vi[1] === next[1] ? vi[0] : vi[1]);
        }).map(v => graph[vertices_coords][v]))
      .map(face => polygon(face));
    svg_faces.forEach((face, i) => face[setAttributeNS](null, index, i));
    return finalize_faces(graph, svg_faces);
  };

  const recursive_freeze = function (input) {
    Object.freeze(input);
    if (input === undefined) {
      return input;
    }
    Object.getOwnPropertyNames(input).filter(prop => input[prop] !== null
      && (typeof input[prop] === object || typeof input[prop] === _function)
      && !Object.isFrozen(input[prop]))
      .forEach(prop => recursive_freeze(input[prop]));
    return input;
  };
  const recursive_assign = (target, source) => {
    Object.keys(source).forEach((key) => {
      if (typeof source[key] === object && source[key] !== null) {
        if (!(key in target)) { target[key] = {}; }
        recursive_assign(target[key], source[key]);
      } else if (typeof target === object && !(key in target)) {
        target[key] = source[key];
      }
    });
    return target;
  };

  const linker = function (parent) {
  };

  const none = "none";
  const five_hundred_px = "500px";
  var Options = (vmin = 1) => recursive_freeze({
    input: string,
    output: string,
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
        stroke: black,
        fill: none,
        "stroke-linejoin": "bevel",
        "stroke-width": vmin / 200,
      },
      boundaries: {
        fill: white,
      },
      faces: {
        stroke: none,
        front: { stroke: black, fill: lightgray },
        back: { stroke: black, fill: white },
      },
      edges: {
        boundary: {},
        mountain: { stroke: "red" },
        valley: { stroke: "blue" },
        mark: { stroke: lightgray },
        unassigned: { stroke: lightgray },
      },
      vertices: {
        stroke: none,
        fill: black,
        r: vmin / 200
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

  const face_classes = [front, back];
  const edge_classes = [unassigned, mark, valley, mountain, boundary];
  const style_component = (group, opts, classes) => {
    Object.keys(opts)
      .filter(key => !classes.includes(key))
      .forEach(key => group[setAttributeNS](null, key, opts[key]));
    Array.from(group.childNodes)
      .forEach(child => Object.keys(opts[child.getAttribute(_class)] || {})
        .forEach(key => child[setAttributeNS](null, key, opts[child.getAttribute(_class)][key])));
  };
  const style_faces = (group, opts) => style_component(group, opts, face_classes);
  const style_edges = (group, opts) => style_component(group, opts, edge_classes);
  const style_vertices = (group, opts) => {
    Object.keys(opts)
      .filter(key => key !== "r")
      .forEach(key => group[setAttributeNS](null, key, opts[key]));
    Array.from(group.childNodes)
      .forEach(child => child[setAttributeNS](null, "r", opts.r));
  };
  const style_boundaries = (group, opts) => {
    Object.keys(opts)
      .forEach(key => group[setAttributeNS](null, key, opts[key]));
  };
  const style_func = {
    vertices: style_vertices,
    edges: style_edges,
    faces: style_faces,
    boundaries: style_boundaries,
  };

  const faces_draw_function = graph => (graph[faces_vertices] != null
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
    return [boundaries, edges, faces, vertices]
    .filter(key => options[key] === true)
    .map(key => {
      const group = g();
      group[setAttributeNS](null, _class, key);
      draw_func[key](graph, options)
        .forEach(a => group[appendChild](a));
      style_func[key](group, options.attributes[key]);
      return group;
    })
    .filter(group => group.childNodes.length > 0);
  };

  const { document } = win;
  const shadow_defaults = Object.freeze({
    blur: 0.005,
    opacity: 0.3,
    color: black,
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
    if (typeof options !== object || options === null) { options = {}; }
    Object.keys(shadow_defaults)
      .filter(key => !(key in options))
      .forEach((key) => { options[key] = shadow_defaults[key]; });
    const filter = document[createElementNS](svgNS, "filter");
    filter[setAttributeNS](null, "width", two_hundred);
    filter[setAttributeNS](null, "height", two_hundred);
    filter[setAttributeNS](null, "id", id_name);
    const gaussian = document[createElementNS](svgNS, "feGaussianBlur");
    gaussian[setAttributeNS](null, _in, "SourceAlpha");
    gaussian[setAttributeNS](null, "stdDeviation", options.blur);
    gaussian[setAttributeNS](null, result, blur);
    const offset = document[createElementNS](svgNS, "feOffset");
    offset[setAttributeNS](null, _in, blur);
    offset[setAttributeNS](null, result, offsetBlur);
    const flood = document[createElementNS](svgNS, "feFlood");
    flood[setAttributeNS](null, "flood-color", options.color);
    flood[setAttributeNS](null, "flood-opacity", options.opacity);
    flood[setAttributeNS](null, result, offsetColor);
    const composite = document[createElementNS](svgNS, "feComposite");
    composite[setAttributeNS](null, _in, offsetColor);
    composite[setAttributeNS](null, "in2", offsetBlur);
    composite[setAttributeNS](null, "operator", _in);
    composite[setAttributeNS](null, result, offsetBlur);
    const merge = document[createElementNS](svgNS, "feMerge");
    const mergeNode1 = document[createElementNS](svgNS, feMergeNode);
    const mergeNode2 = document[createElementNS](svgNS, feMergeNode);
    mergeNode2[setAttributeNS](null, _in, "SourceGraphic");
    merge[appendChild](mergeNode1);
    merge[appendChild](mergeNode2);
    filter[appendChild](gaussian);
    filter[appendChild](offset);
    filter[appendChild](flood);
    filter[appendChild](composite);
    filter[appendChild](merge);
    return filter;
  };

  const make_defs = (graph, options) => {
    const bounds = bounding_rect(graph);
    const vmin = Math.min(bounds[2], bounds[3]);
    const defs$1 = defs();
    if (options.stylesheet != null) {
      const style$1 = style(defs$1);
      const strokeVar = options.attributes.svg[stroke_width]
        ? options.attributes.svg[stroke_width] : vmin / 200;
      const cdata = (new win.DOMParser())
        .parseFromString("<xml></xml>", "application/xml")
        .createCDATASection(`\n* { --${stroke_width}: ${strokeVar}; }\n${options.stylesheet}`);
      style$1[appendChild](cdata);
    }
    if (options.shadows != null) {
      const shadowOptions = (typeof options.shadows === object && options.shadows !== null
        ? options.shadows
        : { blur: vmin / 200 });
      defs$1[appendChild](shadowFilter(shadowOptions));
    }
    return (options.stylesheet != null || options.shadows != null
      ? defs$1
      : undefined);
  };

  const graph_classes = function (graph) {
    const file_classes$1 = (graph[file_classes] != null
      ? graph[file_classes] : []).join(" ");
    const frame_classes$1 = (graph[frame_classes] != null
      ? graph[frame_classes] : []).join(" ");
    return [file_classes$1, frame_classes$1]
      .filter(s => s !== "")
      .join(" ");
  };

  const make_svg_attributes = (graph, options) => {
    const bounds = bounding_rect(graph);
    const vmin = Math.min(bounds[2], bounds[3]);
    const attributes = {
      viewBox: makeViewBox(...bounds, options.padding),
    };
    const classValue = graph_classes(graph);
    if (classValue !== "") {
      attributes[_class] = classValue;
    }
    Object.assign(attributes, options.attributes.svg);
    return attributes;
  };

  const render_into_svg = (svg, graph, options) => {
    make_options(graph, options);
    const defs = make_defs(graph, options);
    if (defs) { svg[appendChild](defs); }
    render_components(graph, options)
      .forEach(group => svg[appendChild](group));
    const attrs = make_svg_attributes(graph, options);
    Object.keys(attrs).forEach(attr => svg[setAttributeNS](null, attr, attrs[attr]));
    return svg;
  };

  const FoldToSvg = (graph, options = {}) => {
    make_options(graph, options);
    const element = render_into_svg(svg$1(), graph, options);
    if (options.output === svg) { return element; }
    const stringified = (new window.XMLSerializer()).serializeToString(element);
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
  });

  return FoldToSvg;

})));
