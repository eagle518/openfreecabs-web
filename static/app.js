var map;
var markers = [];
var currentLocation;
var defaultCoords = {lat: 42.876680, lng: 74.588665};
var geoloccontrol = new klokantech.GeolocationControl(map, mapMaxZoom);

function initMap() {
		var locIcon = '/static/loc.png';
		map = new google.maps.Map(document.getElementById('map'), {
				center: defaultCoords,
				zoom: 14,
				disableDefaultUI: true
		});
		// Try HTML5 geolocation.
		if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function (position) {
						var pos = {
								lat: position.coords.latitude,
								lng: position.coords.longitude
						};


						map.setCenter(pos);
						map.setZoom(14);
						currentLocation = new google.maps.Marker({
								position: {lat: position.coords.latitude, lng: position.coords.longitude},
								map: map,
								icon: locIcon
						});
						requestNearest(position.coords.latitude, position.coords.longitude);


				}, function () {
						console.log("Can't get coords");
						currentLocation = new google.maps.Marker({
								position: defaultCoords,
								map: map,
								icon: locIcon
						})
				});
		} else {
				// Browser doesn't support Geolocation
				console.log("Browser doesn't support geolocation")
		}
		google.maps.event.addListener(map, 'click', function (e) {
				changeLocationPin(e.latLng);
		})
}

function changeLocationPin(latlng) {
		// map.panTo(latlng);
		currentLocation.setPosition(latlng);
		requestNearest(latlng.lat(), latlng.lng());
}

function requestNearest(lat, lng) {
		// var url = window.location.origin + "/nearest/" + lat + "/" + lng;

		var url = "http://127.0.0.1:8090/nearest/" + lat + "/" + lng;

		var xmlhttp;
		// compatible with IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function () {
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
						data = JSON.parse(xmlhttp.responseText);
						console.log(data);
						if (data.success) {
								cleanMarkers();
								data.companies = data.companies.sort(function (a, b) {
										return a.drivers.length < b.drivers.length
								});


								for (i = 0; i < data.companies.length; i++) {

										var company = data.companies[i];
										var phoneNumber = "n/a",
												shortNumber = "",
												webSite = "#",
												android = "#",
												icon = "static/img/icon_namba.png",
												iOS = "#";
										if (company.contacts !== null) {
												for (l = 0; l < company.contacts.length; l++) {
														c = company.contacts[l];
														console.log(c);
														switch (c.type) {
																case 'phone':
																		phoneNumber = c.contact;
																		break;
																case 'sms':
																		shortNumber = c.contact;
																		break;
																case 'android':
																		android = c.contact;
																		break;
																case 'ios':
																		iOS = c.contact;
																		break;
																case 'website':
																		webSite = c.contact;
																		break;
																case 'icon':
																		icon = c.icon;
																		break;
														}
												}
										}
										console.log(phoneNumber);
										console.log(shortNumber);
										var source = document.getElementById('result').innerHTML;
										var template = Handlebars.compile(source);
										var html = template({
												name: company.name,
												icon: company.icon,
												driversCount: company.drivers.length,
												phoneNumber: phoneNumber,
												shortNumber: shortNumber,
												webSite: webSite,
												android: android,
												iOS: iOS
										});
										$(".result_wrap").append(html);
										for (j = 0; j < company.drivers.length; j++) {
												var item = company.drivers[j];
												var options = {
														position: {lat: item.lat, lng: item.lon},
														map: map,
														title: company.name
												};
												if (company.icon !== "" && company.icon !== window.location.origin) {
														options.icon = company.icon
												}
												markers.push(
														new google.maps.Marker(options)
												)
										}
								}
						}
				}
		};
		xmlhttp.open("GET", url, true);
		xmlhttp.send();
}

function cleanMarkers() {
		for (i = 0; i < markers.length; i++) {
				var marker = markers[i];
				marker.setMap(null);
		}
		markers = [];
		$(".result_wrap").html("");
}
