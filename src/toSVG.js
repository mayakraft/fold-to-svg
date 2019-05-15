/**
 * ## options
 * ### boolean
 * - render layers, with their default setting:
 *   - "vertices": false
 *   - "edges": true
 *   - "faces_vertices": true
 *   - "faces_edges": false
 *   - "boundaries": true
 *
 * - "style" incorporate a stylesheet (default/custom) into <svg> header
 *     options: "attributes", "inline", "css". default "css"
 *
 * ### data
 * ["width"] width of SVG (not viewport, which is in FOLD coordinate space)
 * ["height"] height of SVG (not viewport, which is in FOLD coordinate space)
 * ["stylesheet"] CSS style to be placed in the header
 * ["frame"] render a certain frame in "file_frames", default: top level
 *
 * // maybe soon...
 * "shadows": folded faces have little edge shadows
 * ["svg"] initialize an SVG to draw into. by default this will create one
 * ["foldAngle"] show fold-angles as alpha values for stroke
 */

let DOMParser = (typeof window === "undefined" || window === null)
	? undefined
	: window.DOMParser;
if (typeof DOMParser === "undefined" || DOMParser === null) {
	DOMParser = require("xmldom").DOMParser;
}
let XMLSerializer = (typeof window === "undefined" || window === null)
	? undefined
	: window.XMLSerializer;
if (typeof XMLSerializer === "undefined" || XMLSerializer === null) {
	XMLSerializer = require("xmldom").XMLSerializer;
}

import * as SVG from "./svg";
import vkXML from "../include/vkbeautify-xml";
import { default as defaultStyle } from "./styles/default";
import {
	bounding_rect,
	get_boundary_vertices,
	faces_matrix_coloring,
	faces_coloring,
	flatten_frame
} from "./graph";

const CREASE_NAMES = {
	B: "boundary", b: "boundary",
	M: "mountain", m: "mountain",
	V: "valley",   v: "valley",
	F: "mark",     f: "mark",
	U: "mark",     u: "mark"
};  // easy to remember: "fuck you, mark"

const DISPLAY_NAME = {
	vertices: "vertices",
	edges: "creases",
	faces: "faces",
	boundaries: "boundaries"
};

/**
 * specify a frame number otherwise it will render the top level
 */
export const fold_to_svg = function(fold, options) {
	let svg = SVG.svg();
	let stylesheet = defaultStyle;
	let graph = fold;
	let style = true;
	let groups = {
		boundaries: true,
		faces: true,
		edges: true,
		vertices: false
	};
	let width = "500px";
	let height = "500px";
	if (options != null) {
		if (options.width != null) { width = options.width; }
		if (options.height != null) { height = options.height; }
		if (options.style != null) { style = options.style; }
		if (options.stylesheet != null) { stylesheet = options.stylesheet; }
		if (options.frame != null) {
			graph = flatten_frame(fold, options.frame);
		}
	}
	// copy file/frame classes to top level
	let file_classes = (graph.file_classes != null
		? graph.file_classes : []).join(" ");
	let frame_classes = graph.frame_classes != null
		? graph.frame_classes : [].join(" ");
	let top_level_classes = [file_classes, frame_classes]
		.filter(s => s !== "")
		.join(" ");
	svg.setAttribute("class", top_level_classes);
	svg.setAttribute("width", width);
	svg.setAttribute("height", height);

	let styleElement = SVG.style();
	svg.appendChild(styleElement);

	Object.keys(groups)
		.filter(key => groups[key] === false)
		.forEach(key => delete groups[key]);
	Object.keys(groups).forEach(key => {
		groups[key] = SVG.group();
		groups[key].setAttribute("class", DISPLAY_NAME[key]);
		svg.appendChild(groups[key]);
	});

	// draw geometry into groups
	Object.keys(groups).forEach(key =>
		components[key](graph).forEach(o =>
			groups[key].appendChild(o)
		)
	);

	let rect = bounding_rect(graph);
	SVG.setViewBox(svg, ...rect);

	// fill CSS style with --crease-width, and custom or a default style
	let vmin = rect[2] > rect[3] ? rect[3] : rect[2];
	let innerStyle = (style
		? `\nsvg { --crease-width: ${vmin*0.005}; }\n${stylesheet}`
		: `\nsvg { --crease-width: ${vmin*0.005}; }\n`);

	// wrap style in CDATA section
	var docu = (new DOMParser())
		.parseFromString('<xml></xml>', 'application/xml');
	var cdata = docu.createCDATASection(innerStyle);
	styleElement.appendChild(cdata);

	let stringified = (new XMLSerializer()).serializeToString(svg);
	let beautified = vkXML(stringified);
	return beautified;
};

export const svgBoundaries = function(graph) {
	// todo this needs to be able to handle multiple boundaries
	if ("edges_vertices" in graph === false ||
	    "vertices_coords" in graph === false) {
		return [];
	}
	let boundary = get_boundary_vertices(graph)
		.map(v => graph.vertices_coords[v]);
	let p = SVG.polygon(boundary);
	p.setAttribute("class", "boundary");
	return [p];
};

export const svgVertices = function(graph, options) {
	if ("vertices_coords" in graph === false) {
		return [];
	}
	let radius = options && options.radius ? options.radius : 0.01;
	let svg_vertices = graph.vertices_coords
		.map(v => SVG.circle(v[0], v[1], radius));
	svg_vertices.forEach((c,i) => c.setAttribute("id", ""+i));
	return svg_vertices;
};

export const svgEdges = function(graph) {
	if ("edges_vertices" in graph === false ||
	    "vertices_coords" in graph === false) {
		return [];
	}
	let svg_edges = graph.edges_vertices
		.map(ev => ev.map(v => graph.vertices_coords[v]))
		.map(e => SVG.line(e[0][0], e[0][1], e[1][0], e[1][1]));
	svg_edges.forEach((edge, i) => edge.setAttribute("id", ""+i));
	make_edge_assignment_names(graph)
		.forEach((a, i) => svg_edges[i].setAttribute("class", a));
	return svg_edges;
};

const svgFaces = function(graph) {
	if ("faces_vertices" in graph === true) {
		return svgFacesVertices(graph);
	} else if ("faces_edges" in graph === true) {
		return svgFacesEdges(graph);
	}
	return [];
}

export const svgFacesVertices = function(graph) {
	if ("faces_vertices" in graph === false ||
	    "vertices_coords" in graph === false) {
		return [];
	}
	let svg_faces = graph.faces_vertices
		.map(fv => fv.map(v => graph.vertices_coords[v]))
		.map(face => SVG.polygon(face));
	svg_faces.forEach((face, i) => face.setAttribute("id", ""+i));
	return finalize_faces(graph, svg_faces);
};

export const svgFacesEdges = function(graph) {
	if ("faces_edges" in graph === false ||
	    "edges_vertices" in graph === false ||
	    "vertices_coords" in graph === false) {
		return [];
	}
	let svg_faces = graph.faces_edges
		.map(face_edges => face_edges
			.map(edge => graph.edges_vertices[edge])
			.map((vi, i, arr) => {
				let next = arr[(i+1)%arr.length];
				return (vi[1] === next[0] || vi[1] === next[1] ? vi[0] : vi[1]);
			}).map(v => graph.vertices_coords[v])
		).map(face => SVG.polygon(face));
	svg_faces.forEach((face, i) => face.setAttribute("id", ""+i));
	return finalize_faces(graph, svg_faces);
};

const finalize_faces = function(graph, svg_faces) {
	let orderIsCertain = graph["faces_re:layer"] != null 
		&& graph["faces_re:layer"].length === graph.faces_vertices.length;
	// todo: include other ways of determining faces_ordering
	if (orderIsCertain) {
		// only if face order is known
		make_faces_sidedness(graph)
			.forEach((side, i) => svg_faces[i].setAttribute("class", side));
	}
	return (orderIsCertain
		? faces_sorted_by_layer(graph["faces_re:layer"]).map(i => svg_faces[i])
		: svg_faces);
};

const make_faces_sidedness = function(graph) {
	// determine coloring of each face
	let coloring = graph["faces_re:coloring"];
	if (coloring == null) {
		coloring = ("faces_re:matrix" in graph)
			? faces_matrix_coloring(graph["faces_re:matrix"])
				// replace this with a face-vertex-winding-order calculator
			: faces_coloring(graph, 0);
	}
	return coloring.map(c => c ? "front" : "back");
};

const faces_sorted_by_layer = function(faces_layer) {
	return faces_layer.map((layer,i) => ({layer:layer, i:i}))
		.sort((a,b) => a.layer-b.layer)
		.map(el => el.i)
};

const make_edge_assignment_names = function(graph) {
	return (graph.edges_vertices == null || graph.edges_assignment == null ||
		graph.edges_vertices.length !== graph.edges_assignment.length
		? []
		: graph.edges_assignment.map(a => CREASE_NAMES[a]));
};

// export const updateFaces = function(graph, group) {
// 	let facesV = graph.faces_vertices
// 		.map(fv => fv.map(v => graph.vertices_coords[v]));
// 	let strings = facesV
// 		.map(face => face.reduce((a, b) => a + b[0] + "," + b[1] + " ", ""));
// 	Array.from(group.children)
// 		.sort((a,b) => parseInt(a.id) - parseInt(b.id))
// 		.forEach((face, i) => face.setAttribute("points", strings[i]));
// };

// export const updateCreases = function(graph, group) {
// 	let edges = graph.edges_vertices
// 		.map(ev => ev.map(v => graph.vertices_coords[v]));

// 	Array.from(group.children)
// 		// .sort((a,b) => parseInt(a.id) - parseInt(b.id))
// 		.forEach((line,i) => {
// 			line.setAttribute("x1", edges[i][0][0]);
// 			line.setAttribute("y1", edges[i][0][1]);
// 			line.setAttribute("x2", edges[i][1][0]);
// 			line.setAttribute("y2", edges[i][1][1]);
// 		});
// };

const components = {
	vertices: svgVertices,
	edges: svgEdges,
	faces: svgFaces,
	boundaries: svgBoundaries
};
