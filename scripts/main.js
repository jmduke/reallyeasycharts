var graph;

$(document).ready(function() {
	// Load the sharing buttons.
	loadSharingButtons();

	// Dynamically create the form.  Because I am lazy.  (Or "elegance".)
	for(var i = 0; i < FIELDS.length; i++) {
		var field = FIELDS[i];
		var inputString = "<div>";
		inputString += "<label>" + field.name + "</label>";
		if (field.type == "select") {
			inputString += "<select id='" + field.name + "'>"
			for (var j = 0; j < field.options.length; j++) {
				option = field.options[j];
				inputString += "<option value='" + option.type + "'>" + option.label + "</option>"
			}
			inputString += "</select>"
		} else {
			inputString += "<input id='" + field.name + "' type='" + field.type + "'/>";
		}
		inputString += "</div>";
		$(".primary").prepend(inputString);
	}

	// Try and generate a graph from the parameters, if necessary.
	loadGraphFromURL();
});

function loadSharingButtons() {
	// Facebook.
	(function(d, s, id) {
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) return;
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=389867964446737";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));

	// Twitter.
	!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');

	// Google+.
	(function() {
		var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
		po.src = 'https://apis.google.com/js/plusone.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
	})();

}

function generateColorScheme(seed) {
	r = parseInt(seed.slice(1, 3), 16);
	g = parseInt(seed.slice(3, 5), 16);
	b = parseInt(seed.slice(5, 7), 16);[]

	colors = [];
	for (var i = 0; i < 5; i++) {
		newColor = "#";
		newColor += (r + Math.pow(2, i + 1)).toString(16);
		newColor += (g + Math.pow(2, i + 1)).toString(16);
		newColor += (b + Math.pow(2, i + 1)).toString(16);
		colors.push(newColor);
	}
	return colors
}

			
function drawGraph(graphData) {

	var newGraph = jQuery.extend({}, graphData);
	newGraph.labels = newGraph.labels.split(",");

	// Generate a li'l color scheme.
	colors = generateColorScheme(newGraph.color);

	// Don't render the graph if there ain't no data.
	if(isNaN(newGraph.data[0]) && newGraph.data.length == 1) {
		return;
	}


	// Sanitize ourselves some data.
	var oldData = newGraph.data;

	// If it's multi-tiered data, do specific things.
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
		newGraph.data = data;
	}
	else {
		newGraph.data = jQuery.map(oldData.split(","), function(el) { return parseFloat(el); });
		// parseFloat will fail silently if given strings and set everything to NaN,
		// so we handle that here.
		for (var j = 0; j < newGraph.data.length; j++) {
			if(isNaN(newGraph.data[j])) {
				alert("Sorry, there was an error with the data you inputted.  Can you try again? (Make sure there aren't any words or letters!)");
				return;
			}
		}
		newGraph.data = [newGraph.data];
	}


	// Deal with the quirks.
	if (newGraph.type == "pie") {
		newData = [];
		for (var i = 0; i < newGraph.data[0].length; i++) {
			newData.push([newGraph.labels[i], newGraph.data[0][i]]);
		}
		// Avoid having the last and first slice having the same color.
		while ((newData.length - 1) % colors.length === 0) {
			colors.pop();
		}
		newGraph.data = [newData];
	}

	if (newGraph.type == "scatter") {
		sanitizedData = [{data: newGraph.data}];
	}
	else {
		sanitizedData = jQuery.map(newGraph.data, function(el) {
			return {data: el};
		});
	}

	console.log(sanitizedData);

	// Make that data into a nice lil' HighCharts dict.
	allData = {
		chart: {
			type: newGraph.type
		},
		colors: colors,
		title: {
			text: newGraph.title
		},
		xAxis: {
			categories: newGraph.labels,
			title: {
				text: newGraph.xAxis
			}
		},
		legend: {
			enabled: false
		},
		yAxis: {
			title: {
				text: newGraph.yAxis
			}
		},
		series: sanitizedData,
		credits: {
			text: "reallyeasycharts.com"
		},
		plotOptions: {
			series: {
				dataLabels: {
					enabled: newGraph.dataLabels
				}
			}
		}
	}

	$('#container').highcharts(allData);
	$('#share').text("Share it!");
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
		color: $("#color").val(),
		dataLabels: $("#dataLabels").get(0).checked
	};
	drawGraph(graph);
}

function populateForm(graphData) {
	// Populate the form with a graph object.
	$("#labels").val(graphData.labels);
	$("#type").val(graphData.type);
	$("#title").val(graphData.title);
	$("#x-axis").val(graphData.xAxis);
	$("#y-axis").val(graphData.yAxis);
	$("#data").val(graphData.data);
	$("#color").val(graphData.color);
	$("#dataLabels").val(graphData.dataLabels);
}

function loadExample(x) {
	// Apparently deep copying in JavaScript is non-trivial!  Yippee!
	var exampleGraph = jQuery.extend({}, EXAMPLES[x]);

	populateForm(exampleGraph);
	drawGraph(exampleGraph);
	loadGraph();
}

function get_short_url(long_url, func) {
    $.getJSON(
        "http://api.bitly.com/v3/shorten?callback=?", 
        { 
            "format": "json",
            "apiKey": "R_1667a451b76ac7256d513e11727ac19f",
            "login": "justinmduke",
            "longUrl": long_url
        },
        function(response)
        {
            func(response.data.hash);
        }
    );
}

function get_long_url(shortcode, func) {
    $.getJSON(
        "http://api.bitly.com/v3/expand?callback=?", 
        { 
            "format": "json",
            "apiKey": "R_1667a451b76ac7256d513e11727ac19f",
            "login": "justinmduke",
            "hash": shortcode
        },
        function(response)
        {
            func(response.data.expand[0].long_url);
        }
    );
}

function shareGraph() {
	// Convert JSON to String.
	var graphString = JSON.stringify(graph);

	// Convert String to Base64.
	graphString = Base64.encode(graphString);

	// Create URL.
	var shareableURL = 'http://www.reallyeasycharts.com/' + graphString;

	// Pass URL as a request to bit.ly
	get_short_url(shareableURL, function(response) {
		$("#share").text("reallyeasycharts.com/?g=" + response);
	});
}

function loadGraphFromURL() {
	var encodedGraph = getQueryVariable('g');

	// If the GET request is empty, we assume everything is OK and stop.
	if (encodedGraph == undefined) {
		console.log("Can't find an encoded graph.  Stopping loadGraphFromURL.");
		return;
	}

	get_long_url(encodedGraph, function(response) {
		temp = response.split('/');
		decodedGraph = temp[temp.length - 1];
		decodedGraph = Base64.decode(decodedGraph);

		// Remove the last character of the decoded graph for some reason.
		while (decodedGraph[decodedGraph.length - 1] != "}" && decodedGraph.length > 0) {
			decodedGraph = decodedGraph.substring(0, decodedGraph.length - 1);
		}
		var graphData = JSON.parse(decodedGraph);

		populateForm(graphData);
		loadGraph();
	});
}