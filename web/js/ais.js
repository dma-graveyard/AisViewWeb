// Array containing the markers
var mgr = null;
var map = null;
var batch = [];

/**
 * Ship type object
 * @param currentTarget Single ship target from.
 * @returns {Ship} Ship type object containing color, ship type and navigational state.
 */
function Ship(shipId, ship) {
	this.id = shipId;
	this.lat = ship[1];
	this.lon = ship[2];
	this.latlon = new google.maps.LatLng(this.lat, this.lon);
	// Set color and ship type
	switch (ship[4]) {
		case "PASSENGER_VESSEL":
			this.color = "blue";
			shipType = "Passenger vessel";
			break;
		case "CARGO_VESSEL":
			this.color = "green";
			shipType = "Cargo vessel";
			break;
		case "TANKER":
			this.color = "red";
			shipType = "Tanker";
			break;
		case "HSC":
			this.color = "yellow";
			shipType = "High speed craft";
			break;
		case "TUG":
			this.color = "turquoise";
			shipType = "Tug boat";
			break;
		case "PILOT":
			this.color = "orange";
			shipType = "Pilot vessel";
			break;
		case "YACHT":
			this.color = "purple";
			shipType = "Yacht";
			break;
		case "UNSPECIFIED":
			this.color = "gray";
			shipType = "Unspecified vessel";
			break;
		default:
			this.color = "gray";
			shipType = "Unspecified vessel";
			break;
	}
	
	// Set ship title
	this.title = shipType /*+ " - " + currentTarget.sog.toFixed(2) + "kn / " + currentTarget.cog.toFixed(0) + "° - (" + currentTarget.lat.toFixed(4) + "," + currentTarget.lon.toFixed(4) + ") - last report " + currentTarget.lastReceived + " s ago"*/;
	
	// Set navigational state
	if (ship[5] == 1) {
		this.state = "moored";
	} else {
		var degree = Math.round(ship[0] / 5.0) * 5;
		if (degree == 360) {
			degree = 0;
		}
		this.state = degree;
	}
}

// Getters for the ship object
Ship.prototype = {
	get getId() {
		return this.id;
	},
	get getLat() {
		return this.lat;
	},
	get getLon() {
		return this.lon;
	},
	get getColor() {
		return this.color;
	},
	get getTitle() {
		return this.title;
	},
	get getState() {
		return this.state;
	},
	get getLatLon() {
		return this.latlon;
	}
};


/**
 * Generate graphics from ship target.
 * @param {currentTarget} ship target.
 * @param {scale} scaling factor of the graphic.
 * @returns google.maps.MarkerImage
 */
function generateGraphics(ship, scale) {
    return new google.maps.MarkerImage('icons/ship/ship_' + ship.getColor + '_' + ship.getState + '.png',
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
//    google.maps.event.addListener(map, 'dragend', function () {
//    	getShipMarkers();
//    });
    setInterval("getShipMarkers()", 60 * 100);
    var listener = google.maps.event.addListener(map, 'bounds_changed', function(){
    	getShipMarkers();
    	google.maps.event.removeListener(listener);
	});
}

/**
 * Get ship targets from JSON and generate the markers from given targets.
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
    }, function (result) {
    	var ships = result.ships;
        for (shipId in ships) {
            var shipJSON = ships[shipId];
            
            var ship = new Ship(shipId, shipJSON);
            var shipGraphics = generateGraphics(ship, 1);
            
            if(batch[ship.getId] != null) {
            	var marker = batch[ship.getId];
            	marker.setPosition(ship.getLatLon);
            	marker.setTitle(ship.getTitle);
            	marker.setIcon(shipGraphics);
            } else {
	            batch[ship.getId] = (new google.maps.Marker({
	                position: ship.getLatLon,
	                title: ship.getTitle,
	                icon: shipGraphics
	            }));
            }
        }
        setupShipMarkers();
    });
}

/**
 * Set up marker manager and add ship markers from marker array.
 */
function setupShipMarkers() {
	var mgrOptions = { borderPadding: 50, maxZoom: 15, trackMarkers: true };
    mgr = new MarkerManager(map, mgrOptions);
    google.maps.event.addListener(mgr, 'loaded', function () {
        mgr.addMarkers(batch, 1);
        mgr.refresh();
    });
}