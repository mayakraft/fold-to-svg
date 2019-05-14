// import * as Import from "./import";
import { svg_to_fold } from "./toFOLD";
import { fold_to_svg, components } from "./toSVG";

// get DOMParser and XMLSerializer from the browser or from Node
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

let convert = {
	components,
	toSVG: function(input, options) {
		if (typeof input === "object" && input !== null) {
			return fold_to_svg(input, options);
		}
		else if (typeof input === "string" || input instanceof String) {
			try {
				let obj = JSON.parse(input);
				return fold_to_svg(obj, options);
			} catch (error) {
				throw error;
			}
		}
	},
	toFOLD: function(input, options) {
		if (typeof input === "string") {
			let svg = (new DOMParser())
				.parseFromString(input, "text/xml").documentElement;
			return svg_to_fold(svg, options);
		} else {
		// if (input instanceof Document) {
			return svg_to_fold(input, options);
		}
		// let fold = svg_to_fold(result, options);
	},
}

export default convert;