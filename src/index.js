"use strict";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import L from "leaflet";
import "leaflet-draw";
import Clipboard from "clipboard";

var map = null;
var map_revision = "r8";

var doodles = null;
var storageSupported = true;

const data_url = "https://apmap-tile-server.unown.me/";

$(document).ready(function() {
    // init clipboard.js
    var clipboard = new Clipboard(".btn");

    $(".btn").mouseleave(function(e) {
        $(this).tooltip("disable");
    });
    clipboard.on("success", function(e) {
        $(e.trigger).tooltip({
            title: "Copied!"
        });
        $(e.trigger).tooltip("enable");
        $(e.trigger).attr("title", "Copied!").tooltip("fixTitle").tooltip("show");
    });

    clipboard.on("error", function(e) {
        $(e.trigger).tooltip("enable");
        $(e.trigger).attr("title", fallbackMessage(e.action)).tooltip("fixTitle").tooltip("show"); //TODO: fix weird tooltip positioning
    });

    // init map elements
    map = L.map("map", {
        crs: L.CRS.Simple
    }).setView([0, 0], 1);

    L.theMap = map;

    // init base tile layer
    L.tileLayer(data_url + "{revision}/map/{z}/{x}/{y}.png", {
        revision: map_revision,
        attribution: "Map data courtesy of <a href=\"http://minecraftairshippirates.enjin.com/profile/1310042\">Miss Fortune</a>",
        minZoom: 0,
        maxZoom: 6,
        continuousWorld: true
        /*
        bounds: L.latLngBounds(
            L.latLng(0, -12288),
            L.latLng(12288, 0)
        )
*/
    }).addTo(map);

    // init custom layers
    if (!Storage) {
        console.error("LocalStorage not supported!");
        storageSupported = false;
        doodles = L.featureGroup().addTo(map);
    } else {
        doodles = getDrawn().addTo(map);
    }
    map.on('draw:created', function(e) {
        doodles.addLayer(e.layer);
        if (storageSupported) {
            saveDrawn(JSON.stringify(doodles.toGeoJSON()));
        }
    });

    getFromURL(data_url + "assets/" + map_revision
               + "/features/settlements.geojson", addGeoJSON, true);
    getFromURL(data_url + "assets/" + map_revision
               + "/features/unaffiliated.geojson", addGeoJSON);

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

function addGeoJSON(encoded, meta = false) {
    for (var key in encoded["features"]) {
        encoded["features"][key].properties.coordinates = encoded["features"][key].geometry.coordinates;
        var latlng = map.unproject(encoded["features"][key].geometry.coordinates, map.getMaxZoom());
        encoded["features"][key].geometry.coordinates = [latlng.lng, latlng.lat]; // wince
    }
    var geoJson = L.geoJson(encoded, {
        pointToLayer: function(feature, latlng) {
            var marker = L.marker(latlng, {
                icon: L.divIcon({
                    iconSize: null,
                    className: "map-label",
                    html: feature.properties.name
                })
            });
            if (meta) {
                marker.on("click", function(e) {
                    console.log(feature.properties);
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
            }
            return marker;
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

function getFromURL(url, callback, hasMeta = false) { // todo: signature :(
    $.get({
            url: url,
            dataType: "json"
        })
        .done(function(resp) {
            callback(resp, hasMeta);
        })
        .fail(function(xhr, status, error) {
            console.error(error);
        });
}

function getDrawn() {
    if (!localStorage.getItem("drawn")) {
        if (!saveDrawn("[]")) {
            return false;
        }
    }
    return L.geoJson(JSON.parse(localStorage.getItem("drawn")));
}

function saveDrawn(layer) {
    try {
        localStorage.setItem("drawn", layer);
    } catch (e) {
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
