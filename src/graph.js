
export const get_boundary_vertices = function(graph) {
	let edges_vertices_b = graph.edges_vertices.filter((ev,i) =>
		graph.edges_assignment[i] == "B" ||
		graph.edges_assignment[i] == "b"
	).map(arr => arr.slice());
	if (edges_vertices_b.length === 0) { return []; }
	// the index of keys[i] is an edge_vertex from edges_vertices_b
	//  the [] value is the indices in edges_vertices_b this i appears
	let keys = Array.from(Array(graph.vertices_coords.length)).map(_ => [])
	edges_vertices_b.forEach((ev,i) => ev.forEach(e => keys[e].push(i)))
	let edgeIndex = 0;
	let startVertex = edges_vertices_b[edgeIndex].shift();
	let nextVertex = edges_vertices_b[edgeIndex].shift();
	let vertices = [startVertex];
	while (vertices[0] !== nextVertex) {
		vertices.push(nextVertex);
		let whichEdges = keys[nextVertex];
		let thisKeyIndex = keys[nextVertex].indexOf(edgeIndex);
		if (thisKeyIndex === -1) { return; }
		keys[nextVertex].splice(thisKeyIndex, 1);
		let nextEdgeAndIndex = keys[nextVertex]
			.map((el,i) => ({key: el, i: i}))
			.filter(el => el.key !== edgeIndex).shift();
		if (nextEdgeAndIndex == null) { return; }
		keys[nextVertex].splice(nextEdgeAndIndex.i, 1);
		edgeIndex = nextEdgeAndIndex.key;
		let lastEdgeIndex = edges_vertices_b[edgeIndex].indexOf(nextVertex);
		if (lastEdgeIndex === -1) { return; }
		edges_vertices_b[edgeIndex].splice(lastEdgeIndex, 1);
		nextVertex = edges_vertices_b[edgeIndex].shift();
	}
	return vertices;
}


export const bounding_rect = function(graph) {
	if ("vertices_coords" in graph === false ||
		graph.vertices_coords.length <= 0) {
		return [0,0,0,0];
	}
	let dimension = graph.vertices_coords[0].length;
	let smallest = Array.from(Array(dimension)).map(_ => Infinity);
	let largest = Array.from(Array(dimension)).map(_ => -Infinity);
	graph.vertices_coords.forEach(v => v.forEach((n,i) => {
		if (n < smallest[i]) { smallest[i] = n; }
		if (n > largest[i]) { largest[i] = n; }
	}));
	let x = smallest[0];
	let y = smallest[1];
	let w = largest[0] - smallest[0];
	let h = largest[1] - smallest[1];
	return (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)
		? [0,0,0,0]
		: [x,y,w,h]);
}

/**
 * fragment splits overlapping edges at their intersections
 * and joins new edges at a new shared vertex.
 * this destroys and rebuilds all face data with face walking 
 */
export const fragment = function(graph, epsilon = Geom.core.EPSILON) {

	const EPSILON = 1e-12;
	const horizSort = function(a,b){ return a[0] - b[0]; }
	const vertSort = function(a,b){ return a[1] - b[1]; }
	// const horizSort2 = function(a,b){
	// 	return a.intersection[0] - b.intersection[0]; }
	// const vertSort2 = function(a,b){
	// 	return a.intersection[1] - b.intersection[1]; }

	const equivalent = function(a, b) {
		for (var i = 0; i < a.length; i++) {
			if (Math.abs(a[i] - b[i]) > epsilon) {
				return false;
			}
		}
		return true;
	}

	let edge_count = graph.edges_vertices.length;
	let edges = graph.edges_vertices.map(ev => [
		graph.vertices_coords[ev[0]],
		graph.vertices_coords[ev[1]]
	]);

	let edges_vector = edges.map(e => [e[1][0] - e[0][0], e[1][1] - e[0][1]]);
	let edges_magnitude = edges_vector.map(e => Math.sqrt(e[0]*e[0]+e[1]*e[1]));
	let edges_normalized = edges_vector
		.map((e,i) => [e[0]/edges_magnitude[i], e[1]/edges_magnitude[i]]);
	let edges_horizontal = edges_normalized.map(e => Math.abs(e[0]) > 0.7);//.707

	let crossings = Array.from(Array(edge_count - 1)).map(_ => []);
	for (let i = 0; i < edges.length-1; i++) {
		for (let j = i+1; j < edges.length; j++) {
			crossings[i][j] = Geom.core.intersection.edge_edge_exclusive(
				edges[i][0], edges[i][1],
				edges[j][0], edges[j][1]
			)
		}
	}

	let edges_intersections = Array.from(Array(edge_count)).map(_ => []);
	for (let i = 0; i < edges.length-1; i++) {
		for (let j = i+1; j < edges.length; j++) {
			if (crossings[i][j] != null) {
				// warning - these are shallow pointers
				edges_intersections[i].push(crossings[i][j]);
				edges_intersections[j].push(crossings[i][j]);
			}
		}
	}

	// let edges_intersections2 = Array.from(Array(edge_count)).map(_ => []);
	// for (let i = 0; i < edges.length-1; i++) {
	// 	for (let j = i+1; j < edges.length; j++) {
	// 		if (crossings[i][j] != null) {
	// 			// warning - these are shallow pointers
	// 			edges_intersections2[i].push({edge:j, intersection:crossings[i][j]});
	// 			edges_intersections2[j].push({edge:i, intersection:crossings[i][j]});
	// 		}
	// 	}
	// }

	edges.forEach((e,i) => e.sort(edges_horizontal[i] ? horizSort : vertSort));

	edges_intersections.forEach((e,i) => 
		e.sort(edges_horizontal[i] ? horizSort : vertSort)
	)
	// edges_intersections2.forEach((e,i) => 
	// 	e.sort(edges_horizontal[i] ? horizSort2 : vertSort2)
	// )

	let new_edges = edges_intersections
		.map((e,i) => [edges[i][0], ...e, edges[i][1]])
		.map(ev => 
			Array.from(Array(ev.length-1))
				.map((_,i) => [ev[i], ev[(i+1)]])
		);

	// remove degenerate edges
	new_edges = new_edges
		.map(edgeGroup => edgeGroup
			.filter(e => false === e
				.map((_,i) => Math.abs(e[0][i] - e[1][i]) < epsilon)
				.reduce((a,b) => a && b, true)
			)
		);

	// let edge_map = new_edges.map(edge => edge.map(_ => counter++));
	let edge_map = new_edges
		.map((edge,i) => edge.map(_ => i))
		.reduce((a,b) => a.concat(b), []);

	let vertices_coords = new_edges
		.map(edge => edge.reduce((a,b) => a.concat(b), []))
		.reduce((a,b) => a.concat(b), [])
	let counter = 0;
	let edges_vertices = new_edges
		.map(edge => edge.map(_ => [counter++, counter++]))
		.reduce((a,b) => a.concat(b), []);

	let vertices_equivalent = Array
		.from(Array(vertices_coords.length)).map(_ => []);
	for (var i = 0; i < vertices_coords.length-1; i++) {
		for (var j = i+1; j < vertices_coords.length; j++) {
			vertices_equivalent[i][j] = equivalent(
				vertices_coords[i],
				vertices_coords[j]
			);
		}
	}

	// console.log(vertices_equivalent);

	let vertices_map = vertices_coords.map(vc => undefined)

	vertices_equivalent.forEach((row,i) => row.forEach((eq,j) => {
		if (eq){
			vertices_map[j] = vertices_map[i] === undefined ? i : vertices_map[i];
		}
	}));
	let vertices_remove = vertices_map.map(m => m !== undefined);
	vertices_map.forEach((map,i) => {
		if(map === undefined) { vertices_map[i] = i; }
	});

	// console.log("vertices_map", vertices_map);

	edges_vertices.forEach((edge,i) => edge.forEach((v,j) => {
		edges_vertices[i][j] = vertices_map[v];
	}));

	let flat = {
		vertices_coords,
		edges_vertices
	}

	// console.log("edges_vertices", edges_vertices);
	// console.log("vertices_remove", vertices_remove);
	let vertices_remove_indices = vertices_remove
		.map((rm,i) => rm ? i : undefined)
		.filter(i => i !== undefined);
	Graph.remove_vertices(flat, vertices_remove_indices);

	// console.log(flat);

	// convert.edges_vertices_to_vertices_vertices_sorted(flat);
	// convert.vertices_vertices_to_faces_vertices(flat);
	// convert.faces_vertices_to_faces_edges(flat);

	return flat;
}


// faces_faces is a set of faces edge-adjacent to a face.
// for every face.
export const make_faces_faces = function(graph) {
	let nf = graph.faces_vertices.length;
	let faces_faces = Array.from(Array(nf)).map(() => []);
	let edgeMap = {};
	graph.faces_vertices.forEach((vertices_index, idx1) => {
		if (vertices_index === undefined) { return; }  //todo: necessary?
		let n = vertices_index.length;
		vertices_index.forEach((v1, i, vs) => {
			let v2 = vs[(i + 1) % n];
			if (v2 < v1) [v1, v2] = [v2, v1];
			let key = v1 + " " + v2;
			if (key in edgeMap) {
				let idx2 = edgeMap[key];
				faces_faces[idx1].push(idx2);
				faces_faces[idx2].push(idx1);
			} else {
				edgeMap[key] = idx1;
			}
		}); 
	});
	return faces_faces;
}


export const faces_matrix_coloring = function(faces_matrix) {
	return faces_matrix
		.map(m => m[0] * m[3] - m[1] * m[2])
		.map(c => c >= 0);
}
/**
 * true/false: which face shares color with root face
 * the root face (and any similar-color face) will be marked as true
 */
export const faces_coloring = function(graph, root_face = 0){
	let coloring = [];
	coloring[root_face] = true;
	make_face_walk_tree(graph, root_face).forEach((level, i) => 
		level.forEach((entry) => coloring[entry.face] = (i % 2 === 0))
	);
	return coloring;
}

// root_face will become the root node
export const make_face_walk_tree = function(graph, root_face = 0){
	let new_faces_faces = make_faces_faces(graph);
	if (new_faces_faces.length <= 0) {
		return [];
	}
	var visited = [root_face];
	var list = [[{ face: root_face, parent: undefined, edge: undefined, level: 0 }]];
	// let current_level = 0;
	do{
		// current_level += 1;
		list[list.length] = list[list.length-1].map((current) =>{
			let unique_faces = new_faces_faces[current.face]
				.filter(f => visited.indexOf(f) === -1);
			visited = visited.concat(unique_faces);
			return unique_faces.map(f => ({
				face: f,
				parent: current.face,
				// level: current_level,
				edge: graph.faces_vertices[f]
					.filter(v => graph.faces_vertices[current.face].indexOf(v) !== -1)
					.sort((a,b) => a-b)
			}))
		}).reduce((prev,curr) => prev.concat(curr),[])
	} while(list[list.length-1].length > 0);
	if(list.length > 0 && list[list.length-1].length == 0){ list.pop(); }
	return list;
}

