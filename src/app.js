// See post: http://asmaloney.com/2015/06/code/clustering-markers-on-leaflet-maps
// icons for markers
//https://www.iconfinder.com/icons/1110928/beetle_bug_fly_insect_insects_pest_icon#size=128
//http://www.flaticon.com/free-icons/insect_223


var tiles = L.tileLayer('http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, Points &copy 2012 LINZ',
  noWrap: true
});


var map = L.map('map', {
  layers: [tiles],
  center: [10.0, 5.0],
  minZoom: 2,
  zoom: 2
  //worldCopyJump: true,
  //inertia: false
});

var myURL = jQuery('script[src$="app.js"]').attr('src').replace('app.js', '');

var myIcon = L.icon({
  iconUrl: myURL + '../data/images/bee1.png',
  //shadowUrl: '../data/images/leaf-shadow.png',
  iconSize: [30, 30], // size of the icon
  shadowSize: [60, 25], // size of the shadow
  popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var markerClusters = L.markerClusterGroup({
  maxClusterRadius: 1,
});

for (var i = 0; i < markers.length; ++i) {
  var popup = markers[i].city +
    '<br/><b>Altitude:</b> ' + Math.round(markers[i].alt * 0.3048) + ' m' +
    '<br/><b>Timezone:</b> ' + markers[i].tz;

  var m = L.marker([markers[i].lat, markers[i].lng], {
      icon: myIcon
    })
    // .on("click", markClick)
    .bindPopup(popup);
  markerClusters.addLayer(m);
}
map.addLayer(markerClusters);

//tooltip
new Opentip("#map", "Click the clusters on map to show sampling location", {
  tipJoint: "left",
  target: true,
  stem: true,
  showOn: "creation"
});

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

var donutData = [{
  taxonName: "Coleoptera",
  total: 40
}, {
  taxonName: "lepidoptera",
  total: 20
}, {
  taxonName: "Diptera",
  total: 30
}, {
  taxonName: "Hymnoptera",
  total: 10
}];

var donutChart = donutChart();
var donutContainer = d3.select('#donut')
  .datum(donutData)
  .call(donutChart);
*/

//function markClick() {

// draw dendrogram
//dendrogram();
//radialDendrogram();

function groupAsTree(data) {

  var treeData = {
    "key": "Root",
    "values": d3.nest()
      /*.key(function (d) {
        return d.kingdom;
      })
      .key(function (d) {
        return d.phylum;
      })
      .key(function (d) {
        return d.class;
      })*/
      .key(function (d) {
        return d.order;
      })
      .key(function (d) {
        return d.family;
      })
      .key(function (d) {
        return d.genus;
      })
      .key(function (d) {
        return d.species;
      })
      .entries(data)
  };
  return treeData;
}

//d3.json("data/taxonomy_tree.json", function (error, taxoData) {
d3.csv("data/coleoptera_taxonomy.csv", function (error, taxoData) {
  //console.log(JSON.stringify(groupAsTree(taxoData)));
  console.log(groupAsTree(taxoData));

  var sunview = sunburstD3();
  //var sunview = circlePack();

  var chartContainer = d3.select("#sunburst")
    .datum(groupAsTree(taxoData))
    .call(sunview);

});
