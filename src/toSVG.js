import * as SVG from "./svg";
import {
	bounding_rect,
	get_boundary_vertices,
	faces_matrix_coloring,
	faces_coloring
} from "./graph";


const CREASE_NAMES = {
	"B": "boundary", "b": "boundary",
	"M": "mountain", "m": "mountain",
	"V": "valley",   "v": "valley",
	"F": "mark",     "f": "mark",
	"U": "mark",     "u": "mark"
};

const groupNamesPlural = {
	boundary: "boundaries",
	face: "faces",
	crease: "creases",
	vertex: "vertices"
};

/**
 * specify a frame number otherwise it will render the top level
 */
export const fold_to_svg = function(fold, cssRules) {
	// console.log("fold_to_svg start");
	// let graph = frame_number
	// 	? flatten_frame(fold, frame_number)
	// 	: fold;
	let graph = fold;
	// if (isFolded(graph)) { }
	let svg = SVG.svg();
	let styleElement = SVG.style();
	svg.appendChild(styleElement);
	// svg.setAttribute("x", "0px");
	// svg.setAttribute("y", "0px");
	svg.setAttribute("width", "500px");
	svg.setAttribute("height", "500px");

	let groupNames = ["boundary", "face", "crease", "vertex"]
		.map(singular => groupNamesPlural[singular])
	let groups = groupNames.map(key => SVG.group());
	groups.forEach(g => svg.appendChild(g));
	groups.forEach((g,i) => g.setAttribute("id", groupNames[i]));
	let obj = {};
	groupNames.forEach((name,i) => obj[name] = groups[i]);
	intoGroups(graph, obj);
	let r = bounding_rect(graph);
	SVG.setViewBox(svg, ...r);

	// fill CSS style with --crease-width, and custom or a default style
	let vmin = r[2] > r[3] ? r[3] : r[2];
	let styleString = "\n";
	styleString += "svg {\n --crease-width: " + vmin*0.005 + ";\n}\n";
	styleString += (cssRules != null)
		? cssRules
		: defaultStyle;
	styleString += "\n";
	// wrap style in CDATA section
	var docu = new DOMParser().parseFromString('<xml></xml>', 'application/xml')
	var cdata = docu.createCDATASection(styleString);
	styleElement.appendChild(cdata);
	return svg;
}

export const defaultStyle = "svg * {\n stroke-width: var(--crease-width);\n stroke-linecap: round;\n stroke: black;\n}\npolygon {\n fill: none;\n stroke: none;\n stroke-linejoin: bevel;\n}\n.boundary {\n fill: white;\n stroke: black;\n}\n.mountain{\n stroke: #e14929;\n}\n.valley{\n stroke: #314f69;\nstroke-dasharray: calc( var(--crease-width) * 2) calc( var(--crease-width) * 2);\n}\n.mark {\n stroke: #888;\n}\n.foldedForm #faces polygon {\n /*stroke: black;*/\n}\n.foldedForm #faces .front {\n fill: steelblue;\n}\n.foldedForm #faces .back {\n fill: peru;\n}\n.foldedForm #creases line {\n stroke: none;\n}";

/**
 * if you already have groups initialized, to save on re-initializing, pass the groups
 * in as values under these keys, and they will get drawn into.
 */
export const intoGroups = function(graph, {boundaries, faces, creases, vertices}) {
	if (boundaries){ drawBoundary(graph).forEach(b => boundaries.appendChild(b)); }
	if (faces){ drawFaces(graph).forEach(f => faces.appendChild(f)); }
	if (creases){ drawCreases(graph).forEach(c => creases.appendChild(c)); }
	if (vertices){ drawVertices(graph).forEach(v => vertices.appendChild(v)); }
}

const drawBoundary = function(graph) {
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

const drawVertices = function(graph, options) {
	let radius = options && options.radius ? options.radius : 0.01;
	return graph.vertices_coords.map((v,i) => {
		let c = SVG.circle(v[0], v[1], radius);
		c.setAttribute("class", "vertex");
		c.setAttribute("id", ""+i);
		return c;
	});
};

const drawCreases = function(graph) {
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

const drawFacesVertices = function(graph) {
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

const drawFacesEdges = function(graph) {
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

function faces_sorted_by_layer(faces_layer) {
	return faces_layer.map((layer,i) => ({layer:layer, i:i}))
		.sort((a,b) => a.layer-b.layer)
		.map(el => el.i)
}

const drawFaces = function(graph) {
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
