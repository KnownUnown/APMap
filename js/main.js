var map = null;
var map_revision = "r6";

var doodles = null;
var storageSupported = true;

$(document).ready(function() {
    // init clipboard.js
    var clipboard = new Clipboard(".btn");

    $(".btn").mouseleave(function(e){
        $(this).tooltip("disable");
    });
    clipboard.on("success", function(e){
        $(e.trigger).tooltip({
            title: "Copied!"
        });
        $(e.trigger).tooltip("enable");
        $(e.trigger).attr("title", "Copied!").tooltip("fixTitle").tooltip("show");
    });

    clipboard.on("error", function(e){
        $(e.trigger).tooltip("enable");
        $(e.trigger).attr("title", fallbackMessage(e.action)).tooltip("fixTitle").tooltip("show"); //TODO: fix weird tooltip positioning
    });

    // init map elements
    map = L.map("map", {
        measureControl: true
    }).setView([0, 0], 1);

    // init base tile layer
    L.tileLayer("assets/{revision}/map/{z}/{x}/{y}.png", {
        revision: map_revision,
        attribution: "Map data courtesy of <a href=\"http://minecraftairshippirates.enjin.com/profile/1310042\">Miss Fortune</a>",
        minZoom: 1,
        maxZoom: 6,
        tms: true,
        continuousWorld: true,
        crs: L.CRS.Simple
    }).addTo(map);

    // init custom layers

    if(!Storage){
        console.error("LocalStorage not supported!");
        storageSupported = false;
        doodles = L.featureGroup().addTo(map);
    } else {
        doodles = getDrawn().addTo(map);
    }
    map.on('draw:created', function(e) {
        doodles.addLayer(e.layer);
        if(storageSupported){
            saveDrawn(JSON.stringify(doodles.toGeoJSON()));
        }
    });

    getFromURL("assets/" + map_revision + "/features/settlements.geojson", addGeoJSON);

    // init controls
    L.control.coordinates({
        position: "bottomleft",
        enableUserInput: false,
        customLabelFcn: function(latlng, opt) {
            xy = map.project(latlng, map.getMaxZoom());
            return "X: " + Math.round(xy.x) + " Y: " + Math.round(xy.y);
        }
    }).addTo(map);

    new L.Control.Draw({
        edit: {
            featureGroup: doodles,
            poly: {
                allowIntersection: false
            }
        },
        draw: {
            polygon: {
                allowIntersection: false
            }
        }
    }).addTo(map);
});

function addGeoJSON(encoded) {
    for (var key in encoded["features"]) {
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
                    html: feature.properties.name
                })
            }).on("click", function(e) {
                $("#cityModal .modal-title").text(feature.properties.name);
                $("#cityModal #coords").attr("value", "[" + feature.properties.coordinates.join(", ") + "]");
                $("#lore, #source, #faction").text("Not set yet :(");
                if (feature.properties.lore != null) {
                    $("#faction").html(feature.properties.faction);
                    $("#lore").html(feature.properties.lore);
                    $("#source").html(feature.properties.source)
                }
                $("#cityModal").modal();
            });
        },
        onEachFeature: function(feature, layer) {
            var coords = "[" + feature.properties.coordinates.join(", ") + "]"; // TODO: refactor
            layer.on('mouseover', function(e) {
                $("div .leaflet-marker-icon:contains('" + feature.properties.name + "')").text(coords);
            });

            layer.on('mouseout', function(e) {
                $("div .leaflet-marker-icon:contains('" + coords + "')").text(feature.properties.name);
            });
        }
    });
    geoJson.addTo(map);
}

function getFromURL(url, callback) {
    var req = new XMLHttpRequest();
    req.overrideMimeType("application/json");
    req.open("GET", url);
    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            callback(JSON.parse(req.responseText));
        }
    }
    req.onerror = function() {
        console.error(req.statusText);
    };
    req.send();
}

function getDrawn(){
    if(!localStorage.getItem("drawn")){
        if(!saveDrawn("[]")){
            return false;
        }
    }
    return L.geoJson(JSON.parse(localStorage.getItem("drawn")));
}

function saveDrawn(layer){
    try{
        localStorage.setItem("drawn", layer);
    } catch(e){
        console.error("LocalStorage threw an exception!");
        return false;
    }
    return true;
}

function fallbackMessage(action) {
    var actionMsg = '';
    var actionKey = (action === 'cut' ? 'X' : 'C');
    if (/iPhone|iPad/i.test(navigator.userAgent)) {
        actionMsg = 'No support :(';
    } else if (/Mac/i.test(navigator.userAgent)) {
        actionMsg = 'Press ⌘-' + actionKey + ' to ' + action;
    } else {
        actionMsg = 'Press Ctrl-' + actionKey + ' to ' + action;
    }
    return actionMsg;
}
