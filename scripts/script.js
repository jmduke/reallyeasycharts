// Constants.  There should probably be more of these.
var PIE_CHART = "pie";
var FIELDS = ["title", "x-axis", "y-axis", "labels", "data"];

// Because I am lazy.  (Or "elegance".)
$(document).ready(function() {
	for(var i = 0; i < FIELDS.length; i++) {
		var fieldName = FIELDS[i];
		var inputString = "<div><label>" + fieldName + "</label><input id='" + fieldName + "'/></div>";
		$(".primary").prepend(inputString);
	}
});

function fluxNumber(x) {
	beta = 40;
	return Math.min(
		255,
		Math.max(
			0,
			x + Math.floor((Math.random()*beta)-(beta / 2))
		));
}

function generateColorScheme(seed) {
	r = parseInt(seed.slice(1, 3), 16);
	g = parseInt(seed.slice(3, 5), 16);
	b = parseInt(seed.slice(5, 7), 16);

	colors = [];
	for (var i = 0; i < 5; i++) {
		newColor = "#";
		newColor += fluxNumber(r).toString(16);
		newColor += fluxNumber(g).toString(16);
		newColor += fluxNumber(b).toString(16);
		colors.push(newColor);
	}
	return colors
}

			
function drawGraph(graphData) {

	graph = graphData;
	graph.labels = graph.labels.split(",");

	// Generate a li'l color scheme.
	colors = generateColorScheme(graph.color);

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
		// Avoid having the last and first slice having the same color.
		while ((newData.length - 1) % colors.length == 0) {
			colors.pop();
		}
		graph.data = [newData];
	}

	sanitizedData = jQuery.map(graph.data, function(el) {
		return {data: el};
	});		

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
	// Apparently deep copying in JavaScript is non-trivial!  Yippee!
	var exampleGraph = jQuery.extend({}, EXAMPLES[x]);

	populateForm(exampleGraph);
	drawGraph(exampleGraph);
}