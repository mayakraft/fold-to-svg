/**
 * options:
 * ["width"] width of SVG (not viewport, which is in FOLD coordinate space)
 * ["height"] height of SVG (not viewport, which is in FOLD coordinate space)
 * ["style"] CSS style to be placed in the header
 * ["frame"] render a certain frame in "file_frames", default: top level
 * rendering layers, with their default setting:
 *   "vertices": false
 *   "edges": true
 *   "faces_vertices": true
 *   "faces_edges": false
 *   "boundaries": true
 *
 * // maybe soon...
 * ["svg"] initialize an SVG to draw into. by default this will create one
 * ["foldAngle"] convert fold-angle into alpha value for stroke
 */

import * as SVG from "./svg";
import { default as defaultStyle } from "./styles/default";
import {
	bounding_rect,
	get_boundary_vertices,
	faces_matrix_coloring,
	faces_coloring
} from "./graph";

const CREASE_NAMES = {
	B: "boundary", b: "boundary",
	M: "mountain", m: "mountain",
	V: "valley",   v: "valley",
	F: "mark",     f: "mark",
	U: "mark",     u: "mark"
};

const DISPLAY_NAME = {
	vertices: "vertices",
	edges: "creases",
	faces_vertices: "faces",
	faces_edges: "faces_edges",
	boundaries: "boundaries"
};

/**
 * specify a frame number otherwise it will render the top level
 */
export const fold_to_svg = function(fold, options) {
	let svg, style;
	let graph = fold;
	let groups = {
		boundaries: true,
		faces_vertices: true,
		faces_edges: false,
		edges: true,
		vertices: false
	};
	if (options != null) {
		if (options.frame != null) {
			graph = flatten_frame(fold, options.frame);
		}
		if (options.style != null) {
			style = options.style;
		}
		svg = (options.svg != null) ? options.svg : SVG.svg();

		if (options.svg != null) {
			while (svg.children.length > 0) {
				svg.removeChild(svg.children[0]);
			}
		}

		Object.keys(groups)
			.filter(key => options[key] != null)
			.forEach(key => groups[key] = options[key]);
	}
		// update a previously initialized // vs. // svg create a new svg
			// todo: this only updates similar group arrangement
			//  need a pathway for if groups change

	if (svg === undefined) { svg = SVG.svg(); }
	if (style === undefined) { style = defaultStyle; }

	let styleElement = SVG.style();
	svg.appendChild(styleElement);
	svg.setAttribute("width", "500px");
	svg.setAttribute("height", "500px");

	let groupNames = Object.keys(groups)
		.filter(key => groups[key] != null)
		.map(singular => DISPLAY_NAME[singular]);

	Object.keys(groups)
		.filter(key => groups[key] === false)
		.forEach(key => delete groups[key]);

	// alternatively, get already-initialized groups from the options
	Object.keys(groups).forEach(key => {
		groups[key] = SVG.group();
		groups[key].setAttribute("class", DISPLAY_NAME[key]);
		svg.appendChild(groups[key]);
	});

	// draw geometry into groups
	Object.keys(groups).forEach(key =>
		drawFunc[key](graph).forEach(o =>
			groups[key].appendChild(o)
		)
	);

	let rect = bounding_rect(graph);
	SVG.setViewBox(svg, ...rect);

	// fill CSS style with --crease-width, and custom or a default style
	let vmin = rect[2] > rect[3] ? rect[3] : rect[2];
	let styleString = `
svg { --crease-width: ${vmin*0.005}; }
${style}
`;
	// wrap style in CDATA section
	var docu = new DOMParser().parseFromString('<xml></xml>', 'application/xml')
	var cdata = docu.createCDATASection(styleString);
	styleElement.appendChild(cdata);
	return svg;
};

const svgBoundaries = function(graph) {
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

const svgVertices = function(graph, options) {
	let radius = options && options.radius ? options.radius : 0.01;
	return graph.vertices_coords.map((v,i) => {
		let c = SVG.circle(v[0], v[1], radius);
		c.setAttribute("class", "vertex");
		c.setAttribute("id", ""+i);
		return c;
	});
};

const svgEdges = function(graph) {
	if ("edges_vertices" in graph === false ||
	    "vertices_coords" in graph === false) {
		return [];
	}
	let edges = graph.edges_vertices
		.map(ev => ev.map(v => graph.vertices_coords[v]));
	let eAssignments = graph.edges_assignment.map(a => CREASE_NAMES[a]);
	return edges.map((e,i) => {
		let l = SVG.line(e[0][0], e[0][1], e[1][0], e[1][1]);
		l.setAttribute("class", eAssignments[i]);
		l.setAttribute("id", ""+i);
		return l;
	});
};

const svgFacesVertices = function(graph) {
	if ("faces_vertices" in graph === false ||
	    "vertices_coords" in graph === false) {
		return [];
	}
	let fAssignments = graph.faces_vertices.map(fv => "face");
	let facesV = !(graph.faces_vertices) ? [] : graph.faces_vertices
		.map(fv => fv.map(v => graph.vertices_coords[v]))
		// .map(face => Geom.Polygon(face));
	// facesV = facesV.map(face => face.scale(0.6666));
	return facesV.filter(f => f != null).map((face, i) => {
		let p = SVG.polygon(face);
		p.setAttribute("class", fAssignments[i]);
		p.setAttribute("id", ""+i);
		return p;
	});
};

const svgFacesEdges = function(graph) {
	if ("faces_edges" in graph === false ||
	    "edges_vertices" in graph === false ||
	    "vertices_coords" in graph === false) {
		return [];
	}
	let fAssignments = graph.faces_vertices.map(fv => "face");
	let facesE = !(graph.faces_edges) ? [] : graph.faces_edges
		.map(face_edges => face_edges
			.map(edge => graph.edges_vertices[edge])
			.map((vi,i,arr) => {
				let next = arr[(i+1)%arr.length];
				return (vi[1] === next[0] || vi[1] === next[1]
					? vi[0] : vi[1]);
			}).map(v => graph.vertices_coords[v])
		)
		// .map(face => Geom.Polygon(face));
	// facesE = facesE.map(face => face.scale(0.8333));
	return facesE.filter(f => f != null).map((face, i) => {
		let p = SVG.polygon(face);
		p.setAttribute("class", fAssignments[i]);
		p.setAttribute("id", ""+i);
		return p;
	});
};

const faces_sorted_by_layer = function(faces_layer) {
	return faces_layer.map((layer,i) => ({layer:layer, i:i}))
		.sort((a,b) => a.layer-b.layer)
		.map(el => el.i)
}

const svgFaces = function(graph) {
	if ("faces_vertices" in graph === false ||
	    "vertices_coords" in graph === false) {
		return [];
	}
	let facesV = graph.faces_vertices
		.map(fv => fv.map(v => graph.vertices_coords[v]))
		// .map(face => Geom.Polygon(face));

	// determine coloring of each face
	let coloring = graph["re:faces_coloring"];
	if (coloring == null) {
		if ("re:faces_matrix" in graph) {
			coloring = faces_matrix_coloring(graph["re:faces_matrix"]);
		} else {
			// last resort. assuming a lot with the 0 face.
			coloring = faces_coloring(graph, 0);
		}
	}

	// determine layer order
	let orderIsCertain = graph["re:faces_layer"] != null 
		&& graph["re:faces_layer"].length === graph.faces_vertices.length;

	let order = orderIsCertain
		? faces_sorted_by_layer(graph["re:faces_layer"])
		: graph.faces_vertices.map((_,i) => i);

	return orderIsCertain
		? order.map(i => {
				let p = SVG.polygon(facesV[i]);
				p.setAttribute("class", coloring[i] ? "front" : "back");
				p.setAttribute("id", ""+i);
				return p;
			})
		: order.map(i => {
				let p = SVG.polygon(facesV[i]);
				p.setAttribute("id", ""+i);
				return p;
			});
};

export const updateFaces = function(graph, group) {
	let facesV = graph.faces_vertices
		.map(fv => fv.map(v => graph.vertices_coords[v]));
	let strings = facesV
		.map(face => face.reduce((a, b) => a + b[0] + "," + b[1] + " ", ""));
	Array.from(group.children)
		.sort((a,b) => parseInt(a.id) - parseInt(b.id))
		.forEach((face, i) => face.setAttribute("points", strings[i]));
};

export const updateCreases = function(graph, group) {
	let edges = graph.edges_vertices
		.map(ev => ev.map(v => graph.vertices_coords[v]));

	Array.from(group.children)
		// .sort((a,b) => parseInt(a.id) - parseInt(b.id))
		.forEach((line,i) => {
			line.setAttribute("x1", edges[i][0][0]);
			line.setAttribute("y1", edges[i][0][1]);
			line.setAttribute("x2", edges[i][1][0]);
			line.setAttribute("y2", edges[i][1][1]);
		});
};

const drawFunc = {
	vertices: svgVertices,
	edges: svgEdges,
	faces_vertices: svgFaces,
	faces_edges: svgFacesEdges,
	boundaries: svgBoundaries
};
