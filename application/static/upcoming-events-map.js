/**
 * Initialize and setup upcoming events Google Maps widgets.
 */

const CONTAINER_CLASS /** @type {string} */ = 'upcoming-events-map';
const FUTURE_EVENTS_ENDPOINT /** @type {string} */
    = 'future_events_sample.json';


/**
 * @typedef {Object} CleanupEvent An upcoming event returned by the API.
 * @property {number} Lat Latitude coordinate of the event.
 * @property {number} Lng Longitude coordinate of the event.
 * @property {string} EventName Name of the event.
 * @property {number} EventID Unique event ID.
 */


/**
 * Initialize all instances of `.upcoming-events-map` with Google Maps.
 */
function initMaps() {
    const mapContainers = document.getElementsByClassName(CONTAINER_CLASS);

    maps = Array.from(mapContainers).map(container => {
        container.classList.remove('map-container--loading');
        return new google.maps.Map(container, {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 5,
            disableDefaultUI: true,
            mapTypeControl: true,
            mapTypeControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
            }
        });
    });

    populateMaps(maps);
}

/**
 * Load the data and then populate the maps with that data.
 * @param {google.maps.Map[]} maps The maps to load data into.
 */
function populateMaps(maps) {
    getJSON(FUTURE_EVENTS_ENDPOINT).then(events => {
        maps.forEach(map => {
            const markers = eventsToMarkers(events, map);
            showAllMarkers(map, markers);
        });
    }).catch(err => {
        console.trace(err);
        maps.forEach(map => map.getDiv().classList.add('map-container--error'));
    });
}

/**
 * Promisified version of `XMLHttpReuest`; expects JSON reqsponse.
 * Source {@link https://developers.google.com/web/fundamentals/primers/promises#promisifying_xmlhttprequest }
 * @param {string} url Request location.
 * @return {Promise<any>}
 */
function getJSON(url) {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.responseType = 'json';
        req.open('GET', url);

        req.onload = () => {
            if (req.status == 200) {
                resolve(req.response);
            } else {
                reject(Error(req.statusText));
            }
        };

        req.onerror = () => {
            reject(Error('Network Error'));
        };

        req.send();
    });
}

/**
 * Convert `CleanupEvent` to Google Maps marker.
 * @param {CleanupEvent[]} events Array of events to turn into markers.
 * @param {?google.maps.Map} map If provided, will add markers to this map.
 * @return {google.maps.Marker[]}
 */
function eventsToMarkers(events, map) {
    return events.map(event => {
        const marker = new google.maps.Marker({
            title: event.EventName,
            position: {
                lat: event.Lat,
                lng: event.Lng
            },
            map: map
        });

        marker.addListener('click', marker => {
            window.location.href = `view-event.html?eventID=${event.EventID}`;
        });

        return marker;
    });
};

/**
 * Zoom the map to see all the markers.
 * @param {google.maps.Map} map
 * @param {google.maps.Marker[]} markers
 */
function showAllMarkers(map, markers) {
    const bounds =
        new google.maps.LatLngBounds(markers[0].position, markers[0].position);
    markers.forEach(marker => {
        bounds.extend(marker.position);
    });
    map.fitBounds(bounds);
}