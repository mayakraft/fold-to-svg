import * as K from "../keys";

// in each of these style functions, options has already been shortcut to the
// specific geometry entry of the global options object, like:
// "options" referrs to "options.attributes.edges" or "options.attributes.faces"

const face_classes = [K.front, K.back];
const edge_classes = [K.unassigned, K.mark, K.valley, K.mountain, K.boundary];

// options object doubles as "attribute" and "className" at the top level
const style_component = (group, opts, classes) => {
  // filter out className specific, attributes can be applied directly.
  Object.keys(opts)
    .filter(key => !classes.includes(key))
    .forEach(key => group[K.setAttributeNS](null, key, opts[key]));
  // class specific needs to visit each element individually, check its classes.
  Array.from(group.childNodes)
    // for each element, for each class, apply attribute if class exists on element
    .forEach(child => Object.keys(opts[child.getAttribute(K._class)] || {})
      .forEach(key => child[K.setAttributeNS](null, key, opts[child.getAttribute(K._class)][key])));
};

const style_faces = (group, opts) => style_component(group, opts, face_classes);

const style_edges = (group, opts) => style_component(group, opts, edge_classes);

const style_vertices = (group, opts) => {
  Object.keys(opts)
    .filter(key => key !== "r")
    .forEach(key => group[K.setAttributeNS](null, key, opts[key]));
  Array.from(group.childNodes)
    .forEach(child => child[K.setAttributeNS](null, "r", opts.r));
};

const style_boundaries = (group, opts) => {
  Object.keys(opts)
    .forEach(key => group[K.setAttributeNS](null, key, opts[key]));
};

const style_func = {
  vertices: style_vertices,
  edges: style_edges,
  faces: style_faces,
  boundaries: style_boundaries,
};

export default style_func;
