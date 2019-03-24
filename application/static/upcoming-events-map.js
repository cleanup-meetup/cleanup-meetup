/**
 * Initialize and setup upcoming events Google Maps widgets.
 */

const FUTURE_EVENT_MAP_CONTAINER_CLASS /** @type {string} */ = 'upcoming-events-map';
const SINGLE_EVENT_MAP_CONTAINER_CLASS /** @type {string} */ = 'single-event-map';
const FUTURE_EVENTS_ENDPOINT /** @type {string} */
    = 'future_events_sample.json';
const MAPS_KEY = 'AIzaSyBtrkN2c8rrSWUdy6-SKqp8stjYBVb3by8';

const SEARCH_BOX_ID = 'events-map-search-box';
const RESULTS_CONTAINER_ID = 'search-results-container';

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
    const futureEventMapsContainers = document.getElementsByClassName(FUTURE_EVENT_MAP_CONTAINER_CLASS);
    futureEventMapsContainers[0].classList.remove('map-container--loading');
    const searchMap = new google.maps.Map(futureEventMapsContainers[0], {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 5,
        disableDefaultUI: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
        }
    });

    const searchBox = document.getElementById(SEARCH_BOX_ID);

    const filterCircle = new google.maps.Circle({
        strokeColor: '#006747',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#006747',
        fillOpacity: 0.1,
        radius: 80000
    });

    populateMap(searchMap).then(markers => {
        if (searchBox && futureEventMapsContainers[0]) {
            searchBox.addEventListener('change', inputBox => {
                handleSearchInput(inputBox.target.value, searchMap, filterCircle, markers)
                    .then(resultsFromMarkers).then(resultsList => {
                        console.log(resultsList);
                        const resultsListContainer = document.getElementById(RESULTS_CONTAINER_ID);
                        resultsListContainer.innerHTML = '';
                        resultsListContainer.appendChild(resultsList);
                    });
            });
        }
    });

    const eventMapContainer = document.getElementsByClassName(SINGLE_EVENT_MAP_CONTAINER_CLASS);
    eventMaps = Array.from(eventMapContainer).map(container => {
        container.classList.remove('map-container--loading');
        const coords = { lat: +container.dataset.lat, lng: +container.dataset.lng };
        const map = new google.maps.Map(container, {
            center: coords,
            zoom: 5,
            disableDefaultUI: true,
            clickableIcons: false,
            disableDoubleClickZoom: true,
            draggable: false,
            scrollwheel: false
        });
        const marker = new google.maps.Marker({
            position: coords,
            map: map
        });
        showAllMarkers(map, [marker]);
        return map;
    });
}


/**
 * Load the data and then populate the maps with that data.
 * @param {google.maps.Map} map The maps to load data into.
 * @return {Promise}
 */
function populateMap(map) {
    return new Promise((res, rej) => {
        getJSON(FUTURE_EVENTS_ENDPOINT).then(events => {
            const markers = eventsToMarkers(events, map);
            showAllMarkers(map, markers);
            res(markers);
        }).catch(err => {
            console.trace(err);
            map.getDiv().classList.add('map-container--error');
            rej(err);
        });
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

        marker.eventTime = `${event.date | 'soon'} at ${event.time | 'some time'}`;

        marker.addListener('click', marker => {
            window.location.href = `view-event?eventID=${event.EventID}`;
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
    if (markers.length > 1) {
        markers.forEach(marker => {
            bounds.extend(marker.position);
        });
        map.fitBounds(bounds);
    } else {
        map.panTo(markers[0].position);
    }
}


/**
 * @param {*} potentialAddress The input, which potentially coresponds to a place.
 * @return {Promise<{number, number, string}>}
 */
function geoCodeAddress(potentialAddress) {
    const escaped = encodeURIComponent(potentialAddress);
    return new Promise((res, rej) => {
        getJSON(`https://maps.googleapis.com/maps/api/geocode/json?address=${escaped}&key=${MAPS_KEY}&region=us`).then(response => {
            if (response.status === 'OK') {
                res({
                    lat: response.results[0].geometry.location.lat,
                    lng: response.results[0].geometry.location.lng,
                    nice: response.results[0].formatted_address
                });
            } else {
                rej(response.status);
            }
        }).catch(rej);
    });
}

/**
 * Handle the input on key up.
 * @param {string} input The string input.
 * @param {google.maps.Map} map The map to filter.
 * @param {google.maps.Circle} circle The circle to draw.
 * @param {google.maps.Marker[]} markers The markers to filter.
 * @return {Promise}
 */
function handleSearchInput(input, map, circle, markers) {
    return new Promise((res, rej) => {
        geoCodeAddress(input).then(result => {
            const shownMarkers = [];
            // Technically should work even though it has an extra field
            circle.setCenter({ lat: result.lat, lng: result.lng });
            circle.setMap(map);
            map.fitBounds(circle.getBounds());
            map.setZoom(map.zoom - 1);
            markers.forEach(marker => {
                if (!isInCircle(marker, circle)) {
                    marker.setOpacity(0.3);
                } else {
                    marker.setOpacity(1);
                    shownMarkers.push(marker);
                }
            });
            res(shownMarkers);
        }).catch(err => {
            circle.setMap(null);
            markers.forEach(marker => marker.setOpacity(1));
        });
    });
}

/**
 * Check if the marker is within the circle.
 * @param {google.maps.Marker} marker The marker to check.
 * @param {google.maps.Circle} circle The circle to check bounds of.
 * @return {boolean}
 */
function isInCircle(marker, circle) {
    return google.maps.geometry.spherical.computeDistanceBetween(marker.getPosition(), circle.getCenter()) <= circle.getRadius();
}

/**
 * Build results list from markers.
 * @param {google.maps.Marker[]} markers
 * @return {HTMLElement}
 */
function resultsFromMarkers(markers) {
    const container = document.createElement('div');
    if (markers.length === 0) {
        const errorTextHolder = document.createElement('span');
        const errorText = document.createTextNode('No results found.');
        errorTextHolder.appendChild(errorText);
        errorTextHolder.classList.add('error-message');
        container.append(errorTextHolder);
        return container;
    }
    container.classList.add('filter-list');
    markers.forEach(marker => {
        const listItem = document.createElement('div');
        listItem.classList.add('filter-list__item');
        listItem.classList.add('up--1');
        const itemHeading = document.createElement('h3');
        itemHeading.classList.add('section-heading');
        const itemName = document.createTextNode(marker.getTitle());
        itemHeading.appendChild(itemName);
        const itemTime = document.createElement('span');
        const timeText = document.createTextNode(marker.eventTime);
        itemTime.appendChild(timeText);
        itemTime.classList.add('bold');
        listItem.appendChild(itemHeading);
        listItem.appendChild(itemTime);
        container.appendChild(listItem);
    });
    return container;
}
