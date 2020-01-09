import {
  bounding_rect,
} from "../FOLD/boundary";

import {
  line,
  arcArrow,
} from "../svg/svg";

export default function (graph, renderGroup) {
  if (graph["re:diagrams"] === undefined) { return; }
  if (graph["re:diagrams"].length === 0) { return; }
  Array.from(graph["re:diagrams"]).forEach((instruction) => {
    // draw crease lines
    if ("re:diagram_lines" in instruction === true) {
      instruction["re:diagram_lines"].forEach((crease) => {
        const creaseClass = ("re:diagram_line_classes" in crease)
          ? crease["re:diagram_line_classes"].join(" ")
          : "valley"; // unspecified should throw error really
        const pts = crease["re:diagram_line_coords"];
        if (pts !== undefined) {
          const l = line(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
          l.setAttribute("class", creaseClass);
          renderGroup.appendChild(l);
        }
      });
    }
    // draw arrows and instruction markings
    if ("re:diagram_arrows" in instruction === true) {
      const r = bounding_rect(graph);
      const vmin = r[2] > r[3] ? r[3] : r[2];
      const prefs = {
        length: vmin * 0.09,
        width: vmin * 0.035,
        strokeWidth: vmin * 0.02,
      };
      instruction["re:diagram_arrows"].forEach((arrowInst) => {
        if (arrowInst["re:diagram_arrow_coords"].length === 2) {
          // start is [0], end is [1]
          const p = arrowInst["re:diagram_arrow_coords"];
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
