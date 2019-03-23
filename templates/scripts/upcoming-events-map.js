/**
 * Initialize and setup upcoming events Google Maps widgets.
 */

const CONTAINER_CLASS = 'upcoming-events-map';

/**
 * Initialize all instances of `.upcoming-events-map` with Google Maps.
 */
function initMaps() {
    const mapContainers = document.getElementsByClassName(CONTAINER_CLASS);

    Array.from(mapContainers).forEach(container => {
        new google.maps.Map(container, {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 5
        });
    });
}
