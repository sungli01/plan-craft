// Plan-Craft v6.0 - Thinking Process Module
// ================================================
// Real-time thinking process display by Master Orchestrator

/**
 * Thinking Process Manager
 * Displays Master Orchestrator's reasoning in real-time
 */
class ThinkingProcessManager {
  constructor() {
    this.thoughts = [];
    this.isWindowOpen = false;
    this.windowRef = null;
  }

  /**
   * Add a thought/reasoning step
   */
  addThought(category, content, timestamp = Date.now()) {
    const thought = {
      id: `thought_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category, // 'analysis', 'decision', 'execution', 'verification'
      content,
      timestamp,
      timeStr: new Date(timestamp).toLocaleTimeString('ko-KR')
    };

    this.thoughts.push(thought);

    // Keep only last 50 thoughts
    if (this.thoughts.length > 50) {
      this.thoughts = this.thoughts.slice(-50);
    }

    // Update display if window is open
    if (this.isWindowOpen && this.windowRef && !this.windowRef.closed) {
      this.updateThinkingWindow();
    }

    console.log(`[Thinking] ${category}: ${content}`);
  }

  /**
   * Open thinking process window
   */
  openThinkingWindow() {
    if (this.isWindowOpen && this.windowRef && !this.windowRef.closed) {
      this.windowRef.focus();
      return;
    }

    const width = 600;
    const height = 800;
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
   * Initialize thinking window HTML
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
    <title>Plan-Craft - 사고과정</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Malgun Gothic', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            overflow: hidden;
        }
        .header {
            background: white;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .header h1 {
            font-size: 1.5em;
            color: #6366f1;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .header p {
            font-size: 0.9em;
            color: #666;
            margin-top: 5px;
        }
        .container {
            height: calc(100vh - 90px);
            overflow-y: auto;
            padding: 20px;
        }
        .thought-item {
            background: white;
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        .thought-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .thought-category {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: bold;
        }
        .category-analysis {
            background: #dbeafe;
            color: #1e40af;
        }
        .category-decision {
            background: #fef3c7;
            color: #92400e;
        }
        .category-execution {
            background: #d1fae5;
            color: #065f46;
        }
        .category-verification {
            background: #f3e8ff;
            color: #6b21a8;
        }
        .thought-time {
            font-size: 0.75em;
            color: #999;
        }
        .thought-content {
            color: #333;
            line-height: 1.6;
            font-size: 0.95em;
        }
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: white;
        }
        .empty-state i {
            font-size: 4em;
            margin-bottom: 20px;
            opacity: 0.7;
        }
        .empty-state p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.1);
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.3);
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.5);
        }
    </style>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div class="header">
        <h1>
            <i class="fas fa-brain"></i>
            Master Orchestrator - 사고과정
        </h1>
        <p>AI가 실시간으로 분석하고 결정하는 과정을 확인하세요</p>
    </div>
    <div class="container" id="thoughts-container">
        <div class="empty-state">
            <i class="fas fa-lightbulb"></i>
            <p>프로젝트를 시작하면 사고과정이 표시됩니다...</p>
        </div>
    </div>
</body>
</html>
    `);
    doc.close();

    // Update with existing thoughts
    this.updateThinkingWindow();
  }

  /**
   * Update thinking window with current thoughts
   */
  updateThinkingWindow() {
    if (!this.windowRef || this.windowRef.closed) return;

    const container = this.windowRef.document.getElementById('thoughts-container');
    if (!container) return;

    if (this.thoughts.length === 0) return;

    const categoryIcons = {
      'analysis': 'fa-search',
      'decision': 'fa-lightbulb',
      'execution': 'fa-cog',
      'verification': 'fa-check-circle'
    };

    const categoryLabels = {
      'analysis': '분석',
      'decision': '결정',
      'execution': '실행',
      'verification': '검증'
    };

    container.innerHTML = this.thoughts.map(thought => `
      <div class="thought-item">
        <div class="thought-header">
          <span class="thought-category category-${thought.category}">
            <i class="fas ${categoryIcons[thought.category]}"></i>
            ${categoryLabels[thought.category]}
          </span>
          <span class="thought-time">${thought.timeStr}</span>
        </div>
        <div class="thought-content">${this.escapeHtml(thought.content)}</div>
      </div>
    `).join('');

    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
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
   * Clear all thoughts
   */
  clearThoughts() {
    this.thoughts = [];
    if (this.isWindowOpen && this.windowRef && !this.windowRef.closed) {
      this.updateThinkingWindow();
    }
  }

  /**
   * Get thoughts history
   */
  getThoughts() {
    return this.thoughts;
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
   * Add project analysis thought
   */
  addProjectAnalysis(projectName, idea) {
    this.addThought(
      'analysis',
      `프로젝트 "${projectName}" 분석 시작\n아이디어: ${idea.substring(0, 100)}${idea.length > 100 ? '...' : ''}`
    );
  }

  /**
   * Add model selection thought
   */
  addModelSelection(role, modelName, reason) {
    this.addThought(
      'decision',
      `${role} 모델 선택: ${modelName}\n이유: ${reason}`
    );
  }

  /**
   * Add execution thought
   */
  addExecution(phase, step, description) {
    this.addThought(
      'execution',
      `[${phase}] Step ${step}: ${description}`
    );
  }

  /**
   * Add verification thought
   */
  addVerification(phase, result) {
    this.addThought(
      'verification',
      `${phase} 완료 - ${result}`
    );
  }

  /**
   * Add time estimation thought
   */
  addTimeEstimation(totalMinutes, breakdown) {
    this.addThought(
      'analysis',
      `예상 소요 시간 산출: 총 ${totalMinutes}분\n${breakdown}`
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

console.log('[Thinking Process Module] ✅ Loaded successfully');
