import * as K from "../keys";
import { graph_classes } from "../graph/class";
import { bounding_rect } from "../graph/boundary";

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
    attributes[K._class] = classValue;
  }
  Object.assign(attributes, options.attributes.svg);
  return attributes;
};

export default make_svg_attributes;
