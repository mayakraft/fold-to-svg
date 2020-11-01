import K from "../keys";
import Libraries from "../environment/libraries";
// import SVG from "../../include/svg";
import window from "../environment/window";
import { shadowFilter } from "./effects";
import { bounding_rect } from "../graph/boundary";

const make_defs = (graph, options) => {
  const bounds = bounding_rect(graph);
  const vmin = Math.min(bounds[2], bounds[3]);
  const defs = Libraries.SVG.defs();
  if (options.stylesheet != null) {
    const style = Libraries.SVG.style();
    defs[K.appendChild](style);
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
  return (options.stylesheet != null || options.shadows != null
    ? defs
    : undefined);
};

export default make_defs;
