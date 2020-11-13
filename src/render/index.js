/**
 * fold to svg (c) Robby Kraft
 */
import * as K from "../keys";
import make_options from "../options/make_options";
import render_components from "./components/index";
import Defs from "./defs";
import SvgAttributes from "./attributes";

export const render_into_svg = (svg, graph = {}, options = {}) => {
  // options
  make_options(graph, options);
  // set attributes, populate svg with components and metadata section
  const defs = Defs(graph, options);
  if (defs) { svg[K.appendChild](defs); }
  render_components(graph, options)
    .forEach(group => svg[K.appendChild](group));
  const attrs = SvgAttributes(graph, options);
  Object.keys(attrs).forEach(attr => svg[K.setAttributeNS](null, attr, attrs[attr]));
  return svg;
};

export default render_into_svg;
