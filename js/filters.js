// Filter management module
class FilterManager {
    constructor() {
        this.activeFilters = {
            categories: ['Erasmus', 'Nordplus', 'TCA', 'Atlas'],
            activity: '',
            school: '',
            search: ''
        };
        this.listeners = [];
    }

    // Initialize filter UI
    initialize() {
        this.setupCategoryFilters();
        this.setupActivityFilter();
        this.setupSchoolFilter();
        this.setupSearchFilter();
        this.setupResetButton();
        this.setupThemeToggle();
    }

    // Setup category checkboxes
    setupCategoryFilters() {
        const checkboxes = document.querySelectorAll('.filter-checkbox input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const category = e.target.value;

                if (e.target.checked) {
                    if (!this.activeFilters.categories.includes(category)) {
                        this.activeFilters.categories.push(category);
                    }
                } else {
                    this.activeFilters.categories = this.activeFilters.categories.filter(c => c !== category);
                }

                this.notifyChange();
            });
        });
    }

    // Setup activity filter
    setupActivityFilter() {
        const select = document.getElementById('activityFilter');

        // Populate options
        const activities = window.dataManager.getUniqueActivities();
        activities.forEach(activity => {
            const option = document.createElement('option');
            option.value = activity;
            option.textContent = activity;
            select.appendChild(option);
        });

        // Add change listener
        select.addEventListener('change', (e) => {
            this.activeFilters.activity = e.target.value;
            this.notifyChange();
        });
    }

    // Setup school filter
    setupSchoolFilter() {
        const select = document.getElementById('schoolFilter');

        // Populate options
        const schools = window.dataManager.getUniqueSchools();
        schools.forEach(school => {
            const option = document.createElement('option');
            option.value = school;
            option.textContent = school;
            select.appendChild(option);
        });

        // Add change listener
        select.addEventListener('change', (e) => {
            this.activeFilters.school = e.target.value;
            this.notifyChange();
        });
    }

    // Setup search filter
    setupSearchFilter() {
        const input = document.getElementById('searchInput');

        let debounceTimer;
        input.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.activeFilters.search = e.target.value;
                this.notifyChange();
            }, 300);
        });
    }

    // Setup reset button
    setupResetButton() {
        const button = document.getElementById('resetFilters');

        button.addEventListener('click', () => {
            // Reset all filters
            this.activeFilters = {
                categories: ['Erasmus', 'Nordplus', 'TCA', 'Atlas'],
                activity: '',
                school: '',
                search: ''
            };

            // Reset UI
            document.querySelectorAll('.filter-checkbox input[type="checkbox"]').forEach(cb => {
                cb.checked = true;
            });
            document.getElementById('activityFilter').value = '';
            document.getElementById('schoolFilter').value = '';
            document.getElementById('searchInput').value = '';

            this.notifyChange();
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

    // Get current filters
    getFilters() {
        return { ...this.activeFilters };
    }

    // Add change listener
    onChange(callback) {
        this.listeners.push(callback);
    }

    // Notify all listeners
    notifyChange() {
        this.listeners.forEach(callback => callback(this.activeFilters));
    }

    // Update stats display
    updateStats(exchanges) {
        const stats = {
            total: exchanges.length,
            countries: new Set(exchanges.map(e => e.destination.split(',')[1]?.trim())).size,
            byCategory: exchanges.reduce((acc, e) => {
                acc[e.category] = (acc[e.category] || 0) + 1;
                return acc;
            }, {})
        };

        // Update total count
        document.getElementById('totalCount').textContent = stats.total;
        document.getElementById('countryCount').textContent = stats.countries;

        // Update category counts
        document.getElementById('count-erasmus').textContent = stats.byCategory['Erasmus'] || 0;
        document.getElementById('count-nordplus').textContent = stats.byCategory['Nordplus'] || 0;
        document.getElementById('count-tca').textContent = stats.byCategory['TCA'] || 0;
        document.getElementById('count-atlas').textContent = stats.byCategory['Atlas'] || 0;
    }
}

// Create global instance
window.filterManager = new FilterManager();
