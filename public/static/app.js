// Plan-Craft Frontend v2.6 - Robust Execution with AI Model Tracking
const API_BASE = '/api';

let currentProject = null;
let statsRefreshInterval = null;
let projectsRefreshInterval = null;
let tempReferences = []; // Temporary storage for references before project creation

// Enhanced trackers
let aiModelTracker = null;
let progressTimer = null;
let robustExecutor = null;

// Phase time estimation (in minutes)
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

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Plan-Craft] Initializing application...');

  // Initialize enhanced trackers
  if (typeof AIModelTracker !== 'undefined') {
    aiModelTracker = new AIModelTracker();
    window.aiModelTracker = aiModelTracker;
    console.log('[Plan-Craft] ✓ AI Model Tracker initialized');
  } else {
    console.error('[Plan-Craft] ✗ AIModelTracker not found');
  }

  if (typeof ProgressTimer !== 'undefined') {
    progressTimer = new ProgressTimer();
    window.progressTimer = progressTimer;
    console.log('[Plan-Craft] ✓ Progress Timer initialized');
  } else {
    console.error('[Plan-Craft] ✗ ProgressTimer not found');
  }

  if (typeof RobustExecutionManager !== 'undefined') {
    robustExecutor = new RobustExecutionManager();
    window.robustExecutor = robustExecutor;
    console.log('[Plan-Craft] ✓ Robust Executor initialized');
  } else {
    console.error('[Plan-Craft] ✗ RobustExecutionManager not found');
  }

  // Make PHASE_DURATION available globally
  window.PHASE_DURATION = PHASE_DURATION;

  initializeEventListeners();
  initializeDragAndDrop();
  initializeURLDetection();
  loadStats();
  loadActiveProjects(); // NEW
  startStatsRefresh();
  startProjectsRefresh(); // NEW

  // Initialize real execution system
  if (typeof initializeRealExecution !== 'undefined') {
    const systemReady = initializeRealExecution();
    if (systemReady) {
      console.log('[Plan-Craft] 🚀 All systems operational!');
    } else {
      console.error('[Plan-Craft] ⚠️ System initialization failed');
    }
  }
});

function initializeEventListeners() {
  const form = document.getElementById('create-project-form');
  if (form) {
    form.addEventListener('submit', handleProjectCreation);
  }

  const selectFilesBtn = document.getElementById('select-files-btn');
  if (selectFilesBtn) {
    selectFilesBtn.addEventListener('click', () => {
      document.getElementById('file-input').click();
    });
  }

  const refreshProjectsBtn = document.getElementById('refresh-projects-btn');
  if (refreshProjectsBtn) {
    refreshProjectsBtn.addEventListener('click', loadActiveProjects);
  }

  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
  }
}

/**
 * NEW: Drag and Drop functionality
 */
function initializeDragAndDrop() {
  const dropzone = document.getElementById('dropzone');
  if (!dropzone) return;

  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  // Highlight drop zone when item is dragged over it
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => {
      dropzone.classList.add('border-purple-600', 'bg-purple-200');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => {
      dropzone.classList.remove('border-purple-600', 'bg-purple-200');
    }, false);
  });

  // Handle dropped files
  dropzone.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
}

function handleFileSelect(e) {
  const files = e.target.files;
  handleFiles(files);
}

function handleFiles(files) {
  [...files].forEach(file => {
    addLog('INFO', `파일 추가 중: ${file.name} (${formatFileSize(file.size)})`);
    
    // Read file content if it's a text-based file
    if (isTextFile(file)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const reference = {
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          type: 'file',
          fileName: file.name,
          fileSize: file.size,
          content: e.target.result.substring(0, 1000), // First 1000 chars
          uploadedAt: Date.now()
        };
        tempReferences.push(reference);
        renderReferencesList();
        addLog('SUCCESS', `파일 추가됨: ${file.name}`);
      };
      reader.readAsText(file);
    } else if (isImageFile(file)) {
      // For images, store as base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const reference = {
          id: `image_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          type: 'image',
          fileName: file.name,
          fileSize: file.size,
          url: e.target.result, // base64 data URL
          uploadedAt: Date.now()
        };
        tempReferences.push(reference);
        renderReferencesList();
        addLog('SUCCESS', `이미지 추가됨: ${file.name}`);
      };
      reader.readAsDataURL(file);
    } else {
      // For other files, just store metadata
      const reference = {
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'file',
        fileName: file.name,
        fileSize: file.size,
        content: `[${file.type || 'Unknown type'}] ${file.name}`,
        uploadedAt: Date.now()
      };
      tempReferences.push(reference);
      renderReferencesList();
      addLog('SUCCESS', `파일 추가됨: ${file.name}`);
    }
  });
}

function isTextFile(file) {
  const textTypes = [
    'text/', 'application/json', 'application/xml',
    '.txt', '.md', '.js', '.ts', '.jsx', '.tsx', '.css', '.html'
  ];
  return textTypes.some(type => 
    file.type.includes(type) || file.name.toLowerCase().endsWith(type)
  );
}

function isImageFile(file) {
  return file.type.startsWith('image/');
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * NEW: URL Detection in textarea
 */
function initializeURLDetection() {
  const textarea = document.getElementById('user-idea');
  if (!textarea) return;

  textarea.addEventListener('input', () => {
    detectAndExtractURLs();
  });

  textarea.addEventListener('paste', (e) => {
    // Wait for paste to complete
    setTimeout(() => {
      detectAndExtractURLs();
    }, 100);
  });
}

function detectAndExtractURLs() {
  const textarea = document.getElementById('user-idea');
  const detectedUrlsDiv = document.getElementById('detected-urls');
  
  if (!textarea || !detectedUrlsDiv) return;

  const text = textarea.value;
  
  // URL regex pattern
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlPattern);

  if (urls && urls.length > 0) {
    // Show detected URLs
    detectedUrlsDiv.innerHTML = `
      <div class="flex items-center justify-between bg-purple-100 rounded-lg px-3 py-2 mt-2">
        <span class="flex items-center">
          <i class="fas fa-link text-purple-600 mr-2"></i>
          <span class="text-purple-700">${urls.length}개의 URL이 감지되었습니다</span>
        </span>
        <button
          type="button"
          onclick="extractDetectedURLs()"
          class="bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-1 px-3 rounded transition-colors"
        >
          <i class="fas fa-download mr-1"></i>
          참조로 추가
        </button>
      </div>
    `;
  } else {
    detectedUrlsDiv.innerHTML = '';
  }
}

window.extractDetectedURLs = function() {
  const textarea = document.getElementById('user-idea');
  if (!textarea) return;

  const text = textarea.value;
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlPattern);

  if (urls && urls.length > 0) {
    urls.forEach(url => {
      // Check if URL already exists
      const exists = tempReferences.some(ref => ref.url === url);
      if (!exists) {
        const reference = {
          id: `url_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          type: 'url',
          url: url,
          content: extractDomainName(url),
          uploadedAt: Date.now()
        };
        tempReferences.push(reference);
        addLog('SUCCESS', `URL 추가됨: ${url}`);
      }
    });

    renderReferencesList();
    
    // Clear detected URLs display
    const detectedUrlsDiv = document.getElementById('detected-urls');
    if (detectedUrlsDiv) {
      detectedUrlsDiv.innerHTML = `
        <div class="text-green-600 text-xs flex items-center">
          <i class="fas fa-check-circle mr-1"></i>
          ${urls.length}개의 URL이 참조 문서로 추가되었습니다
        </div>
      `;
      setTimeout(() => {
        detectedUrlsDiv.innerHTML = '';
      }, 3000);
    }
  }
};

function extractDomainName(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (e) {
    return url;
  }
}

function renderReferencesList() {
  const list = document.getElementById('references-list');
  if (!list) return;

  if (tempReferences.length === 0) {
    list.innerHTML = `
      <div class="text-xs text-gray-500 text-center py-4">
        아직 추가된 참조 문서가 없습니다
      </div>
    `;
    return;
  }

  list.innerHTML = tempReferences.map((ref, index) => {
    let icon = 'fa-link';
    let iconColor = 'text-purple-600';
    let displayName = ref.content || ref.fileName || ref.url;
    let subtitle = '';

    if (ref.type === 'file') {
      icon = 'fa-file-alt';
      iconColor = 'text-blue-600';
      subtitle = `${ref.fileName} (${formatFileSize(ref.fileSize)})`;
    } else if (ref.type === 'image') {
      icon = 'fa-image';
      iconColor = 'text-pink-600';
      subtitle = `${ref.fileName} (${formatFileSize(ref.fileSize)})`;
    } else if (ref.type === 'url') {
      icon = 'fa-link';
      iconColor = 'text-purple-600';
      subtitle = ref.url;
    }

    return `
      <div class="flex items-center justify-between bg-white rounded-lg p-3 border-2 border-purple-200 hover:border-purple-400 transition-all">
        <div class="flex items-center flex-1 min-w-0">
          <i class="fas ${icon} ${iconColor} mr-3 text-lg"></i>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-700 truncate">${displayName}</div>
            ${subtitle ? `<div class="text-xs text-gray-500 truncate">${subtitle}</div>` : ''}
          </div>
        </div>
        <button
          onclick="removeReference(${index})"
          class="ml-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2 transition-all"
          title="삭제"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  }).join('');
}

window.removeReference = function(index) {
  const ref = tempReferences[index];
  tempReferences.splice(index, 1);
  renderReferencesList();
  addLog('INFO', `참조 제거됨: ${ref.fileName || ref.url || ref.content}`);
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
    tempReferences.forEach(ref => {
      if (ref.type === 'url') {
        addLog('INFO', `  - URL: ${ref.url}`);
      } else if (ref.type === 'file') {
        addLog('INFO', `  - 파일: ${ref.fileName}`);
      } else if (ref.type === 'image') {
        addLog('INFO', `  - 이미지: ${ref.fileName}`);
      }
    });
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

    // Start progress timer (29 minutes total)
    const totalMinutes = Object.values(PHASE_DURATION).reduce((a, b) => a + b, 0);
    if (progressTimer) {
      progressTimer.start(totalMinutes);
      addLog('INFO', `⏱️ 예상 완료 시간: ${totalMinutes}분 (10초마다 자동 업데이트)`);
    } else {
      console.warn('[Warning] Progress timer not initialized');
    }

    // Clear temp references
    tempReferences = [];
    renderReferencesList();

    // ========================================
    // REAL EXECUTION STARTS HERE
    // ========================================
    addLog('SUCCESS', `\n✨ 실제 AI 모델 실행 시작!\n`);
    
    // Execute all phases with REAL tracking
    if (typeof executeAllPhasesWithTracking === 'function') {
      addLog('INFO', '🚀 강력한 실행 모드 활성화');
      
      // Start execution in background
      executeAllPhasesWithTracking(project.projectId)
        .then(() => {
          addLog('SUCCESS', '\n🎉 프로젝트 완료!');
          if (progressTimer) {
            progressTimer.stop();
          }
        })
        .catch(error => {
          addLog('ERROR', `프로젝트 실행 실패: ${error.message}`);
          if (progressTimer) {
            progressTimer.stop();
          }
        });
    } else {
      console.error('[ERROR] executeAllPhasesWithTracking not found!');
      addLog('ERROR', '⚠️ 실행 함수를 찾을 수 없습니다. real-execution.js를 확인하세요.');
      
      // Fallback to old simulation
      addLog('WARN', '⚠️ Fallback: 기본 시뮬레이션 모드로 전환');
      if (robustExecutor) {
        await robustExecutor.executeWithRetry(
          () => startPhase(project.projectId, 'G1_CORE_LOGIC'),
          'G1 단계 시작'
        );
      } else {
        await startPhase(project.projectId, 'G1_CORE_LOGIC');
      }
    }

    // Update UI
    renderPipelineViewer(project.projectId);
    loadStats();

    // DON'T redirect - stay on page to see execution
    addLog('INFO', '📊 이 페이지에서 실행 과정을 확인하세요');

  } catch (error) {
    addLog('ERROR', `프로젝트 생성 실패: ${error.message}`);
    
    // Show error modal if ErrorHandler is available
    if (typeof ErrorHandler !== 'undefined') {
      ErrorHandler.showError(
        '프로젝트 생성 실패',
        '프로젝트를 생성하는 중 오류가 발생했습니다.',
        `오류 메시지: ${error.message}\n\n다시 시도해주세요.`
      );
    }
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
  logEntry.className = `${color} mb-1 log-entry`;
  logEntry.innerHTML = `[${timestamp}] ${icon} [${level}] ${message}`;

  // Insert at the TOP (최신이 위로)
  const firstChild = terminal.firstChild;
  if (firstChild) {
    terminal.insertBefore(logEntry, firstChild);
  } else {
    terminal.appendChild(logEntry);
  }

  // Keep only last 10 logs (최대 10개만 유지)
  const logs = terminal.querySelectorAll('.log-entry');
  if (logs.length > 10) {
    // Remove oldest logs from the bottom
    for (let i = 10; i < logs.length; i++) {
      logs[i].remove();
    }
  }

  // Do NOT scroll (keep viewing the top where new logs appear)
  // terminal.scrollTop = 0; // Optional: auto-scroll to top
}

function startStatsRefresh() {
  statsRefreshInterval = setInterval(loadStats, 5000);
}

function startProjectsRefresh() {
  projectsRefreshInterval = setInterval(loadActiveProjects, 10000); // Every 10 seconds
}

/**
 * Load and display active projects
 */
async function loadActiveProjects() {
  try {
    const response = await fetch(`${API_BASE}/stats`);
    if (!response.ok) return;

    const data = await response.json();
    const container = document.getElementById('active-projects-list');
    if (!container) return;

    if (!data.projects || data.projects.length === 0) {
      container.innerHTML = `
        <div class="text-gray-600 text-center py-8">
          <i class="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
          <p>진행 중인 프로젝트가 없습니다. 새 프로젝트를 시작하세요!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = data.projects.map(project => {
      const statusInfo = getProjectStatusInfo(project);
      const timeInfo = calculateTimeInfo(project);
      
      return `
        <div class="bg-white rounded-xl p-6 border-2 ${statusInfo.borderColor} hover:shadow-lg transition-all" id="project-card-${project.projectId}">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-xl font-bold text-gray-800">${project.projectName}</h3>
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.textColor}">
                  ${statusInfo.label}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-3">${project.projectId}</p>
              <div class="flex items-center gap-4 text-sm">
                <span class="text-purple-600 font-semibold">
                  <i class="fas fa-layer-group mr-1"></i>
                  ${project.currentPhase}
                </span>
                <span class="text-blue-600">
                  <i class="fas fa-percentage mr-1"></i>
                  ${project.progress.toFixed(0)}% 완료
                </span>
                <span id="time-info-${project.projectId}">
                  ${timeInfo.html}
                </span>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <a 
                href="/projects/${project.projectId}"
                class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-all inline-flex items-center justify-center"
              >
                <i class="fas fa-eye mr-2"></i>
                상세보기
              </a>
              <button
                onclick="quickStopProject('${project.projectId}')"
                class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition-all inline-flex items-center justify-center"
                title="프로젝트 중지"
              >
                <i class="fas fa-pause mr-2"></i>
                중지
              </button>
              <button
                onclick="quickCancelProject('${project.projectId}')"
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-all inline-flex items-center justify-center"
                title="프로젝트 취소"
              >
                <i class="fas fa-times mr-2"></i>
                취소
              </button>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              class="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
              style="width: ${project.progress.toFixed(0)}%"
            ></div>
          </div>
          
          <!-- Time Bar -->
          <div id="time-bar-${project.projectId}">
            ${timeInfo.progressBar}
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Failed to load projects:', error);
  }
}

/**
 * Get project status display info
 */
function getProjectStatusInfo(project) {
  if (project.isCompleted) {
    return {
      label: '완료',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-300'
    };
  }
  
  // Check if paused (you'll need to add isPaused to project state)
  const currentPhase = project.currentPhase || '';
  if (currentPhase.includes('PAUSED')) {
    return {
      label: '일시중지',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-300'
    };
  }
  
  return {
    label: '진행 중',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300'
  };
}

/**
 * Calculate time information for a project (in SECONDS, not minutes)
 */
function calculateTimeInfo(project) {
  const phases = Object.keys(PHASE_DURATION);
  const currentPhaseIndex = phases.indexOf(project.currentPhase);
  
  if (currentPhaseIndex === -1) {
    return {
      html: '<span class="text-gray-500"><i class="fas fa-clock mr-1"></i>시간 계산 중...</span>',
      progressBar: '',
      elapsedSeconds: 0,
      remainingSeconds: 0,
      totalSeconds: 0
    };
  }
  
  // Calculate elapsed time (completed phases) in SECONDS
  let elapsedSeconds = 0;
  for (let i = 0; i < currentPhaseIndex; i++) {
    elapsedSeconds += PHASE_DURATION[phases[i]] * 60; // Convert minutes to seconds
  }
  
  // Add current phase progress (simulate with timestamp)
  if (project.startTime) {
    const now = Date.now();
    const projectStart = new Date(project.startTime).getTime();
    const actualElapsed = Math.floor((now - projectStart) / 1000); // seconds
    elapsedSeconds = Math.min(actualElapsed, elapsedSeconds + PHASE_DURATION[project.currentPhase] * 60);
  }
  
  // Calculate remaining time
  let remainingSeconds = 0;
  for (let i = currentPhaseIndex; i < phases.length; i++) {
    remainingSeconds += PHASE_DURATION[phases[i]] * 60; // Convert to seconds
  }
  remainingSeconds = Math.max(0, remainingSeconds - (project.startTime ? Math.floor((Date.now() - new Date(project.startTime).getTime()) / 1000) : 0));
  
  const totalSeconds = elapsedSeconds + remainingSeconds;
  const timeProgress = totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 100 : 0;
  
  return {
    html: `
      <span class="text-blue-600">
        <i class="fas fa-hourglass-start mr-1"></i>
        경과: <strong>${formatTimeSeconds(elapsedSeconds)}</strong>
      </span>
      <span class="text-orange-600 ml-2">
        <i class="fas fa-hourglass-end mr-1"></i>
        남음: <strong>${formatTimeSeconds(remainingSeconds)}</strong>
      </span>
    `,
    progressBar: `
      <div class="flex items-center gap-2 text-xs text-gray-600 mt-2">
        <div class="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
            style="width: ${timeProgress.toFixed(1)}%"
          ></div>
        </div>
        <span class="font-mono font-semibold">${timeProgress.toFixed(0)}%</span>
      </div>
    `,
    elapsedSeconds,
    remainingSeconds,
    totalSeconds,
    progress: timeProgress
  };
}

/**
 * Format seconds to readable time (초단위 포맷)
 */
function formatTimeSeconds(seconds) {
  if (seconds < 60) {
    return `${seconds}초`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}분 ${secs}초`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (minutes > 0 && secs > 0) {
      return `${hours}시간 ${minutes}분 ${secs}초`;
    } else if (minutes > 0) {
      return `${hours}시간 ${minutes}분`;
    } else {
      return `${hours}시간`;
    }
  }
}

/**
 * Format minutes to readable time
 */
function formatTime(minutes) {
  if (minutes < 1) {
    return '< 1분';
  } else if (minutes < 60) {
    return `${Math.round(minutes)}분`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  }
}

/**
 * Quick stop project from dashboard
 */
window.quickStopProject = async function(projectId) {
  if (!confirm('이 프로젝트를 일시중지 하시겠습니까?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/projects/${projectId}/pause`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    // Remove time info on pause
    const timeInfo = document.getElementById(`time-info-${projectId}`);
    const timeBar = document.getElementById(`time-bar-${projectId}`);
    if (timeInfo) {
      timeInfo.style.display = 'none';
    }
    if (timeBar) {
      timeBar.style.display = 'none';
    }
    
    addLog('SUCCESS', `프로젝트 ${projectId} 일시중지됨 - 시간 추적 중단`);
    loadActiveProjects(); // Refresh list
    loadStats(); // Refresh stats
  } catch (error) {
    addLog('ERROR', `프로젝트 중지 실패: ${error.message}`);
  }
}

/**
 * Quick cancel project from dashboard
 */
window.quickCancelProject = async function(projectId) {
  if (!confirm('이 프로젝트를 취소하시겠습니까?\n\n취소된 프로젝트는 복구할 수 없습니다.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/projects/${projectId}/cancel`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    addLog('SUCCESS', `프로젝트 ${projectId} 취소됨`);
    loadActiveProjects(); // Refresh list
    loadStats(); // Refresh stats
  } catch (error) {
    addLog('ERROR', `프로젝트 취소 실패: ${error.message}`);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (statsRefreshInterval) {
    clearInterval(statsRefreshInterval);
  }
  if (projectsRefreshInterval) {
    clearInterval(projectsRefreshInterval);
  }
});
