// Plan-Craft v4.0 - Main Application (Simplified)
// ================================================
// DOCUMENT GENERATION SYSTEM - NOT A CODING TOOL
// 문서 작성 도구 - 코딩 도구가 아닙니다

import unifiedCore from './unified-core.js';

/**
 * Main Application Class (Simplified)
 */
class PlanCraftApp {
  constructor() {
    this.initialized = false;
    this.tempReferences = [];
  }

  /**
   * Initialize application
   */
  async init() {
    if (this.initialized) return;

    console.log('[Plan-Craft v4.0] 🚀 Starting initialization...');

    try {
      // Initialize unified core
      await unifiedCore.init();
      
      // Setup event handlers
      this.setupEventHandlers();
      
      // Setup file upload
      this.setupFileUpload();
      
      // Initial log
      unifiedCore.addLog('SUCCESS', '📋 문서 생성 시스템 초기화 완료 - Plan-Craft v4.0');
      unifiedCore.addLog('INFO', '💡 이 시스템은 보고서 작성을 위한 도구입니다');
      
      this.initialized = true;
      console.log('[Plan-Craft v4.0] ✅ Initialization complete');

    } catch (error) {
      console.error('[App] Initialization failed:', error);
      alert(`초기화 실패: ${error.message}`);
    }
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    // Project form
    const form = document.getElementById('project-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleProjectCreation(e));
    }

    // Control buttons
    const stopAllBtn = document.getElementById('stop-all-btn');
    const cancelAllBtn = document.getElementById('cancel-all-btn');
    const partialCancelBtn = document.getElementById('partial-cancel-btn');

    if (stopAllBtn) {
      stopAllBtn.addEventListener('click', () => unifiedCore.stopAllProjects());
    }
    if (cancelAllBtn) {
      cancelAllBtn.addEventListener('click', () => unifiedCore.cancelAllProjects());
    }
    if (partialCancelBtn) {
      partialCancelBtn.addEventListener('click', () => {
        unifiedCore.showError('준비 중', '일부 취소 기능은 곧 제공될 예정입니다.');
      });
    }

    // Demo buttons
    const demoBtn = document.getElementById('demo-mode-btn');
    const errorDemoBtn = document.getElementById('error-demo-btn');

    if (demoBtn) {
      demoBtn.addEventListener('click', () => this.startDemoMode());
    }
    if (errorDemoBtn) {
      errorDemoBtn.addEventListener('click', () => {
        unifiedCore.showError('데모: 에러 발생', '이것은 에러 모달의 데모입니다.');
      });
    }
  }

  /**
   * Setup file upload
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
   * Handle project creation
   */
  async handleProjectCreation(e) {
    e.preventDefault();

    const projectName = document.getElementById('project-name')?.value.trim();
    const userIdea = document.getElementById('project-idea')?.value.trim();
    const outputFormat = document.querySelector('input[name="output-format"]:checked')?.value || 'html';

    if (!projectName || !userIdea) {
      unifiedCore.showError('입력 오류', '프로젝트 이름과 아이디어를 모두 입력해주세요.');
      return;
    }

    // Check if can create
    if (!unifiedCore.canCreateProject()) {
      unifiedCore.showError(
        '프로젝트 제한',
        '최대 3개의 프로젝트만 동시에 진행할 수 있습니다.\n진행 중인 프로젝트를 완료하거나 취소해주세요.'
      );
      return;
    }

    try {
      // Create project
      const project = await unifiedCore.createProject({
        projectName,
        userIdea,
        references: this.tempReferences,
        outputFormat
      });

      // Reset form
      document.getElementById('project-form')?.reset();
      this.tempReferences = [];
      this.renderFileList();

      // Render UI
      unifiedCore.renderProjects();
      unifiedCore.updateStats();

      // Start execution
      unifiedCore.startExecution(project.projectId);

    } catch (error) {
      console.error('[App] Project creation failed:', error);
      unifiedCore.showError('프로젝트 생성 실패', error.message);
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
   * Process files
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
    unifiedCore.addLog('INFO', `📎 파일 추가: ${files.length}개`);
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
        </span>
        <button
          onclick="window.planCraftApp.removeFile(${index})"
          class="text-red-600 hover:text-red-800"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    `).join('');
  }

  /**
   * Remove file
   */
  removeFile(index) {
    this.tempReferences.splice(index, 1);
    this.renderFileList();
  }

  /**
   * Start demo mode
   */
  async startDemoMode() {
    if (!unifiedCore.canCreateProject()) {
      unifiedCore.showError(
        '데모 모드 시작 불가',
        '진행 중인 프로젝트가 최대치입니다. 먼저 프로젝트를 완료하거나 취소해주세요.'
      );
      return;
    }

    const demoProject = {
      projectName: '데모: AI 쇼핑몰 기획서',
      userIdea: '사용자가 상품을 검색하고 구매할 수 있는 AI 기반 쇼핑몰 플랫폼. 개인화된 추천 시스템과 간편 결제 기능을 포함합니다.',
      outputFormat: 'html'
    };

    try {
      const project = await unifiedCore.createProject(demoProject);
      
      unifiedCore.renderProjects();
      unifiedCore.updateStats();
      
      unifiedCore.startExecution(project.projectId);

    } catch (error) {
      console.error('[Demo] Error:', error);
      unifiedCore.showError('데모 시작 실패', error.message);
    }
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

// Create instance
const planCraftApp = new PlanCraftApp();

// Expose to window
if (typeof window !== 'undefined') {
  window.planCraftApp = planCraftApp;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => planCraftApp.init());
} else {
  planCraftApp.init();
}

export default planCraftApp;

console.log('[App v4.0 Module] ✅ Loaded successfully');
