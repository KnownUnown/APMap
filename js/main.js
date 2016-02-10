var map = null;
var map_revision = "r6";

var layers = [];

window.onload = function(){
  map = L.map("map").setView([0, 0], 3);

  L.tileLayer("assets/{revision}/map_full/{z}/{x}/{y}.png", {
    revision: map_revision,
    attribution: "Map data courtesy of <a href=\"http://minecraftairshippirates.enjin.com/profile/1310042\">Miss Fortune</a>",
    minZoom: 1,
    maxZoom: 6,
    tms: true,
    continuousWorld: true,
    crs: L.CRS.Simple
  }).addTo(map);

  getFromURL("assets/" + map_revision + "/features/settlements.geojson", addGeoJSON);
}

function addGeoJSON(){
  encoded = this.responseText;
  console.log(encoded);
  decoded = JSON.parse(encoded);
  L.geoJson(decoded).addTo(map);
}

function getFromURL(url, callback){
  req = new XMLHttpRequest();
  req.overrideMimeType("application/json");
  req.open("GET", url);
  req.onerror = function(){
    console.error(this.statusText);
  };
  req.callback = callback;
  req.send();
}
