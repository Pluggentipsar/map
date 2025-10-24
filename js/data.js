// Data management module
class DataManager {
    constructor() {
        this.exchanges = [];
        this.coordinates = {};
        this.initialized = false;
    }

    // Load data from CSV file
    async loadFromCSV() {
        return new Promise((resolve, reject) => {
            Papa.parse('Utbyten.csv', {
                download: true,
                header: true,
                delimiter: ';',
                skipEmptyLines: true,
                complete: async (results) => {
                    try {
                        // Process CSV data
                        const rawData = results.data;
                        console.log('Loaded CSV rows:', rawData.length);

                        // Clean and structure the data
                        this.exchanges = rawData
                            .filter(row => row.Destination && row.Destination.trim() !== '')
                            .map((row, index) => ({
                                id: index + 1,
                                destination: row.Destination?.trim() || '',
                                activity: row.Aktivitet?.trim() || '',
                                course: row['Kurs/besökande skola']?.trim() || '',
                                school: row.Enhet?.trim() || '',
                                category: row['']?.trim() || 'Okänd' // Last column with category
                            }));

                        console.log('Processed exchanges:', this.exchanges.length);

                        // Get all unique destinations
                        const destinations = [...new Set(this.exchanges.map(e => e.destination))];

                        // Geocode all destinations
                        console.log('Geocoding destinations...');
                        this.coordinates = await window.geocoding.geocodeAllDestinations(destinations);

                        // Save to localStorage
                        this.saveToLocalStorage();

                        this.initialized = true;
                        resolve(this.exchanges);
                    } catch (error) {
                        console.error('Error processing CSV:', error);
                        reject(error);
                    }
                },
                error: (error) => {
                    console.error('Error loading CSV:', error);
                    reject(error);
                }
            });
        });
    }

    // Save data to localStorage
    saveToLocalStorage() {
        try {
            localStorage.setItem('exchanges', JSON.stringify(this.exchanges));
            localStorage.setItem('coordinates', JSON.stringify(this.coordinates));
            console.log('Data saved to localStorage');
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    // Load data from localStorage
    loadFromLocalStorage() {
        try {
            const exchanges = localStorage.getItem('exchanges');
            const coordinates = localStorage.getItem('coordinates');

            if (exchanges && coordinates) {
                this.exchanges = JSON.parse(exchanges);
                this.coordinates = JSON.parse(coordinates);
                this.initialized = true;
                console.log('Data loaded from localStorage');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return false;
        }
    }

    // Initialize data (try localStorage first, then CSV)
    async initialize() {
        if (this.initialized) {
            return this.exchanges;
        }

        // Try loading from localStorage first
        if (this.loadFromLocalStorage()) {
            return this.exchanges;
        }

        // If not in localStorage, load from CSV
        return await this.loadFromCSV();
    }

    // Get all exchanges
    getExchanges() {
        return this.exchanges;
    }

    // Get coordinates for a destination
    getCoordinates(destination) {
        return this.coordinates[destination] || [50.0, 10.0];
    }

    // Add new exchange
    addExchange(exchange) {
        const newExchange = {
            id: this.exchanges.length + 1,
            ...exchange
        };
        this.exchanges.push(newExchange);
        this.saveToLocalStorage();
        return newExchange;
    }

    // Update exchange
    updateExchange(id, updates) {
        const index = this.exchanges.findIndex(e => e.id === id);
        if (index !== -1) {
            this.exchanges[index] = { ...this.exchanges[index], ...updates };
            this.saveToLocalStorage();
            return this.exchanges[index];
        }
        return null;
    }

    // Delete exchange
    deleteExchange(id) {
        const index = this.exchanges.findIndex(e => e.id === id);
        if (index !== -1) {
            this.exchanges.splice(index, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // Get unique values for filters
    getUniqueActivities() {
        return [...new Set(this.exchanges.map(e => e.activity))].filter(a => a).sort();
    }

    getUniqueSchools() {
        return [...new Set(this.exchanges.map(e => e.school))].filter(s => s).sort();
    }

    getUniqueCategories() {
        return [...new Set(this.exchanges.map(e => e.category))].filter(c => c).sort();
    }

    // Get statistics
    getStats() {
        return {
            total: this.exchanges.length,
            countries: new Set(this.exchanges.map(e => e.destination.split(',')[1]?.trim())).size,
            byCategory: this.exchanges.reduce((acc, e) => {
                acc[e.category] = (acc[e.category] || 0) + 1;
                return acc;
            }, {})
        };
    }

    // Search exchanges
    search(query) {
        if (!query) return this.exchanges;

        const lowerQuery = query.toLowerCase();
        return this.exchanges.filter(e =>
            e.destination.toLowerCase().includes(lowerQuery) ||
            e.activity.toLowerCase().includes(lowerQuery) ||
            e.course.toLowerCase().includes(lowerQuery) ||
            e.school.toLowerCase().includes(lowerQuery)
        );
    }

    // Filter exchanges
    filter(filters) {
        let filtered = this.exchanges;

        if (filters.categories && filters.categories.length > 0) {
            filtered = filtered.filter(e => filters.categories.includes(e.category));
        }

        if (filters.activity) {
            filtered = filtered.filter(e => e.activity === filters.activity);
        }

        if (filters.school) {
            filtered = filtered.filter(e => e.school === filters.school);
        }

        if (filters.search) {
            const query = filters.search.toLowerCase();
            filtered = filtered.filter(e =>
                e.destination.toLowerCase().includes(query) ||
                e.activity.toLowerCase().includes(query) ||
                e.course.toLowerCase().includes(query) ||
                e.school.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    // Export to CSV
    exportToCSV() {
        const csv = Papa.unparse({
            fields: ['Destination', 'Aktivitet', 'Kurs/besökande skola', 'Enhet', ''],
            data: this.exchanges.map(e => [
                e.destination,
                e.activity,
                e.course,
                e.school,
                e.category
            ])
        }, {
            delimiter: ';'
        });

        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'utbyten_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Create global instance
window.dataManager = new DataManager();
