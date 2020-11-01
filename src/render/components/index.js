import K from "../../keys";
// import SVG from "../../../include/svg";
import Libraries from "../../environment/libraries";
import { boundaries_polygon } from "./boundaries";
import { vertices_circle } from "./vertices";
import { edges_path } from "./edges";
import {
  faces_vertices_polygon,
  faces_edges_polygon
} from "./faces";
import Style from "./style";

// preference for using faces_vertices over faces_edges, it runs faster
const faces_draw_function = graph => (graph[K.faces_vertices] != null
  ? faces_vertices_polygon(graph)
  : faces_edges_polygon(graph));

const draw_func = {
  vertices: vertices_circle,
  edges: edges_path,
  faces: faces_draw_function,
  boundaries: boundaries_polygon
};

// draw geometry into groups
// append geometry to SVG, if geometry exists (if group has more than 0 children)
const render_components = (graph, options = {}) => {
  if (!options.attributes) {
    options.attributes = {};
  }
  return [K.boundaries, K.edges, K.faces, K.vertices]
  .filter(key => options[key] === true)
  .map(key => {
    const group = Libraries.SVG.g();
    group[K.setAttributeNS](null, K.class, key);
    draw_func[key](graph, options)  // vertices is the only one that uses "options"
      .forEach(a => group[K.appendChild](a));
    Style(group, options, key);
    return group;
  })
  .filter(group => group.childNodes.length > 0);
};

export default render_components;
