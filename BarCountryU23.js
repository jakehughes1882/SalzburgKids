(function () {
	// width, height, margins and padding
	var margin_bar = {top: 20, right: 30, bottom: 40, left: 700},
		width = 900 - margin_bar.left - margin_bar.right,
		height = 900 - margin_bar.top - margin_bar.bottom;
	
	// scales
	var xScale = d3.scaleLinear()
		.range([0, width])
		//.paddingInner(0.1);
		
	var yScale = d3.scaleBand()
		.rangeRound([0, height]);
		//.rangeRoundBands([0, height])
		
	var div = d3.select("#container_country_age_bar_").append("div")
    .attr("class", "tooltipbar")
    .style("opacity", 0);
		
	// load data
	d3.csv("https://raw.githubusercontent.com/jakehughes1882/data/master/CountryU23Minutes.csv", type, function(error, data) {	
		
	
		console.log(data);

		
		data.sort(function(x, y){
			return d3.ascending( x.Minutes, y.Minutes);
		})
		
		// domains
		//xScale.domain(d3.extent(data, function(d) { return d.Country; })).nice();
		//yScale.domain(data.map(function(d) { return d.Minutes; }));

		yScale.domain(d3.extent(data, function(d) { return d.Minutes; })).nice();
		xScale.domain(data.map(function(d) { return d.Country; }));
		
		// define X axis
		//var formatAsPercentage = d3.format("1.0%");


		console.log(yScale)

		var yAxis = d3.axisLeft()
							  .scale(yScale)
							  //.tickFormat(formatAsPercentage);
								
		// create svg
		var svg = d3.select("#container_country_age_bar_")
			.append("svg")
				.attr("width", width + margin_bar.left + margin_bar.right)
				.attr("height", height + margin_bar.top + margin_bar.bottom )
			.append("g")
				.attr("transform", "translate(" + margin_bar.left + "," + margin_bar.top + ")");
						
		
		// format tooltip
		var thsndFormat = d3.format(",");
				var tickNeg = svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(" + yScale(0) + 500 + ",0)")
				.call(d3.axisBottom(xScale))
			.selectAll(".tick")
			//.filter(function(d, i) { return (data[i].Minutes) < 0; });
		
		tickNeg.select("line")
			.attr("x2", 6);
			
		tickNeg.select("text")
			.attr("x", 9)
			.style("text-anchor", "start");	
			
		var ColourMap = {'Manchester City': '#65a5d3', 'Tottenham': '#10204b', 'Liverpool': '#d3151e', 'Chelsea': '#094595', 
		                 'Bayern Munich': '#cc0134', 'Real Madrid': '#cfd3e7', 'Paris Saint-Germain': '#1a2b4c', 'RasenBallsport Leipzig': '#bc0506',
		                 'Salzburg': '#dd232b', 'Atalanta': '#1171bc', 'Atletico Madrid': '#eb1a47', 'Napoli': '#1ea1db',
		                 'Barcelona': '#2e3684', 'Borussia Dortmund': '#fcea1c', 'Juventus': '#272727', 'Inter': '#3a7af4',
		                 'Valencia': '#fb4b13', 'Slavia Prague': '#d11219', 'Olympiacos': '#e30613', 'Club Brugge': '#3333ff',
		                 'Lille': '#d9001e', 'Benfica': '#dd232b', 'Genk': '#2353fc', 'Shakhtar Donetsk': '#e3620a',
		                 'Ajax': '#c5031b', 'Dinamo Zagreb': '#0216e4', 'Lyon': '#011f68', 'Zenit St. Petersburg': '#1a93d6',
		                 'Lokomotiv Moscow': '#cc2e22', 'Bayer Leverkusen': '#e00001', 'FK Crvena Zvezda': '#d40511', 'Galatasaray': '#f67804'
			}

		
		// create  bars
	var bars = 	svg.selectAll(".bar")
			.data(data)
			.enter()			
			.append("rect")
				.attr("class", "bar")
				.attr("rx", 6)
                .attr("ry", 6)
				.attr("x", function(d) { return xScale(d.Country); })
				.attr("width", xScale.bandwidth() - 1)
				.attr("y",  d => { return height + 300; })
				.attr("height", 0) //function(d) { return Math.abs(xScale(d.Minutes) - xScale(0)); })
				.attr("fill", function(d) {return ColourMap[d.Country]} )
			bars.transition()
				.duration(500)
				.delay(function (d, i) {
							return i * 30;
							})
				.attr("y", function(d) { return xScale(Math.min(0, d.Minutes)) + 150; })
				.attr("height", function(d) { return (Math.abs(yScale(d.Minutes) - yScale(0)))*0.8; })	
				
			// tooltip
			bars.on("mouseover", function(d) {
				d3.select(this).style("fill", function() {
					return d3.rgb(d3.select(this).style("fill")).brighter(0.99);
					});
				div.transition()
				 .duration(200)
         .style("opacity", 1.0);
				div.html(d.Minutes + " minutes were played by the players above for " + d.Country + " .")
        .style("left", (d3.event.pageX ) + 10 + "px")
        .style("top", (d3.event.pageY) + 30 + "px");
        //.style("height",  60 + "px");
			})
			
			bars.on("mouseout", function(d) {
				d3.select(this).style("fill", function() {
					return d3.rgb(d3.select(this).style("fill")).darker(0.99);
					});
        div.transition()
					.duration(500)
					.style("opacity", 0);
      });
    //});       		
	});
	
	
		
function type(d) {
  d.Minutes = +d.Minutes;
  return d;
}
})()
