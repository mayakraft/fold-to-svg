# FOLD → SVG

[![Build Status](https://travis-ci.org/robbykraft/fold-to-svg.svg?branch=master)](https://travis-ci.org/robbykraft/fold-to-svg)

convert [FOLD](https://github.com/edemaine/fold) file format into SVG.

> to convert the other direction see [svg to fold](https://github.com/robbykraft/svg-to-fold/)

```javascript
var svg = FoldToSvg(foldObject, options)
```
- the first argument is a FOLD object, as a *string* or a *Javascript object*.
- the second argument is an **optional** *Javascript object*.

### Options

```javascript
defaults = {
  input: "string", // "string", "svg"
  output: "string", // "string", "svg"

  // show/hide: is the component visible?
  boundaries: true,
  faces: true,
  edges: true,
  vertices: false,

  padding: null,  // inset the viewBox with padding. often boundary lines are clipped otherwise
  file_frame: null, // render a frame inside "file_frames", according to FOLD spec.
  stylesheet: null, // CSS style to be placed in the header
  shadows: null,  // folded faces get a little edge shadow

  // attributes style
  attributes: attributes_object, // see below
}
```

basic style is applied using attributes, required to make the SVG basically visible due to the default being all faces are solid black and no stroke visible.

overwrite any style by following this template, and add any other styles you like that follow the SVG specification.

"faces" and "edges" are based on class.

```javascript
defaults = {
  attributes: {
    svg: {
      width: "500px",
      height: "500px",
      stroke: "black",
      fill: "none",
      "stroke-linejoin": "bevel",
    },
    groups: {
      boundaries: {},
      faces: { stroke: "none" },
      edges: {},
      vertices: { stroke: "none", fill: "black" },
    },
    faces: {
      front: { stroke: "black", fill: "gray" },
      back: { stroke: "black", fill: "white" },
    },
    edges: {
      boundary: {},
      mountain: { stroke: "red" },
      valley: { stroke: "blue" },
      mark: { stroke: "gray" },
      unassigned: { stroke: "lightgray" },
    }
  }
};
```

## Components

Each of the individual component draw methods are made available to the end user.

```javascript
FoldToSvg.vertices_circle(foldObject)
FoldToSvg.edges_path_data(foldObject)
FoldToSvg.edges_by_assignment_paths_data(foldObject)
FoldToSvg.edges_line(foldObject)
FoldToSvg.edges_path(foldObject)
FoldToSvg.faces_vertices_polygon(foldObject)
FoldToSvg.faces_edges_polygon(foldObject)
```

