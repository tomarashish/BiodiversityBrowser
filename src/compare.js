var currentDataNode = [];
var chartObj = [];
var pathObj = [];
//Array for chart div element
var refArea = [];
var current_breadcrumbs;

function groupAsTree(data) {
  console.log(data)
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
d3.csv("/data/coleoptera_taxonomy.csv", function (error, taxoData) {
  //console.log(JSON.stringify(groupAsTree(taxoData)));
  //console.log(groupAsTree(taxoData));

  var firstView = sunburstD3();

  var chartContainer = d3.select("#first")
    .datum(groupAsTree(taxoData))
    .call(firstView);

});
/*
d3.csv("data/hymenoptera_es.csv", function (error, taxoData) {
  //console.log(JSON.stringify(groupAsTree(taxoData)));
  //console.log(groupAsTree(taxoData));

  var secondView = sunburstD3();

  var chartContainer = d3.select("#second")
    .datum(groupAsTree(taxoData))
    .call(secondView);

});
*/
