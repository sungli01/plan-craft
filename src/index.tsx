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
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      <div class="container mx-auto max-w-7xl">
        
        {/* NEW: Top AI Agent Status Bar */}
        <section class="mb-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div class="grid grid-cols-4 gap-3">
            {/* Master Orchestrator */}
            <div class="ai-agent-status flex items-center gap-2 p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200" data-model="claude-3.5-sonnet">
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
                <p class="text-xs text-purple-600">전체 프로세스 조율 및 의사결정</p>
              </div>
            </div>

            {/* Code Agent */}
            <div class="ai-agent-status flex items-center gap-2 p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200" data-model="gpt-4-turbo">
              <div class="relative">
                <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <i class="fas fa-code text-white text-lg"></i>
                </div>
                <div class="agent-spinner absolute inset-0 hidden">
                  <div class="w-full h-full rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                </div>
                <div class="agent-status-dot absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-bold text-blue-900">Code Agent</h3>
                <p class="text-xs text-blue-600">코드 생성 및 구현 • 128K 컨텍스트</p>
              </div>
            </div>

            {/* Quality Agent */}
            <div class="ai-agent-status flex items-center gap-2 p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200" data-model="gpt-4o-mini">
              <div class="relative">
                <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <i class="fas fa-check-double text-white text-lg"></i>
                </div>
                <div class="agent-spinner absolute inset-0 hidden">
                  <div class="w-full h-full rounded-full border-4 border-green-200 border-t-green-600 animate-spin"></div>
                </div>
                <div class="agent-status-dot absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-bold text-green-900">Quality Agent</h3>
                <p class="text-xs text-green-600">품질 검증 및 테스트 • 빠르고 경제적</p>
              </div>
            </div>

            {/* DevOps Agent */}
            <div class="ai-agent-status flex items-center gap-2 p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border-2 border-orange-200" data-model="gemini-2.0-flash">
              <div class="relative">
                <div class="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                  <i class="fas fa-rocket text-white text-lg"></i>
                </div>
                <div class="agent-spinner absolute inset-0 hidden">
                  <div class="w-full h-full rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
                </div>
                <div class="agent-status-dot absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-bold text-orange-900">DevOps Agent</h3>
                <p class="text-xs text-orange-600">빌드 및 배포 자동화 • 초고속 처리</p>
              </div>
            </div>
          </div>
        </section>

        {/* NEW: Active Projects with Control Buttons */}
        <section class="mb-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div class="flex justify-between items-start gap-4">
            {/* Left: Projects List (max 3) */}
            <div class="flex-1">
              <h2 class="text-xl font-bold mb-3 text-gray-800 flex items-center gap-2">
                <i class="fas fa-folder-open text-indigo-600"></i>
                진행 중인 문서
              </h2>
              <div id="active-projects-container" class="space-y-3">
                {/* Projects will be dynamically inserted here */}
                <div id="no-projects-message" class="text-center py-6 bg-gray-50 rounded-lg">
                  <i class="fas fa-inbox text-4xl text-gray-300 mb-2"></i>
                  <p class="text-gray-500 text-sm">진행 중인 프로젝트가 없습니다.</p>
                  <p class="text-gray-400 text-xs mt-1">아래에서 새 프로젝트를 시작하세요!</p>
                </div>
              </div>
            </div>

            {/* Right: Control Buttons */}
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
            </div>
          </div>
        </section>

        {/* NEW: Project Creation Form */}
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

            {/* File Upload */}
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

            {/* Output Format Selection */}
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

          {/* Demo Mode Buttons */}
          <div class="mt-4 pt-4 border-t-2 border-gray-200 flex gap-3">
            <button
              id="demo-mode-btn"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            >
              <i class="fas fa-play mr-1"></i>
              데모 모드 실행 (기능 확인)
            </button>
            <button
              id="error-demo-btn"
              class="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            >
              <i class="fas fa-exclamation-triangle mr-1"></i>
              에러 모달 데모
            </button>
          </div>
        </section>

        {/* Bottom: System Stats + Build Log - EQUAL SIZE */}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* System Stats (4 cards in 2x2) */}
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

          {/* Build Log - EQUAL SIZE */}
          <section class="bg-gray-900 rounded-xl p-4 shadow-lg">
            <h3 class="text-lg font-bold mb-3 text-white flex items-center gap-2">
              <i class="fas fa-terminal text-green-400"></i>
              빌드 로그
            </h3>
            <div id="terminal-console" class="bg-black/50 rounded-lg p-3 font-mono text-xs text-green-400 h-48 overflow-y-auto">
              <div class="text-cyan-400">
                ╔═══════════════════════════════════════════════╗<br/>
                ║  Plan-Craft DevOps Console v3.0              ║<br/>
                ║  Document-First Edition - POWERED            ║<br/>
                ╚═══════════════════════════════════════════════╝
              </div>
              <div class="mt-2 text-yellow-400">
                <span class="text-gray-500">[00:00:00]</span> Awaiting project initialization...
              </div>
            </div>
          </section>
        </div>

      </div>

      {/* Load Scripts - NEW MODULAR ARCHITECTURE */}
      <script type="module" src="/static/constants.js"></script>
      <script type="module" src="/static/api-client.js"></script>
      <script type="module" src="/static/project-manager.js"></script>
      <script type="module" src="/static/ui-renderer.js"></script>
      <script type="module" src="/static/app-v3.js"></script>
      
      {/* Legacy tracking scripts (for backward compatibility) */}
      <script src="/static/enhanced-tracking.js"></script>
      <script src="/static/real-execution.js"></script>
      <script src="/static/aggressive-debug.js"></script>
    </div>
  );
});

export default app;
