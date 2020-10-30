import { recursive_freeze } from "../environment/javascript";
import * as K from "../keys";

const none = "none";
const five_hundred_px = "500px";

export default (vmin = 1) => recursive_freeze({
  input: K.string, // "string", "svg"
  output: K.string, // "string", "svg"

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
      width: five_hundred_px,
      height: five_hundred_px,
      stroke: K.black,
      fill: none,
      "stroke-linejoin": "bevel",
      "stroke-width": vmin / 200,
    },
    boundaries: {
      fill: K.white,
    },
    faces: {
      stroke: none,
      /* these below will be applied onto specific elements based on class */
      front: { stroke: K.black, fill: K.lightgray },
      back: { stroke: K.black, fill: K.white },
    },
    edges: {
      /* these below will be applied onto specific elements based on class */
      boundary: {},
      mountain: { stroke: "red" },
      valley: { stroke: "blue" },
      mark: { stroke: K.lightgray },
      unassigned: { stroke: K.lightgray },
    },
    vertices: {
      stroke: none,
      fill: K.black,
      /* these below will be applied onto specific elements */
      r: vmin / 200
    }
  }
});
