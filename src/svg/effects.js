/**
 * fold to svg (c) Robby Kraft
 */
import window from "../environment/window";

const { document } = window;
const svgNS = "http://www.w3.org/2000/svg";

const shadow_defaults = Object.freeze({
  blur: 0.005,
  opacity: 0.3,
  color: "#000",
});

export const shadowFilter = function (options = shadow_defaults) {
  const id_name = "shadow";

  if (typeof options !== "object" || options === null) { options = {}; }
  Object.keys(shadow_defaults)
    .filter(key => !(key in options))
    .forEach((key) => { options[key] = shadow_defaults[key]; });

  const filter = document.createElementNS(svgNS, "filter");
  filter.setAttribute("width", "200%");
  filter.setAttribute("height", "200%");
  filter.setAttribute("id", id_name);

  const blur = document.createElementNS(svgNS, "feGaussianBlur");
  blur.setAttribute("in", "SourceAlpha");
  blur.setAttribute("stdDeviation", options.blur);
  blur.setAttribute("result", "blur");

  const offset = document.createElementNS(svgNS, "feOffset");
  offset.setAttribute("in", "blur");
  offset.setAttribute("result", "offsetBlur");

  const flood = document.createElementNS(svgNS, "feFlood");
  flood.setAttribute("flood-color", options.color);
  flood.setAttribute("flood-opacity", options.opacity);
  flood.setAttribute("result", "offsetColor");

  const composite = document.createElementNS(svgNS, "feComposite");
  composite.setAttribute("in", "offsetColor");
  composite.setAttribute("in2", "offsetBlur");
  composite.setAttribute("operator", "in");
  composite.setAttribute("result", "offsetBlur");

  const merge = document.createElementNS(svgNS, "feMerge");
  const mergeNode1 = document.createElementNS(svgNS, "feMergeNode");
  const mergeNode2 = document.createElementNS(svgNS, "feMergeNode");
  mergeNode2.setAttribute("in", "SourceGraphic");
  merge.appendChild(mergeNode1);
  merge.appendChild(mergeNode2);

  filter.appendChild(blur);
  filter.appendChild(offset);
  filter.appendChild(flood);
  filter.appendChild(composite);
  filter.appendChild(merge);
  return filter;
};

// export const shadowFilter = function (id_name = "shadow") {
//  let defs = document.createElementNS(svgNS, "defs");
//  let filter = document.createElementNS(svgNS, "filter");
//  filter.setAttribute("width", "200%");
//  filter.setAttribute("height", "200%");
//  filter.setAttribute("id", id_name);
//  let blur = document.createElementNS(svgNS, "feGaussianBlur");
//  blur.setAttribute("result", "blurOut");
//  blur.setAttribute("in", "SourceGraphic");
//  blur.setAttribute("stdDeviation", 0.005);
//  let merge = document.createElementNS(svgNS, "feMerge");
//  let mergeNode1 = document.createElementNS(svgNS, "feMergeNode");
//  let mergeNode2 = document.createElementNS(svgNS, "feMergeNode");
//  mergeNode2.setAttribute("in", "SourceGraphic");
//  defs.appendChild(filter);
//  filter.appendChild(blur);
//  filter.appendChild(merge);
//  merge.appendChild(mergeNode1);
//  merge.appendChild(mergeNode2);
//  return defs;
// }
