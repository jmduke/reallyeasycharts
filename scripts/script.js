// Constants.  There should probably be more of these.
var PIE_CHART = "pie";
var FIELDS = ["title", "labels", "data", "x-axis", "y-axis"];

// Because I am lazy.  (Or "elegance".)
$(document).ready(function() {
	for(var i = 0; i < FIELDS.length; i++) {
		var fieldName = FIELDS[i];
		var inputString = "<div><label>" + fieldName + "</label><input id='" + fieldName + "'/></div>";
		$("form").append(inputString);
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

	try {
		data = jQuery.map(data, function(el) { return parseFloat(el) });
	} catch(err) {
		alert("Sorry, there was an error with the data you inputted.  Can you try again?");
	}

	// Don't render the graph if there ain't no data.
	if(isNaN(data[0])) {
		return;
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
		colors: [
			"#5A1F00",
			"#D1570D",
			"#FDE792",
			"#477725",
			"#A9CC66",
		],
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