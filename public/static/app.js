// Plan-Craft v3.0 - Complete Rewrite for Robust Execution
// ENFORCED: Max 3 projects, real-time updates, powerful tracking

const API_BASE = '/api';
const MAX_PROJECTS = 3;

// Global state
let tempReferences = [];
let activeProjects = [];
let updateTimers = {};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Plan-Craft v3.0] 🚀 Initializing...');
  
  // Force initialize all tracking systems
  if (typeof window.forceInitializeAll === 'function') {
    window.forceInitializeAll();
  }
  
  setupEventListeners();
  loadStats();
  loadActiveProjects();
  
  // Start refresh loops
  startStatsRefresh();
  startProjectsRefresh();
  
  console.log('[Plan-Craft v3.0] ✅ Initialization complete');
});

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  // Project form submission
  const form = document.getElementById('project-form');
  if (form) {
    form.addEventListener('submit', handleProjectCreation);
  }
  
  // File upload
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('bg-purple-200', 'border-purple-500');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('bg-purple-200', 'border-purple-500');
    });
    dropzone.addEventListener('drop', handleFileDrop);
    fileInput.addEventListener('change', handleFileSelect);
  }
  
  // Control buttons
  document.getElementById('stop-all-btn')?.addEventListener('click', stopAllProjects);
  document.getElementById('partial-cancel-btn')?.addEventListener('click', partialCancelProjects);
  document.getElementById('cancel-all-btn')?.addEventListener('click', cancelAllProjects);
  
  // Demo buttons
  document.getElementById('demo-mode-btn')?.addEventListener('click', startDemoMode);
  document.getElementById('error-demo-btn')?.addEventListener('click', showErrorDemo);
  
  // Refresh button
  document.getElementById('refresh-projects-btn')?.addEventListener('click', loadActiveProjects);
}

// ==================== PROJECT CREATION ====================
async function handleProjectCreation(e) {
  e.preventDefault();
  
  const projectName = document.getElementById('project-name').value.trim();
  const userIdea = document.getElementById('project-idea').value.trim();
  const outputFormat = document.querySelector('input[name="output-format"]:checked')?.value || 'html';
  
  if (!projectName || !userIdea) {
    alert('프로젝트 이름과 아이디어를 모두 입력해주세요.');
    return;
  }
  
  // Check max projects limit
  if (activeProjects.length >= MAX_PROJECTS) {
    alert(`최대 ${MAX_PROJECTS}개의 프로젝트만 동시에 진행할 수 있습니다.\n진행 중인 프로젝트를 완료하거나 취소해주세요.`);
    return;
  }
  
  addLog('INFO', `프로젝트 생성 중: ${projectName}`);
  
  try {
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectName,
        userIdea,
        references: tempReferences,
        outputFormat
      })
    });
    
    if (!response.ok) {
      throw new Error('프로젝트 생성 실패');
    }
    
    const project = await response.json();
    addLog('SUCCESS', `프로젝트 생성 완료: ${project.projectId}`);
    
    // Reset form
    document.getElementById('project-form').reset();
    tempReferences = [];
    document.getElementById('file-list').innerHTML = '';
    
    // Reload projects
    await loadActiveProjects();
    
    // Start execution
    if (typeof window.executeAllPhasesWithTracking === 'function') {
      addLog('INFO', '🚀 REAL EXECUTION 시작...');
      window.executeAllPhasesWithTracking(project.projectId).catch(err => {
        console.error('[Execution Error]', err);
        addLog('ERROR', `실행 오류: ${err.message}`);
      });
    } else {
      addLog('WARN', 'executeAllPhasesWithTracking 함수를 찾을 수 없습니다.');
    }
    
  } catch (error) {
    console.error('[Project Creation Error]', error);
    addLog('ERROR', `프로젝트 생성 실패: ${error.message}`);
    alert(`프로젝트 생성 중 오류가 발생했습니다: ${error.message}`);
  }
}

// ==================== LOAD ACTIVE PROJECTS ====================
async function loadActiveProjects() {
  try {
    const response = await fetch(`${API_BASE}/stats`);
    if (!response.ok) throw new Error('Failed to load projects');
    
    const data = await response.json();
    activeProjects = (data.projects || []).filter(p => p.status === 'active' || p.status === 'running');
    
    // Limit to max 3 projects
    activeProjects = activeProjects.slice(0, MAX_PROJECTS);
    
    renderProjects();
    
  } catch (error) {
    console.error('[Load Projects Error]', error);
  }
}

// ==================== RENDER PROJECTS ====================
function renderProjects() {
  const container = document.getElementById('active-projects-container');
  const noProjectsMsg = document.getElementById('no-projects-message');
  
  if (!container) return;
  
  if (activeProjects.length === 0) {
    if (noProjectsMsg) noProjectsMsg.style.display = 'block';
    // Clear any existing project cards
    const existingCards = container.querySelectorAll('.project-card');
    existingCards.forEach(card => card.remove());
    return;
  }
  
  if (noProjectsMsg) noProjectsMsg.style.display = 'none';
  
  // Clear existing cards
  const existingCards = container.querySelectorAll('.project-card');
  existingCards.forEach(card => card.remove());
  
  // Render each project
  activeProjects.forEach((project, index) => {
    const card = createProjectCard(project, index);
    container.appendChild(card);
    
    // Start real-time timer for this project
    startProjectTimer(project.projectId);
  });
}

// ==================== CREATE PROJECT CARD ====================
function createProjectCard(project, index) {
  const card = document.createElement('div');
  card.className = 'project-card bg-gradient-to-r from-white to-blue-50 rounded-lg p-4 border-2 border-blue-200 shadow-md';
  card.id = `project-card-${project.projectId}`;
  
  // Calculate time info
  const timeInfo = calculateProjectTime(project);
  
  card.innerHTML = `
    <div class="flex justify-between items-start mb-3">
      <div class="flex-1">
        <h3 class="text-lg font-bold text-gray-800 mb-1">
          <i class="fas fa-file-alt text-indigo-600 mr-1"></i>
          ${project.projectName || 'Untitled Project'}
        </h3>
        <p class="text-xs text-gray-500 font-mono">${project.projectId}</p>
      </div>
      <div class="flex gap-2">
        <button
          onclick="viewProjectDetails('${project.projectId}')"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs font-semibold transition-all"
        >
          <i class="fas fa-eye"></i>
        </button>
        <button
          onclick="stopProject('${project.projectId}')"
          class="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-semibold transition-all"
        >
          <i class="fas fa-pause"></i>
        </button>
      </div>
    </div>
    
    <!-- Current Phase -->
    <div class="mb-2">
      <div class="flex items-center gap-2 mb-1">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span class="text-sm font-semibold text-gray-700">${getPhaseLabel(project.currentPhase)}</span>
        <span class="text-xs text-gray-500">${timeInfo.percent}% 완료</span>
      </div>
    </div>
    
    <!-- Progress Bar -->
    <div class="mb-3">
      <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          id="progress-bar-${project.projectId}"
          class="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500"
          style="width: ${timeInfo.percent}%"
        ></div>
      </div>
    </div>
    
    <!-- Time Info -->
    <div id="time-info-${project.projectId}" class="flex justify-between text-xs">
      <span class="text-blue-600 font-semibold">
        <i class="fas fa-clock mr-1"></i>
        경과: <span class="font-mono">${timeInfo.elapsedText}</span>
      </span>
      <span class="text-purple-600 font-semibold">
        <i class="fas fa-hourglass-half mr-1"></i>
        남음: <span class="font-mono">${timeInfo.remainingText}</span>
      </span>
    </div>
  `;
  
  return card;
}

// ==================== TIME CALCULATION ====================
const PHASE_DURATION = {
  'G1_CORE_LOGIC': 3,
  'G2_API_SERVER': 4,
  'G3_UI_COMPONENTS': 5,
  'G4_INTEGRATION': 3,
  'G5_UNIT_TESTS': 4,
  'G6_SECURITY_SCAN': 2,
  'G7_BUILD_OPTIMIZATION': 2,
  'G8_DEPLOYMENT': 3,
  'G9_DOCUMENTATION': 2,
  'G10_HANDOVER': 1
};

const PHASE_ORDER = [
  'G1_CORE_LOGIC',
  'G2_API_SERVER',
  'G3_UI_COMPONENTS',
  'G4_INTEGRATION',
  'G5_UNIT_TESTS',
  'G6_SECURITY_SCAN',
  'G7_BUILD_OPTIMIZATION',
  'G8_DEPLOYMENT',
  'G9_DOCUMENTATION',
  'G10_HANDOVER'
];

function calculateProjectTime(project) {
  const currentPhase = project.currentPhase || 'G1_CORE_LOGIC';
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  
  if (currentIndex === -1) {
    return {
      elapsedText: '계산 중...',
      remainingText: '계산 중...',
      percent: 0
    };
  }
  
  // Calculate elapsed time (completed phases)
  let elapsedMinutes = 0;
  for (let i = 0; i < currentIndex; i++) {
    elapsedMinutes += PHASE_DURATION[PHASE_ORDER[i]] || 0;
  }
  
  // Add current phase progress (assume 50% if running)
  if (project.status === 'active' || project.status === 'running') {
    elapsedMinutes += (PHASE_DURATION[currentPhase] || 0) * 0.5;
  }
  
  // Calculate remaining time
  let remainingMinutes = 0;
  for (let i = currentIndex; i < PHASE_ORDER.length; i++) {
    remainingMinutes += PHASE_DURATION[PHASE_ORDER[i]] || 0;
  }
  
  // Total time
  const totalMinutes = Object.values(PHASE_DURATION).reduce((a, b) => a + b, 0);
  const percent = Math.min(100, Math.round((elapsedMinutes / totalMinutes) * 100));
  
  return {
    elapsedText: formatTimeMinutes(elapsedMinutes),
    remainingText: formatTimeMinutes(remainingMinutes),
    percent
  };
}

function formatTimeMinutes(minutes) {
  if (minutes < 1) return '< 1분';
  if (minutes < 60) return `${Math.round(minutes)}분`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}시간 ${mins}분`;
}

function getPhaseLabel(phase) {
  const labels = {
    'G1_CORE_LOGIC': '핵심 로직 구현',
    'G2_API_SERVER': 'API 서버 구축',
    'G3_UI_COMPONENTS': 'UI 컴포넌트 개발',
    'G4_INTEGRATION': '시스템 통합',
    'G5_UNIT_TESTS': '단위 테스트',
    'G6_SECURITY_SCAN': '보안 스캔',
    'G7_BUILD_OPTIMIZATION': '빌드 최적화',
    'G8_DEPLOYMENT': '배포 준비',
    'G9_DOCUMENTATION': '문서화',
    'G10_HANDOVER': '최종 인수인계'
  };
  return labels[phase] || phase;
}

// ==================== REAL-TIME PROJECT TIMER ====================
function startProjectTimer(projectId) {
  // Clear existing timer if any
  if (updateTimers[projectId]) {
    clearInterval(updateTimers[projectId]);
  }
  
  // Update every 10 seconds
  updateTimers[projectId] = setInterval(() => {
    updateProjectTime(projectId);
  }, 10000);
  
  // Initial update
  updateProjectTime(projectId);
}

function updateProjectTime(projectId) {
  const project = activeProjects.find(p => p.projectId === projectId);
  if (!project) {
    if (updateTimers[projectId]) {
      clearInterval(updateTimers[projectId]);
      delete updateTimers[projectId];
    }
    return;
  }
  
  const timeInfo = calculateProjectTime(project);
  const timeInfoEl = document.getElementById(`time-info-${projectId}`);
  const progressBar = document.getElementById(`progress-bar-${projectId}`);
  
  if (timeInfoEl) {
    timeInfoEl.innerHTML = `
      <span class="text-blue-600 font-semibold">
        <i class="fas fa-clock mr-1"></i>
        경과: <span class="font-mono">${timeInfo.elapsedText}</span>
      </span>
      <span class="text-purple-600 font-semibold">
        <i class="fas fa-hourglass-half mr-1"></i>
        남음: <span class="font-mono">${timeInfo.remainingText}</span>
      </span>
    `;
  }
  
  if (progressBar) {
    progressBar.style.width = `${timeInfo.percent}%`;
  }
}

// ==================== PROJECT CONTROLS ====================
function stopAllProjects() {
  if (activeProjects.length === 0) {
    alert('진행 중인 프로젝트가 없습니다.');
    return;
  }
  
  if (confirm(`모든 프로젝트(${activeProjects.length}개)를 중지하시겠습니까?`)) {
    activeProjects.forEach(project => {
      stopProject(project.projectId);
    });
  }
}

function partialCancelProjects() {
  if (activeProjects.length === 0) {
    alert('진행 중인 프로젝트가 없습니다.');
    return;
  }
  
  alert('일부 취소 기능은 곧 제공될 예정입니다.');
}

function cancelAllProjects() {
  if (activeProjects.length === 0) {
    alert('진행 중인 프로젝트가 없습니다.');
    return;
  }
  
  if (confirm(`모든 프로젝트(${activeProjects.length}개)를 취소하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
    activeProjects.forEach(project => {
      cancelProject(project.projectId);
    });
  }
}

async function stopProject(projectId) {
  try {
    const response = await fetch(`${API_BASE}/projects/${projectId}/pause`, {
      method: 'POST'
    });
    
    if (!response.ok) throw new Error('Failed to stop project');
    
    addLog('SUCCESS', `프로젝트 중지됨: ${projectId}`);
    await loadActiveProjects();
    
  } catch (error) {
    console.error('[Stop Project Error]', error);
    addLog('ERROR', `프로젝트 중지 실패: ${error.message}`);
  }
}

async function cancelProject(projectId) {
  try {
    const response = await fetch(`${API_BASE}/projects/${projectId}/cancel`, {
      method: 'POST'
    });
    
    if (!response.ok) throw new Error('Failed to cancel project');
    
    addLog('SUCCESS', `프로젝트 취소됨: ${projectId}`);
    
    // Clear timer
    if (updateTimers[projectId]) {
      clearInterval(updateTimers[projectId]);
      delete updateTimers[projectId];
    }
    
    await loadActiveProjects();
    
  } catch (error) {
    console.error('[Cancel Project Error]', error);
    addLog('ERROR', `프로젝트 취소 실패: ${error.message}`);
  }
}

function viewProjectDetails(projectId) {
  window.location.href = `/projects/${projectId}`;
}

// ==================== FILE HANDLING ====================
function handleFileDrop(e) {
  e.preventDefault();
  const dropzone = document.getElementById('dropzone');
  dropzone.classList.remove('bg-purple-200', 'border-purple-500');
  
  const files = Array.from(e.dataTransfer.files);
  processFiles(files);
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  processFiles(files);
}

function processFiles(files) {
  files.forEach(file => {
    tempReferences.push({
      type: 'file',
      name: file.name,
      size: file.size,
      file: file
    });
  });
  
  renderFileList();
}

function renderFileList() {
  const fileList = document.getElementById('file-list');
  if (!fileList) return;
  
  if (tempReferences.length === 0) {
    fileList.innerHTML = '';
    return;
  }
  
  fileList.innerHTML = tempReferences.map((ref, index) => `
    <div class="flex items-center justify-between bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
      <span class="text-sm text-gray-700 flex items-center gap-2">
        <i class="fas fa-file text-purple-600"></i>
        ${ref.name}
        ${ref.size ? `<span class="text-xs text-gray-500">(${Math.round(ref.size / 1024)}KB)</span>` : ''}
      </span>
      <button
        onclick="removeReference(${index})"
        class="text-red-600 hover:text-red-800 text-sm"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');
}

function removeReference(index) {
  tempReferences.splice(index, 1);
  renderFileList();
}

// ==================== STATISTICS ====================
async function loadStats() {
  try {
    const response = await fetch(`${API_BASE}/stats`);
    if (!response.ok) throw new Error('Failed to load stats');
    
    const stats = await response.json();
    
    document.getElementById('stat-total').textContent = stats.total || 0;
    document.getElementById('stat-active').textContent = stats.active || 0;
    document.getElementById('stat-paused').textContent = stats.paused || 0;
    document.getElementById('stat-completed').textContent = stats.completed || 0;
    
  } catch (error) {
    console.error('[Load Stats Error]', error);
  }
}

function startStatsRefresh() {
  setInterval(loadStats, 5000); // Every 5 seconds
}

function startProjectsRefresh() {
  setInterval(loadActiveProjects, 10000); // Every 10 seconds
}

// ==================== LOGGING ====================
function addLog(level, message) {
  const terminal = document.getElementById('terminal-console');
  if (!terminal) return;
  
  const timestamp = new Date().toTimeString().split(' ')[0];
  const colors = {
    'INFO': 'text-blue-400',
    'SUCCESS': 'text-green-400',
    'ERROR': 'text-red-400',
    'WARN': 'text-yellow-400'
  };
  const icons = {
    'INFO': '◆',
    'SUCCESS': '✓',
    'ERROR': '✗',
    'WARN': '⚠'
  };
  
  const logEntry = document.createElement('div');
  logEntry.className = colors[level] || 'text-gray-400';
  logEntry.innerHTML = `<span class="text-gray-500">[${timestamp}]</span> ${icons[level] || '•'} ${message}`;
  
  // Insert at top (latest first)
  const firstChild = terminal.querySelector('div:not(.text-cyan-400):not(.text-yellow-400)');
  if (firstChild) {
    terminal.insertBefore(logEntry, firstChild);
  } else {
    terminal.appendChild(logEntry);
  }
  
  // Keep only last 10 logs
  const logs = terminal.querySelectorAll('div:not(.text-cyan-400):not(.text-yellow-400)');
  if (logs.length > 10) {
    for (let i = 10; i < logs.length; i++) {
      logs[i].remove();
    }
  }
}

// ==================== DEMO MODE ====================
function startDemoMode() {
  if (typeof window.startDemoMode === 'function') {
    window.startDemoMode();
  } else {
    alert('데모 모드를 시작할 수 없습니다. demo-mode.js를 확인해주세요.');
  }
}

function showErrorDemo() {
  if (typeof window.ErrorHandler !== 'undefined') {
    const errorHandler = new window.ErrorHandler();
    errorHandler.showError(
      '데모: 에러 발생',
      '이것은 에러 모달의 데모입니다.',
      'Stack trace: demo error...',
      () => console.log('다시 시도 클릭됨')
    );
  } else {
    alert('ErrorHandler를 찾을 수 없습니다. enhanced-tracking.js를 확인해주세요.');
  }
}

// Expose functions to window
window.stopProject = stopProject;
window.cancelProject = cancelProject;
window.viewProjectDetails = viewProjectDetails;
window.removeReference = removeReference;
window.stopAllProjects = stopAllProjects;
window.partialCancelProjects = partialCancelProjects;
window.cancelAllProjects = cancelAllProjects;

console.log('[Plan-Craft v3.0] 🎯 app.js loaded successfully');
