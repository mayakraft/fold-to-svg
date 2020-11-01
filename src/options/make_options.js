/**
 * fold to svg (c) Robby Kraft
 */
import { bounding_rect } from "../graph/boundary";
import { recursive_assign } from "../environment/javascript";
import Options from "./options";

const make_options = (graph, options = {}) => {
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
  return options;
};

export default make_options;
