// Plan-Craft v3.0 - Main Application
// ====================================
// Modular, robust, and maintainable architecture
// Imports all modules and orchestrates the application

import './constants.js';
import apiClient from './api-client.js';
import projectManager from './project-manager.js';
import uiRenderer from './ui-renderer.js';
import { APP_CONFIG } from './constants.js';

/**
 * Main Application Class
 */
class PlanCraftApp {
  constructor() {
    this.initialized = false;
    this.tempReferences = [];
  }

  /**
   * Initialize the application
   */
  async init() {
    if (this.initialized) {
      console.warn('[App] Already initialized');
      return;
    }

    console.log('[Plan-Craft v3.0] 🚀 Starting initialization...');

    try {
      // Initialize UI
      uiRenderer.init();
      
      // Initialize project manager
      await projectManager.init();
      
      // Setup event handlers
      this.setupEventHandlers();
      
      // Load initial data
      await this.loadInitialData();
      
      // Start refresh loops
      this.startRefreshLoops();
      
      this.initialized = true;
      console.log('[Plan-Craft v3.0] ✅ Initialization complete');
      uiRenderer.addLog('SUCCESS', '시스템 초기화 완료');

    } catch (error) {
      console.error('[App] Initialization failed:', error);
      uiRenderer.showError('초기화 실패', error.message);
    }
  }

  /**
   * Setup all event handlers
   */
  setupEventHandlers() {
    // Project form submission
    const form = document.getElementById('project-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleProjectCreation(e));
    }

    // File upload
    this.setupFileUpload();

    // Control buttons
    const stopAllBtn = document.getElementById('stop-all-btn');
    const partialCancelBtn = document.getElementById('partial-cancel-btn');
    const cancelAllBtn = document.getElementById('cancel-all-btn');

    if (stopAllBtn) {
      stopAllBtn.addEventListener('click', () => this.handleStopAll());
    }
    if (partialCancelBtn) {
      partialCancelBtn.addEventListener('click', () => this.handlePartialCancel());
    }
    if (cancelAllBtn) {
      cancelAllBtn.addEventListener('click', () => this.handleCancelAll());
    }

    // Demo buttons
    const demoBtn = document.getElementById('demo-mode-btn');
    const errorDemoBtn = document.getElementById('error-demo-btn');

    if (demoBtn) {
      demoBtn.addEventListener('click', () => this.startDemoMode());
    }
    if (errorDemoBtn) {
      errorDemoBtn.addEventListener('click', () => this.showErrorDemo());
    }

    // Refresh button
    const refreshBtn = document.getElementById('refresh-projects-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshProjects());
    }
  }

  /**
   * Setup file upload handlers
   */
  setupFileUpload() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');

    if (!dropzone || !fileInput) return;

    // Click to upload
    dropzone.addEventListener('click', () => fileInput.click());

    // Drag and drop
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('bg-purple-200', 'border-purple-500');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('bg-purple-200', 'border-purple-500');
    });

    dropzone.addEventListener('drop', (e) => this.handleFileDrop(e));
    fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
  }

  /**
   * Load initial data
   */
  async loadInitialData() {
    await Promise.all([
      this.refreshProjects(),
      this.refreshStats()
    ]);
  }

  /**
   * Start auto-refresh loops
   */
  startRefreshLoops() {
    // Stats refresh
    setInterval(() => {
      this.refreshStats();
    }, APP_CONFIG.STATS_REFRESH_INTERVAL);

    // Projects refresh
    setInterval(() => {
      this.refreshProjects();
    }, APP_CONFIG.PROJECTS_REFRESH_INTERVAL);
  }

  /**
   * Refresh projects
   */
  async refreshProjects() {
    try {
      const projects = await projectManager.loadProjects();
      uiRenderer.renderProjects(projects);
    } catch (error) {
      console.error('[App] Failed to refresh projects:', error);
    }
  }

  /**
   * Refresh statistics
   */
  async refreshStats() {
    try {
      const result = await apiClient.getStats();
      if (result.success) {
        uiRenderer.updateStats(result.data);
      }
    } catch (error) {
      console.error('[App] Failed to refresh stats:', error);
    }
  }

  /**
   * Handle project creation
   */
  async handleProjectCreation(e) {
    e.preventDefault();

    const projectName = document.getElementById('project-name')?.value.trim();
    const userIdea = document.getElementById('project-idea')?.value.trim();
    const outputFormat = document.querySelector('input[name="output-format"]:checked')?.value || 'html';

    if (!projectName || !userIdea) {
      uiRenderer.showError('입력 오류', '프로젝트 이름과 아이디어를 모두 입력해주세요.');
      return;
    }

    // Check if can create project
    if (!projectManager.canCreateProject()) {
      uiRenderer.showError(
        '프로젝트 제한',
        `최대 ${APP_CONFIG.MAX_PROJECTS}개의 프로젝트만 동시에 진행할 수 있습니다.\n진행 중인 프로젝트를 완료하거나 취소해주세요.`
      );
      return;
    }

    try {
      uiRenderer.addLog('INFO', `프로젝트 생성 중: ${projectName}`);

      const project = await projectManager.createProject({
        projectName,
        userIdea,
        references: this.tempReferences,
        outputFormat
      });

      uiRenderer.addLog('SUCCESS', `프로젝트 생성 완료: ${project.projectId}`);

      // Reset form
      document.getElementById('project-form')?.reset();
      this.tempReferences = [];
      this.renderFileList();

      // Refresh UI
      await this.refreshProjects();

      // Start execution if available
      if (typeof window.executeAllPhasesWithTracking === 'function') {
        uiRenderer.addLog('INFO', '🚀 실행 시작...');
        window.executeAllPhasesWithTracking(project.projectId).catch(err => {
          console.error('[Execution Error]', err);
          uiRenderer.addLog('ERROR', `실행 오류: ${err.message}`);
        });
      }

    } catch (error) {
      console.error('[App] Project creation failed:', error);
      uiRenderer.showError('프로젝트 생성 실패', error.message);
    }
  }

  /**
   * Handle file drop
   */
  handleFileDrop(e) {
    e.preventDefault();
    const dropzone = document.getElementById('dropzone');
    if (dropzone) {
      dropzone.classList.remove('bg-purple-200', 'border-purple-500');
    }

    const files = Array.from(e.dataTransfer.files);
    this.processFiles(files);
  }

  /**
   * Handle file select
   */
  handleFileSelect(e) {
    const files = Array.from(e.target.files);
    this.processFiles(files);
  }

  /**
   * Process uploaded files
   */
  processFiles(files) {
    files.forEach(file => {
      this.tempReferences.push({
        type: 'file',
        name: file.name,
        size: file.size,
        file: file
      });
    });

    this.renderFileList();
  }

  /**
   * Render file list
   */
  renderFileList() {
    const fileList = document.getElementById('file-list');
    if (!fileList) return;

    if (this.tempReferences.length === 0) {
      fileList.innerHTML = '';
      return;
    }

    fileList.innerHTML = this.tempReferences.map((ref, index) => `
      <div class="flex items-center justify-between bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
        <span class="text-sm text-gray-700 flex items-center gap-2">
          <i class="fas fa-file text-purple-600"></i>
          ${this.escapeHtml(ref.name)}
          ${ref.size ? `<span class="text-xs text-gray-500">(${Math.round(ref.size / 1024)}KB)</span>` : ''}
        </span>
        <button
          onclick="app.removeReference(${index})"
          class="text-red-600 hover:text-red-800 text-sm"
          type="button"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    `).join('');
  }

  /**
   * Remove reference
   */
  removeReference(index) {
    this.tempReferences.splice(index, 1);
    this.renderFileList();
  }

  /**
   * Handle stop all
   */
  async handleStopAll() {
    const count = projectManager.getProjectCount();
    if (count === 0) {
      uiRenderer.showError('중지 불가', '진행 중인 프로젝트가 없습니다.');
      return;
    }

    if (!confirm(`모든 프로젝트(${count}개)를 중지하시겠습니까?`)) {
      return;
    }

    try {
      uiRenderer.addLog('INFO', '모든 프로젝트 중지 중...');
      await projectManager.pauseAll();
      uiRenderer.addLog('SUCCESS', '모든 프로젝트가 중지되었습니다');
      await this.refreshProjects();
    } catch (error) {
      uiRenderer.showError('중지 실패', error.message);
    }
  }

  /**
   * Handle partial cancel
   */
  handlePartialCancel() {
    uiRenderer.showError('준비 중', '일부 취소 기능은 곧 제공될 예정입니다.');
  }

  /**
   * Handle cancel all
   */
  async handleCancelAll() {
    const count = projectManager.getProjectCount();
    if (count === 0) {
      uiRenderer.showError('취소 불가', '진행 중인 프로젝트가 없습니다.');
      return;
    }

    if (!confirm(`모든 프로젝트(${count}개)를 취소하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      uiRenderer.addLog('WARN', '모든 프로젝트 취소 중...');
      await projectManager.cancelAll();
      uiRenderer.addLog('SUCCESS', '모든 프로젝트가 취소되었습니다');
      await this.refreshProjects();
    } catch (error) {
      uiRenderer.showError('취소 실패', error.message);
    }
  }

  /**
   * Start demo mode
   */
  startDemoMode() {
    if (typeof window.startDemoMode === 'function') {
      window.startDemoMode();
    } else {
      uiRenderer.showError('데모 모드 없음', 'demo-mode.js를 확인해주세요.');
    }
  }

  /**
   * Show error demo
   */
  showErrorDemo() {
    uiRenderer.showError(
      '데모: 에러 발생',
      '이것은 에러 모달의 데모입니다.',
      'Stack trace: demo error...'
    );
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Create app instance
const app = new PlanCraftApp();

// UI Actions (for onclick handlers)
window.uiActions = {
  viewProject: (projectId) => {
    window.location.href = `/projects/${projectId}`;
  },
  pauseProject: async (projectId) => {
    try {
      await projectManager.pauseProject(projectId);
      uiRenderer.addLog('SUCCESS', `프로젝트 중지됨: ${projectId}`);
      await app.refreshProjects();
    } catch (error) {
      uiRenderer.showError('중지 실패', error.message);
    }
  }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app.init();
  });
} else {
  app.init();
}

// Expose to window
window.app = app;

console.log('[Plan-Craft v3.0 Main App] ✅ Loaded successfully');
