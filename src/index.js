import * as Import from "./import";
import { svg_to_fold } from "./toFOLD";
import { fold_to_svg, components } from "./toSVG";

let convert = {
	toSVG: function(input, callback, options) {
		Import.load_FOLD(input, function(result, err) {
			if (err) { throw err; }
			let svg = fold_to_svg(result, options);
			if (callback != null) {
				callback(svg);
			}
		});
	},
	toFOLD: function(input, callback, options) {
		Import.load_SVG(input, function(result, err) {
			if (err) { throw err; }
			let fold = svg_to_fold(result, options);
			if (callback != null) {
				callback(fold);
			}
		});
	},
	components
}

export default convert;