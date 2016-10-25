donutChart = function module(){
    
    var svg, pie, arc, div, taxonLevel, data;
    
    var margin = { top:5, right:5, left:5, bottom:5},
        width = 400 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom,
        radius = Math.min( width  , height) / 3;
    
    var color = d3.scale.ordinal() .range(["#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#b15928","#e5c494","#fccde5","#bc80bd","#ccebc5","#ffed6f","#1f78b4"]);
   
   pie = d3.layout.pie()
           .sort(null)
           .value(function(d){
               return d.total;
           });
        //.padAngle(.02);
    
    arc = d3.svg.arc()
            .outerRadius(radius )
	        .innerRadius(radius * 0.4);
    
    var arcHover = d3.svg.arc()
            .outerRadius(radius + 5)
	        .innerRadius(radius * 0.4 + 5);
    
    var outerArc = d3.svg.arc()
	           .innerRadius(radius * 0.9)
	           .outerRadius(radius * 0.9);
    
   //create a function to export and loop the data
    function exports(_selection){
        _selection.each(function(_data){
            
            data = _data;
            
            d3.select(this).select('svg').remove();
            
            // Add the svg canvas
            svg = d3.select(this).append("svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr('viewBox','0 0 '+ (width + margin.left + margin.right) + " " + 
                         (height + margin.top +  margin.bottom))
                .attr('preserveAspectRatio','xMidYMid')
                .append("g")
                 .attr("transform", "translate(" + width/2 +  "," + height /2 + ")");
            svg.append("g")
                .attr("class", "slice");
            
            svg.append("g")
                .attr("class", "labels");
            
            svg.append("g")
                .attr("class", "lines");
            
            var key = function(d){ return d.data.taxonName; };
            
            // Pie slice
            var slice = svg.select(".slice").selectAll("path.slice")
                .data(pie(data), key);
            
            slice.enter()
                .insert("path")
                .style("fill", function(d){
                    return color(d.data.taxonName);
                })
                .attr("class", "slice")
            
            
            slice.transition().duration(1000)
                .attrTween("d", function(d) {
			         this._current = this._current || d;
			         var interpolate = d3.interpolate(this._current, d);
			         this._current = interpolate(0);
			             return function(t) {
				    return arc(interpolate(t));
			     };
		    });
            
	        slice.exit().remove();
            
            //text lables
            var text = svg.select(".labels").selectAll("text")
		.data(pie(data), key);

	text.enter()
		.append("text")
		.attr("dy", ".35em")
        .style("fill", function(d){
            return color(d.data.taxonName);
        })
		.text(function(d) {
			return (d.data.taxonName + ": " + d.data.total+"%");
		});
	
	function midAngle(d){
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}

	text.transition().duration(1000)
		.attrTween("transform", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
				return "translate("+ pos +")";
			};
		})
		.styleTween("text-anchor", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				return midAngle(d2) < Math.PI ? "start":"end";
			};
		});

	text.exit()
		.remove();
            
            /* ------- SLICE TO TEXT POLYLINES -------*/

	var polyline = svg.select(".lines").selectAll("polyline")
		.data(pie(data), key);
	
	polyline.enter()
		.append("polyline");

	polyline.transition().duration(1000)
		.attrTween("points", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
				return [arc.centroid(d2), outerArc.centroid(d2), pos];
			};			
		});
	
	polyline.exit()
		.remove();
            
        }); //end of selection
    }//end of exports
    
    function midAngle(d){
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}
    
    function mouseover(){
                    
    
                      
    }// end of mouseover
    
    function mouseout(){
        
        //tooltip 
        div.transition()
            .duration(500)
            .style("opacity", 0);
              
    }//end of mouseout
    
    
    
    //export function to modules
    exports.width = function(_){
        if(!argument.length) return width;
        width = _;
        return exports;
    }
    
    exports.height = function(_){
        if(!argument.length) return height;
        height = _;
        return exports;
    }
    
    return exports;
}//end of module