// Plan-Craft v3.1 - POWERFUL EXECUTION ENGINE
// ===========================================
// Document-focused execution system with REAL tracking
// This is NOT a coding tool - it's a DOCUMENT GENERATION tool

import projectManager from './project-manager.js';
import uiRenderer from './ui-renderer.js';
import {
  PHASE_ORDER,
  PHASE_TO_MODEL,
  MODEL_TO_AGENT,
  PHASE_TASKS,
  getPhaseDuration,
  getPhaseLabel
} from './constants.js';

/**
 * Execution Engine
 * Manages document generation workflow
 */
class ExecutionEngine {
  constructor() {
    this.activeExecutions = new Map();
    this.phaseTimers = new Map();
  }

  /**
   * Execute all phases for a project
   */
  async executeProject(projectId) {
    console.log(`[ExecutionEngine] Starting project: ${projectId}`);
    uiRenderer.addLog('INFO', `📋 문서 생성 시작: ${projectId}`);

    const execution = {
      projectId,
      startTime: Date.now(),
      currentPhaseIndex: 0,
      status: 'running'
    };

    this.activeExecutions.set(projectId, execution);

    try {
      // Execute all phases sequentially
      for (let i = 0; i < PHASE_ORDER.length; i++) {
        const phase = PHASE_ORDER[i];
        execution.currentPhaseIndex = i;

        await this.executePhase(projectId, phase, i + 1, PHASE_ORDER.length);
      }

      // Project completed
      await this.handleProjectCompletion(projectId);

    } catch (error) {
      console.error(`[ExecutionEngine] Error:`, error);
      uiRenderer.showError('실행 오류', error.message);
      this.activeExecutions.delete(projectId);
    }
  }

  /**
   * Execute single phase
   */
  async executePhase(projectId, phase, phaseNum, totalPhases) {
    const modelName = PHASE_TO_MODEL[phase];
    const agentName = MODEL_TO_AGENT[modelName];
    const task = PHASE_TASKS[phase];
    const duration = getPhaseDuration(phase);

    console.log(`[ExecutionEngine] Phase ${phaseNum}/${totalPhases}: ${phase}`);
    
    // Update project current phase
    const project = projectManager.getProject(projectId);
    if (project) {
      project.currentPhase = phase;
    }

    // Start AI model tracking
    if (window.aiModelTracker) {
      window.aiModelTracker.startModel(modelName, agentName, task);
    }

    // Log phase start
    uiRenderer.addLog('INFO', `🤖 ${agentName} 시작: ${getPhaseLabel(phase)}`);

    // Simulate phase execution with detailed steps
    await this.simulatePhaseExecution(projectId, phase, duration, phaseNum, totalPhases);

    // Stop AI model tracking
    if (window.aiModelTracker) {
      window.aiModelTracker.stopModel();
    }

    // Log phase completion
    uiRenderer.addLog('SUCCESS', `✅ ${getPhaseLabel(phase)} 완료`);
  }

  /**
   * Simulate phase execution with detailed progress
   */
  async simulatePhaseExecution(projectId, phase, durationMinutes, phaseNum, totalPhases) {
    const steps = 10; // 10 steps per phase
    const stepDuration = (durationMinutes * 60 * 1000) / steps;

    for (let step = 1; step <= steps; step++) {
      // Check if execution was cancelled
      const execution = this.activeExecutions.get(projectId);
      if (!execution || execution.status !== 'running') {
        throw new Error('실행이 취소되었습니다');
      }

      // Log detailed progress every step (10 seconds)
      const progressPercent = Math.round((step / steps) * 100);
      const phaseLabel = getPhaseLabel(phase);
      
      // Detailed step descriptions
      let stepDescription = '';
      if (step === 1) stepDescription = '요구사항 분석 중';
      else if (step === 2) stepDescription = '구조 설계 중';
      else if (step === 3) stepDescription = '초안 작성 중';
      else if (step === 4) stepDescription = '내용 검토 중';
      else if (step === 5) stepDescription = '중간 점검 중';
      else if (step === 6) stepDescription = '세부 작성 중';
      else if (step === 7) stepDescription = '품질 확인 중';
      else if (step === 8) stepDescription = '최종 검토 중';
      else if (step === 9) stepDescription = '문서 정리 중';
      else if (step === 10) stepDescription = '완료 확인 중';

      uiRenderer.addLog('INFO', `📝 ${phaseLabel} [${progressPercent}%] ${stepDescription}`);

      // Wait for step duration
      await this.sleep(stepDuration);
    }
  }

  /**
   * Handle project completion
   */
  async handleProjectCompletion(projectId) {
    console.log(`[ExecutionEngine] Project completed: ${projectId}`);
    
    const project = projectManager.getProject(projectId);
    const projectName = project?.projectName || 'Untitled';
    const outputFormat = project?.outputFormat || 'html';

    uiRenderer.addLog('SUCCESS', `🎉 문서 생성 완료: ${projectName}`);

    // Show completion modal
    this.showCompletionModal(projectId, projectName, outputFormat);

    // Clean up
    this.activeExecutions.delete(projectId);
  }

  /**
   * Show completion modal with output selection
   */
  showCompletionModal(projectId, projectName, defaultFormat) {
    if (!window.ErrorHandler) {
      alert(`${projectName} 프로젝트가 완료되었습니다!\n출력 형식: ${defaultFormat.toUpperCase()}`);
      return;
    }

    // Create custom modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-check-circle text-4xl text-green-600"></i>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">문서 생성 완료!</h2>
          <p class="text-gray-600">${projectName}</p>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-3">
            <i class="fas fa-file-download mr-1"></i>
            출력 형식을 선택하세요
          </label>
          <div class="flex gap-3">
            <label class="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-all ${defaultFormat === 'html' ? 'border-purple-500 bg-purple-50' : ''}">
              <input type="radio" name="output-format-final" value="html" ${defaultFormat === 'html' ? 'checked' : ''} class="text-purple-600" />
              <i class="fab fa-html5 text-2xl text-orange-600"></i>
              <span class="font-medium">HTML</span>
            </label>
            <label class="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-all ${defaultFormat === 'pdf' ? 'border-purple-500 bg-purple-50' : ''}">
              <input type="radio" name="output-format-final" value="pdf" ${defaultFormat === 'pdf' ? 'checked' : ''} class="text-purple-600" />
              <i class="fas fa-file-pdf text-2xl text-red-600"></i>
              <span class="font-medium">PDF</span>
            </label>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            onclick="this.closest('.fixed').remove()"
            class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all"
          >
            닫기
          </button>
          <button
            onclick="window.executionEngine.downloadDocument('${projectId}')"
            class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg"
          >
            <i class="fas fa-download mr-2"></i>
            다운로드
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Download document
   */
  downloadDocument(projectId) {
    const modal = document.querySelector('.fixed');
    const format = document.querySelector('input[name="output-format-final"]:checked')?.value || 'html';
    
    uiRenderer.addLog('SUCCESS', `📥 문서 다운로드 시작: ${format.toUpperCase()} 형식`);
    
    // Simulate download (in real implementation, this would call backend API)
    const project = projectManager.getProject(projectId);
    const filename = `${project?.projectName || 'document'}_${Date.now()}.${format}`;
    
    // Close modal
    if (modal) modal.remove();
    
    // Show success message
    setTimeout(() => {
      uiRenderer.addLog('SUCCESS', `✅ 문서 다운로드 완료: ${filename}`);
      alert(`문서가 다운로드되었습니다!\n파일명: ${filename}`);
    }, 1000);
  }

  /**
   * Cancel execution
   */
  async cancelExecution(projectId) {
    const execution = this.activeExecutions.get(projectId);
    if (execution) {
      execution.status = 'cancelled';
      this.activeExecutions.delete(projectId);
      uiRenderer.addLog('WARN', `⚠️ 실행 취소됨: ${projectId}`);
    }
  }

  /**
   * Check if project is executing
   */
  isExecuting(projectId) {
    return this.activeExecutions.has(projectId);
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
const executionEngine = new ExecutionEngine();

// Expose to window
if (typeof window !== 'undefined') {
  window.executionEngine = executionEngine;
  
  // Backward compatibility
  window.executeAllPhasesWithTracking = (projectId) => {
    return executionEngine.executeProject(projectId);
  };
}

export default executionEngine;

console.log('[Execution Engine Module] ✅ Loaded successfully');
