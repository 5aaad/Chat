mapboxgl.accessToken = 'pk.eyJ1IjoiNWFhYWQiLCJhIjoiY2tsejdydXlyMWI2NDJ2bzZ4a2pudXlycyJ9.P0k6oCwzpvzhzyDCroehSg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    zoom: 9,
    center: [73.1573853, 33.6529080]
});

//Fetch stores from API
async function getStores() {
    const res = await fetch('/api/v1/stores');
    const data = await res.json();

    const stores = data.data.map(store => {
        return {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [store.location.coordinates[0], store.location.coordinates[1]]
            },
            properties: {
                storeId: store.storeId,
                icon: 'shop'
            }
        }
    });

    loadMap(stores);
}


//Load map with stores
function loadMap(stores) {
    map.on('load', function () {
        map.loadImage(
            'https://upload.wikimedia.org/wikipedia/commons/0/0a/Marker_location.png',
            function (error, image) {
                if (error) throw error;
                map.addImage('marker', image);
                map.addSource('point', {
                    'type': 'geojson',
                    'data': {
                        'type': 'FeatureCollection',
                        features: stores
                    }
                });
                map.addLayer({
                    'id': 'points',
                    'type': 'symbol',
                    'source': 'point',
                    'layout': {
                        'icon-image': 'marker',
                        'icon-size': 2.00
                    }
                });
            }
        );
    });
}

getStores();