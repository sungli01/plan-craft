// Plan-Craft v3.1 - Real-Time Timer Module
// ==========================================
// Precise 1-second counter with 10-second UI updates

import projectManager from './project-manager.js';

/**
 * Real-Time Timer
 * Tracks project time with 1-second precision
 */
class RealTimeTimer {
  constructor() {
    this.timers = new Map(); // projectId -> timer info
    this.updateInterval = null;
  }

  /**
   * Start timer for a project
   */
  start(projectId) {
    if (this.timers.has(projectId)) {
      console.warn(`[RealTimeTimer] Timer already exists for ${projectId}`);
      return;
    }

    const timerInfo = {
      projectId,
      startTime: Date.now(),
      elapsed: 0, // seconds
      lastUpdate: Date.now(),
      intervalId: null
    };

    // Start 1-second counter
    timerInfo.intervalId = setInterval(() => {
      timerInfo.elapsed++;
      
      // Update every 10 seconds
      if (timerInfo.elapsed % 10 === 0) {
        this.updateUI(projectId);
      }
    }, 1000);

    this.timers.set(projectId, timerInfo);
    console.log(`[RealTimeTimer] Started for ${projectId}`);

    // Initial UI update
    this.updateUI(projectId);
  }

  /**
   * Stop timer
   */
  stop(projectId) {
    const timerInfo = this.timers.get(projectId);
    if (!timerInfo) return;

    if (timerInfo.intervalId) {
      clearInterval(timerInfo.intervalId);
    }

    this.timers.delete(projectId);
    console.log(`[RealTimeTimer] Stopped for ${projectId}`);
  }

  /**
   * Get elapsed time in seconds
   */
  getElapsed(projectId) {
    const timerInfo = this.timers.get(projectId);
    return timerInfo ? timerInfo.elapsed : 0;
  }

  /**
   * Format time in seconds to readable string
   */
  formatTime(seconds) {
    if (seconds < 60) {
      return `${seconds}초`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (minutes < 60) {
      return `${minutes}분 ${secs}초`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분 ${secs}초`;
  }

  /**
   * Update UI for a project
   */
  updateUI(projectId) {
    const timerInfo = this.timers.get(projectId);
    if (!timerInfo) return;

    const project = projectManager.getProject(projectId);
    if (!project) return;

    const timeInfo = projectManager.calculateTimeInfo(project);
    const elapsedSeconds = timerInfo.elapsed;

    // Update time display
    const timeInfoEl = document.getElementById(`time-info-${projectId}`);
    if (timeInfoEl) {
      timeInfoEl.innerHTML = `
        <span class="text-blue-600 font-semibold">
          <i class="fas fa-clock mr-1"></i>
          경과: <span class="font-mono">${this.formatTime(elapsedSeconds)}</span>
        </span>
        <span class="text-purple-600 font-semibold">
          <i class="fas fa-hourglass-half mr-1"></i>
          남음: <span class="font-mono">${timeInfo.remainingText}</span>
        </span>
      `;
    }

    // Update progress bar
    const progressBar = document.getElementById(`progress-bar-${projectId}`);
    if (progressBar) {
      progressBar.style.width = `${timeInfo.percent}%`;
    }
  }

  /**
   * Stop all timers
   */
  stopAll() {
    this.timers.forEach((_, projectId) => {
      this.stop(projectId);
    });
  }

  /**
   * Get all active timers
   */
  getActiveTimers() {
    return Array.from(this.timers.keys());
  }
}

// Create singleton instance
const realTimeTimer = new RealTimeTimer();

// Expose to window
if (typeof window !== 'undefined') {
  window.realTimeTimer = realTimeTimer;
}

export default realTimeTimer;

console.log('[Real-Time Timer Module] ✅ Loaded successfully');
