// See post: http://asmaloney.com/2015/06/code/clustering-markers-on-leaflet-maps


var tiles = L.tileLayer('http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, Points &copy 2012 LINZ',noWrap : true } );
var map = L.map( 'map', {
    layers:[tiles],
  center: [.1, .1],
  minZoom: 3,
  zoom:1,
    maxZoom: 15
  //worldCopyJump: true,
    //inertia: false
});



//var myURL = jQuery( 'script[src$="app.js"]' ).attr( 'src' ).replace( 'app.js', '' );
/*
var myIcon = L.icon({
  iconUrl: myURL + '../data/images/big4.jpeg',
   //shadowUrl: '../data/images/leaf-shadow.png',
  iconSize:     [25, 25], // size of the icon
    shadowSize:   [60, 25], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});
*/
//var markerClusters = L.markerClusterGroup();

/*for ( var i = 0; i < markers.length; ++i )
{
  var popup =  markers[i].city +
              '<br/><b>Altitude:</b> ' + Math.round( markers[i].alt * 0.3048 ) + ' m' +
              '<br/><b>Timezone:</b> ' + markers[i].tz;

  var m = L.marker( [markers[i].lat, markers[i].lng], {icon: myIcon} )
                  .on("click", markClick)
                  .bindPopup( popup );
  markerClusters.addLayer( m );
}
*/
//L.circle([50.5, 30.5], 100).addTo(map);

/*var svg = d3.select(map.getPanes().overlayPane).append('svg'),
    g = svg.append('g').attr("class", "leaflet-zoom-hide");

var countryPath = g.append("g");
*/
/*
 //  create a d3.geo.path to convert GeoJSON to SVG
  var transform = d3.geo.transform({point: projectPoint}),
            path = d3.geo.path().projection(transform);

//https://bost.ocks.org/mike/leaflet/
// Use Leaflet to implement a D3 geometric transformation.
  function projectPoint(x, y) {
   var point = map.latLngToLayerPoint(new L.LatLng(y, x));
   this.stream.point(point.x, point.y);
  }
*/

/*countryPath.append("g")
    .attr("class", "circle")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("transform", function(d){
        return  "translate(" + path.centroid(d) + ")"; 
    })
    .attr("r", 10);

*/

// map.addLayer(markerClusters);

/* Initialize the SVG layer */
	map['_initPathRoot']()   

	/* We simply pick up the SVG from the map object */
	var svg = d3.select("#map").select("svg"),
	g = svg.append("g");
	
	d3.json("data/circle_data.json", function(collection) {
		/* Add a LatLng object to each item in the dataset */
		collection.objects.forEach(function(d) {
			d.LatLng = new L.LatLng(d.circle.coordinates[0],
									d.circle.coordinates[1])
		})
		
		var feature = g.selectAll("circle")
			.data(collection.objects)
			.enter().append("circle")
			.style("stroke", "black")  
			.style("opacity", .6) 
			.style("fill", "red")
			.attr("r", 10);  
		
        feature.append("text")
	    //.attr("dx", function(d){return -20})
	    .text(function(d){return "CIRCLE"})
        
		map.on("viewreset", update);
		update();

		function update() {
			feature.attr("transform", 
			function(d) { 
				return "translate("+ 
					map.latLngToLayerPoint(d.LatLng).x +","+ 
					map.latLngToLayerPoint(d.LatLng).y +")";
				}
			)
		}
        })
    
/*
    var quakePoints = [
[-2.758, -77.497,3.34],
[-0.493336, -77.291431,5.543],
[-0.477, -77.162,3],
[-1.737, -77.485,1],
[-1.65, -77.60,1],
[-1.497, -78.002,1],
[-1.497, -78.002,1],
[-1.737, -77.485,1]
];
        
     var heat = L.heatLayer(quakePoints,{
            radius: 20,
            blur: 1, 
            maxZoom: 17,
        }).addTo(map);
*/
//tooltip
//new Opentip("#map", "Click the clusters on map to show sampling location", {tipJoint: "left",target: true, stem: true,  showOn: "creation" } );


var donutData = [{taxonName:"Coleoptera", total:40},{taxonName:"lepidoptera", total:20},{taxonName:"Diptera", total:30},{taxonName:"Hymnoptera", total:10}];

var donutChart = donutChart();
var donutContainer = d3.select('#donut')
        .datum(donutData)
        .call(donutChart);

function parseNewick(a){for(var e=[],r={},s=a.split(/\s*(;|\(|\)|,|:)\s*/),t=0;t<s.length;t++){var n=s[t];switch(n){case"(":var c={};r.children=[c],e.push(r),r=c;break;case",":var c={};e[e.length-1].children.push(c),r=c;break;case")":r=e.pop();break;case":":break;default:var h=s[t-1];")"==h||"("==h||","==h?r.name=n:":"==h&&(r.length=parseFloat(n))}}return r}

function markClick(){
    
    // draw dendrogram
    dendrogram();
    
    //make hidden div visibility true
    d3.selectAll(".hide-vis").style("visibility", "visible")
    //draw sunburst 
    //d3.select("#sunburst").select("svg").remove();
    var sunChart = sunburstD3();
        var chartArea = '#sunburst';
        
        //d3.json("data/insect.json", function(error, root) {
        d3.text("data/life.txt", function(error, tree) {
            
            var root =parseNewick(tree);
            var chartContainer = d3.select(chartArea)
                .datum(root)
                .call(sunChart);
           
            }); //end of d3.json
    
    
    
}

function dendrogram(){
    
    d3.text("/data/test.txt", function(error, tree){
    //d3.text("/data/life.txt", function(error, tree){
    
        var testdata = [12.37, 38.47, 75.64, 34.75, 123, 87.65, 73.64, 12.94,12.37, 38.47, 75.64, 34.75, 12.3, 87.65,73.64, 12.94, 10.1237, 38.47, 75.64, 34.75, 123, 87.65, 73.64, 12.94, 12.37, 38.47, 14.7564, 6.3475, 54.0123, 10.8765, 38.47, 75.64, 34.75, 123,38.47, 75.64, 34.75, 123];
        
        var options = {'weightLinks':true, 
                    linkName : false};
        
        var dendroChart = dendroGram()
                //.option(options)
                //.barData(testdata);
        
        
       var chartContainer = d3.select("#dendogram")
            .datum(tree)
            .call(dendroChart);
    })
}