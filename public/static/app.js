// Plan-Craft Frontend v2.1 - Enhanced References UX
const API_BASE = '/api';

let currentProject = null;
let statsRefreshInterval = null;
let tempReferences = []; // Temporary storage for references before project creation

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  initializeDragAndDrop();
  initializeURLDetection();
  loadStats();
  startStatsRefresh();
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
