// Authentication module for admin panel
class AuthManager {
    constructor() {
        this.correctPassword = 'Vanessagillargodis';
        this.sessionKey = 'adminAuthenticated';
        this.sessionTimeout = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    }

    // Initialize authentication
    initialize() {
        // Check if already authenticated
        if (this.isAuthenticated()) {
            this.showAdminContent();
        } else {
            this.showLoginScreen();
        }

        // Setup login form
        this.setupLoginForm();
    }

    // Check if user is authenticated
    isAuthenticated() {
        const authData = localStorage.getItem(this.sessionKey);

        if (!authData) {
            return false;
        }

        try {
            const { timestamp } = JSON.parse(authData);
            const now = Date.now();

            // Check if session has expired
            if (now - timestamp > this.sessionTimeout) {
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    }

    // Setup login form event listeners
    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        const passwordInput = document.getElementById('passwordInput');

        if (!loginForm || !passwordInput) return;

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(passwordInput.value);
        });

        // Focus on password input
        passwordInput.focus();

        // Clear error on input
        passwordInput.addEventListener('input', () => {
            this.hideError();
        });
    }

    // Handle login attempt
    handleLogin(password) {
        const loginBtn = document.querySelector('.btn-login');
        const passwordInput = document.getElementById('passwordInput');

        // Add loading state
        loginBtn.classList.add('loading');

        // Simulate network delay for better UX
        setTimeout(() => {
            if (password === this.correctPassword) {
                // Success
                this.login();
                loginBtn.classList.remove('loading');
                loginBtn.classList.add('success');

                // Show success briefly before transitioning
                setTimeout(() => {
                    this.transitionToAdmin();
                }, 500);
            } else {
                // Failed
                this.showError();
                loginBtn.classList.remove('loading');
                passwordInput.value = '';
                passwordInput.focus();

                // Shake animation is in CSS
            }
        }, 600);
    }

    // Login user
    login() {
        const authData = {
            timestamp: Date.now()
        };
        localStorage.setItem(this.sessionKey, JSON.stringify(authData));
    }

    // Logout user
    logout() {
        localStorage.removeItem(this.sessionKey);
    }

    // Show error message
    showError() {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.classList.remove('hidden');
        }
    }

    // Hide error message
    hideError() {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
    }

    // Show login screen
    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const adminContent = document.getElementById('adminContent');

        if (loginScreen) {
            loginScreen.classList.remove('hidden');
        }
        if (adminContent) {
            adminContent.classList.add('hidden');
        }
    }

    // Show admin content
    showAdminContent() {
        const loginScreen = document.getElementById('loginScreen');
        const adminContent = document.getElementById('adminContent');

        if (loginScreen) {
            loginScreen.classList.add('hidden');
        }
        if (adminContent) {
            adminContent.classList.remove('hidden');
        }
    }

    // Transition from login to admin
    transitionToAdmin() {
        const loginScreen = document.getElementById('loginScreen');
        const adminContent = document.getElementById('adminContent');

        // Fade out login screen
        if (loginScreen) {
            loginScreen.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => {
                loginScreen.classList.add('hidden');
                loginScreen.style.animation = '';
            }, 500);
        }

        // Fade in admin content
        if (adminContent) {
            adminContent.classList.remove('hidden');
            adminContent.style.animation = 'fadeIn 0.5s ease-out';
        }
    }

    // Add logout functionality
    addLogoutButton() {
        // Find header actions
        const headerActions = document.querySelector('.header-actions');

        if (headerActions && !document.getElementById('logoutBtn')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'logoutBtn';
            logoutBtn.className = 'btn-secondary';
            logoutBtn.innerHTML = '🚪 Logga ut';
            logoutBtn.style.order = '-1'; // Place before other buttons

            logoutBtn.addEventListener('click', () => {
                if (confirm('Är du säker på att du vill logga ut?')) {
                    this.logout();
                    location.reload();
                }
            });

            headerActions.insertBefore(logoutBtn, headerActions.firstChild);
        }
    }
}

// Add fadeOut animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize authentication when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
    window.authManager.initialize();

    // Add logout button after a short delay to ensure admin panel is loaded
    setTimeout(() => {
        if (window.authManager.isAuthenticated()) {
            window.authManager.addLogoutButton();
        }
    }, 1000);
});
