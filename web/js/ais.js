// Array containing the markers
var mgr = null;
var map = null;
var batch = [];
var markers = [];
var refresh = false;

/**
 * Ship object
 * @param shipId Ships unique id
 * @param ship JSON ship data
 * @param markerScale Scale of the google maps marker
 * @returns Ship object
 */
function Ship(shipId, ship, markerScale) {
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
	
	// Generate the marker image
	this.markerImage = new google.maps.MarkerImage('icons/ship/ship_' + this.color + '_' + this.state + '.png',
	    // Set marker dimension
	    new google.maps.Size(32 * markerScale, 32 * markerScale),
	    // Set origin
	    new google.maps.Point(0, 0),
	    // Set anchor
	    new google.maps.Point(16 * markerScale, 16 * markerScale),
	    // Set scale
	    new google.maps.Size(32 * markerScale, 32 * markerScale)
    );
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
	},
	get getMarkerImage() {
		return this.markerImage;
	}
};

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
    var initialListener = google.maps.event.addListener(map, 'tilesloaded', function () {
    	getShipMarkers();
    	google.maps.event.removeListener(initialListener);
    });
    setInterval("updateShipMarkers()", 60 * 100);
    setInterval("refreshMarkerManager()", 60*5000);
//    google.maps.event.addListener(map, 'zoom_changed', function () {
//        setupShipMarkers();
//    });
//    google.maps.event.addListener(map, 'dragend', function () {
//    	getShipMarkers();
//    });
}

/**
 * Update markers positions, and add new markers without
 * refreshing the MarkerManager.
 * @returns
 */
function updateShipMarkers() {
	$.getJSON('/api/http/ais?', {
    	swLat:-360,
    	swLon:-360,
    	neLat:360,
    	neLon:360
    }, function (result) {
    	var ships = result.ships;
    	var refresh = false;
    	// TODO run from 0 to ships.length to remove old targets...
        for (shipId in ships) {
        	var shipJSON = ships[shipId];
        	var ship = new Ship(shipId, shipJSON, 1);
            if(markers[shipId] != null) {
            	var marker = markers[shipId];
            	marker.setPosition(ship.getLatLon);
            	marker.setTitle(ship.getTitle);
            	marker.setIcon(ship.getMarkerImage);
            } else {
            	var marker = new google.maps.Marker({
                    position: ship.getLatLon,
                    title: ship.getTitle,
                    icon: ship.getMarkerImage
                });
            	
                markers[shipId] = marker;
                mgr.addMarker(marker, 1);
                refresh = true;
            }
        }
    });
}

/**
 * Refresh the marker manager to receive new targets
 */
function refreshMarkerManager() {
	if(refresh) {
    	mgr.refresh();
    	refresh = false;
    }
}

/**
 * Bulk add ships on first run
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
            
        	var marker = new google.maps.Marker({
        		id: shipId,
        		position: ship.getLatLon,
        		title: ship.getTitle,
        		icon: ship.getMarkerImage
            });
        	
        	// Event on marker mouse over
        	google.maps.event.addListener(marker, 'mouseover', function() {
        		marker.setTitle(marker.id);
        	});
        	
            markers[ship.getId] = marker;
            batch.push(marker);
        }
        var mgrOptions = { /*borderPadding: 50,*/ maxZoom: 15, trackMarkers: true };
        mgr = new MarkerManager(map, mgrOptions);
        google.maps.event.addListener(mgr, 'loaded', function () {
            mgr.addMarkers(batch, 1);
            mgr.refresh();
        });
    });
}