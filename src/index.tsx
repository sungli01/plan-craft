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
    <div class="min-h-screen p-8">
      <div class="container mx-auto max-w-7xl">
        <header class="mb-8 text-center">
          <h1 class="text-5xl font-bold mb-3 gradient-text">
            <i class="fas fa-magic mr-3"></i>
            Plan-Craft
          </h1>
          <p class="text-white text-lg opacity-90">AI 자율 풀스택 개발 엔진 - Code-First Edition v2.0</p>
          <p class="text-white text-sm opacity-75 mt-2">
            <i class="fas fa-sparkles mr-2"></i>
            참조 문서 첨부 • 프로젝트 중단/재개 • 업그레이드 • PDF 출력
          </p>
        </header>

        <div class="grid gap-6">
          {/* Pipeline Status */}
          <section class="glass-panel rounded-2xl p-8 shadow-xl">
            <h2 class="text-2xl font-bold mb-6 text-gray-800">
              <i class="fas fa-project-diagram mr-2 text-purple-600"></i>
              개발 파이프라인
            </h2>
            <div id="pipeline-viewer" class="space-y-2">
              <div class="text-gray-600">프로젝트를 시작하려면 아래에서 아이디어를 입력하세요.</div>
            </div>
          </section>

          {/* Project Creation */}
          <section class="glass-panel rounded-2xl p-8 shadow-xl">
            <h2 class="text-2xl font-bold mb-6 text-gray-800">
              <i class="fas fa-plus-circle mr-2 text-green-600"></i>
              새 프로젝트 시작
            </h2>
            <form id="create-project-form" class="space-y-5">
              <div>
                <label class="block text-sm font-semibold mb-2 text-gray-700">프로젝트 이름</label>
                <input
                  type="text"
                  id="project-name"
                  class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="예: AI 쇼핑몰 플랫폼"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-semibold mb-2 text-gray-700">아이디어 설명</label>
                <textarea
                  id="user-idea"
                  rows="4"
                  class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="예: 사용자가 상품을 검색하고 장바구니에 담아 구매할 수 있는 온라인 쇼핑몰"
                  required
                ></textarea>
              </div>
              
              {/* NEW: Reference Documents Section */}
              <div class="border-2 border-dashed border-purple-300 rounded-xl p-6 bg-purple-50">
                <label class="block text-sm font-semibold mb-3 text-gray-700">
                  <i class="fas fa-paperclip mr-2 text-purple-600"></i>
                  참조 문서 (선택사항)
                </label>
                <div class="space-y-3">
                  <div>
                    <label class="text-xs text-gray-600 mb-1 block">참조 URL</label>
                    <input
                      type="url"
                      id="reference-url"
                      class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                      placeholder="https://example.com/api-docs"
                    />
                  </div>
                  <div>
                    <label class="text-xs text-gray-600 mb-1 block">설명 (선택)</label>
                    <input
                      type="text"
                      id="reference-description"
                      class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                      placeholder="예: 결제 API 문서"
                    />
                  </div>
                  <button
                    type="button"
                    id="add-reference-btn"
                    class="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    <i class="fas fa-plus mr-2"></i>
                    참조 추가
                  </button>
                </div>
                <div id="references-list" class="mt-4 space-y-2">
                  {/* Dynamic references will be added here */}
                </div>
              </div>

              <button
                type="submit"
                class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <i class="fas fa-rocket mr-2"></i>
                프로젝트 생성 및 시작
              </button>
            </form>
          </section>

          {/* Terminal Console */}
          <section class="dark-glass-panel rounded-2xl p-8 shadow-xl">
            <h2 class="text-2xl font-bold mb-6 text-white">
              <i class="fas fa-terminal mr-2 text-green-400"></i>
              빌드 로그
            </h2>
            <div id="terminal-console" class="bg-black rounded-xl p-5 font-mono text-sm h-96 overflow-y-auto">
              <div class="text-green-400">╔═══════════════════════════════════════════╗</div>
              <div class="text-green-400">║   Plan-Craft DevOps Console v2.0          ║</div>
              <div class="text-green-400">╚═══════════════════════════════════════════╝</div>
              <div class="text-gray-400 mt-2">Awaiting project initialization...</div>
            </div>
          </section>

          {/* Project Stats */}
          <section class="glass-panel rounded-2xl p-8 shadow-xl">
            <h2 class="text-2xl font-bold mb-6 text-gray-800">
              <i class="fas fa-chart-bar mr-2 text-blue-600"></i>
              시스템 통계
            </h2>
            <div id="stats-display" class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-6 text-center">
                <div class="text-3xl font-bold text-blue-600">0</div>
                <div class="text-sm text-blue-700 mt-1">전체 프로젝트</div>
              </div>
              <div class="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6 text-center">
                <div class="text-3xl font-bold text-green-600">0</div>
                <div class="text-sm text-green-700 mt-1">진행 중</div>
              </div>
              <div class="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-6 text-center">
                <div class="text-3xl font-bold text-yellow-600">0</div>
                <div class="text-sm text-yellow-700 mt-1">일시중지</div>
              </div>
              <div class="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-6 text-center">
                <div class="text-3xl font-bold text-purple-600">0</div>
                <div class="text-sm text-purple-700 mt-1">완료</div>
              </div>
            </div>
          </section>
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
