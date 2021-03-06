function radialDendrogram() {
    var outerRadius = 900/2,
    innerRadius = outerRadius - 170,
        width = outerRadius*2,
        height = outerRadius*2,
    panSpeed = 200,
	   panBoundary = 20; // Within 20px from edges will pan when dragging.
        
var color = d3.scale.category20()
    .domain(["Bacteria"]);

var cluster = d3.layout.cluster()
    .size([360, innerRadius])
    .children(function(d){ return d.branchset; })
    .value(function(d){ return 1; })
    .sort(function(a,b){ return (a.value - b.value) ||  d3.ascending(a.length, b.length); })
    .separation(function(a,b){ return 1});

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
    
d3.select("#dendogram").select("svg").remove();
    
var svg = d3.select("#dendogram").append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 900 900")
    .attr("preserveAspectRatio", "xMidYMid")
    .call(zoomListener);

/*var legend = svg.append("g")
    .attr("class", "legend")
    .selectAll("g")
    .data(color.domain())
    .enter().append("g")
    .attr("transform", function(d, i) { 
        return "translate(" + (outerRadius * 2 - 10) + "," + (i * 20 + 10) + ")"; 
    });

legend.append("rect")
    .attr("x", -18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

legend.append("text")
    .attr("x", -20)
    .attr("y", 10)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .style("fill", "black")
    .text(function(d){ return d; });
*/
var chart = svg.append("g")
    .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

d3.text("./data/test.txt", function(error, tree){
    
    if(error) throw error;
    
    var root = Newick.parse(tree),
        nodes = cluster.nodes(root),
        links = cluster.links(nodes),
        input = d3.select("#show-length input").on("change", changed),
        timeout = setTimeout(function(){
            changed; }, 2000);
    
    setRadius(root, root.length =0, innerRadius/maxLength(root));
    setColor(root);
    
    var linkExtension = chart.append("g")
      .attr("class", "link-extensions")
    .selectAll("path")
      .data(links.filter(function(d) { return !d.target.children; }))
    .enter().append("path")
      .each(function(d) { d.target.linkExtensionNode = this; })
      .attr("d", function(d) {return step(d.target.x, d.target.y, d.target.x, innerRadius); })
     .style("fill", "none")
        .style("stroke", "lightgrey")
        .style("stroke-width", "2px");

  var link = chart.append("g")
      .attr("class", "links")
    .selectAll("path")
      .data(links)
    .enter().append("path")
      .each(function(d) { d.target.linkNode = this; })
      .attr("d", function(d) { return step(d.source.x, d.source.y, d.target.x, d.target.y) })
  .style("fill", "none")
  .style("stroke", function(d) { //console.log(d.target.name);
                    return color(d.target.name)})
         .style("opacity", ".7")
            .style("stroke-width", "5px");

  chart.append("g")
      .attr("class", "labels")
    .selectAll("text")
      .data(nodes.filter(function(d) { return !d.children; }))
    .enter().append("text")
      .attr("dy", ".31em")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (innerRadius + 4) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
      .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .style("fill", "black")
      .text(function(d) { return d.name.replace(/_/g, " "); })
      .on("mouseover", mouseovered(true))
      .on("mouseout", mouseovered(false));
    
  function changed() {
    
    d3.transition().duration(750).each(function() {
      linkExtension.transition().attr("d", function(d) { return step(d.target.x, checked ? d.target.radius : d.target.y, d.target.x, innerRadius); });
      link.transition().attr("d", function(d) { return step(d.source.x, checked ? d.source.radius : d.source.y, d.target.x, checked ? d.target.radius : d.target.y) });
    });
  }

  function mouseovered(active) {
    return function(d) {
      d3.select(this).classed("label--active", active);
      d3.select(d.linkExtensionNode).classed("link-extension--active", active).each(moveToFront);
      do d3.select(d.linkNode).classed("link--active", active).each(moveToFront); while (d = d.parent);
    };
  }

  function moveToFront() {
    this.parentNode.appendChild(this);
  }
        }); //end of d3.text

// Compute the maximum cumulative length of any node in the tree.
function maxLength(d) {
  return d.length + (d.children ? d3.max(d.children, maxLength) : 0);
}

// Set the radius of each node by recursively summing and scaling the distance from the root.
function setRadius(d, y0, k) {
  d.radius = (y0 += d.length) * k;
  if (d.children) d.children.forEach(function(d) { setRadius(d, y0, k); });
}

// Set the color of each node by recursively inheriting.
function setColor(d) {
  d.color = color.domain().indexOf(d.name) >= 0 ? color(d.name) : d.parent ? d.parent.color : null;
  if (d.children) d.children.forEach(setColor);
}

// Like d3.svg.diagonal.radial, but with square corners.
function step(startAngle, startRadius, endAngle, endRadius) {
  var c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI),
      s0 = Math.sin(startAngle),
      c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI),
      s1 = Math.sin(endAngle);
  return "M" + startRadius * c0 + "," + startRadius * s0
      + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
      + "L" + endRadius * c1 + "," + endRadius * s1;
}

d3.select(self.frameElement).style("height", outerRadius * 2 + "px");
d3.select("#saveDendrogram").on("click", exportAsImage);

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
 
    canvas.height = outerRadius*2;
    canvas.width = outerRadius*2;
    
    var dataUri = '';
    dataUri = 'data:image/svg+xml;base64,' + btoa(svgData);
 
    var img = document.createElement( "img" );
 
    img.onload = function() {
        ctx.drawImage( img, 0, 0 );
 
            // Initiate a download of the image
            var a = document.createElement("a");
    
            a.download = "circularDendogram" + ".png";
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