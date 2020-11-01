/**
 * fold to svg (c) Robby Kraft
 */
import libraries from "./libraries";

const use = (library) => {
  // check if this is the SVG library
  if (library.NS) {
    libraries.SVG = library;
  }
};

export default use;
