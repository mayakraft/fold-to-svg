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
 * specify a frame number otherwise it will render the top level
 */
export default function (fold, options = {}) {
  const _svg = svg();
  let graph = fold;
  const groups = {
    boundaries: true,
    faces: true,
    edges: true,
    vertices: false,
  };
  const o = {
    width: options.width || "500px",
    height: options.height || "500px",
    style: options.style || true,
    stylesheet: options.stylesheet || defaultStyle,
    shadows: options.shadows || false,
    padding: options.padding || 0,
  };
  if (options != null && options.frame != null) {
    graph = flatten_frame(fold, options.frame);
  }
  // copy file/frame classes to top level
  const file_classes = (graph.file_classes != null
    ? graph.file_classes : []).join(" ");
  const frame_classes = graph.frame_classes != null
    ? graph.frame_classes : [].join(" ");
  const top_level_classes = [file_classes, frame_classes]
    .filter(s => s !== "")
    .join(" ");
  _svg.setAttribute("class", top_level_classes);
  _svg.setAttribute("width", o.width);
  _svg.setAttribute("height", o.height);

  const styleElement = style();
  _svg.appendChild(styleElement);

  Object.keys(groups)
    .filter(key => groups[key] === false)
    .forEach(key => delete groups[key]);
  Object.keys(groups).forEach((key) => {
    groups[key] = group();
    groups[key].setAttribute("class", DISPLAY_NAME[key]);
    _svg.appendChild(groups[key]);
  });

  // draw geometry into groups
  Object.keys(groups)
    .forEach(key => components[key](graph)
      .forEach(a => groups[key].appendChild(a)));

  if ("re:diagrams" in graph) {
    const instructionLayer = group();
    _svg.appendChild(instructionLayer);
    renderDiagrams(graph, instructionLayer);
  }

  if (o.shadows) {
    const shadow_id = "face_shadow";
    const filter = shadowFilter(shadow_id);
    _svg.appendChild(filter);
    Array.from(groups.faces.childNodes)
      .forEach(f => f.setAttribute("filter", `url(#${shadow_id})`));
  }

  const rect = bounding_rect(graph);
  setViewBox(_svg, ...rect, o.padding);

  // fill CSS style with --crease-width, and custom or a default style
  const vmin = rect[2] > rect[3] ? rect[3] : rect[2];
  const innerStyle = (o.style
    ? `\nsvg { --crease-width: ${vmin * 0.005}; }\n${o.stylesheet}`
    : `\nsvg { --crease-width: ${vmin * 0.005}; }\n`);

  // wrap style in CDATA section
  const docu = (new DOMParser())
    .parseFromString("<xml></xml>", "application/xml");
  const cdata = docu.createCDATASection(innerStyle);
  styleElement.appendChild(cdata);

  const stringified = (new XMLSerializer()).serializeToString(_svg);
  const beautified = vkXML(stringified);
  return beautified;
}
