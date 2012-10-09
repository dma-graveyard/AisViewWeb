<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF8">
		<title>DMA AisViewWeb</title>
		<link rel="stylesheet" type="text/css" href="css/style.css" />
		<script type="text/javascript" src="http://code.jquery.com/jquery-1.6.2.min.js"></script>
		<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=true"></script>
		<script type="text/javascript" src="http://google-maps-utility-library-v3.googlecode.com/svn/tags/markermanager/1.0/src/markermanager.js"></script>
		<script type="text/javascript" src="http://google-maps-utility-library-v3.googlecode.com/svn/tags/markerclustererplus/2.0.6/src/markerclusterer.js"></script>
		<script type="text/javascript" src="http://google-maps-utility-library-v3.googlecode.com/svn/tags/infobox/1.1.9/src/infobox.js"></script>
		<script type="text/javascript" src="js/ais.js"></script>
	</head>
	<body onload="setupMap()">
		<div id="sideBar">							
			<div id="targetDetails" class="sidebarElement">
				<h3>Target details</h3>		
				<div id="targetDetailsTable" style="display:none;">		
					<div id="detailsRow">
						<div id="detailsLeftCol">MMSI</div>
						<div class="detailsRightCol" id="detailsMmsi"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Class</div>
						<div class="detailsRightCol" id="detailsClass"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Name</div>
						<div class="detailsRightCol" id="detailsName"></div>					
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Callsign</div>
						<div class="detailsRightCol" id="detailsCallsign"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Lat</div>
						<div class="detailsRightCol" id="detailsLat"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Lon</div>
						<div class="detailsRightCol" id="detailsLon"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">IMO</div>
						<div class="detailsRightCol" id="detailsImo"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Source</div>
						<div class="detailsRightCol" id="detailsSource"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Type</div>
						<div class="detailsRightCol" id="detailsType"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Cargo</div>
						<div class="detailsRightCol" id="detailsCargo"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Country</div>
						<div class="detailsRightCol" id="detailsCountry"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">SOG</div>
						<div class="detailsRightCol" id="detailsSog"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">COG</div>
						<div class="detailsRightCol" id="detailsCog"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Heading</div>
						<div class="detailsRightCol" id="detailsHeading"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Draught</div>
						<div class="detailsRightCol" id="detailsDraught"></div>			
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">ROT</div>
						<div class="detailsRightCol" id="detailsRot"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Width</div>
						<div class="detailsRightCol" id="detailsWidth"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Length</div>
						<div class="detailsRightCol" id="detailsLength"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Destination</div>
						<div class="detailsRightCol" id="detailsDestination"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Nav status</div>
						<div class="detailsRightCol" id="detailsNavStatus"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">ETA</div>
						<div class="detailsRightCol" id="detailsEta"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Pos acc</div>
						<div class="detailsRightCol" id="detailsPosAcc"></div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Last report</div>
						<div class="detailsRightCol" id="detailsLastReceived"></div>
					</div>			
				</div>
				<div id="detailsLink"></div>	
			</div>			
						
			<div id="targetFilters" class="sidebarElement">
				<h3>Target filtering</h3>
				<form name="targetFilter" action="">
				<p>

					Presets <select name="filter_preset"
						onchange="useFilterPreset(this);">
						<option value="sourceType=LIVE">Terrestrial</option>
						<option value="sourceType=SAT">Satellite</option>
						<option value="country=DNK">Danish ships</option>
				</select>
				</p>
				</form>				
				<script type="text/javascript">
					function useFilterPreset(presetSelect) {
						filterQuery = presetSelect.options[presetSelect.selectedIndex].value;
						filterChanged();
					}
					var foundPreset = false;
					for (var i=0; i < document.targetFilter.filter_preset.options.length; i++) {
						if (filterQuery == document.targetFilter.filter_preset.options[i].value) {
							foundPreset = true;
							document.targetFilter.filter_preset.options[i].selected = true;
							break;
						}
					}
					if (!foundPreset) {
						filterQuery = 'sourceType=LIVE';
						document.targetFilter.filter_preset.options[0].selected = true;	
						filterChanged();
					}
				</script>			
			</div>
			<div id="targetCount" class="sidebarElement">
				<h3>Target count</h3>
				<div id="sidebarTable">		
					<div id="detailsRow">
						<div id="detailsLeftCol">Total targets</div>
						<div class="detailsRightCol" id="totalTargets">0</div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Targets in-view</div>
						<div class="detailsRightCol" id="targetsInView">0</div>
					</div>
				</div>
			</div>			
			<div id="targetLegends" class="sidebarElement">
				<h3>Target legends</h3>
				<img src="img/ship_blue.png" align="middle"/> Passenger<br/>
				<img src="img/ship_green.png" align="middle"/> Cargo<br/>
				<img src="img/ship_red.png" align="middle"/> Tanker<br/>
				<img src="img/ship_yellow.png" align="middle"/> High speed craft and WIG<br/>						
				<img src="img/ship_orange.png" align="middle"/> Fishing<br/>
				<img src="img/ship_purple.png" align="middle"/> Sailing and pleasure<br/>
				<img src="img/ship_turquoise.png" align="middle"/> Pilot, tug and others<br/>
				<img src="img/ship_gray.png" align="middle"/> Undefined<br/><br/>
				<img src="img/ship_white.png" /> Sailing <img src="img/ship_white_moored.png"> Anchored/Moored<br/>
			</div>
		</div>
		<div id="contentContainer">
			<div id="mapCanvas"></div>
		</div>
	</body>
</html>