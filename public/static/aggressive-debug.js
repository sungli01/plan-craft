// AGGRESSIVE DEBUG MODE - Force everything to work
console.log('='.repeat(80));
console.log('🚀 PLAN-CRAFT AGGRESSIVE INITIALIZATION');
console.log('='.repeat(80));

// Force all functions to be global
window.AGGRESSIVE_DEBUG = true;

// Check what's loaded
console.log('[CHECK] Window objects:', {
  AIModelTracker: typeof window.AIModelTracker,
  ProgressTimer: typeof window.ProgressTimer,
  ErrorHandler: typeof window.ErrorHandler,
  RobustExecutionManager: typeof window.RobustExecutionManager,
  executeAllPhasesWithTracking: typeof window.executeAllPhasesWithTracking,
  startDemoMode: typeof window.startDemoMode,
  addLog: typeof window.addLog,
  PHASE_DURATION: typeof window.PHASE_DURATION
});

// Force create missing functions
if (typeof window.addLog !== 'function') {
  console.warn('[FORCE] Creating addLog function');
  window.addLog = function(level, message) {
    const terminal = document.getElementById('terminal-console');
    if (!terminal) {
      console.log(`[${level}] ${message}`);
      return;
    }

    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const colors = {
      INFO: 'text-blue-400',
      SUCCESS: 'text-green-400',
      ERROR: 'text-red-400',
      WARN: 'text-yellow-400'
    };

    const icons = {
      INFO: '◆',
      SUCCESS: '✓',
      ERROR: '✗',
      WARN: '⚠'
    };

    const color = colors[level] || 'text-gray-400';
    const icon = icons[level] || '•';
    const logEntry = document.createElement('div');
    logEntry.className = `${color} mb-1 log-entry`;
    logEntry.innerHTML = `[${timestamp}] ${icon} [${level}] ${message}`;

    const firstChild = terminal.firstChild;
    if (firstChild) {
      terminal.insertBefore(logEntry, firstChild);
    } else {
      terminal.appendChild(logEntry);
    }

    const logs = terminal.querySelectorAll('.log-entry');
    if (logs.length > 10) {
      for (let i = 10; i < logs.length; i++) {
        logs[i].remove();
      }
    }
  };
}

// Force initialize trackers
function forceInitializeAll() {
  console.log('[FORCE] Initializing all systems...');

  // Initialize trackers
  if (typeof AIModelTracker !== 'undefined' && !window.aiModelTracker) {
    window.aiModelTracker = new AIModelTracker();
    console.log('[OK] ✓ AIModelTracker initialized');
  }

  if (typeof ProgressTimer !== 'undefined' && !window.progressTimer) {
    window.progressTimer = new ProgressTimer();
    console.log('[OK] ✓ ProgressTimer initialized');
  }

  if (typeof RobustExecutionManager !== 'undefined' && !window.robustExecutor) {
    window.robustExecutor = new RobustExecutionManager();
    console.log('[OK] ✓ RobustExecutionManager initialized');
  }

  // Log final status
  console.log('[STATUS] Final check:', {
    aiModelTracker: !!window.aiModelTracker,
    progressTimer: !!window.progressTimer,
    robustExecutor: !!window.robustExecutor,
    startDemoMode: typeof window.startDemoMode === 'function',
    addLog: typeof window.addLog === 'function'
  });

  if (typeof window.addLog === 'function') {
    window.addLog('SUCCESS', '🚀 시스템 초기화 완료!');
    window.addLog('INFO', '데모 모드 버튼을 클릭하거나 문서를 생성하세요.');
  }
}

// Run on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', forceInitializeAll);
} else {
  forceInitializeAll();
}

// Also run after a delay to be safe
setTimeout(forceInitializeAll, 1000);

console.log('='.repeat(80));
console.log('🔥 AGGRESSIVE DEBUG MODE ACTIVE');
console.log('='.repeat(80));
