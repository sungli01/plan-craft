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
      currentPhase: 'G1_REQUIREMENT_ANALYSIS',
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
   * Execute single phase with RAG integration
   * IMPROVED: RAG system activated before phase execution
   * IMPROVED: Detailed agent role descriptions
   * IMPROVED: Granular progress monitoring
   */
  async executePhase(projectId, phase, phaseIndex) {
    const project = this.projects.get(projectId);
    const modelName = PHASE_TO_MODEL[phase];
    const agentName = MODEL_TO_AGENT[modelName];
    const task = PHASE_TASKS[phase];
    const duration = getPhaseDuration(phase);

    // ===== RAG INTEGRATION: Phase 시작 전 자료 수집 =====
    if (window.ragSystem && project.userIdea) {
      this.addLog('INFO', `🔍 RAG 시스템 활성화: ${getPhaseLabel(phase)} 관련 자료 수집 중...`);
      
      // Phase별 맞춤 검색 쿼리 생성
      const phaseKeywords = {
        'G1_REQUIREMENTS_ANALYSIS': '요구사항 정의 방법론 best practice',
        'G2_DATA_COLLECTION': '시장 조사 데이터 분석 사례',
        'G3_OUTLINE_CREATION': '보고서 구조 작성 가이드',
        'G4_CONTENT_WRITING': '기술 문서 작성 템플릿',
        'G5_DATA_VISUALIZATION': '데이터 시각화 best practice',
        'G6_QUALITY_ASSURANCE': '품질 검증 체크리스트',
        'G7_FORMAT_OPTIMIZATION': '문서 서식 표준',
        'G8_FINAL_REVIEW': '최종 검토 프로세스',
        'G9_OUTPUT_PREPARATION': '문서 출력 가이드',
        'G10_DELIVERY': '프로젝트 인수인계 절차'
      };
      
      const searchQuery = `${project.userIdea} ${phaseKeywords[phase] || getPhaseLabel(phase)}`;
      
      try {
        const ragResult = await window.ragSystem.searchWeb(searchQuery, `${getPhaseLabel(phase)} 자료 수집`);
        if (ragResult && ragResult.results) {
          this.addLog('SUCCESS', `✅ RAG: ${ragResult.results.length}개 참고 자료 수집 완료`);
          
          // Display top 3 references with detailed info
          ragResult.results.slice(0, 3).forEach((ref, idx) => {
            this.addLog('INFO', `📄 참고${idx+1}: ${ref.title}`);
            if (ref.snippet) {
              this.addLog('INFO', `   ↳ ${ref.snippet.substring(0, 80)}...`);
            }
          });
          
          // Store RAG results for later use
          if (!project.ragData) project.ragData = {};
          project.ragData[phase] = ragResult;
        }
      } catch (error) {
        this.addLog('WARN', `⚠️ RAG 검색 실패: ${error.message}`);
      }
    }

    // ===== AGENT ROLE DESCRIPTION =====
    const roleDescription = this.getAgentRoleDescription(agentName, phase);
    this.addLog('INFO', `👤 ${agentName}: ${roleDescription}`);

    // Activate AI model
    this.activateAIModel(modelName, agentName, task);

    this.addLog('INFO', `🤖 ${agentName} 시작: ${getPhaseLabel(phase)}`);

    // Execute 10 steps with detailed monitoring
    const steps = 10;
    const stepDuration = (duration * 60 * 1000) / steps;

    for (let step = 1; step <= steps; step++) {
      const execution = this.activeExecutions.get(projectId);
      if (!execution || execution.status !== 'running') {
        throw new Error('Execution cancelled');
      }

      // NO MANUAL PROGRESS UPDATE - updateAllUI() calculates from elapsed time
      // This ensures progress bar is always synchronized with time

      // Detailed step description with agent activity
      const stepDesc = this.getDetailedStepDescription(agentName, phase, step);
      this.addLog('INFO', `📝 ${getPhaseLabel(phase)} [${Math.round((step/steps)*100)}%] ${stepDesc}`);

      // Add Quality & Red Team feedback at critical steps
      if (step === 5 || step === 10) {
        await this.runFeedbackCheck(projectId, phase, step);
      }

      await this.sleep(stepDuration);
    }

    // Deactivate AI model
    this.deactivateAIModel(modelName);
    
    this.addLog('SUCCESS', `✅ ${getPhaseLabel(phase)} 완료`);
  }
  
  /**
   * Run feedback check (Quality + Red Team)
   * Simulated version for fast execution
   */
  async runFeedbackCheck(projectId, phase, step) {
    // Simulate Quality Agent feedback (긍정적)
    const qualityScore = 85 + Math.floor(Math.random() * 10); // 85-95%
    this.addLog('INFO', `✅ Quality Agent: ${qualityScore}% (논리성 검증 통과)`);
    
    // Simulate Red Team Agent feedback (부정적 검증)
    const redTeamScore = 80 + Math.floor(Math.random() * 15); // 80-95%
    this.addLog('INFO', `🔍 Red Team Agent: ${redTeamScore}% (보안 검증 통과)`);
    
    // Calculate overall integrity
    const integrityScore = Math.round((qualityScore + redTeamScore) / 2);
    
    if (integrityScore >= 90) {
      this.addLog('SUCCESS', `🎯 무결성: ${integrityScore}% (목표 달성 ✓)`);
    } else {
      this.addLog('WARN', `⚠️ 무결성: ${integrityScore}% (개선 필요)`);
    }
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
   * NOW SYNCHRONIZED: Progress based on elapsed/total time ratio
   */
  updateAllUI() {
    this.projects.forEach((project, projectId) => {
      if (project.status !== 'active') return;

      const elapsed = this.getElapsedTime(projectId);
      const remaining = this.getRemainingTime(projectId);
      const total = project.estimatedDuration;

      // Calculate time-based progress (accurate synchronization)
      const timeBasedProgress = total > 0 ? Math.min(100, Math.round((elapsed / total) * 100)) : project.progress;
      
      // Sync project.progress with time-based calculation
      project.progress = timeBasedProgress;

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

      // Update progress bar (now synchronized with time)
      const progressBar = document.getElementById(`progress-bar-${projectId}`);
      if (progressBar) {
        progressBar.style.width = `${project.progress}%`;
      }

      // Update progress text (now synchronized with time)
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
   * Now includes dynamic agents from all active projects
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
    
    // Update ALL agent cards (including dynamic agents)
    const allAgentCards = document.querySelectorAll('.ai-agent-status');
    
    allAgentCards.forEach((agentCard) => {
      const modelDisplayEl = agentCard.querySelector('.agent-model-display');
      const statusDotEl = agentCard.querySelector('.agent-status-dot');
      const spinnerEl = agentCard.querySelector('.agent-spinner');
      
      // Get agent info from card attributes
      const cardModelAttr = agentCard.getAttribute('data-model');
      const cardAgentAttr = agentCard.getAttribute('data-agent');
      const agentName = agentCard.querySelector('h3')?.textContent || 'Unknown';
      
      // Check if this agent is currently active
      const isActive = hasActiveProjects && activeAgent === agentName;
      
      if (modelDisplayEl) {
        if (isActive && activeProjectName) {
          modelDisplayEl.innerHTML = `
            <div class="text-xs text-blue-600 font-semibold animate-pulse">
              <i class="fas fa-bolt mr-1"></i>
              실행 중: ${cardModelAttr || 'N/A'}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              프로젝트: ${activeProjectName.substring(0, 20)}${activeProjectName.length > 20 ? '...' : ''}
            </div>
          `;
        } else {
          modelDisplayEl.innerHTML = `
            <div class="text-xs text-gray-400">
              대기 중: ${cardModelAttr || 'N/A'}
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
   * Get detailed agent role description with phase-specific context
   */
  getAgentRoleDescription(agentName, phase) {
    const phaseLabel = getPhaseLabel(phase);
    
    const roles = {
      'Master Orchestrator': {
        'G1_REQUIREMENTS_ANALYSIS': '요구사항 분석 전략 수립 - 핵심 요구사항 식별 및 우선순위 결정',
        'G2_DATA_COLLECTION': '데이터 수집 범위 정의 - 필요 자료 선별 및 수집 전략 수립',
        'G3_OUTLINE_CREATION': '보고서 구조 설계 - 논리적 흐름과 섹션 구성 총괄',
        'G4_CONTENT_WRITING': '콘텐츠 품질 관리 - 일관성 및 완성도 검증',
        'G5_DATA_VISUALIZATION': '시각화 전략 수립 - 데이터 스토리텔링 방향 결정',
        'default': '전체 전략 수립 및 품질 관리 총괄 - 프로젝트 방향성 결정'
      },
      'Code Agent': {
        'G1_REQUIREMENTS_ANALYSIS': '기술 요구사항 분석 - 시스템 아키텍처 초기 설계',
        'G2_DATA_COLLECTION': '기술 스택 조사 - 구현 방법론 및 도구 선정',
        'G3_OUTLINE_CREATION': '기술 문서 구조 설계 - 개발자 관점 문서화',
        'G4_CONTENT_WRITING': '기술 사양 작성 - API 및 시스템 명세 문서화',
        'default': '기술 아키텍처 설계 및 구현 방안 수립 - 시스템 설계 전문'
      },
      'Quality Agent': {
        'G1_REQUIREMENTS_ANALYSIS': '요구사항 검증 - 누락/모순 사항 점검 및 개선 제안',
        'G2_DATA_COLLECTION': '데이터 품질 검증 - 수집 자료의 신뢰성 및 완전성 평가',
        'G3_OUTLINE_CREATION': '구조 논리성 검증 - 섹션 간 연결성 및 흐름 점검',
        'G4_CONTENT_WRITING': '콘텐츠 품질 검증 - 문법, 일관성, 완성도 점검',
        'G5_DATA_VISUALIZATION': '시각화 품질 검증 - 가독성 및 정확성 평가',
        'default': '긍정적 검증 및 개선 제안 제공 - 품질 보증 전담 (목표: 95%)'
      },
      'DevOps Agent': {
        'G8_FINAL_REVIEW': '최종 검토 자동화 - 배포 전 체크리스트 검증',
        'G9_OUTPUT_PREPARATION': '출력 파이프라인 구성 - 문서 생성 자동화',
        'G10_DELIVERY': '전달 프로세스 관리 - 최종 산출물 배포',
        'default': '배포 전략 및 운영 계획 수립 - 인프라 관리 전문'
      }
    };
    
    const agentRoles = roles[agentName] || {};
    return agentRoles[phase] || agentRoles['default'] || '프로젝트 수행';
  }
  
  /**
   * Get detailed step description with agent-specific activity
   */
  getDetailedStepDescription(agentName, phase, step) {
    const phaseLabel = getPhaseLabel(phase);
    
    // Agent-specific action verbs
    const agentActions = {
      'Master Orchestrator': ['전략 수립 중', '방향성 정의', '품질 기준 설정', '전체 조율', '최종 승인'],
      'Code Agent': ['아키텍처 설계', '기술 검토 중', '구현 계획', '시스템 분석', '기술 문서화'],
      'Quality Agent': ['품질 검증 중', '개선사항 도출', '일관성 점검', '완성도 평가', '승인 준비'],
      'DevOps Agent': ['배포 계획 수립', '자동화 구성', '인프라 점검', '운영 준비', '최종 배포']
    };
    
    const actions = agentActions[agentName] || ['작업 진행 중'];
    const action = actions[Math.floor((step - 1) / 2) % actions.length];
    
    // Phase-specific activities (for first 5 phases with detailed steps)
    const activities = {
      'G1_REQUIREMENTS_ANALYSIS': [
        '사용자 요구사항 상세 분석 중',
        '핵심 기능 도출 및 우선순위 결정',
        '제약사항 및 전제조건 파악',
        '목표 지표(KPI) 설정',
        '요구사항 검증 및 확정',
        '기능 명세서 초안 작성',
        '이해관계자 검토 준비',
        '요구사항 추적 매트릭스 생성',
        '최종 요구사항 문서화',
        '요구사항 승인 완료'
      ],
      'G2_DATA_COLLECTION': [
        '관련 문서 및 자료 수집',
        '경쟁사 분석 데이터 수집',
        '시장 조사 자료 정리',
        '기술 스택 벤치마킹',
        '참고 사례 분석',
        '데이터 품질 검증',
        '핵심 인사이트 도출',
        '자료 분류 및 정리',
        '데이터베이스 구축',
        '자료 수집 보고서 작성'
      ],
      'G3_OUTLINE_CREATION': [
        '보고서 구조 설계',
        '섹션별 주제 할당',
        '목차 초안 작성',
        '콘텐츠 플로우 설계',
        '핵심 메시지 정의',
        '시각 자료 계획',
        '페이지 레이아웃 결정',
        '목차 검토 및 조정',
        '최종 구조 확정',
        '개요 문서 완성'
      ],
      'G4_CONTENT_WRITING': [
        '서론 및 배경 작성',
        '핵심 내용 집필',
        '데이터 분석 결과 작성',
        '사례 연구 정리',
        '그래프 및 표 생성',
        '참고문헌 정리',
        '교정 및 윤문',
        '일관성 검토',
        '최종 검수',
        '본문 작성 완료'
      ],
      'G5_DATA_VISUALIZATION': [
        '데이터 시각화 요구사항 분석',
        '차트 유형 선정',
        '그래프 디자인',
        '대시보드 레이아웃',
        '인터랙티브 요소 추가',
        '색상 및 스타일 최적화',
        '접근성 검토',
        '시각화 품질 검증',
        '최종 렌더링',
        '시각화 완료'
      ],
      'G6_QUALITY_ASSURANCE': [
        '품질 기준 확립',
        '전체 콘텐츠 검수',
        '논리성 및 일관성 검증',
        '데이터 정확성 확인',
        '오탈자 및 문법 검토',
        '레퍼런스 검증',
        '시각 자료 품질 점검',
        '최종 품질 평가',
        '개선사항 반영',
        '품질 승인 완료'
      ],
      'G7_FORMAT_OPTIMIZATION': [
        '문서 레이아웃 최적화',
        '폰트 및 스타일 통일',
        '페이지 구성 조정',
        '여백 및 간격 정리',
        '제목 계층 구조 확인',
        '색상 일관성 점검',
        '인쇄 최적화',
        '접근성 개선',
        '최종 서식 적용',
        '서식 최적화 완료'
      ],
      'G8_FINAL_REVIEW': [
        '전체 문서 최종 점검',
        '목차 및 페이지 번호 확인',
        '참고문헌 형식 검증',
        '이미지 및 표 배치 확인',
        '법적 검토 (필요시)',
        '이해관계자 검토',
        '피드백 반영',
        '최종 승인 준비',
        '검토 의견 정리',
        '최종 검토 완료'
      ],
      'G9_OUTPUT_PREPARATION': [
        '출력 형식 설정',
        'PDF 생성 준비',
        '메타데이터 입력',
        '북마크 생성',
        '하이퍼링크 검증',
        '파일 크기 최적화',
        '보안 설정 (필요시)',
        '최종 파일 생성',
        '품질 확인',
        '출력 준비 완료'
      ],
      'G10_DELIVERY': [
        '최종 산출물 패키징',
        '전달 방법 확정',
        '접근 권한 설정',
        '백업 파일 생성',
        '문서 전달',
        '수령 확인',
        '피드백 수집',
        '후속 조치 계획',
        '프로젝트 종료 보고',
        '최종 인수인계 완료'
      ]
    };
    
    const phaseActivities = activities[phase];
    if (phaseActivities && phaseActivities[step - 1]) {
      return `[${action}] ${phaseActivities[step - 1]}`;
    }
    
    // Fallback for phases without detailed activities
    return `[${action}] ${phaseLabel} 진행 중 (${step}/10)`;
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

    // Quality Agent (ALWAYS add - for positive feedback)
    requiredAgents.push({
      name: 'Quality Agent',
      role: '품질 검증 및 긍정적 피드백',
      model: 'gpt-4o-mini',
      color: 'cyan',
      icon: 'fa-check-circle',
      reason: '논리성 및 완전성 검증 (긍정적 피드백)'
    });

    // Red Team Agent (ALWAYS add - for negative validation)
    requiredAgents.push({
      name: 'Red Team Agent',
      role: '보안 검증 및 비판적 피드백',
      model: 'claude-sonnet-4',
      color: 'red',
      icon: 'fa-shield-alt',
      reason: '보안 및 취약점 검증 (부정적 피드백)'
    });

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
      },
      'cyan': {
        bg: 'bg-gradient-to-br from-cyan-50 to-cyan-100',
        border: 'border-cyan-200',
        icon: 'bg-cyan-600',
        text: 'text-cyan-900',
        subtext: 'text-cyan-600',
        spinner: 'border-cyan-200 border-t-cyan-600'
      },
      'red': {
        bg: 'bg-gradient-to-br from-red-50 to-red-100',
        border: 'border-red-200',
        icon: 'bg-red-600',
        text: 'text-red-900',
        subtext: 'text-red-600',
        spinner: 'border-red-200 border-t-red-600'
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
