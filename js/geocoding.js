// Geocoding utilities and cache
const geocodingCache = new Map();

// Manual coordinates for common locations (for faster loading and accuracy)
const manualCoordinates = {
    'Elda, Spanien': [38.4783, -0.7972],
    'Bryssel, Belgien': [50.8503, 4.3517],
    'Barcelona, Spanien': [41.3874, 2.1686],
    'Dublin, Irland': [53.3498, -6.2603],
    'Hannover, Tyskland': [52.3759, 9.7320],
    'Florens, Italien': [43.7696, 11.2558],
    'Florence, Italien': [43.7696, 11.2558],
    'Dabrowa, Polen': [50.3252, 19.1832],
    'Martorell, Spanien': [41.4729, 1.9269],
    'Porto, Portugal': [41.1579, -8.6291],
    'Tallin, Estland': [59.4370, 24.7536],
    'Nice, Frankrike': [43.7102, 7.2620],
    'Aten, Grekland': [37.9838, 23.7275],
    'Kaunas, Litauen': [54.8985, 23.9036],
    'Split, Kroatien': [43.5081, 16.4402],
    'Amsterdam, Nederländerna': [52.3676, 4.9041],
    'Madiera, Portugal': [32.7607, -16.9595],
    'Budapest, Ungern': [47.4979, 19.0402],
    'Bergen, Norge': [60.3913, 5.3221],
    'Kuopio, Finland': [62.8924, 27.6782],
    'Zagreb, Kroatien': [45.8150, 15.9819],
    'Essen, Tyskland': [51.4556, 7.0116],
    'Madrid, Spanien': [40.4168, -3.7038],
    'Thessaloniki, Grekland': [40.6401, 22.9444],
    'Salon de Provence, Frankrike': [43.6402, 5.0979],
    'Teneriffa, Spanien': [28.2916, -16.6291],
    'Spanien, Teneriffa': [28.2916, -16.6291],
    'Bergues, Frankrike': [50.9686, 2.4369],
    'Wien, Österrike': [48.2082, 16.3738],
    'Hankasalmi, Finland': [62.3886, 26.4331],
    'Murcia, Spanien': [37.9922, -1.1307],
    'Murica, Spanien': [37.9922, -1.1307],
    'Kalamata, Grekland': [37.0391, 22.1142],
    'Sönderborg, Danmark': [54.9094, 9.7922],
    'Maroussi, Grekland': [38.0565, 23.8078],
    'Stellenbosch, Sydafrika': [-33.9321, 18.8602],
    'Siglufjörður, Islandia': [66.1500, -18.9167],
    'Reykjavík, Island': [64.1466, -21.9426],
    'Akureyri, Island': [65.6835, -18.1086],
    'Luxemburg': [49.6116, 6.1319],
    'Mikkeli, Finland': [61.6875, 27.2721],
    'Stockholm, Sverige': [59.3293, 18.0686],
    'Tenhultskolan, Sverige': [57.4403, 14.0636]
};

// Function to get coordinates for a destination
async function getCoordinates(destination) {
    // Check manual coordinates first
    if (manualCoordinates[destination]) {
        return manualCoordinates[destination];
    }

    // Check cache
    if (geocodingCache.has(destination)) {
        return geocodingCache.get(destination);
    }

    // Try to geocode using Nominatim
    try {
        const cleanDest = destination.replace(/\s*;.*$/, '').trim();
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanDest)}&limit=1`,
            {
                headers: {
                    'User-Agent': 'InternationalExchangeMap/1.0'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Geocoding failed');
        }

        const data = await response.json();

        if (data && data.length > 0) {
            const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            geocodingCache.set(destination, coords);
            return coords;
        }
    } catch (error) {
        console.warn(`Could not geocode: ${destination}`, error);
    }

    // Default to center of Europe if geocoding fails
    return [50.0, 10.0];
}

// Function to geocode all destinations with rate limiting
async function geocodeAllDestinations(destinations) {
    const results = {};
    const uniqueDestinations = [...new Set(destinations)];

    for (let i = 0; i < uniqueDestinations.length; i++) {
        const dest = uniqueDestinations[i];

        if (!dest || dest.trim() === '') continue;

        results[dest] = await getCoordinates(dest);

        // Rate limiting: wait 1 second between requests (Nominatim requirement)
        if (i < uniqueDestinations.length - 1 && !manualCoordinates[dest]) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return results;
}

// Export functions
window.geocoding = {
    getCoordinates,
    geocodeAllDestinations,
    manualCoordinates
};
