import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './public' }))

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI 자율 Plan-Craft 솔루션 개발 v7.4.0</title>
      <meta name="cache-control" content="no-cache, no-store, must-revalidate">
      <meta name="pragma" content="no-cache">
      <meta name="expires" content="0">
      <meta name="version" content="7.4.0-report-engine">
      <script src="https://cdn.tailwindcss.com?v=7.2.0"></script>
      <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
      <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
      <style>
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      </style>
    </head>
    <body>
      <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
        <div class="container mx-auto max-w-7xl">
          
          <!-- AI Agent Status - Only Master Orchestrator initially -->
          <section class="mb-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <h2 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <i class="fas fa-robot text-purple-600"></i>
              AI Agent 상태
            </h2>
            <div id="dynamic-agents-container" class="grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
              <!-- Master Orchestrator - Always present -->
              <div class="ai-agent-status agent-card flex items-center gap-2 p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200" data-agent="master" data-model="gpt-5.2-preview">
                <div class="relative">
                  <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <i class="fas fa-crown text-white text-lg"></i>
                  </div>
                  <div class="agent-spinner absolute inset-0 hidden">
                    <div class="w-full h-full rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
                  </div>
                  <div class="agent-status-dot absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-bold text-purple-900">Master Orchestrator</h3>
                  <p class="text-xs text-purple-600 truncate">전체 조율 및 전략 • 고급 추론</p>
                  <div class="agent-model-display mt-1">
                    <div class="text-xs text-gray-400">
                      대기 중: gpt-5.2-preview
                    </div>
                  </div>
                </div>
              </div>
              <!-- Dynamic agents will be added here -->
            </div>
          </section>

          <!-- Active Projects Section -->
          <section class="mb-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <h2 class="text-xl font-bold mb-3 text-gray-800 flex items-center gap-2">
              <i class="fas fa-folder-open text-indigo-600"></i>
              진행 중인 문서
            </h2>
            
            <div class="flex justify-between items-start gap-4">
              <!-- Left: Projects List (max 3) -->
              <div class="flex-1">
                <div id="active-projects-container" class="space-y-3">
                  <!-- Projects will be dynamically inserted here -->
                  <div id="no-projects-message" class="text-center py-6 bg-gray-50 rounded-lg">
                    <i class="fas fa-inbox text-4xl text-gray-300 mb-2"></i>
                    <p class="text-gray-500 text-sm">진행 중인 프로젝트가 없습니다.</p>
                    <p class="text-gray-400 text-xs mt-1">아래에서 새 프로젝트를 시작하세요!</p>
                  </div>
                </div>
              </div>

              <!-- Right: Control Buttons -->
              <div class="flex flex-col gap-2 min-w-[140px]">
                <button
                  id="stop-all-btn"
                  class="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <i class="fas fa-stop-circle text-lg"></i>
                  <span>중지</span>
                </button>
                <button
                  id="partial-cancel-btn"
                  class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <i class="fas fa-pause-circle text-lg"></i>
                  <span>일부취소</span>
                </button>
                <button
                  id="cancel-all-btn"
                  class="bg-gray-700 hover:bg-gray-800 text-white px-4 py-3 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <i class="fas fa-times-circle text-lg"></i>
                  <span>전체취소</span>
                </button>
                
                <!-- Thinking Process Button - Below control buttons -->
                <button
                  id="open-thinking-process-btn"
                  class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <i class="fas fa-brain"></i>
                  <span>사고과정 보기</span>
                </button>
              </div>
            </div>
          </section>

          <!-- Project Creation Form -->
          <section class="mb-4 bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h2 class="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <i class="fas fa-plus-circle text-green-600"></i>
              새 프로젝트 시작
            </h2>
            <form id="project-form" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  <i class="fas fa-tag mr-1"></i>
                  프로젝트 이름
                </label>
                <input
                  type="text"
                  id="project-name"
                  placeholder="예: AI 쇼핑몰 플랫폼"
                  class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  <i class="fas fa-lightbulb mr-1"></i>
                  아이디어 설명
                  <span class="text-xs text-purple-600 ml-2">
                    <i class="fas fa-link"></i> URL 붙여넣기 가능
                  </span>
                </label>
                <textarea
                  id="project-idea"
                  rows="4"
                  placeholder="예: 사용자가 상품을 검색하고 구매할 수 있는 쇼핑몰"
                  class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                  required
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  <i class="fas fa-cloud-upload-alt mr-1"></i>
                  참조 문서 업로드
                  <span class="text-xs text-gray-500 ml-2">(이미지, PDF, 문서 등)</span>
                </label>
                <div
                  id="dropzone"
                  class="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center bg-purple-50 hover:bg-purple-100 transition-all cursor-pointer"
                >
                  <i class="fas fa-cloud-upload-alt text-4xl text-purple-400 mb-2"></i>
                  <p class="text-sm text-gray-600 mb-1">파일을 드래그하거나 클릭하여 업로드</p>
                  <p class="text-xs text-gray-500">이미지 • PDF • 문서 파일 지원</p>
                  <input
                    type="file"
                    id="file-input"
                    multiple
                    accept="image/*,.pdf,.txt,.md,.doc,.docx"
                    class="hidden"
                  />
                </div>
                <div id="file-list" class="mt-2 space-y-1"></div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  <i class="fas fa-file-download mr-1"></i>
                  출력 형식
                </label>
                <div class="flex gap-3">
                  <label class="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-all">
                    <input type="radio" name="output-format" value="html" checked class="text-purple-600" />
                    <i class="fab fa-html5 text-orange-600"></i>
                    <span class="text-sm font-medium">HTML</span>
                  </label>
                  <label class="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-all">
                    <input type="radio" name="output-format" value="pdf" class="text-purple-600" />
                    <i class="fas fa-file-pdf text-red-600"></i>
                    <span class="text-sm font-medium">PDF</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                id="start-project-btn"
                class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
              >
                <i class="fas fa-play-circle mr-2"></i>
                문서 생성 시작
              </button>
            </form>

            <div class="mt-4 pt-4 border-t-2 border-gray-200 grid grid-cols-2 gap-3">
              <button
                id="demo-mode-btn"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                <i class="fas fa-play mr-1"></i>
                데모 모드
              </button>
              <button
                id="error-demo-btn"
                class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                <i class="fas fa-exclamation-triangle mr-1"></i>
                에러 데모
              </button>
              <button
                id="api-keys-btn"
                class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                onclick="window.apiKeyManager?.showSetupModal()"
              >
                <i class="fas fa-key mr-1"></i>
                API 키 설정
              </button>
              <button
                id="download-history-btn"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                onclick="window.showDownloadHistory?.()"
              >
                <i class="fas fa-history mr-1"></i>
                다운로드 기록
              </button>
            </div>
          </section>

          <!-- System Stats and Build Log - Side by Side -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- System Stats -->
            <section class="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <h3 class="text-lg font-bold mb-3 text-gray-800 flex items-center gap-2">
                <i class="fas fa-chart-bar text-indigo-600"></i>
                시스템 통계
              </h3>
              <div class="grid grid-cols-2 gap-2">
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <p class="text-2xl font-bold text-blue-600" id="stat-total">0</p>
                  <p class="text-xs text-blue-700 font-medium">전체</p>
                </div>
                <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                  <p class="text-2xl font-bold text-green-600" id="stat-active">0</p>
                  <p class="text-xs text-green-700 font-medium">진행 중</p>
                </div>
                <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                  <p class="text-2xl font-bold text-orange-600" id="stat-paused">0</p>
                  <p class="text-xs text-orange-700 font-medium">일시정지</p>
                </div>
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                  <p class="text-2xl font-bold text-purple-600" id="stat-completed">0</p>
                  <p class="text-xs text-purple-700 font-medium">완료</p>
                </div>
              </div>
            </section>

            <!-- Build Log -->
            <section class="bg-gray-900 rounded-xl p-4 shadow-lg">
              <h3 class="text-lg font-bold mb-3 text-white flex items-center gap-2">
                <i class="fas fa-terminal text-green-400"></i>
                빌드 로그
              </h3>
              <div
                id="terminal-console"
                class="bg-black/50 rounded-lg p-3 font-mono text-xs text-green-400 h-48 overflow-y-auto"
              >
                <div class="text-cyan-400">
                  ╔═══════════════════════════════════════════════╗<br/>
                  ║  Plan-Craft v7.2.0 Console - Phase 3         ║<br/>
                  ║  AI Model Integration Complete               ║<br/>
                  ╚═══════════════════════════════════════════════╝
                </div>
                <div class="mt-2 text-yellow-400">
                  <span class="text-gray-500">[00:00:00]</span> Awaiting project initialization...
                </div>
                <div class="mt-1 text-green-400">
                  <span class="text-gray-500">[00:00:00]</span> ✓ Phase 1: RAG + Feedback + Integrity
                </div>
                <div class="mt-1 text-green-400">
                  <span class="text-gray-500">[00:00:00]</span> ✓ Phase 2: Document + Diagram + Image + PDF
                </div>
                <div class="mt-1 text-green-400">
                  <span class="text-gray-500">[00:00:00]</span> ✓ Phase 3: LLM Client + Model Strategy + Token Tracker
                </div>
                <div class="mt-1 text-cyan-400">
                  <span class="text-gray-500">[00:00:00]</span> → Ready for AI-powered report generation
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <!-- Module Scripts -->
      <script type="module" src="/static/constants.js"></script>
      <script type="module" src="/static/thinking-process.js"></script>
      <script type="module" src="/static/api-key-manager.js"></script>
      <script type="module" src="/static/model-selector.js"></script>
      <script type="module" src="/static/download-manager.js"></script>
      
      <!-- Phase 1: Backend Enhancement Modules -->
      <script type="module" src="/static/rag-system.js"></script>
      <script type="module" src="/static/feedback-loop.js"></script>
      <script type="module" src="/static/integrity-engine.js"></script>
      
      <!-- Phase 2: Document Generation Modules -->
      <script type="module" src="/static/document-generator.js"></script>
      <script type="module" src="/static/diagram-generator.js"></script>
      <script type="module" src="/static/image-pipeline.js"></script>
      <script type="module" src="/static/pdf-converter.js"></script>
      
      <!-- Phase 3: AI Model Integration Modules -->
      <script type="module" src="/static/llm-client.js"></script>
      <script type="module" src="/static/model-strategy.js"></script>
      <script type="module" src="/static/token-tracker.js"></script>
      
      <script type="module" src="/static/unified-core.js"></script>
      <script type="module" src="/static/app-v4.js"></script>

      <script>
        // Initialize thinking process button
        document.addEventListener('DOMContentLoaded', function() {
          const thinkingBtn = document.getElementById('open-thinking-process-btn');
          if (thinkingBtn) {
            thinkingBtn.addEventListener('click', function() {
              if (window.thinkingProcess) {
                window.thinkingProcess.openThinkingWindow();
              } else {
                console.error('Thinking Process module not loaded');
                alert('사고과정 모듈이 로드되지 않았습니다.');
              }
            });
          }
        });

        // Download history helper
        window.showDownloadHistory = function() {
          const history = window.downloadManager?.getHistory() || [];
          
          if (history.length === 0) {
            alert('다운로드 기록이 없습니다.');
            return;
          }

          const modal = document.createElement('div');
          modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
          modal.innerHTML = \`
            <div class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
              <h3 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i class="fas fa-history text-green-600"></i>
                다운로드 기록
              </h3>
              <div class="space-y-2">
                \${history.map((item, index) => \`
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                    <div class="flex-1">
                      <p class="font-semibold text-gray-800">\${item.projectName}</p>
                      <p class="text-xs text-gray-500">\${new Date(item.downloadedAt || Date.now()).toLocaleString('ko-KR')}</p>
                      <p class="text-xs text-gray-400">형식: \${(item.format || 'html').toUpperCase()}</p>
                    </div>
                    <button
                      onclick="window.downloadManager?.redownload(\${index}); this.closest('.fixed').remove();"
                      class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-all"
                    >
                      <i class="fas fa-download mr-1"></i>
                      재다운로드
                    </button>
                  </div>
                \`).join('')}
              </div>
              <button
                onclick="this.closest('.fixed').remove()"
                class="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-all"
              >
                닫기
              </button>
            </div>
          \`;
          document.body.appendChild(modal);
        };
      </script>
    </body>
    </html>
  `)
})

export default app
