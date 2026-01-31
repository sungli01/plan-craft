// Plan-Craft Frontend v2.0 - Main Dashboard
const API_BASE = '/api';

let currentProject = null;
let statsRefreshInterval = null;
let tempReferences = []; // Temporary storage for references before project creation

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  loadStats();
  startStatsRefresh();
});

function initializeEventListeners() {
  const form = document.getElementById('create-project-form');
  if (form) {
    form.addEventListener('submit', handleProjectCreation);
  }

  const addRefBtn = document.getElementById('add-reference-btn');
  if (addRefBtn) {
    addRefBtn.addEventListener('click', handleAddReference);
  }
}

function handleAddReference() {
  const urlInput = document.getElementById('reference-url');
  const descInput = document.getElementById('reference-description');

  const url = urlInput.value.trim();
  if (!url) {
    alert('참조 URL을 입력해주세요.');
    return;
  }

  const reference = {
    id: `temp_ref_${Date.now()}`,
    type: 'url',
    url: url,
    content: descInput.value.trim() || url,
    uploadedAt: Date.now()
  };

  tempReferences.push(reference);
  renderReferencesList();

  // Clear inputs
  urlInput.value = '';
  descInput.value = '';

  addLog('INFO', `참조 추가: ${reference.content}`);
}

function renderReferencesList() {
  const list = document.getElementById('references-list');
  if (!list) return;

  if (tempReferences.length === 0) {
    list.innerHTML = '';
    return;
  }

  list.innerHTML = tempReferences.map((ref, index) => `
    <div class="flex items-center justify-between bg-white rounded-lg p-3 border border-purple-200">
      <div class="flex-1">
        <div class="flex items-center">
          <i class="fas fa-link text-purple-600 mr-2"></i>
          <span class="text-sm font-medium text-gray-700">${ref.content}</span>
        </div>
        <div class="text-xs text-gray-500 mt-1">${ref.url}</div>
      </div>
      <button
        onclick="removeReference(${index})"
        class="ml-3 text-red-500 hover:text-red-700 transition-colors"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');
}

window.removeReference = function(index) {
  tempReferences.splice(index, 1);
  renderReferencesList();
  addLog('INFO', '참조 제거됨');
};

async function handleProjectCreation(e) {
  e.preventDefault();

  const projectName = document.getElementById('project-name').value;
  const userIdea = document.getElementById('user-idea').value;

  if (!projectName || !userIdea) {
    addLog('ERROR', '모든 필드를 입력해주세요');
    return;
  }

  addLog('INFO', `프로젝트 생성 중: ${projectName}...`);
  
  // Show references in log
  if (tempReferences.length > 0) {
    addLog('INFO', `${tempReferences.length}개의 참조 문서 포함`);
  }

  try {
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectName,
        userIdea,
        references: tempReferences
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const project = await response.json();
    currentProject = project;

    addLog('SUCCESS', `프로젝트 생성됨: ${project.projectId}`);
    addLog('INFO', `현재 단계: ${project.currentPhase}`);
    
    if (project.references && project.references.length > 0) {
      addLog('SUCCESS', `${project.references.length}개의 참조 문서가 연결되었습니다`);
    }

    // Clear temp references
    tempReferences = [];
    renderReferencesList();

    // Start G1 phase automatically
    await startPhase(project.projectId, 'G1_CORE_LOGIC');

    // Update UI
    renderPipelineViewer(project.projectId);
    loadStats();

    // Redirect to project page after 1 second
    setTimeout(() => {
      window.location.href = `/projects/${project.projectId}`;
    }, 1000);

  } catch (error) {
    addLog('ERROR', `프로젝트 생성 실패: ${error.message}`);
  }
}

async function startPhase(projectId, gate) {
  try {
    const response = await fetch(`${API_BASE}/projects/${projectId}/phases/${gate}/start`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    addLog('INFO', `Phase ${gate} 시작됨`);

    // Simulate phase execution
    await simulatePhaseExecution(projectId, gate);

  } catch (error) {
    addLog('ERROR', `Phase 시작 실패: ${error.message}`);
  }
}

async function simulatePhaseExecution(projectId, gate) {
  addLog('INFO', `[${gate}] 요구사항 분석 중...`);
  await sleep(500);

  addLog('INFO', `[${gate}] 코드 생성 중...`);
  await sleep(1000);

  // Update metrics
  await updatePhaseMetrics(projectId, gate, {
    buildSuccessRate: 100,
    testCoverage: 96.5,
    securityIssues: 0
  });

  addLog('SUCCESS', `[${gate}] 메트릭 업데이트됨`);
  await sleep(500);

  // Complete phase
  const completeResponse = await fetch(`${API_BASE}/projects/${projectId}/phases/${gate}/complete`, {
    method: 'POST'
  });

  const result = await completeResponse.json();

  if (result.success) {
    addLog('SUCCESS', `[${gate}] Phase 완료`);
    addLog('INFO', `다음 단계로 이동: ${result.nextPhase}`);
  } else {
    addLog('ERROR', `[${gate}] Phase 거부됨 - 품질 기준 미달`);
  }
}

async function updatePhaseMetrics(projectId, gate, metrics) {
  try {
    const response = await fetch(`${API_BASE}/projects/${projectId}/phases/${gate}/metrics`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    addLog('ERROR', `메트릭 업데이트 실패: ${error.message}`);
  }
}

async function loadStats() {
  try {
    const response = await fetch(`${API_BASE}/stats`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const stats = await response.json();
    renderStats(stats);
  } catch (error) {
    console.error('통계 로드 실패:', error);
  }
}

function renderStats(stats) {
  const statsDisplay = document.getElementById('stats-display');
  if (!statsDisplay) return;

  statsDisplay.innerHTML = `
    <div class="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-6 text-center">
      <div class="text-3xl font-bold text-blue-600">${stats.totalProjects}</div>
      <div class="text-sm text-blue-700 mt-1">전체 프로젝트</div>
    </div>
    <div class="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6 text-center">
      <div class="text-3xl font-bold text-green-600">${stats.activeProjects}</div>
      <div class="text-sm text-green-700 mt-1">진행 중</div>
    </div>
    <div class="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-6 text-center">
      <div class="text-3xl font-bold text-yellow-600">${stats.pausedProjects || 0}</div>
      <div class="text-sm text-yellow-700 mt-1">일시중지</div>
    </div>
    <div class="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-6 text-center">
      <div class="text-3xl font-bold text-purple-600">${stats.completedProjects}</div>
      <div class="text-sm text-purple-700 mt-1">완료</div>
    </div>
  `;
}

function renderPipelineViewer(projectId) {
  const pipelineViewer = document.getElementById('pipeline-viewer');
  if (!pipelineViewer) return;

  pipelineViewer.innerHTML = `
    <div class="text-gray-700 flex items-center">
      <i class="fas fa-spinner fa-spin text-purple-600 mr-3"></i>
      <span class="font-medium">프로젝트 초기화 중...</span>
      <a href="/projects/${projectId}" class="text-purple-600 hover:underline ml-4 font-semibold">
        상세 보기 →
      </a>
    </div>
  `;
}

function addLog(level, message) {
  const terminal = document.getElementById('terminal-console');
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

function startStatsRefresh() {
  statsRefreshInterval = setInterval(loadStats, 5000);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (statsRefreshInterval) {
    clearInterval(statsRefreshInterval);
  }
});
