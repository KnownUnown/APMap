var map = null;
var map_revision = "r6";

var layers = [];

window.onload = function(){
  map = L.map("map").setView([0, 0], 1);

  L.tileLayer("assets/{revision}/map/{z}/{x}/{y}.png", {
    revision: map_revision,
    attribution: "Map data courtesy of <a href=\"http://minecraftairshippirates.enjin.com/profile/1310042\">Miss Fortune</a>",
    minZoom: 1,
    maxZoom: 6,
    tms: true,
    continuousWorld: true,
    bounds: L.latLngBounds(
      map.unproject([0, 16384]),
      map.unproject([16384, 0])
    ),
    crs: L.CRS.Simple
  }).addTo(map);

  L.control.coordinates({
    position: "bottomleft",
    decimals: 0,
    enableUserInput: false,
    customLabelFcn: function(latlng, opt) {
      xy = map.project(latlng, map.getMaxZoom());
      return "X: " + xy.x + " Y: " + xy.y;
    }
  }).addTo(map);

  getFromURL("assets/" + map_revision + "/features/settlements.geojson", addGeoJSON);
}

function addGeoJSON(encoded){
  for(var key in encoded["features"]) {
    encoded["features"][key].properties.coordinates = encoded["features"][key].geometry.coordinates;
    var latlng = map.unproject(encoded["features"][key].geometry.coordinates, map.getMaxZoom());
    encoded["features"][key].geometry.coordinates = [latlng.lng, latlng.lat]; // wince
  }
  var geoJson = L.geoJson(encoded, {
    pointToLayer: function(feature, latlng) {
      return L.marker(latlng, {
        icon: L.divIcon({
          iconSize: null,
          className: "map-label",
          html: "<div>" + feature.properties.name + "</div"
        })
      });
    },
    onEachFeature: function(feature, layer) {
        var coords = feature.properties.coordinates;
        layer.bindPopup("Coordinates: X " + coords[0] + ", Y " + coords[1]);
        layer.on('mouseover', function (e) {
          this.openPopup();
        });

        layer.on('mouseout', function (e) {
          this.closePopup();
        });
    }
  });
  geoJson.addTo(map);
}

function getFromURL(url, callback){
  var req = new XMLHttpRequest();
  req.overrideMimeType("application/json");
  req.open("GET", url);
  req.onreadystatechange = function(){
    if(req.readyState == 4 && req.status == 200){
      callback(JSON.parse(req.responseText));
    }
  }
  req.onerror = function(){
    console.error(req.statusText);
  };
  req.send();
}
