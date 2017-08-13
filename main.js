//Requirements
//Display a heat map with data represented both on the Y and X axis.
//Each cell is colored based on its relationship to other data.
//User can mouse over a cell in the heat map to get more exact information.

//Add button to use F/C

$(document).ready(function() {
  //Variables
  const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';
  let dataArr = [],
    tempUnit = "C",
    margin = {top: 90, right: 20, bottom: 80, left: 50},
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    //colorArr = ['#5E4FA2', '#3288BD', '#66C2A5', '#ABDDA4', '#E6F598', '#FFFFBF', '#FEE08B', '#FDAE61', '#E06D43', '#D53E4F', '#9E0142'],
    colorArr = ['#0066ff', '#3385ff', '#66a3ff', '#99c2ff', '#cce0ff', '#FFFFBF', '#ffcccc', '#ff9999', '#ff6666', '#ff3333', '#ff0000'],
    w = 1600,
    h = 850;
  let div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
  let color = d3.scaleQuantile()
  .domain([-5,-4,-3,-2,-1,0,1,2,3,4,5])
  .range(colorArr);

  //Execute
  getData();

  //Functions
  function convertTemp(cel){
    return (cel*1.8)+32;
  }

  function getData() {
    d3.json(url, function(data) {console.log(data);
      makeChart(data);
    })
  }

  function makeChart(data) {
    d3.select("svg").remove();
      let baseTemp = data.baseTemperature;
      let bT = baseTemp;
      let years = data.monthlyVariance.length/12;
      let canvas = d3.select(".chartWrap").append("svg").attr("width", w).attr("height", h);
      //Scale
      let xScale = d3.scaleLinear()
        .domain([1753, 2015]).range([margin.left + margin.right, w - margin.left - margin.right]); //margin.left + margin.right, w - margin.left - margin.right
      let yScale = d3.scaleLinear()
        .domain([1, 12]).range([margin.top, h - margin.bottom - margin.top]); //margin.bottom + margin.top, h - margin.bottom - margin.top
      //Title
      let chartTitle = canvas.append("text").html("Monthly Global Land-Surface Temperature in &deg;" + tempUnit).attr("x", w/2).attr("y", 40).attr("text-anchor", "middle").attr("font-size", 36).attr("class", "chartTitle");
      let chartSubTitle = canvas.append("text").text("(1753 - 2015)").attr("x", w/2).attr("y", 75).attr("text-anchor", "middle").attr("font-size", 28).attr("class", "chartTitle");
      //Create Axis
      let xAxis = d3.axisBottom(xScale)
        .ticks(10) //Set # of ticks
      let yAxis = d3.axisLeft(yScale)
        //  .tickFormat(function(d,i) {return months[i]}) //Use "Jan, Feb, etc.." instad of generated ticks
        .tickFormat('') //Remove lables, will add .text elements to build own labels
        for (i=0;i<months.length;i++) {
          canvas.append("text").text(function(){return months[i]})
            .attr("x", 40).attr("y", 120+(i*55)).attr("text-anchor", "middle").attr("font-size", 22);
        }
      canvas.append("g") //Create group for xAxis
       .attr("class", "axis") //Assigns "axis" class so we can use CSS to format
       .attr("transform", "translate(0," + (h - margin.bottom -17) + ")")
       .call(xAxis);
      canvas.append("g") //Create group for yAxis
       .attr("class", "axis")
       .attr("transform", "translate(" + (margin.left + margin.right) + ",0)")
       .call(yAxis);
      //Create rect data points
      canvas.selectAll("rect")
        .data(data.monthlyVariance)
        .enter()
        .append("rect")
        .attr("width", w/years)
        .attr("height", h/12)
        .attr("x", function(d) {return xScale(d.year);})
        .attr("y", function(d) {return yScale(d.month);})
        .attr("fill", function(d) {return color(d.variance)})
        //tooltip... Use .on to popup tooltip div... Not perfect but it works...
        .on("mouseover", function(d) {
          let vari = d.variance;
          if (tempUnit == "F") {bT = convertTemp(baseTemp); vari = d.variance*1.8};
          div.transition().duration(200).style("opacity", .9);
          div.html(months[d.month-1] + ", " + d.year + "<br>" + (bT + vari).toFixed(3) + "&deg;" + tempUnit + " (" + (vari).toFixed(3) + "&deg;" + tempUnit + ")" )
            .style("right", "+550px").style("top", "-835px");
        })
        .on("mouseout", function(d) {div.transition().duration(500).style("opacity", 0);});
        //Create Color Bar legend
        for (i=0;i<colorArr.length;i++) {
          canvas.append('rect').attr("width", 60).attr("height", 20).attr("fill", colorArr[i]).attr("x", 460+(i*60)).attr("y", 780);
          canvas.append("text").text(function(){if (tempUnit == "C"){ return -5+i;} else {return (-9+(i*1.8)).toFixed(1);}}) //-5+i
            .attr("x", 490+(i*60)).attr("y", 797).attr("text-anchor", "middle").attr("font-size", 20);
        }
        if (tempUnit == "F") {bT = convertTemp(baseTemp);};
        canvas.append("text").html("Temperature Variance from Historical Base (" + bT + "&deg;" + tempUnit + ")").attr("x", w/2).attr("y", 828).attr("text-anchor", "middle").attr("font-size", 22);
        //Add c/f button
        canvas.append('rect').attr("id", "btn").attr("width", 80).attr("height", 60).attr("fill", "lightgrey").attr("x", w-margin.right-124).attr("y", 20)
          .attr("rx", 8).attr("ry", 8).style("stroke", "black").style("stroke-width", 2)
          .on("mouseover", function(d) {d3.select(this).style("cursor", "pointer").attr("fill", "grey");}) //Change cursor to pointer and darken
          .on("mouseout", function(d) {d3.select(this).attr("fill", "lightgrey");})
          .on("click", function() {if(tempUnit == "C") {tempUnit = "F"} else {tempUnit = "C"}; makeChart(data);});
        canvas.append("text").text("C / F").attr("x", w-margin.right-84).attr("y", 58).attr("text-anchor", "middle").attr("font-size", 22)
          .on("mouseover", function(d) {d3.select(this).style("cursor", "pointer");d3.select("#btn").attr("fill", "grey");})
          .on("click", function() {if(tempUnit == "C") {tempUnit = "F"} else {tempUnit = "C"}; makeChart(data);});
        //Add source citation
        canvas.append("text").html("Data provided by FreeCodeCamp, no source cited.").attr("x", 1400).attr("y", 835).attr("text-anchor", "middle").attr("font-size", 12).attr("fill", "blue");


  } //Closes makeChart

}); //Closes document.ready
