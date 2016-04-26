var map = null;
var map_revision = "r6";

var layers = [];

window.onload = function(){
  map = L.map("map").setView([0, 0], 3);

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

  getFromURL("assets/" + map_revision + "/features/settlements.geojson", addGeoJSON);
}

function addGeoJSON(encoded){
  console.log(encoded);
  for(var key in encoded["features"]) {
    console.log(encoded["features"][key]);
    latlng = map.unproject(encoded["features"][key].geometry.coordinates, map.getMaxZoom());
    lat = latlng.lat;
    lng = latlng.lng;
    encoded["features"][key].geometry.coordinates = [lng, lat]; // wince
  }
  console.log(encoded);
  geoJson = L.geoJson(encoded, {
    onEachFeature: function(feature, layer) {
      if (feature.properties && feature.properties.name) {
        layer.bindPopup(feature.properties.name);
      }
    }
  });
  geoJson.addTo(map);
}

function getFromURL(url, callback){
  req = new XMLHttpRequest();
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
