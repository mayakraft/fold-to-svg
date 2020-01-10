# FOLD → SVG

[![Build Status](https://travis-ci.org/robbykraft/fold-to-svg.svg?branch=master)](https://travis-ci.org/robbykraft/fold-to-svg)

convert [FOLD](https://github.com/edemaine/fold) file format into SVG.

> to convert the other direction see [svg to fold](https://github.com/robbykraft/svg-to-fold/)

```javascript
var svg = FoldToSvg(foldObject, options)
```
- the first argument is a FOLD object, as a *string* or a *Javascript object*.
- the second argument is an **optional** *Javascript object*.

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
