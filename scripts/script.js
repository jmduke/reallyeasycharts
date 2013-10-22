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

	loadGraphFromURL();
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
            func(response.data.url);
        }
    );
}

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
var Base64 = {

// private property
_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

// public method for encoding
encode : function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = Base64._utf8_encode(input);

    while (i < input.length) {

        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
        this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
        this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

    }

    return output;
},

// public method for decoding
decode : function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {

        enc1 = this._keyStr.indexOf(input.charAt(i++));
        enc2 = this._keyStr.indexOf(input.charAt(i++));
        enc3 = this._keyStr.indexOf(input.charAt(i++));
        enc4 = this._keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }

    }

    output = Base64._utf8_decode(output);

    return output;

},

// private method for UTF-8 encoding
_utf8_encode : function (string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

        var c = string.charCodeAt(n);

        if (c < 128) {
            utftext += String.fromCharCode(c);
        }
        else if((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        }
        else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }

    }

    return utftext;
},

// private method for UTF-8 decoding
_utf8_decode : function (utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;

    while ( i < utftext.length ) {

        c = utftext.charCodeAt(i);

        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        }
        else if((c > 191) && (c < 224)) {
            c2 = utftext.charCodeAt(i+1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        }
        else {
            c2 = utftext.charCodeAt(i+1);
            c3 = utftext.charCodeAt(i+2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }

    }

    return string;
}

}

function shareGraph() {
	// Convert JSON to String.
	var graphString = JSON.stringify(graph);

	// Convert String to Base64.
	graphString = Base64.encode(graphString);

	// Create URL.
	var shareableURL = 'http://www.reallyeasycharts.com/?g=' + graphString;

	// Pass URL as a request to bit.ly
	get_short_url(shareableURL, function(response) {
		console.log(response);
		$("#share").text(response);
	});
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

function loadGraphFromURL() {
	var encodedGraph = getQueryVariable('g');
	var decodedGraph = Base64.decode(encodedGraph);

	// Remove the last character of the decoded graph for some reason.
	while (decodedGraph[decodedGraph.length - 1] != "}") {
		decodedGraph = decodedGraph.substring(0, decodedGraph.length - 1);
	}
	var graphData = JSON.parse(decodedGraph);

	populateForm(graphData);
	loadGraph();
}