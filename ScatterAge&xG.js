(function () {

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 680 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */ 

// setup x 
var xValue = function(d) { return d.PlayerAge;}, // data -> value
    xScale = d3.scaleLinear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.axisBottom().scale(xScale);

// setup y
var yValue = function(d) { return d.Minutes;}, // data -> value
    yScale = d3.scaleLinear().range([height, 25]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.axisLeft().scale(yScale); 
                   

// add the graph canvas to the body of the webpage
var svg = d3.select("#scatter_age").append("svg")
    .attr("width", width + margin.left  + margin.right + 30)
    .attr("height", height + margin.top  + margin.bottom + 30)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

svg.append("rect")
    .attr("dominant-baseline", "text-before-edge")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "#f0eadc");   

// add the tooltip area to the webpage
var tooltip = d3.select("#scatter_age").append("div")
    .attr("class", "tooltip_scatter")
    .style("opacity", 0);


// load data
d3.csv("https://raw.githubusercontent.com/jakehughes1882/data/master/UCL_Player_Age.csv", function(error, data) {

 // List of groups (here I have one group per column)
  var allGroup = d3.map(data, function(d){return(d.Club)}).keys()
  
  //add All Clubs option
  allGroup.push("All Clubs")

  // add the options to the button
  d3.select("#selectButton")
    .selectAll('myOptions')
    .data(allGroup)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button 
    .enter()
    .append('option') 
    .text("All")
    .attr("value", "All")

 // change string (from CSV) into number format
  data.forEach(function(d) {
    d.PlayerAge = +d.PlayerAge;
    d.Minutes = +d.Minutes;
//    console.log(d);
  }); 


  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
  yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      //.call(xAxis)
  svg.append("text")             
      .attr("transform",
            "translate(" + (width - 300) + " ," + 
                           (height + margin.top + 30) + ")")
      .style("text-anchor", "middle")
      .style("text-fill", "#2E3440")
      .text("Age (at Competition Start)");

  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      //.call(yAxis)
  var ylabeltext = svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 50 - margin.left)
      .attr("x", 60 - (height/1.5))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "#2E3440")
      .text("Minutes Played");   

    var ColourMap = {'Manchester City': '#65a5d3', 'Tottenham': '#10204b', 'Liverpool': '#d3151e', 'Chelsea': '#094595', 
                     'Bayern Munich': '#cc0134', 'Real Madrid': '#cfd3e7', 'Paris Saint-Germain': '#1a2b4c', 'RasenBallsport Leipzig': '#bc0506',
                     'Salzburg': '#dd232b', 'Atalanta': '#1171bc', 'Atletico Madrid': '#eb1a47', 'Napoli': '#1ea1db',
                     'Barcelona': '#2e3684', 'Borussia Dortmund': '#fcea1c', 'Juventus': '#272727', 'Inter': '#3a7af4',
                     'Valencia': '#fb4b13', 'Slavia Prague': '#d11219', 'Olympiacos': '#e30613', 'Club Brugge': '#3333ff',
                     'Lille': '#d9001e', 'Benfica': '#dd232b', 'Genk': '#2353fc', 'Shakhtar Donetsk': '#e3620a',
                     'Ajax': '#c5031b', 'Dinamo Zagreb': '#0216e4', 'Lyon': '#011f68', 'Zenit St. Petersburg': '#1a93d6',
                     'Lokomotiv Moscow': '#cc2e22', 'Bayer Leverkusen': '#e00001', 'FK Crvena Zvezda': '#d40511', 'Galatasaray': '#f67804'
      } 
  // draw dots
  var dot = svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 5)
      .attr("cx", xMap)
      .attr("cy", yMap)
      //.style("fill", function(d) { return color(cValue(d));})
      .attr("fill", function(d) {return ColourMap[d.Club]} )
      .attr("lineWidth", 0) 
      .on("mouseover", function(d) {
          d3.select(this).style("fill", function() {
                    return d3.rgb(d3.select(this).style("fill")).darker(0.99);
                    });
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d.Name + " (" + d.PlayerAge + ") played " + d.Minutes + " minutes for " + d.Club + " during the group stage.")
               .style("left", (d3.event.pageX + 13) + "px")
               .style("top", (d3.event.pageY + 13) + "px");
      })
      .on("mouseout", function(d) {
          d3.select(this).style("fill", function() {
            return d3.rgb(d3.select(this).style("fill")).brighter(0.99);
            });
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });

    // A function that update the chart
    function update(selectedGroup) {

      var selectedteam = selectedGroup

    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {

        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        console.log(selectedOption)

        svg.selectAll(".dot")
                .transition()
                .duration(1000)
                .attr("r", function(d) {if (selectedOption == "All Clubs") {return 6;}
                                        else if (d.Club == selectedOption)  {return 6;} else {return 0;} }  );
    })

});


})()       