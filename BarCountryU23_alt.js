// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 660 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#container_country_age_bar_")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var div = d3.select("#container_country_age_bar_").append("div")
    .attr("class", "tooltipbar_country")
    .style("opacity", 0);

// Parse the Data
d3.csv("https://raw.githubusercontent.com/jakehughes1882/data/master/CountryU23Minutes.csv", function(data) {

  // sort data
  data.sort(function(b, a) {
    return a.Minutes - b.Minutes;
  });

  // X axis
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(data.map(function(d) { return d.Country; }))
    .padding(0.2);
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    //.attr("visibility","hidden") //visibility:hidden;
    .style("fill","none")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .style("fill", "#f0eadc")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 8000])
    .range([ height, 0]);
  svg.append("g")
    //.call(d3.axisLeft(y));

  var ColourMap = {'France': '#0216e4', 'Brazil':'#fedf00', 'England':'#ffffff', 'Spain':'#c60b1e', 'Portugal':'#d50a2a',
                   'Germany': '#f8f8f8', 'Argentina': '#73acdf', 'Belgium': '#e2320b', 'Nigeria': '#008751', 'Netherlands': '#f08731',
                   'Denmark': '#bc333b', 'Colombia': '#ebe04f', 'Russia': '#ee2924', 'Italy':'#0061a5', 'Turkey':'#d4282f', 
                   'Austria': '#d21e05', 'Uruguay':'#4793bd', 'Ukraine':'#e6d51c', 'Norway':'#b80027', 'Cameroon':'#029f7e'
			}  

  // Bars
  var bars = 	svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d.Country); })
      .attr("y", function(d) { return y(d.Minutes); })
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", function(d) {return ColourMap[d.Country]} )
    bars.transition()
    		.duration(500)
				.delay(function (d, i) {
							return i * 30;
							}) 
				.attr("height", function(d) { return height - y(d.Minutes); })			 

  bars.on("mouseover", function(d) {
				d3.select(this).style("fill", function() {
					return d3.rgb(d3.select(this).style("fill")).brighter(0.99);
					});
				div.transition()
				 .duration(200)
         .style("opacity", 1.0);
				div.html(d.Minutes + " minutes were played by the players above for " + d.Country + ".")
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

})