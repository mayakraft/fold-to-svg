import * as K from "../keys";
import * as SVG from "../../include/svg";
import { graph_classes } from "../graph/class";
import { bounding_rect } from "../graph/boundary";

const make_svg_attributes = (graph, options) => {
  const bounds = bounding_rect(graph);
  const vmin = Math.min(bounds[2], bounds[3]);
  const attributes = {
    viewBox: SVG.makeViewBox(...bounds, options.padding),
  };
  const classValue = graph_classes(graph);
  if (classValue !== "") {
    attributes[K._class] = classValue;
  }
  Object.assign(attributes, options.attributes.svg);
  return attributes;
};

export default make_svg_attributes;
