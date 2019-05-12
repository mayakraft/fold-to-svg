/**
 * this loads an SVG, and parses it if necessary. works for inputs:
 * 1. (javascript object) XML Element
 * 2. (string) text encoding of the svg in XML
 * 3. (string) filename. require async load
 * 
 * due to possible async, object is returned in callback
 * callback(svg, error). includes error parameter if error exists
 */
export const load_SVG = function(input, callback) {
	if (input instanceof Document) {
		callback(input);
		return;
	}
	else if (typeof input === "string" || input instanceof String) {
		// text encoding of XML
		let svg;
		try {
			svg = parseAsXML(input);
			if (callback != null) {
				callback(svg);
			}
			return;
		} catch(err) {
			// attempt with input as a filename - async load
			fetch(input)
				.then((response) => response.text())
				.then((str) => {
					try{
						svg = parseAsXML(str);
						if (callback != null) {
							callback(svg);
						}
						return;
					} catch {
						callback(undefined, {
							error: "load_SVG() (string) couldn't locate SVG contents"
						});
					}
				})
				.catch((error) => {
					if (callback != null) {
						callback(undefined, error);
					}
				});
		}
	}
	else {
		if (callback != null) {
			callback(undefined, {error: "load_SVG() input type not supported"});
		}
	}
};


export const load_FOLD = function(input, callback) {
	if (typeof input === "object") {
		if (callback != null) {
			// todo, should we deep copy?
			// callback(JSON.parse(JSON.stringify(input)));
			callback(input);
		}
		return;
	}
	else if (typeof input === "string" || input instanceof String) {
		// first try JSON string, then try as filename, async load.
		let fold;
		try {
			fold = JSON.parse(input);
			if (callback != null) {
				callback(fold);
			}
			return;
		} catch(err) {
			// attempt with input as a filename - async load
			fetch(input)
				.then((response) => response.json())
				.then((fold) => {
					if (callback != null) {
						callback(fold);
					}
				})
				.catch((error) => {
					if (callback != null) {
						callback(undefined, error);
					}
				});
		}
	}
	else {
		if (callback != null) {
			callback(undefined, {error: "load_FOLD() input type not supported"});
		}
	}
};

/** parser error to check against */
let pErr = (new window.DOMParser())
	.parseFromString("INVALID", "text/xml")
	.getElementsByTagName("parsererror")[0]
	.namespaceURI;
if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
	console.warn("Firefox users, ignore XML Parsing Error on page load");
}


const parseAsXML = function(input) {
	let xml = (new window.DOMParser()).parseFromString(input, "text/xml");
	let parserErrors = xml.getElementsByTagNameNS(pErr, "parsererror");
	// let svg = xml.documentElement;
	let svgs = xml.getElementsByTagName("svg");
	if (parserErrors.length > 0) {
		throw "error parsing XML";
	}
	if (svgs == null || svgs.length === 0) {
		throw "error, valid XML found, but no SVG element";
	}
	if (svgs.length > 1) {
		console.warn("found multiple <svg> in one file. using first only");
	}
	return svgs[0];
};
