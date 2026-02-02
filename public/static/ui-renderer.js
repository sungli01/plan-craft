// Plan-Craft v3.0 - UI Renderer Module
// ======================================
// Handles all DOM manipulation and rendering
// Pure UI layer - no business logic

import projectManager from './project-manager.js';
import { APP_CONFIG, LOG_LEVEL_STYLES, getPhaseLabel } from './constants.js';

/**
 * UI Renderer Class
 * Manages all UI updates and rendering
 */
class UIRenderer {
  constructor() {
    this.elements = {};
    this.logCount = 0;
  }

  /**
   * Initialize UI elements
   */
  init() {
    console.log('[UIRenderer] Initializing...');
    this.cacheElements();
    this.setupEventListeners();
    console.log('[UIRenderer] ✅ Initialized');
  }

  /**
   * Cache frequently used elements
   */
  cacheElements() {
    this.elements = {
      projectsContainer: document.getElementById('active-projects-container'),
      noProjectsMessage: document.getElementById('no-projects-message'),
      terminal: document.getElementById('terminal-console'),
      statTotal: document.getElementById('stat-total'),
      statActive: document.getElementById('stat-active'),
      statPaused: document.getElementById('stat-paused'),
      statCompleted: document.getElementById('stat-completed')
    };
  }

  /**
   * Setup event listeners for custom events
   */
  setupEventListeners() {
    // Listen for project time updates
    window.addEventListener('projectTimeUpdate', (e) => {
      this.updateProjectTimeDisplay(e.detail.projectId);
    });
  }

  /**
   * Render all projects
   */
  renderProjects(projects) {
    const container = this.elements.projectsContainer;
    const noProjectsMsg = this.elements.noProjectsMessage;

    if (!container) return;

    if (!projects || projects.length === 0) {
      if (noProjectsMsg) noProjectsMsg.style.display = 'block';
      // Clear any existing cards
      const existingCards = container.querySelectorAll('.project-card');
      existingCards.forEach(card => card.remove());
      return;
    }

    if (noProjectsMsg) noProjectsMsg.style.display = 'none';

    // Clear existing cards
    const existingCards = container.querySelectorAll('.project-card');
    existingCards.forEach(card => card.remove());

    // Render each project
    projects.forEach((project, index) => {
      const card = this.createProjectCard(project, index);
      container.appendChild(card);
    });
  }

  /**
   * Create project card element
   */
  createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'project-card bg-gradient-to-r from-white to-blue-50 rounded-lg p-4 border-2 border-blue-200 shadow-md';
    card.id = `project-card-${project.projectId}`;

    const timeInfo = projectManager.calculateTimeInfo(project);

    card.innerHTML = `
      <div class="flex justify-between items-start mb-3">
        <div class="flex-1">
          <h3 class="text-lg font-bold text-gray-800 mb-1">
            <i class="fas fa-file-alt text-indigo-600 mr-1"></i>
            ${this.escapeHtml(project.projectName || 'Untitled Project')}
          </h3>
          <p class="text-xs text-gray-500 font-mono">${this.escapeHtml(project.projectId)}</p>
        </div>
        <div class="flex gap-2">
          <button
            onclick="window.uiActions.viewProject('${project.projectId}')"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs font-semibold transition-all"
            title="상세보기"
          >
            <i class="fas fa-eye"></i>
          </button>
          <button
            onclick="window.uiActions.pauseProject('${project.projectId}')"
            class="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-semibold transition-all"
            title="중지"
          >
            <i class="fas fa-pause"></i>
          </button>
        </div>
      </div>
      
      <!-- Current Phase -->
      <div class="mb-2">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span class="text-sm font-semibold text-gray-700">${getPhaseLabel(project.currentPhase || 'G1_CORE_LOGIC')}</span>
          <span class="text-xs text-gray-500">${timeInfo.percent}% 완료</span>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div class="mb-3">
        <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            id="progress-bar-${project.projectId}"
            class="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500"
            style="width: ${timeInfo.percent}%"
          ></div>
        </div>
      </div>
      
      <!-- Time Info -->
      <div id="time-info-${project.projectId}" class="flex justify-between text-xs">
        <span class="text-blue-600 font-semibold">
          <i class="fas fa-clock mr-1"></i>
          경과: <span class="font-mono">${timeInfo.elapsedText}</span>
        </span>
        <span class="text-purple-600 font-semibold">
          <i class="fas fa-hourglass-half mr-1"></i>
          남음: <span class="font-mono">${timeInfo.remainingText}</span>
        </span>
      </div>
    `;

    return card;
  }

  /**
   * Update project time display
   */
  updateProjectTimeDisplay(projectId) {
    const project = projectManager.getProject(projectId);
    if (!project) return;

    const timeInfo = projectManager.calculateTimeInfo(project);
    const timeInfoEl = document.getElementById(`time-info-${projectId}`);
    const progressBar = document.getElementById(`progress-bar-${projectId}`);

    if (timeInfoEl) {
      timeInfoEl.innerHTML = `
        <span class="text-blue-600 font-semibold">
          <i class="fas fa-clock mr-1"></i>
          경과: <span class="font-mono">${timeInfo.elapsedText}</span>
        </span>
        <span class="text-purple-600 font-semibold">
          <i class="fas fa-hourglass-half mr-1"></i>
          남음: <span class="font-mono">${timeInfo.remainingText}</span>
        </span>
      `;
    }

    if (progressBar) {
      progressBar.style.width = `${timeInfo.percent}%`;
    }
  }

  /**
   * Update statistics
   */
  updateStats(stats) {
    if (this.elements.statTotal) {
      this.elements.statTotal.textContent = stats.total || 0;
    }
    if (this.elements.statActive) {
      this.elements.statActive.textContent = stats.active || 0;
    }
    if (this.elements.statPaused) {
      this.elements.statPaused.textContent = stats.paused || 0;
    }
    if (this.elements.statCompleted) {
      this.elements.statCompleted.textContent = stats.completed || 0;
    }
  }

  /**
   * Add log entry
   */
  addLog(level, message) {
    const terminal = this.elements.terminal;
    if (!terminal) return;

    const timestamp = new Date().toTimeString().split(' ')[0];
    const style = LOG_LEVEL_STYLES[level] || LOG_LEVEL_STYLES.INFO;

    const logEntry = document.createElement('div');
    logEntry.className = style.color;
    logEntry.innerHTML = `<span class="text-gray-500">[${timestamp}]</span> ${style.icon} ${this.escapeHtml(message)}`;

    // Insert at top (latest first)
    const firstLog = terminal.querySelector('div:not(.text-cyan-400):not(.text-yellow-400)');
    if (firstLog) {
      terminal.insertBefore(logEntry, firstLog);
    } else {
      terminal.appendChild(logEntry);
    }

    // Keep only last N logs
    const logs = terminal.querySelectorAll('div:not(.text-cyan-400):not(.text-yellow-400)');
    if (logs.length > APP_CONFIG.MAX_LOGS) {
      for (let i = APP_CONFIG.MAX_LOGS; i < logs.length; i++) {
        logs[i].remove();
      }
    }

    this.logCount++;
  }

  /**
   * Show loading state
   */
  showLoading(show = true) {
    // Implement loading indicator if needed
    console.log('[UIRenderer] Loading:', show);
  }

  /**
   * Show error message
   */
  showError(title, message, details = '') {
    if (window.ErrorHandler) {
      window.ErrorHandler.showError(title, message, details);
    } else {
      alert(`${title}\n\n${message}\n\n${details}`);
    }
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    this.addLog('SUCCESS', message);
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Clear all projects
   */
  clearProjects() {
    const container = this.elements.projectsContainer;
    if (!container) return;

    const cards = container.querySelectorAll('.project-card');
    cards.forEach(card => card.remove());

    if (this.elements.noProjectsMessage) {
      this.elements.noProjectsMessage.style.display = 'block';
    }
  }

  /**
   * Get log count
   */
  getLogCount() {
    return this.logCount;
  }
}

// Create singleton instance
const uiRenderer = new UIRenderer();

// Export as default
export default uiRenderer;

// Also expose to window
if (typeof window !== 'undefined') {
  window.uiRenderer = uiRenderer;
}

console.log('[UI Renderer Module] ✅ Loaded successfully');
