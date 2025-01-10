// signup-handler.js
import { authService } from './auth-service.js';

document.addEventListener('DOMContentLoaded', () => {
    const signUpForm = document.getElementById('signUpForm');
    const errorMessage = document.getElementById('errorMessage');

    // Check if already logged in
    if (authService.isAuthenticated()) {
        window.location.href = '/dashboard.html';
        return;
    }

    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            // Get form data
            const firstName = signUpForm.firstName.value.trim();
            const lastName = signUpForm.lastName.value.trim();
            const email = signUpForm.email.value.trim();
            const password = signUpForm.password.value;
            const terms = signUpForm.terms.checked;

            // Validate form
            if (!terms) {
                throw { message: 'Please accept the terms and conditions' };
            }

            // Validate password strength
            const strength = calculatePasswordStrength(password);
            if (strength === 'weak') {
                throw { message: 'Please choose a stronger password' };
            }

            // Create user
            await authService.signUp(email, password, firstName, lastName);
            
            // Redirect to dashboard on success
            window.location.href = '/dashboard.html';
            
        } catch (error) {
            // Show error message
            errorMessage.style.display = 'block';
            errorMessage.textContent = error.message;
            errorMessage.style.color = 'var(--danger)';
            errorMessage.style.padding = '0.75rem';
            errorMessage.style.marginBottom = '1rem';
            errorMessage.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
            errorMessage.style.border = '1px solid var(--danger)';
            errorMessage.style.borderRadius = '4px';
        }
    });
});