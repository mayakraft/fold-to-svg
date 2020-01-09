/* (c) Robby Kraft, MIT License */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.FoldToSvg = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  var isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";
  var isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
  var isWebWorker = (typeof self === "undefined" ? "undefined" : _typeof(self)) === "object" && self.constructor && self.constructor.name === "DedicatedWorkerGlobalScope";

  var htmlString = "<!DOCTYPE html><title> </title>";

  var win = function () {
    var w = {};

    if (isNode) {
      var _require = require("xmldom"),
          DOMParser = _require.DOMParser,
          XMLSerializer = _require.XMLSerializer;

      w.DOMParser = DOMParser;
      w.XMLSerializer = XMLSerializer;
      w.document = new DOMParser().parseFromString(htmlString, "text/html");
    } else if (isBrowser) {
      w = window;
    }

    return w;
  }();

  var svgNS = "http://www.w3.org/2000/svg";
  var svg = function svg() {
    var svgImage = win.document.createElementNS(svgNS, "svg");
    svgImage.setAttribute("version", "1.1");
    svgImage.setAttribute("xmlns", svgNS);
    return svgImage;
  };
  var group = function group() {
    var g = win.document.createElementNS(svgNS, "g");
    return g;
  };
  var style = function style() {
    var s = win.document.createElementNS(svgNS, "style");
    s.setAttribute("type", "text/css");
    return s;
  };
  var setViewBox = function setViewBox(SVG, x, y, width, height) {
    var padding = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
    var scale = 1.0;
    var d = width / scale - width;
    var X = x - d - padding;
    var Y = y - d - padding;
    var W = width + d * 2 + padding * 2;
    var H = height + d * 2 + padding * 2;
    var viewBoxString = [X, Y, W, H].join(" ");
    SVG.setAttributeNS(null, "viewBox", viewBoxString);
  };
  var line = function line(x1, y1, x2, y2) {
    var shape = win.document.createElementNS(svgNS, "line");
    shape.setAttributeNS(null, "x1", x1);
    shape.setAttributeNS(null, "y1", y1);
    shape.setAttributeNS(null, "x2", x2);
    shape.setAttributeNS(null, "y2", y2);
    return shape;
  };
  var circle = function circle(x, y, radius) {
    var shape = win.document.createElementNS(svgNS, "circle");
    shape.setAttributeNS(null, "cx", x);
    shape.setAttributeNS(null, "cy", y);
    shape.setAttributeNS(null, "r", radius);
    return shape;
  };
  var polygon = function polygon(pointsArray) {
    var shape = win.document.createElementNS(svgNS, "polygon");
    var pointsString = pointsArray.reduce(function (a, b) {
      return "".concat(a).concat(b[0], ",").concat(b[1], " ");
    }, "");
    shape.setAttributeNS(null, "points", pointsString);
    return shape;
  };
  var path = function path(d) {
    var p = win.document.createElementNS(svgNS, "path");
    p.setAttributeNS(null, "d", d);
    return p;
  };
  var bezier = function bezier(fromX, fromY, c1X, c1Y, c2X, c2Y, toX, toY) {
    var pts = [[fromX, fromY], [c1X, c1Y], [c2X, c2Y], [toX, toY]].map(function (p) {
      return p.join(",");
    });
    return path("M ".concat(pts[0], " C ").concat(pts[1], " ").concat(pts[2], " ").concat(pts[3]));
  };
  var arcArrow = function arcArrow(start, end, options) {
    var p = {
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
      fillStyle: ""
    };

    if (_typeof(options) === "object" && options !== null) {
      Object.assign(p, options);
    }

    var arrowFill = ["stroke:none", "fill:".concat(p.color), p.fillStyle].filter(function (a) {
      return a !== "";
    }).join(";");
    var arrowStroke = ["fill:none", "stroke:".concat(p.color), "stroke-width:".concat(p.strokeWidth), p.strokeStyle].filter(function (a) {
      return a !== "";
    }).join(";");
    var startPoint = start;
    var endPoint = end;
    var vector = [endPoint[0] - startPoint[0], endPoint[1] - startPoint[1]];
    var midpoint = [startPoint[0] + vector[0] / 2, startPoint[1] + vector[1] / 2];
    var len = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
    var minLength = (p.start ? 1 + p.padding : 0 + p.end ? 1 + p.padding : 0) * p.length * 2.5;

    if (len < minLength) {
      var minVec = [vector[0] / len * minLength, vector[1] / len * minLength];
      startPoint = [midpoint[0] - minVec[0] * 0.5, midpoint[1] - minVec[1] * 0.5];
      endPoint = [midpoint[0] + minVec[0] * 0.5, midpoint[1] + minVec[1] * 0.5];
      vector = [endPoint[0] - startPoint[0], endPoint[1] - startPoint[1]];
    }

    var perpendicular = [vector[1], -vector[0]];
    var bezPoint = [midpoint[0] + perpendicular[0] * (p.side ? 1 : -1) * p.bend, midpoint[1] + perpendicular[1] * (p.side ? 1 : -1) * p.bend];
    var bezStart = [bezPoint[0] - startPoint[0], bezPoint[1] - startPoint[1]];
    var bezEnd = [bezPoint[0] - endPoint[0], bezPoint[1] - endPoint[1]];
    var bezStartLen = Math.sqrt(bezStart[0] * bezStart[0] + bezStart[1] * bezStart[1]);
    var bezEndLen = Math.sqrt(bezEnd[0] * bezEnd[0] + bezEnd[1] * bezEnd[1]);
    var bezStartNorm = [bezStart[0] / bezStartLen, bezStart[1] / bezStartLen];
    var bezEndNorm = [bezEnd[0] / bezEndLen, bezEnd[1] / bezEndLen];
    var startHeadVec = [-bezStartNorm[0], -bezStartNorm[1]];
    var endHeadVec = [-bezEndNorm[0], -bezEndNorm[1]];
    var startNormal = [startHeadVec[1], -startHeadVec[0]];
    var endNormal = [endHeadVec[1], -endHeadVec[0]];
    var arcStart = [startPoint[0] + bezStartNorm[0] * p.length * ((p.start ? 1 : 0) + p.padding), startPoint[1] + bezStartNorm[1] * p.length * ((p.start ? 1 : 0) + p.padding)];
    var arcEnd = [endPoint[0] + bezEndNorm[0] * p.length * ((p.end ? 1 : 0) + p.padding), endPoint[1] + bezEndNorm[1] * p.length * ((p.end ? 1 : 0) + p.padding)];
    vector = [arcEnd[0] - arcStart[0], arcEnd[1] - arcStart[1]];
    perpendicular = [vector[1], -vector[0]];
    midpoint = [arcStart[0] + vector[0] / 2, arcStart[1] + vector[1] / 2];
    bezPoint = [midpoint[0] + perpendicular[0] * (p.side ? 1 : -1) * p.bend, midpoint[1] + perpendicular[1] * (p.side ? 1 : -1) * p.bend];
    var controlStart = [arcStart[0] + (bezPoint[0] - arcStart[0]) * p.pinch, arcStart[1] + (bezPoint[1] - arcStart[1]) * p.pinch];
    var controlEnd = [arcEnd[0] + (bezPoint[0] - arcEnd[0]) * p.pinch, arcEnd[1] + (bezPoint[1] - arcEnd[1]) * p.pinch];
    var startHeadPoints = [[arcStart[0] + startNormal[0] * -p.width, arcStart[1] + startNormal[1] * -p.width], [arcStart[0] + startNormal[0] * p.width, arcStart[1] + startNormal[1] * p.width], [arcStart[0] + startHeadVec[0] * p.length, arcStart[1] + startHeadVec[1] * p.length]];
    var endHeadPoints = [[arcEnd[0] + endNormal[0] * -p.width, arcEnd[1] + endNormal[1] * -p.width], [arcEnd[0] + endNormal[0] * p.width, arcEnd[1] + endNormal[1] * p.width], [arcEnd[0] + endHeadVec[0] * p.length, arcEnd[1] + endHeadVec[1] * p.length]];
    var arrowGroup = win.document.createElementNS(svgNS, "g");
    var arrowArc = bezier(arcStart[0], arcStart[1], controlStart[0], controlStart[1], controlEnd[0], controlEnd[1], arcEnd[0], arcEnd[1]);
    arrowArc.setAttribute("style", arrowStroke);
    arrowGroup.appendChild(arrowArc);

    if (p.start) {
      var startHead = polygon(startHeadPoints);
      startHead.setAttribute("style", arrowFill);
      arrowGroup.appendChild(startHead);
    }

    if (p.end) {
      var endHead = polygon(endHeadPoints);
      endHead.setAttribute("style", arrowFill);
      arrowGroup.appendChild(endHead);
    }

    return arrowGroup;
  };

  var vertices_circle = function vertices_circle(graph, options) {
    if ("vertices_coords" in graph === false) {
      return [];
    }

    var radius = options && options.radius ? options.radius : 0.01;
    var svg_vertices = graph.vertices_coords.map(function (v) {
      return circle(v[0], v[1], radius);
    });
    svg_vertices.forEach(function (c, i) {
      return c.setAttribute("id", "".concat(i));
    });
    return svg_vertices;
  };

  var edges_assignment_names = {
    B: "boundary",
    b: "boundary",
    M: "mountain",
    m: "mountain",
    V: "valley",
    v: "valley",
    F: "mark",
    f: "mark",
    U: "unassigned",
    u: "unassigned"
  };
  var edges_assignment_to_lowercase = {
    B: "b",
    b: "b",
    M: "m",
    m: "m",
    V: "v",
    v: "v",
    F: "f",
    f: "f",
    U: "u",
    u: "u"
  };

  var edges_coords = function edges_coords(_ref) {
    var vertices_coords = _ref.vertices_coords,
        edges_vertices = _ref.edges_vertices;

    if (edges_vertices == null || vertices_coords == null) {
      return [];
    }

    return edges_vertices.map(function (ev) {
      return ev.map(function (v) {
        return vertices_coords[v];
      });
    });
  };

  var edges_indices_classes = function edges_indices_classes(_ref2) {
    var edges_assignment = _ref2.edges_assignment;
    var assignment_indices = {
      b: [],
      m: [],
      v: [],
      f: [],
      u: []
    };
    edges_assignment.map(function (a) {
      return edges_assignment_to_lowercase[a];
    }).forEach(function (a, i) {
      return assignment_indices[a].push(i);
    });
    return assignment_indices;
  };

  var make_edges_assignment_names = function make_edges_assignment_names(graph) {
    return graph.edges_vertices == null || graph.edges_assignment == null || graph.edges_vertices.length !== graph.edges_assignment.length ? [] : graph.edges_assignment.map(function (a) {
      return edges_assignment_names[a];
    });
  };

  var segment_to_path = function segment_to_path(s) {
    return "M".concat(s[0][0], " ").concat(s[0][1], "L").concat(s[1][0], " ").concat(s[1][1]);
  };

  var edges_path_data = function edges_path_data(graph) {
    return edges_coords(graph).map(function (segment) {
      return segment_to_path(segment);
    }).join("");
  };
  var edges_by_assignment_paths_data = function edges_by_assignment_paths_data(graph) {
    if (graph.edges_vertices == null || graph.vertices_coords == null || graph.edges_assignment == null) {
      return [];
    }

    var segments = edges_coords(graph);
    var assignment_sorted_edges = edges_indices_classes(graph);
    var paths = Object.keys(assignment_sorted_edges).map(function (assignment) {
      return assignment_sorted_edges[assignment].map(function (i) {
        return segments[i];
      });
    }).map(function (segments) {
      return segments.map(function (segment) {
        return segment_to_path(segment);
      }).join("");
    });
    var result = {};
    Object.keys(assignment_sorted_edges).map(function (key, i) {
      if (paths[i] !== "") {
        result[key] = paths[i];
      }
    });
    return result;
  };
  var edges_path = function edges_path(graph) {
    if (graph.edges_assignment == null) {
      return [path(edges_path_data(graph))];
    }

    var ds = edges_by_assignment_paths_data(graph);
    return Object.keys(ds).map(function (assignment) {
      var p = path(ds[assignment]);
      p.setAttributeNS(null, "class", edges_assignment_names[assignment]);
      return p;
    });
  };
  var edges_line = function edges_line(graph) {
    var lines = edges_coords(graph).map(function (e) {
      return line(e[0][0], e[0][1], e[1][0], e[1][1]);
    });
    lines.forEach(function (l, i) {
      return l.setAttributeNS(null, "index", i);
    });
    make_edges_assignment_names(graph).forEach(function (a, i) {
      return lines[i].setAttributeNS(null, "class", a);
    });
    return lines;
  };

  var magnitude = function magnitude(v) {
    var sum = v.map(function (component) {
      return component * component;
    }).reduce(function (prev, curr) {
      return prev + curr;
    }, 0);
    return Math.sqrt(sum);
  };

  var normalize = function normalize(v) {
    var m = magnitude(v);
    return m === 0 ? v : v.map(function (c) {
      return c / m;
    });
  };

  var dot = function dot(a, b) {
    return a.map(function (_, i) {
      return a[i] * b[i];
    }).reduce(function (prev, curr) {
      return prev + curr;
    }, 0);
  };

  var average = function average() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var dimension = args.length > 0 ? args[0].length : 0;
    var sum = Array(dimension).fill(0);
    args.forEach(function (vec) {
      return sum.forEach(function (_, i) {
        sum[i] += vec[i] || 0;
      });
    });
    return sum.map(function (n) {
      return n / args.length;
    });
  };

  var cross2 = function cross2(a, b) {
    return [a[0] * b[1], a[1] * b[0]];
  };

  var cross3 = function cross3(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[0] * b[2] - a[2] * b[0], a[0] * b[1] - a[1] * b[0]];
  };

  var distance2 = function distance2(a, b) {
    var p = a[0] - b[0];
    var q = a[1] - b[1];
    return Math.sqrt(p * p + q * q);
  };

  var distance3 = function distance3(a, b) {
    var c = a[0] - b[0];
    var d = a[1] - b[1];
    var e = a[2] - b[2];
    return Math.sqrt(c * c + d * d + e * e);
  };

  var distance = function distance(a, b) {
    var dimension = a.length;
    var sum = 0;

    for (var i = 0; i < dimension; i += 1) {
      sum += Math.pow(a[i] - b[i], 2);
    }

    return Math.sqrt(sum);
  };

  var midpoint2 = function midpoint2(a, b) {
    return a.map(function (_, i) {
      return (a[i] + b[i]) / 2;
    });
  };

  var algebra = Object.freeze({
    __proto__: null,
    magnitude: magnitude,
    normalize: normalize,
    dot: dot,
    average: average,
    cross2: cross2,
    cross3: cross3,
    distance2: distance2,
    distance3: distance3,
    distance: distance,
    midpoint2: midpoint2
  });

  var multiply_matrix2_vector2 = function multiply_matrix2_vector2(matrix, vector) {
    return [matrix[0] * vector[0] + matrix[2] * vector[1] + matrix[4], matrix[1] * vector[0] + matrix[3] * vector[1] + matrix[5]];
  };

  var multiply_matrix2_line2 = function multiply_matrix2_line2(matrix, origin, vector) {
    return {
      origin: [matrix[0] * origin[0] + matrix[2] * origin[1] + matrix[4], matrix[1] * origin[0] + matrix[3] * origin[1] + matrix[5]],
      vector: [matrix[0] * vector[0] + matrix[2] * vector[1], matrix[1] * vector[0] + matrix[3] * vector[1]]
    };
  };

  var multiply_matrices2 = function multiply_matrices2(m1, m2) {
    return [m1[0] * m2[0] + m1[2] * m2[1], m1[1] * m2[0] + m1[3] * m2[1], m1[0] * m2[2] + m1[2] * m2[3], m1[1] * m2[2] + m1[3] * m2[3], m1[0] * m2[4] + m1[2] * m2[5] + m1[4], m1[1] * m2[4] + m1[3] * m2[5] + m1[5]];
  };

  var matrix2_determinant = function matrix2_determinant(m) {
    return m[0] * m[3] - m[1] * m[2];
  };

  var invert_matrix2 = function invert_matrix2(m) {
    var det = matrix2_determinant(m);

    if (Math.abs(det) < 1e-6 || isNaN(det) || !isFinite(m[4]) || !isFinite(m[5])) {
      return undefined;
    }

    return [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det, (m[2] * m[5] - m[3] * m[4]) / det, (m[1] * m[4] - m[0] * m[5]) / det];
  };

  var make_matrix2_translate = function make_matrix2_translate(x, y) {
    return [1, 0, 0, 1, x, y];
  };

  var make_matrix2_scale = function make_matrix2_scale(ratio) {
    var origin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0];
    return [ratio, 0, 0, ratio, ratio * -origin[0] + origin[0], ratio * -origin[1] + origin[1]];
  };

  var make_matrix2_rotate = function make_matrix2_rotate(angle) {
    var origin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0];
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    return [cos, sin, -sin, cos, origin[0], origin[1]];
  };

  var make_matrix2_reflection = function make_matrix2_reflection(vector) {
    var origin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0];
    var angle = Math.atan2(vector[1], vector[0]);
    var cosAngle = Math.cos(angle);
    var sinAngle = Math.sin(angle);
    var cos_Angle = Math.cos(-angle);
    var sin_Angle = Math.sin(-angle);
    var a = cosAngle * cos_Angle + sinAngle * sin_Angle;
    var b = cosAngle * -sin_Angle + sinAngle * cos_Angle;
    var c = sinAngle * cos_Angle + -cosAngle * sin_Angle;
    var d = sinAngle * -sin_Angle + -cosAngle * cos_Angle;
    var tx = origin[0] + a * -origin[0] + -origin[1] * c;
    var ty = origin[1] + b * -origin[0] + -origin[1] * d;
    return [a, b, c, d, tx, ty];
  };

  var matrix2_core = Object.freeze({
    __proto__: null,
    multiply_matrix2_vector2: multiply_matrix2_vector2,
    multiply_matrix2_line2: multiply_matrix2_line2,
    multiply_matrices2: multiply_matrices2,
    matrix2_determinant: matrix2_determinant,
    invert_matrix2: invert_matrix2,
    make_matrix2_translate: make_matrix2_translate,
    make_matrix2_scale: make_matrix2_scale,
    make_matrix2_rotate: make_matrix2_rotate,
    make_matrix2_reflection: make_matrix2_reflection
  });

  function _typeof$1(obj) {
    if (typeof Symbol === "function" && _typeof(Symbol.iterator) === "symbol") {
      _typeof$1 = function _typeof$1(obj) {
        return _typeof(obj);
      };
    } else {
      _typeof$1 = function _typeof$1(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof(obj);
      };
    }

    return _typeof$1(obj);
  }

  function _slicedToArray$1(arr, i) {
    return _arrayWithHoles$1(arr) || _iterableToArrayLimit$1(arr, i) || _nonIterableRest$1();
  }

  function _toConsumableArray$1(arr) {
    return _arrayWithoutHoles$1(arr) || _iterableToArray$1(arr) || _nonIterableSpread$1();
  }

  function _arrayWithoutHoles$1(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    }
  }

  function _arrayWithHoles$1(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray$1(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit$1(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread$1() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest$1() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  var multiply_matrix3_vector3 = function multiply_matrix3_vector3(m, vector) {
    return [m[0] * vector[0] + m[3] * vector[1] + m[6] * vector[2] + m[9], m[1] * vector[0] + m[4] * vector[1] + m[7] * vector[2] + m[10], m[2] * vector[0] + m[5] * vector[1] + m[8] * vector[2] + m[11]];
  };

  var multiply_matrix3_line3 = function multiply_matrix3_line3(m, origin, vector) {
    return {
      origin: [m[0] * origin[0] + m[3] * origin[1] + m[6] * origin[2] + m[9], m[1] * origin[0] + m[4] * origin[1] + m[7] * origin[2] + m[10], m[2] * origin[0] + m[5] * origin[1] + m[8] * origin[2] + m[11]],
      vector: [m[0] * vector[0] + m[3] * vector[1] + m[6] * vector[2], m[1] * vector[0] + m[4] * vector[1] + m[7] * vector[2], m[2] * vector[0] + m[5] * vector[1] + m[8] * vector[2]]
    };
  };

  var multiply_matrices3 = function multiply_matrices3(m1, m2) {
    return [m1[0] * m2[0] + m1[3] * m2[1] + m1[6] * m2[2], m1[1] * m2[0] + m1[4] * m2[1] + m1[7] * m2[2], m1[2] * m2[0] + m1[5] * m2[1] + m1[8] * m2[2], m1[0] * m2[3] + m1[3] * m2[4] + m1[6] * m2[5], m1[1] * m2[3] + m1[4] * m2[4] + m1[7] * m2[5], m1[2] * m2[3] + m1[5] * m2[4] + m1[8] * m2[5], m1[0] * m2[6] + m1[3] * m2[7] + m1[6] * m2[8], m1[1] * m2[6] + m1[4] * m2[7] + m1[7] * m2[8], m1[2] * m2[6] + m1[5] * m2[7] + m1[8] * m2[8], m1[0] * m2[9] + m1[3] * m2[10] + m1[6] * m2[11] + m1[9], m1[1] * m2[9] + m1[4] * m2[10] + m1[7] * m2[11] + m1[10], m1[2] * m2[9] + m1[5] * m2[10] + m1[8] * m2[11] + m1[11]];
  };

  var matrix3_determinant = function matrix3_determinant(m) {
    return m[0] * m[4] * m[8] - m[0] * m[7] * m[5] - m[3] * m[1] * m[8] + m[3] * m[7] * m[2] + m[6] * m[1] * m[5] - m[6] * m[4] * m[2];
  };

  var invert_matrix3 = function invert_matrix3(m) {
    var det = matrix3_determinant(m);

    if (Math.abs(det) < 1e-6 || isNaN(det) || !isFinite(m[9]) || !isFinite(m[10]) || !isFinite(m[11])) {
      return undefined;
    }

    var inv = [m[4] * m[8] - m[7] * m[5], -m[1] * m[8] + m[7] * m[2], m[1] * m[5] - m[4] * m[2], -m[3] * m[8] + m[6] * m[5], m[0] * m[8] - m[6] * m[2], -m[0] * m[5] + m[3] * m[2], m[3] * m[7] - m[6] * m[4], -m[0] * m[7] + m[6] * m[1], m[0] * m[4] - m[3] * m[1], -m[3] * m[7] * m[11] + m[3] * m[8] * m[10] + m[6] * m[4] * m[11] - m[6] * m[5] * m[10] - m[9] * m[4] * m[8] + m[9] * m[5] * m[7], m[0] * m[7] * m[11] - m[0] * m[8] * m[10] - m[6] * m[1] * m[11] + m[6] * m[2] * m[10] + m[9] * m[1] * m[8] - m[9] * m[2] * m[7], -m[0] * m[4] * m[11] + m[0] * m[5] * m[10] + m[3] * m[1] * m[11] - m[3] * m[2] * m[10] - m[9] * m[1] * m[5] + m[9] * m[2] * m[4]];
    var invDet = 1.0 / det;
    return inv.map(function (n) {
      return n * invDet;
    });
  };

  var make_matrix3_translate = function make_matrix3_translate() {
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    return [1, 0, 0, 0, 1, 0, 0, 0, 1, x, y, z];
  };

  var make_matrix3_rotateX = function make_matrix3_rotateX(angle) {
    var origin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0, 0];
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    return [1, 0, 0, 0, cos, sin, 0, -sin, cos, origin[0] || 0, origin[1] || 0, origin[2] || 0];
  };

  var make_matrix3_rotateY = function make_matrix3_rotateY(angle) {
    var origin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0, 0];
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    return [cos, 0, -sin, 0, 1, 0, sin, 0, cos, origin[0] || 0, origin[1] || 0, origin[2] || 0];
  };

  var make_matrix3_rotateZ = function make_matrix3_rotateZ(angle) {
    var origin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0, 0];
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    return [cos, sin, 0, -sin, cos, 0, 0, 0, 1, origin[0] || 0, origin[1] || 0, origin[2] || 0];
  };

  var make_matrix3_rotate = function make_matrix3_rotate(angle) {
    var vector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0, 1];
    var origin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0, 0];
    var vec = normalize(vector);
    var pos = Array.from(Array(3)).map(function (n, i) {
      return origin[i] || 0;
    });

    var _vec = _slicedToArray$1(vec, 3),
        a = _vec[0],
        b = _vec[1],
        c = _vec[2];

    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var d = Math.sqrt(vec[1] * vec[1] + vec[2] * vec[2]);
    var b_d = Math.abs(d) < 1e-6 ? 0 : b / d;
    var c_d = Math.abs(d) < 1e-6 ? 1 : c / d;
    var t = [1, 0, 0, 0, 1, 0, 0, 0, 1, pos[0], pos[1], pos[2]];
    var t_inv = [1, 0, 0, 0, 1, 0, 0, 0, 1, -pos[0], -pos[1], -pos[2]];
    var rx = [1, 0, 0, 0, c_d, b_d, 0, -b_d, c_d, 0, 0, 0];
    var rx_inv = [1, 0, 0, 0, c_d, -b_d, 0, b_d, c_d, 0, 0, 0];
    var ry = [d, 0, a, 0, 1, 0, -a, 0, d, 0, 0, 0];
    var ry_inv = [d, 0, -a, 0, 1, 0, a, 0, d, 0, 0, 0];
    var rz = [cos, sin, 0, -sin, cos, 0, 0, 0, 1, 0, 0, 0];
    return multiply_matrices3(t_inv, multiply_matrices3(rx_inv, multiply_matrices3(ry_inv, multiply_matrices3(rz, multiply_matrices3(ry, multiply_matrices3(rx, t))))));
  };

  var make_matrix3_scale = function make_matrix3_scale(scale) {
    var origin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0, 0];
    return [scale, 0, 0, 0, scale, 0, 0, 0, scale, scale * -origin[0] + origin[0], scale * -origin[1] + origin[1], scale * -origin[2] + origin[2]];
  };

  var make_matrix3_reflectionZ = function make_matrix3_reflectionZ(vector) {
    var origin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0];
    var angle = Math.atan2(vector[1], vector[0]);
    var cosAngle = Math.cos(angle);
    var sinAngle = Math.sin(angle);
    var cos_Angle = Math.cos(-angle);
    var sin_Angle = Math.sin(-angle);
    var a = cosAngle * cos_Angle + sinAngle * sin_Angle;
    var b = cosAngle * -sin_Angle + sinAngle * cos_Angle;
    var c = sinAngle * cos_Angle + -cosAngle * sin_Angle;
    var d = sinAngle * -sin_Angle + -cosAngle * cos_Angle;
    var tx = origin[0] + a * -origin[0] + -origin[1] * c;
    var ty = origin[1] + b * -origin[0] + -origin[1] * d;
    return [a, b, 0, c, d, 0, 0, 0, 0, tx, ty, 0];
  };

  var matrix3_core = Object.freeze({
    __proto__: null,
    multiply_matrix3_vector3: multiply_matrix3_vector3,
    multiply_matrix3_line3: multiply_matrix3_line3,
    multiply_matrices3: multiply_matrices3,
    matrix3_determinant: matrix3_determinant,
    invert_matrix3: invert_matrix3,
    make_matrix3_translate: make_matrix3_translate,
    make_matrix3_rotateX: make_matrix3_rotateX,
    make_matrix3_rotateY: make_matrix3_rotateY,
    make_matrix3_rotateZ: make_matrix3_rotateZ,
    make_matrix3_rotate: make_matrix3_rotate,
    make_matrix3_scale: make_matrix3_scale,
    make_matrix3_reflectionZ: make_matrix3_reflectionZ
  });

  var countPlaces = function countPlaces(num) {
    var m = "".concat(num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);

    if (!m) {
      return 0;
    }

    return Math.max(0, (m[1] ? m[1].length : 0) - (m[2] ? +m[2] : 0));
  };

  var clean_number = function clean_number(num) {
    var places = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 15;
    var crop = parseFloat(num.toFixed(places));

    if (countPlaces(crop) === Math.min(places, countPlaces(num))) {
      return num;
    }

    return crop;
  };

  var is_number = function is_number(n) {
    return n != null && !isNaN(n);
  };

  var is_vector = function is_vector(a) {
    return a != null && a[0] != null && !isNaN(a[0]);
  };

  var is_iterable = function is_iterable(obj) {
    return obj != null && typeof obj[Symbol.iterator] === "function";
  };

  var flatten_input = function flatten_input() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    switch (args.length) {
      case undefined:
      case 0:
        return args;

      case 1:
        return is_iterable(args[0]) && typeof args[0] !== "string" ? flatten_input.apply(void 0, _toConsumableArray$1(args[0])) : [args[0]];

      default:
        return Array.from(args).map(function (a) {
          return is_iterable(a) ? _toConsumableArray$1(flatten_input(a)) : a;
        }).reduce(function (a, b) {
          return a.concat(b);
        }, []);
    }
  };

  var semi_flatten_input = function semi_flatten_input() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var list = args;

    while (list.length === 1 && list[0].length) {
      var _list = list;

      var _list2 = _slicedToArray$1(_list, 1);

      list = _list2[0];
    }

    return list;
  };

  var get_vector = function get_vector() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    var list = flatten_input(args).filter(function (a) {
      return a !== undefined;
    });

    if (list === undefined) {
      return undefined;
    }

    if (list.length === 0) {
      return undefined;
    }

    if (!isNaN(list[0].x)) {
      list = ["x", "y", "z"].map(function (c) {
        return list[0][c];
      }).filter(function (a) {
        return a !== undefined;
      });
    }

    return list.filter(function (n) {
      return typeof n === "number";
    });
  };

  var get_vector_of_vectors = function get_vector_of_vectors() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    return semi_flatten_input(args).map(function (el) {
      return get_vector(el);
    });
  };

  var identity2 = [1, 0, 0, 1, 0, 0];

  var get_matrix2 = function get_matrix2() {
    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    var m = get_vector(args);

    if (m === undefined) {
      return undefined;
    }

    if (m.length === 6) {
      return m;
    }

    if (m.length > 6) {
      return [m[0], m[1], m[2], m[3], m[4], m[5]];
    }

    if (m.length < 6) {
      return identity2.map(function (n, i) {
        return m[i] || n;
      });
    }

    return undefined;
  };

  function get_segment() {
    for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
      args[_key7] = arguments[_key7];
    }

    return get_vector_of_vectors(args);
  }

  function get_line() {
    var params = Array.from(arguments);
    var numbers = params.filter(function (param) {
      return !isNaN(param);
    });
    var arrays = params.filter(function (param) {
      return param.constructor === Array;
    });

    if (params.length === 0) {
      return {
        vector: [],
        origin: []
      };
    }

    if (!isNaN(params[0]) && numbers.length >= 4) {
      return {
        origin: [params[0], params[1]],
        vector: [params[2], params[3]]
      };
    }

    if (arrays.length > 0) {
      if (arrays.length === 1) {
        return get_line.apply(void 0, _toConsumableArray$1(arrays[0]));
      }

      if (arrays.length === 2) {
        return {
          origin: [arrays[0][0], arrays[0][1]],
          vector: [arrays[1][0], arrays[1][1]]
        };
      }

      if (arrays.length === 4) {
        return {
          origin: [arrays[0], arrays[1]],
          vector: [arrays[2], arrays[3]]
        };
      }
    }

    if (params[0].constructor === Object) {
      var vector = [],
          origin = [];

      if (params[0].vector != null) {
        vector = get_vector(params[0].vector);
      } else if (params[0].direction != null) {
        vector = get_vector(params[0].direction);
      }

      if (params[0].point != null) {
        origin = get_vector(params[0].point);
      } else if (params[0].origin != null) {
        origin = get_vector(params[0].origin);
      }

      return {
        origin: origin,
        vector: vector
      };
    }

    return {
      origin: [],
      vector: []
    };
  }

  function get_ray() {
    return get_line.apply(void 0, arguments);
  }

  function get_two_vec2() {
    for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
      args[_key8] = arguments[_key8];
    }

    if (args.length === 0) {
      return undefined;
    }

    if (args.length === 1 && args[0] !== undefined) {
      return get_two_vec2.apply(void 0, _toConsumableArray$1(args[0]));
    }

    var params = Array.from(args);
    var numbers = params.filter(function (param) {
      return !isNaN(param);
    });
    var arrays = params.filter(function (o) {
      return _typeof$1(o) === "object";
    }).filter(function (param) {
      return param.constructor === Array;
    });

    if (numbers.length >= 4) {
      return [[numbers[0], numbers[1]], [numbers[2], numbers[3]]];
    }

    if (arrays.length >= 2 && !isNaN(arrays[0][0])) {
      return arrays;
    }

    if (arrays.length === 1 && !isNaN(arrays[0][0][0])) {
      return arrays[0];
    }

    return undefined;
  }

  function get_array_of_vec() {
    for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
      args[_key9] = arguments[_key9];
    }

    if (args.length === 0) {
      return undefined;
    }

    if (args.length === 1 && args[0] !== undefined) {
      return get_array_of_vec.apply(void 0, _toConsumableArray$1(args[0]));
    }

    return Array.from(args);
  }

  function get_array_of_vec2() {
    var params = Array.from(arguments);
    var arrays = params.filter(function (param) {
      return param.constructor === Array;
    });

    if (arrays.length >= 2 && !isNaN(arrays[0][0])) {
      return arrays;
    }

    if (arrays.length === 1 && arrays[0].length >= 1) {
      return arrays[0];
    }

    return params;
  }

  var EPSILON = 1e-6;

  var array_similarity_test = function array_similarity_test(list, compFunc) {
    return Array.from(Array(list.length - 1)).map(function (_, i) {
      return compFunc(list[0], list[i + 1]);
    }).reduce(function (a, b) {
      return a && b;
    }, true);
  };

  var equivalent_numbers = function equivalent_numbers() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length === 0) {
      return false;
    }

    if (args.length === 1 && args[0] !== undefined) {
      return equivalent_numbers.apply(void 0, _toConsumableArray$1(args[0]));
    }

    return array_similarity_test(args, function (a, b) {
      return Math.abs(a - b) < EPSILON;
    });
  };

  var equivalent_vectors = function equivalent_vectors() {
    var list = get_vector_of_vectors.apply(void 0, arguments);

    if (list.length === 0) {
      return false;
    }

    if (list.length === 1 && list[0] !== undefined) {
      return equivalent_vectors.apply(void 0, _toConsumableArray$1(list[0]));
    }

    var dimension = list[0].length;
    var dim_array = Array.from(Array(dimension));
    return Array.from(Array(list.length - 1)).map(function (element, i) {
      return dim_array.map(function (_, di) {
        return Math.abs(list[i][di] - list[i + 1][di]) < EPSILON;
      }).reduce(function (prev, curr) {
        return prev && curr;
      }, true);
    }).reduce(function (prev, curr) {
      return prev && curr;
    }, true) && Array.from(Array(list.length - 1)).map(function (_, i) {
      return list[0].length === list[i + 1].length;
    }).reduce(function (a, b) {
      return a && b;
    }, true);
  };

  var equivalent = function equivalent() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var list = semi_flatten_input(args);

    if (list.length < 1) {
      return false;
    }

    var typeofList = _typeof$1(list[0]);

    if (typeofList === "undefined") {
      return false;
    }

    if (list[0].constructor === Array) {
      list = list.map(function (el) {
        return semi_flatten_input(el);
      });
    }

    switch (typeofList) {
      case "number":
        return array_similarity_test(list, function (a, b) {
          return Math.abs(a - b) < EPSILON;
        });

      case "boolean":
        return array_similarity_test(list, function (a, b) {
          return a === b;
        });

      case "string":
        return array_similarity_test(list, function (a, b) {
          return a === b;
        });

      case "object":
        if (list[0].constructor === Array) {
          return equivalent_vectors.apply(void 0, _toConsumableArray$1(list));
        }

        console.warn("comparing array of objects for equivalency by slow JSON.stringify with no epsilon check");
        return array_similarity_test(list, function (a, b) {
          return JSON.stringify(a) === JSON.stringify(b);
        });

      default:
        console.warn("incapable of determining comparison method");
        break;
    }

    return false;
  };

  var equal = Object.freeze({
    __proto__: null,
    EPSILON: EPSILON,
    equivalent_numbers: equivalent_numbers,
    equivalent_vectors: equivalent_vectors,
    equivalent: equivalent
  });

  var overlap_function = function overlap_function(aPt, aVec, bPt, bVec, compFunc) {
    var det = function det(a, b) {
      return a[0] * b[1] - b[0] * a[1];
    };

    var denominator0 = det(aVec, bVec);
    var denominator1 = -denominator0;
    var numerator0 = det([bPt[0] - aPt[0], bPt[1] - aPt[1]], bVec);
    var numerator1 = det([aPt[0] - bPt[0], aPt[1] - bPt[1]], aVec);

    if (Math.abs(denominator0) < EPSILON) {
      return false;
    }

    var t0 = numerator0 / denominator0;
    var t1 = numerator1 / denominator1;
    return compFunc(t0, t1);
  };

  var segment_segment_comp = function segment_segment_comp(t0, t1) {
    return t0 >= -EPSILON && t0 <= 1 + EPSILON && t1 >= -EPSILON && t1 <= 1 + EPSILON;
  };

  var segment_segment_overlap = function segment_segment_overlap(a0, a1, b0, b1) {
    var aVec = [a1[0] - a0[0], a1[1] - a0[1]];
    var bVec = [b1[0] - b0[0], b1[1] - b0[1]];
    return overlap_function(a0, aVec, b0, bVec, segment_segment_comp);
  };

  var degenerate = function degenerate(v) {
    return Math.abs(v.reduce(function (a, b) {
      return a + b;
    }, 0)) < EPSILON;
  };

  var parallel = function parallel(a, b) {
    return 1 - Math.abs(dot(normalize(a), normalize(b))) < EPSILON;
  };

  var point_on_line = function point_on_line(linePoint, lineVector, point) {
    var epsilon = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : EPSILON;
    var pointPoint = [point[0] - linePoint[0], point[1] - linePoint[1]];
    var cross = pointPoint[0] * lineVector[1] - pointPoint[1] * lineVector[0];
    return Math.abs(cross) < epsilon;
  };

  var point_on_segment = function point_on_segment(seg0, seg1, point) {
    var epsilon = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : EPSILON;
    var seg0_1 = [seg0[0] - seg1[0], seg0[1] - seg1[1]];
    var seg0_p = [seg0[0] - point[0], seg0[1] - point[1]];
    var seg1_p = [seg1[0] - point[0], seg1[1] - point[1]];
    var dEdge = Math.sqrt(seg0_1[0] * seg0_1[0] + seg0_1[1] * seg0_1[1]);
    var dP0 = Math.sqrt(seg0_p[0] * seg0_p[0] + seg0_p[1] * seg0_p[1]);
    var dP1 = Math.sqrt(seg1_p[0] * seg1_p[0] + seg1_p[1] * seg1_p[1]);
    return Math.abs(dEdge - dP0 - dP1) < epsilon;
  };

  var point_in_poly = function point_in_poly(point, poly) {
    var isInside = false;

    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      if (poly[i][1] > point[1] != poly[j][1] > point[1] && point[0] < (poly[j][0] - poly[i][0]) * (point[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0]) {
        isInside = !isInside;
      }
    }

    return isInside;
  };

  var point_in_convex_poly = function point_in_convex_poly(point, poly) {
    var epsilon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EPSILON;

    if (poly == null || !(poly.length > 0)) {
      return false;
    }

    return poly.map(function (p, i, arr) {
      var nextP = arr[(i + 1) % arr.length];
      var a = [nextP[0] - p[0], nextP[1] - p[1]];
      var b = [point[0] - p[0], point[1] - p[1]];
      return a[0] * b[1] - a[1] * b[0] > -epsilon;
    }).map(function (s, i, arr) {
      return s === arr[0];
    }).reduce(function (prev, curr) {
      return prev && curr;
    }, true);
  };

  var point_in_convex_poly_exclusive = function point_in_convex_poly_exclusive(point, poly) {
    var epsilon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EPSILON;

    if (poly == null || !(poly.length > 0)) {
      return false;
    }

    return poly.map(function (p, i, arr) {
      var nextP = arr[(i + 1) % arr.length];
      var a = [nextP[0] - p[0], nextP[1] - p[1]];
      var b = [point[0] - p[0], point[1] - p[1]];
      return a[0] * b[1] - a[1] * b[0] > epsilon;
    }).map(function (s, i, arr) {
      return s === arr[0];
    }).reduce(function (prev, curr) {
      return prev && curr;
    }, true);
  };

  var convex_polygons_overlap = function convex_polygons_overlap(ps1, ps2) {
    var e1 = ps1.map(function (p, i, arr) {
      return [p, arr[(i + 1) % arr.length]];
    });
    var e2 = ps2.map(function (p, i, arr) {
      return [p, arr[(i + 1) % arr.length]];
    });

    for (var i = 0; i < e1.length; i += 1) {
      for (var j = 0; j < e2.length; j += 1) {
        if (segment_segment_overlap(e1[i][0], e1[i][1], e2[j][0], e2[j][1])) {
          return true;
        }
      }
    }

    if (point_in_poly(ps2[0], ps1)) {
      return true;
    }

    if (point_in_poly(ps1[0], ps2)) {
      return true;
    }

    return false;
  };

  var convex_polygon_is_enclosed = function convex_polygon_is_enclosed(inner, outer) {
    var goesInside = outer.map(function (p) {
      return point_in_convex_poly(p, inner);
    }).reduce(function (a, b) {
      return a || b;
    }, false);

    if (goesInside) {
      return false;
    }

    return undefined;
  };

  var convex_polygons_enclose = function convex_polygons_enclose(inner, outer) {
    var outerGoesInside = outer.map(function (p) {
      return point_in_convex_poly(p, inner);
    }).reduce(function (a, b) {
      return a || b;
    }, false);
    var innerGoesOutside = inner.map(function (p) {
      return point_in_convex_poly(p, inner);
    }).reduce(function (a, b) {
      return a && b;
    }, true);
    return !outerGoesInside && innerGoesOutside;
  };

  var is_counter_clockwise_between = function is_counter_clockwise_between(angle, angleA, angleB) {
    while (angleB < angleA) {
      angleB += Math.PI * 2;
    }

    while (angle < angleA) {
      angle += Math.PI * 2;
    }

    return angle < angleB;
  };

  var query = Object.freeze({
    __proto__: null,
    overlap_function: overlap_function,
    segment_segment_overlap: segment_segment_overlap,
    degenerate: degenerate,
    parallel: parallel,
    point_on_line: point_on_line,
    point_on_segment: point_on_segment,
    point_in_poly: point_in_poly,
    point_in_convex_poly: point_in_convex_poly,
    point_in_convex_poly_exclusive: point_in_convex_poly_exclusive,
    convex_polygons_overlap: convex_polygons_overlap,
    convex_polygon_is_enclosed: convex_polygon_is_enclosed,
    convex_polygons_enclose: convex_polygons_enclose,
    is_counter_clockwise_between: is_counter_clockwise_between
  });

  var line_line_comp = function line_line_comp() {
    return true;
  };

  var line_ray_comp = function line_ray_comp(t0, t1) {
    return t1 >= -EPSILON;
  };

  var line_segment_comp = function line_segment_comp(t0, t1) {
    return t1 >= -EPSILON && t1 <= 1 + EPSILON;
  };

  var ray_ray_comp = function ray_ray_comp(t0, t1) {
    return t0 >= -EPSILON && t1 >= -EPSILON;
  };

  var ray_segment_comp = function ray_segment_comp(t0, t1) {
    return t0 >= -EPSILON && t1 >= -EPSILON && t1 <= 1 + EPSILON;
  };

  var segment_segment_comp$1 = function segment_segment_comp(t0, t1) {
    return t0 >= -EPSILON && t0 <= 1 + EPSILON && t1 >= -EPSILON && t1 <= 1 + EPSILON;
  };

  var line_ray_comp_exclusive = function line_ray_comp_exclusive(t0, t1) {
    return t1 > EPSILON;
  };

  var line_segment_comp_exclusive = function line_segment_comp_exclusive(t0, t1) {
    return t1 > EPSILON && t1 < 1 - EPSILON;
  };

  var ray_ray_comp_exclusive = function ray_ray_comp_exclusive(t0, t1) {
    return t0 > EPSILON && t1 > EPSILON;
  };

  var ray_segment_comp_exclusive = function ray_segment_comp_exclusive(t0, t1) {
    return t0 > EPSILON && t1 > EPSILON && t1 < 1 - EPSILON;
  };

  var segment_segment_comp_exclusive = function segment_segment_comp_exclusive(t0, t1) {
    return t0 > EPSILON && t0 < 1 - EPSILON && t1 > EPSILON && t1 < 1 - EPSILON;
  };

  var limit_line = function limit_line(dist) {
    return dist;
  };

  var limit_ray = function limit_ray(dist) {
    return dist < -EPSILON ? 0 : dist;
  };

  var limit_segment = function limit_segment(dist) {
    if (dist < -EPSILON) {
      return 0;
    }

    if (dist > 1 + EPSILON) {
      return 1;
    }

    return dist;
  };

  var intersection_function = function intersection_function(aPt, aVec, bPt, bVec, compFunc) {
    var epsilon = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : EPSILON;

    function det(a, b) {
      return a[0] * b[1] - b[0] * a[1];
    }

    var denominator0 = det(aVec, bVec);

    if (Math.abs(denominator0) < epsilon) {
      return undefined;
    }

    var denominator1 = -denominator0;
    var numerator0 = det([bPt[0] - aPt[0], bPt[1] - aPt[1]], bVec);
    var numerator1 = det([aPt[0] - bPt[0], aPt[1] - bPt[1]], aVec);
    var t0 = numerator0 / denominator0;
    var t1 = numerator1 / denominator1;

    if (compFunc(t0, t1, epsilon)) {
      return [aPt[0] + aVec[0] * t0, aPt[1] + aVec[1] * t0];
    }

    return undefined;
  };

  var line_line = function line_line(aPt, aVec, bPt, bVec, epsilon) {
    return intersection_function(aPt, aVec, bPt, bVec, line_line_comp, epsilon);
  };

  var line_ray = function line_ray(linePt, lineVec, rayPt, rayVec, epsilon) {
    return intersection_function(linePt, lineVec, rayPt, rayVec, line_ray_comp, epsilon);
  };

  var line_segment = function line_segment(origin, vec, segment0, segment1, epsilon) {
    var segmentVec = [segment1[0] - segment0[0], segment1[1] - segment0[1]];
    return intersection_function(origin, vec, segment0, segmentVec, line_segment_comp, epsilon);
  };

  var ray_ray = function ray_ray(aPt, aVec, bPt, bVec, epsilon) {
    return intersection_function(aPt, aVec, bPt, bVec, ray_ray_comp, epsilon);
  };

  var ray_segment = function ray_segment(rayPt, rayVec, segment0, segment1, epsilon) {
    var segmentVec = [segment1[0] - segment0[0], segment1[1] - segment0[1]];
    return intersection_function(rayPt, rayVec, segment0, segmentVec, ray_segment_comp, epsilon);
  };

  var segment_segment = function segment_segment(a0, a1, b0, b1, epsilon) {
    var aVec = [a1[0] - a0[0], a1[1] - a0[1]];
    var bVec = [b1[0] - b0[0], b1[1] - b0[1]];
    return intersection_function(a0, aVec, b0, bVec, segment_segment_comp$1, epsilon);
  };

  var line_ray_exclusive = function line_ray_exclusive(linePt, lineVec, rayPt, rayVec, epsilon) {
    return intersection_function(linePt, lineVec, rayPt, rayVec, line_ray_comp_exclusive, epsilon);
  };

  var line_segment_exclusive = function line_segment_exclusive(origin, vec, segment0, segment1, epsilon) {
    var segmentVec = [segment1[0] - segment0[0], segment1[1] - segment0[1]];
    return intersection_function(origin, vec, segment0, segmentVec, line_segment_comp_exclusive, epsilon);
  };

  var ray_ray_exclusive = function ray_ray_exclusive(aPt, aVec, bPt, bVec, epsilon) {
    return intersection_function(aPt, aVec, bPt, bVec, ray_ray_comp_exclusive, epsilon);
  };

  var ray_segment_exclusive = function ray_segment_exclusive(rayPt, rayVec, segment0, segment1, epsilon) {
    var segmentVec = [segment1[0] - segment0[0], segment1[1] - segment0[1]];
    return intersection_function(rayPt, rayVec, segment0, segmentVec, ray_segment_comp_exclusive, epsilon);
  };

  var segment_segment_exclusive = function segment_segment_exclusive(a0, a1, b0, b1, epsilon) {
    var aVec = [a1[0] - a0[0], a1[1] - a0[1]];
    var bVec = [b1[0] - b0[0], b1[1] - b0[1]];
    return intersection_function(a0, aVec, b0, bVec, segment_segment_comp_exclusive, epsilon);
  };

  var circle_line = function circle_line(center, radius, p0, p1) {
    var epsilon = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : EPSILON;
    var x1 = p0[0] - center[0];
    var y1 = p0[1] - center[1];
    var x2 = p1[0] - center[0];
    var y2 = p1[1] - center[1];
    var dx = x2 - x1;
    var dy = y2 - y1;
    var det = x1 * y2 - x2 * y1;
    var det_sq = det * det;
    var r_sq = radius * radius;
    var dr_sq = Math.abs(dx * dx + dy * dy);
    var delta = r_sq * dr_sq - det_sq;

    if (delta < -epsilon) {
      return undefined;
    }

    var suffix = Math.sqrt(r_sq * dr_sq - det_sq);

    function sgn(x) {
      return x < -epsilon ? -1 : 1;
    }

    var solutionA = [center[0] + (det * dy + sgn(dy) * dx * suffix) / dr_sq, center[1] + (-det * dx + Math.abs(dy) * suffix) / dr_sq];

    if (delta > epsilon) {
      var solutionB = [center[0] + (det * dy - sgn(dy) * dx * suffix) / dr_sq, center[1] + (-det * dx - Math.abs(dy) * suffix) / dr_sq];
      return [solutionA, solutionB];
    }

    return [solutionA];
  };

  var circle_ray = function circle_ray(center, radius, p0, p1) {
    throw "circle_ray has not been written yet";
  };

  var circle_segment = function circle_segment(center, radius, p0, p1) {
    var r_squared = Math.pow(radius, 2);
    var x1 = p0[0] - center[0];
    var y1 = p0[1] - center[1];
    var x2 = p1[0] - center[0];
    var y2 = p1[1] - center[1];
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dr_squared = dx * dx + dy * dy;
    var D = x1 * y2 - x2 * y1;

    function sgn(x) {
      if (x < 0) {
        return -1;
      }

      return 1;
    }

    var x_1 = (D * dy + sgn(dy) * dx * Math.sqrt(r_squared * dr_squared - D * D)) / dr_squared;
    var x_2 = (D * dy - sgn(dy) * dx * Math.sqrt(r_squared * dr_squared - D * D)) / dr_squared;
    var y_1 = (-D * dx + Math.abs(dy) * Math.sqrt(r_squared * dr_squared - D * D)) / dr_squared;
    var y_2 = (-D * dx - Math.abs(dy) * Math.sqrt(r_squared * dr_squared - D * D)) / dr_squared;
    var x1_NaN = isNaN(x_1);
    var x2_NaN = isNaN(x_2);

    if (!x1_NaN && !x2_NaN) {
      return [[x_1 + center[0], y_1 + center[1]], [x_2 + center[0], y_2 + center[1]]];
    }

    if (x1_NaN && x2_NaN) {
      return undefined;
    }

    if (!x1_NaN) {
      return [[x_1 + center[0], y_1 + center[1]]];
    }

    if (!x2_NaN) {
      return [[x_2 + center[0], y_2 + center[1]]];
    }

    return undefined;
  };

  var quick_equivalent_2 = function quick_equivalent_2(a, b) {
    return Math.abs(a[0] - b[0]) < EPSILON && Math.abs(a[1] - b[1]) < EPSILON;
  };

  var convex_poly_line = function convex_poly_line(poly, linePoint, lineVector) {
    var intersections = poly.map(function (p, i, arr) {
      return [p, arr[(i + 1) % arr.length]];
    }).map(function (el) {
      return line_segment(linePoint, lineVector, el[0], el[1]);
    }).filter(function (el) {
      return el != null;
    });

    switch (intersections.length) {
      case 0:
        return undefined;

      case 1:
        return [intersections[0], intersections[0]];

      case 2:
        return intersections;

      default:
        for (var i = 1; i < intersections.length; i += 1) {
          if (!quick_equivalent_2(intersections[0], intersections[i])) {
            return [intersections[0], intersections[i]];
          }
        }

        return undefined;
    }
  };

  var convex_poly_ray = function convex_poly_ray(poly, linePoint, lineVector) {
    var intersections = poly.map(function (p, i, arr) {
      return [p, arr[(i + 1) % arr.length]];
    }).map(function (el) {
      return ray_segment(linePoint, lineVector, el[0], el[1]);
    }).filter(function (el) {
      return el != null;
    });

    switch (intersections.length) {
      case 0:
        return undefined;

      case 1:
        return [linePoint, intersections[0]];

      case 2:
        return intersections;

      default:
        for (var i = 1; i < intersections.length; i += 1) {
          if (!quick_equivalent_2(intersections[0], intersections[i])) {
            return [intersections[0], intersections[i]];
          }
        }

        return undefined;
    }
  };

  var convex_poly_segment = function convex_poly_segment(poly, segmentA, segmentB) {
    var intersections = poly.map(function (p, i, arr) {
      return [p, arr[(i + 1) % arr.length]];
    }).map(function (el) {
      return segment_segment_exclusive(segmentA, segmentB, el[0], el[1]);
    }).filter(function (el) {
      return el != null;
    });
    var aInsideExclusive = point_in_convex_poly_exclusive(segmentA, poly);
    var bInsideExclusive = point_in_convex_poly_exclusive(segmentB, poly);
    var aInsideInclusive = point_in_convex_poly(segmentA, poly);
    var bInsideInclusive = point_in_convex_poly(segmentB, poly);

    if (intersections.length === 0 && (aInsideExclusive || bInsideExclusive)) {
      return [segmentA, segmentB];
    }

    if (intersections.length === 0 && aInsideInclusive && bInsideInclusive) {
      return [segmentA, segmentB];
    }

    switch (intersections.length) {
      case 0:
        return aInsideExclusive ? [_toConsumableArray$1(segmentA), _toConsumableArray$1(segmentB)] : undefined;

      case 1:
        return aInsideInclusive ? [_toConsumableArray$1(segmentA), intersections[0]] : [_toConsumableArray$1(segmentB), intersections[0]];

      case 2:
        return intersections;

      default:
        throw new Error("clipping segment in a convex polygon resulting in 3 or more points");
    }
  };

  var convex_poly_ray_exclusive = function convex_poly_ray_exclusive(poly, linePoint, lineVector) {
    var intersections = poly.map(function (p, i, arr) {
      return [p, arr[(i + 1) % arr.length]];
    }).map(function (el) {
      return ray_segment_exclusive(linePoint, lineVector, el[0], el[1]);
    }).filter(function (el) {
      return el != null;
    });

    switch (intersections.length) {
      case 0:
        return undefined;

      case 1:
        return [linePoint, intersections[0]];

      case 2:
        return intersections;

      default:
        for (var i = 1; i < intersections.length; i += 1) {
          if (!quick_equivalent_2(intersections[0], intersections[i])) {
            return [intersections[0], intersections[i]];
          }
        }

        return undefined;
    }
  };

  var intersection = Object.freeze({
    __proto__: null,
    limit_line: limit_line,
    limit_ray: limit_ray,
    limit_segment: limit_segment,
    intersection_function: intersection_function,
    line_line: line_line,
    line_ray: line_ray,
    line_segment: line_segment,
    ray_ray: ray_ray,
    ray_segment: ray_segment,
    segment_segment: segment_segment,
    line_ray_exclusive: line_ray_exclusive,
    line_segment_exclusive: line_segment_exclusive,
    ray_ray_exclusive: ray_ray_exclusive,
    ray_segment_exclusive: ray_segment_exclusive,
    segment_segment_exclusive: segment_segment_exclusive,
    circle_line: circle_line,
    circle_ray: circle_ray,
    circle_segment: circle_segment,
    convex_poly_line: convex_poly_line,
    convex_poly_ray: convex_poly_ray,
    convex_poly_segment: convex_poly_segment,
    convex_poly_ray_exclusive: convex_poly_ray_exclusive
  });

  var clockwise_angle2_radians = function clockwise_angle2_radians(a, b) {
    while (a < 0) {
      a += Math.PI * 2;
    }

    while (b < 0) {
      b += Math.PI * 2;
    }

    var a_b = a - b;
    return a_b >= 0 ? a_b : Math.PI * 2 - (b - a);
  };

  var counter_clockwise_angle2_radians = function counter_clockwise_angle2_radians(a, b) {
    while (a < 0) {
      a += Math.PI * 2;
    }

    while (b < 0) {
      b += Math.PI * 2;
    }

    var b_a = b - a;
    return b_a >= 0 ? b_a : Math.PI * 2 - (a - b);
  };

  var clockwise_angle2 = function clockwise_angle2(a, b) {
    var dotProduct = b[0] * a[0] + b[1] * a[1];
    var determinant = b[0] * a[1] - b[1] * a[0];
    var angle = Math.atan2(determinant, dotProduct);

    if (angle < 0) {
      angle += Math.PI * 2;
    }

    return angle;
  };

  var counter_clockwise_angle2 = function counter_clockwise_angle2(a, b) {
    var dotProduct = a[0] * b[0] + a[1] * b[1];
    var determinant = a[0] * b[1] - a[1] * b[0];
    var angle = Math.atan2(determinant, dotProduct);

    if (angle < 0) {
      angle += Math.PI * 2;
    }

    return angle;
  };

  var counter_clockwise_vector_order = function counter_clockwise_vector_order() {
    for (var _len = arguments.length, vectors = new Array(_len), _key = 0; _key < _len; _key++) {
      vectors[_key] = arguments[_key];
    }

    var vectors_radians = vectors.map(function (v) {
      return Math.atan2(v[1], v[0]);
    });
    var counter_clockwise = Array.from(Array(vectors_radians.length)).map(function (_, i) {
      return i;
    }).sort(function (a, b) {
      return vectors_radians[a] - vectors_radians[b];
    });
    return counter_clockwise.slice(counter_clockwise.indexOf(0), counter_clockwise.length).concat(counter_clockwise.slice(0, counter_clockwise.indexOf(0)));
  };

  var interior_angles2 = function interior_angles2(a, b) {
    var interior1 = counter_clockwise_angle2(a, b);
    var interior2 = Math.PI * 2 - interior1;
    return [interior1, interior2];
  };

  var interior_angles = function interior_angles() {
    for (var _len2 = arguments.length, vectors = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      vectors[_key2] = arguments[_key2];
    }

    return vectors.map(function (v, i, ar) {
      return counter_clockwise_angle2(v, ar[(i + 1) % ar.length]);
    });
  };

  var bisect_vectors = function bisect_vectors(a, b) {
    var aV = normalize(a);
    var bV = normalize(b);
    var sum = aV.map(function (_, i) {
      return aV[i] + bV[i];
    });
    var vecA = normalize(sum);
    var vecB = aV.map(function (_, i) {
      return -aV[i] + -bV[i];
    });
    return [vecA, normalize(vecB)];
  };

  var bisect_lines2 = function bisect_lines2(pointA, vectorA, pointB, vectorB) {
    var denominator = vectorA[0] * vectorB[1] - vectorB[0] * vectorA[1];

    if (Math.abs(denominator) < EPSILON) {
      var solution = [midpoint2(pointA, pointB), [vectorA[0], vectorA[1]]];
      var array = [solution, solution];
      var dot = vectorA[0] * vectorB[0] + vectorA[1] * vectorB[1];
      delete array[dot > 0 ? 1 : 0];
      return array;
    }

    var numerator = (pointB[0] - pointA[0]) * vectorB[1] - vectorB[0] * (pointB[1] - pointA[1]);
    var t = numerator / denominator;
    var x = pointA[0] + vectorA[0] * t;
    var y = pointA[1] + vectorA[1] * t;
    var bisects = bisect_vectors(vectorA, vectorB);
    bisects[1] = [bisects[1][1], -bisects[1][0]];
    return bisects.map(function (el) {
      return [[x, y], el];
    });
  };

  var subsect_radians = function subsect_radians(divisions, angleA, angleB) {
    var angle = counter_clockwise_angle2(angleA, angleB) / divisions;
    return Array.from(Array(divisions - 1)).map(function (_, i) {
      return angleA + angle * i;
    });
  };

  var subsect = function subsect(divisions, vectorA, vectorB) {
    var angleA = Math.atan2(vectorA[1], vectorA[0]);
    var angleB = Math.atan2(vectorB[1], vectorB[0]);
    return subsect_radians(divisions, angleA, angleB).map(function (rad) {
      return [Math.cos(rad), Math.sin(rad)];
    });
  };

  var signed_area = function signed_area(points) {
    return 0.5 * points.map(function (el, i, arr) {
      var next = arr[(i + 1) % arr.length];
      return el[0] * next[1] - next[0] * el[1];
    }).reduce(function (a, b) {
      return a + b;
    }, 0);
  };

  var centroid = function centroid(points) {
    var sixthArea = 1 / (6 * signed_area(points));
    return points.map(function (el, i, arr) {
      var next = arr[(i + 1) % arr.length];
      var mag = el[0] * next[1] - next[0] * el[1];
      return [(el[0] + next[0]) * mag, (el[1] + next[1]) * mag];
    }).reduce(function (a, b) {
      return [a[0] + b[0], a[1] + b[1]];
    }, [0, 0]).map(function (c) {
      return c * sixthArea;
    });
  };

  var enclosing_rectangle = function enclosing_rectangle(points) {
    var l = points[0].length;
    var mins = Array.from(Array(l)).map(function () {
      return Infinity;
    });
    var maxs = Array.from(Array(l)).map(function () {
      return -Infinity;
    });
    points.forEach(function (point) {
      return point.forEach(function (c, i) {
        if (c < mins[i]) {
          mins[i] = c;
        }

        if (c > maxs[i]) {
          maxs[i] = c;
        }
      });
    });
    var lengths = maxs.map(function (max, i) {
      return max - mins[i];
    });
    return [mins, lengths];
  };

  var make_regular_polygon = function make_regular_polygon(sides) {
    var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var radius = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
    var halfwedge = 2 * Math.PI / sides * 0.5;
    var r = radius / Math.cos(halfwedge);
    return Array.from(Array(Math.floor(sides))).map(function (_, i) {
      var a = -2 * Math.PI * i / sides + halfwedge;
      var px = clean_number(x + r * Math.sin(a), 14);
      var py = clean_number(y + r * Math.cos(a), 14);
      return [px, py];
    });
  };

  var smallest_comparison_search = function smallest_comparison_search(obj, array, compare_func) {
    var objs = array.map(function (o, i) {
      return {
        o: o,
        i: i,
        d: compare_func(obj, o)
      };
    });
    var index;
    var smallest_value = Infinity;

    for (var i = 0; i < objs.length; i += 1) {
      if (objs[i].d < smallest_value) {
        index = i;
        smallest_value = objs[i].d;
      }
    }

    return index;
  };

  var nearest_point2 = function nearest_point2(point, array_of_points) {
    var index = smallest_comparison_search(point, array_of_points, distance2);
    return index === undefined ? undefined : array_of_points[index];
  };

  var nearest_point = function nearest_point(point, array_of_points) {
    var index = smallest_comparison_search(point, array_of_points, distance);
    return index === undefined ? undefined : array_of_points[index];
  };

  var nearest_point_on_line = function nearest_point_on_line(linePoint, lineVec, point, limiterFunc) {
    var epsilon = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : EPSILON;
    var magSquared = Math.pow(lineVec[0], 2) + Math.pow(lineVec[1], 2);
    var vectorToPoint = [0, 1].map(function (_, i) {
      return point[i] - linePoint[i];
    });
    var dot = [0, 1].map(function (_, i) {
      return lineVec[i] * vectorToPoint[i];
    }).reduce(function (a, b) {
      return a + b;
    }, 0);
    var dist = dot / magSquared;
    var d = limiterFunc(dist, epsilon);
    return [0, 1].map(function (_, i) {
      return linePoint[i] + lineVec[i] * d;
    });
  };

  var split_polygon = function split_polygon(poly, linePoint, lineVector) {
    var vertices_intersections = poly.map(function (v, i) {
      var intersection = point_on_line(linePoint, lineVector, v);
      return {
        type: "v",
        point: intersection ? v : null,
        at_index: i
      };
    }).filter(function (el) {
      return el.point != null;
    });
    var edges_intersections = poly.map(function (v, i, arr) {
      var intersection = line_segment_exclusive(linePoint, lineVector, v, arr[(i + 1) % arr.length]);
      return {
        type: "e",
        point: intersection,
        at_index: i
      };
    }).filter(function (el) {
      return el.point != null;
    });
    var sorted = vertices_intersections.concat(edges_intersections).sort(function (a, b) {
      return Math.abs(a.point[0] - b.point[0]) < EPSILON ? a.point[1] - b.point[1] : a.point[0] - b.point[0];
    });
    console.log(sorted);
    return poly;
  };

  var split_convex_polygon = function split_convex_polygon(poly, linePoint, lineVector) {
    var vertices_intersections = poly.map(function (v, i) {
      var intersection = point_on_line(linePoint, lineVector, v);
      return {
        point: intersection ? v : null,
        at_index: i
      };
    }).filter(function (el) {
      return el.point != null;
    });
    var edges_intersections = poly.map(function (v, i, arr) {
      var intersection = line_segment_exclusive(linePoint, lineVector, v, arr[(i + 1) % arr.length]);
      return {
        point: intersection,
        at_index: i
      };
    }).filter(function (el) {
      return el.point != null;
    });

    if (edges_intersections.length == 2) {
      var sorted_edges = edges_intersections.slice().sort(function (a, b) {
        return a.at_index - b.at_index;
      });
      var face_a = poly.slice(sorted_edges[1].at_index + 1).concat(poly.slice(0, sorted_edges[0].at_index + 1));
      face_a.push(sorted_edges[0].point);
      face_a.push(sorted_edges[1].point);
      var face_b = poly.slice(sorted_edges[0].at_index + 1, sorted_edges[1].at_index + 1);
      face_b.push(sorted_edges[1].point);
      face_b.push(sorted_edges[0].point);
      return [face_a, face_b];
    } else if (edges_intersections.length == 1 && vertices_intersections.length == 1) {
      vertices_intersections[0]["type"] = "v";
      edges_intersections[0]["type"] = "e";
      var sorted_geom = vertices_intersections.concat(edges_intersections).sort(function (a, b) {
        return a.at_index - b.at_index;
      });

      var _face_a = poly.slice(sorted_geom[1].at_index + 1).concat(poly.slice(0, sorted_geom[0].at_index + 1));

      if (sorted_geom[0].type === "e") {
        _face_a.push(sorted_geom[0].point);
      }

      _face_a.push(sorted_geom[1].point);

      var _face_b = poly.slice(sorted_geom[0].at_index + 1, sorted_geom[1].at_index + 1);

      if (sorted_geom[1].type === "e") {
        _face_b.push(sorted_geom[1].point);
      }

      _face_b.push(sorted_geom[0].point);

      return [_face_a, _face_b];
    } else if (vertices_intersections.length == 2) {
      var sorted_vertices = vertices_intersections.slice().sort(function (a, b) {
        return a.at_index - b.at_index;
      });

      var _face_a2 = poly.slice(sorted_vertices[1].at_index).concat(poly.slice(0, sorted_vertices[0].at_index + 1));

      var _face_b2 = poly.slice(sorted_vertices[0].at_index, sorted_vertices[1].at_index + 1);

      return [_face_a2, _face_b2];
    }

    return [poly.slice()];
  };

  var convex_hull = function convex_hull(points) {
    var epsilon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EPSILON;
    var INFINITE_LOOP = 10000;
    var sorted = points.slice().sort(function (a, b) {
      return Math.abs(a[1] - b[1]) < epsilon ? a[0] - b[0] : a[1] - b[1];
    });
    var hull = [];
    hull.push(sorted[0]);
    var ang = 0;
    var infiniteLoop = 0;

    var _loop = function _loop() {
      infiniteLoop += 1;
      var h = hull.length - 1;
      var angles = sorted.filter(function (el) {
        return !(Math.abs(el[0] - hull[h][0]) < epsilon && Math.abs(el[1] - hull[h][1]) < epsilon);
      }).map(function (el) {
        var angle = Math.atan2(hull[h][1] - el[1], hull[h][0] - el[0]);

        while (angle < ang) {
          angle += Math.PI * 2;
        }

        return {
          node: el,
          angle: angle,
          distance: undefined
        };
      }).sort(function (a, b) {
        return a.angle < b.angle ? -1 : a.angle > b.angle ? 1 : 0;
      });

      if (angles.length === 0) {
        return {
          v: undefined
        };
      }

      var rightTurn = angles[0];
      angles = angles.filter(function (el) {
        return Math.abs(rightTurn.angle - el.angle) < epsilon;
      }).map(function (el) {
        var distance = Math.sqrt(Math.pow(hull[h][0] - el.node[0], 2) + Math.pow(hull[h][1] - el.node[1], 2));
        el.distance = distance;
        return el;
      }).sort(function (a, b) {
        return a.distance < b.distance ? 1 : a.distance > b.distance ? -1 : 0;
      });

      if (hull.filter(function (el) {
        return el === angles[0].node;
      }).length > 0) {
        return {
          v: hull
        };
      }

      hull.push(angles[0].node);
      ang = Math.atan2(hull[h][1] - angles[0].node[1], hull[h][0] - angles[0].node[0]);
    };

    do {
      var _ret = _loop();

      if (_typeof$1(_ret) === "object") return _ret.v;
    } while (infiniteLoop < INFINITE_LOOP);

    return undefined;
  };

  var geometry = Object.freeze({
    __proto__: null,
    clockwise_angle2_radians: clockwise_angle2_radians,
    counter_clockwise_angle2_radians: counter_clockwise_angle2_radians,
    clockwise_angle2: clockwise_angle2,
    counter_clockwise_angle2: counter_clockwise_angle2,
    counter_clockwise_vector_order: counter_clockwise_vector_order,
    interior_angles2: interior_angles2,
    interior_angles: interior_angles,
    bisect_vectors: bisect_vectors,
    bisect_lines2: bisect_lines2,
    subsect_radians: subsect_radians,
    subsect: subsect,
    signed_area: signed_area,
    centroid: centroid,
    enclosing_rectangle: enclosing_rectangle,
    make_regular_polygon: make_regular_polygon,
    nearest_point2: nearest_point2,
    nearest_point: nearest_point,
    nearest_point_on_line: nearest_point_on_line,
    split_polygon: split_polygon,
    split_convex_polygon: split_convex_polygon,
    convex_hull: convex_hull
  });

  var core = Object.create(null);
  Object.assign(core, algebra, matrix2_core, matrix3_core, geometry, query, equal);
  core.clean_number = clean_number;
  core.is_number = is_number;
  core.is_vector = is_vector;
  core.is_iterable = is_iterable;
  core.flatten_input = flatten_input;
  core.semi_flatten_input = semi_flatten_input;
  core.get_vector = get_vector;
  core.get_vector_of_vectors = get_vector_of_vectors;
  core.get_matrix2 = get_matrix2;
  core.get_segment = get_segment;
  core.get_line = get_line;
  core.get_ray = get_ray;
  core.get_two_vec2 = get_two_vec2;
  core.get_array_of_vec = get_array_of_vec;
  core.get_array_of_vec2 = get_array_of_vec2;
  core.intersection = intersection;
  Object.freeze(core);

  var make_vertices_edges = function make_vertices_edges(_ref) {
    var edges_vertices = _ref.edges_vertices;

    if (!edges_vertices) {
      return undefined;
    }

    var vertices_edges = [];
    edges_vertices.forEach(function (ev, i) {
      return ev.forEach(function (v) {
        if (vertices_edges[v] === undefined) {
          vertices_edges[v] = [];
        }

        vertices_edges[v].push(i);
      });
    });
    return vertices_edges;
  };
  var make_faces_faces = function make_faces_faces(_ref3) {
    var faces_vertices = _ref3.faces_vertices;

    if (!faces_vertices) {
      return undefined;
    }

    var nf = faces_vertices.length;
    var faces_faces = Array.from(Array(nf)).map(function () {
      return [];
    });
    var edgeMap = {};
    faces_vertices.forEach(function (vertices_index, idx1) {
      if (vertices_index === undefined) {
        return;
      }

      var n = vertices_index.length;
      vertices_index.forEach(function (v1, i, vs) {
        var v2 = vs[(i + 1) % n];

        if (v2 < v1) {
          var _ref4 = [v2, v1];
          v1 = _ref4[0];
          v2 = _ref4[1];
        }

        var key = "".concat(v1, " ").concat(v2);

        if (key in edgeMap) {
          var idx2 = edgeMap[key];
          faces_faces[idx1].push(idx2);
          faces_faces[idx2].push(idx1);
        } else {
          edgeMap[key] = idx1;
        }
      });
    });
    return faces_faces;
  };
  var make_vertex_pair_to_edge_map = function make_vertex_pair_to_edge_map(_ref9) {
    var edges_vertices = _ref9.edges_vertices;

    if (!edges_vertices) {
      return {};
    }

    var map = {};
    edges_vertices.map(function (ev) {
      return ev.sort(function (a, b) {
        return a - b;
      }).join(" ");
    }).forEach(function (key, i) {
      map[key] = i;
    });
    return map;
  };
  var make_face_walk_tree = function make_face_walk_tree(graph) {
    var root_face = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var edge_map = make_vertex_pair_to_edge_map(graph);
    var new_faces_faces = make_faces_faces(graph);

    if (new_faces_faces.length <= 0) {
      return [];
    }

    var visited = [root_face];
    var list = [[{
      face: root_face,
      parent: undefined,
      edge: undefined,
      level: 0
    }]];

    do {
      list[list.length] = list[list.length - 1].map(function (current) {
        var unique_faces = new_faces_faces[current.face].filter(function (f) {
          return visited.indexOf(f) === -1;
        });
        visited = visited.concat(unique_faces);
        return unique_faces.map(function (f) {
          var edge_vertices = graph.faces_vertices[f].filter(function (v) {
            return graph.faces_vertices[current.face].indexOf(v) !== -1;
          }).sort(function (a, b) {
            return a - b;
          });
          var edge = edge_map[edge_vertices.join(" ")];
          return {
            face: f,
            parent: current.face,
            edge: edge,
            edge_vertices: edge_vertices
          };
        });
      }).reduce(function (prev, curr) {
        return prev.concat(curr);
      }, []);
    } while (list[list.length - 1].length > 0);

    if (list.length > 0 && list[list.length - 1].length === 0) {
      list.pop();
    }

    return list;
  };
  var make_faces_coloring_from_faces_matrix = function make_faces_coloring_from_faces_matrix(faces_matrix) {
    return faces_matrix.map(function (m) {
      return m[0] * m[3] - m[1] * m[2];
    }).map(function (c) {
      return c >= 0;
    });
  };
  var make_faces_coloring = function make_faces_coloring(graph) {
    var root_face = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var coloring = [];
    coloring[root_face] = true;
    make_face_walk_tree(graph, root_face).forEach(function (level, i) {
      return level.forEach(function (entry) {
        coloring[entry.face] = i % 2 === 0;
      });
    });
    return coloring;
  };

  var faces_sorted_by_layer = function faces_sorted_by_layer(faces_layer) {
    return faces_layer.map(function (layer, i) {
      return {
        layer: layer,
        i: i
      };
    }).sort(function (a, b) {
      return a.layer - b.layer;
    }).map(function (el) {
      return el.i;
    });
  };

  var make_faces_sidedness = function make_faces_sidedness(graph) {
    var coloring = graph["faces_re:coloring"];

    if (coloring == null) {
      coloring = "faces_re:matrix" in graph ? make_faces_coloring_from_faces_matrix(graph["faces_re:matrix"]) : make_faces_coloring(graph, 0);
    }

    return coloring.map(function (c) {
      return c ? "front" : "back";
    });
  };

  var finalize_faces = function finalize_faces(graph, svg_faces) {
    var orderIsCertain = graph["faces_re:layer"] != null && graph["faces_re:layer"].length === graph.faces_vertices.length;

    if (orderIsCertain) {
      make_faces_sidedness(graph).forEach(function (side, i) {
        return svg_faces[i].setAttribute("class", side);
      });
    }

    return orderIsCertain ? faces_sorted_by_layer(graph["faces_re:layer"]).map(function (i) {
      return svg_faces[i];
    }) : svg_faces;
  };

  var faces_vertices_polygon = function faces_vertices_polygon(graph) {
    if ("faces_vertices" in graph === false || "vertices_coords" in graph === false) {
      return [];
    }

    var svg_faces = graph.faces_vertices.map(function (fv) {
      return fv.map(function (v) {
        return graph.vertices_coords[v];
      });
    }).map(function (face) {
      return polygon(face);
    });
    svg_faces.forEach(function (face, i) {
      return face.setAttribute("id", "".concat(i));
    });
    return finalize_faces(graph, svg_faces);
  };
  var faces_edges_polygon = function faces_edges_polygon(graph) {
    if ("faces_edges" in graph === false || "edges_vertices" in graph === false || "vertices_coords" in graph === false) {
      return [];
    }

    var svg_faces = graph.faces_edges.map(function (face_edges) {
      return face_edges.map(function (edge) {
        return graph.edges_vertices[edge];
      }).map(function (vi, i, arr) {
        var next = arr[(i + 1) % arr.length];
        return vi[1] === next[0] || vi[1] === next[1] ? vi[0] : vi[1];
      }).map(function (v) {
        return graph.vertices_coords[v];
      });
    }).map(function (face) {
      return polygon(face);
    });
    svg_faces.forEach(function (face, i) {
      return face.setAttribute("id", "".concat(i));
    });
    return finalize_faces(graph, svg_faces);
  };

  var defaultStyle = "svg * {\n  stroke-width: var(--crease-width);\n  stroke-linecap: round;\n  stroke: black;\n}\n.mountain { stroke: red; }\n.mark { stroke: lightgray; }\n.valley { stroke: blue;\n  stroke-dasharray: calc(var(--crease-width) * 2) calc(var(--crease-width) * 2);\n}\npolygon { stroke: none; stroke-linejoin: bevel; }\n.foldedForm polygon { stroke: black; fill: #8881; }\n.foldedForm polygon.front { fill: white; }\n.foldedForm polygon.back { fill: lightgray; }\n.creasePattern polygon { fill: white; stroke: none; }\n.foldedForm .boundaries polygon { fill: none; stroke: none; }\n.foldedForm path, .foldedForm line { stroke: none; }\n";

  function vkXML (text, step) {
    var ar = text.replace(/>\s{0,}</g, "><").replace(/</g, "~::~<").replace(/\s*xmlns\:/g, "~::~xmlns:").split("~::~");
    var len = ar.length;
    var inComment = false;
    var deep = 0;
    var str = "";
    var space = step != null && typeof step === "string" ? step : "\t";
    var shift = ["\n"];

    for (var si = 0; si < 100; si += 1) {
      shift.push(shift[si] + space);
    }

    for (var ix = 0; ix < len; ix += 1) {
      if (ar[ix].search(/<!/) > -1) {
        str += shift[deep] + ar[ix];
        inComment = true;

        if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1) {
          inComment = false;
        }
      } else if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
        str += ar[ix];
        inComment = false;
      } else if (/^<\w/.exec(ar[ix - 1]) && /^<\/\w/.exec(ar[ix]) && /^<[\w:\-\.\,]+/.exec(ar[ix - 1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace("/", "")) {
        str += ar[ix];

        if (!inComment) {
          deep -= 1;
        }
      } else if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) === -1 && ar[ix].search(/\/>/) === -1) {
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

    return str[0] === "\n" ? str.slice(1) : str;
  }

  var document = win.document;
  var svgNS$1 = "http://www.w3.org/2000/svg";
  var shadowFilter = function shadowFilter() {
    var id_name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "shadow";
    var defs = document.createElementNS(svgNS$1, "defs");
    var filter = document.createElementNS(svgNS$1, "filter");
    filter.setAttribute("width", "200%");
    filter.setAttribute("height", "200%");
    filter.setAttribute("id", id_name);
    var blur = document.createElementNS(svgNS$1, "feGaussianBlur");
    blur.setAttribute("in", "SourceAlpha");
    blur.setAttribute("stdDeviation", "0.005");
    blur.setAttribute("result", "blur");
    var offset = document.createElementNS(svgNS$1, "feOffset");
    offset.setAttribute("in", "blur");
    offset.setAttribute("result", "offsetBlur");
    var flood = document.createElementNS(svgNS$1, "feFlood");
    flood.setAttribute("flood-color", "#000");
    flood.setAttribute("flood-opacity", "0.3");
    flood.setAttribute("result", "offsetColor");
    var composite = document.createElementNS(svgNS$1, "feComposite");
    composite.setAttribute("in", "offsetColor");
    composite.setAttribute("in2", "offsetBlur");
    composite.setAttribute("operator", "in");
    composite.setAttribute("result", "offsetBlur");
    var merge = document.createElementNS(svgNS$1, "feMerge");
    var mergeNode1 = document.createElementNS(svgNS$1, "feMergeNode");
    var mergeNode2 = document.createElementNS(svgNS$1, "feMergeNode");
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

  var bounding_rect = function bounding_rect(_ref) {
    var vertices_coords = _ref.vertices_coords;

    if (vertices_coords == null || vertices_coords.length <= 0) {
      return [0, 0, 0, 0];
    }

    var dimension = vertices_coords[0].length;
    var min = Array(dimension).fill(Infinity);
    var max = Array(dimension).fill(-Infinity);
    vertices_coords.forEach(function (v) {
      return v.forEach(function (n, i) {
        if (n < min[i]) {
          min[i] = n;
        }

        if (n > max[i]) {
          max[i] = n;
        }
      });
    });
    return isNaN(min[0]) || isNaN(min[1]) || isNaN(max[0]) || isNaN(max[1]) ? [0, 0, 0, 0] : [min[0], min[1], max[0] - min[0], max[1] - min[1]];
  };
  var get_boundary = function get_boundary(graph) {
    if (graph.edges_assignment == null) {
      return {
        vertices: [],
        edges: []
      };
    }

    var edges_vertices_b = graph.edges_assignment.map(function (a) {
      return a === "B" || a === "b";
    });
    var vertices_edges = make_vertices_edges(graph);
    var edge_walk = [];
    var vertex_walk = [];
    var edgeIndex = -1;

    for (var i = 0; i < edges_vertices_b.length; i += 1) {
      if (edges_vertices_b[i]) {
        edgeIndex = i;
        break;
      }
    }

    if (edgeIndex === -1) {
      return {
        vertices: [],
        edges: []
      };
    }

    edges_vertices_b[edgeIndex] = false;
    edge_walk.push(edgeIndex);
    vertex_walk.push(graph.edges_vertices[edgeIndex][0]);
    var nextVertex = graph.edges_vertices[edgeIndex][1];

    while (vertex_walk[0] !== nextVertex) {
      vertex_walk.push(nextVertex);
      edgeIndex = vertices_edges[nextVertex].filter(function (v) {
        return edges_vertices_b[v];
      }).shift();

      if (edgeIndex === undefined) {
        return {
          vertices: [],
          edges: []
        };
      }

      if (graph.edges_vertices[edgeIndex][0] === nextVertex) {
        var _graph$edges_vertices = _slicedToArray(graph.edges_vertices[edgeIndex], 2);

        nextVertex = _graph$edges_vertices[1];
      } else {
        var _graph$edges_vertices2 = _slicedToArray(graph.edges_vertices[edgeIndex], 1);

        nextVertex = _graph$edges_vertices2[0];
      }

      edges_vertices_b[edgeIndex] = false;
      edge_walk.push(edgeIndex);
    }

    return {
      vertices: vertex_walk,
      edges: edge_walk
    };
  };

  function renderDiagrams (graph, renderGroup) {
    if (graph["re:diagrams"] === undefined) {
      return;
    }

    if (graph["re:diagrams"].length === 0) {
      return;
    }

    Array.from(graph["re:diagrams"]).forEach(function (instruction) {
      if ("re:diagram_lines" in instruction === true) {
        instruction["re:diagram_lines"].forEach(function (crease) {
          var creaseClass = "re:diagram_line_classes" in crease ? crease["re:diagram_line_classes"].join(" ") : "valley";
          var pts = crease["re:diagram_line_coords"];

          if (pts !== undefined) {
            var l = line(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
            l.setAttribute("class", creaseClass);
            renderGroup.appendChild(l);
          }
        });
      }

      if ("re:diagram_arrows" in instruction === true) {
        var r = bounding_rect(graph);
        var vmin = r[2] > r[3] ? r[3] : r[2];
        var prefs = {
          length: vmin * 0.09,
          width: vmin * 0.035,
          strokeWidth: vmin * 0.02
        };
        instruction["re:diagram_arrows"].forEach(function (arrowInst) {
          if (arrowInst["re:diagram_arrow_coords"].length === 2) {
            var p = arrowInst["re:diagram_arrow_coords"];
            var side = p[0][0] < p[1][0];

            if (Math.abs(p[0][0] - p[1][0]) < 0.1) {
              side = p[0][1] < p[1][1] ? p[0][0] < 0.5 : p[0][0] > 0.5;
            }

            if (Math.abs(p[0][1] - p[1][1]) < 0.1) {
              side = p[0][0] < p[1][0] ? p[0][1] > 0.5 : p[0][1] < 0.5;
            }

            prefs.side = side;
            var arrow = arcArrow(p[0], p[1], prefs);
            renderGroup.appendChild(arrow);
          }
        });
      }
    });
  }

  var boundaries_polygon = function boundaries_polygon(graph) {
    if ("vertices_coords" in graph === false || "edges_vertices" in graph === false || "edges_assignment" in graph === false) {
      return [];
    }

    var boundary = get_boundary(graph).vertices.map(function (v) {
      return graph.vertices_coords[v];
    });
    var p = polygon(boundary);
    p.setAttribute("class", "boundary");
    return [p];
  };

  var clone = function clone(o) {
    var newO;
    var i;

    if (_typeof(o) !== "object") {
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

  var flatten_frame = function flatten_frame(fold_file, frame_num) {
    if ("file_frames" in fold_file === false || fold_file.file_frames.length < frame_num) {
      return fold_file;
    }

    var dontCopy = ["frame_parent", "frame_inherit"];
    var memo = {
      visited_frames: []
    };

    var recurse = function recurse(recurse_fold, frame, orderArray) {
      if (memo.visited_frames.indexOf(frame) !== -1) {
        throw new Error("encountered a cycle in file_frames. can't flatten.");
      }

      memo.visited_frames.push(frame);
      orderArray = [frame].concat(orderArray);

      if (frame === 0) {
        return orderArray;
      }

      if (recurse_fold.file_frames[frame - 1].frame_inherit && recurse_fold.file_frames[frame - 1].frame_parent != null) {
        return recurse(recurse_fold, recurse_fold.file_frames[frame - 1].frame_parent, orderArray);
      }

      return orderArray;
    };

    return recurse(fold_file, frame_num, []).map(function (frame) {
      if (frame === 0) {
        var swap = fold_file.file_frames;
        fold_file.file_frames = null;
        var copy = clone(fold_file);
        fold_file.file_frames = swap;
        delete copy.file_frames;
        dontCopy.forEach(function (key) {
          return delete copy[key];
        });
        return copy;
      }

      var outerCopy = clone(fold_file.file_frames[frame - 1]);
      dontCopy.forEach(function (key) {
        return delete outerCopy[key];
      });
      return outerCopy;
    }).reduce(function (prev, curr) {
      return Object.assign(prev, curr);
    }, {});
  };

  var DISPLAY_NAME = {
    vertices: "vertices",
    edges: "creases",
    faces: "faces",
    boundaries: "boundaries"
  };

  var svgFaces = function svgFaces(graph) {
    if ("faces_vertices" in graph === true) {
      return faces_vertices_polygon(graph);
    }

    if ("faces_edges" in graph === true) {
      return faces_edges_polygon(graph);
    }

    return [];
  };

  var components = {
    vertices: vertices_circle,
    edges: edges_path,
    faces: svgFaces,
    boundaries: boundaries_polygon
  };

  var all_classes = function all_classes(graph) {
    var file_classes = (graph.file_classes != null ? graph.file_classes : []).join(" ");
    var frame_classes = (graph.frame_classes != null ? graph.frame_classes : []).join(" ");
    return [file_classes, frame_classes].filter(function (s) {
      return s !== "";
    }).join(" ");
  };

  var clean_number$1 = function clean_number(num) {
    var places = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 14;
    return parseFloat(num.toFixed(places));
  };

  var fold_to_svg = function fold_to_svg(fold) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var graph = fold;

    if (graph.vertices_coords != null) {
      graph.vertices_coordsPreClean = graph.vertices_coords;
      graph.vertices_coords = JSON.parse(JSON.stringify(graph.vertices_coords)).map(function (v) {
        return v.map(function (n) {
          return clean_number$1(n);
        });
      });
    }

    var o = {
      defaults: true,
      width: "500px",
      height: "500px",
      inlineStyle: true,
      stylesheet: defaultStyle,
      shadows: false,
      padding: 0,
      viewBox: null,
      diagram: true,
      boundaries: true,
      faces: true,
      edges: true,
      vertices: false
    };
    Object.assign(o, options);

    if (o.frame != null) {
      graph = flatten_frame(fold, o.frame);
    }

    if (o.svg == null) {
      o.svg = svg();
    }

    o.svg.setAttribute("class", all_classes(graph));
    o.svg.setAttribute("width", o.width);
    o.svg.setAttribute("height", o.height);
    var styleElement = style();
    o.svg.appendChild(styleElement);
    var groups = {};
    ["boundaries", "faces", "edges", "vertices"].filter(function (key) {
      return o[key];
    }).forEach(function (key) {
      groups[key] = group();
      groups[key].setAttribute("class", DISPLAY_NAME[key]);
      o.svg.appendChild(groups[key]);
    });
    Object.keys(groups).forEach(function (key) {
      return components[key](graph).forEach(function (a) {
        return groups[key].appendChild(a);
      });
    });

    if ("re:diagrams" in graph && o.diagram) {
      var instructionLayer = group();
      o.svg.appendChild(instructionLayer);
      renderDiagrams(graph, instructionLayer);
    }

    if (o.shadows) {
      var shadow_id = "face_shadow";
      var filter = shadowFilter(shadow_id);
      o.svg.appendChild(filter);
      Array.from(groups.faces.childNodes).forEach(function (f) {
        return f.setAttribute("filter", "url(#".concat(shadow_id, ")"));
      });
    }

    var rect = bounding_rect(graph);

    if (o.viewBox != null) {
      setViewBox.apply(void 0, [o.svg].concat(_toConsumableArray(o.viewBox), [o.padding]));
    } else {
      setViewBox.apply(void 0, [o.svg].concat(_toConsumableArray(rect), [o.padding]));
    }

    if (graph.vertices_coordsPreClean != null) {
      graph.vertices_coords = graph.vertices_coordsPreClean;
      delete graph.vertices_coordsPreClean;
    }

    if (o.inlineStyle) {
      var vmin = rect[2] > rect[3] ? rect[3] : rect[2];
      var innerStyle = "\nsvg { --crease-width: ".concat(vmin * 0.005, "; }\n").concat(o.stylesheet);
      var docu = new win.DOMParser().parseFromString("<xml></xml>", "application/xml");
      var cdata = docu.createCDATASection(innerStyle);
      styleElement.appendChild(cdata);
    }

    var stringified = new win.XMLSerializer().serializeToString(o.svg);
    var beautified = vkXML(stringified);
    return beautified;
  };

  var getObject = function getObject(input) {
    if (input == null) {
      return {};
    }

    if (_typeof(input) === "object" && input !== null) {
      return input;
    }

    if (typeof input === "string" || input instanceof String) {
      try {
        var obj = JSON.parse(input);
        return obj;
      } catch (error) {
        throw error;
      }
    }

    throw new TypeError("couldn't recognize input. looking for string or object");
  };

  var FoldToSvg = function FoldToSvg(input, options) {
    try {
      var fold = getObject(input);
      return fold_to_svg(fold, options);
    } catch (error) {
      throw error;
    }
  };

  FoldToSvg.vertices_circle = vertices_circle;
  FoldToSvg.edges_path_data = edges_path_data;
  FoldToSvg.edges_by_assignment_paths_data = edges_by_assignment_paths_data;
  FoldToSvg.edges_path = edges_path;
  FoldToSvg.edges_line = edges_line;
  FoldToSvg.faces_vertices_polygon = faces_vertices_polygon;
  FoldToSvg.faces_edges_polygon = faces_edges_polygon;

  return FoldToSvg;

})));
