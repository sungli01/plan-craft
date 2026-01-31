// Plan-Craft Frontend v2.0 - Project Detail Page
const API_BASE = '/api';
const PROJECT_ID = window.currentProjectId;

let logsRefreshInterval = null;
let phasesRefreshInterval = null;

// Initialize project page
document.addEventListener('DOMContentLoaded', () => {
  if (!PROJECT_ID) {
    window.location.href = '/';
    return;
  }

  initializeEventListeners();
  loadProjectData();
  loadPhases();
  loadLogs();
  startAutoRefresh();
});

function initializeEventListeners() {
  const refreshBtn = document.getElementById('refresh-logs');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadLogs);
  }

  // NEW: Control buttons
  const pauseBtn = document.getElementById('pause-project-btn');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => controlProject('pause'));
  }

  const resumeBtn = document.getElementById('resume-project-btn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => controlProject('resume'));
  }

  const cancelBtn = document.getElementById('cancel-project-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (confirm('정말로 이 프로젝트를 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        controlProject('cancel');
      }
    });
  }

  const upgradeBtn = document.getElementById('upgrade-project-btn');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', handleUpgradeProject);
  }

  const exportBtn = document.getElementById('export-pdf-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', handleExportPDF);
  }
}

async function controlProject(action) {
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_ID}/${action}`, {
      method: 'POST'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    
    const messages = {
      pause: '프로젝트가 일시중지되었습니다',
      resume: '프로젝트가 재개되었습니다',
      cancel: '프로젝트가 취소되었습니다'
    };

    addProjectLog('SUCCESS', messages[action]);
    
    if (action === 'cancel') {
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } else {
      loadProjectData();
    }
  } catch (error) {
    addProjectLog('ERROR', `작업 실패: ${error.message}`);
  }
}

async function handleUpgradeProject() {
  const instruction = prompt('업그레이드 지시사항을 입력하세요:\n\n예: "결제 기능 추가", "디자인 개선", "성능 최적화"');
  
  if (!instruction || instruction.trim() === '') {
    return;
  }

  addProjectLog('INFO', '업그레이드 요청 중...');

  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_ID}/upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instruction: instruction.trim(),
        references: []
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    addProjectLog('SUCCESS', `업그레이드 등록됨: ${result.upgradeId}`);
    addProjectLog('INFO', `지시사항: ${instruction}`);
    
    // Simulate upgrade execution
    setTimeout(() => {
      addProjectLog('INFO', '[UPGRADE] 변경사항 분석 중...');
      setTimeout(() => {
        addProjectLog('INFO', '[UPGRADE] 코드 업데이트 중...');
        setTimeout(() => {
          fetch(`${API_BASE}/projects/${PROJECT_ID}/upgrades/${result.upgradeId}/complete`, {
            method: 'POST'
          });
          addProjectLog('SUCCESS', '[UPGRADE] 업그레이드 완료!');
        }, 2000);
      }, 1500);
    }, 1000);

  } catch (error) {
    addProjectLog('ERROR', `업그레이드 실패: ${error.message}`);
  }
}

async function handleExportPDF() {
  addProjectLog('INFO', 'PDF 생성 중...');
  addProjectLog('INFO', 'AI 이미지 생성 중 (다이어그램, 아키텍처)...');
  
  // Simulate PDF generation
  setTimeout(() => {
    addProjectLog('SUCCESS', 'PDF 생성 완료!');
    addProjectLog('INFO', 'PDF 다운로드 기능은 곧 추가될 예정입니다.');
    alert('PDF 출력 기능은 Feature 5에서 구현됩니다.\n\n포함될 내용:\n- 프로젝트 개요\n- AI 생성 아키텍처 다이어그램\n- API 문서\n- 코드 스니펫\n- 테스트 결과');
  }, 2000);
}

async function loadProjectData() {
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_ID}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const project = await response.json();
    renderProjectInfo(project);
  } catch (error) {
    console.error('프로젝트 로드 실패:', error);
    addProjectLog('ERROR', `프로젝트 로드 실패: ${error.message}`);
  }
}

function renderProjectInfo(project) {
  const nameDisplay = document.getElementById('project-name-display');
  const ideaDisplay = document.getElementById('project-idea-display');

  if (nameDisplay) {
    nameDisplay.textContent = project.projectName;
  }

  if (ideaDisplay) {
    let statusBadge = '';
    if (project.isPaused) {
      statusBadge = '<span class="ml-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold"><i class="fas fa-pause mr-1"></i>일시중지</span>';
    } else if (project.isCancelled) {
      statusBadge = '<span class="ml-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold"><i class="fas fa-times mr-1"></i>취소됨</span>';
    } else if (project.isCompleted) {
      statusBadge = '<span class="ml-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold"><i class="fas fa-check mr-1"></i>완료</span>';
    }

    ideaDisplay.innerHTML = `
      ${project.userIdea}
      ${statusBadge}
      <span class="ml-4 text-sm">
        <i class="fas fa-code text-purple-300"></i>
        ${project.techStack.join(', ') || 'Auto-detecting...'}
      </span>
      <span class="ml-4 text-sm">
        <i class="fas fa-chart-line text-green-300"></i>
        Progress: ${project.progress.toFixed(0)}%
      </span>
    `;
  }
}

async function loadPhases() {
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_ID}/phases`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    renderPhases(data.phases);
  } catch (error) {
    console.error('단계 로드 실패:', error);
  }
}

function renderPhases(phases) {
  const phasesDisplay = document.getElementById('phases-display');
  if (!phasesDisplay) return;

  const phaseNames = {
    'G1_CORE_LOGIC': 'G1: 핵심 로직 구현',
    'G2_API_SERVER': 'G2: API 서버 개발',
    'G3_UI_COMPONENTS': 'G3: UI 컴포넌트',
    'G4_INTEGRATION': 'G4: 프론트엔드-백엔드 연동',
    'G5_UNIT_TESTS': 'G5: 단위 테스트 (커버리지 95%+)',
    'G6_SECURITY_SCAN': 'G6: 보안 스캔',
    'G7_BUILD_OPTIMIZATION': 'G7: 빌드 최적화',
    'G8_DEPLOYMENT': 'G8: 라이브 배포',
    'G9_DOCUMENTATION': 'G9: API 문서 생성',
    'G10_HANDOVER': 'G10: 소스코드 이관'
  };

  const statusIcons = {
    'PENDING': '<i class="fas fa-circle text-gray-400"></i>',
    'CODING': '<i class="fas fa-spinner fa-spin text-yellow-500"></i>',
    'BUILD_PASS': '<i class="fas fa-check-circle text-green-500"></i>',
    'BUILD_FAIL': '<i class="fas fa-times-circle text-red-500"></i>',
    'REJECTED': '<i class="fas fa-ban text-red-700"></i>',
    'COMPLETED': '<i class="fas fa-check-double text-green-600"></i>'
  };

  phasesDisplay.innerHTML = phases.map(phase => {
    const phaseName = phaseNames[phase.gate] || phase.gate;
    const statusIcon = statusIcons[phase.status] || '<i class="fas fa-question-circle"></i>';

    const statusColors = {
      'PENDING': 'bg-gray-50 border-gray-200',
      'CODING': 'bg-yellow-50 border-yellow-300',
      'BUILD_PASS': 'bg-green-50 border-green-300',
      'BUILD_FAIL': 'bg-red-50 border-red-300',
      'REJECTED': 'bg-red-100 border-red-400',
      'COMPLETED': 'bg-green-100 border-green-400'
    };

    const bgClass = statusColors[phase.status] || 'bg-gray-50';

    return `
      <div class="flex items-center justify-between ${bgClass} border-2 rounded-xl p-4 transition-all">
        <div class="flex items-center space-x-4">
          <div class="text-2xl">${statusIcon}</div>
          <div>
            <div class="font-bold text-gray-800">${phaseName}</div>
            <div class="text-sm text-gray-600">Status: <span class="font-semibold">${phase.status}</span></div>
          </div>
        </div>
        <div class="text-right text-sm space-y-1">
          <div class="font-semibold text-gray-700">Test Coverage: <span class="text-green-600">${phase.metrics.testCoverage.toFixed(1)}%</span></div>
          <div class="font-semibold text-gray-700">Build: <span class="text-blue-600">${phase.metrics.buildSuccessRate.toFixed(0)}%</span></div>
          <div class="font-semibold text-gray-700">Security Issues: <span class="text-red-600">${phase.metrics.securityIssues}</span></div>
        </div>
      </div>
    `;
  }).join('');
}

async function loadLogs() {
  try {
    const response = await fetch(`${API_BASE}/projects/${PROJECT_ID}/logs?limit=100`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    renderLogs(data.logs);
  } catch (error) {
    console.error('로그 로드 실패:', error);
  }
}

function renderLogs(logs) {
  const logsDisplay = document.getElementById('project-logs');
  if (!logsDisplay) return;

  if (logs.length === 0) {
    logsDisplay.innerHTML = '<div class="text-gray-500">No logs available yet.</div>';
    return;
  }

  const levelColors = {
    'DEBUG': 'text-gray-500',
    'INFO': 'text-blue-400',
    'WARN': 'text-yellow-400',
    'ERROR': 'text-red-400',
    'SUCCESS': 'text-green-400'
  };

  const icons = {
    'DEBUG': '◇',
    'INFO': '◆',
    'WARN': '⚠',
    'ERROR': '✗',
    'SUCCESS': '✓'
  };

  logsDisplay.innerHTML = logs.map(log => {
    const timestamp = new Date(log.timestamp).toISOString().split('T')[1].split('.')[0];
    const color = levelColors[log.level] || 'text-gray-400';
    const icon = icons[log.level] || '•';

    return `<div class="${color} mb-1">[${timestamp}] ${icon} [${log.level}] [${log.source}] [${log.phase}] ${log.message}</div>`;
  }).join('');

  logsDisplay.scrollTop = logsDisplay.scrollHeight;
}

function addProjectLog(level, message) {
  const terminal = document.getElementById('project-logs');
  if (!terminal) return;

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
  logEntry.className = `${color} mb-1`;
  logEntry.innerHTML = `[${timestamp}] ${icon} [${level}] ${message}`;

  terminal.appendChild(logEntry);
  terminal.scrollTop = terminal.scrollHeight;
}

function startAutoRefresh() {
  phasesRefreshInterval = setInterval(loadPhases, 3000);
  logsRefreshInterval = setInterval(loadLogs, 2000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (phasesRefreshInterval) {
    clearInterval(phasesRefreshInterval);
  }
  if (logsRefreshInterval) {
    clearInterval(logsRefreshInterval);
  }
});
