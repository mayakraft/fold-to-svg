/**
 * fold to svg (c) Robby Kraft
 */
import window from "../src/environment/window";
import * as K from "../src/keys";

export const svgNS = "http://www.w3.org/2000/svg";

export const svg = function () {
  const svgImage = window.document[K.createElementNS](svgNS, "svg");
  svgImage.setAttribute("version", "1.1");
  svgImage.setAttribute("xmlns", svgNS);
  return svgImage;
};

export const group = function (parent) {
  const g = window.document[K.createElementNS](svgNS, "g");
  if (parent) { parent[K.appendChild](g); }
  return g;
};

export const defs = function (parent) {
  const defs = window.document[K.createElementNS](svgNS, "defs");
  if (parent) { parent[K.appendChild](defs); }
  return defs;
};

export const style = function (parent) {
  const s = window.document[K.createElementNS](svgNS, "style");
  s[K.setAttributeNS](null, "type", "text/css");
  if (parent) { parent[K.appendChild](s); }
  return s;
};

export const setViewBox = function (svg, x, y, width, height, padding = 0) {
  const scale = 1.0;
  const d = (width / scale) - width;
  const X = (x - d) - padding;
  const Y = (y - d) - padding;
  const W = (width + d * 2) + padding * 2;
  const H = (height + d * 2) + padding * 2;
  const viewBoxString = [X, Y, W, H].join(" ");
  svg[K.setAttributeNS](null, "viewBox", viewBoxString);
};

export const line = function (x1, y1, x2, y2) {
  const shape = window.document[K.createElementNS](svgNS, "line");
  shape[K.setAttributeNS](null, "x1", x1);
  shape[K.setAttributeNS](null, "y1", y1);
  shape[K.setAttributeNS](null, "x2", x2);
  shape[K.setAttributeNS](null, "y2", y2);
  return shape;
};

export const circle = function (x, y, radius) {
  const shape = window.document[K.createElementNS](svgNS, "circle");
  shape[K.setAttributeNS](null, "cx", x);
  shape[K.setAttributeNS](null, "cy", y);
  shape[K.setAttributeNS](null, "r", radius);
  return shape;
};

export const polygon = function (pointsArray) {
  const shape = window.document[K.createElementNS](svgNS, "polygon");
  const pointsString = pointsArray.map(p => `${p[0]},${p[1]}`).join(" ");
  shape[K.setAttributeNS](null, "points", pointsString);
  return shape;
};

export const path = function (d) {
  const p = window.document[K.createElementNS](svgNS, "path");
  p[K.setAttributeNS](null, "d", d);
  return p;
};
