// focus-data.js
import { db } from './firebase-config';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp,
  onSnapshot 
} from 'firebase/firestore';

class FocusDataService {
  constructor() {
    this.sessionsCollection = collection(db, 'focusSessions');
    this.activeSubscriptions = new Map();
  }

  // Get today's focus time for a user
  async getTodaysFocus(userId) {
    if (!userId) throw new Error('User ID is required');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const q = query(
        this.sessionsCollection,
        where('userId', '==', userId),
        where('startTime', '>=', Timestamp.fromDate(today))
      );

      const querySnapshot = await getDocs(q);
      return this.calculateFocusMetrics(querySnapshot);
    } catch (error) {
      console.error('Error getting today\'s focus:', error);
      throw error;
    }
  }

  // Calculate focus metrics from snapshot
  calculateFocusMetrics(snapshot) {
    let totalMinutes = 0;
    let completedSessions = 0;
    let ongoingSessions = 0;

    snapshot.forEach((doc) => {
      const session = doc.data();
      if (session.completed) {
        totalMinutes += session.duration;
        completedSessions++;
      } else if (session.startTime && !session.endTime) {
        const currentDuration = (Date.now() - session.startTime.toDate()) / 1000 / 60;
        totalMinutes += Math.floor(currentDuration);
        ongoingSessions++;
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return {
      totalMinutes,
      displayValue: `${hours}h ${minutes}m`,
      sessions: snapshot.size,
      completedSessions,
      ongoingSessions,
      lastUpdated: new Date()
    };
  }

  // Subscribe to real-time updates
  subscribeToTodaysFocus(userId, callback) {
    if (!userId) throw new Error('User ID is required');
    if (this.activeSubscriptions.has(userId)) {
      console.warn('Subscription already exists for this user');
      return this.activeSubscriptions.get(userId);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      this.sessionsCollection,
      where('userId', '==', userId),
      where('startTime', '>=', Timestamp.fromDate(today))
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const metrics = this.calculateFocusMetrics(snapshot);
        callback(metrics);
      },
      (error) => {
        console.error('Error in focus subscription:', error);
        callback({ error: error.message });
      }
    );

    this.activeSubscriptions.set(userId, unsubscribe);
    return unsubscribe;
  }

  // Cleanup subscriptions
  unsubscribeFromTodaysFocus(userId) {
    const unsubscribe = this.activeSubscriptions.get(userId);
    if (unsubscribe) {
      unsubscribe();
      this.activeSubscriptions.delete(userId);
    }
  }
}

export const focusDataService = new FocusDataService();