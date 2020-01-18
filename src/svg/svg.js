/**
 * fold to svg (c) Robby Kraft
 */
import window from "../environment/window";

const svgNS = "http://www.w3.org/2000/svg";

export const svg = function () {
  const svgImage = window.document.createElementNS(svgNS, "svg");
  svgImage.setAttribute("version", "1.1");
  svgImage.setAttribute("xmlns", svgNS);
  return svgImage;
};

export const group = function (parent) {
  const g = window.document.createElementNS(svgNS, "g");
  if (parent) { parent.appendChild(g); }
  return g;
};

export const defs = function (parent) {
  const defs = window.document.createElementNS(svgNS, "defs");
  if (parent) { parent.appendChild(defs); }
  return defs;
};

export const style = function (parent) {
  const s = window.document.createElementNS(svgNS, "style");
  s.setAttribute("type", "text/css");
  if (parent) { parent.appendChild(s); }
  return s;
};

export const setViewBox = function (SVG, x, y, width, height, padding = 0) {
  const scale = 1.0;
  const d = (width / scale) - width;
  const X = (x - d) - padding;
  const Y = (y - d) - padding;
  const W = (width + d * 2) + padding * 2;
  const H = (height + d * 2) + padding * 2;
  const viewBoxString = [X, Y, W, H].join(" ");
  SVG.setAttributeNS(null, "viewBox", viewBoxString);
};

export const line = function (x1, y1, x2, y2) {
  const shape = window.document.createElementNS(svgNS, "line");
  shape.setAttributeNS(null, "x1", x1);
  shape.setAttributeNS(null, "y1", y1);
  shape.setAttributeNS(null, "x2", x2);
  shape.setAttributeNS(null, "y2", y2);
  return shape;
};

export const circle = function (x, y, radius) {
  const shape = window.document.createElementNS(svgNS, "circle");
  shape.setAttributeNS(null, "cx", x);
  shape.setAttributeNS(null, "cy", y);
  shape.setAttributeNS(null, "r", radius);
  return shape;
};

export const polygon = function (pointsArray) {
  const shape = window.document.createElementNS(svgNS, "polygon");
  const pointsString = pointsArray.map(p => `${p[0]},${p[1]}`).join(" ");
    // .reduce((a, b) => `${a}${b[0]},${b[1]} `, "");
  // const pointsString = pointsArray
  //   .reduce((a, b) => `${a}${b[0]},${b[1]} `, "");
  shape.setAttributeNS(null, "points", pointsString);
  return shape;
};

export const path = function (d) {
  const p = window.document.createElementNS(svgNS, "path");
  p.setAttributeNS(null, "d", d);
  return p;
};

export const bezier = function (fromX, fromY, c1X, c1Y, c2X, c2Y, toX, toY) {
  const pts = [[fromX, fromY], [c1X, c1Y], [c2X, c2Y], [toX, toY]]
    .map(p => p.join(","));
  return path(`M ${pts[0]} C ${pts[1]} ${pts[2]} ${pts[3]}`);
};

const is_iterable = obj => obj != null
  && typeof obj[Symbol.iterator] === "function";
const flatten_input = function (...args) {
  switch (args.length) {
    case undefined:
    case 0: return args;
    // only if its an array (is iterable) and NOT a string
    case 1: return is_iterable(args[0]) && typeof args[0] !== "string"
      ? flatten_input(...args[0])
      : [args[0]];
    default:
      return Array.from(args)
        .map(a => (is_iterable(a)
          ? [...flatten_input(a)]
          : a))
        .reduce((a, b) => a.concat(b), []);
  }
};

const setPoints = function (shape, ...pointsArray) {
  const flat = flatten_input(...pointsArray);
  let pointsString = "";
  if (typeof flat[0] === "number") {
    pointsString = Array.from(Array(Math.floor(flat.length / 2)))
      .reduce((a, b, i) => `${a}${flat[i * 2]},${flat[i * 2 + 1]} `, "");
  }
  if (typeof flat[0] === "object") {
    if (typeof flat[0].x === "number") {
      pointsString = flat.reduce((prev, curr) => `${prev}${curr.x},${curr.y} `, "");
    }
    if (typeof flat[0][0] === "number") {
      pointsString = flat.reduce((prev, curr) => `${prev}${curr[0]},${curr[1]} `, "");
    }
  }
  shape.setAttributeNS(null, "points", pointsString);
  return shape;
};

const setArrowPoints = function (shape, ...args) {
  const children = Array.from(shape.childNodes);
  const path = children.filter(node => node.tagName === "path").shift();
  const polys = ["svg-arrow-head", "svg-arrow-tail"]
    .map(c => children.filter(n => n.getAttribute("class") === c).shift());

  const flat = flatten_input(...args);
  let endpoints = [];
  if (typeof flat[0] === "number") {
    endpoints = flat;
  }
  if (typeof flat[0] === "object") {
    if (typeof flat[0].x === "number") {
      endpoints = flat.map(p => [p[0], p[1]]).reduce((a, b) => a.concat(b), []);
    }
    if (typeof flat[0][0] === "number") {
      endpoints = flat.reduce((a, b) => a.concat(b), []);
    }
  }
  if (!endpoints.length && shape.endpoints != null) {
    // get endpoints from cache
    endpoints = shape.endpoints;
  }
  if (!endpoints.length) { return shape; }
  // we have to cache the endpoints in case we need to rebuild
  shape.endpoints = endpoints;

  const o = shape.options;

  let tailPt = [endpoints[0], endpoints[1]];
  let headPt = [endpoints[2], endpoints[3]];
  let vector = [headPt[0] - tailPt[0], headPt[1] - tailPt[1]];
  let midpoint = [tailPt[0] + vector[0] / 2, tailPt[1] + vector[1] / 2];
  // make sure arrow isn't too small
  const len = Math.sqrt((vector[0] ** 2) + (vector[1] ** 2));
  const minLength = (
    (o.tail.visible ? (1 + o.tail.padding) * o.tail.height * 2.5 : 0)
  + (o.head.visible ? (1 + o.head.padding) * o.head.height * 2.5 : 0)
  );
  if (len < minLength) {
    const minVec = len === 0 // exactly 0. don't use epsilon here
      ? [minLength, 0]
      : [vector[0] / len * minLength, vector[1] / len * minLength];
    tailPt = [midpoint[0] - minVec[0] * 0.5, midpoint[1] - minVec[1] * 0.5];
    headPt = [midpoint[0] + minVec[0] * 0.5, midpoint[1] + minVec[1] * 0.5];
    vector = [headPt[0] - tailPt[0], headPt[1] - tailPt[1]];
  }
  let perpendicular = [vector[1], -vector[0]];
  let bezPoint = [
    midpoint[0] + perpendicular[0] * o.curve,
    midpoint[1] + perpendicular[1] * o.curve
  ];

  const bezTail = [bezPoint[0] - tailPt[0], bezPoint[1] - tailPt[1]];
  const bezHead = [bezPoint[0] - headPt[0], bezPoint[1] - headPt[1]];
  const bezTailLen = Math.sqrt((bezTail[0] ** 2) + (bezTail[1] ** 2));
  const bezHeadLen = Math.sqrt((bezHead[0] ** 2) + (bezHead[1] ** 2));
  const bezTailNorm = bezTailLen === 0
    ? bezTail
    : [bezTail[0] / bezTailLen, bezTail[1] / bezTailLen];
  const bezHeadNorm = bezTailLen === 0
    ? bezHead
    : [bezHead[0] / bezHeadLen, bezHead[1] / bezHeadLen];
  const tailVector = [-bezTailNorm[0], -bezTailNorm[1]];
  const headVector = [-bezHeadNorm[0], -bezHeadNorm[1]];
  const tailNormal = [tailVector[1], -tailVector[0]];
  const headNormal = [headVector[1], -headVector[0]];

  const tailArc = [
    tailPt[0] + bezTailNorm[0] * o.tail.height * ((o.tail.visible ? 1 : 0) + o.tail.padding),
    tailPt[1] + bezTailNorm[1] * o.tail.height * ((o.tail.visible ? 1 : 0) + o.tail.padding)
  ];
  const headArc = [
    headPt[0] + bezHeadNorm[0] * o.head.height * ((o.head.visible ? 1 : 0) + o.head.padding),
    headPt[1] + bezHeadNorm[1] * o.head.height * ((o.head.visible ? 1 : 0) + o.head.padding)
  ];
  // readjust bezier curve now that the arrow heads push inwards
  vector = [headArc[0] - tailArc[0], headArc[1] - tailArc[1]];
  perpendicular = [vector[1], -vector[0]];
  midpoint = [tailArc[0] + vector[0] / 2, tailArc[1] + vector[1] / 2];
  bezPoint = [
    midpoint[0] + perpendicular[0] * o.curve,
    midpoint[1] + perpendicular[1] * o.curve
  ];

  // done adjust
  const tailControl = [
    tailArc[0] + (bezPoint[0] - tailArc[0]) * o.pinch,
    tailArc[1] + (bezPoint[1] - tailArc[1]) * o.pinch
  ];
  const headControl = [
    headArc[0] + (bezPoint[0] - headArc[0]) * o.pinch,
    headArc[1] + (bezPoint[1] - headArc[1]) * o.pinch
  ];

  const tailPolyPts = [
    [tailArc[0] + tailNormal[0] * -o.tail.width, tailArc[1] + tailNormal[1] * -o.tail.width],
    [tailArc[0] + tailNormal[0] * o.tail.width, tailArc[1] + tailNormal[1] * o.tail.width],
    [tailArc[0] + tailVector[0] * o.tail.height, tailArc[1] + tailVector[1] * o.tail.height]
  ];
  const headPolyPts = [
    [headArc[0] + headNormal[0] * -o.head.width, headArc[1] + headNormal[1] * -o.head.width],
    [headArc[0] + headNormal[0] * o.head.width, headArc[1] + headNormal[1] * o.head.width],
    [headArc[0] + headVector[0] * o.head.height, headArc[1] + headVector[1] * o.head.height]
  ];

  // draw
  // if straight or curved
  path.setAttribute("d", `M${tailArc[0]},${tailArc[1]}C${tailControl[0]},${tailControl[1]},${headControl[0]},${headControl[1]},${headArc[0]},${headArc[1]}`);

  if (o.head.visible) {
    polys[0].removeAttribute("display");
    setPoints(polys[0], headPolyPts);
  } else {
    polys[0].setAttribute("display", "none");
  }

  if (o.tail.visible) {
    polys[1].removeAttribute("display");
    setPoints(polys[1], tailPolyPts);
  } else {
    polys[1].setAttribute("display", "none");
  }
  return shape;
};


export const attachArrowMethods = function (element) {
  element.head = (options) => {
    if (typeof options === "object") {
      Object.assign(element.options.head, options);
      if (options.visible === undefined) {
        element.options.head.visible = true;
      }
    } else if (typeof options === "boolean") {
      element.options.head.visible = options;
    } else if (options == null) {
      element.options.head.visible = true;
    }
    setArrowPoints(element);
    return element;
  };
  element.tail = (options) => {
    if (typeof options === "object") {
      Object.assign(element.options.tail, options);
      if (options.visible === undefined) {
        element.options.tail.visible = true;
      }
      element.options.tail.visible = true;
    } else if (typeof options === "boolean") {
      element.options.tail.visible = options;
    } else if (options == null) {
      element.options.tail.visible = true;
    }
    setArrowPoints(element);
    return element;
  };
  element.curve = (amount) => {
    element.options.curve = amount;
    setArrowPoints(element);
    return element;
  };
  element.pinch = (amount) => {
    element.options.pinch = amount;
    setArrowPoints(element);
    return element;
  };
};

export const arrow = function (...args) {
  const shape = window.document.createElementNS(svgNS, "g");
  const tailPoly = window.document.createElementNS(svgNS, "polygon");
  const headPoly = window.document.createElementNS(svgNS, "polygon");
  const arrowPath = window.document.createElementNS(svgNS, "path");
  tailPoly.setAttributeNS(null, "class", "svg-arrow-tail");
  headPoly.setAttributeNS(null, "class", "svg-arrow-head");
  arrowPath.setAttributeNS(null, "class", "svg-arrow-path");
  tailPoly.setAttributeNS(null, "style", "stroke: none;");
  headPoly.setAttributeNS(null, "style", "stroke: none;");
  arrowPath.setAttributeNS(null, "style", "fill: none;");
  shape.appendChild(arrowPath);
  shape.appendChild(tailPoly);
  shape.appendChild(headPoly);
  shape.options = {
    head: { width: 0.5, height: 2, visible: false, padding: 0.0 },
    tail: { width: 0.5, height: 2, visible: false, padding: 0.0 },
    curve: 0.0,
    pinch: 0.618,
    endpoints: [],
  };
  setArrowPoints(shape, ...args);
  attachArrowMethods(shape);
  shape.stroke = (...a) => { shape.setAttributeNS(null, "stroke", ...a); return shape; }
  shape.fill = (...a) => { shape.setAttributeNS(null, "fill", ...a); return shape; }
  shape.strokeWidth = (...a) => { shape.setAttributeNS(null, "stroke-width", ...a); return shape; }
  shape.setPoints = (...a) => setArrowPoints(shape, ...a);
  return shape;
};
