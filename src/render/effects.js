/**
 * fold to svg (c) Robby Kraft
 */
import window from "../environment/window";
import Libraries from "../environment/libraries";
import * as K from "../keys";

const { document } = window;

const shadow_defaults = Object.freeze({
  blur: 0.005,
  opacity: 0.3,
  color: K.black,
});

const result = "result";
const _in = "in";
const blur = "blur";
const offsetColor = "offsetColor";
const offsetBlur = "offsetBlur";
const feMergeNode = "feMergeNode";
const two_hundred = "200%";

export const shadowFilter = function (options = shadow_defaults) {
  const id_name = "shadow";

  if (typeof options !== K.object || options === null) { options = {}; }
  Object.keys(shadow_defaults)
    .filter(key => !(key in options))
    .forEach((key) => { options[key] = shadow_defaults[key]; });

  const filter = document[K.createElementNS](Libraries.SVG.NS, "filter");
  filter[K.setAttributeNS](null, "width", two_hundred);
  filter[K.setAttributeNS](null, "height", two_hundred);
  filter[K.setAttributeNS](null, "id", id_name);

  const gaussian = document[K.createElementNS](Libraries.SVG.NS, "feGaussianBlur");
  gaussian[K.setAttributeNS](null, _in, "SourceAlpha");
  gaussian[K.setAttributeNS](null, "stdDeviation", options.blur);
  gaussian[K.setAttributeNS](null, result, blur);

  const offset = document[K.createElementNS](Libraries.SVG.NS, "feOffset");
  offset[K.setAttributeNS](null, _in, blur);
  offset[K.setAttributeNS](null, result, offsetBlur);

  const flood = document[K.createElementNS](Libraries.SVG.NS, "feFlood");
  flood[K.setAttributeNS](null, "flood-color", options.color);
  flood[K.setAttributeNS](null, "flood-opacity", options.opacity);
  flood[K.setAttributeNS](null, result, offsetColor);

  const composite = document[K.createElementNS](Libraries.SVG.NS, "feComposite");
  composite[K.setAttributeNS](null, _in, offsetColor);
  composite[K.setAttributeNS](null, "in2", offsetBlur);
  composite[K.setAttributeNS](null, "operator", _in);
  composite[K.setAttributeNS](null, result, offsetBlur);

  const merge = document[K.createElementNS](Libraries.SVG.NS, "feMerge");
  const mergeNode1 = document[K.createElementNS](Libraries.SVG.NS, feMergeNode);
  const mergeNode2 = document[K.createElementNS](Libraries.SVG.NS, feMergeNode);
  mergeNode2[K.setAttributeNS](null, _in, "SourceGraphic");
  merge[K.appendChild](mergeNode1);
  merge[K.appendChild](mergeNode2);

  filter[K.appendChild](gaussian);
  filter[K.appendChild](offset);
  filter[K.appendChild](flood);
  filter[K.appendChild](composite);
  filter[K.appendChild](merge);
  return filter;
};

// export const shadowFilter = function (id_name = "shadow") {
//  let defs = document.createElementNS(Libraries.SVG.NS, "defs");
//  let filter = document.createElementNS(Libraries.SVG.NS, "filter");
//  filter.setAttribute("width", "200%");
//  filter.setAttribute("height", "200%");
//  filter.setAttribute("id", id_name);
//  let blur = document.createElementNS(Libraries.SVG.NS, "feGaussianBlur");
//  blur.setAttribute("result", "blurOut");
//  blur.setAttribute("in", "SourceGraphic");
//  blur.setAttribute("stdDeviation", 0.005);
//  let merge = document.createElementNS(Libraries.SVG.NS, "feMerge");
//  let mergeNode1 = document.createElementNS(Libraries.SVG.NS, "feMergeNode");
//  let mergeNode2 = document.createElementNS(Libraries.SVG.NS, "feMergeNode");
//  mergeNode2.setAttribute("in", "SourceGraphic");
//  defs.appendChild(filter);
//  filter.appendChild(blur);
//  filter.appendChild(merge);
//  merge.appendChild(mergeNode1);
//  merge.appendChild(mergeNode2);
//  return defs;
// }
