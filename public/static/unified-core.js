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
    this.dynamicAgents = new Map(); // Dynamic agents for current projects
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
    
    // Analyze project and estimate time
    const timeEstimate = this.estimateProjectTime(
      data.projectName || 'Untitled',
      data.userIdea || '',
      data.references || []
    );
    
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
      estimatedDuration: timeEstimate.estimatedTime * 60, // Convert minutes to seconds
      timeEstimate: timeEstimate,
      logs: []
    };

    this.projects.set(projectId, project);
    
    // Create dynamic agents based on project idea
    this.createDynamicAgents(projectId, data.userIdea || '');
    
    this.addLog('INFO', `📋 프로젝트 생성: ${project.projectName} (ID: ${projectId})`);
    this.addLog('INFO', `⏱️ 예상 소요 시간: ${timeEstimate.estimatedTimeText} (복잡도: ${timeEstimate.complexityLabel})`);
    
    // Show time estimate modal
    this.showTimeEstimateModal(project);
    
    return project;
  }
  
  /**
   * Estimate project time based on analysis
   */
  estimateProjectTime(projectName, userIdea, references = []) {
    // Determine complexity
    const complexity = this.analyzeComplexity(userIdea, references);
    
    // Calculate base time
    const baseTime = this.calculateTotalDuration() / 60; // Convert to minutes
    
    // Complexity factors
    const factors = {
      'simple': 0.7,
      'medium': 1.0,
      'complex': 1.5,
      'very-complex': 2.0
    };
    
    const factor = factors[complexity];
    const estimatedTime = Math.round(baseTime * factor);
    
    return {
      complexity,
      complexityLabel: this.getComplexityLabel(complexity),
      baseTime,
      factor,
      estimatedTime, // in minutes
      estimatedTimeText: this.formatMinutes(estimatedTime)
    };
  }
  
  /**
   * Analyze project complexity
   */
  analyzeComplexity(userIdea, references) {
    const idea = userIdea.toLowerCase();
    let score = 0;

    // Complex keywords
    const complexKeywords = [
      'ai', '인공지능', '머신러닝', 'ml', 'deep learning',
      '블록체인', 'blockchain', '실시간', 'real-time',
      '대규모', 'scale', '분산', 'distributed'
    ];

    // Medium keywords
    const mediumKeywords = [
      'api', '데이터베이스', 'database', '인증', 'auth',
      '결제', 'payment', '검색', 'search'
    ];

    complexKeywords.forEach(keyword => {
      if (idea.includes(keyword)) score += 2;
    });

    mediumKeywords.forEach(keyword => {
      if (idea.includes(keyword)) score += 1;
    });

    score += references.length * 0.5;

    const wordCount = userIdea.split(/\s+/).length;
    if (wordCount > 100) score += 2;
    else if (wordCount > 50) score += 1;

    if (score >= 8) return 'very-complex';
    if (score >= 5) return 'complex';
    if (score >= 2) return 'medium';
    return 'simple';
  }
  
  /**
   * Get complexity label
   */
  getComplexityLabel(complexity) {
    const labels = {
      'simple': '간단함 (70%)',
      'medium': '보통 (100%)',
      'complex': '복잡함 (150%)',
      'very-complex': '매우 복잡함 (200%)'
    };
    return labels[complexity] || '보통';
  }
  
  /**
   * Format minutes to readable time
   */
  formatMinutes(minutes) {
    if (minutes < 60) {
      return `${minutes}분`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  }
  
  /**
   * Show time estimate modal
   */
  showTimeEstimateModal(project) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div class="text-center mb-4">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <i class="fas fa-clock text-blue-600 text-2xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">
            프로젝트 시간 예측
          </h3>
          <p class="text-gray-600 text-sm">
            ${project.projectName}
          </p>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-700 font-semibold">복잡도</span>
            <span class="text-blue-600 font-bold">${project.timeEstimate.complexityLabel}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-700 font-semibold">예상 시간</span>
            <span class="text-blue-600 font-bold text-lg">${project.timeEstimate.estimatedTimeText}</span>
          </div>
        </div>
        
        <p class="text-sm text-gray-600 mb-4 text-center">
          프로젝트를 시작하시겠습니까?
        </p>
        
        <div class="flex gap-3">
          <button
            class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-all"
            onclick="this.closest('.fixed').remove()"
          >
            취소
          </button>
          <button
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
            onclick="window.unifiedCore.confirmAndStartProject('${project.projectId}'); this.closest('.fixed').remove();"
          >
            <i class="fas fa-play mr-2"></i>
            시작
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
  
  /**
   * Confirm and start project (called from modal)
   */
  confirmAndStartProject(projectId) {
    const project = this.projects.get(projectId);
    if (!project) {
      console.error('[UnifiedCore] Project not found:', projectId);
      return;
    }
    
    // Start execution
    this.startExecution(projectId);
    
    // Render projects
    this.renderProjects();
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
    
    // Update AI agent model displays
    this.updateAIAgentModels();
  }
  
  /**
   * Update AI agent model displays with current running model
   */
  updateAIAgentModels() {
    // Find currently active phase across all projects
    let activeModel = null;
    let activeAgent = null;
    let activeProjectName = null;
    let hasActiveProjects = false;
    
    this.projects.forEach((project) => {
      if (project.status === 'active' && project.currentPhase) {
        hasActiveProjects = true;
        const modelName = PHASE_TO_MODEL[project.currentPhase];
        const agentName = MODEL_TO_AGENT[modelName];
        
        if (modelName && agentName) {
          activeModel = modelName;
          activeAgent = agentName;
          activeProjectName = project.projectName;
        }
      }
    });
    
    // Update all agent cards
    const agents = [
      { name: 'Master Orchestrator', model: 'gpt-5.2-preview' },
      { name: 'Code Agent', model: 'gpt-5-turbo' },
      { name: 'Quality Agent', model: 'gpt-5o-mini' },
      { name: 'DevOps Agent', model: 'gemini-3.0-flash' }
    ];
    
    agents.forEach((agent, index) => {
      const agentCard = document.querySelector(`.agent-card:nth-child(${index + 1})`);
      if (!agentCard) return;
      
      const modelDisplayEl = agentCard.querySelector('.agent-model-display');
      const statusDotEl = agentCard.querySelector('.agent-status-dot');
      const spinnerEl = agentCard.querySelector('.agent-spinner');
      
      // Check if this agent is currently active
      const isActive = hasActiveProjects && activeAgent === agent.name;
      
      if (modelDisplayEl) {
        if (isActive && activeProjectName) {
          modelDisplayEl.innerHTML = `
            <div class="text-xs text-blue-600 font-semibold animate-pulse">
              <i class="fas fa-bolt mr-1"></i>
              실행 중: ${agent.model}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              프로젝트: ${activeProjectName.substring(0, 20)}${activeProjectName.length > 20 ? '...' : ''}
            </div>
          `;
        } else {
          modelDisplayEl.innerHTML = `
            <div class="text-xs text-gray-400">
              대기 중: ${agent.model}
            </div>
          `;
        }
      }
      
      // Update status dot
      if (statusDotEl) {
        if (isActive) {
          statusDotEl.className = 'agent-status-dot absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse';
        } else if (hasActiveProjects) {
          statusDotEl.className = 'agent-status-dot absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white';
        } else {
          // All stopped - gray
          statusDotEl.className = 'agent-status-dot absolute -top-1 -right-1 w-4 h-4 bg-gray-400 rounded-full border-2 border-white';
        }
      }
      
      // Update spinner
      if (spinnerEl) {
        if (isActive) {
          spinnerEl.classList.remove('hidden');
          spinnerEl.classList.add('animate-spin');
        } else {
          spinnerEl.classList.add('hidden');
          spinnerEl.classList.remove('animate-spin');
        }
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

    // Stop all AI model animations
    this.deactivateAllAIModels();

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

    // Stop all AI model animations
    this.deactivateAllAIModels();

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

    // Show current model name
    const modelNameDisplay = modelCard.querySelector('.agent-current-model');
    if (modelNameDisplay) {
      modelNameDisplay.classList.remove('hidden');
      const modelNameSpan = modelNameDisplay.querySelector('.model-name');
      if (modelNameSpan) {
        modelNameSpan.textContent = modelName;
      }
    }

    this.addLog('INFO', `🤖 AI 모델 활성화: ${agentName} (${modelName})`);
    
    // Add to thinking process
    if (window.thinkingProcess) {
      window.thinkingProcess.addExecution(task, 0, `${agentName} 모델 활성화: ${modelName}`);
    }
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

    // Hide current model name
    const modelNameDisplay = modelCard.querySelector('.agent-current-model');
    if (modelNameDisplay) {
      modelNameDisplay.classList.add('hidden');
    }
  }

  /**
   * Deactivate all AI models (called on stop/cancel)
   */
  deactivateAllAIModels() {
    const allModelCards = document.querySelectorAll('.ai-agent-status');
    
    allModelCards.forEach(modelCard => {
      // Hide and stop spinner animation
      const spinner = modelCard.querySelector('.agent-spinner');
      if (spinner) {
        spinner.classList.add('hidden');
        spinner.classList.remove('animate-spin');
      }

      // Change status dot to gray (stopped)
      const dot = modelCard.querySelector('.agent-status-dot');
      if (dot) {
        dot.classList.remove('bg-blue-500', 'bg-green-500', 'animate-pulse');
        dot.classList.add('bg-gray-400');
      }

      // Reset model display to waiting state
      const modelDisplay = modelCard.querySelector('.agent-model-display');
      if (modelDisplay) {
        const modelAttr = modelCard.getAttribute('data-model');
        modelDisplay.innerHTML = `
          <div class="text-xs text-gray-400">
            대기 중: ${modelAttr || 'N/A'}
          </div>
        `;
      }
    });

    this.addLog('INFO', '🛑 모든 AI 에이전트 정지됨');
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
  /**
   * Analyze project and determine required agents
   */
  analyzeProjectRequirements(projectIdea) {
    const idea = projectIdea.toLowerCase();
    const requiredAgents = [];

    // Always add Master Orchestrator
    requiredAgents.push({
      name: 'Master Orchestrator',
      role: '전체 조율 및 전략',
      model: 'claude-3.5-sonnet',
      color: 'purple',
      icon: 'fa-crown',
      reason: '프로젝트 전체 전략 수립 및 조율'
    });

    // Analyze project idea keywords
    const keywords = {
      backend: ['api', 'backend', 'server', 'database', 'crud', '백엔드', '서버', '데이터베이스'],
      frontend: ['ui', 'frontend', 'interface', 'design', '화면', '인터페이스', '디자인', 'ux'],
      data: ['data', 'analysis', 'visualization', 'chart', '분석', '데이터', '시각화'],
      ai: ['ai', 'ml', 'machine learning', 'nlp', 'gpt', '인공지능', '머신러닝'],
      deployment: ['deploy', 'devops', 'ci/cd', 'production', '배포', '운영']
    };

    // Backend Agent
    if (keywords.backend.some(kw => idea.includes(kw))) {
      requiredAgents.push({
        name: 'Backend Agent',
        role: 'API 및 데이터베이스 설계',
        model: 'gpt-4-turbo',
        color: 'blue',
        icon: 'fa-server',
        reason: '백엔드 로직 및 API 설계 필요'
      });
    }

    // Frontend Agent
    if (keywords.frontend.some(kw => idea.includes(kw))) {
      requiredAgents.push({
        name: 'Frontend Agent',
        role: 'UI/UX 설계 및 구현',
        model: 'gpt-4o',
        color: 'indigo',
        icon: 'fa-palette',
        reason: 'UI/UX 설계 및 구현 필요'
      });
    }

    // Data Agent
    if (keywords.data.some(kw => idea.includes(kw))) {
      requiredAgents.push({
        name: 'Data Agent',
        role: '데이터 분석 및 시각화',
        model: 'claude-3-opus',
        color: 'green',
        icon: 'fa-chart-line',
        reason: '데이터 분석 및 시각화 필요'
      });
    }

    // AI Agent
    if (keywords.ai.some(kw => idea.includes(kw))) {
      requiredAgents.push({
        name: 'AI Agent',
        role: 'AI/ML 모델 설계',
        model: 'gpt-4-turbo',
        color: 'pink',
        icon: 'fa-brain',
        reason: 'AI/ML 기능 구현 필요'
      });
    }

    // DevOps Agent (always add for deployment)
    requiredAgents.push({
      name: 'DevOps Agent',
      role: '빌드 및 배포 자동화',
      model: 'gemini-2.0-flash',
      color: 'orange',
      icon: 'fa-rocket',
      reason: '배포 및 운영 관리 필요'
    });

    return requiredAgents;
  }

  /**
   * Create dynamic agents for a project
   */
  createDynamicAgents(projectId, projectIdea) {
    const agents = this.analyzeProjectRequirements(projectIdea);
    this.dynamicAgents.set(projectId, agents);

    // Log to thinking process
    if (window.thinkingProcess) {
      window.thinkingProcess.addThought(
        'analysis',
        `프로젝트 분석 완료: ${agents.length}개의 AI 에이전트 생성\n` +
        agents.map(a => `• ${a.name}: ${a.reason}`).join('\n')
      );
    }

    // Render dynamic agents
    this.renderDynamicAgents();

    return agents;
  }

  /**
   * Render dynamic agents to UI
   */
  renderDynamicAgents() {
    const container = document.getElementById('dynamic-agents-container');
    if (!container) return;

    // Get all unique agents across all active projects
    const allAgents = new Map();

    this.dynamicAgents.forEach((agents, projectId) => {
      agents.forEach(agent => {
        if (!allAgents.has(agent.name)) {
          allAgents.set(agent.name, agent);
        }
      });
    });

    // Clear existing dynamic agents (keep only Master Orchestrator)
    container.querySelectorAll('.ai-agent-status').forEach((el, index) => {
      if (index > 0) el.remove(); // Remove all except first (Master Orchestrator)
    });

    // Add dynamic agents
    allAgents.forEach((agent, name) => {
      if (name === 'Master Orchestrator') return; // Skip, already present

      const agentCard = this.createAgentCard(agent);
      container.appendChild(agentCard);
    });
  }

  /**
   * Create agent card element
   */
  createAgentCard(agent) {
    // Color mapping for Tailwind classes (use predefined classes only)
    const colorClasses = {
      'purple': {
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
        border: 'border-purple-200',
        icon: 'bg-purple-600',
        text: 'text-purple-900',
        subtext: 'text-purple-600',
        spinner: 'border-purple-200 border-t-purple-600'
      },
      'blue': {
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
        border: 'border-blue-200',
        icon: 'bg-blue-600',
        text: 'text-blue-900',
        subtext: 'text-blue-600',
        spinner: 'border-blue-200 border-t-blue-600'
      },
      'indigo': {
        bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
        border: 'border-indigo-200',
        icon: 'bg-indigo-600',
        text: 'text-indigo-900',
        subtext: 'text-indigo-600',
        spinner: 'border-indigo-200 border-t-indigo-600'
      },
      'green': {
        bg: 'bg-gradient-to-br from-green-50 to-green-100',
        border: 'border-green-200',
        icon: 'bg-green-600',
        text: 'text-green-900',
        subtext: 'text-green-600',
        spinner: 'border-green-200 border-t-green-600'
      },
      'pink': {
        bg: 'bg-gradient-to-br from-pink-50 to-pink-100',
        border: 'border-pink-200',
        icon: 'bg-pink-600',
        text: 'text-pink-900',
        subtext: 'text-pink-600',
        spinner: 'border-pink-200 border-t-pink-600'
      },
      'orange': {
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
        border: 'border-orange-200',
        icon: 'bg-orange-600',
        text: 'text-orange-900',
        subtext: 'text-orange-600',
        spinner: 'border-orange-200 border-t-orange-600'
      }
    };

    const colors = colorClasses[agent.color] || colorClasses['blue'];

    const card = document.createElement('div');
    card.className = `ai-agent-status agent-card flex items-center gap-2 p-3 ${colors.bg} rounded-lg border-2 ${colors.border}`;
    card.setAttribute('data-agent', agent.name.toLowerCase().replace(/\s+/g, '-'));
    card.setAttribute('data-model', agent.model);

    card.innerHTML = `
      <div class="relative">
        <div class="w-10 h-10 ${colors.icon} rounded-full flex items-center justify-center">
          <i class="fas ${agent.icon} text-white text-lg"></i>
        </div>
        <div class="agent-spinner absolute inset-0 hidden">
          <div class="w-full h-full rounded-full border-4 ${colors.spinner} animate-spin"></div>
        </div>
        <div class="agent-status-dot absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="text-sm font-bold ${colors.text}">${agent.name}</h3>
        <p class="text-xs ${colors.subtext} truncate">${agent.role}</p>
        <div class="agent-model-display mt-1">
          <div class="text-xs text-gray-400">
            대기 중: ${agent.model}
          </div>
        </div>
      </div>
    `;

    return card;
  }

  /**
   * Clear dynamic agents for a project
   */
  clearDynamicAgents(projectId) {
    this.dynamicAgents.delete(projectId);
    this.renderDynamicAgents();
  }

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
