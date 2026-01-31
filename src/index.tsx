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
            <i class="fas fa-magic mr-2 md:mr-3"></i>
            Plan-Craft
          </h1>
          <p class="text-white text-sm md:text-lg opacity-90">AI 자율 풀스택 개발 엔진 - Code-First Edition v2.3</p>
          <p class="text-white text-xs md:text-sm opacity-75 mt-1 md:mt-2">
            <i class="fas fa-sparkles mr-1 md:mr-2"></i>
            참조 문서 첨부 • 프로젝트 중단/재개 • 업그레이드 • PDF 출력
          </p>
        </header>

        {/* Two Column Layout */}
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 h-[calc(100vh-180px)]">
          
          {/* Left Column - Project Creation & Stats */}
          <div class="flex flex-col gap-4 md:gap-6 overflow-y-auto pr-2">
            
            {/* Active Projects List - Collapsible */}
            <section class="glass-panel rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl flex-shrink-0">
              <div class="flex justify-between items-center mb-3 md:mb-4">
                <h2 class="text-lg md:text-xl font-bold text-gray-800">
                  <i class="fas fa-list mr-2 text-indigo-600"></i>
                  진행 중인 프로젝트
                </h2>
                <button
                  id="refresh-projects-btn"
                  class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs md:text-sm transition-all"
                >
                  <i class="fas fa-sync-alt mr-1"></i>
                  새로고침
                </button>
              </div>
              <div id="active-projects-list" class="max-h-[300px] overflow-y-auto">
                <div class="text-gray-600 text-center py-6 text-sm">
                  진행 중인 프로젝트가 없습니다.
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
                <div class="border-2 border-dashed border-purple-300 rounded-lg p-3 bg-purple-50 max-h-[150px] overflow-y-auto">
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

                <button
                  type="submit"
                  class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
                >
                  <i class="fas fa-rocket mr-2"></i>
                  프로젝트 생성 및 시작
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
          <div class="flex flex-col gap-4 md:gap-6 overflow-hidden">
            
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

            {/* Terminal Console - Scrollable */}
            <section class="dark-glass-panel rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl flex-1 flex flex-col min-h-0">
              <h2 class="text-lg md:text-xl font-bold mb-3 md:mb-4 text-white flex-shrink-0">
                <i class="fas fa-terminal mr-2 text-green-400"></i>
                빌드 로그
              </h2>
              <div id="terminal-console" class="bg-black rounded-lg p-3 md:p-4 font-mono text-xs flex-1 overflow-y-auto">
                <div class="text-green-400">╔═══════════════════════════════════════════╗</div>
                <div class="text-green-400">║   Plan-Craft DevOps Console v2.3          ║</div>
                <div class="text-green-400">╚═══════════════════════════════════════════╝</div>
                <div class="text-gray-400 mt-2">Awaiting project initialization...</div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <script src="/static/app.js"></script>
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
