var map_revision = "r6";
var map = L.map("map").setView([0, 0], 3);

L.tileLayer("https://knownunown.github.io/APMap/assets/{revision}/map_full/{z}/{x}/{y}.png", {
  revision: map_revision,
  attribution: "Map data courtesy of <a href=\"http://minecraftairshippirates.enjin.com/profile/1310042\">Miss Fortune</a>",
  minZoom: 1,
  maxZoom: 6,
  tms: true,
  
}).addTo(map);
