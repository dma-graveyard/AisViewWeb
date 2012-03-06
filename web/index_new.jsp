<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF8">
		<title>DMA AisViewWeb</title>
		<link rel="stylesheet" type="text/css" href="css/style.css" />
		<script type="text/javascript" src="js/browsercheck.js"></script>
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
				<div id="targetDetailsTable">		
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
				<div id="targetDetailsTable">		
					<div id="detailsRow">
						<div id="detailsLeftCol">Presets</div>
						<div class="detailsRightCol">
							<select name="filter_preset" onchange="useFilterPreset(this);">
								<option value="">All</option>
								<option value="country=DNK">Danish ships</option>
								<option value="country=BEL,BGR,CYP,CZE,DNK,EST,FRO,FIN,AUT,FRA,DEU,GBR,GRC,HUN,IRL,ITA,LVA,LTU,LUX,MLT,NLD,POL,PRT,ROU,SVK,SVN,ESP,SWE">EU ships</option>
								<option value="country=CHN">Chinese ships</option>								
							</select>
						</div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Tgt country</div>
						<div class="detailsRightCol">
							<input name="country" type="text" />
						</div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Src country</div>
						<div class="detailsRightCol">
							<input name="sourceCountry" type="text" />
						</div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Src type</div>
						<div class="detailsRightCol">
							<input name="sourceType" type="text" />
						</div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Src region</div>
						<div class="detailsRightCol">
							<input name="sourceRegion" type="text" />
						</div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Src BS</div>
						<div class="detailsRightCol">
							<input name="sourceBs" type="text" />
						</div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Src BS</div>
						<div class="detailsRightCol">
							<input name="sourceBs" type="text" />
						</div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Src system</div>
						<div class="detailsRightCol">
							<input name="sourceSystem" type="text" />
						</div>
					</div>
					<div id="detailsRow">
						<div id="detailsLeftCol">Vessel class</div>
						<div class="detailsRightCol">
							<input name="vesselClass" type="text" />
						</div>
					</div>
				</div>
				<input type="button" value="Apply filter" onclick="applyFilter();"/>	
<!--  					<p>Target country
					<select id="country" onchange="changeCountry(this);">
						<option value="">All</option>
						<option value="CHN">China</option>						
						<option value="DNK">Denmark</option>
						<option value="BEL,BGR,CYP,CZE,DNK,EST,FRO,FIN,AUT,FRA,DEU,GBR,GRC,HUN,IRL,ITA,LVA,LTU,LUX,MLT,NLD,POL,PRT,ROU,SVK,SVN,ESP,SWE">EU</option>
						<option value="USA">USA</option>
					</select>
					</p>   -->
				</form>
			</div>
			<script type="text/javascript">
				function useFilterPreset(presetSelect) {
					alert('Hello');
					filterQuery = presetSelect.options[countrySelect.selectedIndex].value;
					alert(filterQuery);
					parseFilterQuery();					
					filterChanged();
				}
				function parseFilterQuery() {
					// Fill fields from query
				}
				function applyFilter() {
					// Make filterQuery from fields
					
					filterChanged();
				}

			
				setCurrentCountry();
				function setCurrentCountry() {
					for (var i=0; i<document.targetFilter.country.options.length; i++) {
						if (country == document.targetFilter.country.options[i].value) {
							document.targetFilter.country.options[i].selected = true;
							return;
						}
					}
					country = '';
				} 
				function changeCountry(countrySelect) {
					country = countrySelect.options[countrySelect.selectedIndex].value;
					filterChanged();
				}
			</script>			
			<div id="targetCount" class="sidebarElement">
				<h3>Target count</h3>
				<div id="targetDetailsTable">		
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