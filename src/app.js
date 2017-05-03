// See post: http://asmaloney.com/2015/06/code/clustering-markers-on-leaflet-maps
// icons for markers
//https://www.iconfinder.com/icons/1110928/beetle_bug_fly_insect_insects_pest_icon#size=128
//http://www.flaticon.com/free-icons/insect_223


var tiles = L.tileLayer('http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png', {
				maxZoom: 18,
				attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, Points &copy 2012 LINZ',noWrap : true } );


var map = L.map( 'map', {
    layers:[tiles],
  center: [10.0, 5.0],
  minZoom: 2,
  zoom: 2
  //worldCopyJump: true,
    //inertia: false
});

var myURL = jQuery( 'script[src$="app.js"]' ).attr( 'src' ).replace( 'app.js', '' );

var myIcon = L.icon({
  iconUrl: myURL + '../data/images/bee1.png',
   //shadowUrl: '../data/images/leaf-shadow.png',
  iconSize:     [30, 30], // size of the icon
    shadowSize:   [60, 25], // size of the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var markerClusters = L.markerClusterGroup({
	 maxClusterRadius: 1,
});

for ( var i = 0; i < markers.length; ++i )
{
  var popup =  markers[i].city +
              '<br/><b>Altitude:</b> ' + Math.round( markers[i].alt * 0.3048 ) + ' m' +
              '<br/><b>Timezone:</b> ' + markers[i].tz;

  var m = L.marker( [markers[i].lat, markers[i].lng], {icon: myIcon} )
                  .on("click", markClick)
                  .bindPopup( popup );
  markerClusters.addLayer( m );
}
 map.addLayer(markerClusters);

//tooltip
new Opentip("#map", "Click the clusters on map to show sampling location", {tipJoint: "left",target: true, stem: true,  showOn: "creation" } );

/*
Opentip.styles.orangetip = { 
  stem: true,
  borderColor: "#ffa358",
  borderWidth: 50,
  background: "#ffa358",
  stemLength: 10
}

tip1 = new Opentip("#donut", "Optional content", { 
  style: "orangetip", 
  showOn: "mouseover"
})
*/

var donutData = [{taxonName:"Coleoptera", total:40},{taxonName:"lepidoptera", total:20},{taxonName:"Diptera", total:30},{taxonName:"Hymnoptera", total:10}];

var donutChart = donutChart();
var donutContainer = d3.select('#donut')
        .datum(donutData)
        .call(donutChart);

function markClick(){
    
    // draw dendrogram
    dendrogram();
    /*var donutData = [{taxonName:"Coleoptera", total:40},{taxonName:"lepidoptera", total:20},{taxonName:"Diptera", total:30},{taxonName:"Hymnoptera", total:10}]
    //draw donut 
    d3.select("#donut").select("svg").remove();
    var donutContainer = d3.select('#donut')
        .datum(donutData)
        .call(donutChart);
    */
    
    //make hidden div visibility true
    d3.selectAll(".hide-vis").style("visibility", "visible")
    //draw sunburst 
    d3.select("#sunburst").select("svg").remove();
    var sunChart = sunburstD3();
        var chartArea = '#sunburst';
        
        d3.json("data/insect.json", function(error, root) {
            
            var chartContainer = d3.select(chartArea)
                .datum(root)
                .call(sunChart);
           
            }); //end of d3.json
    
    
    
}
