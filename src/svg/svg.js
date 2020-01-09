import window from "../environment/window";

const svgNS = "http://www.w3.org/2000/svg";

export const svg = function () {
  const svgImage = window.document.createElementNS(svgNS, "svg");
  svgImage.setAttribute("version", "1.1");
  svgImage.setAttribute("xmlns", svgNS);
  return svgImage;
};

export const group = function () {
  const g = window.document.createElementNS(svgNS, "g");
  return g;
};

export const style = function () {
  const s = window.document.createElementNS(svgNS, "style");
  s.setAttribute("type", "text/css");
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
  const pointsString = pointsArray
    .reduce((a, b) => `${a}${b[0]},${b[1]} `, "");
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

export const arcArrow = function (start, end, options) {
  // options:
  // - padding: the arrow backs off from the target by a tiny fraction
  // - color
  const p = {
    color: "#000", // css
    strokeWidth: 0.5, // css
    width: 0.5, // pixels. of the arrow head
    length: 2, // pixels. of the arrow head
    bend: 0.3, // %
    pinch: 0.618, // %
    padding: 0.5, // % of the arrow head "length"
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
  // make sure arrow isn't too small
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
  // readjust bezier curve now that the arrow heads push inwards
  vector = [arcEnd[0] - arcStart[0], arcEnd[1] - arcStart[1]];
  perpendicular = [vector[1], -vector[0]];
  midpoint = [arcStart[0] + vector[0] / 2, arcStart[1] + vector[1] / 2];
  bezPoint = [
    midpoint[0] + perpendicular[0] * (p.side ? 1 : -1) * p.bend,
    midpoint[1] + perpendicular[1] * (p.side ? 1 : -1) * p.bend
  ];
  // done adjust

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

  // draw
  const arrowGroup = window.document.createElementNS(svgNS, "g");
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

  // ///////////////
  // debug
  // let debugYellowStyle = "stroke:#ecb233;stroke-width:0.005";
  // let debugBlueStyle = "stroke:#224c72;stroke-width:0.005";
  // let debugRedStyle = "stroke:#e14929;stroke-width:0.005";
  // arrowGroup.line(arcStart[0], arcStart[1], arcEnd[0], arcEnd[1])
  //  .setAttribute("style", debugYellowStyle);

  // arrowGroup.line(arcStart[0], arcStart[1], bezPoint[0], bezPoint[1])
  //  .setAttribute("style", debugBlueStyle);
  // arrowGroup.line(arcEnd[0], arcEnd[1], bezPoint[0], bezPoint[1])
  //  .setAttribute("style", debugBlueStyle);
  // arrowGroup.line(arcStart[0], arcStart[1], controlStart[0], controlStart[1])
  //  .setAttribute("style", debugRedStyle);
  // arrowGroup.line(arcEnd[0], arcEnd[1], controlEnd[0], controlEnd[1])
  //  .setAttribute("style", debugRedStyle);
  // arrowGroup.line(controlStart[0], controlStart[1], controlEnd[0], controlEnd[1])
  //  .setAttribute("style", debugRedStyle);

  return arrowGroup;
};
