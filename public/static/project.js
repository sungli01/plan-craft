// Plan-Craft Frontend - Project Detail Page
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
    console.error('Failed to load project:', error);
    addProjectLog('ERROR', `Failed to load project: ${error.message}`);
  }
}

function renderProjectInfo(project) {
  const nameDisplay = document.getElementById('project-name-display');
  const ideaDisplay = document.getElementById('project-idea-display');

  if (nameDisplay) {
    nameDisplay.textContent = project.projectName;
  }

  if (ideaDisplay) {
    ideaDisplay.innerHTML = `
      ${project.userIdea}
      <span class="ml-4 text-sm">
        <i class="fas fa-code text-cyan-400"></i>
        ${project.techStack.join(', ') || 'Auto-detecting...'}
      </span>
      <span class="ml-4 text-sm">
        <i class="fas fa-chart-line text-green-400"></i>
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
    console.error('Failed to load phases:', error);
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
    'PENDING': '<i class="fas fa-circle text-gray-500"></i>',
    'CODING': '<i class="fas fa-spinner fa-spin text-yellow-400"></i>',
    'BUILD_PASS': '<i class="fas fa-check-circle text-green-400"></i>',
    'BUILD_FAIL': '<i class="fas fa-times-circle text-red-400"></i>',
    'REJECTED': '<i class="fas fa-ban text-red-600"></i>',
    'COMPLETED': '<i class="fas fa-check-double text-green-500"></i>'
  };

  phasesDisplay.innerHTML = phases.map(phase => {
    const phaseName = phaseNames[phase.gate] || phase.gate;
    const statusIcon = statusIcons[phase.status] || '<i class="fas fa-question-circle"></i>';

    return `
      <div class="flex items-center justify-between bg-gray-700 rounded-lg p-4">
        <div class="flex items-center space-x-3">
          ${statusIcon}
          <div>
            <div class="font-semibold">${phaseName}</div>
            <div class="text-sm text-gray-400">Status: ${phase.status}</div>
          </div>
        </div>
        <div class="text-right text-sm">
          <div>Test Coverage: ${phase.metrics.testCoverage.toFixed(1)}%</div>
          <div>Build: ${phase.metrics.buildSuccessRate.toFixed(0)}%</div>
          <div>Security Issues: ${phase.metrics.securityIssues}</div>
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
    console.error('Failed to load logs:', error);
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

  logsDisplay.innerHTML = logs.map(log => {
    const timestamp = new Date(log.timestamp).toISOString().split('T')[1].split('.')[0];
    const color = levelColors[log.level] || 'text-gray-400';

    return `<div class="${color} mb-1">[${timestamp}] [${log.level}] [${log.source}] [${log.phase}] ${log.message}</div>`;
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

  const color = colors[level] || 'text-gray-400';
  const logEntry = document.createElement('div');
  logEntry.className = `${color} mb-1`;
  logEntry.innerHTML = `[${timestamp}] [${level}] ${message}`;

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
