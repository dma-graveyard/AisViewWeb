// Load view settings
var initialLat = 56.00;
var initialLon = 11.00;
var initialZoom = 6;
var country = '';
loadView();

// Settings
var mcOptions = {
	gridSize: 40, 
	maxZoom: 12,
	minimumClusterSize: 10
};

var markerClustererRefresh = 60*5000;
var positionUpdate = 60*1000;

var markerDimension = 32;
var markerAnchor = 32/2;
var markerAngleInterval = 10;

var mapOptions = {
	zoom: initialZoom,
	center: new google.maps.LatLng(initialLat, initialLon),
	mapTypeId: google.maps.MapTypeId.TERRAIN,
	minZoom: 2
};

var serviceURL = '/ais/api/http/service';

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
	this.color = ship[4];

	// Moored or not
	if (ship[5] == 1) {
		this.moored = true;
	}
	
	this.degree = ship[0];
	
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
    map = new google.maps.Map(document.getElementById("mapCanvas"), mapOptions);
    
    // Initial listener which runs only once when tiles have been loaded
    var initialListener = null;
    initialListener = google.maps.event.addListener(map, 'tilesloaded', function () {
    	updateShipMarkers();
    	google.maps.event.removeListener(initialListener);
    });
    
    google.maps.event.addListener(map, 'dragstart', function() {
    	for(infoBox in infoBoxes) {
			infoBoxes[infoBox].close();
		}
    });
    
    google.maps.event.addListener(map, 'click', function() {
    	clearSelectedShip();
    });
    
    // Catch event when view changes
    google.maps.event.addListener(map, 'idle', function() {
    	viewChanged();
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
    	country: country
    }, function (result) {
    	var ships = result.ships;
    	
    	// Update number of targets
    	$("#totalTargets").html(result.shipCount);
    	
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
            		markerMouseOver(this);            		
            	});
            	
            	// Event on marker mouse out
            	google.maps.event.addListener(marker, 'mouseout', function() {
            		markerMouseOut(this);            		
            	});	
            	
            	// Event on marker mouse click
            	google.maps.event.addListener(marker, 'click', function() {
            		markerMouseClick(this);
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
        		updateTargetDetails(result);
        		var tracks = result.pastTrack.points;
        		createPastTrack(tracks);
        	});
        }
        
        // On first run, initialize the marker clusterer by batch adding the markers.
        if(init) {
        	refreshMarkerClusterer();
        	init = false;
        }    
        
        targetsInView();
        
    });
}

function viewChanged() {
	saveViewCookie();	
	targetsInView();
}

/**
 * Count targets in view
 */
function targetsInView() {
	if (!mcl) {
		return;
	}
	// Get current bounds
	var bounds = map.getBounds();
	// Get all marks
	var marks = mcl.getMarkers();
	// Check for each mark if visible
	var count = 0;
	for (var i=0; i < marks.length; i++) {
		var mark = marks[i];
		if (bounds.contains(mark.getPosition())) {
			count++;
		}		
	}	
	$("#targetsInView").html(count);
}

function saveViewCookie() {
	var center = map.getCenter();
	setCookie("dma-ais-zoom", map.getZoom(), 30);
	setCookie("dma-ais-lat", center.lat(), 30);
	setCookie("dma-ais-lon", center.lng(), 30);	
}

function loadView() {
	var zoom = getCookie("dma-ais-zoom");
	var lat = getCookie("dma-ais-lat");
	var lon = getCookie("dma-ais-lon");
	var con = getCookie("dma-ais-country");
	if (zoom) {
		initialZoom = parseInt(zoom);
	}
	if (lat && lon) {
		initialLat = parseFloat(lat);
		initialLon = parseFloat(lon);
	}
	if (con) {
		country = con;
	}
}

function setCookie(c_name,value,exdays) {
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name) {
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++) {
		x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		x=x.replace(/^\s+|\s+$/g,"");
		if (x==c_name) {
			return unescape(y);
		}
	}
}

/**
 * Method handling mouse click on marker
 * @param marker
 */
function markerMouseClick(marker) {
	// remove previous selection
	if(selectedMarker != null) {
		selectedMarker.setShadow(null);
	}
	selectedMarker = marker;
	$.getJSON(serviceURL, {
		method: 'details',
		past_track: '1',
		id: marker.id
	}, function(result) {
		selectedMarker.setShadow(selectionImage);
		updateTargetDetails(result);
		var tracks = result.pastTrack.points;
		createPastTrack(tracks);
	});
}

/**
 * Method called on marker mouse out 
 * @param marker
 */
function markerMouseOut(marker) {
	clearTimeout(mouseOverTimedEvent);
	for(infoBox in infoBoxes) {
		infoBoxes[infoBox].close();
	}	
}

/**
 * Method called on marker mouse over
 * @param marker
 */
var mouseOverTimedEvent;
function markerMouseOver(marker) {
	hoveredMarker = marker;
	mouseOverTimedEvent = setTimeout("mouseOverShow()", 1000);
}

function mouseOverShow() {
	$.getJSON(serviceURL, {
		method: 'details',
		id: hoveredMarker.id
	}, function(result) {
		var boxText = document.createElement("div");
		boxText.className = "shipHover";
        boxText.innerHTML = result.name;
                
        var myOptions = {
        	content: boxText,
            disableAutoPan: true,
            maxWidth: 0,
            pixelOffset: new google.maps.Size(-50, 20),
            closeBoxURL: ""
        };
        
        var infoBox = new InfoBox(myOptions);
        infoBox.open(map, hoveredMarker);
        infoBoxes.push(infoBox);
	});
}

/**
 * Method for updating selected ship's info
 * @param result 
 */
function updateTargetDetails(result) {
	$("#detailsMmsi").html(result.mmsi);
	$("#detailsClass").html(result.vesselClass);
	$("#detailsName").html(result.name);
	$("#detailsCallsign").html(result.callsign);
	$("#detailsLat").html(result.lat);
	$("#detailsLon").html(result.lon);
	$("#detailsImo").html(result.imoNo);
	$("#detailsSource").html(result.source);
	$("#detailsType").html(result.vesselType);
	$("#detailsCargo").html(result.cargo);
	$("#detailsCountry").html(result.country);
	$("#detailsSog").html(result.sog + ' kn');
	$("#detailsCog").html(result.cog + ' &deg;');
	$("#detailsHeading").html(result.heading + ' &deg;');
	$("#detailsDraught").html(result.draught + ' m');
	$("#detailsRot").html(result.rot + ' &deg;/min');
	$("#detailsWidth").html(result.width + ' m');
	$("#detailsLength").html(result.length + ' m');
	$("#detailsDestination").html(result.destination);
	$("#detailsNavStatus").html(result.navStatus);
	$("#detailsEta").html(result.eta);
	$("#detailsPosAcc").html(result.posAcc);
	$("#detailsLastReceived").html(result.lastReceived + " ago");
	$("#detailsLink").html('<a href="http://www.marinetraffic.com/ais/shipdetails.aspx?mmsi=' + result.mmsi + '" target="_blank">Target info</a>');
}

function clearTargetDetails() {
	$("#detailsMmsi").html('');
	$("#detailsClass").html('');
	$("#detailsName").html('');
	$("#detailsCallsign").html('');
	$("#detailsLat").html('');
	$("#detailsLon").html('');
	$("#detailsImo").html('');
	$("#detailsSource").html('');
	$("#detailsType").html('');
	$("#detailsCargo").html('');
	$("#detailsCountry").html('');
	$("#detailsSog").html('');
	$("#detailsCog").html('');
	$("#detailsHeading").html('');
	$("#detailsDraught").html('');
	$("#detailsRot").html('');
	$("#detailsWidth").html('');
	$("#detailsLength").html('');
	$("#detailsDestination").html('');
	$("#detailsNavStatus").html('');
	$("#detailsEta").html('');
	$("#detailsPosAcc").html('');
	$("#detailsLastReceived").html('');
	$("#detailsLink").html('');
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
	var path = new Array();
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
	clearTargetDetails();
}

/**
 * Method for refreshing the marker clusterer
 */
function refreshMarkerClusterer() {
	if(refresh) {
		if (mcl) {
			mcl.clearMarkers();
			mcl.addMarkers(batch, false);
		} else {
			mcl = new MarkerClusterer(map, batch, mcOptions);
		}
    	
		refresh = false;
	}
}

/**
 * Method for refreshing when filtering is changed
 */
function filterChanged() {
	setCookie("dma-ais-country", country, 30);
	// Remove markers first
	if (mcl) {
		mcl.clearMarkers();
	}
	init = true;
	refresh = true;
	markers = [];
    batch = [];
    $("#totalTargets").html("0");
    updateShipMarkers();
}
