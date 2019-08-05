# FOLD → SVG

[![Build Status](https://travis-ci.org/robbykraft/fold-draw.svg?branch=master)](https://travis-ci.org/robbykraft/fold-draw)

convert [FOLD](https://github.com/edemaine/fold) file format into SVG. (todo: WebGL)

> to convert the other direction, svg into fold: [tofold](https://github.com/robbykraft/tofold/)

```javascript
foldDraw.svg(foldObject)
```

the second argument is an options {} object, includes:

* `stylesheet` CSS stylesheet to be placed in the header. styles the SVG.
* `frame` render a certain frame in "file_frames", default is the top level
* `width` width of SVG (not viewport, which is in FOLD coordinate space)
* `height` height of SVG
* `inlineStyle` include style header in the svg. default: true
* `shadows` include shadow effect. default: false
* `padding` without modifying the viewbox, shrink the fold object in the view. default: 0.
* `viewBox` type is an array of 4 numbers: x y w h. default null,

show hide these components. true false is it visible?

* `diagram` if there is an "re:diagrams" frame, draw it. default: true
* `boundaries` default: true
* `faces` default: true
* `edges` default: true
* `vertices` default: false

```
let foldedSVG = FOLD_SVG.toSVG(foldObject, {frame:1});
```

## components

access to methods to draw the components individually:

```javascript
foldDraw.components.svg.vertices(foldObject)
```

- boundaries
- vertices
- edges
- faces
- faces_vertices
- faces_edges
