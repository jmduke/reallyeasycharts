// Constants.  There should probably be more of these.
var PIE_CHART = "pie";
var FIELDS = ["title", "labels", "data", "x-axis", "y-axis"];

// Because I am lazy.  (Or "elegance".)
$(document).ready(function() {
	for(var i = 0; i < FIELDS.length; i++) {
		var fieldName = FIELDS[i];
		var inputString = "<div><label>" + fieldName + "</label><input id='" + fieldName + "'/></div>";
		$("form").prepend(inputString);
	}

	for(var key in COLOR_SCHEMES) {
		$("#colors").append("<option value='" + key + "'>" + key + "</option>")
	}
});

			
function drawGraph() {
	// Grab data from the form.
	labels = $("#labels").val().split(",");
	type = $("#type").val();
	title = $("#title").val();
	xAxis = $("#x-axis").val();
	yAxis = $("#y-axis").val();
	data = $("#data").val().split(",");
	data = jQuery.map(data, function(el) { return parseFloat(el) });
	colors = $("#colors").val();

	// Don't render the graph if there ain't no data.
	if(isNaN(data[0]) && data.length == 1) {
		return;
	}

	// parseFloat will fail silently if given strings and set everything to NaN,
	// so we handle that here.
	for (var i = 0; i < data.length; i++) {
		if(isNaN(data[i])) {
			alert("Sorry, there was an error with the data you inputted.  Can you try again? (Make sure there aren't any words or letters!)");
			return;
		}
	}

	// Deal with the quirks.
	if (type == PIE_CHART) {
		newData = [];
		for (var i = 0; i < data.length; i++) {
			newData.push([labels[i], data[i]]);
		}
		data = newData;
	}

	// Make that data into a nice lil' HighCharts dict.
	allData = {
		chart: {
			type: type
		},
		colors: COLOR_SCHEMES[colors],
		title: {
			text: title
		},
		xAxis: {
			categories: labels,
			title: {
				text: xAxis
			}
		},
		legend: {
			enabled: false
		},
		yAxis: {
			title: {
				text: yAxis
			}
		},
		series: [{
			data: data
		}],
		credits: {
			enabled: false
		}
	}

	$('#container').highcharts(allData);
}