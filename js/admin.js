// Admin Panel Application
class AdminApp {
    constructor() {
        this.currentEditId = null;
        this.filteredData = [];
    }

    // Initialize admin panel
    async initialize() {
        try {
            // Initialize data manager
            await window.dataManager.initialize();

            // Setup event listeners
            this.setupEventListeners();

            // Load and display data
            this.loadData();

            // Update stats
            this.updateStats();

            // Setup theme toggle
            this.setupThemeToggle();

            console.log('Admin panel initialized');
        } catch (error) {
            console.error('Error initializing admin panel:', error);
            alert('Ett fel uppstod vid laddning av admin-panelen.');
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Add new button
        document.getElementById('addNewBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Import CSV button
        document.getElementById('importCSVBtn').addEventListener('click', () => {
            this.importCSV();
        });

        // Export CSV button
        document.getElementById('exportCSVBtn').addEventListener('click', () => {
            window.dataManager.exportToCSV();
        });

        // Clear data button
        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.clearData();
        });

        // Modal close
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        // Modal click outside to close
        document.getElementById('exchangeModal').addEventListener('click', (e) => {
            if (e.target.id === 'exchangeModal') {
                this.closeModal();
            }
        });

        // Form submit
        document.getElementById('exchangeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveExchange();
        });

        // Search
        const searchInput = document.getElementById('adminSearchInput');
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.filterData();
            }, 300);
        });

        // Category filter
        document.getElementById('adminCategoryFilter').addEventListener('change', () => {
            this.filterData();
        });
    }

    // Setup theme toggle
    setupThemeToggle() {
        const button = document.getElementById('themeToggle');
        const icon = button.querySelector('.theme-icon');

        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            icon.textContent = '☀️';
        }

        button.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');

            if (document.body.classList.contains('dark-theme')) {
                icon.textContent = '☀️';
                localStorage.setItem('theme', 'dark');
            } else {
                icon.textContent = '🌙';
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Load and display data
    loadData() {
        const exchanges = window.dataManager.getExchanges();
        this.filteredData = exchanges;
        this.renderTable(exchanges);
    }

    // Filter data based on search and category
    filterData() {
        const searchQuery = document.getElementById('adminSearchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('adminCategoryFilter').value;

        let filtered = window.dataManager.getExchanges();

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(e =>
                e.destination.toLowerCase().includes(searchQuery) ||
                e.activity.toLowerCase().includes(searchQuery) ||
                e.course.toLowerCase().includes(searchQuery) ||
                e.school.toLowerCase().includes(searchQuery)
            );
        }

        // Apply category filter
        if (categoryFilter) {
            filtered = filtered.filter(e => e.category === categoryFilter);
        }

        this.filteredData = filtered;
        this.renderTable(filtered);
    }

    // Render data table
    renderTable(exchanges) {
        const tbody = document.getElementById('dataTableBody');

        if (exchanges.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">Inga utbyten hittades</td></tr>';
            return;
        }

        tbody.innerHTML = exchanges.map(exchange => `
            <tr>
                <td>${exchange.id}</td>
                <td>${exchange.destination}</td>
                <td>${exchange.activity}</td>
                <td>${exchange.course || '-'}</td>
                <td>${exchange.school}</td>
                <td>
                    <span class="category-badge ${exchange.category.toLowerCase()}">
                        ${exchange.category}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn edit" onclick="adminApp.editExchange(${exchange.id})" title="Redigera">
                            ✏️
                        </button>
                        <button class="icon-btn delete" onclick="adminApp.deleteExchange(${exchange.id})" title="Ta bort">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Update statistics
    updateStats() {
        const stats = window.dataManager.getStats();

        document.getElementById('adminTotalCount').textContent = stats.total;
        document.getElementById('adminErasmusCount').textContent = stats.byCategory['Erasmus'] || 0;
        document.getElementById('adminNordplusCount').textContent = stats.byCategory['Nordplus'] || 0;
        document.getElementById('adminTCACount').textContent = stats.byCategory['TCA'] || 0;
        document.getElementById('adminAtlasCount').textContent = stats.byCategory['Atlas'] || 0;
    }

    // Open modal for add/edit
    openModal(exchange = null) {
        const modal = document.getElementById('exchangeModal');
        const form = document.getElementById('exchangeForm');
        const title = document.getElementById('modalTitle');

        if (exchange) {
            // Edit mode
            title.textContent = 'Redigera utbyte';
            document.getElementById('exchangeId').value = exchange.id;
            document.getElementById('destination').value = exchange.destination;
            document.getElementById('activity').value = exchange.activity;
            document.getElementById('course').value = exchange.course;
            document.getElementById('school').value = exchange.school;
            document.getElementById('category').value = exchange.category;
            this.currentEditId = exchange.id;
        } else {
            // Add mode
            title.textContent = 'Lägg till utbyte';
            form.reset();
            this.currentEditId = null;
        }

        modal.classList.add('show');
    }

    // Close modal
    closeModal() {
        const modal = document.getElementById('exchangeModal');
        modal.classList.remove('show');
        this.currentEditId = null;
    }

    // Save exchange (add or update)
    async saveExchange() {
        const exchange = {
            destination: document.getElementById('destination').value.trim(),
            activity: document.getElementById('activity').value,
            course: document.getElementById('course').value.trim(),
            school: document.getElementById('school').value.trim(),
            category: document.getElementById('category').value
        };

        // Validate
        if (!exchange.destination || !exchange.activity || !exchange.school || !exchange.category) {
            alert('Vänligen fyll i alla obligatoriska fält (markerade med *)');
            return;
        }

        try {
            if (this.currentEditId) {
                // Update existing
                window.dataManager.updateExchange(this.currentEditId, exchange);
            } else {
                // Add new
                window.dataManager.addExchange(exchange);

                // Try to geocode the new destination
                const coords = await window.geocoding.getCoordinates(exchange.destination);
                if (coords) {
                    window.dataManager.coordinates[exchange.destination] = coords;
                    window.dataManager.saveToLocalStorage();
                }
            }

            // Reload data and close modal
            this.loadData();
            this.updateStats();
            this.closeModal();

            alert(this.currentEditId ? 'Utbyte uppdaterat!' : 'Utbyte tillagt!');
        } catch (error) {
            console.error('Error saving exchange:', error);
            alert('Ett fel uppstod vid sparande.');
        }
    }

    // Edit exchange
    editExchange(id) {
        const exchange = window.dataManager.getExchanges().find(e => e.id === id);
        if (exchange) {
            this.openModal(exchange);
        }
    }

    // Delete exchange
    deleteExchange(id) {
        if (confirm('Är du säker på att du vill ta bort detta utbyte?')) {
            window.dataManager.deleteExchange(id);
            this.loadData();
            this.updateStats();
        }
    }

    // Import CSV
    importCSV() {
        const fileInput = document.getElementById('csvFileInput');

        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            Papa.parse(file, {
                header: true,
                delimiter: ';',
                skipEmptyLines: true,
                complete: async (results) => {
                    try {
                        const newExchanges = results.data
                            .filter(row => row.Destination && row.Destination.trim() !== '')
                            .map(row => ({
                                destination: row.Destination?.trim() || '',
                                activity: row.Aktivitet?.trim() || '',
                                course: row['Kurs/besökande skola']?.trim() || '',
                                school: row.Enhet?.trim() || '',
                                category: row['']?.trim() || 'Okänd'
                            }));

                        if (newExchanges.length === 0) {
                            alert('Inga giltiga utbyten hittades i filen.');
                            return;
                        }

                        if (confirm(`Vill du importera ${newExchanges.length} utbyten? Detta kommer lägga till dem till befintlig data.`)) {
                            // Add all exchanges
                            for (const exchange of newExchanges) {
                                window.dataManager.addExchange(exchange);
                            }

                            // Geocode new destinations
                            const destinations = [...new Set(newExchanges.map(e => e.destination))];
                            for (const dest of destinations) {
                                if (!window.dataManager.coordinates[dest]) {
                                    const coords = await window.geocoding.getCoordinates(dest);
                                    window.dataManager.coordinates[dest] = coords;
                                }
                            }

                            window.dataManager.saveToLocalStorage();
                            this.loadData();
                            this.updateStats();

                            alert(`${newExchanges.length} utbyten importerade!`);
                        }
                    } catch (error) {
                        console.error('Error importing CSV:', error);
                        alert('Ett fel uppstod vid import av CSV.');
                    }

                    // Reset file input
                    fileInput.value = '';
                },
                error: (error) => {
                    console.error('Error parsing CSV:', error);
                    alert('Ett fel uppstod vid läsning av CSV-filen.');
                    fileInput.value = '';
                }
            });
        };

        fileInput.click();
    }

    // Clear all data
    clearData() {
        if (confirm('Är du säker på att du vill ta bort ALL data? Detta kan inte ångras!')) {
            if (confirm('SISTA VARNINGEN: Är du verkligen säker? All data kommer försvinna!')) {
                localStorage.removeItem('exchanges');
                localStorage.removeItem('coordinates');
                window.dataManager.exchanges = [];
                window.dataManager.coordinates = {};
                this.loadData();
                this.updateStats();
                alert('All data har tagits bort. Ladda om sidan för att återställa från CSV.');
            }
        }
    }
}

// Initialize admin app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const adminApp = new AdminApp();
    adminApp.initialize();

    // Make app globally available
    window.adminApp = adminApp;
});
