function dendrogram() {
   
    var root, nodes, links, node_counts;
    var width = 600,
        height = 500,
        panSpeed = 200,
	   panBoundary = 20; // Within 20px from edges will pan when dragging.
        
    var link_weight = d3.scale.linear().domain ([0,0.2,0.3,0.4,1]).range ([1,2,3,4,5,6,7,8,9]).interpolate (d3.interpolateRound);
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
	var color = d3.scale.category20b();
    
var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 5]).on("zoom", zoom);
    
    d3.select("#dendogram").select("svg").remove();
    var chart = d3.select("#dendogram").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", "0 0 800 700")
        .attr("preserveAspectRation", "xMinYMid")
        .call(zoomListener)
        .append("g")
        .attr("transform", "translate(40,40)");
       

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
        
    
    d3.text("./data/test.txt", function(error, tree){
    
        
        if(error) throw error;
        
        root = Newick.parse(tree);
        
        childCount(0, root);
        var newHeight = d3.max(levelWidth) * 50; // 25 pixels per line
        cluster = cluster.size([newHeight, width-300]);
        
        nodes = cluster.nodes(root);
        links = cluster.links(nodes);
        
        var totalNodes = 0;
        var maxLabelLength = 0;
        
        visit(root, function(d){
            totalNodes++;
            maxLabelLength = Math.max(d.name.length, maxLabelLength);
        }, function(d) {
        return d.children && d.children.length > 0 ? d.children : null;
        })
        
     //  nodes.forEach(function(d) { d.y = d.depth * 30; });
        
         //if (options.skipBranchLengthScaling) {
      var yscale = d3.scale.linear()
        .domain([0, width])
        .range([0, width]);
    //} else {
  //var yscale = scaleBranch(nodes, width)
//    }

    
    //}
        // Normalize for fixed-depth.
    //nodes.forEach(function (d) {  d.y = d.depth * 100; });

        
       var link = chart.append("g")
          .attr("class", "links")
        .selectAll("path")
          .data(links)
        .enter().append("path")
          .each(function(d) { d.target.linkNode = this; })
          .attr("d",step)
        .style("fill", "none")
            .style("stroke", function(d) { //console.log(d.target.name);
                    //return color(d.target.name);
                   return color(d);                     
            })
            //.style("stroke-linecap", "round")
            //.style("opacity", ".7")
            .style("stroke-width", function(d){ 
                //return link_weight(d.source.children.length)
               //return (d.source.length * 10);
                return 1;
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
        //  .on("click", click);
        
    node.append("circle")
            .attr("r", function(d){
                if(d.children){
                   return 0 ;
                }else{
                    return 2.5;
                }
            })
            .style("stroke", "black")
            .style("stroke-width", "0.1px")
            .style("fill", "lightsteelblue");
        
        //var textNode = node.filter(function(d) {return (!d.children)})

      node.append("text")
          .attr("dx", function(d) { return d.children ? -8 : 8; })
          .attr("dy", 3)
          .attr("text-anchor", function (d) { return d.children ? "end" : "start"; })
          .style("font-size", "7px")
          .style("fill", "#000")
        .style("background-color", "#7773")
          .text(function (d) {
                if(!d.children) return d.name;      
          });
        
        var barScale = d3.scale.linear()
                .domain([0,1])
                .range([0,70]);
        
        //barScale.domain([0, d3.max(root, function(d){ console.log(d); return d.children.length;})])
    
        /*
        chart.selectAll(".leaf-node").append("rect")
                .attr("x", maxLabelLength * 5 )
                .attr("y", -5)
                .attr("width", function(d){
                        return barScale(d.length);
                    //return ( 200 * d.length);
                })
                .attr("height", 10)
                .style("fill", "#EACE3F");
            
            chart.selectAll(".leaf-node").append("rect")
                .attr("x", maxLabelLength + 120)
                .attr("y", -5)
                .attr("width", function(d){
                    return barScale(d.length);
                    //return ( 100 * d.length);
                })
                .attr("height", 10)
                .style("fill", "#b22200");
                */
    });

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
    }
    
    d3.select("#saveDendrogram").on("click", exportAsImage);
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
}
    
}