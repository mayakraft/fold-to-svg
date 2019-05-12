# FOLD ↔︎ SVG

convert [FOLD](https://github.com/edemaine/fold) file format into SVG, and back.

## SVG → FOLD

* infer crease type by style. style includes:
   * inline attributes on drawing primitives
   * `<style>` header
   * if a group (layer) is styled, all its children inherit the style

## FOLD → SVG

* accept user-supplied style sheet (CSS) as a parameter
