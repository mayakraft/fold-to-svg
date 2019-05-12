import * as Import from "./import";
import { svg_to_fold } from "./toFOLD";
import { fold_to_svg } from "./toSVG";

let convert = {
	toSVG: function(input, callback) {
		Import.load_FOLD(input, function(result, err){
			if (err) { throw err; }
			if (callback != null) {
				callback(fold_to_svg(result));
			}
		});
	},
	toFOLD: function(input, callback) {
		Import.load_SVG(input, function(result, err){
			if (err) { throw err; }
			if (callback != null) {
				callback(svg_to_fold(result));
			}
		});
	}
}

export default convert;