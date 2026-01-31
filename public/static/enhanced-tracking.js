// Enhanced AI Model Status Tracker with Real-time Updates
// This will be integrated into the frontend to show live AI model activity

/**
 * AI Model Activity Tracker
 * Tracks which AI model is currently active and shows spinning animation
 */
class AIModelTracker {
  constructor() {
    this.currentModel = null;
    this.startTime = null;
    this.updateInterval = null;
  }

  /**
   * Start tracking a model
   */
  startModel(modelName, agentName, task) {
    this.currentModel = {
      name: modelName,
      agent: agentName,
      task: task,
      startTime: Date.now()
    };

    // Update UI every 100ms for smooth animation
    this.updateInterval = setInterval(() => {
      this.updateModelStatus();
    }, 100);

    this.showModelActivity(modelName, agentName, task);
  }

  /**
   * Stop tracking current model
   */
  stopModel() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.currentModel) {
      const duration = Date.now() - this.currentModel.startTime;
      this.hideModelActivity(this.currentModel.name, duration);
      this.currentModel = null;
    }
  }

  /**
   * Update model status in UI
   */
  updateModelStatus() {
    if (!this.currentModel) return;

    const elapsed = Date.now() - this.currentModel.startTime;
    const seconds = Math.floor(elapsed / 1000);

    // Update elapsed time display
    const modelCards = document.querySelectorAll('.ai-model-card');
    modelCards.forEach(card => {
      const modelName = card.dataset.model;
      if (modelName === this.currentModel.name) {
        const timeDisplay = card.querySelector('.model-time');
        if (timeDisplay) {
          timeDisplay.textContent = `${seconds}s`;
        }
      }
    });
  }

  /**
   * Show model activity with spinning animation
   */
  showModelActivity(modelName, agentName, task) {
    const modelCards = document.querySelectorAll('.ai-model-card');
    
    modelCards.forEach(card => {
      const cardModel = card.dataset.model;
      const spinner = card.querySelector('.model-spinner');
      const statusBadge = card.querySelector('.model-status-badge');
      const taskInfo = card.querySelector('.model-task-info');

      if (cardModel === modelName) {
        // Show spinner
        if (spinner) {
          spinner.classList.remove('hidden');
          spinner.classList.add('spinning');
        }

        // Update status badge
        if (statusBadge) {
          statusBadge.classList.remove('bg-green-500');
          statusBadge.classList.add('bg-blue-500', 'pulse');
          statusBadge.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }

        // Show task info
        if (taskInfo) {
          taskInfo.textContent = task;
          taskInfo.classList.remove('hidden');
        }

        // Highlight card
        card.classList.add('ring-4', 'ring-blue-400', 'shadow-2xl');
      } else {
        // Dim other cards
        card.classList.add('opacity-50');
      }
    });
  }

  /**
   * Hide model activity
   */
  hideModelActivity(modelName, duration) {
    const modelCards = document.querySelectorAll('.ai-model-card');
    
    modelCards.forEach(card => {
      const cardModel = card.dataset.model;
      const spinner = card.querySelector('.model-spinner');
      const statusBadge = card.querySelector('.model-status-badge');
      const taskInfo = card.querySelector('.model-task-info');

      if (cardModel === modelName) {
        // Hide spinner
        if (spinner) {
          spinner.classList.add('hidden');
          spinner.classList.remove('spinning');
        }

        // Update status badge to success
        if (statusBadge) {
          statusBadge.classList.remove('bg-blue-500', 'pulse');
          statusBadge.classList.add('bg-green-500');
          statusBadge.innerHTML = '<i class="fas fa-check-circle"></i>';
        }

        // Show completion time
        if (taskInfo) {
          taskInfo.textContent = `✓ 완료 (${Math.round(duration / 1000)}s)`;
          setTimeout(() => {
            taskInfo.classList.add('hidden');
          }, 3000);
        }

        // Remove highlight
        card.classList.remove('ring-4', 'ring-blue-400', 'shadow-2xl');
      }

      // Restore opacity
      card.classList.remove('opacity-50');
    });
  }
}

/**
 * Progress Timer - Updates every 10 seconds
 */
class ProgressTimer {
  constructor() {
    this.startTime = null;
    this.totalDuration = 0; // in seconds
    this.updateInterval = null;
  }

  /**
   * Start progress timer
   */
  start(totalMinutes) {
    this.startTime = Date.now();
    this.totalDuration = totalMinutes * 60; // convert to seconds

    // Update every 10 seconds
    this.updateInterval = setInterval(() => {
      this.updateProgress();
    }, 10000); // 10 seconds

    // Also update immediately
    this.updateProgress();
  }

  /**
   * Stop progress timer
   */
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Update progress display
   */
  updateProgress() {
    if (!this.startTime) return;

    const elapsed = Math.floor((Date.now() - this.startTime) / 1000); // seconds
    const remaining = Math.max(0, this.totalDuration - elapsed);
    const progress = Math.min(100, (elapsed / this.totalDuration) * 100);

    // Hide start message
    const startMessage = document.getElementById('progress-start-message');
    if (startMessage) {
      startMessage.style.display = 'none';
    }

    // Update elapsed time text
    const elapsedText = document.getElementById('elapsed-time-text');
    if (elapsedText) {
      elapsedText.textContent = this.formatTime(elapsed);
    }

    // Update remaining time text
    const remainingText = document.getElementById('remaining-time-text');
    if (remainingText) {
      remainingText.textContent = this.formatTime(remaining);
    }

    // Update progress bar
    const progressBar = document.getElementById('project-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${progress.toFixed(1)}%`;
    }

    // Update progress percentage
    const progressPercentage = document.getElementById('progress-percentage');
    if (progressPercentage && progress > 5) {
      progressPercentage.textContent = `${progress.toFixed(0)}%`;
    }

    console.log(`[Progress] ${this.formatTime(elapsed)} / ${this.formatTime(this.totalDuration)} (${progress.toFixed(1)}%)`);
  }

  /**
   * Format seconds to readable time
   */
  formatTime(seconds) {
    if (seconds < 60) {
      return `${seconds}초`;
    }
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}분 ${secs}초`;
  }
}

/**
 * Error Handler - Shows why project stopped
 */
class ErrorHandler {
  /**
   * Show error modal with explanation
   */
  static showError(title, message, details) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-8 max-w-2xl mx-4 shadow-2xl">
        <div class="flex items-start gap-4 mb-6">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">${title}</h2>
            <p class="text-gray-700 text-lg">${message}</p>
          </div>
        </div>

        ${details ? `
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">상세 정보:</h3>
            <pre class="text-xs text-gray-600 whitespace-pre-wrap">${details}</pre>
          </div>
        ` : ''}

        <div class="flex gap-3">
          <button
            onclick="this.closest('.fixed').remove()"
            class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
          >
            닫기
          </button>
          <button
            onclick="location.reload()"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
          >
            <i class="fas fa-redo mr-2"></i>
            다시 시도
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Log to console for debugging
    console.error('[Plan-Craft Error]', {
      title,
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Show quality gate rejection reason
   */
  static showQualityGateRejection(phase, metrics, requirements) {
    const failures = [];
    
    if (metrics.buildSuccessRate < requirements.buildSuccessRate) {
      failures.push(`빌드 성공률: ${metrics.buildSuccessRate}% < ${requirements.buildSuccessRate}% (필요)`);
    }
    
    if (metrics.testCoverage < requirements.testCoverage) {
      failures.push(`테스트 커버리지: ${metrics.testCoverage}% < ${requirements.testCoverage}% (필요)`);
    }
    
    if (metrics.securityIssues > requirements.securityIssues) {
      failures.push(`보안 이슈: ${metrics.securityIssues}개 > ${requirements.securityIssues}개 (허용)`);
    }

    this.showError(
      '품질 게이트 미통과',
      `${phase} 단계가 품질 기준을 충족하지 못했습니다.`,
      `실패 항목:\n${failures.map(f => `• ${f}`).join('\n')}\n\n자동으로 재작업이 진행됩니다.`
    );
  }
}

/**
 * Robust Execution Manager
 * Ensures project continues even if there are temporary errors
 */
class RobustExecutionManager {
  constructor() {
    this.retryCount = 0;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  /**
   * Execute with automatic retry on failure
   */
  async executeWithRetry(fn, context) {
    this.retryCount = 0;

    while (this.retryCount < this.maxRetries) {
      try {
        const result = await fn();
        this.retryCount = 0; // Reset on success
        return result;
      } catch (error) {
        this.retryCount++;
        
        console.warn(`[Retry ${this.retryCount}/${this.maxRetries}]`, {
          context,
          error: error.message,
          timestamp: new Date().toISOString()
        });

        if (this.retryCount >= this.maxRetries) {
          // Final failure
          ErrorHandler.showError(
            '실행 실패',
            `${context} 작업이 ${this.maxRetries}번 시도 후 실패했습니다.`,
            `오류: ${error.message}\n\n시간: ${new Date().toLocaleString('ko-KR')}`
          );
          throw error;
        }

        // Wait before retry
        await this.sleep(this.retryDelay);
        
        // Show retry notification
        this.showRetryNotification(this.retryCount, context);
      }
    }
  }

  /**
   * Show retry notification
   */
  showRetryNotification(retryNum, context) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <i class="fas fa-sync-alt fa-spin text-xl"></i>
        <div>
          <p class="font-semibold">재시도 중 (${retryNum}/${this.maxRetries})</p>
          <p class="text-sm">${context}</p>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 4000);
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in app.js
if (typeof window !== 'undefined') {
  window.AIModelTracker = AIModelTracker;
  window.ProgressTimer = ProgressTimer;
  window.ErrorHandler = ErrorHandler;
  window.RobustExecutionManager = RobustExecutionManager;
}
