// Settings
var mcOptions = {
	gridSize: 50, 
	maxZoom: 15, 
	minimumClusterSize: 10
};

var markerClustererRefresh = 60*5000;
var positionUpdate = 60*1000;

var markerDimension = 32;
var markerAnchor = 32/2;
var markerAngleInterval = 10;

var mapOptions = {
	zoom: 6,
	center: new google.maps.LatLng(56.00, 11.00),
	mapTypeId: google.maps.MapTypeId.TERRAIN
};

var serviceURL = '/ais/api/http/service?';

// Global variables
var mcl = null;
var map = null;
var selectedMarker = null;
var hoveredMarker = null;
var pastTrack = null;
var batch = [];
var markers = [];
var infoBoxes = [];
var init = true;
var refresh = false;

var selectionImage = new google.maps.MarkerImage('img/selection.png',
    // Set size
    new google.maps.Size(markerDimension, markerDimension),
    // Set origin
    new google.maps.Point(0, 0),
    // Set anchor
    new google.maps.Point(markerAnchor, markerAnchor)
);

/**
 * Ship object
 * 
 * @param shipId Ships unique id
 * @param ship JSON ship data
 * @param markerScale
 *            Scale of the google maps marker
 * @returns Ship object
 */
function Ship(shipId, ship, markerScale) {
	this.id = shipId;
	this.lat = ship[1];
	this.lon = ship[2];
	this.latlon = new google.maps.LatLng(this.lat, this.lon);
	
	// Set color and ship type
	switch (ship[4]) {
		case "19":
			this.color = 2;
			break;
		case "18":
			this.color = 4;
			break;
		default:
			this.color = 1;
			break;
	}
	
	if (ship[5] == 1) {
		this.moored = true;
	}
	
	// TODO move this sever side?
	this.degree = Math.round(ship[0] / 10.0) * 10;
	if (this.degree == 360) {
		this.degree = 0;
	}
	
	// Generate the marker image
	if(!this.moored) {
		this.markerImage = new google.maps.MarkerImage('img/ships.png',
		    // Set size
		    new google.maps.Size(markerDimension * markerScale, markerDimension * markerScale),
		    // Set origin
		    new google.maps.Point(markerDimension * this.color, markerDimension * (this.degree / markerAngleInterval + 1)),
		    // Set anchor
		    new google.maps.Point(markerAnchor * markerScale, markerAnchor * markerScale)
	    );
	} else {
		this.markerImage = new google.maps.MarkerImage('img/ships.png',
		    // Set size
		    new google.maps.Size(markerDimension * markerScale, markerDimension * markerScale),
		    // Set origin
		    new google.maps.Point(markerDimension * this.color, 0),
		    // Set anchor
		    new google.maps.Point(markerAnchor * markerScale, markerAnchor * markerScale)
	    );
	}
}

/**
 * Getters for the Ship object
 */
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
	get isMoored() {
		return this.moored;
	},
	get getDegree() {
		return this.degree;
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
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    
    // Initial listener which runs only once when tiles have been loaded
    var initialListener = google.maps.event.addListener(map, 'tilesloaded', function () {
    	updateShipMarkers();
    	google.maps.event.removeListener(initialListener);
    });
    
    google.maps.event.addListener(map, 'dragstart', function() {
    	for(infoBox in infoBoxes) {
			infoBoxes[infoBox].close();
		}
    });
    
    google.maps.event.addListener(map, 'mousedown', function() {
    	clearSelectedShip();
    });
    
    // Timing for ship movement
    setInterval("updateShipMarkers()", positionUpdate);
    
    // Timing for new ship target updates
    setInterval("refreshMarkerClusterer()", markerClustererRefresh);
}

/**
 * Update markers positions, and add new markers without refreshing the
 * MarkerManager.
 * 
 * @returns
 */
function updateShipMarkers() {
	$.getJSON(serviceURL, {
    	swLat:-360,
    	swLon:-360,
    	neLat:360,
    	neLon:360
    }, function (result) {
    	var ships = result.ships;
    	// TODO run from 0 to ships.length to remove old targets...
        for (shipId in ships) {
        	var shipJSON = ships[shipId];
        	var ship = new Ship(shipId, shipJSON, 1);
        	
            if(markers[shipId]) {
            	// Marker exists just update data
            	var marker = markers[shipId];
            	marker.setPosition(ship.getLatLon);
            	marker.setIcon(ship.getMarkerImage);
            } else {
            	// Marker doesn't exist, create a new one
            	var marker = new google.maps.Marker({
            		id: shipId,
                    position: ship.getLatLon,
                    icon: ship.getMarkerImage
                });
            	
            	/* Marker events */
            	
            	// Event on marker mouse over
            	google.maps.event.addListener(marker, 'mouseover', function() {
            		hoveredMarker = this;
            		$.getJSON(serviceURL, {
            			method: 'details',
            			id: this.id
            		}, function(result) {
            			var boxText = document.createElement("div");
            			boxText.className = "shipHover"
            	        boxText.innerHTML = result.name;
            	                
            	        var myOptions = {
            	        	content: boxText,
        	                disableAutoPan: true,
        	                maxWidth: 0,
        	                pixelOffset: new google.maps.Size(-75, 20),
    	                    closeBoxURL: "",
        	                pane: "floatPane",
            	        };
            	        
            	        var infoBox = new InfoBox(myOptions);
            	        infoBox.open(map, hoveredMarker);
            	        infoBoxes.push(infoBox);
            		});
            	});
            	
            	google.maps.event.addListener(marker, 'mouseout', function() {
            		for(infoBox in infoBoxes) {
            			infoBoxes[infoBox].close();
            		}
            	});	
            	
            	// Event on marker mouse click
            	google.maps.event.addListener(marker, 'click', function() {
            		// remove previous selection
            		if(selectedMarker != null) {
            			selectedMarker.setShadow(null);
            		}
            		selectedMarker = this;
            		$.getJSON(serviceURL, {
            			method: 'details',
            			past_track: '1',
            			id: this.id
            		}, function(result) {
            			selectedMarker.setShadow(selectionImage);
            			updateShipData(result);
            			var tracks = result.pastTrack.points;
            			createPastTrack(tracks);
            		});
            	});
            	
            	/* Add marker to batch */
                markers[shipId] = marker;
            	batch.push(marker);
            	refresh = true;
            }
        }
        
        // If there is a selected ship, update it's data and track
        if(selectedMarker != null) {
        	$.getJSON(serviceURL, {
        		method: 'details',
        		past_track: '1',
        		id: selectedMarker.id
        	}, function(result) {
        		updateShipData(result);
        		var tracks = result.pastTrack.points;
        		createPastTrack(tracks);
        	});
        }
        
        // On first run, initialize the marker clusterer by batch adding the markers.
        if(init) {
        	refreshMarkerClusterer();
        	init = false;
        }
    });
}

/**
 * Method for updating selected ship's info
 * @param result 
 */
function updateShipData(result) {
	$("#callsign").html(result.callsign);
	$("#lat").html(result.lat);
	$("#lon").html(result.lon);
}

/**
 * Create the past track
 * @param tracks Array of tracks
 */
function createPastTrack(tracks) {
	// close previous past track if it exists
	if(pastTrack != null) {
		pastTrack.setMap(null);
	}
	var path = [];
	for(track in tracks) {
		currentTrack = tracks[track];
		var latlon = new google.maps.LatLng(currentTrack.lat, currentTrack.lon);
		path.push(latlon);
	}
	pastTrack = new google.maps.Polyline({
		path: path,
		map: map,
		strokeColor: "#FF0000",
		geodesic: true
	});
	pastTrack.setMap(map);
}

function clearSelectedShip() {
	if(pastTrack != null) {
		pastTrack.setMap(null);		
	}
	if(selectedMarker != null) {
		selectedMarker.setShadow(null);
	}
	$("#callsign").html("");
	$("#lat").html("");
	$("#lon").html("");
}

/**
 * Method for refreshing the marker clusterer
 */
function refreshMarkerClusterer() {
	if(refresh) {
    	mcl = new MarkerClusterer(map, batch, mcOptions);
		refresh = false;
	}
}