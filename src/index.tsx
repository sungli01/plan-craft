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
    <div class="min-h-screen bg-gray-900 text-white">
      <div class="container mx-auto px-4 py-8">
        <header class="mb-8">
          <h1 class="text-4xl font-bold mb-2">
            <span class="text-cyan-400">Plan-Craft</span>
          </h1>
          <p class="text-gray-400">AI 자율 풀스택 개발 엔진 - Code-First Edition</p>
        </header>

        <div class="grid gap-6">
          {/* Pipeline Status */}
          <section class="bg-gray-800 rounded-lg p-6">
            <h2 class="text-2xl font-semibold mb-4">개발 파이프라인</h2>
            <div id="pipeline-viewer" class="space-y-2">
              <div class="text-gray-400">프로젝트를 시작하려면 아래에서 아이디어를 입력하세요.</div>
            </div>
          </section>

          {/* Project Creation */}
          <section class="bg-gray-800 rounded-lg p-6">
            <h2 class="text-2xl font-semibold mb-4">새 프로젝트 시작</h2>
            <form id="create-project-form" class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">프로젝트 이름</label>
                <input
                  type="text"
                  id="project-name"
                  class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="예: Todo Application"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">아이디어 설명</label>
                <textarea
                  id="user-idea"
                  rows="4"
                  class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="예: 사용자가 할 일을 추가, 편집, 삭제할 수 있는 웹 애플리케이션"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                class="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                프로젝트 생성 및 시작
              </button>
            </form>
          </section>

          {/* Terminal Console */}
          <section class="bg-gray-800 rounded-lg p-6">
            <h2 class="text-2xl font-semibold mb-4">빌드 로그</h2>
            <div id="terminal-console" class="bg-black rounded-lg p-4 font-mono text-sm h-96 overflow-y-auto">
              <div class="text-green-400">Plan-Craft DevOps Console v1.0</div>
              <div class="text-gray-500">Awaiting project initialization...</div>
            </div>
          </section>

          {/* Project Stats */}
          <section class="bg-gray-800 rounded-lg p-6">
            <h2 class="text-2xl font-semibold mb-4">시스템 통계</h2>
            <div id="stats-display" class="grid grid-cols-3 gap-4">
              <div class="bg-gray-700 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-cyan-400">0</div>
                <div class="text-sm text-gray-400">전체 프로젝트</div>
              </div>
              <div class="bg-gray-700 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-yellow-400">0</div>
                <div class="text-sm text-gray-400">진행 중</div>
              </div>
              <div class="bg-gray-700 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-green-400">0</div>
                <div class="text-sm text-gray-400">완료</div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <script src="/static/app.js"></script>
    </div>
  );
});

// Project detail page
app.get('/projects/:projectId', (c) => {
  const projectId = c.req.param('projectId');
  
  return c.render(
    <div class="min-h-screen bg-gray-900 text-white">
      <div class="container mx-auto px-4 py-8">
        <header class="mb-8">
          <a href="/" class="text-cyan-400 hover:text-cyan-300 mb-2 inline-block">
            ← 대시보드로 돌아가기
          </a>
          <h1 class="text-4xl font-bold mb-2">
            프로젝트: <span id="project-name-display" class="text-cyan-400">Loading...</span>
          </h1>
          <p id="project-idea-display" class="text-gray-400">Loading...</p>
        </header>

        <div class="grid gap-6">
          {/* Phase Progress */}
          <section class="bg-gray-800 rounded-lg p-6">
            <h2 class="text-2xl font-semibold mb-4">개발 단계 진행 상황</h2>
            <div id="phases-display" class="space-y-3">
              <div class="text-gray-400">Loading phases...</div>
            </div>
          </section>

          {/* Real-time Logs */}
          <section class="bg-gray-800 rounded-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-2xl font-semibold">실시간 로그</h2>
              <button
                id="refresh-logs"
                class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm"
              >
                새로고침
              </button>
            </div>
            <div id="project-logs" class="bg-black rounded-lg p-4 font-mono text-sm h-96 overflow-y-auto">
              <div class="text-gray-500">Loading logs...</div>
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
