// create an SVG
import window from "../environment/window";
import { graph_classes } from "../graph/class";
import { shadowFilter } from "../svg/effects";
import { bounding_rect } from "../graph/boundary";
import * as SVG from "../../include/svg";
import * as K from "../keys";

/**
 * options are, generally, to draw everything possible.
 * specify a frame number otherwise it will render the top level
 *
 * input type should be "object". type should already be checked
 *
 * 1. get the graph, run a few tests on it, gather some properties
 * 2. initialize a set of options that take properties as input
 * 3. create and draw svg
 */
const make_svg = (graph, options) => {
  const bounds = bounding_rect(graph);
  const vmin = Math.min(bounds[2], bounds[3]);
  const svg = SVG.svg();
  SVG.setViewBox(svg, ...bounds, options.padding);
  const classValue = graph_classes(graph);
  if (classValue !== "") { svg[K.setAttributeNS](null, K._class, classValue); }
  Object.keys(options.attributes.svg)
    .forEach(style => svg[K.setAttributeNS](null, style, options.attributes.svg[style]));
  // if we need a DEFS section, add it here
  const defs = (options.stylesheet != null || options.shadows != null
    ? SVG.defs(svg)
    : undefined);
  if (options.stylesheet != null) {
    const style = SVG.style(defs);
    // wrap style in CDATA section
    const strokeVar = options.attributes.svg[K.stroke_width]
      ? options.attributes.svg[K.stroke_width] : vmin / 200;
    const cdata = (new window.DOMParser())
      .parseFromString("<xml></xml>", "application/xml")
      .createCDATASection(`\n* { --${K.stroke_width}: ${strokeVar}; }\n${options.stylesheet}`);
    style[K.appendChild](cdata);
  }
  if (options.shadows != null) {
    const shadowOptions = (typeof options.shadows === K.object && options.shadows !== null
      ? options.shadows
      : { blur: vmin / 200 });
    defs[K.appendChild](shadowFilter(shadowOptions));
  }
  return svg;
};

export default make_svg;
