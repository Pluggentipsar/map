// Main map application
class MapApp {
    constructor() {
        this.map = null;
        this.markers = [];
        this.markerLayer = null;
    }

    // Initialize the application
    async initialize() {
        try {
            // Show loading
            this.showLoading();

            // Initialize data
            await window.dataManager.initialize();

            // Initialize map
            this.initializeMap();

            // Initialize filters
            window.filterManager.initialize();

            // Add all markers
            this.updateMarkers(window.dataManager.getExchanges());

            // Update stats
            window.filterManager.updateStats(window.dataManager.getExchanges());

            // Listen for filter changes
            window.filterManager.onChange((filters) => {
                const filtered = window.dataManager.filter(filters);
                this.updateMarkers(filtered);
                window.filterManager.updateStats(filtered);
            });

            // Hide loading
            this.hideLoading();

            console.log('Map application initialized successfully');
        } catch (error) {
            console.error('Error initializing map application:', error);
            this.showError('Ett fel uppstod vid laddning av kartan. Vänligen ladda om sidan.');
        }
    }

    // Initialize Leaflet map
    initializeMap() {
        // Create map centered on Europe
        this.map = L.map('map').setView([54.5, 15.0], 4);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
            minZoom: 3
        }).addTo(this.map);

        // Create marker layer group
        this.markerLayer = L.layerGroup().addTo(this.map);
    }

    // Get marker color based on category
    getMarkerColor(category) {
        const colors = {
            'Erasmus': '#3b82f6',
            'Nordplus': '#10b981',
            'TCA': '#f97316',
            'Atlas': '#ef4444'
        };
        return colors[category] || '#6b7280';
    }

    // Create custom marker icon
    createMarkerIcon(category) {
        const color = this.getMarkerColor(category);

        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="
                background-color: ${color};
                width: 25px;
                height: 25px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [25, 25],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
        });
    }

    // Create popup content
    createPopupContent(exchange) {
        const categoryClass = exchange.category.toLowerCase().replace(/\s+/g, '-');

        return `
            <div class="popup-header">
                ${exchange.destination}
            </div>
            <div class="popup-content">
                <div class="popup-row">
                    <span class="popup-label">Aktivitet:</span>
                    <span class="popup-value">${exchange.activity || 'Ej angiven'}</span>
                </div>
                <div class="popup-row">
                    <span class="popup-label">Kurs:</span>
                    <span class="popup-value">${exchange.course || 'Ej angiven'}</span>
                </div>
                <div class="popup-row">
                    <span class="popup-label">Skola:</span>
                    <span class="popup-value">${exchange.school || 'Ej angiven'}</span>
                </div>
            </div>
            <div class="popup-badge ${categoryClass}">${exchange.category}</div>
        `;
    }

    // Group exchanges by location
    groupByLocation(exchanges) {
        const groups = {};

        exchanges.forEach(exchange => {
            const dest = exchange.destination;
            if (!groups[dest]) {
                groups[dest] = [];
            }
            groups[dest].push(exchange);
        });

        return groups;
    }

    // Create popup content for multiple exchanges at same location
    createGroupedPopupContent(exchanges) {
        const destination = exchanges[0].destination;
        const categoryClass = exchanges[0].category.toLowerCase().replace(/\s+/g, '-');

        let content = `
            <div class="popup-header">
                ${destination}
                <span style="font-size: 0.9rem; color: var(--text-secondary); margin-left: 8px;">
                    (${exchanges.length} utbyten)
                </span>
            </div>
        `;

        exchanges.forEach((exchange, index) => {
            content += `
                <div class="popup-content" style="margin-bottom: ${index < exchanges.length - 1 ? '12px' : '0'};
                     padding-bottom: ${index < exchanges.length - 1 ? '12px' : '0'};
                     border-bottom: ${index < exchanges.length - 1 ? '1px solid var(--border)' : 'none'};">
                    <div class="popup-row">
                        <span class="popup-label">Aktivitet:</span>
                        <span class="popup-value">${exchange.activity || 'Ej angiven'}</span>
                    </div>
                    <div class="popup-row">
                        <span class="popup-label">Kurs:</span>
                        <span class="popup-value">${exchange.course || 'Ej angiven'}</span>
                    </div>
                    <div class="popup-row">
                        <span class="popup-label">Skola:</span>
                        <span class="popup-value">${exchange.school || 'Ej angiven'}</span>
                    </div>
                    <div class="popup-badge ${categoryClass}">${exchange.category}</div>
                </div>
            `;
        });

        return content;
    }

    // Update markers on map
    updateMarkers(exchanges) {
        // Clear existing markers
        this.markerLayer.clearLayers();
        this.markers = [];

        // Group exchanges by location
        const groups = this.groupByLocation(exchanges);

        // Add markers for each location
        Object.entries(groups).forEach(([destination, exchangeGroup]) => {
            const coords = window.dataManager.getCoordinates(destination);

            if (!coords || coords[0] === 50.0 && coords[1] === 10.0) {
                console.warn(`No coordinates for: ${destination}`);
                return;
            }

            // Use the category of the first exchange for marker color
            const icon = this.createMarkerIcon(exchangeGroup[0].category);

            const marker = L.marker(coords, { icon })
                .bindPopup(this.createGroupedPopupContent(exchangeGroup), {
                    maxWidth: 350,
                    className: 'custom-popup'
                });

            this.markerLayer.addLayer(marker);
            this.markers.push(marker);
        });

        console.log(`Updated map with ${this.markers.length} markers for ${exchanges.length} exchanges`);
    }

    // Show loading indicator
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.remove('hidden');
        }
    }

    // Hide loading indicator
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }

    // Show error message
    showError(message) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = `
                <div style="color: var(--danger); font-weight: 600;">
                    ❌ ${message}
                </div>
            `;
        }
    }

    // Fly to a specific location
    flyToLocation(destination) {
        const coords = window.dataManager.getCoordinates(destination);
        if (coords) {
            this.map.flyTo(coords, 10, {
                duration: 1.5
            });

            // Find and open the marker popup
            const marker = this.markers.find(m => {
                const pos = m.getLatLng();
                return pos.lat === coords[0] && pos.lng === coords[1];
            });

            if (marker) {
                setTimeout(() => marker.openPopup(), 1000);
            }
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new MapApp();
    app.initialize();

    // Make app globally available
    window.mapApp = app;
});
