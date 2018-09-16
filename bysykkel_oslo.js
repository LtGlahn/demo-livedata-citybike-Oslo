
// Icons, icons, icons oh my
var bikeIconClass = L.Icon.extend({
    options: {
        iconSize:     [36, 36],
        shadowSize:   [0, 0],
        iconAnchor:   [0, 0],
        shadowAnchor: [0, 0],
        popupAnchor:  [9, 0]
    }
});

// var iconpath = 'bysykkel_icons/bysykkel_18x18png/';
// var iconpath = 'bysykkel_icons/bysykkel_27x27png/';
var iconpath = 'bysykkel_icons/bysykkel_36x36png/';
// var iconpath = 'bysykkel_icons/bysykkel_48x48png/';


var bikeICon_bikeOK_lockOK   = new bikeIconClass( { iconUrl: iconpath + 'bysykkel_bikeOK_lockOK.png' });
var bikeICon_bikeOK_lockSome = new bikeIconClass( { iconUrl: iconpath + 'bysykkel_bikeOK_lockSome.png' });
var bikeICon_bikeOK_lockNone = new bikeIconClass( { iconUrl: iconpath + 'bysykkel_bikeOK_lockNone.png' });

var bikeICon_bikeSome_lockOK   = new bikeIconClass( { iconUrl: iconpath + 'bysykkel_bikeSome_lockOK.png' });
var bikeICon_bikeSome_lockSome = new bikeIconClass( { iconUrl: iconpath + 'bysykkel_bikeSome_lockSome.png' });
var bikeICon_bikeSome_lockNone = new bikeIconClass( { iconUrl: iconpath + 'bysykkel_bikeSome_lockNone.png' });

var bikeICon_bikeNone_lockOK   = new bikeIconClass( { iconUrl: iconpath + 'bysykkel_bikeNone_lockOK.png' });
var bikeICon_bikeNone_lockSome = new bikeIconClass( { iconUrl: iconpath + 'bysykkel_bikeNone_lockSome.png' });
var bikeICon_bikeNone_lockNone = new bikeIconClass( { iconUrl: iconpath + 'bysykkel_bikeNone_lockNone.png' });

var mindato = function( dateStr) {

	var monthNames = [
			"jan", "feb", "mar",
			"apr", "mai", "juni", "juli",
			"aug", "sep", "okt",
			"nov", "des"
		];

  dateObj = new Date( Date.parse(dateStr));

	var datostreng = dateObj.getDate() + ". "
						+ monthNames[dateObj.getMonth()] + " "
						+  dateObj.getFullYear();

	var helTime = ('0'+dateObj.getHours()).slice(-2);
	var minutt = ('0'+dateObj.getMinutes()).slice(-2);
	var sekund = ('0'+dateObj.getSeconds()).slice(-2);

	var klokkestreng = helTime + ':' + minutt + ':' + sekund;

	return { dato: datostreng, klokke: klokkestreng };

}

// Grense for grønn vs gult symbol
var plentybikes = 3;
var plentylocks = 3;

function createRealtimeLayer(url, container) {
    return L.realtime(url, {
        interval: 20 * 1000,
        getFeatureId: function(f) {
            return f.properties.id;
        },
        cache: true,
        container: container,

        onEachFeature(f, l) {
            l.bindPopup(function() {
                var timePretty = mindato( f.properties.Updated );

                return '<h3>' + f.properties.title + '</h3>' +
                    '<p>' + f.properties.subtitle +
                    '<p><strong>' + f.properties.bikes + '</strong> sykler ledige' +
                    '<br/><strong>' + f.properties.locks + '</strong> låser ledige' +
                    '<p>' + timePretty.klokke +
                    '<br/>' + timePretty.dato + '</p>';            });
            // Ingen sykler
            if ((f.properties.bikes === 0 ) &&  (f.properties.locks === 0) ) {
              l.setIcon( bikeICon_bikeNone_lockNone);
            }
            else if ((f.properties.bikes === 0 ) &&  (f.properties.locks <= plentylocks) ) {
              l.setIcon( bikeICon_bikeNone_lockSome);
            }
            else if ((f.properties.bikes === 0 ) &&  (f.properties.locks > plentylocks) ) {
              l.setIcon( bikeICon_bikeNone_lockOK);
            }

            // Noen sykler
            else if ((f.properties.bikes <= plentybikes ) &&  (f.properties.locks === 0) ) {
              l.setIcon( bikeICon_bikeSome_lockNone);
            }
            else if ((f.properties.bikes <= plentybikes ) &&  (f.properties.locks <= plentylocks) ) {
              l.setIcon( bikeICon_bikeSome_lockSome);
            }
            else if ((f.properties.bikes <= plentybikes ) &&  (f.properties.locks > plentylocks) ) {
              l.setIcon( bikeICon_bikeSome_lockOK);
            }

            // Masse sykler
            else if ((f.properties.bikes > plentybikes ) &&  (f.properties.locks === 0 ) ) {
              l.setIcon( bikeICon_bikeOK_lockNone);
            }
            else if ((f.properties.bikes > plentybikes ) &&  (f.properties.locks <= plentylocks) ) {
              l.setIcon( bikeICon_bikeOK_lockSome);
            }
            else if ((f.properties.bikes > plentybikes ) &&  (f.properties.locks > plentylocks) ) {
              l.setIcon( bikeICon_bikeOK_lockOK);
            }

            // Fallback
            else {
               l.setIcon( bikeICon_bikeNone_lockNone);
            }

        },
        updateFeature: function(f, oldLayer, newLayer) {
                return newLayer;
        },
    });
}


// var bysykkelurl = 'https://jansimple.pythonanywhere.com/getfile/bysyklerDebugOslo.geojson';
var bysykkelurl =  'https://jansimple.pythonanywhere.com/getfile/bysykkelOslo.geojson';


var map = L.map('map'),
    clusterGroup = L.markerClusterGroup({ disableClusteringAtZoom : 15,
                                            spiderfyOnMaxZoom: false }).addTo(map),
//    subgroup1 = L.featureGroup.subGroup(clusterGroup),
    subgroup2 = L.featureGroup.subGroup(clusterGroup),
//    realtime1 = createRealtimeLayer('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson', subgroup1).addTo(map),
    realtime2 = createRealtimeLayer(bysykkelurl, subgroup2).addTo(map);

/*
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php">USGS Earthquake Hazards Program</a>, &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
*/

L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(map);


L.control.layers(null, {
//    'Earthquakes 2.5+': realtime1,
    'Bysykler': realtime2
}).addTo(map);

realtime2.once('update', function() {
    map.fitBounds(realtime2.getBounds(), {maxZoom: 14});
});


// User location
L.easyButton('fa-crosshairs fa-lg', function(btn, map){
    map.locate({setView: true, maxZoom: 16});
}).addTo( map );

var minpos;
function onLocationFound(e) {
    var radius = e.accuracy / 2;

    if (map.hasLayer(minpos)) {
      minpos.setLatLng( e.latlng);
    } else {

      minpos = L.marker(e.latlng);
      minpos.addTo(map)
          // .bindPopup("You are within " + radius + " meters from this point").openPopup();
      // L.circle(e.latlng, radius).addTo(map);
    }
}

map.on('locationfound', onLocationFound);
function onLocationError(e) {
    alert(e.message);
}

map.on('locationerror', onLocationError);
