/*
 * All possible inputs to be made into the app.
 */
var FIELDS = [{
	name: "title",
	type: "text"
}, {
	name: "x-axis",
	type: "text"
}, {
	name: "y-axis",
	type: "text"
}, {
	name: "labels",
	type: "text"
}, {
	name: "data",
	type: "text"
}, {
	name: "color",
	type: "color"
}, {
	name: "type",
	type: "select",
	options: [{
		label: "Pie",
		type: "pie"
	}, {
		label: "Line",
		type: "line"
	}, {
		label: "Bar",
		type: "column"
	}]
}];