/**
 * fold to svg (c) Robby Kraft
 */
import vkXML from "../../include/vkbeautify-xml";
import window from "../environment/window";
import { bounding_rect } from "../graph/boundary";
import { flatten_frame } from "../graph/file_frames";
import * as SVG from "../../include/svg";
import Options from "../options/options";
import { recursive_assign } from "../environment/javascript";
import * as K from "../keys";
// components
import { boundaries_polygon } from "./boundaries";
import { vertices_circle } from "./vertices";
import { edges_path } from "./edges";
import {
  faces_vertices_polygon,
  faces_edges_polygon
} from "./faces";
import Style from "./style";
import make_svg from "./make_svg";

// preference for using faces_vertices over faces_edges, it runs faster
const faces_draw_function = (graph, options) => (graph[K.faces_vertices] != null
  ? faces_vertices_polygon(graph, options)
  : faces_edges_polygon(graph, options));

const draw_func = {
  vertices: vertices_circle,
  edges: edges_path,
  faces: faces_draw_function,
  boundaries: boundaries_polygon
};

const draw_children = (graph, options) => {
  // draw geometry into groups
  // append geometry to SVG, if geometry exists (if group has more than 0 children)
  return [K.boundaries, K.edges, K.faces, K.vertices]
    .filter(key => options[key] === true)
    .map(key => {
      const group = SVG.g();
      group[K.setAttributeNS](null, K._class, key);
      draw_func[key](graph, options)
        .forEach(a => group[K.appendChild](a));
      Style[key](group, options.attributes[key]);
      return group;
    })
    .filter(group => group.childNodes.length > 0);
};

const prepare_options = (graph, options) => {
  const bounds = bounding_rect(graph);   // this is duplicated
  const vmin = Math.min(bounds[2], bounds[3]); // this is duplicated
  recursive_assign(options, Options(vmin));
  // augment options based on other options
  if (options.shadows) {
    recursive_assign(options, { attributes: { faces: {
      front: { filter: "url(#shadow)" },
      back: { filter: "url(#shadow)" },
    }}});
  }
};

const render = function (input, options = {}) {
  // get the FOLD input
  const graph = (typeof options.file_frame === "number"
    ? flatten_frame(input, options.file_frame)
    : input);
  // options
  prepare_options(graph, options);
  const svg = make_svg(graph, options);
  draw_children(graph, options)
    .forEach(group => svg[K.appendChild](group));
  // return
  if (options.output === "svg") { return svg; }
  const stringified = (new window.XMLSerializer()).serializeToString(svg);
  const beautified = vkXML(stringified);
  return beautified;
};

export default render;
