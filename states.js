
//Width and height
var heightSVG2 = 500;
var widthSVG2 = 700;
var padding2 = 150;

//Load in gasoline data
d3.csv("gas-state.csv").then(function(data) {
//Create SVG element
	var svg = d3.select(".mapaEstadosUnidos")
				.append("svg")
				.attr("width", widthSVG2)
				.attr("height", heightSVG2);

	var tooltip = d3.select(".mapaEstadosUnidos")
					.append("div") 
	    			.attr("class", "tooltip")       
	   				.style("opacity", 0);
	//Define quantize scale to sort data values into buckets of color
	var color = d3.scaleQuantize()
		.range(["#05e77b","#67ed73","#93f26f","#b8f66e","#d8fa71",
		  		"#e8eb62","#f5dc59", "#ffcd55", "#ffa54b","#ff7958", 
		  		"#ff4873", "#f91296"]);
	//Set input domain for color scale
	color.domain([
		d3.min(data, function(d) { return d.Gas_Regular2019; }), 
		d3.max(data, function(d) { return d.Gas_Regular2019; })
	]);

	//Load in GeoJSON data
	d3.json("us-states.json").then(function(json) {

		
		//Define map projection
		var projection = d3.geoAlbersUsa()
							.fitSize([(widthSVG2),(heightSVG2)],json);

		//Define path generator
		var path = d3.geoPath()
					 .projection(projection);

		//Merge the ag. data and GeoJSON
		//Loop through once for each ag. data value
		for (var i = 0; i < data.length; i++) {
	
			//Grab state name
			var dataState = data[i].State;
			
			//Grab data value, and convert from string to float
			var dataValue = parseFloat(data[i].Gas_Regular2019);
	
			//Find the corresponding state inside the GeoJSON
			for (var j = 0; j < json.features.length; j++) {
			
				var jsonState = json.features[j].properties.name;
	
				if (dataState == jsonState) {
			
					//Copy the data value into the JSON
					json.features[j].properties.value = dataValue;
					
					//Stop looking through the JSON
					break;
					
				}
			}		
		}

		//Bind data and create one path per GeoJSON feature
		svg.selectAll("path")
		   .data(json.features)
		   .enter()
		   .append("path")
		   .attr("d", path)
		   .style("fill", function(d) {
		   		//Get data value
		   		var value = d.properties.value;
		   		
		   		if (value) {
		   			//If value exists…
			   		return color(value);
		   		} else {
		   			//If value is undefined…
			   		return "#ccc";
		   		}
		})
			//Add tooltips
			.on("mouseover", function() { 
	                svg.select('.tooltip')
	                    .transition()
	                    .duration(200)
	                    .style('opacity', 0.9);      
	            })
	        .append("title")
	        .html(function(d, i) {
	            	return (d.properties.name + " - Gas Price: " + data[i].Gas_Regular2019);
	            })
	        .on('mouseout', () => {x
	           		 svg.select('.tooltip')
	                .transition()
	                .duration(500)
	                .style('opacity', 0);
	            });
	});
	
	//Title
	var title = svg.append("text")
					.attr("class", "titulo") // Assign a class for styling 
			        .attr("x", (widthSVG2/2))             
			        .attr("y",25)
			        .attr("text-anchor", "middle")  
			        .style("font-size", "20px") 
			        .text("US Gasoline Prices");
	});