import { recursive_freeze } from "../FOLD/object";

export default (vmin = 1) => recursive_freeze({
  input: "string", // "string", "svg"
  output: "string", // "string", "svg"

  padding: null,
  file_frame: null,
  stylesheet: null,
  shadows: null,

  // show / hide. is it visible?
  boundaries: true,
  faces: true,
  edges: true,
  vertices: false,

  // attributes style
  attributes: {
    svg: {
      width: "500px",
      height: "500px",
      stroke: "black",
      fill: "none",
      "stroke-linejoin": "bevel",
      "stroke-width": vmin / 200,
    },
    boundaries: {
      fill: "white",
    },
    faces: {
      stroke: "none",
      /* these below will be applied onto specific elements based on class */
      front: { stroke: "black", fill: "lightgray" },
      back: { stroke: "black", fill: "white" },
    },
    edges: {
      /* these below will be applied onto specific elements based on class */
      boundary: {},
      mountain: { stroke: "red" },
      valley: { stroke: "blue" },
      mark: { stroke: "lightgray" },
      unassigned: { stroke: "lightgray" },
    },
    vertices: {
      stroke: "none",
      fill: "black",
      /* these below will be applied onto specific elements */
      r: vmin / 200
    }
  }
});
