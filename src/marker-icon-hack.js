"use strict";

// Apparently webpack can't find and replace Leaflet's reference
// to certain assets correctly. This code is needed to fix that.
//
// See:
// https://github.com/PaulLeCam/react-leaflet/issues/255
// https://github.com/Leaflet/Leaflet/issues/4968
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});
