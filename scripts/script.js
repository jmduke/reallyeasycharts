// Constants.  There should probably be more of these.
var PIE_CHART = "pie";
var FIELDS = ["title", "x-axis", "y-axis", "labels", "data"];

// Because I am lazy.  (Or "elegance".)
$(document).ready(function() {
	for(var i = 0; i < FIELDS.length; i++) {
		var fieldName = FIELDS[i];
		var inputString = "<div><label>" + fieldName + "</label><input id='" + fieldName + "'/></div>";
		$("form").prepend(inputString);
	}
});

			
function drawGraph(graphData) {

	graph = graphData;
	graph.labels = graph.labels.split(",");

	// Generate a li'l color scheme.
	colors = tinycolor.analogous(graph.color);
	colors = jQuery.map(colors, function(color) { return "#" + color.toHex() });

	// Don't render the graph if there ain't no data.
	if(isNaN(graph.data[0]) && graph.data.length == 1) {
		return;
	}


	// Sanitize ourselves some data.
	var oldData = graph.data;
	if (oldData.indexOf("]") > -1) {
		data = oldData.split("]");
		data = jQuery.map(data, function(el) {
			startIndex = el.indexOf("["); 
			return el.slice(startIndex) + "]"; 
		});
		data.pop();
		for (var i = 0; i < data.length; i++) {
			data[i] = JSON.parse(data[i]);
		}
		graph.data = data;
	}
	else {
		graph.data = jQuery.map(oldData.split(","), function(el) { return parseFloat(el) });
		// parseFloat will fail silently if given strings and set everything to NaN,
		// so we handle that here.
		for (var i = 0; i < graph.data.length; i++) {
			if(isNaN(graph.data[i])) {
				alert("Sorry, there was an error with the data you inputted.  Can you try again? (Make sure there aren't any words or letters!)");
				return;
			}
		}
		graph.data = [graph.data];
	}

	// Deal with the quirks.
	if (graph.type == PIE_CHART) {
		newData = [];
		for (var i = 0; i < graph.data[0].length; i++) {
			newData.push([graph.labels[i], graph.data[0][i]]);
		}
		graph.data = [newData];
	}

	sanitizedData = jQuery.map(graph.data, function(el) {
		return {data: el};
	});		

	console.log(sanitizedData);

	// Make that data into a nice lil' HighCharts dict.
	allData = {
		chart: {
			type: graph.type
		},
		colors: colors,
		title: {
			text: graph.title
		},
		xAxis: {
			categories: graph.labels,
			title: {
				text: graph.xAxis
			}
		},
		legend: {
			enabled: false
		},
		yAxis: {
			title: {
				text: graph.yAxis
			}
		},
		series: sanitizedData,
		credits: {
			enabled: false
		}
	}

	$('#container').highcharts(allData);
}

function loadGraph() {
	// Grab data from the form.
	graph = {
		labels: $("#labels").val(),
		type: $("#type").val(),
		title: $("#title").val(),
		xAxis: $("#x-axis").val(),
		yAxis: $("#y-axis").val(),
		data: $("#data").val(),
		color: $("#color").val()
	};
	drawGraph(graph);
}

function populateForm(graphData) {
	// Populate the form with a graph object.
	// Used for examples.
	$("#labels").val(graphData.labels);
	$("#type").val(graphData.type);
	$("#title").val(graphData.title);
	$("#x-axis").val(graphData.xAxis);
	$("#y-axis").val(graphData.yAxis);
	$("#data").val(graphData.data);
	$("#color").val(graphData.color);
}

function loadExample(x) {
	exampleGraph = EXAMPLES[x];
	populateForm(exampleGraph);
	drawGraph(exampleGraph);
}