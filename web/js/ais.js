// Array containing the markers
var mgr = null;
var map = null;
var batch = [];

/**
 * Generate graphics from ship target.
 *
 * @param {currentTarget} ship target.
 * @param {scale} scaling factor of the graphic.
 * 
 * @returns google.maps.MarkerImage
 */
function generateGraphics(currentTarget, scale) {
	var color;
	// Set ship color
	switch (currentTarget.vesselType) {
	    case "PASSENGER_VESSEL":
	        color = "blue";
	        break;
	    case "CARGO_VESSEL":
	        color = "green";
	        break;
	    case "TANKER":
	        color = "red";
	        break;
	    case "HSC":
	        color = "yellow";
	        break;
	    case "TUG":
	        color = "turquoise";
	        break;
	    case "PILOT":
	        color = "orange";
	        break;
	    case "YACHT":
	        color = "purple";
	        break;
	    case "UNSPECIFIED":
	        color = "gray";
	        break;
	    default:
	        color = "gray";
	        break;
    }
	
	// Set navigational state
	var state = "moored";
	if(!currentTarget.moored) {
		var degree = Math.round(currentTarget.cog / 5.0) * 5;
        if (degree == 360) {
            degree = 0;
        }
        state = degree;
	}
	
    return new google.maps.MarkerImage('icons/ship/ship_' + color + '_' + state + '.png',
	    // Set marker dimension
	    new google.maps.Size(32 * scale, 32 * scale),
	    // Set origin
	    new google.maps.Point(0, 0),
	    // Set anchor
	    new google.maps.Point(16 * scale, 16 * scale),
	    // Set scale
	    new google.maps.Size(32 * scale, 32 * scale)
    );
}

/**
 * Generate text used for hover description.
 *
 * @param {currentTarget} Ship target.
 * 
 * @returns String
 */
function generateTitle(currentTarget) {
	var shipType;
	switch (currentTarget.vesselType) {
	    case "PASSENGER_VESSEL":
	        shipType = "Passenger vessel";
	        break;
	    case "CARGO_VESSEL":
	        shipType = "Cargo vessel";
	        break;
	    case "TANKER":
	        shipType = "Tanker";
	        break;
	    case "HSC":
	        shipType = "High speed craft";
	        break;
	    case "TUG":
	        shipType = "Tug boat";
	        break;
	    case "PILOT":
	        shipType = "Pilot vessel";
	        break;
	    case "YACHT":
	        shipType = "Yacht";
	        break;
	    case "UNSPECIFIED":
	        shipType = "Unspecified vessel";
	        break;
	    default:
	        shipType = "Unspecified vessel";
	        break;
	}
	return shipType + " - " + currentTarget.sog.toFixed(2) + "kn / " + currentTarget.cog.toFixed(0) + "° - (" + currentTarget.lat.toFixed(4) + "," + currentTarget.lon.toFixed(4) + ") - last report " + currentTarget.lastReceived + " s ago";
}

/**
 * Initialize the map
 */
function setupMap() {
    var myOptions = {
        zoom: 10,
        center: new google.maps.LatLng(56.00, 11.00),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
//    google.maps.event.addListener(map, 'zoom_changed', function () {
//        setupShipMarkers();
//    });
//    google.maps.event.addListener(map, 'tilesloaded', function () {
//        setupShipMarkers();
//    });
//    setInterval("setupShipMarkers()", 60 * 1000);
//    google.maps.event.addListener(map, 'dragend', function () {
//    	getShipMarkers();
//    });
    var listener = google.maps.event.addListener(map, 'bounds_changed', function(){
    	getShipMarkers();
    	google.maps.event.removeListener(listener);
	});
}

/**
 * Get ship targets from JSON and generate the markers from given targets.
 * 
 * @returns Array with entries of type google.maps.Marker
 */

function getShipMarkers() {
    $.getJSON('/api/http/ais?', {
        /*swLat: map.getBounds().getSouthWest().lat().toString(),
        swLon: map.getBounds().getSouthWest().lng().toString(),
        neLat: map.getBounds().getNorthEast().lat().toString(),
        neLon: map.getBounds().getNorthEast().lng().toString()*/
    	swLat:-360,
    	swLon:-360,
    	neLat:360,
    	neLon:360
    }, function (targets) {
        for (target in targets) {
            var currentTarget = targets[target];
            
            var myLatLon = new google.maps.LatLng(currentTarget.lat, currentTarget.lon);
            var title = generateTitle(currentTarget);
            var shipGraphics = generateGraphics(currentTarget, 1);
            
            batch.push(new google.maps.Marker({
                position: myLatLon,
                title: title,
                icon: shipGraphics
            }));
        }
        setupShipMarkers();
    });
}

/**
 * Set up marker manager and add ship markers from marker array.
 */
function setupShipMarkers() {
    mgr = new MarkerManager(map);
    google.maps.event.addListener(mgr, 'loaded', function () {
        mgr.addMarkers(batch, 1);
        mgr.refresh();
    });
}