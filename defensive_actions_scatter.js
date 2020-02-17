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
var xValue = function(d) { return d.Minutes;}, // data -> value
    xScale = d3.scaleLinear().range([50, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.axisBottom().scale(xScale);

// setup y
var xValueDP = function(d) { return (d.DribbledPast/d.Minutes);}, // data -> value
    xScaleDP = d3.scaleLinear().range([50, width]), // value -> display
    xMapDP = function(d) { return xScaleDP(xValueDP(d));}, // data -> display
    xAxisDP = d3.axisBottom().scale(xScaleDP); 

// setup y
var yValueInt = function(d) { return d.Interceptions;}, // data -> value
    yScaleInt = d3.scaleLinear().range([height, 0]), // value -> display
    yMapInt = function(d) { return yScaleInt(yValueInt(d));}, // data -> display
    yAxisInt = d3.axisLeft().scale(yScaleInt);
 

// setup y
var yValueTackW = function(d) { return (d.TacklesWon/d.Minutes);}, // data -> value
    yScaleTackW = d3.scaleLinear().range([height, 0]), // value -> display
    yMapTackW = function(d) { return yScaleTackW(yValueTackW(d));}, // data -> display
    yAxisTackW = d3.axisLeft().scale(yScaleTackW);  

// setup y
var yValueTackWR = function(d) { return d.TacklesWon;}, // data -> value
    yScaleTackWR = d3.scaleLinear().range([height, 0]), // value -> display
    yMapTackWR = function(d) { return yScaleTackWR(yValueTackWR(d));}, // data -> display
    yAxisTackWR = d3.axisLeft().scale(yScaleTackWR);             


// add the graph canvas to the body of the webpage
var svg = d3.select("#scatter").append("svg")
    .attr("width", width + margin.left  + margin.right + 30)
    .attr("height", height + margin.top  + margin.bottom + 30)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

svg.append("rect")
    .attr("dominant-baseline", "text-before-edge")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "#D8DEE9");   

// add the tooltip area to the webpage
var tooltip = d3.select("#scatter").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


// load data
d3.csv("https://raw.githubusercontent.com/jakehughes1882/data/master/UCL_2019_Player_Stats.csv", function(error, data) {

 // change string (from CSV) into number format
  data.forEach(function(d) {
    d.Minutes = +d.Minutes;
    d.DribbledPast = +d.DribbledPast;
    d.Interceptions = +d.Interceptions;
    d.TacklesWon = +d.TacklesWon;
  }); 

  var data = data.filter(function(d) {
      return d.Minutes > 44;
    });


  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
  yScaleInt.domain([d3.min(data, yValueInt)-1, d3.max(data, yValueInt)+1]);

  //xScaleDP.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
  //yAxisTackW.domain([d3.min(data, yValueInt)-1, d3.max(data, yValueInt)+1]);


  // Players Title
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      //.call(xAxis)
  var titleaxis = svg.append("text")             
      .attr("transform",
            "translate(" + (width - 300) + " ," + 
                           (margin.top  + 30) + ")")
      .style("text-anchor", "middle")
      .text(" ");

  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      //.call(xAxis)
  var xaxis = svg.append("text")             
      .attr("transform",
            "translate(" + (width - 300) + " ," + 
                           (height + margin.top + 30) + ")")
      .style("text-anchor", "middle")
      .text("Minutes");

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
      .text("Interceptions");   

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
  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 5)
      .attr("cx", xMap)
      .attr("cy", yMapInt)
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
          tooltip.html(d.Player + " for " + d.Club + " completed " + d.Interceptions + " interceptions in " +
                       d.Minutes + " minutes of Champions League football.")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - scrollY - 28) + "px");
      })
      .on("mouseout", function(d) {
          d3.select(this).style("fill", function() {
            return d3.rgb(d3.select(this).style("fill")).brighter(0.99);
            });
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });

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

    if (last.id === "D1") {

            titleaxis.transition()
             .style("opacity", 0)
             .transition()
             .text(" ")
             .style("opacity", 1);
            
            svg.selectAll(".dot")
                .transition()
                .duration(1000)
                .attr("r", 5)
                .attr("cx", xMap)
                .attr("cy", yMapInt)
                //.style("fill", function(d) { return color(cValue(d));})
                .attr("fill", function(d) {return ColourMap[d.Club]} )
                .attr("lineWidth", 0) 
            svg.selectAll(".dot")    
                .on("mouseover", function(d) {
                    d3.select(this).style("fill", function() {
                              return d3.rgb(d3.select(this).style("fill")).darker(0.99);
                              });
                    tooltip.transition()
                         .duration(200)
                         .style("opacity", .9);
                    tooltip.html(d.Player + " for " + d.Club + " completed " + d.Interceptions + " interceptions in " +
                                 d.Minutes + " minutes of Champions League football.")
                         .style("left", (d3.event.pageX + 5) + "px")
                         .style("top", (d3.event.pageY - scrollY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    d3.select(this).style("fill", function() {
                      return d3.rgb(d3.select(this).style("fill")).brighter(0.99);
                      });
                    tooltip.transition()
                         .duration(500)
                         .style("opacity", 0);
                });
        }

        if (last.id === "D2") {  

          titleaxis.transition()
             .style("opacity", 0)
             .transition()
             .text("Defenders")
             .style("opacity", 1);

          var Defenders = {' ': 0, 'DF': 6, 'DF,FW': 6, 'DF,MF': 6,
                           'FW': 0, 'FW,MF': 0, 'GK': 0, 'MF': 0} 
            
            svg.selectAll(".dot")
                .transition()
                .duration(1000)
                .attr("r", function(d) {return Defenders[d.Position]} )
        }

        if (last.id === "D3") {  

          titleaxis.transition()
             .style("opacity", 0)
             .transition()
             .text("Midfielders")
             .style("opacity", 1);

          xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
          yScaleInt.domain([d3.min(data, yValueInt)-1, d3.max(data, yValueInt)+1]);

            svg.select(".x.axis")
               .transition()
               .duration(1000)

            svg.select(".y.axis")
               .transition()
               .duration(1000)    


          var Midfielders = {' ': 0, 'DF': 0, 'DF,FW': 0, 'DF,MF': 6,
                           'FW': 0, 'FW,MF': 6, 'GK': 0, 'MF': 6} 
            
            svg.selectAll(".dot")
                .transition()
                .duration(1000)
                .attr("r", function(d) {return Midfielders[d.Position]} )
                .attr("cx", xMap)
                .attr("cy", yMapInt)
            svg.selectAll(".dot")    
                .on("mouseover", function(d) {
                    d3.select(this).style("fill", function() {
                              return d3.rgb(d3.select(this).style("fill")).darker(0.99);
                              });
                    tooltip.transition()
                         .duration(200)
                         .style("opacity", .9);
                    tooltip.html(d.Player + " for " + d.Club + " completed " + d.Interceptions + " interceptions in " +
                                 d.Minutes + " minutes of Champions League football.")
                         .style("left", (d3.event.pageX + 5) + "px")
                         .style("top", (d3.event.pageY - scrollY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    d3.select(this).style("fill", function() {
                      return d3.rgb(d3.select(this).style("fill")).brighter(0.99);
                      });
                    tooltip.transition()
                         .duration(500)
                         .style("opacity", 0);
                });

        ylabeltext.transition()
             .style("opacity", 0)
             .transition()
             .text("Interceptions")
             .style("opacity", 1);                     

        } 

        if (last.id === "D4") {

        titleaxis.transition()
             .style("opacity", 0)
             .transition()
             .text(" ")
             .style("opacity", 1);  

        yScaleTackWR.domain([d3.min(data, yValueTackWR), d3.max(data, yValueTackWR)+0.5]); 

            svg.select(".y.axis")
               .transition()
               .duration(1000) 

            
            svg.selectAll(".dot")
                .transition()
                .duration(1000)
                .attr("r", 6)
                .transition()
                .duration(1000)
                .attr("cx", xMap)
                .attr("cy", yMapTackWR)
            svg.selectAll(".dot")    
                .on("mouseover", function(d) {
                        d3.select(this).style("fill", function() {
                                  return d3.rgb(d3.select(this).style("fill")).darker(0.99);
                                  });
                        tooltip.transition()
                             .duration(200)
                             .style("opacity", .9);
                        tooltip.html(d.Player + " for " + d.Club + " completed " + (d.TacklesWon) + " tackles, over " +
                                     d.Minutes + " minutes.")
                             .style("left", (d3.event.pageX + 5) + "px")
                             .style("top", (d3.event.pageY - scrollY - 28) + "px");
                    })
                    .on("mouseout", function(d) {
                        d3.select(this).style("fill", function() {
                          return d3.rgb(d3.select(this).style("fill")).brighter(0.99);
                          });
                        tooltip.transition()
                             .duration(500)
                             .style("opacity", 0);
                    });  

        ylabeltext.transition()
             .style("opacity", 0)
             .transition()
             .text("Tackles Won")
             .style("opacity", 1); 

        xaxis.transition()
             .style("opacity", 0)
             .transition()
             .text("Minutes")
             .style("opacity", 1);                 

        }

        if (last.id === "D5") { 

        titleaxis.transition()
             .style("opacity", 0)
             .transition()
             .text(" ")
             .style("opacity", 1); 

        ylabeltext.transition()
             .style("opacity", 0)
             .transition()
             .text("Tackles Won per 90")
             .style("opacity", 1);      

        xaxis.transition()
             .style("opacity", 0)
             .transition()
             .text("Dribbled Past per 90")
             .style("opacity", 1);
             //.remove();   

        xScaleDP.domain([d3.min(data, xValueDP), d3.max(data, xValueDP)+0.005]); 
        yScaleTackW.domain([d3.min(data, yValueTackW), d3.max(data, yValueTackW)+0.005]);
            
            svg.select(".x.axis")
               .transition()
               .duration(1000)

            svg.selectAll(".dot")
                .transition()
                .duration(1000)
                .attr("cx", xMapDP) 
                .attr("cy", yMapTackW) 
            svg.selectAll(".dot")    
                .on("mouseover", function(d) {
                        d3.select(this).style("fill", function() {
                                  return d3.rgb(d3.select(this).style("fill")).darker(0.99);
                                  });
                        tooltip.transition()
                             .duration(200)
                             .style("opacity", .9);
                        tooltip.html(d.Player + " for " + d.Club + " completed " + Math.round((d.TacklesWon/(d.Minutes/90))*100)/100 + " tackles per 90 minutes, but was dribbled past " +
                                Math.round((d.DribbledPast/(d.Minutes/90))*100)/100 + " times per 90 minutes.")
                             .style("left", (d3.event.pageX + 5) + "px")
                             .style("top", (d3.event.pageY - scrollY - 28) + "px");
                    })
                    .on("mouseout", function(d) {
                        d3.select(this).style("fill", function() {
                          return d3.rgb(d3.select(this).style("fill")).brighter(0.99);
                          });
                        tooltip.transition()
                             .duration(500)
                             .style("opacity", 0);
                    });                       
        } 

        if (last.id === "D6") {  

          titleaxis.transition()
             .style("opacity", 0)
             .transition()
             .text("Defenders")
             .style("")
             .style("opacity", 1);

          var Defenders = {' ': 0, 'DF': 6, 'DF,FW': 6, 'DF,MF': 6,
                           'FW': 0, 'FW,MF': 0, 'GK': 0, 'MF': 0} 
            
            svg.selectAll(".dot")
                .transition()
                .duration(1000)
                .attr("r", function(d) {return Defenders[d.Position]} )
        }

        if (last.id === "D7") {  

          titleaxis.transition()
             .style("opacity", 0)
             .transition()
             .text("Midfielders")
             .style("opacity", 1);

          var Midfielders = {' ': 0, 'DF': 0, 'DF,FW': 0, 'DF,MF': 6,
                           'FW': 0, 'FW,MF': 6, 'GK': 0, 'MF': 6} 
            
            svg.selectAll(".dot")
                .transition()
                .duration(1000)
                .attr("r", function(d) {return Midfielders[d.Position]} )
        }                    

    });
});


})()       