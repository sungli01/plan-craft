// Plan-Craft v4.0 - UNIFIED CORE SYSTEM
// ==========================================
// Complete rewrite with guaranteed synchronization
// Document generation system - NOT a coding tool

import { 
  PHASE_ORDER, 
  PHASE_TO_MODEL, 
  MODEL_TO_AGENT, 
  PHASE_TASKS,
  getPhaseDuration,
  getPhaseLabel,
  APP_CONFIG
} from './constants.js';

/**
 * Unified Core System
 * Single source of truth for all state management
 */
class UnifiedCore {
  constructor() {
    this.projects = new Map();
    this.activeExecutions = new Map();
    this.timers = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the system
   */
  async init() {
    if (this.initialized) return;
    
    console.log('[UnifiedCore] 🚀 Initializing...');
    this.initialized = true;
    
    // Start UI update loop (every second)
    setInterval(() => this.updateAllUI(), 1000);
    
    console.log('[UnifiedCore] ✅ Initialized');
  }

  /**
   * Create a new project
   */
  async createProject(data) {
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const project = {
      projectId,
      projectName: data.projectName || 'Untitled',
      userIdea: data.userIdea || '',
      outputFormat: data.outputFormat || 'html',
      status: 'active',
      currentPhase: 'G1_CORE_LOGIC',
      currentPhaseIndex: 0,
      progress: 0,
      startTime: Date.now(),
      estimatedDuration: this.calculateTotalDuration(),
      logs: []
    };

    this.projects.set(projectId, project);
    
    this.addLog('INFO', `📋 프로젝트 생성: ${project.projectName} (ID: ${projectId})`);
    
    return project;
  }

  /**
   * Start project execution
   */
  async startExecution(projectId) {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    this.addLog('INFO', `🚀 문서 생성 시작: ${project.projectName}`);
    
    // Start timer
    this.startTimer(projectId);
    
    // Start execution
    this.activeExecutions.set(projectId, {
      status: 'running',
      startTime: Date.now(),
      currentPhaseIndex: 0
    });

    // Execute all phases
    try {
      for (let i = 0; i < PHASE_ORDER.length; i++) {
        const phase = PHASE_ORDER[i];
        const execution = this.activeExecutions.get(projectId);
        
        if (!execution || execution.status !== 'running') {
          throw new Error('Execution cancelled');
        }

        project.currentPhase = phase;
        project.currentPhaseIndex = i;
        execution.currentPhaseIndex = i;

        await this.executePhase(projectId, phase, i);
      }

      // Completion
      await this.completeProject(projectId);
      
    } catch (error) {
      this.addLog('ERROR', `❌ 실행 오류: ${error.message}`);
      this.stopTimer(projectId);
      this.activeExecutions.delete(projectId);
    }
  }

  /**
   * Execute single phase
   */
  async executePhase(projectId, phase, phaseIndex) {
    const project = this.projects.get(projectId);
    const modelName = PHASE_TO_MODEL[phase];
    const agentName = MODEL_TO_AGENT[modelName];
    const task = PHASE_TASKS[phase];
    const duration = getPhaseDuration(phase);

    // Activate AI model
    this.activateAIModel(modelName, agentName, task);

    this.addLog('INFO', `🤖 ${agentName} 시작: ${getPhaseLabel(phase)}`);

    // Execute 10 steps
    const steps = 10;
    const stepDuration = (duration * 60 * 1000) / steps;

    for (let step = 1; step <= steps; step++) {
      const execution = this.activeExecutions.get(projectId);
      if (!execution || execution.status !== 'running') {
        throw new Error('Execution cancelled');
      }

      // Update progress
      const totalSteps = PHASE_ORDER.length * 10;
      const currentStep = (phaseIndex * 10) + step;
      project.progress = Math.round((currentStep / totalSteps) * 100);

      // Detailed step description
      const stepDesc = this.getStepDescription(step);
      this.addLog('INFO', `📝 ${getPhaseLabel(phase)} [${Math.round((step/steps)*100)}%] ${stepDesc}`);

      await this.sleep(stepDuration);
    }

    // Deactivate AI model
    this.deactivateAIModel(modelName);
    
    this.addLog('SUCCESS', `✅ ${getPhaseLabel(phase)} 완료`);
  }

  /**
   * Complete project
   */
  async completeProject(projectId) {
    const project = this.projects.get(projectId);
    if (!project) return;

    project.status = 'completed';
    project.progress = 100;

    this.stopTimer(projectId);
    this.activeExecutions.delete(projectId);

    this.addLog('SUCCESS', `🎉 문서 생성 완료: ${project.projectName}`);

    // Show completion modal
    this.showCompletionModal(project);
  }

  /**
   * Show completion modal (delegates to downloadManager)
   */
  showCompletionModal(project) {
    if (window.downloadManager) {
      window.downloadManager.showDownloadModal(project);
    } else {
      // Fallback
      alert(`✅ 프로젝트 완료!\n\n${project.projectName}\n\n다운로드 관리자를 사용할 수 없습니다.`);
    }
  }

  /**
   * Download document (delegates to downloadManager)
   */
  downloadDocument(projectId) {
    if (window.downloadManager) {
      window.downloadManager.handleDownload(projectId);
    } else {
      this.addLog('ERROR', '다운로드 관리자를 사용할 수 없습니다');
    }
  }

  /**
   * Get project (public method for external access)
   */
  getProject(projectId) {
    return this.projects.get(projectId);
  }

  /**
   * Timer management
   */
  startTimer(projectId) {
    const timerInfo = {
      projectId,
      startTime: Date.now(),
      elapsed: 0 // seconds
    };

    const intervalId = setInterval(() => {
      timerInfo.elapsed++;
    }, 1000);

    timerInfo.intervalId = intervalId;
    this.timers.set(projectId, timerInfo);
  }

  stopTimer(projectId) {
    const timer = this.timers.get(projectId);
    if (!timer) return;

    if (timer.intervalId) {
      clearInterval(timer.intervalId);
    }

    this.timers.delete(projectId);
  }

  /**
   * Get elapsed time
   */
  getElapsedTime(projectId) {
    const timer = this.timers.get(projectId);
    return timer ? timer.elapsed : 0;
  }

  /**
   * Format time
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
   * Calculate remaining time
   */
  getRemainingTime(projectId) {
    const project = this.projects.get(projectId);
    if (!project) return 0;

    const elapsed = this.getElapsedTime(projectId);
    const total = project.estimatedDuration;
    const remaining = Math.max(0, total - elapsed);

    return remaining;
  }

  /**
   * Update all UI (called every second)
   */
  updateAllUI() {
    this.projects.forEach((project, projectId) => {
      if (project.status !== 'active') return;

      const elapsed = this.getElapsedTime(projectId);
      const remaining = this.getRemainingTime(projectId);

      // Update time display
      const timeInfoEl = document.getElementById(`time-info-${projectId}`);
      if (timeInfoEl) {
        timeInfoEl.innerHTML = `
          <span class="text-blue-600 font-semibold text-xs">
            <i class="fas fa-clock mr-1"></i>
            경과: <span class="font-mono">${this.formatTime(elapsed)}</span>
          </span>
          <span class="text-purple-600 font-semibold text-xs ml-3">
            <i class="fas fa-hourglass-half mr-1"></i>
            남음: <span class="font-mono">${this.formatTime(remaining)}</span>
          </span>
        `;
      }

      // Update progress bar
      const progressBar = document.getElementById(`progress-bar-${projectId}`);
      if (progressBar) {
        progressBar.style.width = `${project.progress}%`;
      }

      // Update progress text
      const progressText = document.getElementById(`progress-text-${projectId}`);
      if (progressText) {
        progressText.textContent = `${project.progress}%`;
      }
    });
  }

  /**
   * Render all projects
   */
  renderProjects() {
    const container = document.getElementById('active-projects-container');
    const noProjectsMsg = document.getElementById('no-projects-message');

    if (!container) return;

    const activeProjects = Array.from(this.projects.values())
      .filter(p => p.status === 'active')
      .slice(0, APP_CONFIG.MAX_PROJECTS);

    if (activeProjects.length === 0) {
      if (noProjectsMsg) noProjectsMsg.style.display = 'block';
      container.querySelectorAll('.project-card').forEach(card => card.remove());
      return;
    }

    if (noProjectsMsg) noProjectsMsg.style.display = 'none';

    // Clear existing cards
    container.querySelectorAll('.project-card').forEach(card => card.remove());

    // Render each project
    activeProjects.forEach((project, index) => {
      const card = this.createProjectCard(project, index);
      container.appendChild(card);
    });
  }

  /**
   * Create project card
   */
  createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'project-card bg-gradient-to-r from-white to-blue-50 rounded-lg p-4 border-2 border-blue-200 shadow-md';
    card.id = `project-card-${project.projectId}`;

    const elapsed = this.getElapsedTime(project.projectId);
    const remaining = this.getRemainingTime(project.projectId);

    card.innerHTML = `
      <div class="flex justify-between items-start mb-3">
        <div class="flex-1">
          <h3 class="text-lg font-bold text-gray-800 mb-1">
            <i class="fas fa-file-alt text-indigo-600 mr-1"></i>
            ${this.escapeHtml(project.projectName)}
          </h3>
          <p class="text-xs text-gray-600">ID: ${project.projectId}</p>
        </div>
        <span class="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
          진행중
        </span>
      </div>

      <div class="mb-3">
        <p class="text-sm font-semibold text-purple-700 mb-1">
          <i class="fas fa-tasks mr-1"></i>
          ${getPhaseLabel(project.currentPhase)}
        </p>
        <div class="flex items-center gap-2">
          <div class="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              id="progress-bar-${project.projectId}"
              class="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
              style="width: ${project.progress}%"
            ></div>
          </div>
          <span id="progress-text-${project.projectId}" class="text-sm font-bold text-purple-600 min-w-[45px]">
            ${project.progress}%
          </span>
        </div>
      </div>

      <div id="time-info-${project.projectId}" class="flex items-center justify-between mb-3">
        <span class="text-blue-600 font-semibold text-xs">
          <i class="fas fa-clock mr-1"></i>
          경과: <span class="font-mono">${this.formatTime(elapsed)}</span>
        </span>
        <span class="text-purple-600 font-semibold text-xs">
          <i class="fas fa-hourglass-half mr-1"></i>
          남음: <span class="font-mono">${this.formatTime(remaining)}</span>
        </span>
      </div>

      <div class="flex gap-2">
        <button
          onclick="window.unifiedCore.showProjectDetails('${project.projectId}')"
          class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all"
        >
          <i class="fas fa-info-circle mr-1"></i>
          상세
        </button>
        <button
          onclick="window.unifiedCore.stopProject('${project.projectId}')"
          class="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all"
        >
          <i class="fas fa-stop mr-1"></i>
          중지
        </button>
      </div>
    `;

    return card;
  }

  /**
   * Stop project
   */
  async stopProject(projectId) {
    if (!confirm('이 프로젝트를 중지하시겠습니까?')) {
      return;
    }

    const project = this.projects.get(projectId);
    if (!project) return;

    project.status = 'paused';
    this.stopTimer(projectId);
    
    const execution = this.activeExecutions.get(projectId);
    if (execution) {
      execution.status = 'paused';
    }

    this.addLog('WARN', `⏸️ 프로젝트 중지: ${project.projectName}`);
    this.renderProjects();
    this.updateStats();
  }

  /**
   * Stop all projects
   */
  async stopAllProjects() {
    const activeProjects = Array.from(this.projects.values())
      .filter(p => p.status === 'active');

    if (activeProjects.length === 0) {
      this.showError('중지 불가', '진행 중인 프로젝트가 없습니다.');
      return;
    }

    if (!confirm(`모든 프로젝트(${activeProjects.length}개)를 중지하시겠습니까?`)) {
      return;
    }

    activeProjects.forEach(project => {
      this.stopProject(project.projectId);
    });

    this.addLog('WARN', `⏸️ 모든 프로젝트 중지됨 (${activeProjects.length}개)`);
  }

  /**
   * Cancel all projects
   */
  async cancelAllProjects() {
    const activeProjects = Array.from(this.projects.values())
      .filter(p => p.status === 'active' || p.status === 'paused');

    if (activeProjects.length === 0) {
      this.showError('취소 불가', '진행 중인 프로젝트가 없습니다.');
      return;
    }

    if (!confirm(`모든 프로젝트(${activeProjects.length}개)를 취소하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    activeProjects.forEach(project => {
      project.status = 'cancelled';
      this.stopTimer(project.projectId);
      
      const execution = this.activeExecutions.get(project.projectId);
      if (execution) {
        execution.status = 'cancelled';
      }
    });

    this.renderProjects();
    this.updateStats();
    this.addLog('WARN', `❌ 모든 프로젝트 취소됨 (${activeProjects.length}개)`);
  }

  /**
   * Show project details
   */
  showProjectDetails(projectId) {
    const project = this.projects.get(projectId);
    if (!project) return;

    const elapsed = this.formatTime(this.getElapsedTime(projectId));
    const remaining = this.formatTime(this.getRemainingTime(projectId));

    alert(`📋 프로젝트 상세 정보\n\n` +
      `이름: ${project.projectName}\n` +
      `ID: ${project.projectId}\n` +
      `상태: ${project.status}\n` +
      `진행도: ${project.progress}%\n` +
      `현재 단계: ${getPhaseLabel(project.currentPhase)}\n` +
      `경과 시간: ${elapsed}\n` +
      `남은 시간: ${remaining}\n` +
      `출력 형식: ${project.outputFormat.toUpperCase()}`);
  }

  /**
   * Update stats
   */
  updateStats() {
    const projects = Array.from(this.projects.values());
    
    const stats = {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      paused: projects.filter(p => p.status === 'paused').length,
      completed: projects.filter(p => p.status === 'completed').length
    };

    const statTotal = document.getElementById('stat-total');
    const statActive = document.getElementById('stat-active');
    const statPaused = document.getElementById('stat-paused');
    const statCompleted = document.getElementById('stat-completed');

    if (statTotal) statTotal.textContent = stats.total;
    if (statActive) statActive.textContent = stats.active;
    if (statPaused) statPaused.textContent = stats.paused;
    if (statCompleted) statCompleted.textContent = stats.completed;
  }

  /**
   * Activate AI model
   */
  activateAIModel(modelName, agentName, task) {
    const modelCard = document.querySelector(`[data-model="${modelName}"]`);
    if (!modelCard) return;

    // Show spinner
    const spinner = modelCard.querySelector('.agent-spinner');
    if (spinner) spinner.classList.remove('hidden');

    // Change status dot to blue (active)
    const dot = modelCard.querySelector('.agent-status-dot');
    if (dot) {
      dot.classList.remove('bg-green-500');
      dot.classList.add('bg-blue-500', 'animate-pulse');
    }

    this.addLog('INFO', `🤖 AI 모델 활성화: ${agentName} (${modelName})`);
  }

  /**
   * Deactivate AI model
   */
  deactivateAIModel(modelName) {
    const modelCard = document.querySelector(`[data-model="${modelName}"]`);
    if (!modelCard) return;

    // Hide spinner
    const spinner = modelCard.querySelector('.agent-spinner');
    if (spinner) spinner.classList.add('hidden');

    // Change status dot back to green (idle)
    const dot = modelCard.querySelector('.agent-status-dot');
    if (dot) {
      dot.classList.remove('bg-blue-500', 'animate-pulse');
      dot.classList.add('bg-green-500');
    }
  }

  /**
   * Add log entry
   */
  addLog(level, message) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { hour12: false });
    
    const terminal = document.getElementById('terminal-console');
    if (!terminal) return;

    const logEntry = document.createElement('div');
    logEntry.className = `text-xs mb-1 ${this.getLogColor(level)}`;
    logEntry.innerHTML = `<span class="text-gray-500">[${timeStr}]</span> ${this.escapeHtml(message)}`;

    terminal.appendChild(logEntry);

    // Keep only last 15 logs
    const logs = terminal.querySelectorAll('div:not(.text-cyan-400):not(.text-yellow-400)');
    if (logs.length > 15) {
      logs[0].remove();
    }

    // Auto scroll
    terminal.scrollTop = terminal.scrollHeight;
  }

  /**
   * Get log color by level
   */
  getLogColor(level) {
    const colors = {
      'INFO': 'text-blue-400',
      'SUCCESS': 'text-green-400',
      'WARN': 'text-yellow-400',
      'ERROR': 'text-red-400'
    };
    return colors[level] || 'text-gray-400';
  }

  /**
   * Show error modal
   */
  showError(title, message) {
    alert(`❌ ${title}\n\n${message}`);
  }

  /**
   * Calculate total duration
   */
  calculateTotalDuration() {
    return PHASE_ORDER.reduce((sum, phase) => {
      return sum + (getPhaseDuration(phase) * 60); // Convert to seconds
    }, 0);
  }

  /**
   * Get step description
   */
  getStepDescription(step) {
    const descriptions = [
      '요구사항 분석 중',
      '구조 설계 중',
      '초안 작성 중',
      '내용 검토 중',
      '중간 점검 중',
      '세부 작성 중',
      '품질 확인 중',
      '최종 검토 중',
      '문서 정리 중',
      '완료 확인 중'
    ];
    return descriptions[step - 1] || '처리 중';
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Can create project?
   */
  canCreateProject() {
    const activeProjects = Array.from(this.projects.values())
      .filter(p => p.status === 'active');
    return activeProjects.length < APP_CONFIG.MAX_PROJECTS;
  }

  /**
   * Get all projects
   */
  getAllProjects() {
    return Array.from(this.projects.values());
  }
}

// Create singleton instance
const unifiedCore = new UnifiedCore();

// Expose to window
if (typeof window !== 'undefined') {
  window.unifiedCore = unifiedCore;
}

export default unifiedCore;

console.log('[Unified Core Module] ✅ Loaded successfully');
