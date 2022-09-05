//-- ======================================================================================== -->
//-- Homework                                                                                 -->
//-- Module 17 - Leaflet and geojson                                                          -->
//-- Date: 29 Aug 2022                                                                        -->
//-- Note: need to run 'python -m http.server' from terminal, then 'localhost:8000'; or use   -->
//-- Live Server to run                                                                       -->
//-- ======================================================================================== -->
// Setup data urls for earthquakes and plates
earthquakesUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
platesUrl = "static/data/PB2002_plates.json"

// =========================================================================
// Functions to define color, and markers
// =========================================================================
function getColor(mag) {
    console.log(mag);
    switch (true) {
      case mag > 5: return "purple";
      case mag > 4: return "Orange";
      case mag > 3: return "red";
      case mag > 2: return "yellow"
      case mag > 1: return "lightblue";
      default: return "green";
    }
  }

  function getMarkerSize(mag) {
    return mag * 3;
  };

// =========================================================================
//  Create map features based on two params
// =========================================================================
function createFeatures(earthquakeData, platesData) {
    //Create circle markers for each earthquake in the data set.
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            // Make circle radius dependent on the magnitude and get color based on the same feature
            return new L.CircleMarker(latlng, {
                radius: getMarkerSize(feature.properties.mag),
                fillOpacity: 1,
                color: getColor(feature.properties.mag)
            })
        },
        onEachFeature(feature, layer) {
            layer.bindPopup("<p>" + feature.properties.place + "</p>" +
                "<p>Type: " + feature.properties.type + "</p>" +
                "<p>Magnitude: " + feature.properties.mag + "</p>" +
                "<p>Time data received: " + Date(feature.properties.time) + "</p>");
        }
    });

    // Shade plates boundaries
    var plates = L.geoJSON(platesData, {
        style: function() {
            return {
                color: "orange",
                weight: 3
            }
        },                
        onEachFeature: function(feature,layer){
            layer.bindPopup("Plate Name: "+feature.properties.PlateName);
        }
    });
    // Call create map function using the earthquakes and plates data
    createMap(earthquakes, plates);
}; // end createFeatures()

// =========================================================================
//  Create map with different tile layers
// =========================================================================
function createMap(earthquakes, plates) {
    // Declare map layers
    var light = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/light-v10",
      accessToken: API_KEY
    });

    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-streets-v11",
        accessToken: API_KEY
    });
    
    // Following 2 layers learned from youtube
    var terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}{r}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        minZoom: 0, maxZoom: 18,
        ext: 'png'
    });

    var natGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	    attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
	    minZoom: 0, maxZoom: 16
    });

    // Declare base maps array to be chosen from
    var baseMaps = {
        "Light": light,
        "Outdoors": outdoors,
        "Terrains": terrain,
        "National Geographics": natGeoWorldMap,
        "Satellite": satellite
    };
    // Declare data layers to be chosen from
    var overlayMaps = {
        "Earthquake": earthquakes,
        "Tectonic Plate Line": plates
    }
    // Declare map object and set it to the map element in the DOM
    var myMap = L.map("map-id", {
        center: [39.4225,-111.7143], //starts from Denver, USA
        zoom: 5,
        // Set default layers
        layers: [satellite, earthquakes, plates]
    });
    // Create a legend for the map based on the earthquakes data and colors
    // *Legend specific*/
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function(map) {
      var div = L.DomUtil.create("div", "legend");
      div.innerHTML += "<h4>Magnitude</h4>";
      div.innerHTML += '<i style="background: green"></i><span>0-1</span><br>';
      div.innerHTML += '<i style="background: lightblue"></i><span><1-2</span><br>';
      div.innerHTML += '<i style="background: yellow"></i><span><2-3</span><br>';
      div.innerHTML += '<i style="background: red"></i><span><3-4</span><br>';
      div.innerHTML += '<i style="background: Orange"></i><span><4-5</span><br>';
      div.innerHTML += '<i style="background: purple"></i><span>5+</span><br>';      
      return div;
    };

    legend.addTo(myMap);
    L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(myMap);
      
}; // end of createMap()

// =========================================================================
//  Retrieve Earthquakes and Tectonic Plates data to start main logic
// =========================================================================
// Get earthquakes data
d3.json(earthquakesUrl, function(earthquakeData) {
    // Get plates data
    d3.json(platesUrl, function(platesData) {
        // Create features with the earthquakes and the plates data
        createFeatures(earthquakeData.features, platesData.features)
    });
});
