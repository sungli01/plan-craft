import { Hono } from 'hono';
import { renderer } from './renderer';
import api from './api/routes';

const app = new Hono();

// API routes
app.route('/api', api);

// Frontend renderer
app.use(renderer);

// Main dashboard page
app.get('/', (c) => {
  return c.render(
    <div class="min-h-screen p-4 md:p-8">
      <div class="container mx-auto max-w-full 2xl:max-w-[1920px]">
        <header class="mb-4 md:mb-6 text-center">
          <h1 class="text-3xl md:text-5xl font-bold mb-2 gradient-text">
            <i class="fas fa-file-contract mr-2 md:mr-3"></i>
            Plan-Craft
          </h1>
          <p class="text-white text-sm md:text-lg opacity-90 font-semibold">AI 자율 문서 생성 엔진 - Document-First Edition v2.8</p>
          <p class="text-white text-xs md:text-sm opacity-75 mt-1 md:mt-2">
            <i class="fas fa-lightbulb mr-1 md:mr-2"></i>
            기획보고서 • 가설 검증 • 프로토타입 문서화 • HTML/PDF 다운로드
          </p>
          <div class="mt-3 md:mt-4 bg-white/20 backdrop-blur-sm rounded-lg p-2 md:p-3 inline-block">
            <p class="text-white text-xs md:text-sm font-medium">
              <i class="fas fa-check-circle text-green-300 mr-1"></i>
              <strong>핵심 목적:</strong> 아이디어 → 기획문서 생성 → 가설 검증 → 프로토타입 문서 제공
            </p>
          </div>
        </header>

        {/* Two Column Layout - No Fixed Height */}
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          
          {/* Left Column - Project Creation & Stats */}
          <div class="flex flex-col gap-4 md:gap-6">
            
            {/* Active Projects List - Collapsible */}
            <section class="glass-panel rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl flex-shrink-0">
              <div class="flex justify-between items-center mb-3 md:mb-4">
                <h2 class="text-lg md:text-xl font-bold text-gray-800">
                  <i class="fas fa-folder-open mr-2 text-indigo-600"></i>
                  진행 중인 문서
                </h2>
                <button
                  id="refresh-projects-btn"
                  class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs md:text-sm transition-all"
                >
                  <i class="fas fa-sync-alt mr-1"></i>
                  새로고침
                </button>
              </div>
              <div id="active-projects-list">
                <div class="text-center py-8">
                  <div class="inline-block p-6 bg-gray-50 rounded-xl">
                    <i class="fas fa-inbox text-5xl text-gray-300 mb-3"></i>
                    <p class="text-gray-600 text-sm font-medium">진행 중인 프로젝트가 없습니다.</p>
                    <p class="text-gray-500 text-xs mt-1">새 프로젝트를 시작하세요!</p>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Models Information */}
            <section class="glass-panel rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl flex-shrink-0">
              <h2 class="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800">
                <i class="fas fa-robot mr-2 text-cyan-600"></i>
                활성 AI 모델
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Master Orchestrator */}
                <div class="ai-model-card bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200 transition-all duration-300" data-model="claude-3.5-sonnet">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center relative">
                      <i class="fas fa-crown text-white text-xs"></i>
                      {/* Spinner */}
                      <div class="model-spinner absolute inset-0 hidden">
                        <div class="w-full h-full rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
                      </div>
                    </div>
                    <div class="flex-1">
                      <h3 class="text-sm font-bold text-purple-900">Master Orchestrator</h3>
                      <p class="text-xs text-purple-600">Claude 3.5 Sonnet</p>
                    </div>
                    <span class="model-status-badge px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      <i class="fas fa-check-circle"></i>
                    </span>
                  </div>
                  <p class="text-xs text-gray-700 mb-1">전체 프로세스 조율 및 의사결정 • 복잡한 추론</p>
                  <p class="model-task-info text-xs text-blue-600 font-semibold hidden"></p>
                  <p class="model-time text-xs text-orange-600 font-mono"></p>
                </div>

                {/* Code Agent */}
                <div class="ai-model-card bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200 transition-all duration-300" data-model="gpt-4-turbo">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center relative">
                      <i class="fas fa-code text-white text-xs"></i>
                      {/* Spinner */}
                      <div class="model-spinner absolute inset-0 hidden">
                        <div class="w-full h-full rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                      </div>
                    </div>
                    <div class="flex-1">
                      <h3 class="text-sm font-bold text-blue-900">Code Agent</h3>
                      <p class="text-xs text-blue-600">GPT-4 Turbo</p>
                    </div>
                    <span class="model-status-badge px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      <i class="fas fa-check-circle"></i>
                    </span>
                  </div>
                  <p class="text-xs text-gray-700 mb-1">코드 생성 및 구현 • 128K 컨텍스트</p>
                  <p class="model-task-info text-xs text-blue-600 font-semibold hidden"></p>
                  <p class="model-time text-xs text-orange-600 font-mono"></p>
                </div>

                {/* Quality Agent */}
                <div class="ai-model-card bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200 transition-all duration-300" data-model="gpt-4o-mini">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center relative">
                      <i class="fas fa-check-double text-white text-xs"></i>
                      {/* Spinner */}
                      <div class="model-spinner absolute inset-0 hidden">
                        <div class="w-full h-full rounded-full border-4 border-green-200 border-t-green-600 animate-spin"></div>
                      </div>
                    </div>
                    <div class="flex-1">
                      <h3 class="text-sm font-bold text-green-900">Quality Agent</h3>
                      <p class="text-xs text-green-600">GPT-4o-mini</p>
                    </div>
                    <span class="model-status-badge px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      <i class="fas fa-check-circle"></i>
                    </span>
                  </div>
                  <p class="text-xs text-gray-700 mb-1">품질 검증 및 테스트 • 빠르고 경제적</p>
                  <p class="model-task-info text-xs text-blue-600 font-semibold hidden"></p>
                  <p class="model-time text-xs text-orange-600 font-mono"></p>
                </div>

                {/* DevOps Agent */}
                <div class="ai-model-card bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200 transition-all duration-300" data-model="gemini-2.0-flash">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center relative">
                      <i class="fas fa-rocket text-white text-xs"></i>
                      {/* Spinner */}
                      <div class="model-spinner absolute inset-0 hidden">
                        <div class="w-full h-full rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
                      </div>
                    </div>
                    <div class="flex-1">
                      <h3 class="text-sm font-bold text-orange-900">DevOps Agent</h3>
                      <p class="text-xs text-orange-600">Gemini 2.0 Flash</p>
                    </div>
                    <span class="model-status-badge px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      <i class="fas fa-check-circle"></i>
                    </span>
                  </div>
                  <p class="text-xs text-gray-700 mb-1">빌드 및 배포 자동화 • 초고속 처리</p>
                  <p class="model-task-info text-xs text-blue-600 font-semibold hidden"></p>
                  <p class="model-time text-xs text-orange-600 font-mono"></p>
                </div>
              </div>
            </section>

            {/* Project Creation Form - Compact */}
            <section class="glass-panel rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl flex-shrink-0">
              <h2 class="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800">
                <i class="fas fa-plus-circle mr-2 text-green-600"></i>
                새 프로젝트 시작
              </h2>
              <form id="create-project-form" class="space-y-3 md:space-y-4">
                <div>
                  <label class="block text-xs md:text-sm font-semibold mb-1.5 text-gray-700">프로젝트 이름</label>
                  <input
                    type="text"
                    id="project-name"
                    class="w-full px-3 py-2 text-sm bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="예: AI 쇼핑몰 플랫폼"
                    required
                  />
                </div>
                <div>
                  <label class="block text-xs md:text-sm font-semibold mb-1.5 text-gray-700">
                    아이디어 설명
                    <span class="text-xs text-purple-600 ml-2">
                      <i class="fas fa-info-circle"></i> URL 붙여넣기 가능
                    </span>
                  </label>
                  <textarea
                    id="user-idea"
                    rows="3"
                    class="w-full px-3 py-2 text-sm bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="예: 사용자가 상품을 검색하고 구매할 수 있는 쇼핑몰"
                    required
                  ></textarea>
                  <div id="detected-urls" class="mt-1 text-xs text-gray-600"></div>
                </div>
                
                {/* Compact File Upload */}
                <div 
                  id="dropzone"
                  class="border-2 border-dashed border-purple-300 rounded-lg p-4 bg-purple-50 text-center hover:border-purple-500 hover:bg-purple-100 transition-all cursor-pointer"
                >
                  <i class="fas fa-cloud-upload-alt text-3xl text-purple-400 mb-2"></i>
                  <p class="text-xs text-gray-700 font-semibold mb-1">
                    파일 드래그 또는 클릭
                  </p>
                  <input
                    type="file"
                    id="file-input"
                    multiple
                    accept="image/*,.pdf,.txt,.md,.doc,.docx"
                    class="hidden"
                  />
                  <button
                    type="button"
                    id="select-files-btn"
                    class="bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-1.5 px-4 rounded-lg transition-colors inline-flex items-center mt-2"
                  >
                    <i class="fas fa-folder-open mr-1"></i>
                    파일 선택
                  </button>
                </div>

                {/* Compact References List */}
                <div class="border-2 border-dashed border-purple-300 rounded-lg p-3 bg-purple-50">
                  <label class="block text-xs font-semibold mb-2 text-gray-700">
                    <i class="fas fa-paperclip mr-1 text-purple-600"></i>
                    참조 문서
                  </label>
                  <div id="references-list" class="space-y-1.5">
                    <div class="text-xs text-gray-500 text-center py-2">
                      참조 문서 없음
                    </div>
                  </div>
                </div>

                {/* Document Output Format Selection */}
                <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200">
                  <label class="block text-sm font-bold mb-3 text-gray-800">
                    <i class="fas fa-file-download mr-2 text-blue-600"></i>
                    문서 출력 형식 선택
                  </label>
                  <div class="grid grid-cols-2 gap-3">
                    <label class="relative flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="output-format"
                        value="html"
                        checked
                        class="sr-only peer"
                      />
                      <div class="w-full bg-white border-2 border-gray-300 rounded-lg p-3 text-center peer-checked:border-blue-600 peer-checked:bg-blue-50 transition-all hover:border-blue-400">
                        <i class="fas fa-code text-2xl text-blue-600 mb-1"></i>
                        <p class="text-xs font-semibold text-gray-800">HTML</p>
                        <p class="text-xs text-gray-500 mt-1">웹 문서</p>
                      </div>
                    </label>
                    <label class="relative flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="output-format"
                        value="pdf"
                        class="sr-only peer"
                      />
                      <div class="w-full bg-white border-2 border-gray-300 rounded-lg p-3 text-center peer-checked:border-red-600 peer-checked:bg-red-50 transition-all hover:border-red-400">
                        <i class="fas fa-file-pdf text-2xl text-red-600 mb-1"></i>
                        <p class="text-xs font-semibold text-gray-800">PDF</p>
                        <p class="text-xs text-gray-500 mt-1">인쇄용</p>
                      </div>
                    </label>
                  </div>
                  <p class="text-xs text-gray-600 mt-2 text-center">
                    <i class="fas fa-info-circle mr-1"></i>
                    완료 후 선택한 형식으로 다운로드
                  </p>
                </div>

                <button
                  type="submit"
                  class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
                >
                  <i class="fas fa-file-alt mr-2"></i>
                  문서 생성 시작
                </button>
              </form>
            </section>

            {/* Project Stats - Compact */}
            <section class="glass-panel rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl flex-shrink-0">
              <h2 class="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800">
                <i class="fas fa-chart-bar mr-2 text-blue-600"></i>
                시스템 통계
              </h2>
              <div id="stats-display" class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                <div class="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-3 md:p-4 text-center">
                  <div class="text-2xl md:text-3xl font-bold text-blue-600">0</div>
                  <div class="text-xs text-blue-700 mt-1">전체</div>
                </div>
                <div class="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-3 md:p-4 text-center">
                  <div class="text-2xl md:text-3xl font-bold text-green-600">0</div>
                  <div class="text-xs text-green-700 mt-1">진행 중</div>
                </div>
                <div class="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-3 md:p-4 text-center">
                  <div class="text-2xl md:text-3xl font-bold text-yellow-600">0</div>
                  <div class="text-xs text-yellow-700 mt-1">일시중지</div>
                </div>
                <div class="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-3 md:p-4 text-center">
                  <div class="text-2xl md:text-3xl font-bold text-purple-600">0</div>
                  <div class="text-xs text-purple-700 mt-1">완료</div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Pipeline & Console */}
          <div class="flex flex-col gap-4 md:gap-6">
            
            {/* Pipeline Status */}
            <section class="glass-panel rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl flex-shrink-0">
              <h2 class="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800">
                <i class="fas fa-project-diagram mr-2 text-purple-600"></i>
                개발 파이프라인
              </h2>
              <div id="pipeline-viewer" class="text-sm">
                <div class="text-gray-600">프로젝트를 시작하면 파이프라인이 표시됩니다.</div>
              </div>
            </section>

            {/* Terminal Console */}
            <section class="dark-glass-panel rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl">
              <h2 class="text-lg md:text-xl font-bold mb-3 md:mb-4 text-white">
                <i class="fas fa-terminal mr-2 text-green-400"></i>
                빌드 로그
              </h2>
              <div id="terminal-console" class="bg-black rounded-lg p-3 md:p-4 font-mono text-xs min-h-[300px]">
                <div class="text-green-400">╔═══════════════════════════════════════════╗</div>
                <div class="text-green-400">║   Plan-Craft DevOps Console v2.4          ║</div>
                <div class="text-green-400">╚═══════════════════════════════════════════╝</div>
                <div class="text-gray-400 mt-2">Awaiting project initialization...</div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <script src="/static/enhanced-tracking.js"></script>
      <script src="/static/real-execution.js"></script>
      <script src="/static/demo-mode.js"></script>
      <script src="/static/aggressive-debug.js"></script>
      <script src="/static/app.js"></script>
      <script>
        {`
          // Force initialize on page load
          window.addEventListener('load', () => {
            console.log('[Page Load] Initializing Plan-Craft systems...');
            
            // Wait a bit for all scripts to load
            setTimeout(() => {
              if (typeof initializeRealExecution === 'function') {
                const success = initializeRealExecution();
                if (success) {
                  console.log('[Plan-Craft] 🚀 System ready!');
                } else {
                  console.error('[Plan-Craft] ❌ System initialization failed!');
                }
              } else {
                console.error('[Plan-Craft] ❌ initializeRealExecution not found!');
              }
            }, 500);
          });
        `}
      </script>
    </div>
  );
});

// Project detail page - similar bright theme updates
app.get('/projects/:projectId', (c) => {
  const projectId = c.req.param('projectId');
  
  return c.render(
    <div class="min-h-screen p-8">
      <div class="container mx-auto max-w-7xl">
        <header class="mb-8">
          <a href="/" class="text-white hover:text-purple-200 mb-3 inline-block font-semibold">
            <i class="fas fa-arrow-left mr-2"></i>
            대시보드로 돌아가기
          </a>
          <h1 class="text-4xl font-bold mb-3 text-white">
            프로젝트: <span id="project-name-display" class="gradient-text bg-white px-3 py-1 rounded">Loading...</span>
          </h1>
          <p id="project-idea-display" class="text-white opacity-90">Loading...</p>
        </header>

        <div class="grid gap-6">
          {/* Project Controls */}
          <section class="glass-panel rounded-2xl p-6 shadow-xl">
            <div class="flex gap-3 flex-wrap">
              <button
                id="pause-project-btn"
                class="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-lg transition-all"
              >
                <i class="fas fa-pause mr-2"></i>
                일시중지
              </button>
              <button
                id="resume-project-btn"
                class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-all"
              >
                <i class="fas fa-play mr-2"></i>
                재개
              </button>
              <button
                id="cancel-project-btn"
                class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-all"
              >
                <i class="fas fa-times mr-2"></i>
                취소
              </button>
              <button
                id="upgrade-project-btn"
                class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all ml-auto"
              >
                <i class="fas fa-level-up-alt mr-2"></i>
                업그레이드
              </button>
              <button
                id="export-pdf-btn"
                class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
              >
                <i class="fas fa-file-pdf mr-2"></i>
                PDF 출력
              </button>
            </div>
          </section>

          {/* Phase Progress */}
          <section class="glass-panel rounded-2xl p-8 shadow-xl">
            <h2 class="text-2xl font-bold mb-6 text-gray-800">
              <i class="fas fa-tasks mr-2 text-blue-600"></i>
              개발 단계 진행 상황
            </h2>
            <div id="phases-display" class="space-y-3">
              <div class="text-gray-600">Loading phases...</div>
            </div>
          </section>

          {/* Real-time Logs */}
          <section class="dark-glass-panel rounded-2xl p-8 shadow-xl">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-white">
                <i class="fas fa-stream mr-2 text-cyan-400"></i>
                실시간 로그
              </h2>
              <button
                id="refresh-logs"
                class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm text-white transition-all"
              >
                <i class="fas fa-sync-alt mr-2"></i>
                새로고침
              </button>
            </div>
            <div id="project-logs" class="bg-black rounded-xl p-5 font-mono text-sm h-96 overflow-y-auto">
              <div class="text-gray-400">Loading logs...</div>
            </div>
          </section>
        </div>
      </div>

      <script>
        {`
          const projectId = '${projectId}';
          window.currentProjectId = projectId;
        `}
      </script>
      <script src="/static/project.js"></script>
    </div>
  );
});

export default app;
