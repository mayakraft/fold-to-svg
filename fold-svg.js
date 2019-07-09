/* (c) Robby Kraft, MIT License */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.fold_svg = factory());
}(this, (function () { 'use strict';

  let DOMParser = (typeof window === "undefined" || window === null)
  	? undefined
  	: window.DOMParser;
  if (typeof DOMParser === "undefined" || DOMParser === null) {
  	DOMParser = require("xmldom").DOMParser;
  }
  let XMLSerializer = (typeof window === "undefined" || window === null)
  	? undefined
  	: window.XMLSerializer;
  if (typeof XMLSerializer === "undefined" || XMLSerializer === null) {
  	XMLSerializer = require("xmldom").XMLSerializer;
  }
  let document = (typeof window === "undefined" || window === null)
  	? undefined
  	: window.document;
  if (typeof document === "undefined" || document === null) {
  	document = new DOMParser()
  		.parseFromString("<!DOCTYPE html><title>a</title>", "text/html");
  }

  const make_vertices_edges = function (graph) {
    const vertices_edges = graph.vertices_coords.map(() => []);
    graph.edges_vertices.forEach((ev, i) => ev
      .forEach(v => vertices_edges[v].push(i)));
    return vertices_edges;
  };
  const get_boundary = function (graph) {
    const edges_vertices_b = graph.edges_assignment
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
  const bounding_rect = function (graph) {
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
  const make_faces_faces = function (graph) {
    const nf = graph.faces_vertices.length;
    const faces_faces = Array.from(Array(nf)).map(() => []);
    const edgeMap = {};
    graph.faces_vertices.forEach((vertices_index, idx1) => {
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
  const faces_coloring_from_faces_matrix = function (faces_matrix) {
    return faces_matrix
      .map(m => m[0] * m[3] - m[1] * m[2])
      .map(c => c >= 0);
  };
  const faces_coloring = function (graph, root_face = 0){
    const coloring = [];
    coloring[root_face] = true;
    make_face_walk_tree(graph, root_face).forEach((level, i) => {
      level.forEach((entry) => { coloring[entry.face] = (i % 2 === 0); });
    });
    return coloring;
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
  const clone = function (o) {
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
  const flatten_frame = function (fold_file, frame_num) {
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

  const isBrowser = typeof window !== "undefined"
    && typeof window.document !== "undefined";
  const isNode = typeof process !== "undefined"
    && process.versions != null
    && process.versions.node != null;
  const isWebWorker = typeof self === "object"
    && self.constructor
    && self.constructor.name === "DedicatedWorkerGlobalScope";

  const htmlString = "<!DOCTYPE html><title>a</title>";
  const win = {};
  if (isNode) {
    const { DOMParser, XMLSerializer } = require("xmldom");
    win.DOMParser = DOMParser;
    win.XMLSerializer = XMLSerializer;
    win.document = new DOMParser().parseFromString(htmlString, "text/html");
  } else if (isBrowser) {
    win.DOMParser = window.DOMParser;
    win.XMLSerializer = window.XMLSerializer;
    win.document = window.document;
  }

  const svgNS$1 = "http://www.w3.org/2000/svg";
  const svg$1 = function () {
    const svgImage = win.document.createElementNS(svgNS$1, "svg");
    svgImage.setAttribute("version", "1.1");
    svgImage.setAttribute("xmlns", svgNS$1);
    return svgImage;
  };
  const group = function () {
    const g = win.document.createElementNS(svgNS$1, "g");
    return g;
  };
  const style = function () {
    const s = win.document.createElementNS(svgNS$1, "style");
    s.setAttribute("type", "text/css");
    return s;
  };
  const setViewBox = function (SVG, x, y, width, height, padding = 0) {
    const scale = 1.0;
    const d = (width / scale) - width;
    const X = (x - d) - padding;
    const Y = (y - d) - padding;
    const W = (width + d * 2) + padding * 2;
    const H = (height + d * 2) + padding * 2;
    const viewBoxString = [X, Y, W, H].join(" ");
    SVG.setAttributeNS(null, "viewBox", viewBoxString);
  };
  const line = function (x1, y1, x2, y2) {
    const shape = win.document.createElementNS(svgNS$1, "line");
    shape.setAttributeNS(null, "x1", x1);
    shape.setAttributeNS(null, "y1", y1);
    shape.setAttributeNS(null, "x2", x2);
    shape.setAttributeNS(null, "y2", y2);
    return shape;
  };
  const circle = function (x, y, radius) {
    const shape = win.document.createElementNS(svgNS$1, "circle");
    shape.setAttributeNS(null, "cx", x);
    shape.setAttributeNS(null, "cy", y);
    shape.setAttributeNS(null, "r", radius);
    return shape;
  };
  const polygon = function (pointsArray) {
    const shape = win.document.createElementNS(svgNS$1, "polygon");
    const pointsString = pointsArray
      .reduce((a, b) => `${a}${b[0]},${b[1]} `, "");
    shape.setAttributeNS(null, "points", pointsString);
    return shape;
  };
  const bezier = function (fromX, fromY, c1X, c1Y, c2X, c2Y, toX, toY) {
    const pts = [[fromX, fromY], [c1X, c1Y], [c2X, c2Y], [toX, toY]]
      .map(p => p.join(","));
    const d = `M ${pts[0]} C ${pts[1]} ${pts[2]} ${pts[3]}`;
    const shape = win.document.createElementNS(svgNS$1, "path");
    shape.setAttributeNS(null, "d", d);
    return shape;
  };
  const arcArrow = function (start, end, options) {
    const p = {
      color: "#000",
      strokeWidth: 0.5,
      width: 0.5,
      length: 2,
      bend: 0.3,
      pinch: 0.618,
      padding: 0.5,
      side: true,
      start: false,
      end: true,
      strokeStyle: "",
      fillStyle: "",
    };
    if (typeof options === "object" && options !== null) {
      Object.assign(p, options);
    }
    const arrowFill = [
      "stroke:none",
      `fill:${p.color}`,
      p.fillStyle,
    ].filter(a => a !== "").join(";");
    const arrowStroke = [
      "fill:none",
      `stroke:${p.color}`,
      `stroke-width:${p.strokeWidth}`,
      p.strokeStyle,
    ].filter(a => a !== "").join(";");
    let startPoint = start;
    let endPoint = end;
    let vector = [endPoint[0] - startPoint[0], endPoint[1] - startPoint[1]];
    let midpoint = [startPoint[0] + vector[0] / 2, startPoint[1] + vector[1] / 2];
    const len = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
    const minLength = (p.start ? (1 + p.padding) : 0 + p.end ? (1 + p.padding) : 0)
      * p.length * 2.5;
    if (len < minLength) {
      const minVec = [vector[0] / len * minLength, vector[1] / len * minLength];
      startPoint = [midpoint[0] - minVec[0] * 0.5, midpoint[1] - minVec[1] * 0.5];
      endPoint = [midpoint[0] + minVec[0] * 0.5, midpoint[1] + minVec[1] * 0.5];
      vector = [endPoint[0] - startPoint[0], endPoint[1] - startPoint[1]];
    }
    let perpendicular = [vector[1], -vector[0]];
    let bezPoint = [
      midpoint[0] + perpendicular[0] * (p.side ? 1 : -1) * p.bend,
      midpoint[1] + perpendicular[1] * (p.side ? 1 : -1) * p.bend
    ];
    const bezStart = [bezPoint[0] - startPoint[0], bezPoint[1] - startPoint[1]];
    const bezEnd = [bezPoint[0] - endPoint[0], bezPoint[1] - endPoint[1]];
    const bezStartLen = Math.sqrt(bezStart[0] * bezStart[0] + bezStart[1] * bezStart[1]);
    const bezEndLen = Math.sqrt(bezEnd[0] * bezEnd[0] + bezEnd[1] * bezEnd[1]);
    const bezStartNorm = [bezStart[0] / bezStartLen, bezStart[1] / bezStartLen];
    const bezEndNorm = [bezEnd[0] / bezEndLen, bezEnd[1] / bezEndLen];
    const startHeadVec = [-bezStartNorm[0], -bezStartNorm[1]];
    const endHeadVec = [-bezEndNorm[0], -bezEndNorm[1]];
    const startNormal = [startHeadVec[1], -startHeadVec[0]];
    const endNormal = [endHeadVec[1], -endHeadVec[0]];
    const arcStart = [
      startPoint[0] + bezStartNorm[0] * p.length * ((p.start ? 1 : 0) + p.padding),
      startPoint[1] + bezStartNorm[1] * p.length * ((p.start ? 1 : 0) + p.padding)
    ];
    const arcEnd = [
      endPoint[0] + bezEndNorm[0] * p.length * ((p.end ? 1 : 0) + p.padding),
      endPoint[1] + bezEndNorm[1] * p.length * ((p.end ? 1 : 0) + p.padding)
    ];
    vector = [arcEnd[0] - arcStart[0], arcEnd[1] - arcStart[1]];
    perpendicular = [vector[1], -vector[0]];
    midpoint = [arcStart[0] + vector[0] / 2, arcStart[1] + vector[1] / 2];
    bezPoint = [
      midpoint[0] + perpendicular[0] * (p.side ? 1 : -1) * p.bend,
      midpoint[1] + perpendicular[1] * (p.side ? 1 : -1) * p.bend
    ];
    const controlStart = [
      arcStart[0] + (bezPoint[0] - arcStart[0]) * p.pinch,
      arcStart[1] + (bezPoint[1] - arcStart[1]) * p.pinch
    ];
    const controlEnd = [
      arcEnd[0] + (bezPoint[0] - arcEnd[0]) * p.pinch,
      arcEnd[1] + (bezPoint[1] - arcEnd[1]) * p.pinch
    ];
    const startHeadPoints = [
      [arcStart[0] + startNormal[0] * -p.width, arcStart[1] + startNormal[1] * -p.width],
      [arcStart[0] + startNormal[0] * p.width, arcStart[1] + startNormal[1] * p.width],
      [arcStart[0] + startHeadVec[0] * p.length, arcStart[1] + startHeadVec[1] * p.length]
    ];
    const endHeadPoints = [
      [arcEnd[0] + endNormal[0] * -p.width, arcEnd[1] + endNormal[1] * -p.width],
      [arcEnd[0] + endNormal[0] * p.width, arcEnd[1] + endNormal[1] * p.width],
      [arcEnd[0] + endHeadVec[0] * p.length, arcEnd[1] + endHeadVec[1] * p.length]
    ];
    const arrowGroup = win.document.createElementNS(svgNS$1, "g");
    const arrowArc = bezier(
      arcStart[0], arcStart[1], controlStart[0], controlStart[1],
      controlEnd[0], controlEnd[1], arcEnd[0], arcEnd[1]
    );
    arrowArc.setAttribute("style", arrowStroke);
    arrowGroup.appendChild(arrowArc);
    if (p.start) {
      const startHead = polygon(startHeadPoints);
      startHead.setAttribute("style", arrowFill);
      arrowGroup.appendChild(startHead);
    }
    if (p.end) {
      const endHead = polygon(endHeadPoints);
      endHead.setAttribute("style", arrowFill);
      arrowGroup.appendChild(endHead);
    }
    return arrowGroup;
  };

  const CREASE_NAMES = {
    B: "boundary", b: "boundary",
    M: "mountain", m: "mountain",
    V: "valley",   v: "valley",
    F: "mark",     f: "mark",
    U: "mark",     u: "mark",
  };
  const faces_sorted_by_layer = function (faces_layer) {
    return faces_layer.map((layer, i) => ({ layer, i }))
      .sort((a, b) => a.layer - b.layer)
      .map(el => el.i);
  };
  const make_faces_sidedness = function (graph) {
    let coloring = graph["faces_re:coloring"];
    if (coloring == null) {
      coloring = ("faces_re:matrix" in graph)
        ? faces_coloring_from_faces_matrix(graph["faces_re:matrix"])
        : faces_coloring(graph, 0);
    }
    return coloring.map(c => (c ? "front" : "back"));
  };
  const finalize_faces = function (graph, svg_faces) {
    const orderIsCertain = graph["faces_re:layer"] != null
      && graph["faces_re:layer"].length === graph.faces_vertices.length;
    if (orderIsCertain) {
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

  var components = /*#__PURE__*/Object.freeze({
    svgBoundaries: svgBoundaries,
    svgVertices: svgVertices,
    svgEdges: svgEdges,
    svgFacesVertices: svgFacesVertices,
    svgFacesEdges: svgFacesEdges
  });

  var defaultStyle = "svg * {\n  stroke-width: var(--crease-width);\n  stroke-linecap: round;\n  stroke: black;\n}\npolygon { fill: none; stroke: none; stroke-linejoin: bevel; }\n.boundary { fill: white; stroke: black;}\n.mark { stroke: #aaa;}\n.mountain { stroke: #f00;}\n.valley {\n  stroke: #00f;\n  stroke-dasharray: calc(var(--crease-width) * 2) calc(var(--crease-width) * 2);\n}\n.foldedForm .boundary { fill: none;stroke: none; }\n.foldedForm .faces polygon { stroke: black; }\n.foldedForm .faces .front { fill: #fff; }\n.foldedForm .faces .back { fill: #ddd; }\n.foldedForm .creases line { stroke: none; }\n";

  function vkXML$1 (text, step) {
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

  const { document: document$1 } = win;
  const svgNS$2 = "http://www.w3.org/2000/svg";
  const shadowFilter = function (id_name = "shadow") {
    const defs = document$1.createElementNS(svgNS$2, "defs");
    const filter = document$1.createElementNS(svgNS$2, "filter");
    filter.setAttribute("width", "200%");
    filter.setAttribute("height", "200%");
    filter.setAttribute("id", id_name);
    const blur = document$1.createElementNS(svgNS$2, "feGaussianBlur");
    blur.setAttribute("in", "SourceAlpha");
    blur.setAttribute("stdDeviation", "0.005");
    blur.setAttribute("result", "blur");
    const offset = document$1.createElementNS(svgNS$2, "feOffset");
    offset.setAttribute("in", "blur");
    offset.setAttribute("result", "offsetBlur");
    const flood = document$1.createElementNS(svgNS$2, "feFlood");
    flood.setAttribute("flood-color", "#000");
    flood.setAttribute("flood-opacity", "0.3");
    flood.setAttribute("result", "offsetColor");
    const composite = document$1.createElementNS(svgNS$2, "feComposite");
    composite.setAttribute("in", "offsetColor");
    composite.setAttribute("in2", "offsetBlur");
    composite.setAttribute("operator", "in");
    composite.setAttribute("result", "offsetBlur");
    const merge = document$1.createElementNS(svgNS$2, "feMerge");
    const mergeNode1 = document$1.createElementNS(svgNS$2, "feMergeNode");
    const mergeNode2 = document$1.createElementNS(svgNS$2, "feMergeNode");
    mergeNode2.setAttribute("in", "SourceGraphic");
    merge.appendChild(mergeNode1);
    merge.appendChild(mergeNode2);
    defs.appendChild(filter);
    filter.appendChild(blur);
    filter.appendChild(offset);
    filter.appendChild(flood);
    filter.appendChild(composite);
    filter.appendChild(merge);
    return defs;
  };

  function renderDiagrams (graph, renderGroup) {
    if (graph["re:diagrams"] === undefined) { return; }
    if (graph["re:diagrams"].length === 0) { return; }
    Array.from(graph["re:diagrams"]).forEach((instruction) => {
      if ("re:diagram_lines" in instruction === true) {
        instruction["re:diagram_lines"].forEach((crease) => {
          const creaseClass = ("re:diagram_line_classes" in crease)
            ? crease["re:diagram_line_classes"].join(" ")
            : "valley";
          const pts = crease["re:diagram_line_coords"];
          if (pts !== undefined) {
            const l = line(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
            l.setAttribute("class", creaseClass);
            renderGroup.appendChild(l);
          }
        });
      }
      if ("re:diagram_arrows" in instruction === true) {
        const r = bounding_rect(graph);
        const vmin = r[2] > r[3] ? r[3] : r[2];
        const prefs = {
          length: vmin * 0.09,
          width: vmin * 0.035,
          strokeWidth: vmin * 0.02,
        };
        instruction["re:diagram_arrows"].forEach((arrowInst) => {
          if (arrowInst["re:diagram_arrow_coords"].length === 2) {
            const p = arrowInst["re:diagram_arrow_coords"];
            let side = p[0][0] < p[1][0];
            if (Math.abs(p[0][0] - p[1][0]) < 0.1) {
              side = p[0][1] < p[1][1]
                ? p[0][0] < 0.5
                : p[0][0] > 0.5;
            }
            if (Math.abs(p[0][1] - p[1][1]) < 0.1) {
              side = p[0][0] < p[1][0]
                ? p[0][1] > 0.5
                : p[0][1] < 0.5;
            }
            prefs.side = side;
            const arrow = arcArrow(p[0], p[1], prefs);
            renderGroup.appendChild(arrow);
          }
        });
      }
    });
  }

  const DISPLAY_NAME = {
    vertices: "vertices",
    edges: "creases",
    faces: "faces",
    boundaries: "boundaries",
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
  const components$1 = {
    vertices: svgVertices,
    edges: svgEdges,
    faces: svgFaces,
    boundaries: svgBoundaries,
  };
  const all_classes = function (graph) {
    const file_classes = (graph.file_classes != null
      ? graph.file_classes : []).join(" ");
    const frame_classes = (graph.frame_classes != null
      ? graph.frame_classes : []).join(" ");
    return [file_classes, frame_classes]
      .filter(s => s !== "")
      .join(" ");
  };
  const fold_to_svg = function (fold, options = {}) {
    let graph = fold;
    const o = {
      defaults: true,
      width: "500px",
      height: "500px",
      inlineStyle: true,
      stylesheet: defaultStyle,
      shadows: false,
      padding: 0,
      viewBox: null,
      boundaries: true,
      faces: true,
      edges: true,
      vertices: false,
    };
    Object.assign(o, options);
    if (o.frame != null) {
      graph = flatten_frame(fold, o.frame);
    }
    if (o.svg == null) {
      o.svg = svg$1();
    }
    o.svg.setAttribute("class", all_classes(graph));
    o.svg.setAttribute("width", o.width);
    o.svg.setAttribute("height", o.height);
    const styleElement = style();
    o.svg.appendChild(styleElement);
    const groups = { };
    ["boundaries", "faces", "edges", "vertices"].filter(key => o[key])
      .forEach((key) => {
        groups[key] = group();
        groups[key].setAttribute("class", DISPLAY_NAME[key]);
        o.svg.appendChild(groups[key]);
      });
    Object.keys(groups)
      .forEach(key => components$1[key](graph)
        .forEach(a => groups[key].appendChild(a)));
    if ("re:diagrams" in graph) {
      const instructionLayer = group();
      o.svg.appendChild(instructionLayer);
      renderDiagrams(graph, instructionLayer);
    }
    if (o.shadows) {
      const shadow_id = "face_shadow";
      const filter = shadowFilter(shadow_id);
      o.svg.appendChild(filter);
      Array.from(groups.faces.childNodes)
        .forEach(f => f.setAttribute("filter", `url(#${shadow_id})`));
    }
    const rect = bounding_rect(graph);
    if (o.viewBox != null) {
      setViewBox(o.svg, ...o.viewBox, o.padding);
    } else {
      setViewBox(o.svg, ...rect, o.padding);
    }
    if (o.inlineStyle) {
      const vmin = rect[2] > rect[3] ? rect[3] : rect[2];
      const innerStyle = `\nsvg { --crease-width: ${vmin * 0.005}; }\n${o.stylesheet}`;
      const docu = (new win.DOMParser())
        .parseFromString("<xml></xml>", "application/xml");
      const cdata = docu.createCDATASection(innerStyle);
      styleElement.appendChild(cdata);
    }
    const stringified = (new win.XMLSerializer()).serializeToString(o.svg);
    const beautified = vkXML$1(stringified);
    return beautified;
  };

  const convert = {
    components,
    toSVG: (input, options) => {
      if (typeof input === "object" && input !== null) {
        return fold_to_svg(input, options);
      }
      if (typeof input === "string" || input instanceof String) {
        try {
          const obj = JSON.parse(input);
          return fold_to_svg(obj, options);
        } catch (error) {
          throw error;
        }
      }
      return "";
    },
  };

  return convert;

})));
