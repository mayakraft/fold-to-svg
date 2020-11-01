/**
 * fold to svg (c) Robby Kraft
 */
import * as K from "../keys";
import window from "../environment/window";

const NS = "http://www.w3.org/2000/svg";

const g = () => window.document[K.createElementNS](NS, "g");

const defs = () => window.document[K.createElementNS](NS, "defs");

const style = function () {
  const s = window.document[K.createElementNS](NS, "style");
  s[K.setAttributeNS](null, "type", "text/css");
  return s;
};

const line = function (x1, y1, x2, y2) {
  const shape = window.document[K.createElementNS](NS, "line");
  shape[K.setAttributeNS](null, "x1", x1);
  shape[K.setAttributeNS](null, "y1", y1);
  shape[K.setAttributeNS](null, "x2", x2);
  shape[K.setAttributeNS](null, "y2", y2);
  return shape;
};

const circle = function (x, y, radius) {
  const shape = window.document[K.createElementNS](NS, "circle");
  shape[K.setAttributeNS](null, "cx", x);
  shape[K.setAttributeNS](null, "cy", y);
  shape[K.setAttributeNS](null, "r", radius);
  return shape;
};

const polygon = function (pointsArray) {
  const shape = window.document[K.createElementNS](NS, "polygon");
  const pointsString = pointsArray.map(p => `${p[0]},${p[1]}`).join(" ");
  shape[K.setAttributeNS](null, "points", pointsString);
  return shape;
};

const path = function (d) {
  const p = window.document[K.createElementNS](NS, "path");
  p[K.setAttributeNS](null, "d", d);
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

export default SVG;
