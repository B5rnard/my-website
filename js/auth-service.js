// auth-service.js

import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

import { 
  doc, 
  setDoc, 
  getFirestore 
} from 'firebase/firestore';

class AuthService {
  constructor() {
    this.auth = getAuth();
    this.db = getFirestore();
    this.user = null;
    
    // Set up auth state listener
    onAuthStateChanged(this.auth, (user) => {
      this.user = user;
      if (user) {
        // User is signed in
        this.handleUserSignedIn(user);
      } else {
        // User is signed out
        this.handleUserSignedOut();
      }
    });
  }

  // Sign up new user
  async signUp(email, password, firstName, lastName) {
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const user = userCredential.user;

      // Update profile with name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      // Create user document in Firestore
      await setDoc(doc(this.db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        createdAt: new Date(),
        focusScore: 0,
        currentStreak: 0,
        dailyGoal: 300, // 5 hours in minutes
        totalFocusTime: 0,
        peakPerformanceTime: '9-12 AM'
      });

      return user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Sign in existing user
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get current user
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.auth.currentUser;
  }

  // Handle signed in user
  handleUserSignedIn(user) {
    // Redirect to dashboard or update UI
    if (window.location.pathname === '/sign-in.html' || 
        window.location.pathname === '/sign-up.html') {
      window.location.href = '/dashboard.html';
    }
  }

  // Handle signed out user
  handleUserSignedOut() {
    // Redirect to sign in or update UI
    if (window.location.pathname !== '/sign-in.html' && 
        window.location.pathname !== '/sign-up.html') {
      window.location.href = '/sign-in.html';
    }
  }

  // Error handler
  handleError(error) {
    let message = 'An error occurred. Please try again.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email is already registered.';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address.';
        break;
      case 'auth/operation-not-allowed':
        message = 'Email/password accounts are not enabled.';
        break;
      case 'auth/weak-password':
        message = 'Please choose a stronger password.';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email.';
        break;
      case 'auth/wrong-password':
        message = 'Invalid password.';
        break;
    }

    return {
      code: error.code,
      message: message
    };
  }
}

export const authService = new AuthService();
