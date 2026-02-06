// Plan-Craft v8.0 - Genspark-Style Thinking Process Module
// ================================================================
// Genspark AI Algorithm-based thinking process display

/**
 * Genspark-Style Thinking Process Manager
 * Displays verification steps with Bash commands and exit codes
 */
class ThinkingProcessManager {
  constructor() {
    this.verificationSteps = [];
    this.isWindowOpen = false;
    this.windowRef = null;
    this.currentStep = 0;
  }

  /**
   * Add verification step (Genspark style)
   */
  addVerificationStep(title, bashCommand, exitCode, description = '', status = 'success') {
    const step = {
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stepNumber: ++this.currentStep,
      title,
      bashCommand,
      exitCode,
      description,
      status, // 'success', 'error', 'running'
      timestamp: Date.now(),
      timeStr: new Date().toLocaleTimeString('ko-KR')
    };

    this.verificationSteps.push(step);

    // Keep only last 50 steps
    if (this.verificationSteps.length > 50) {
      this.verificationSteps = this.verificationSteps.slice(-50);
    }

    // Update display if window is open
    if (this.isWindowOpen && this.windowRef && !this.windowRef.closed) {
      this.updateThinkingWindow();
    }

    console.log(`[Verification] ${title} - Exit Code: ${exitCode}`);
  }

  /**
   * Add intent analysis step (3-layer classification)
   */
  addIntentAnalysis(taskType, techDomain, complexity, confidence) {
    this.addVerificationStep(
      '의도 파악 완료',
      `analyzeIntent --task-type "${taskType}" --domain "${techDomain}" --complexity "${complexity}"`,
      0,
      `신뢰도: ${Math.round(confidence * 100)}% | 작업 유형: ${taskType} | 기술 도메인: ${techDomain} | 복잡도: ${complexity}`,
      'success'
    );
  }

  /**
   * Add task decomposition step
   */
  addTaskDecomposition(mainTask, subtasks) {
    const subtaskList = subtasks.map((t, i) => `${i + 1}. ${t}`).join('\n');
    this.addVerificationStep(
      '작업 분해 완료',
      `decompose --task "${mainTask}" --subtasks ${subtasks.length}`,
      0,
      `주요 작업: ${mainTask}\n하위 작업:\n${subtaskList}`,
      'success'
    );
  }

  /**
   * Add RAG search step
   */
  addRAGSearch(query, resultsCount) {
    this.addVerificationStep(
      'RAG 자료 수집 완료',
      `ragSystem.searchWeb --query "${query.substring(0, 50)}..." --purpose "자료 수집"`,
      0,
      `${resultsCount}개의 참고 자료 수집 완료`,
      'success'
    );
  }

  /**
   * Add agent activation step
   */
  addAgentActivation(agentName, role, phase) {
    this.addVerificationStep(
      `${agentName} 활성화`,
      `activateAgent --name "${agentName}" --role "${role}" --phase "${phase}"`,
      0,
      `역할: ${role}`,
      'success'
    );
  }

  /**
   * Add phase execution step
   */
  addPhaseExecution(phaseName, progress, activity) {
    this.addVerificationStep(
      `${phaseName} 진행 중`,
      `executePhase --phase "${phaseName}" --progress ${progress}%`,
      0,
      `${activity} (${progress}% 완료)`,
      'running'
    );
  }

  /**
   * Add quality check step
   */
  addQualityCheck(integrityScore, passed) {
    this.addVerificationStep(
      '품질 검증 완료',
      `qualityCheck --target-score 95 --actual ${integrityScore}`,
      passed ? 0 : 1,
      `무결성 점수: ${integrityScore}% ${passed ? '✓ 통과' : '✗ 미달'}`,
      passed ? 'success' : 'error'
    );
  }

  /**
   * Add self-correction step
   */
  addSelfCorrection(errorType, correctionAction) {
    this.addVerificationStep(
      '자가 수정 실행',
      `selfCorrect --error "${errorType}" --action "${correctionAction}"`,
      0,
      `오류 유형: ${errorType}\n수정 조치: ${correctionAction}`,
      'success'
    );
  }

  /**
   * Open thinking process window (Genspark style)
   */
  openThinkingWindow() {
    if (this.isWindowOpen && this.windowRef && !this.windowRef.closed) {
      this.windowRef.focus();
      return;
    }

    const width = 800;
    const height = 900;
    const left = window.screen.width - width - 20;
    const top = 20;

    this.windowRef = window.open(
      '',
      'thinking-process',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!this.windowRef) {
      alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
      return;
    }

    this.isWindowOpen = true;
    this.initializeThinkingWindow();

    // Monitor window close
    const checkInterval = setInterval(() => {
      if (this.windowRef.closed) {
        this.isWindowOpen = false;
        clearInterval(checkInterval);
      }
    }, 1000);
  }

  /**
   * Initialize thinking window HTML (Genspark style)
   */
  initializeThinkingWindow() {
    const doc = this.windowRef.document;
    
    doc.open();
    doc.write(`
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plan-Craft v8.0 - 사고과정 (Genspark Style)</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Malgun Gothic', sans-serif;
            background: #f8f9fa;
            color: #212529;
            line-height: 1.6;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 24px 32px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .header h1 {
            font-size: 1.75em;
            font-weight: 700;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .header p {
            font-size: 0.95em;
            opacity: 0.95;
            font-weight: 400;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 32px 24px;
        }
        .step-item {
            background: white;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            border-left: 4px solid #10b981;
            animation: slideIn 0.4s ease-out;
            transition: all 0.3s ease;
        }
        .step-item:hover {
            box-shadow: 0 4px 16px rgba(0,0,0,0.12);
            transform: translateY(-2px);
        }
        .step-item.status-error {
            border-left-color: #ef4444;
        }
        .step-item.status-running {
            border-left-color: #3b82f6;
        }
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .step-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }
        .step-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9em;
            flex-shrink: 0;
        }
        .step-icon.success {
            background: #d1fae5;
            color: #059669;
        }
        .step-icon.error {
            background: #fee2e2;
            color: #dc2626;
        }
        .step-icon.running {
            background: #dbeafe;
            color: #2563eb;
        }
        .step-title {
            flex: 1;
            font-size: 1.1em;
            font-weight: 600;
            color: #1f2937;
        }
        .step-time {
            font-size: 0.85em;
            color: #6b7280;
        }
        .bash-command {
            background: #1e293b;
            color: #e2e8f0;
            padding: 16px;
            border-radius: 8px;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
            margin-bottom: 12px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            border: 1px solid #334155;
        }
        .bash-prefix {
            color: #22c55e;
            font-weight: bold;
            user-select: none;
        }
        .exit-code {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
            margin-bottom: 12px;
        }
        .exit-code.success {
            background: #d1fae5;
            color: #059669;
        }
        .exit-code.error {
            background: #fee2e2;
            color: #dc2626;
        }
        .step-description {
            color: #4b5563;
            font-size: 0.95em;
            line-height: 1.7;
            white-space: pre-wrap;
        }
        .perfect-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 24px;
            font-weight: 700;
            font-size: 1.1em;
            margin-top: 12px;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .empty-state {
            text-align: center;
            padding: 80px 20px;
            color: #6b7280;
        }
        .empty-state i {
            font-size: 5em;
            margin-bottom: 24px;
            color: #d1d5db;
        }
        .empty-state p {
            font-size: 1.2em;
        }
        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }
        ::-webkit-scrollbar-track {
            background: #f1f5f9;
        }
        ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
        .stats-bar {
            background: white;
            padding: 16px 32px;
            display: flex;
            gap: 32px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            margin-bottom: 24px;
            border-radius: 12px;
        }
        .stat-item {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .stat-label {
            font-size: 0.9em;
            color: #6b7280;
        }
        .stat-value {
            font-size: 1.5em;
            font-weight: 700;
            color: #1f2937;
        }
        .stat-value.success {
            color: #10b981;
        }
        .stat-value.error {
            color: #ef4444;
        }
    </style>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div class="header">
        <h1>
            <i class="fas fa-brain"></i>
            Plan-Craft v8.0 - AI 사고과정
        </h1>
        <p>젠스파크 알고리즘 기반 의도 파악, 작업 분해, 검증 프로세스</p>
    </div>
    <div class="container">
        <div class="stats-bar" id="stats-bar" style="display: none;">
            <div class="stat-item">
                <span class="stat-label">전체 단계:</span>
                <span class="stat-value" id="stat-total">0</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">성공:</span>
                <span class="stat-value success" id="stat-success">0</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">오류:</span>
                <span class="stat-value error" id="stat-error">0</span>
            </div>
        </div>
        <div id="steps-container">
            <div class="empty-state">
                <i class="fas fa-rocket"></i>
                <p>프로젝트를 시작하면 AI의 사고과정이 실시간으로 표시됩니다...</p>
            </div>
        </div>
    </div>
</body>
</html>
    `);
    doc.close();

    // Update with existing steps
    this.updateThinkingWindow();
  }

  /**
   * Update thinking window with current verification steps
   */
  updateThinkingWindow() {
    if (!this.windowRef || this.windowRef.closed) return;

    const container = this.windowRef.document.getElementById('steps-container');
    const statsBar = this.windowRef.document.getElementById('stats-bar');
    if (!container) return;

    if (this.verificationSteps.length === 0) return;

    // Show stats bar
    if (statsBar) {
      statsBar.style.display = 'flex';
      const successCount = this.verificationSteps.filter(s => s.status === 'success').length;
      const errorCount = this.verificationSteps.filter(s => s.status === 'error').length;
      
      this.windowRef.document.getElementById('stat-total').textContent = this.verificationSteps.length;
      this.windowRef.document.getElementById('stat-success').textContent = successCount;
      this.windowRef.document.getElementById('stat-error').textContent = errorCount;
    }

    const statusIcons = {
      'success': 'fa-check-circle',
      'error': 'fa-times-circle',
      'running': 'fa-spinner fa-spin'
    };

    container.innerHTML = this.verificationSteps.map((step, index) => {
      const isLastSuccess = index === this.verificationSteps.length - 1 && step.status === 'success';
      
      return `
      <div class="step-item status-${step.status}">
        <div class="step-header">
          <div class="step-icon ${step.status}">
            <i class="fas ${statusIcons[step.status]}"></i>
          </div>
          <div class="step-title">
            ${step.status === 'success' ? '✅' : step.status === 'error' ? '❌' : '🔄'} 
            ${step.stepNumber}단계: ${this.escapeHtml(step.title)}
          </div>
          <div class="step-time">${step.timeStr}</div>
        </div>
        
        ${step.bashCommand ? `
        <div class="bash-command">
          <span class="bash-prefix">$</span> ${this.escapeHtml(step.bashCommand)}
        </div>
        ` : ''}
        
        <div class="exit-code ${step.exitCode === 0 ? 'success' : 'error'}">
          <i class="fas fa-terminal"></i>
          Exit Code: ${step.exitCode}
        </div>
        
        ${step.description ? `
        <div class="step-description">${this.escapeHtml(step.description)}</div>
        ` : ''}
        
        ${isLastSuccess ? `
        <div class="perfect-badge">
          <i class="fas fa-star"></i>
          Perfect!
        </div>
        ` : ''}
      </div>
      `;
    }).join('');

    // Auto-scroll to bottom
    setTimeout(() => {
      if (this.windowRef && !this.windowRef.closed) {
        this.windowRef.scrollTo({
          top: this.windowRef.document.body.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  /**
   * Close thinking window
   */
  closeThinkingWindow() {
    if (this.windowRef && !this.windowRef.closed) {
      this.windowRef.close();
    }
    this.isWindowOpen = false;
    this.windowRef = null;
  }

  /**
   * Clear all steps
   */
  clearSteps() {
    this.verificationSteps = [];
    this.currentStep = 0;
    if (this.isWindowOpen && this.windowRef && !this.windowRef.closed) {
      this.updateThinkingWindow();
    }
  }

  /**
   * Get verification steps history
   */
  getSteps() {
    return this.verificationSteps;
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ===== Legacy compatibility methods =====
  
  /**
   * Legacy: Add thought (converts to verification step)
   */
  addThought(category, content) {
    const categoryMap = {
      'analysis': '분석',
      'decision': '결정',
      'execution': '실행',
      'verification': '검증'
    };
    
    this.addVerificationStep(
      `${categoryMap[category] || '작업'} 완료`,
      `legacy_${category} --content "${content.substring(0, 50)}..."`,
      0,
      content,
      'success'
    );
  }

  addProjectAnalysis(projectName, idea) {
    this.addVerificationStep(
      '프로젝트 분석 완료',
      `analyzeProject --name "${projectName}" --idea "${idea.substring(0, 40)}..."`,
      0,
      `프로젝트: ${projectName}\n아이디어: ${idea.substring(0, 100)}${idea.length > 100 ? '...' : ''}`,
      'success'
    );
  }

  addModelSelection(role, modelName, reason) {
    this.addVerificationStep(
      '모델 선택 완료',
      `selectModel --role "${role}" --model "${modelName}"`,
      0,
      `역할: ${role}\n선택된 모델: ${modelName}\n이유: ${reason}`,
      'success'
    );
  }

  addExecution(phase, step, description) {
    this.addPhaseExecution(phase, step * 10, description);
  }

  addVerification(phase, result) {
    this.addVerificationStep(
      `${phase} 완료`,
      `verifyPhase --phase "${phase}"`,
      0,
      result,
      'success'
    );
  }

  addTimeEstimation(totalMinutes, breakdown) {
    this.addVerificationStep(
      '시간 산출 완료',
      `estimateTime --total ${totalMinutes}`,
      0,
      `총 예상 시간: ${totalMinutes}분\n${breakdown}`,
      'success'
    );
  }
}

// Create singleton instance
const thinkingProcess = new ThinkingProcessManager();

// Expose to window
if (typeof window !== 'undefined') {
  window.thinkingProcess = thinkingProcess;
}

export default thinkingProcess;

console.log('[Thinking Process Module] ✅ Genspark Style Loaded successfully');
