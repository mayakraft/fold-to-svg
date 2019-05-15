# FOLD ↔︎ SVG

convert [FOLD](https://github.com/edemaine/fold) file format into SVG, and back.

## FOLD → SVG

- [x] complete. currently testing

```
FOLD_SVG.toSVG(foldObject);
```
the second argument is an options {} object, includes:

* `stylesheet` CSS stylesheet to be placed in the header. styles the SVG.
* `frame` render a certain frame in "file_frames", default is the top level
* `width` width of SVG (not viewport, which is in FOLD coordinate space)
* `height` height of SVG

```
let foldedSVG = FOLD_SVG.toSVG(foldObject, {frame:1});
```

## SVG → FOLD

- [ ] in-progress

* infer crease type by style. style includes:
   * inline attributes on drawing primitives
   * `<style>` header
   * if a group (layer) is styled, all its children inherit the style
