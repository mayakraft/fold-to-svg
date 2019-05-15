const FOLD_SVG = require("../fold-svg");
const fs = require("fs");

try {
	FOLD_SVG.toSVG("{\"key\": invalid json}");
	console.log("test failed! invalid json should throw an error");
} catch(error) {
	// success. invalid json caught
}

fs.readFile("./test/single-vertex.fold", function (err, data) {
	let singleVertex = JSON.parse(data);
	let frame0 = FOLD_SVG.toSVG(singleVertex);
	let frame1 = FOLD_SVG.toSVG(singleVertex, {frame:1});
	[frame0, frame1].forEach(function(frame,i){
		fs.writeFile("./test/test-frame-"+i+".svg", frame, (err) => {  
			if (err) { throw err; }
			console.log("FOLD -> SVG result at test-frame-"+i+".svg");
		});
	});
});

fs.readFile("./test/crane.fold", function (err, data) {
	let crane = FOLD_SVG.toSVG(JSON.parse(data));
	fs.writeFile("./test/test-crane.svg", crane, (err) => {  
		if (err) { throw err; }
		console.log("FOLD -> SVG result at test-crane.svg");
	});
});
