
let DOMParser = (typeof window === "undefined" || window === null)
	? undefined
	: window.DOMParser;
if (typeof DOMParser === "undefined" || DOMParser === null) {
	DOMParser = require("xmldom").DOMParser;
}
let document = (typeof window === "undefined" || window === null)
	? undefined
	: window.document;
if (typeof document === "undefined" || document === null) {
	document = new DOMParser()
		.parseFromString("<!DOCTYPE html><title>a</title>", "text/html")
}

const svgNS = "http://www.w3.org/2000/svg";

export const svg = function() {
	let svgImage = document.createElementNS(svgNS, "svg");
	svgImage.setAttribute("version", "1.1");
	svgImage.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	return svgImage;
};

export const group = function() {
	let g = document.createElementNS(svgNS, "g");
	return g;
};

export const style = function() {
	let style = document.createElementNS(svgNS, "style");
	style.setAttribute("type", "text/css");
	return style;
}

export const shadowFilter = function(id_name = "shadow") {
	let defs = document.createElementNS(svgNS, "defs");

	let filter = document.createElementNS(svgNS, "filter");
	filter.setAttribute("width", "200%");
	filter.setAttribute("height", "200%");
	filter.setAttribute("id", id_name);

	let blur = document.createElementNS(svgNS, "feGaussianBlur");
	blur.setAttribute("in", "SourceAlpha");
	blur.setAttribute("stdDeviation", "0.005");
	blur.setAttribute("result", "blur");

	let offset = document.createElementNS(svgNS, "feOffset");
	offset.setAttribute("in", "blur");
	offset.setAttribute("result", "offsetBlur");

	let flood = document.createElementNS(svgNS, "feFlood");
	flood.setAttribute("flood-color", "#000");
	flood.setAttribute("flood-opacity", "0.3");
	flood.setAttribute("result", "offsetColor");

	let composite = document.createElementNS(svgNS, "feComposite");
	composite.setAttribute("in", "offsetColor");
	composite.setAttribute("in2", "offsetBlur");
	composite.setAttribute("operator", "in");
	composite.setAttribute("result", "offsetBlur");

	let merge = document.createElementNS(svgNS, "feMerge");
	let mergeNode1 = document.createElementNS(svgNS, "feMergeNode");
	let mergeNode2 = document.createElementNS(svgNS, "feMergeNode");
	mergeNode2.setAttribute("in", "SourceGraphic");
	merge.appendChild(mergeNode1);
	merge.appendChild(mergeNode2);

	defs.appendChild(filter);

	filter.appendChild(blur);
	filter.appendChild(offset);
	filter.appendChild(flood);
	filter.appendChild(composite);
	filter.appendChild(merge);
	return defs;
}



// export const shadowFilter = function(id_name = "shadow") {
// 	let defs = document.createElementNS(svgNS, "defs");
// 	let filter = document.createElementNS(svgNS, "filter");
// 	filter.setAttribute("width", "200%");
// 	filter.setAttribute("height", "200%");
// 	filter.setAttribute("id", id_name);
// 	let blur = document.createElementNS(svgNS, "feGaussianBlur");
// 	blur.setAttribute("result", "blurOut");
// 	blur.setAttribute("in", "SourceGraphic");
// 	blur.setAttribute("stdDeviation", 0.005);
// 	let merge = document.createElementNS(svgNS, "feMerge");
// 	let mergeNode1 = document.createElementNS(svgNS, "feMergeNode");
// 	let mergeNode2 = document.createElementNS(svgNS, "feMergeNode");
// 	mergeNode2.setAttribute("in", "SourceGraphic");
// 	defs.appendChild(filter);
// 	filter.appendChild(blur);
// 	filter.appendChild(merge);
// 	merge.appendChild(mergeNode1);
// 	merge.appendChild(mergeNode2);
// 	return defs;
// }

/**
 * geometry primitives
 */
export const line = function(x1, y1, x2, y2) {
	let shape = document.createElementNS(svgNS, "line");
	shape.setAttributeNS(null, "x1", x1);
	shape.setAttributeNS(null, "y1", y1);
	shape.setAttributeNS(null, "x2", x2);
	shape.setAttributeNS(null, "y2", y2);
	return shape;
};

export const circle = function(x, y, radius) {
	let shape = document.createElementNS(svgNS, "circle");
	shape.setAttributeNS(null, "cx", x);
	shape.setAttributeNS(null, "cy", y);
	shape.setAttributeNS(null, "r", radius);
	return shape;
};

export const polygon = function(pointsArray) {
	let shape = document.createElementNS(svgNS, "polygon");
	setPoints(shape, pointsArray);
	return shape;
};

export const bezier = function(fromX, fromY, c1X, c1Y, c2X, c2Y, toX, toY) {
	let d = "M " + fromX + "," + fromY + " C " + c1X + "," + c1Y +
			" " + c2X + "," + c2Y + " " + toX + "," + toY;
	let shape = document.createElementNS(svgNS, "path");
	shape.setAttributeNS(null, "d", d);
	return shape;
};

export const arcArrow = function(startPoint, endPoint, options) {
	// options:
	// - padding: the arrow backs off from the target by a tiny fraction
	// - color
	let p = {
		color: "#000",     // css
		strokeWidth: 0.01, // css
		width: 0.025,   // pixels
		length: 0.075,  // pixels
		bend: 0.3,      // %
		pinch: 0.618,   // %
		padding: 0.5,   // %
		side: true,
		start: false,
		end: true,
		strokeStyle: "",
		fillStyle: "",
	};

	if (typeof options === "object" && options !== null) {
		Object.assign(p, options);
	}

	let arrowFill = [
		"stroke:none",
		"fill:"+p.color,
		p.fillStyle
	].filter(a => a !== "").join(";");

	let arrowStroke = [
		"fill:none",
		"stroke:" + p.color,
		"stroke-width:" + p.strokeWidth,
		p.strokeStyle
	].filter(a => a !== "").join(";");

	let vector = [endPoint[0]-startPoint[0], endPoint[1]-startPoint[1]];
	let perpendicular = [vector[1], -vector[0]];
	let midpoint = [startPoint[0] + vector[0]/2, startPoint[1] + vector[1]/2];
	let bezPoint = [
		midpoint[0] + perpendicular[0]*(p.side?1:-1) * p.bend,
		midpoint[1] + perpendicular[1]*(p.side?1:-1) * p.bend
	];

	let bezStart = [bezPoint[0] - startPoint[0], bezPoint[1] - startPoint[1]];
	let bezEnd = [bezPoint[0] - endPoint[0], bezPoint[1] - endPoint[1]];
	let bezStartLen = Math.sqrt(bezStart[0]*bezStart[0]+bezStart[1]*bezStart[1]);
	let bezEndLen = Math.sqrt(bezEnd[0]*bezEnd[0]+bezEnd[1]*bezEnd[1]);
	let bezStartNorm = [bezStart[0]/bezStartLen, bezStart[1]/bezStartLen];
	let bezEndNorm = [bezEnd[0]/bezEndLen, bezEnd[1]/bezEndLen];

	let arcStart = [
		startPoint[0] + bezStartNorm[0]*p.length*((p.start?1:0)+p.padding),
		startPoint[1] + bezStartNorm[1]*p.length*((p.start?1:0)+p.padding)
	];
	let arcEnd = [
		endPoint[0] + bezEndNorm[0]*p.length*((p.end?1:0)+p.padding),
		endPoint[1] + bezEndNorm[1]*p.length*((p.end?1:0)+p.padding)
	];
	let controlStart = [
		arcStart[0] + (bezPoint[0] - arcStart[0]) * p.pinch,
		arcStart[1] + (bezPoint[1] - arcStart[1]) * p.pinch
	];
	let controlEnd = [
		arcEnd[0] + (bezPoint[0] - arcEnd[0]) * p.pinch,
		arcEnd[1] + (bezPoint[1] - arcEnd[1]) * p.pinch
	];

	let startVec = [-bezStartNorm[0], -bezStartNorm[1]];
	let endVec = [-bezEndNorm[0], -bezEndNorm[1]];
	let startNormal = [startVec[1], -startVec[0]];
	let endNormal = [endVec[1], -endVec[0]];

	let startPoints = [
		[arcStart[0]+startNormal[0]*-p.width, arcStart[1]+startNormal[1]*-p.width],
		[arcStart[0]+startNormal[0]*p.width, arcStart[1]+startNormal[1]*p.width],
		[arcStart[0]+startVec[0]*p.length, arcStart[1]+startVec[1]*p.length]
	];
	let endPoints = [
		[arcEnd[0]+endNormal[0]*-p.width, arcEnd[1]+endNormal[1]*-p.width],
		[arcEnd[0]+endNormal[0]*p.width, arcEnd[1]+endNormal[1]*p.width],
		[arcEnd[0]+endVec[0]*p.length, arcEnd[1]+endVec[1]*p.length]
	];

	// draw
	let arrowGroup = document.createElementNS(svgNS, "g");
	let arrowArc = bezier(
		arcStart[0], arcStart[1], controlStart[0], controlStart[1],
		controlEnd[0], controlEnd[1], arcEnd[0], arcEnd[1]
	);
	arrowArc.setAttribute("style", arrowStroke);
	arrowGroup.appendChild(arrowArc);
	if (p.start) {
		let startHead = polygon(startPoints);
		startHead.setAttribute("style", arrowFill);
		arrowGroup.appendChild(startHead);
	}
	if (p.end) {
		let endHead = polygon(endPoints);
		endHead.setAttribute("style", arrowFill);
		arrowGroup.appendChild(endHead);
	}
	return arrowGroup;
}


const setPoints = function(polygon, pointsArray) {
	if (pointsArray == null || pointsArray.constructor !== Array) {
		return;
	}
	let pointsString = pointsArray.map((el) =>
		(el.constructor === Array ? el : [el.x, el.y])
	).reduce((prev, curr) => prev + curr[0] + "," + curr[1] + " ", "");
	polygon.setAttributeNS(null, "points", pointsString);
};

export const setViewBox = function(svg, x, y, width, height, padding = 0) {
	let scale = 1.0;
	let d = (width / scale) - width;
	let X = (x - d) - padding;
	let Y = (y - d) - padding;
	let W = (width + d * 2) + padding * 2;
	let H = (height + d * 2) + padding * 2;
	let viewBoxString = [X, Y, W, H].join(" ");
	svg.setAttributeNS(null, "viewBox", viewBoxString);
};
