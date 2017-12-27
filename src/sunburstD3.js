/*jslint devel: true, debug: true, evil: false, sloppy: false, todo: true, indent: 4, maxlen: 75, maxerr: 50*/
sunburstD3 = function module() {

  if (window.d3 === undefined) {
    throw 'd3.js library is not found';
  }

  //Initializing variables
  var svg, div, path, node, trail, trail_width, pngSvg, root;

  var hue = d3.schemeCategory20;

  var luminance = d3.scaleSqrt()
    .domain([0, 1e6])
    .clamp(true)
    .range([90, 20]);

  // Layout variables using current size of chart
  // var $chart_container = $(this),
  // width = $chart_container.width(),
  //height = $chart_container.width(),
  var width = 500,
    height = 415,
    radius = Math.min(width, height) / 2.5;

  // setting d3 partition layout 
  var partition = d3.partition();

  // x axis linear scale, change to sqrt to change arc angle
  var x = d3.scaleLinear()
    .range([0, 2 * Math.PI]);

  // y axis sqrt scale, change to linear scale to 
  // make inner angele of arc smaller
  var y = d3.scaleLinear()
    .range([0, radius]);

  // Setting deafault d3 color category 
  //var color = d3.schemeCategory20;

  // Custom color category 
  var color = d3.scaleOrdinal().range(["#8dd3c7", "#1f78b4", "#e5c494", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#bc80bd", "#ccebc5", "#ffed6f", "#b15928"]);


  var arc = d3.arc()
    .startAngle(function (d) {
      return Math.max(0, Math.min(2 * Math.PI, x(d.x0)));
    })
    .endAngle(function (d) {
      return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));
    })
    .innerRadius(function (d) {
      return Math.max(0, y(d.y0));
    })
    .outerRadius(function (d) {
      return Math.max(0, y(d.y1));
    });

  //.cornerRadius(function (d) {
  //return 10
  //}); //http://bl.ocks.org/mbostock/b7671cb38efdfa5da3af

  // create function to export and loop the data
  function exports(_selection) {
    _selection.each(function (_data) {

      root = d3.hierarchy(_data, function (d) {
          return d.values;
        })
        .sum(function (d) {
          return 1;
        });

      // Filtering the data which have less angle tha .005 radian
      /* var nodes = partition.nodes(_data)
        .filter(function (d) {
          console.log(_data)
          if (d.children)
            return d;
        });
*/

      // initalizing breadcrumbtrail to represent the hierarchy 
      // of nodes from parent till current selection. 
      //  _initializeBreadcrumbTrail();

      //d3 tooltip
      div = d3.select('body') //select tooltip div over body
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      // Add the svg canvas
      svg = d3.select(this).append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr('viewBox', '0 0 ' + Math.min(width, height + 100) + ' ' + Math.min(width, height))
        .attr('preserveAspectRatio', 'xMinYMin')
        .append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2 + 10) + ")");

      // Now redefine the value function to use the previously-computed sum.

      //Creating a svg path with passed root node 
      this.path = svg.selectAll("path.arc")
        .data(partition(root).descendants())
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("class", "arc")
        .style("cursor", "pointer")
        //.attr("stroke-width", 1)
        //.attr("stroke", "#FFF")
        .style("fill", getColor)
        .on("click", _clickArc)
        .on("mouseover", _mouseover)
        .on("mouseout", _mouseout);

      // Creating an array of chart object
      chartObj.push(this);


      var texts = svg.selectAll("text")
        .data(partition(root).descendants())
        .enter().append("text")
        //.filter(filter_min_arc_size_text)
        .attr("transform", function (d) {
          return "rotate(" + computeTextRotation(d) + ")";
        })
        .attr("x", function (d) {
          return radius / 3 * d.depth;
        })
        .attr("dx", "6") // margin
        .attr("dy", ".35em") // vertical-align	
        .text(function (d, i) {
          return d.key
        })

      // creating click buttton on main chart
      if (this.id == "chart") {
        //selction of chart div and binding click to exportAsImage 
        d3.select("#saveChart").on("click", exportAsImage);
      }

    });
  } //End of export

  //Setting reset and image save button as d3 element
  $('#resetSunburst').on('click', _resetZoom);

  // Click function to zoom in or zoom out based on 
  // situation of current node
  function _clickArc(d) {
    svg.transition()
      .duration(750)
      .tween("scale", function () {
        var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
          yd = d3.interpolate(y.domain(), [d.y0, 1]),
          yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
        return function (t) {
          x.domain(xd(t));
          y.domain(yd(t)).range(yr(t));
        };
      })
      .selectAll("path")
      .attrTween("d", function (d) {
        return function () {
          return arc(d);
        };
      });
    //Getting array of name for breadcrumbs trail
    // var seqArray = getAncestor(d);
    //current_breadcrumbs = seqArray;
    // Update breadcrumbs for a click made on any sunburst 
    // Such that the pattern changed in reference sunburst represents 
    // the breadcrumbs
    // _updateBreadcrumbs(seqArray);
  }

  // To get path of node of each chart
  // Receives two argument 1 : data obejct and
  // 2 : id to be searched i.e. clicked node
  function getNodePath(dataObj, searchId) {

    // Check for id of clicked node and current chart object data
    if (searchId === dataObj.id) {

      return dataObj;
    } else {
      if (dataObj.children) {

        for (var i = 0; i < dataObj.children.length; i++) {
          var path = getNodePath(dataObj.children[i], searchId);

          if (path) {
            return path;
          }

        }
      }
    }
  }

  //Reset all charts from zoom level to root node 
  function _resetZoom() {

    //Selection all path and passing root node to reset all charts

    d3.select("#trail")
      .style("visibility", "hidden");
    console.log(root)
    d3.selectAll("path.arc")
      .transition()
      .duration(1000)
      .attrTween("d", arcTween(root));
  }

  function _mouseover(d) {

    div.transition()
      .duration(500)
      .style("opacity", 0);
    div.transition()
      .duration(200)
      .style("opacity", .8);

    //Adding name , id and ncbi link to taxon id
    div.html("Name : " + d.data.key)
      .style("left", (d3.event.pageX + 8) + "px") //Position of pointer from tooltip from left
      .style("top", (d3.event.pageY - 20) + "px"); //Position of pointer from tooltip from top

    //fade all the segment of arc on mouseover
    // Activate the once which are acncestor of current node
    /*chartObj.forEach(function (obj) {

      obj.path
        .style("opacity", .2);

    });*/

    //Get ancestor of current node 
    var seqArray = getAncestor(d);

    //updating breadcrumbs
    // _updateBreadcrumbs(seqArray);

    chartObj.forEach(function (obj) {


      var newPath = getNodePath(obj.__data__, d.id);
      seqArray = getAncestor(newPath);

      if (newPath.mean != 0) {
        obj.path
          .filter(function (newPath) {
            return (seqArray.indexOf(newPath) >= 0);
          })
          .style("opacity", 1);
      }
    });
  } //end of mouseover

  //mouseout 
  function _mouseout(d) {

    div.transition()
      .duration(10)
      .style("opacity", 0); //The tooltip disappears

    // Transition each segment to full opacity and then reactivate it.
    d3.selectAll("path")
      .style("opacity", 1);

    // Hide the breadcrumb trail
    /* if (!current_breadcrumbs) {
      d3.select("#trail")
        .style("visibility", "hidden");
    } else {
      _updateBreadcrumbs(current_breadcrumbs);
    }
*/
  } //end of mouseout

  //Get ancestor of a child
  //Return a array of elements containing the names from root till current level
  function getAncestor(node) {
    var path = [];
    var current = node;

    // Itterating over the node and creating an array of names 
    // starting with root / first parent  
    while (current.parent) {
      path.unshift(current)
      current = current.parent;
    }
    return path;
  }

  //funcntion to initializ breadcrumbs
  function _initializeBreadcrumbTrail() {

    //Setting height and width for breadcrumbtrail on #sequence
    var $trail_container = $("#sequence");

    trail_width = $trail_container.width(),
      trail_height = $trail_container.height();

    $("#sequence").empty();
    trail = d3.select("#sequence").append('svg')
      .attr("width", 1400) //hardcoded 1400 px. To be fixed later (current window size and dynamically adding each breadcrumbs width)
      .attr("height", 50)
      .attr('viewBox', '0 0 ' + Math.min(trail_height, trail_width) + ' ' + Math.min(trail_height, trail_width))
      .style("overflow-x", "scroll")
      .attr('preserveAspectRatio', 'xMinYMin')
      .attr("id", "trail");
  } //end of  _initializeBreadcrumbTrail

  // Generate a string that describes the points of a breadcrumb polygon.
  function breadcrumbPoints(d, i) {
    var points = [];

    //Normalization of width acc. to length of text 
    //with increase in font size increase the multiplier number
    var length_norm_factor = 9;

    b.w = length_norm_factor * d.key.length;

    points.push("0,0");
    points.push(b.w + ",0");
    points.push(b.w + b.t + "," + (b.h)); //remove this to make breadcrumbs square
    points.push(b.w + "," + (b.h));
    points.push("0," + (b.h));

    // Commenting following line for vertical breadcrumbs format
    if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
      points.push(b.t + "," + (b.h));
    }

    return points.join(" ");
  } //end of breadcruumbPOints

  //Click function for breadcrumbs
  function clickBreadcrumb(d) {

    /* If node is having depth more than 1 we need to redraw the sunburst. 
       Get the ancestor of current node and update the breadcrumbs   
    */
    if (d.depth > 1) {
      // On click of a breadcrumb element redraw the sunburst 
      // with current node in center

      _clickArc(d);
      /* Redraw breadcrumbs till the current node
         In case to see the ancestory till parent node pass
         the d.parent instead of d 
      */

      var new_child = getAncestor(d);
      current_node = d;
      // Update the breadcrumbs from root till the clicked node
      _updateBreadcrumbs(new_child);
    }

    /*  If node is having depth 1 or less than one, reset the path to 
        root node as we cannot see any effect on click of last node.
        In this case we need not update the breadcrumbs
    */
    if (d.depth <= 1) {
      //Get the parent/ root node and reset the path
      _clickArc(d.parent);
      $("#trail").empty();
    }

  } //end of clickbreadcrumbs

  function _updateBreadcrumbs(nodeArray) {
    var translate = 0;

    // Data join; key function combines name and depth (= position in sequence).
    var g = d3.select("#trail")
      .selectAll("g")
      .data(nodeArray, function (d) {
        return d.key + d.depth;
      });

    /* Add breadcrumb and label for entering nodes.
       Adding a click event on breadcrumbs polygon to redraw the sunburst 
       with current or click node in center.
     */
    var entering = g.enter().append("g");
    entering.append("polygon")
      .attr("points", breadcrumbPoints)
      .style("cursor", "pointer")
      .style("fill", getColor)
      .on("click", function (d) {
        clickBreadcrumb(d)
      });

    //Passing normalized value to attr x for setting text to polygon
    entering.append("svg:text")
      .attr("x", function (d) {
        return ((d.key.length * 9 + b.t) / 2);
      })
      .attr("y", (b.h) / 2)
      .attr("dy", "0.35em")
      .style("font-size", 15 + "px")
      .attr("text-anchor", "middle")
      .text(function (d) {
        return d.key;
      });

    //polygonWidth = translate;
    //if(polygonWidth > trail_width){ trail_width = polygonWidth};

    // Set position for entering and updating nodes.
    g.attr("transform", function (d) {
      var str = "translate(" + translate + ", 0)"
      translate += d.key.length * 9 + b.t;
      return str;
    });


    g.exit().remove();

    // Make the breadcrumb trail visible, if it's hidden.
    d3.select("#trail")
      .style("visibility", "");

  }

  // Interpolate the scales!
  function arcTween(d) {

    var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
      yd = d3.interpolate(y.domain(), [d.y, 1]),
      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
    return function (d, i) {
      return i ?
        function (t) {
          return arc(d);
        } :
        function (t) {
          x.domain(xd(t));
          y.domain(yd(t)).range(yr(t));
          return arc(d);
        };
    };
  }

  // Function to get same color for child based on color of parent. 
  // Using d3.hsl as color palette
  function getColor(d) {

    if (d.depth == 0) {
      return "white";
    }
    var fadeColor = 1;

    while (d.depth > 2) {
      d = d.parent;
    }
    var c = d3.lab(color(d.data.key))
    //.brighter();
    return c;
  }


  function colour(d) {
    if (d.children) {
      // There is a maximum of two children!
      var colours = d.children.map(colour),
        a = d3.hsl(colours[0]),
        b = d3.hsl(colours[1]);
      // L*a*b* might be better here...
      return d3.hsl((a.h + b.h) / 2, a.s * 1, a.l / 1);
    }
    return d.colour || "#fff";
  }

  //Saving the svg element as png on save button 
  function exportAsImage() {

    // variable for image name
    var chartName, svg;

    // Getting svg name from this.id, replacing this.id by save
    // save prefix is for button and replacing it with sample to
    // get the svg chart div name 
    if (this.id != "saveChart") {
      var id = this.id.replace("save", "sample");
      chartName = id;
      var chartId = "#" + id + ' ' + 'svg';
      svg = document.querySelector(chartId);
    }
    // Getting the svg chart name for the main chart 
    if (this.id == "saveChart") {
      chartName = "chart"
      svg = document.querySelector('#chart svg');
    }

    //
    var svgData = new XMLSerializer().serializeToString(svg);

    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    canvas.height = height;
    canvas.width = width;
    var dataUri = '';
    dataUri = 'data:image/svg+xml;base64,' + btoa(svgData);

    var img = document.createElement("img");

    img.onload = function () {
      ctx.drawImage(img, 0, 0);

      // Initiate a download of the image
      var a = document.createElement("a");

      a.download = chartName + ".png";
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

  //export function to modules
  exports.width = function (_) {
    if (!argument.length) return width;
    width = _;
    return exports;
  }

  exports.height = function (_) {
    if (!argument.length) return height;
    height = _;
    return exports;
  }

  exports.name = function (_) {
    if (!argument.length) return name;
    name = _;
    return exports;
  }

  exports.mean = function (_) {
    if (!argument.length) return mean;
    mean = _;
    return exports;
  }

  exports.options = function (_data) {
    if (!arguments.length) return options;
    options = _data;
    return options;
  }
  //d3.rebind(exports, dispatch, "on");
  return exports;

}
