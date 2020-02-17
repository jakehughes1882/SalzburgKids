(function () {
	// width, height, margins and padding
	var margin_bar = {top: 20, right: 30, bottom: 40, left: 350},
		width = 900 - margin_bar.left - margin_bar.right,
		height = 700 - margin_bar.top - margin_bar.bottom;
	
	// scales
	var xScale = d3.scaleLinear()
		.range([0, width]);

	var xScale2 = d3.scaleLinear()
		.range([0, width]);	
		
	var yScale = d3.scaleBand()
		.rangeRound([0, height])
		//.rangeRoundBands([0, height])
		.paddingInner(0.1);

	var yScale1 = d3.scaleBand()
		.rangeRound([0, height])
		//.rangeRoundBands([0, height])
		.paddingInner(0.1);	

	var yScale2 = d3.scaleBand()
		.rangeRound([0, height])
		//.rangeRoundBands([0, height])
		.paddingInner(0.1);	
		
	var div = d3.select("#container_player_dribbles_bar").append("div")
    .attr("class", "tooltipbar_player_dribble")
    .style("opacity", 0);
		
	// load data
	d3.csv("https://raw.githubusercontent.com/jakehughes1882/data/master/UCL_2019_Player_Stats.csv", function(error, data) {	
	


	  data.forEach(function(d) {
		  d.DribblesCompleted = +d.DribblesCompleted;
		  d.Dribbles = +d.Dribbles
		  d.Minutes = +d.Minutes
		  });	
	
		var data = data.filter(function(d) {
			return d.Minutes > 44;
		});



		data.sort(function(x, y){
			return d3.descending(x.DribblesCompleted/x.Minutes, y.DribblesCompleted/y.Minutes);
		})

		var rank_dribbles_completed = 1;
		for (var i = 0; i < data.length; i++) {
		  // increase rank only if current score less than previous
		  if (i > 0 && (data[i].DribblesCompleted/data[i].Minutes) < (data[i - 1].DribblesCompleted/data[i - 1].Minutes)) {
		    rank_dribbles_completed++;
		  }
		    data[i].rank_dribbles_completed = rank_dribbles_completed;
		}

		data.sort(function(x, y){
			return d3.descending(x.DribblesCompleted/x.Minutes, y.DribblesCompleted/y.Minutes);
		})

		var rank_dribbles_completed_total = 1;
		for (var i = 0; i < data.length; i++) {
		  // increase rank only if current score less than previous
		  if (i > 0 && (data[i].DribblesCompleted) < (data[i - 1].DribblesCompleted)) {
		    rank_dribbles_completed_total++;
		  }
		    data[i].rank_dribbles_completed_total = rank_dribbles_completed_total;
		}


		data.sort(function(x, y){
			return d3.descending(x.Dribbles/x.Minutes, y.Dribbles/y.Minutes);
		})

		var rank_dribbles = 1;
		for (var i = 0; i < data.length; i++) {
		  // increase rank only if current score less than previous
		  if (i > 0 && (data[i].Dribbles/data[i].Minutes) < (data[i - 1].Dribbles/data[i - 1].Minutes)) {
		    rank_dribbles++;
		  }
		    data[i].rank_dribbles = rank_dribbles;
		}		

		data = data.slice(0, 40)
		


		

		// domains
		xScale.domain(d3.extent(data, function(d) { return d.Dribbles/(d.Minutes/90); })).nice();
		yScale.domain(data.map(function(d) { return d.Player; }));
		
		// define X axis
		//var formatAsPercentage = d3.format("1.0%");

		var xAxis = d3.axisBottom()
							  .scale(xScale)
							  //.tickFormat(formatAsPercentage);
								
		// create svg
		var svg = d3.select("#container_player_dribbles_bar")
			.append("svg")
				.attr("width", width + margin_bar.left + margin_bar.right)
				.attr("height", height + margin_bar.top + margin_bar.bottom )
			.append("g")
				.attr("transform", "translate(" + margin_bar.left + "," + margin_bar.top + ")");
						
		
		// format tooltip
		var thsndFormat = d3.format(",");
		/*
		var tickNeg = svg.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(" + xScale(0)  + ",0)")
				.call(d3.axisLeft(yScale))
				.selectAll(".tick")
			
			//.filter(function(d, i) { return (data[i].Minutes) < 0; });
		
		tickNeg.select("line")
			.attr("x2", 6);
			
		tickNeg.select("text")
			.attr("x", 9)
			.style("text-anchor", "start");	
		*/
			
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
				.attr("y", function(d) { return yScale(d.Player); })
				.attr("height", yScale.bandwidth() - 1)
				.attr("x",  d => { return width + 300; })
				.attr("width", 0) //function(d) { return Math.abs(xScale(d.Minutes) - xScale(0)); })
				.attr("fill", function(d) {return ColourMap[d.Club]} )
			bars.transition()
				.duration(500)
				.delay(function (d, i) {
							return i * 30;
							})
				.attr("x", function(d) { return xScale(Math.min(0, d.Dribbles/(d.Minutes/90))) + 150; })
				.attr("width", function(d) { return (Math.abs(xScale(d.Dribbles/(d.Minutes/90)) - xScale(0)))*0.8; })			
				
			// tooltip
			bars.on("mouseover", function(d) {
				d3.select(this).style("fill", function() {
					return d3.rgb(d3.select(this).style("fill")).brighter(0.99);
					});
				div.transition()
				 .duration(200)
         .style("opacity", 1.0);
				div.html(d.Player + " completed " + Math.round((d.DribblesCompleted/(d.Minutes/90))*100)/100 + " successful dribbles per 90 minutes.")
        .style("left", (d3.event.pageX )  + 10 + "px")
        .style("top", (d3.event.pageY) - scrollY + 30 + "px");
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
	 
	var labels = svg.selectAll("text")
			   .data(data)
			   .enter()
			   .append("text")
			   .text(function(d) {
			   		return d.Player;
			   })
			   .attr("text-anchor", "start")
			   .attr("y", function(d) { return yScale(d.Player) + 10; })
			   .attr("x", xScale(0) + 22)
			   .attr("font-family", "sans-serif")
			   .attr("font-size", "11px")	
			   .attr("fill", "white");
		
    //});       		


var placeholders = document.querySelectorAll(".placeholderText > p")
    
    
window.addEventListener("scroll", function(e) {
    
    
    var last;
    for (var placeholder of placeholders) { 
        var top = placeholder.getBoundingClientRect().top
        if (top < 0 )
            {
            last = placeholder  
            }
        }
    
    if (last.id === "P1") {	

    data.sort(function(x, y){
			return d3.descending(x.Dribbles/x.Minutes, y.Dribbles/y.Minutes);
		})	

    xScale.domain(d3.extent(data, function(d) { return d.Dribbles/(d.Minutes/90); })).nice();
    yScale.domain(data.map(function(d) { return d.Player; }));

    svg.selectAll("text")	
			.transition()
				.attr("y", function(d) { return yScale(d.Player) + 10; })
				.text(function(d) {
			   		return d.Player;
			   })
		
	svg.selectAll(".bar")
			.transition()
				.attr("y", function(d) { return yScale(d.Player); })
				.attr("x", function(d) { return xScale(Math.min(0, d.Dribbles/(d.Minutes/90))) + 150; })
				.attr("width", function(d) { return (Math.abs(xScale(d.Dribbles/(d.Minutes/90)) - xScale(0)))*0.8; })	
	
			}

	if (last.id === "P2") {		

	data.sort(function(x, y){
			return d3.descending(x.DribblesCompleted/x.Minutes, y.DribblesCompleted/y.Minutes);
		})	

    yScale.domain(data.map(function(d) { return d.Player; }));

    svg.selectAll("text")	
			.transition()
				.attr("y", function(d) { return yScale(d.Player) + 10; })
				.text(function(d) {
			   		return d.Player;
			   })

	svg.selectAll(".bar")
			.transition()
				.attr("y", function(d) { return yScale(d.Player); })
				.attr("x", function(d) { return xScale(Math.min(0, d.DribblesCompleted/(d.Minutes/90))) + 150; })
				.attr("width", function(d) { return (Math.abs(xScale(d.DribblesCompleted/(d.Minutes/90)) - xScale(0)))*0.8; })


	//tickNeg.transition().remove();
	//tickNeg3.transition().remove();
	
	//tickNeg2 = svg.append("g")
	//			.attr("class", "y axis")
	//			.attr("transform", "translate(0,0)")
	//			.call(d3.axisLeft(yScale))
	//			.selectAll(".tick");
				
    	   //.transition()
           //.call(yScale)
           //.selectAll(".tick");
				       
			}

	
	if (last.id === "P3") {	

	data.sort(function(x, y){
			return d3.descending(x.DribblesCompleted, y.DribblesCompleted);
		})	

	xScale2.domain(d3.extent(data, function(d) { return d.DribblesCompleted; })).nice();
	yScale2.domain(data.map(function(d) { return d.Player; }));	

	
	//tickNeg.transition()
    //		.style("opacity", 0)
    //		.transition()
    //        .call(d3.axisLeft(yScale2))
    //        .style("opacity", 1);

    //tickNeg.transition().remove()
    //	   .transition()
    //       .call(d3.axisLeft(yScale2))
    //       .selectAll(".tick");

    //tickNeg.transition()exit().remove();

    //tickNeg.transition().remove()


    //var tickNeg2 = svg.append("g")
	//			.attr("class", "y axis")
	//			.attr("transform", "translate(" + xScale2(0)  + ",0)")
	//			.call(d3.axisLeft(yScale2))
	//			.selectAll(".tick")
	svg.selectAll("text")	
			.transition()
				.attr("y", function(d) { return yScale2(d.Player) + 10; })
				.text(function(d) {
			   		return d.Player;
			   })

	
	
	svg.selectAll(".bar")
			.transition()
				.attr("y", function(d) { return yScale2(d.Player); })
				.attr("x", function(d) { return xScale2(Math.min(0, d.DribblesCompleted)) - 100; })
				.attr("width", function(d) { return (Math.abs(xScale2(d.DribblesCompleted) - xScale2(0))); })	

	svg.selectAll(".bar")    
                .on("mouseover", function(d) {
				d3.select(this).style("fill", function() {
					return d3.rgb(d3.select(this).style("fill")).brighter(0.99);
					});
				div.transition()
				 .duration(200)
         .style("opacity", 1.0);
				div.html(d.Player + " completed " + d.DribblesCompleted+ " successful dribbles in total.")
        .style("left", (d3.event.pageX )  + 10 + "px")
        .style("top", (d3.event.pageY) - scrollY + 30 + "px");
        //.style("height",  60 + "px");
			})			
			bars.on("mouseout", function(d) {
				d3.select(this).style("fill", function() {
					return d3.rgb(d3.select(this).style("fill")).darker(0.99);
                      });
                    tooltip.transition()
                         .duration(500)
                         .style("opacity", 0);					
				
		     }); 
			}
							
    		
	});
  });
})()
