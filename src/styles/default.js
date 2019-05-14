const style = `svg * {stroke-width:var(--crease-width); stroke-linecap:round; stroke:black;}
polygon {fill:none; stroke:none; stroke-linejoin:bevel;}
.boundary {fill:white; stroke:black;}
.mark {stroke:#BBB;}
.mountain {stroke:#00F;}
.valley{stroke:#F00;stroke-dasharray:calc(var(--crease-width)*2) calc(var(--crease-width)*2);}
.foldedForm .boundary polygon {fill:none;stroke:none;}
.foldedForm .faces polygon { stroke:#000; }
.foldedForm .faces .front { fill:peru; }
.foldedForm .faces .back { fill:linen; }
.foldedForm .creases line { stroke:none; }`;

export default style;