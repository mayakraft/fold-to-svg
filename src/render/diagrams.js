/**
 * fold to svg (c) Robby Kraft
 */
import { bounding_rect } from "../FOLD/boundary";
import { line, arrow } from "../svg/svg";

const DIAGRAMS = "re:diagrams";
const DIAGRAM_LINES = "re:diagram_lines";
const DIAGRAM_LINE_CLASSES = "re:diagram_line_classes";
const DIAGRAM_LINE_COORDS = "re:diagram_line_coords";
const DIAGRAM_ARROWS = "re:diagram_arrows";
const DIAGRAM_ARROW_COORDS = "re:diagram_arrow_coords";

export default function (graph, options) {
  if (graph[DIAGRAMS] === undefined) { return; }
  if (graph[DIAGRAMS].length === 0) { return; }
  const diagrams = [];
  Array.from(graph[DIAGRAMS]).forEach((instruction) => {
    // draw crease lines
    if (DIAGRAM_LINES in instruction === true) {
      instruction[DIAGRAM_LINES].forEach((crease) => {
        const creaseClass = (DIAGRAM_LINE_CLASSES in crease)
          ? crease[DIAGRAM_LINE_CLASSES].join(" ")
          : "valley"; // unspecified should throw error really
        const pts = crease[DIAGRAM_LINE_COORDS];
        if (pts !== undefined) {
          const l = line(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
          l.setAttribute("class", creaseClass);
          diagrams.push(l);
        }
      });
    }
    // draw arrows and instruction markings
    if (DIAGRAM_ARROWS in instruction === true) {
      const r = bounding_rect(graph);
      const vmin = r[2] > r[3] ? r[3] : r[2];
      instruction[DIAGRAM_ARROWS].forEach((arrowInst) => {
        if (arrowInst[DIAGRAM_ARROW_COORDS].length === 2) {
          // start is [0], end is [1]
          const p = arrowInst[DIAGRAM_ARROW_COORDS];
          let side = p[0][0] < p[1][0];
          if (Math.abs(p[0][0] - p[1][0]) < 0.1) { // xs are ~ the same
            side = p[0][1] < p[1][1] ? p[0][0] < 0.5 : p[0][0] > 0.5;
          }
          if (Math.abs(p[0][1] - p[1][1]) < 0.1) { // if ys are the same
            side = p[0][0] < p[1][0] ? p[0][1] > 0.5 : p[0][1] < 0.5;
          }
          // if (preferences.arrowColor) { prefs.color = preferences.arrowColor;}
          diagrams.push(arrow(p[0], p[1])
            .stroke("black")
            .fill("black")
            .strokeWidth(vmin * 0.02)
            .head({ width: vmin * 0.035, height: vmin * 0.09 })
            .curve(side ? 0.3 : -0.3));
        }
      });
    }
  });
  return diagrams;
}
