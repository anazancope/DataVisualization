


//defining the size of my svg (graph)
//Width and height
var heightSVG = 400;
var widthSVG = 800;
var padding = 80;
var widthLegenda = widthSVG -180;
var heightLegenda = 35;

/*['Date','GasPrice','GasPriceDollar2019']*/
var dataset = [];
//For formating string into dates
var parseTime = d3.timeParse("%m/%y");
//For converting Dates to strings
var formatTime = d3.timeFormat("%b %e");

//Function for converting CSV values from strings to Dates and numbers
var rowConverter = function(d) {

	return {
	Date: parseTime(d.Date),
	GasPrice: parseFloat(d.GasPrice),
	CPI : parseFloat(d.CPI),
	cpi2019cpi : parseFloat(d.cpi2019cpi),
	GasPriceDollar2019: parseFloat(d.GasPriceDollar2019),
	};
}
//Load in the data
d3.csv("gas_year.csv", rowConverter).then(function(data) {
	//Copy data into global dataset
	dataset = data;
	//getting the data the we are interest in and printing to see its format
	//console.table(dataset,['Date','GasPrice','GasPriceDollar2019']);
	cor = ['#4CA910','#8410A9'];
	nomes = ['Nominal Price', '2019 Dollar'];
	titulo = ["US Gasoline Prices"];
	//Create scale functions
	xScale = d3.scaleTime()
				   .domain([
						d3.min(dataset, function(d) { return d.Date; }),
						d3.max(dataset, function(d) { return d.Date; })
					])
				   .range([padding, widthSVG - padding]);

	//GasPrice - 1993-2019 sem adaptar
	yScale = d3.scaleLinear()
			   .domain([
					d3.min(dataset, function(d) { return d.GasPrice; }),
					d3.max(dataset, function(d) { return d.GasPrice; })
				])
			   .range([heightSVG - padding, padding]);

	//Create SVG element
	var svg = d3.select(".preco1993_2019")
				.append("svg")
				.attr("width", widthSVG)
				.attr("height", heightSVG);

			
	//creating axis - in this case the ticks are on the left
	var y_axis = d3.axisLeft(yScale);

	svg.append("g")
		.attr('class', 'coord y')
		//append the axis y and moves it acording to the translate (translado) location
		.attr("transform", "translate("+padding+",0)")
		.call(y_axis);
	// text label for the y axis
	svg.append("text")
		// this makes it easy to centre the text as the transform is applied to the anchor
        .attr("text-anchor", "middle")  
        // text is drawn off the screen top left, move down and out and rotate
        .attr("transform", "translate("+ (padding/2) +","+(heightSVG/2)+") rotate(-90)")  
        .text("US$");

	//I have data from 1992 - 2019 I want to display the years without the century
	var x_axis = d3.axisBottom(xScale).ticks(d3.timeYear.every(1)).tickFormat(d3.timeFormat("%y"));
	var place = heightSVG- padding;
	
	svg.append("g")
		.attr('class', 'coord x')
		.attr("transform", "translate(0,"+ place+")")
		.call(x_axis);
		
	var xlabel = heightSVG-padding/3;

	// text label for the x axis
	svg.append("text")  
		.attr("text-anchor", "middle")           
  		.attr("transform", "translate("+(widthSVG/2)+","+xlabel+")")
	    .text("Year");

	//d3's line generator - to create a line graph I need this generator nominal price
	var line = d3.line()
	    .x(function(d) { return xScale(d.Date); }) // set the x values for the line generator
	    .y(function(d) { return yScale(d.GasPrice); }) // set the y values for the line generator 
	    .curve(d3.curveMonotoneX); // apply smoothing to the line

	//d3's line generator - to create a line graph I need this generator adjusted price
	var line2 = d3.line()
	    .x(function(d) { return xScale(d.Date); }) // set the x values for the line generator
	    .y(function(d) { return yScale(d.GasPriceDollar2019); }) // set the y values for the line generator 
	    .curve(d3.curveMonotoneX);

	//Append the path, bind the data, and call the line generator 
	svg.append("path")
	    .datum(dataset) // 10. Binds data to the line 
	    .attr("class", "line") // Assign a class for styling 
	    .attr("d", line) // 11. Calls the line generator
	    .attr('fill','none')
	    .attr('stroke','#4CA910')
	    .attr('stroke-width', 2);

	svg.append("path")  
		.datum(dataset)
		.attr("class", "line2")
	    .attr('fill','none')
	    .attr('stroke','#8410A9')
	    .attr('stroke-width', 2)
	    .attr("d", line2);


	//Legend

	//creating a legend
		//locating the legend on the right side of the svg
		var legenda = svg.append('g')
						.attr('transform', 'translate ('+widthLegenda+','+heightLegenda+')')
						//selects all objects with class legendas and binds it with the data torta
						.selectAll('.legendas').data(nomes);

		//creating the squares and setting positions
		var quadrados = legenda.enter()
								//appending a g element binded with the prior data
								.append('g')
								//creating a class for each g element
								.classed('legendas',true)
								//positioning the squares
								//x = 0 (um sobre o outro)
								//y espaçamento na vertical
								.attr('transform', function (d,i){ 
									return 'translate (0,'+(i+1)*30+')';
									});
		//appending rectangles and coloring them
		quadrados.append('rect')
					.attr('width',5)
					.attr('height',5)
					.attr('fill', function(d,i){
						return cor[i];
						});
		//grudando os quadrados com os textos para que as legendas sejam completas
		quadrados.append('text').text(function(d,i){
					return nomes[i];
					})
					.style("font-size", "15px")
					.attr('fill', function(d,i){
						return cor[i];
						})
					.attr('x',10)
					.attr('y', 7);

		//Title
		svg.append("text")
				.attr("class", "titulos") // Assign a class for styling 
		        .attr("x", (widthSVG/2))             
		        .attr("y",25)
		        .attr("text-anchor", "middle")  
		        .style("font-size", "20px") 
		        .text("US Gasoline Prices");
	//button that shows the gasoline values in 2019 dollars

	var botao = d3.select('.real')
		.on('click', function(){

			//update Y axis domain
			yScale.domain([d3.min(dataset, function(d) { return d.GasPriceDollar2019;}),
						  d3.max(dataset, function(d) { return d.GasPriceDollar2019;})]
						  );

			svg.select(".line")   // change the line
			    .transition()
			    .duration(750)
			    .ease(d3.easeLinear)
			    .attr("d", line2)
			    .attr('stroke','#8410A9');

			svg.select(".line2")
				.transition()
				.duration(750)
			    .ease(d3.easeLinear)
			    .attr("d", line)
			    .attr('stroke','none')

			svg.select(".coord.y") // change the y axis
				.transition()
			    .duration(750)
			    .call(y_axis);

				});

		//create a reverse button
		var botao2 = d3.select('.nominal')
		.on('click', function(){

			//update Y axis domain
			yScale.domain([d3.min(dataset, function(d) { return d.GasPrice; }),
						  d3.max(dataset, function(d) { return d.GasPrice;})]
						  );

			//d3's line generator - to create a line graph I need this generator

			svg.select(".line")   // change the line
			    .transition()
			    .duration(750)
			    .ease(d3.easeLinear)
			    .attr("d", line)
			    .attr('stroke','#4CA910');

			svg.select(".line2")
				.transition()
				.duration(750)
			    .ease(d3.easeLinear)
			    .attr("d", line2)
			    .attr('stroke','none')

			svg.select(".coord.y") // change the y axis
				.transition()
			    .duration(750)
			    .call(y_axis);

				});

		var botao3 = d3.select('.tudo')
		.on('click', function(){

			yScale.domain([d3.min(dataset, function(d) { return d.GasPrice; }),
						  d3.max(dataset, function(d) { return d.GasPriceDollar2019;})]
						  );

			svg.select(".line")   // change the line
			    .transition()
			    .duration(750)
			    .ease(d3.easeLinear)
			    .attr("d", line)
			    .attr('stroke','#4CA910');

			svg.select(".line2")   // change the line
			    .transition()
			    .duration(750)
			    .ease(d3.easeLinear)
			    .attr("d", line2)
			    .attr('stroke','#8410A9');

			svg.select(".coord.y") // change the y axis
				.transition()
			    .duration(750)
			    .call(y_axis);
		});

});
