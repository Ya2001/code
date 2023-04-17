var movies = d3.csv("https://raw.githubusercontent.com/Ya2001/data_repo/main/rotten.csv").then(function(data){
    var movie_data = data.map(function(d){
        return {
            title: d.title,
            year: d.year,
            critic_score: d.critic_score,
            people_score: d.people_score,
            box_office: d.box_office,
            film: d.film,
            winner: d.winner,
            catagory: d.catagory
        }
    })

    var width = 800;
    var height = 400;
    var margin = {top: 20, right: 20, bottom: 50, left: 60};
    moviesData = [];
    function getData(movies_year) {
        for(var i = 0; i < movie_data.length; i++) {
          if(movie_data[i].year == movies_year){
            moviesData.push(movie_data[i]);
          } 
        }
        return moviesData;
      }

    var yearSelect = document.getElementById("year");

    yearSelect.addEventListener("change", function() {
        var text1 = d3.select("#bars");
        text1.style("opacity", 1);
        var don1 = d3.select("#don-chart");
        don1.style("opacity",1);
        var selectedYear = yearSelect.value;
        if(moviesData.length == 0){
            getData(selectedYear);
            createScatter(moviesData);
            createBar(moviesData);
            createDon(moviesData);
        }
        else if(moviesData.length != 0){
            moviesData.splice(0,moviesData.length);
            getData(selectedYear);
            updateScatter(moviesData);
            updateBar(moviesData);
            updateDon(moviesData);
        }
        
        var container = d3.select("#container");
        container.selectAll("h1, p").remove();
    });

    var criticSvg = d3.select("#scatter-plots")
    .append("svg")
    .attr("width", width/2)
    .attr("height", height)
    .attr("class", "critic-svg")
    .style("float", "left");

    var audienceSvg = d3.select("#scatter-plots")
    .append("svg")
    .attr("width", width/2)
    .attr("height", height)
    .attr("class", "audience-svg")
    .style("float", "left");

    var BarSvg = d3.select("#bar-charts")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
    .style("float", "left");

    var donSvg = d3.select("#don-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
    .style("float", "left");

    function createBar(moviesData) {
        var criticWins = 0;
        var peopleWins = 0;
        var criticFavs = [];
        var peopleFavs = [];
        for(var i = 0; i < moviesData.length; i++) {
            if(movie_data[i].critic_score > movie_data[i].people_score){
                criticFavs.push(movie_data[i]);
            }
            else {
                peopleFavs.push(movie_data[i]);
            }
        }

        for (var i = 0; i < criticFavs.length; i++){
            if(criticFavs[i].winner){
                criticWins += 1;
            }
        }
        for (var i = 0; i < peopleFavs.length; i++){
            if(peopleFavs[i].winner){
                peopleWins += 1;
            }
        }

        var favs = [{name:"Critics",score: criticWins}, {name:"Audiences",score:peopleWins}];
        // console.log(favs[0].score);
        const x = d3.scaleBand()
            .domain(d3.range(favs.length))
            .range([margin.left, width - margin.right])
            .padding(0.1)

        const y = d3.scaleLinear()
        .domain([0, 20])
        .range([height-margin.bottom, margin.top]);

        BarSvg.append("g")
        .attr("fill", "rgba(246, 194, 52, 0.631)")
        .selectAll("rect")
        .data(favs)
        .join("rect")
            .attr("x", (d,i) => x(i)) 
            .attr("y", (d) => y(d.score))
            .attr("height", d => y(0) - y(d.score))
            .attr("width", x.bandwidth())

        function xAxis(g){
            g.attr("transform", "translate(0," + (height - margin.bottom)+ ")")
            .call(d3.axisBottom(x).tickFormat(i => favs[i].name))
            .attr("font-size","20px")
            .attr("font-family", "Gill Sans")
            .attr("color", "aliceblue")
        }
        function yAxis(g){
            g.attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y))
            .attr("font-size","20px")
            .attr("font-family", "Gill Sans")
            .attr("color", "aliceblue")

        }
        BarSvg.append("g").call(yAxis);
        BarSvg.append("g").call(xAxis);
        BarSvg.node();

  
      }

 

    function createScatter(moviesData) {
        var criticTooltip = d3.select("#scatter-plots")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("background-color", "aliceblue")
            .style("float", "left");

        var audienceTooltip = d3.select("#scatter-plots")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("float", "left");

        var yMax = d3.max(moviesData, function(d) {
            return Math.max(+d.critic_score, +d.people_score);
        });


            
        var criticXScale = d3.scaleBand()
            .domain(moviesData.map(d => d.title))
            .range([margin.left, width/2 - margin.right])
            .padding(0.1);

        var audienceXScale = d3.scaleBand()
            .domain(moviesData.map(d => d.title))
            .range([margin.left, width/2 - margin.right])
            .padding(0.1);

        var criticYScale = d3.scaleLinear()
            .domain([0, yMax])
            .range([height - margin.bottom, margin.top]);

        var audienceYScale = d3.scaleLinear()
            .domain([0, yMax])
            .range([height - margin.bottom, margin.top]);

        var criticXAxis = d3.axisBottom(criticXScale).tickFormat("");
        var audienceXAxis = d3.axisBottom(audienceXScale).tickFormat("");
        var criticYAxis = d3.axisLeft(criticYScale);
        var audienceYAxis = d3.axisRight(audienceYScale);

        // Append text to criticSvg
        criticSvg.append("text")
        .attr("class", "chart-label")
        .attr("x", (width/2 - margin.left - margin.right) / 2)
        .attr("y", height - margin.bottom + 40)
        .style("font-size", "20px")
        .style("fill", "aliceblue")
        .text("Critic Scores");

        // Append text to audienceSvg
        audienceSvg.append("text")
        .attr("class", "chart-label")
        .attr("x", (width/2 - margin.left - margin.right) / 2)
        .attr("y", height - margin.bottom + 40)
        .style("font-size", "20px")
        .style("fill", "aliceblue")
        .text("Audience Scores");

        criticSvg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(criticXAxis);

        criticSvg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(criticYAxis)
        .style("text-anchor", "end")
        .attr("dx", "-1.5em")
        .attr("dy", ".15em");

        audienceSvg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(audienceYAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-1.5em")
        .attr("dy", ".15em")

        audienceSvg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(audienceXAxis);

        var audienceDots = audienceSvg.append('g')
            .selectAll('dot').data(moviesData);

        var criticDots = criticSvg.append('g')
            .selectAll('dot').data(moviesData);

        criticDots.enter().append('circle')
            .attr("cx", d => criticXScale(d.title))
            .attr("cy", d => criticYScale(+d.critic_score))
            .attr("r", 5)
            .attr("data-winner", d => d.winner)
            .style("fill", function(d){
               return d.winner === "TRUE" ? "gold" : "white"})
            .on("mouseover", function(event) {
                const data = d3.select(this).datum();
                d3.select(this).attr("r", 7);
                audienceDots.filter(d => d.title === data.title).attr("r", 7);
                criticTooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                    criticTooltip.html(`${data.title}<br>Box office: ${data.box_office}
                    <br> Audience Score: ${data.people_score}<br>Critic Score: ${data.critic_score} <br>Won Oscar: ${data.winner}`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                const data = d3.select(this).datum();
                d3.select(this).attr("r", 5);
                audienceDots.filter(c => c.title === data.title).attr("r", 5);
                criticTooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
                });


        audienceDots.enter().append('circle')
            .attr("cx", d => criticXScale(d.title))
            .attr("cy", d => criticYScale(+d.people_score))
            .attr("r", 5)
            .style("fill", function(d)
                {return d.winner === "TRUE" ? "gold" : "white"})
            .attr("data-title", d => d.title)
            .on("mouseover", function(event) {
            const data = d3.select(this).datum();
                d3.select(this).attr("r", 7);
                criticDots.filter(d => d.title === data.title).attr("r", 7);
                audienceTooltip.transition()
                .duration(200)
                .style("opacity", .9);
                audienceTooltip.html(`${data.title}<br>Box office: ${data.box_office}
                <br> Audience Score: ${data.people_score}<br>Critic Score: ${data.critic_score} 
                <br>Won Oscar: ${data.winner}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                const data = d3.select(this).datum();
                d3.select(this).attr("r", 5);
                criticDots.filter(c => c.title === data.title).attr("r", 5);
                audienceTooltip.transition()
                .duration(500)
                .style("opacity", 0);
            });
    }

    function updateScatter(moviesData) {

        var yMax = d3.max(moviesData, function(d) {
            return Math.max(+d.critic_score, +d.people_score);
        });

        var criticXScale = d3.scaleBand()
        .domain(moviesData.map(d => d.title))
        .range([margin.left, width/2 - margin.right])
        .padding(0.1);

        var audienceXScale = d3.scaleBand()
        .domain(moviesData.map(d => d.title))
        .range([margin.left, width/2 - margin.right])
        .padding(0.1);

        var criticYScale = d3.scaleLinear()
        .domain([0, yMax])
        .range([height - margin.bottom, margin.top]);

        var audienceYScale = d3.scaleLinear()
        .domain([0, yMax])
        .range([height - margin.bottom, margin.top]);
        
        var audienceDots = audienceSvg.selectAll("circle")
          .data(moviesData);
      
        audienceDots.exit().remove();
      
        audienceDots.enter()
          .append("circle")
          .attr("cx", d => audienceXScale(d.title))
          .attr("cy", d => audienceYScale(+d.people_score))
          .attr("r", 5)
          .style("fill", function(d)
                {return d.winner === "TRUE" ? "gold" : "white"})
          .merge(audienceDots)
          .transition()
          .duration(1000)
          .attr("cx", d => audienceXScale(d.title))
          .attr("cy", d => audienceYScale(+d.people_score))
          .attr("r", 5)

        var criticDots = criticSvg.selectAll("circle")
          .data(moviesData);
      
        criticDots.exit().remove();
      
        criticDots.enter()
          .append("circle")
          .attr("cx", d => criticXScale(d.title))
          .attr("cy", d => criticYScale(+d.critic_score))
          .attr("r", 5)
          .style("fill", function(d)
                {return d.winner === "TRUE" ? "gold" : "white"})
          .merge(criticDots)
          .transition()
          .duration(1000)
          .attr("cx", d => criticXScale(d.title))
          .attr("cy", d => criticYScale(+d.critic_score))
          .attr("r", 5)
      }

    function updateBar(moviesData){
        var criticWins = 0;
        var peopleWins = 0;
        var criticFavs = [];
        var peopleFavs = [];
        for(var i = 0; i < moviesData.length; i++) {
            if(movie_data[i].critic_score > movie_data[i].people_score){
                criticFavs.push(movie_data[i]);
            }
            else {
                peopleFavs.push(movie_data[i]);
            }
        }

        for (var i = 0; i < criticFavs.length; i++){
            if(criticFavs[i].winner){
                criticWins += 1;
            }
        }
        for (var i = 0; i < peopleFavs.length; i++){
            if(peopleFavs[i].winner){
                peopleWins += 1;
            }
        }
        var favs = [{name:"Critics",score: criticWins}, {name:"Audiences",score:peopleWins}];

        var bars = BarSvg.selectAll("rect")
            .data(favs)

        bars.exit().remove();

        const x = d3.scaleBand()
            .domain(d3.range(favs.length))
            .range([margin.left, width - margin.right])
            .padding(0.1)

        const y = d3.scaleLinear()
        .domain([0, 20])
        .range([height-margin.bottom, margin.top]);

        bars.enter()
        .append("rect")
        .merge(bars)
        .transition()
        .duration(1000)
        .attr("x", (d,i) => x(i)) 
        .attr("y", (d) => y(d.score))
        .attr("height", d => y(0) - y(d.score))
        .attr("width", x.bandwidth())
        .attr("fill", "rgba(246, 194, 52, 0.631)")

    }

    function createDon(moviesData){
        // var diamter = 40;
        // const radius = Math.min(width,height)/2-diamter;
        var criticRev = 0;
        var peopleRev = 0;
        var criticFavs = [];
        var peopleFavs = [];
        for(var i = 0; i < moviesData.length; i++) {
            if(moviesData[i].critic_score > movie_data[i].people_score){
                var x = parseInt(movie_data[i].box_office.replace("$", "").replace("M", "")) * 1000000;
                if(!Number.isNaN(x)){
                    criticRev = criticRev + x;
                }
                criticFavs.push(movie_data[i]);
            }
            else {
                var y = parseInt(movie_data[i].box_office.replace("$", "").replace("M", "")) * 1000000;
                if(!Number.isNaN(y)){
                    peopleRev = peopleRev + y;
                }
                peopleFavs.push(movie_data[i]);
            }
        }
        var num_liked = [{name:"Critic",score:criticFavs.length} ,{name:"People",score:peopleFavs.length}];

        var x = d3.scaleLinear()
            .domain([0, 25])
            .range([ 0, width]);
        donSvg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .attr("color", "aliceblue")
            .selectAll("text")
            .attr("font-size","15px")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
            .attr("font-family", "Gill Sans")
            .attr("color", "aliceblue");


        var y = d3.scaleBand()
            .range([ 0, height ])
            .domain(num_liked.map(function(d) { return d.name;}))
            .padding(1);
          donSvg.append("g")
            .call(d3.axisLeft(y))
            .attr("font-family", "Gill Sans")
            .attr("font-size","15px")
            .attr("color", "aliceblue")


        donSvg.selectAll("myline")
        .data(num_liked)
        .enter()
        .append("line")
            .attr("x1", function(d) { return x(d.score); })
            .attr("x2", x(0))
            .attr("y1", function(d) { return y(d.name); })
            .attr("y2", function(d) { return y(d.name); })
            .attr("stroke", "grey");

        donSvg.selectAll("mycircle")
            .data(num_liked)
            .enter()
            .append("circle")
              .attr("cx", function(d) { return x(d.score); })
              .attr("cy", function(d) { return y(d.name); })
              .attr("r", "4")
              .style("fill", "#69b3a2")
              .attr("stroke", "black");
    }

    function updateDon(moviesData){
        var criticRev = 0;
        var peopleRev = 0;
        var criticFavs = [];
        var peopleFavs = [];
        for(var i = 0; i < moviesData.length; i++) {
            if(moviesData[i].critic_score > movie_data[i].people_score){
                var x = parseInt(movie_data[i].box_office.replace("$", "").replace("M", "")) * 1000000;
                if(!Number.isNaN(x)){
                    criticRev = criticRev + x;
                }
                criticFavs.push(movie_data[i]);
            }
            else {
                var y = parseInt(movie_data[i].box_office.replace("$", "").replace("M", "")) * 1000000;
                if(!Number.isNaN(y)){
                    peopleRev = peopleRev + y;
                }
                peopleFavs.push(movie_data[i]);
            }
        }
        var num_liked = [{name:"Critic",score:criticFavs.length} ,{name:"People",score:peopleFavs.length}];

        var x = d3.scaleLinear()
        .domain([0, 25])
        .range([ 0, width]);
        donSvg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .attr("color", "aliceblue")
            .selectAll("text")
            .attr("font-size","15px")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
            .attr("font-family", "Gill Sans")
            .attr("color", "aliceblue");


        var y = d3.scaleBand()
            .range([ 0, height ])
            .domain(num_liked.map(function(d) { return d.name;}))
            .padding(1);
        donSvg.append("g")
            .call(d3.axisLeft(y))
            .attr("font-family", "Gill Sans")
            .attr("font-size","15px")
            .attr("color", "aliceblue")

        var lines = donSvg.selectAll("myline")
            .data(num_liked)

        var circs = donSvg.selectAll("circle")
            .data(num_liked)

        lines.exit().remove();
        circs.exit().remove();


        lines
        .enter()
        .append("line")
            .attr("x1", function(d) { return x(d.score); })
            .attr("x2", x(0))
            .attr("y1", function(d) { return y(d.name); })
            .attr("y2", function(d) { return y(d.name); })
            .attr("stroke", "grey")
            .merge(lines)
            .transition()
            .duration(600)
            .attr("x1", function(d) { return x(d.score); })

    
        circs.enter()
            .append("circle")
            .attr("cx", function(d) { return x(d.score); })
            .attr("cy", function(d) { return y(d.name); })
            .attr("r", "4")
            .style("fill", "#a59148")
            .attr("stroke", "black")
            .merge(circs)
            .transition()
            .duration(600)
            .attr("x1", function(d) { return x(d.score); })
            .attr("cx", function(d) { return x(d.score); })
            .attr("cy", function(d) { return y(d.name); });

        // circs.exit().remove();
    }
        // const color = d3.scaleOrdinal()
        // .range(["#98abc5", "#8a89a6", "#7b6888"]);

        
        // var pie = d3.pie()

        // // var svg = d3.select("donSvg"),
        //     width = donSvg.attr("width"),
        //     height = donSvg.attr("height"),
        //     radius = Math.min(width, height) / 2,
        // g = donSvg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    
        // // Generate the pie
        // var pie = d3.pie();

        // // Generate the arcs
        // var arc = d3.arc()
        //         .innerRadius(0)
        //         .outerRadius(radius);

        // var arcs = g.selectAll("arc")
        //         .data(pie(num_liked))
        //         .enter()
        //         .append("g")
        //         .attr("class", "arc")

        // arcs.append("path")
        //         .attr("fill", function(d, i) {
        //             return color(i);
        //         })
        //         .attr("d", arc);

    

})
