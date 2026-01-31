// Plan-Craft Frontend - Main Dashboard
const API_BASE = '/api';

let currentProject = null;
let statsRefreshInterval = null;

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
}

async function handleProjectCreation(e) {
  e.preventDefault();

  const projectName = document.getElementById('project-name').value;
  const userIdea = document.getElementById('user-idea').value;

  if (!projectName || !userIdea) {
    addLog('ERROR', 'All fields are required');
    return;
  }

  addLog('INFO', `Creating project: ${projectName}...`);

  try {
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName, userIdea })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const project = await response.json();
    currentProject = project;

    addLog('SUCCESS', `Project created: ${project.projectId}`);
    addLog('INFO', `Current phase: ${project.currentPhase}`);

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
    addLog('ERROR', `Failed to create project: ${error.message}`);
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
    addLog('INFO', `Phase ${gate} started`);

    // Simulate phase execution
    await simulatePhaseExecution(projectId, gate);

  } catch (error) {
    addLog('ERROR', `Failed to start phase: ${error.message}`);
  }
}

async function simulatePhaseExecution(projectId, gate) {
  addLog('INFO', `[${gate}] Analyzing requirements...`);
  await sleep(500);

  addLog('INFO', `[${gate}] Generating code...`);
  await sleep(1000);

  // Update metrics
  await updatePhaseMetrics(projectId, gate, {
    buildSuccessRate: 100,
    testCoverage: 96.5,
    securityIssues: 0
  });

  addLog('SUCCESS', `[${gate}] Metrics updated`);
  await sleep(500);

  // Complete phase
  const completeResponse = await fetch(`${API_BASE}/projects/${projectId}/phases/${gate}/complete`, {
    method: 'POST'
  });

  const result = await completeResponse.json();

  if (result.success) {
    addLog('SUCCESS', `[${gate}] Phase completed successfully`);
    addLog('INFO', `Moving to next phase: ${result.nextPhase}`);
  } else {
    addLog('ERROR', `[${gate}] Phase rejected - quality gates not met`);
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
    addLog('ERROR', `Failed to update metrics: ${error.message}`);
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
    console.error('Failed to load stats:', error);
  }
}

function renderStats(stats) {
  const statsDisplay = document.getElementById('stats-display');
  if (!statsDisplay) return;

  statsDisplay.innerHTML = `
    <div class="bg-gray-700 rounded-lg p-4 text-center">
      <div class="text-3xl font-bold text-cyan-400">${stats.totalProjects}</div>
      <div class="text-sm text-gray-400">전체 프로젝트</div>
    </div>
    <div class="bg-gray-700 rounded-lg p-4 text-center">
      <div class="text-3xl font-bold text-yellow-400">${stats.activeProjects}</div>
      <div class="text-sm text-gray-400">진행 중</div>
    </div>
    <div class="bg-gray-700 rounded-lg p-4 text-center">
      <div class="text-3xl font-bold text-green-400">${stats.completedProjects}</div>
      <div class="text-sm text-gray-400">완료</div>
    </div>
  `;
}

function renderPipelineViewer(projectId) {
  const pipelineViewer = document.getElementById('pipeline-viewer');
  if (!pipelineViewer) return;

  pipelineViewer.innerHTML = `
    <div class="text-gray-300">
      <i class="fas fa-spinner fa-spin text-cyan-400 mr-2"></i>
      프로젝트 초기화 중... 
      <a href="/projects/${projectId}" class="text-cyan-400 hover:underline ml-2">
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

  const color = colors[level] || 'text-gray-400';
  const logEntry = document.createElement('div');
  logEntry.className = `${color} mb-1`;
  logEntry.innerHTML = `[${timestamp}] [${level}] ${message}`;

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
