/**
 * ## options
 * ### boolean
 * - render layers, with their default setting:
 *   - "vertices": false
 *   - "edges": true
 *   - "faces_vertices": true
 *   - "faces_edges": false
 *   - "boundaries": true
 *
 * - "diagram" if the "re:diagrams" exists, render arrows and lines...
 *
 * - "style" incorporate a stylesheet (default/custom) into <svg> header
 *     options: "attributes", "inline", "css". default "css"
 *
 * ### data
 * ["width"] width of SVG (not viewport, which is in FOLD coordinate space)
 * ["height"] height of SVG (not viewport, which is in FOLD coordinate space)
 * ["stylesheet"] CSS style to be placed in the header
 * ["frame"] render a certain frame in "file_frames", default: top level
 *
 * // maybe soon...
 * "shadows": folded faces have little edge shadows
 * ["svg"] initialize an SVG to draw into. by default this will create one
 * ["foldAngle"] show fold-angles as alpha values for stroke
 */

import defaultStyle from "../styles/default.css";

import vkXML from "../../include/vkbeautify-xml";

import { shadowFilter } from "./effects";

import renderDiagrams from "./diagrams";

import components from "./components";

import {
  DOMParser,
  XMLSerializer,
} from "./window";

import {
  svg,
  style,
  group,
  setViewBox,
} from "../../include/svg";

import {
  bounding_rect,
  flatten_frame,
} from "../graph";

const DISPLAY_NAME = {
  vertices: "vertices",
  edges: "creases",
  faces: "faces",
  boundaries: "boundaries",
};

/**
 * options are, generally, to draw everything possible.
 * specify a frame number otherwise it will render the top level
 * draw
 */
const fold_to_svg = function (fold, options = {}) {
  let graph = fold;
  const groups = {
    boundaries: true,
    faces: true,
    edges: true,
    vertices: false,
  };
  const o = {
    defaults: true,
    width: "500px",
    height: "500px",
    inlineStyle: true,
    stylesheet: defaultStyle,
    shadows: false,
    padding: 0,
    viewBox: null, // viewBox is four numbers in an array. x y w h
  };
  Object.assign(o, options);
  if (o.frame != null) {
    graph = flatten_frame(fold, o.frame);
  }
  if (o.svg == null) {
    o.svg = svg();
  }
  // copy file/frame classes to top level
  const file_classes = (graph.file_classes != null
    ? graph.file_classes : []).join(" ");
  const frame_classes = (graph.frame_classes != null
    ? graph.frame_classes : []).join(" ");
  const top_level_classes = [file_classes, frame_classes]
    .filter(s => s !== "")
    .join(" ");
  o.svg.setAttribute("class", top_level_classes);
  o.svg.setAttribute("width", o.width);
  o.svg.setAttribute("height", o.height);

  const styleElement = style();
  o.svg.appendChild(styleElement);

  Object.keys(groups)
    .filter(key => groups[key] === false)
    .forEach(key => delete groups[key]);
  Object.keys(groups).forEach((key) => {
    groups[key] = group();
    groups[key].setAttribute("class", DISPLAY_NAME[key]);
    o.svg.appendChild(groups[key]);
  });

  // draw geometry into groups
  Object.keys(groups)
    .forEach(key => components[key](graph)
      .forEach(a => groups[key].appendChild(a)));

  if ("re:diagrams" in graph) {
    const instructionLayer = group();
    o.svg.appendChild(instructionLayer);
    renderDiagrams(graph, instructionLayer);
  }

  if (o.shadows) {
    const shadow_id = "face_shadow";
    const filter = shadowFilter(shadow_id);
    o.svg.appendChild(filter);
    Array.from(groups.faces.childNodes)
      .forEach(f => f.setAttribute("filter", `url(#${shadow_id})`));
  }

  const rect = bounding_rect(graph);
  if (o.viewBox != null) {
    setViewBox(o.svg, ...o.viewBox, o.padding);
  } else {
    setViewBox(o.svg, ...rect, o.padding);
  }

  // fill CSS style with --crease-width, and custom or a default style
  if (o.inlineStyle) {
    const vmin = rect[2] > rect[3] ? rect[3] : rect[2];
    const innerStyle = `\nsvg { --crease-width: ${vmin * 0.005}; }\n${o.stylesheet}`;
    // wrap style in CDATA section
    const docu = (new DOMParser())
      .parseFromString("<xml></xml>", "application/xml");
    const cdata = docu.createCDATASection(innerStyle);
    styleElement.appendChild(cdata);
  }

  const stringified = (new XMLSerializer()).serializeToString(o.svg);
  const beautified = vkXML(stringified);
  return beautified;
};

export default fold_to_svg;
