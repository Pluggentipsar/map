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

    // Get marker color and glow based on category
    getMarkerColor(category) {
        const colors = {
            'Erasmus': {
                color: '#6366f1',
                glow: 'rgba(99, 102, 241, 0.6)',
                gradient: 'linear-gradient(135deg, #6366f1, #818cf8)'
            },
            'Nordplus': {
                color: '#10b981',
                glow: 'rgba(16, 185, 129, 0.6)',
                gradient: 'linear-gradient(135deg, #10b981, #34d399)'
            },
            'TCA': {
                color: '#f59e0b',
                glow: 'rgba(245, 158, 11, 0.6)',
                gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)'
            },
            'Atlas': {
                color: '#ef4444',
                glow: 'rgba(239, 68, 68, 0.6)',
                gradient: 'linear-gradient(135deg, #ef4444, #f87171)'
            }
        };
        return colors[category] || {
            color: '#6b7280',
            glow: 'rgba(107, 114, 128, 0.6)',
            gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)'
        };
    }

    // Create custom marker icon with enhanced glow effect
    createMarkerIcon(category) {
        const { color, glow, gradient } = this.getMarkerColor(category);

        return L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div style="
                    position: relative;
                    width: 32px;
                    height: 32px;
                ">
                    <!-- Glow effect -->
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 40px;
                        height: 40px;
                        background: ${glow};
                        border-radius: 50%;
                        filter: blur(8px);
                        animation: pulse-glow 2s ease-in-out infinite;
                    "></div>

                    <!-- Main marker -->
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: ${gradient};
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow:
                            0 0 0 2px ${color}20,
                            0 4px 16px ${glow},
                            0 2px 8px rgba(0,0,0,0.3);
                        cursor: pointer;
                        transition: all 0.3s ease;
                    "></div>

                    <!-- Center dot -->
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 10px;
                        height: 10px;
                        background: white;
                        border-radius: 50%;
                        opacity: 0.9;
                    "></div>
                </div>

                <style>
                    @keyframes pulse-glow {
                        0%, 100% {
                            opacity: 0.6;
                            transform: translate(-50%, -50%) scale(1);
                        }
                        50% {
                            opacity: 0.9;
                            transform: translate(-50%, -50%) scale(1.1);
                        }
                    }
                </style>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
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
                    <span class="popup-label">Skola:</span>
                    <span class="popup-value">${exchange.school || 'Ej angiven'}</span>
                </div>
                <div class="popup-row">
                    <span class="popup-label">Kurs:</span>
                    <span class="popup-value">${exchange.course || 'Ej angiven'}</span>
                </div>
                <div class="popup-row">
                    <span class="popup-label">Aktivitet:</span>
                    <span class="popup-value">${exchange.activity || 'Ej angiven'}</span>
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

        let content = `
            <div class="popup-header">
                ${destination}
                <span style="font-size: 0.9rem; color: var(--text-secondary); margin-left: 8px; font-weight: 600;">
                    (${exchanges.length} utbyte${exchanges.length > 1 ? 'n' : ''})
                </span>
            </div>
            <div class="popup-scroll-container">
        `;

        exchanges.forEach((exchange, index) => {
            const categoryClass = exchange.category.toLowerCase().replace(/\s+/g, '-');

            content += `
                <div class="popup-item" style="
                    margin-bottom: ${index < exchanges.length - 1 ? '1rem' : '0'};
                    padding-bottom: ${index < exchanges.length - 1 ? '1rem' : '0'};
                    border-bottom: ${index < exchanges.length - 1 ? '1px solid var(--border)' : 'none'};
                ">
                    <div class="popup-content">
                        <div class="popup-row">
                            <span class="popup-label">Skola:</span>
                            <span class="popup-value">${exchange.school || 'Ej angiven'}</span>
                        </div>
                        <div class="popup-row">
                            <span class="popup-label">Kurs:</span>
                            <span class="popup-value">${exchange.course || 'Ej angiven'}</span>
                        </div>
                        <div class="popup-row">
                            <span class="popup-label">Aktivitet:</span>
                            <span class="popup-value">${exchange.activity || 'Ej angiven'}</span>
                        </div>
                    </div>
                    <div class="popup-badge ${categoryClass}" style="margin-top: 0.5rem;">${exchange.category}</div>
                </div>
            `;
        });

        content += `</div>`;

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
