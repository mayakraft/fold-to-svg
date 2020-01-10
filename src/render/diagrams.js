import { bounding_rect } from "../FOLD/boundary";
import {
  line,
  arcArrow,
} from "../svg/svg";

const DIAGRAMS = "re:diagrams";
const DIAGRAM_LINES = "re:diagram_lines";
const DIAGRAM_LINE_CLASSES = "re:diagram_line_classes";
const DIAGRAM_LINE_COORDS = "re:diagram_line_coords";
const DIAGRAM_ARROWS = "re:diagram_arrows";
const DIAGRAM_ARROW_COORDS = "re:diagram_arrow_coords";

export default function (graph, renderGroup) {
  if (graph[DIAGRAMS] === undefined) { return; }
  if (graph[DIAGRAMS].length === 0) { return; }
  Array.from(graph[DIAGRAMS]).forEach((instruction) => {
    // draw crease lines
    if (DIAGRAMS_LINES in instruction === true) {
      instruction[DIAGRAMS_LINES].forEach((crease) => {
        const creaseClass = (DIAGRAMS_LINE_CLASSES in crease)
          ? crease[DIAGRAMS_LINE_CLASSES].join(" ")
          : "valley"; // unspecified should throw error really
        const pts = crease[DIAGRAMS_LINE_COORDS];
        if (pts !== undefined) {
          const l = line(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
          l.setAttribute("class", creaseClass);
          renderGroup.appendChild(l);
        }
      });
    }
    // draw arrows and instruction markings
    if (DIAGRAM_ARROWS in instruction === true) {
      const r = bounding_rect(graph);
      const vmin = r[2] > r[3] ? r[3] : r[2];
      const prefs = {
        length: vmin * 0.09,
        width: vmin * 0.035,
        strokeWidth: vmin * 0.02,
      };
      instruction[DIAGRAM_ARROWS].forEach((arrowInst) => {
        if (arrowInst[DIAGRAM_ARROW_COORDS].length === 2) {
          // start is [0], end is [1]
          const p = arrowInst[DIAGRAM_ARROW_COORDS];
          let side = p[0][0] < p[1][0];
          if (Math.abs(p[0][0] - p[1][0]) < 0.1) { // xs are ~ the same
            side = p[0][1] < p[1][1]
              ? p[0][0] < 0.5
              : p[0][0] > 0.5;
          }
          if (Math.abs(p[0][1] - p[1][1]) < 0.1) { // if ys are the same
            side = p[0][0] < p[1][0]
              ? p[0][1] > 0.5
              : p[0][1] < 0.5;
          }
          prefs.side = side;
          // if (preferences.arrowColor) { prefs.color = preferences.arrowColor;}
          const arrow = arcArrow(p[0], p[1], prefs);
          renderGroup.appendChild(arrow);
        }
      });
    }
  });
}
