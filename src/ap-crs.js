"use strict";

import L from "leaflet";

const map_scale = 255 / 16384; // tile size / # of pixels

L.CRS.AirshipPirates = L.extend({}, L.CRS.Simple, {
    projection: L.Projection.LonLat,
    transformation: L.transformation(map_scale, 0, -map_scale, 0)
});
