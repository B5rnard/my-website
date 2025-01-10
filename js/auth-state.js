// auth-state.js
import { authService } from './auth-service.js';

class AuthStateManager {
    constructor() {
        // Initialize auth state
        this.isAuthenticated = authService.isAuthenticated();
        this.currentUser = null;
        this.setupAuthListener();
    }

    setupAuthListener() {
        // Listen for auth state changes
        authService.auth.onAuthStateChanged((user) => {
            this.isAuthenticated = !!user;
            this.currentUser = user;
            this.handleAuthStateChange(user);
        });
    }

    handleAuthStateChange(user) {
        const currentPath = window.location.pathname;
        const publicPages = ['/sign-in.html', '/sign-up.html', '/forgot-password.html'];
        const isPublicPage = publicPages.includes(currentPath);

        if (user) {
            // User is signed in
            if (isPublicPage) {
                window.location.href = '/dashboard.html';
            }
            this.updateUIForAuthenticatedUser(user);
        } else {
            // User is signed out
            if (!isPublicPage) {
                window.location.href = '/sign-in.html';
            }
            this.updateUIForUnauthenticatedUser();
        }
    }

    updateUIForAuthenticatedUser(user) {
        // Update user profile in navbar if it exists
        const userNameElement = document.querySelector('.user-info .name');
        if (userNameElement) {
            userNameElement.textContent = user.displayName || user.email;
        }

        // Show authenticated content
        const authenticatedElements = document.querySelectorAll('.authenticated');
        const unauthenticatedElements = document.querySelectorAll('.unauthenticated');

        authenticatedElements.forEach(el => el.style.display = 'block');
        unauthenticatedElements.forEach(el => el.style.display = 'none');
    }

    updateUIForUnauthenticatedUser() {
        // Hide authenticated content
        const authenticatedElements = document.querySelectorAll('.authenticated');
        const unauthenticatedElements = document.querySelectorAll('.unauthenticated');

        authenticatedElements.forEach(el => el.style.display = 'none');
        unauthenticatedElements.forEach(el => el.style.display = 'block');
    }

    // Helper methods
    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    async signOut() {
        try {
            await authService.signOut();
            window.location.href = '/sign-in.html';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }
}

// Create and export a single instance
export const authStateManager = new AuthStateManager();
