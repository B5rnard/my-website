// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase config object
  apiKey: "AIzaSyBC-G2xzYQHwUyy1S0_Z3TxkwGmVrA7Lwc",
  authDomain: "rubildb.firebaseapp.com",
  projectId: "rubildb",
  storageBucket:"rubildb.firebasestorage.app",
  messagingSenderId: "85121264377",
  appId: "1:85121264377:web:e719c506ad89d284381028"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

// data-service.js
import { db } from './firebase-config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export async function getUserFocusStats(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    
    // Get today's focus sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sessionsRef = collection(db, 'focusSessions');
    const todayQuery = query(
      sessionsRef,
      where('userId', '==', userId),
      where('startTime', '>=', today)
    );
    
    const sessionsSnapshot = await getDocs(todayQuery);
    let totalFocusTime = 0;
    let interruptions = 0;
    
    sessionsSnapshot.forEach(doc => {
      const session = doc.data();
      totalFocusTime += session.duration;
      interruptions += session.interruptions?.length || 0;
    });

    return {
      focusScore: userData.focusScore || 0,
      todaysFocus: totalFocusTime,
      interruptions,
      streak: userData.currentStreak || 0,
      dailyGoal: userData.dailyGoal || 0,
      peakPerformanceTime: userData.peakPerformanceTime || '9-12 AM'
    };
  } catch (error) {
    console.error('Error fetching user focus stats:', error);
    throw error;
  }
}

// Initialize dashboard data
async function initializeDashboard(userId) {
  try {
    const stats = await getUserFocusStats(userId);
    
    // Update focus score
    document.querySelector('.focus-score .stats-value').textContent = stats.focusScore;
    
    // Update today's focus
    const hours = Math.floor(stats.todaysFocus / 60);
    const minutes = stats.todaysFocus % 60;
    document.querySelector('.todays-focus .stats-value').textContent = 
      `${hours}h ${minutes}m`;
    
    // Update interruptions and streak
    document.querySelector('.interruptions').textContent = 
      `${stats.interruptions} interruptions`;
    document.querySelector('.streak').textContent = 
      `${stats.streak}-day streak`;
    
    // Update goal progress
    const goalProgress = (stats.todaysFocus / (stats.dailyGoal * 60)) * 100;
    document.querySelector('.goal-progress .stats-value').textContent = 
      `${Math.round(goalProgress)}%`;
    
    // Update peak performance
    document.querySelector('.peak-performance .stats-value').textContent = 
      stats.peakPerformanceTime;
      
  } catch (error) {
    console.error('Error initializing dashboard:', error);
  }
}
