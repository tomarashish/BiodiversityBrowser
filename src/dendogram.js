dendroGram = function module() {
   
    var root, nodes, links, node_counts, chart;
    var width = 600,
        height = 500,
        panSpeed = 200,
	   panBoundary = 20; // Within 20px from edges will pan when dragging.
      
    var option = {  
                    weightLinks : false, 
                    linkValue : false, 
                    linkName : true, 
                    nodeSize : true
                 };
    
    var barData, xbarChart = 0 ;
    //var textNode = node.filter(function(d) {return (!d.children)})
            // Getting svg text with max width
            var textBox = 0;
    var color = d3.scale.category20b();
    
    var link_weight = d3.scale.linear()
                .domain ([0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1])
                .range ([1,2,3,4,4.5,5,5.5,6,6.5,7,7.5])
                .interpolate (d3.interpolateRound);
    
    var diagonal = rightAngleDiagonal();
    
    var cluster = d3.layout.cluster()
            .size([height, width -300])
            .children( function(d) { return d.branchset; })
            .value( function(d) { return d.length; })
            .separation( function(a,b) {  
                 return (a.parent == b.parent ? 1 : 1) ;
            });

    
    function visit(parent, visitFn, childrenFn){
        if(!parent) return;
        
        visitFn(parent);
        var children = childrenFn(parent);
        
        if(children){
            var count = children.length;
            for(var i =0; i< count; i++){
                visit(children[i], visitFn, childrenFn);
            }
        }
    } // end of visit
    
    
    function pan(domNode, direction) {
			var speed = panSpeed;
			if (panTimer) {
				clearTimeout(panTimer);
				translateCoords = d3.transform(chart.attr("transform"));
				if (direction == 'left' || direction == 'right') {
					translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
					translateY = translateCoords.translate[1];
				} else if (direction == 'up' || direction == 'down') {
					translateX = translateCoords.translate[0];
					translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
				}
				scaleX = translateCoords.scale[0];
				scaleY = translateCoords.scale[1];
				scale = zoomListener.scale();
				chart.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
				d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
				zoomListener.scale(zoomListener.scale());
				zoomListener.translate([translateX, translateY]);
				panTimer = setTimeout(function() {
					pan(domNode, speed, direction);
				}, 50);
			}
		}
    
    function zoom() {
        chart.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
	
    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 5]).on("zoom", zoom);
    
    // Compute the new height, function counts total children of root node and sets tree height accordingly.
    // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
    // This makes the layout more consistent.
    var levelWidth = [1];

    var childCount = function(level, n) {
           
            if (n.branchset && n.branchset.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);

                levelWidth[level + 1] += n.branchset.length;
                n.branchset.forEach(function(d) {
                    childCount(level + 1, d);
                });
            }
        };
    
    function exports(_selection){
        _selection.each(function(_data){
            
            // remove if any previous drawn svg
            d3.select(this).select("svg").remove();
            
            chart = d3.select(this).append("svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("viewBox", "0 0 800 700")
                .attr("preserveAspectRation", "xMinYMid")
                .call(zoomListener)
                .append("g")
                .attr("transform", "translate(40,40)");
            
            root = Newick.parse(_data);

            childCount(0, root);
            var newHeight = d3.max(levelWidth) * 50; // 25 pixels per line
            cluster = cluster.size([newHeight, width-300]);

            nodes = cluster.nodes(root);
            links = cluster.links(nodes);
         
        
            var totalNodes = 0;
            var maxLabelLength = 0;
            var maxLableText = '';

            visit(root, function(d){
                totalNodes++;
                maxLabelLength = Math.max(d.name.length, maxLabelLength);

                if(d.name.length > maxLableText.length){
                    maxLableText = d.name;
                }

            }, function(d) {
            return d.children && d.children.length > 0 ? d.children : null;
            })
        
            var link = chart.append("g")
                .attr("class", "links")
                .selectAll("path")
                .data(links)
                .enter().append("path")
                .each(function(d) { d.target.linkNode = this; })
                .attr("d",step)
                .style("fill", "none")
                .style("stroke", function(d) { 
                        return color(d.target.name);                    
                })
                .style("stroke-linecap", "round")
                .style("opacity", ".7")
                .style("stroke-width", function(d){ 
                    if(option.weightLinks == false){

                        return link_weight(d.target.length)
                    }
                    else{
                        return 1;
                    }

                });
              //.style("stroke", function(d) { return d.target.color; });

        
            var node = chart.selectAll(".node")
                .data(nodes)
                .enter().append("g")
                .attr("class", function(d){
                  if(d.children){
                      if(d.depth == 0){
                          return "root-node";
                      }else{
                          return "inner-node";
                      }
                  }else{
                      return "leaf-node";
                  }
                })
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
                //.on("click", click);
                
            chart.selectAll('.leaf-node').append("circle")
                .attr("r", function(d){
                   // console.log(d)
                    if(option.nodeSize == true) return d.value*30;
                    else
                        return 2.5;
                })
                .style("stroke", function(d){
                        return color(d.name);
                    })
                .style("stroke-width", "1px")
                .style("fill-opacity", "0.8")
                .style("fill", function(d){
                    return color(d.name);
                });

            node.append("text")
                .attr("dx", function(d) { return d.children ? -5 : 4; })
                .attr("dy", function(d){
                    if(!d.children) return 5;
                    else{
                        if(option.linkValue == true)
                            return 8;
                    }
                })
                .attr("text-anchor", function (d) { return d.children ? "end" : "start"; })
                .style("font-size", "7px")
                .style("fill", "#000")
                .text(function (d) {
                    if(!d.children) return d.name;
                    else{
                        if(option.linkValue == true)
                            return d.length;
                        if(option.linkName == true)
                            return d.name;
                    }
                })
                .each(function(d) {
                    //iterating over svg text and getting max width text box
                    var bbox = this.getBBox();
                    textBox = Math.max(bbox.width, textBox);
                });

           
            //Background color for text labels
            //using rectangle to show background color for text labels
            chart.selectAll('.leaf-node').append("rect")
                .attr("x", 3)
                .attr("y", -5)
                .attr("width", textBox + 5)
                .attr("height", 13.5)
                .style("fill", function(d){
                    return color(d.name);
                })
                .style("opacity", "0.3");

          // d3.selectAll('.leaf-node').data(nodes).exit().remove();
        
            //if(barData.length > 0){
              //  addBarChart(barData);
            //}
            

           // var maxTextWidth = d3.max(labels, function() {
             //   return labels.node().getComputedTextLength();
               // });
            
            
        }) //end of _selection
    }//end of exports
            
    /* 
     if (options.skipBranchLengthScaling) {
        var yscale = d3.scale.linear()
            .domain([0, width])
            .range([0, width]);
    } else {
        var yscale = scaleBranch(nodes, width)
        }
    
        }
    */
    
    function addBarChart(data){
        
        var barScale = d3.scale.linear()
                    .range([0,70]);

        barScale.domain([0, d3.max(data, function(d){ return d;})])
        
            if(xbarChart == 0){
                xbarChart = textBox + 10;
            }else{
                //console.log(barScale.range()[1])
                xbarChart = textBox + 90;
            }
          d3.selectAll(".leaf-node").append("rect")
                .attr("x", xbarChart)
                .attr("y", -5)
                .attr("width", function(d,i){           
                        return barScale(data[i]);
                    //return ( 200 * d.length);
                })
                .attr("height", 10)
                .style("fill", "#EACE3F"); 
 
    } //end of addBarChart
    
    function step(d, i) {
        return "M" + d.source.y + "," + d.source.x
          + "V" + d.target.x + "H" + d.target.y;
    }
    
    function rightAngleDiagonal() {
    
        var projection = function(d){
            return [d.y + height/2, d.x + width/2];
        }
        
        var path = function(pathData){
            return "M" + pathData[0] +''+ + pathData[1] + " "+ pathData[2];
        }
        
        function diagonal(diagonalPath, i){
            
            var source = diagonalPath.source,
                target = diagonalPath.target,
                midpointX = (source.x + target.x) / 2,
                midpointY = (source.y + target.y) / 2,
                pathData = [source, {x: target.x, y: source.y}, target];
        
            pathData = pathData.map(projection);
            return path(pathData)
        }
    
        diagonal.projection = function(x) {
            if (!arguments.length) return projection;
                projection = x;
            return diagonal;
        };
    
        diagonal.path = function(x) {
            if (!arguments.length) return path;
            path = x;
            return diagonal;
        };
    
        return diagonal;
    }//end of rightAngleDiagonal
    
    d3.select("#saveDendogram").on("click", exportAsImage);
    d3.select(self.frameElement).style("height", height + "px");
    // Toggle children on click.
    function click(d) {
        
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        
        if (d.parent) {
        d.parent.children.forEach(function(element) {
            console.log(element);
            if (d !== element) {
                collapse(element);
            }
        });
        }
        
    }
    
    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }
    
    /*
    //addimage to node at and of text label
    nodeEnter.append("image")
          .attr("xlink:href", function(d) { return d.icon; })
          .attr("x", "-12px")
          .attr("y", "-12px")
          .attr("width", "24px")
          .attr("height", "24px");

    */    
         //<svg width="793px" height="1122px" style="overflow-x: auto; overflow-y: auto; "viewBox="0 0 793 1122">
    //Saving the svg element as png on save button 
    function exportAsImage(){

        // variable for image name
        var chartName, svg ;

        // Getting svg name from this.id, replacing this.id by save
        // save prefix is for button and replacing it with sample to
        // get the svg chart div name 

            svg = document.querySelector( '#dendogram svg' );

        //
        var svgData = new XMLSerializer().serializeToString( svg );

        var canvas = document.createElement( "canvas" );
        var ctx = canvas.getContext( "2d" );

        canvas.height = height;
        canvas.width = width;

        var dataUri = '';
        dataUri = 'data:image/svg+xml;base64,' + btoa(svgData);

        var img = document.createElement( "img" );

        img.onload = function() {
            ctx.drawImage( img, 0, 0 );

                // Initiate a download of the image
                var a = document.createElement("a");

                a.download = "Dendogram" + ".png";
                a.href = canvas.toDataURL("image/png");
                document.querySelector("body").appendChild(a);
                a.click();
                document.querySelector("body").removeChild(a);

                // Image preview in case of "save image modal"

                /*var imgPreview = document.createElement("div");
                  imgPreview.appendChild(img);
                  document.querySelector("body").appendChild(imgPreview);
                */
            };

            img.src = dataUri;
        }//end of exportAsImage
    
    exports.height = function(_x){
        if(!argument.length) return height;
        height = _x;
        return this;
    }
    
    exports.width = function(_x){
        if(!argument.length) return width;
        width = _x;
        return this;
    }
    
    exports.option = function(_x){
        if(!arguments.length) return option;
        option = _x;
        return this;
    }
    
    exports.barData = function(_x) {
        if (!arguments.length) return barData;
        barData = _x;
        return this;
    };
    
    return exports;
}//end of module