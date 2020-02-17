(function () {
	// width, height, margins and padding
	var margin_bar = {top: 20, right: 30, bottom: 40, left: 40},
		width = 900 - margin_bar.left - margin_bar.right,
		height = 700 - margin_bar.top - margin_bar.bottom;
	
	// scales
	var xScale = d3.scaleLinear()
		.range([0, width]);
		
	var yScale = d3.scaleBand()
		.rangeRound([0, height])
		//.rangeRoundBands([0, height])
		.paddingInner(0.1);
		
	var div = d3.select("#container_player_xA_Diff_bar").append("div")
    .attr("class", "tooltipbar_player_xa")
    .style("opacity", 0);
		
	// load data
	d3.csv("https://raw.githubusercontent.com/jakehughes1882/data/master/UCL_2019_Player_Stats.csv", type, function(error, data) {	
		
	
		//console.log(data);
		
		data.sort(function(x, y){
			return d3.descending( x.xADiff, y.xADiff);
		})

		//data = data.slice(0, 40) //dataT20
		//dataL20 = data.slice(-40)

		Promise.all([data.slice(0, 20),
			                data.slice(-20)])
		              .then(function(allData) {
		              	//console.log(
		              	data = d3.merge(allData);

		              	//console.log(data_test)
			          //.then((bigdata) => d3.merge(bigdata))

		//console.log(data_test)
		//data = 

		//console.log(d3.merge(dataT20, dataL20));
		
		// domains
		xScale.domain(d3.extent(data, function(d) { return d.xADiff; })).nice();
		yScale.domain(data.map(function(d) { return d.Player; }));
		
		// define X axis
		//var formatAsPercentage = d3.format("1.0%");

		var xAxis = d3.axisBottom()
							  .scale(xScale)
							  //.tickFormat(formatAsPercentage);
								
		// create svg
		var svg = d3.select("#container_player_xA_Diff_bar")
			.append("svg")
				.attr("width", width + margin_bar.left + margin_bar.right)
				.attr("height", height + margin_bar.top + margin_bar.bottom )
			.append("g")
				.attr("transform", "translate(" + margin_bar.left + "," + margin_bar.top + ")");
						
		
		// format tooltip
		var thsndFormat = d3.format(",");
				var tickNeg = svg.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(" + xScale(0) + 500 + ",0)")
				.call(d3.axisLeft(yScale))
			.selectAll(".tick")
			.filter(function(d, i) { return (data[i].xADiff) < 0; });
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
				.attr("class", function(d) { return "bar bar--" + (d.xADiff < 0 ? "negative" : "positive"); })
				.attr("rx", 6)
                .attr("ry", 6)
				.attr("y", function(d) { return yScale(d.Player); })
				.attr("height", yScale.bandwidth() - 1)
				//.attr("x",  d => { return width + 300; })
				.attr("x", function(d) { return xScale(Math.min(0, d.xADiff)); })
				.attr("width", 0) //function(d) { return Math.abs(xScale(d.Minutes) - xScale(0)); })
				.attr("fill", function(d) {return ColourMap[d.Club]} )
			bars.transition()
				.duration(50)
				.delay(function (d, i) {
							return i * 10;
							})
				.attr("x", function(d) { return xScale(Math.min(0, d.xADiff)); })
				.attr("width", function(d) { return (Math.abs(xScale(d.xADiff) - xScale(0))); })	
							
				
				
				
			// tooltip
			bars.on("mouseover", function(d) {
				d3.select(this).style("fill", function() {
					return d3.rgb(d3.select(this).style("fill")).brighter(0.99);
					});
				div.transition()
				 .duration(200)
         .style("opacity", 1.0);
				div.html(d.Player + " assisted " + d.Assists + " goals, but had an xA sum of " + d.xA + " leaving a difference of " + d.xADiff)
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

	});
	
	
		
function type(d) {
  d.xADiff = +d.xADiff;
  return d;
}
})()
