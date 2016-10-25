<cfif isDefined("URL.file_path")>
<!DOCTYPE html>
<html>
<head>
        <title>Geographical Phylogenetic Visualization</title>

    	<script type='text/javascript' src='./libs/utils/jquery.js'></script>
	<script src="./libs/utils/bootstrap.min.js"></script>
    	<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.3/d3.min.js"></script>
    <script src="./libs/viz/newick.js"></script>
	<script type="text/javascript" src="./libs/viz/dendogram.js"></script>
	<script type="text/javascript" src="./libs/viz/newickTree.js"></script>
    <script src="./libs/viz/sunburst_phylogeny.js"></script>
	<script type="text/javascript" src="./libs/viz/donutD3.js"></script>

       <!-- opentip tooltip js and css -->
       <script src="./libs/utils/opentip.js"></script>
       <link rel="stylesheet" type="text/css" href="./css/opentip.css">

	<!-- using leaflet js and css -->
       <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0-beta.2/leaflet.js"></script>
       <script type='text/javascript' src='./libs/utils/leaflet.markercluster-src.js'></script>
       <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0-beta.2/leaflet.css" />
       <link rel="stylesheet" type="text/css" href="./css/MarkerCluster.css" />
       <link rel="stylesheet" type="text/css" href="./css/MarkerCluster.Default.css" />

	<!-- Data for map markers-->
        <script type='text/javascript' src='./libs/utils/markers.js'></script>

	<!-- Latest compiled and minified bootstrap CSS -->
	<link rel="stylesheet" href="./css/bootstrap.min.css">
	<link rel="stylesheet" href="./css/geo_phylogram.css">

    <script type="text/javascript"> if (!window.console) console = {log: function() {}}; </script>
</head>
<body>

	<div class="container-fluid">
         
         <div class="row">
            <div id="worldMap" class="col-md-8"> 
                <div class="chart-wrapper">
                    <div class="chart-title">Geographical Phylogenetic Visualization
                    </div>
                    <div id="map" class="chart-area">
                    </div>
            </div>
            </div>
             <div class="col-md-4">
                 <div class="chart-wrapper">
                     <div class="chart-title">Donut chart </div>
                    <div id="donut" class="chart-area"></div>
                  </div>
             </div>
         </div>
         
         <div class="row hide-vis">
             <div class="col-md-12"> 
                <div class="chart-wrapper">
                    <div class="chart-title">Lineage</div>
                    <div id="sequence" class="chart-area"></div>
                </div>
            </div>
         </div>
         
         <div class="row hide-vis">
          
             <div class="col-md-5"> 
                 <div class="chart-wrapper">
                     <div class="chart-title dropdown">Sequence Sunburst
                         <button type="btn btn-raised" class="btn btn-default btn-raised dropdown-toggle" data-toggle="dropdown">          
                             <span class="fa fa-list"></span>
                         </button>
                         <ul class="dropdown-menu dropdown-menu-right">
                            <li><button id="saveSunburst" type="btn btn-raised" class="btn btn-default btn-raised btn-responsive">save <span class="icon-download icon-medium"></span></button> </li>
                         </ul>
                     </div>
                    <div id="sunburst" class="chart-area"></div>
                </div>
             </div>
            <div class="col-md-7">
                <div class="chart-wrapper">
                    <div class="chart-title dropdown"> Phylogenetic Tree
                        <button type="button" class="btn btn-default btn-raised btn-responsive dropdown-toggle" data-toggle="dropdown"> <span class="fa fa-list"></span></button>
                            <ul class="dropdown-menu dropdown-menu-right">
                                <li><button type="btn btn-raised" class="btn btn-default btn-raised btn-responsive" onclick="dendrogram()">Linear Dendrogram</button></li>
                                <li><button type="btn btn-raised" class="btn btn-default btn-raised btn-responsive" onclick="radialDendrogram()">Circular Dendogram</button></li>
                                <li><button id="saveDendrogram" type="btn btn-raised" class="btn btn-default btn-raised btn-responsive">save <span class="icon-download icon-medium rotate"></span></button></li>
                            </ul>
                    </div>
                    <div id="dendogram" class="chart-area"></div>
                </div>
             </div>
     </div>
         
         
    <script type='text/javascript' src='./libs/utils/init_geophylogram.js'></script>
    </div>

</body>
</html>
</cfif>