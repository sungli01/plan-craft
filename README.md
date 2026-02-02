# Plan-Craft v3.1 - AI 자율 문서 생성 시스템

## 📋 프로젝트 개요

**Plan-Craft**는 AI 기반 문서 생성 시스템입니다. 이 시스템은 **코딩 도구가 아니라 문서 작성 도구**입니다.

### 🎯 핵심 목적

- ✅ **기획 보고서 작성**: 프로젝트 기획서, 제안서, 계획서 생성
- ✅ **가설 검증**: 아이디어의 타당성 분석 및 검증
- ✅ **프로토타입 문서화**: 프로토타입 설계 문서 제공
- ❌ **프로그램 코드 작성 아님**: 실제 코드가 아닌 문서 중심

### 🚀 주요 특징

1. **4개 AI 에이전트 협업**
   - Master Orchestrator (Claude 3.5 Sonnet)
   - Code Agent (GPT-4 Turbo)
   - Quality Agent (GPT-4o-mini)
   - DevOps Agent (Gemini 2.0 Flash)

2. **10단계 문서 생성 프로세스**
   - G1: 핵심 로직 구현
   - G2: API 서버 구축
   - G3: UI 컴포넌트 개발
   - G4: 시스템 통합
   - G5: 단위 테스트
   - G6: 보안 스캔
   - G7: 빌드 최적화
   - G8: 배포 준비
   - G9: 문서화
   - G10: 최종 인수인계

3. **실시간 진행 상황 추적**
   - 1초 단위 시간 카운터
   - 10초 단위 UI 업데이트
   - 프로그레스 바 실시간 업데이트
   - 상세한 로그 출력

4. **최대 3개 프로젝트 동시 진행**
   - 각 프로젝트 독립적 실행
   - 개별 타이머 관리
   - 중지/재개/취소 지원

---

## 🏗️ 모듈형 아키텍처

### 📦 모듈 구조

```
Plan-Craft v3.1
├── constants.js          (4.3 KB)  - 핵심 상수 및 설정
├── api-client.js         (3.9 KB)  - API 통신 레이어
├── project-manager.js    (7.2 KB)  - 프로젝트 관리 로직
├── ui-renderer.js        (9.1 KB)  - UI 렌더링 레이어
├── execution-engine.js   (9.5 KB)  - 실행 엔진 (NEW)
├── real-time-timer.js    (3.7 KB)  - 실시간 타이머 (NEW)
└── app-v3.js            (10.8 KB)  - 메인 애플리케이션
```

### 🔧 각 모듈 설명

#### 1. **constants.js** - 단일 진실의 원천 (Single Source of Truth)

모든 설정 값과 상수를 중앙에서 관리합니다.

```javascript
// 주요 상수
- PHASE_DURATION: 각 단계별 소요 시간 (분)
- PHASE_ORDER: 실행 순서
- PHASE_TO_MODEL: 단계별 AI 모델 매핑
- MODEL_TO_AGENT: AI 모델별 에이전트 이름
- APP_CONFIG: 애플리케이션 설정
  - API_BASE: '/api'
  - MAX_PROJECTS: 3
  - MAX_LOGS: 10
  - STATS_REFRESH_INTERVAL: 5000ms
  - PROJECTS_REFRESH_INTERVAL: 10000ms
  - TIME_UPDATE_INTERVAL: 10000ms
```

**사용 예시:**
```javascript
import { PHASE_DURATION, APP_CONFIG } from './constants.js';

const duration = PHASE_DURATION['G1_CORE_LOGIC']; // 3분
const maxProjects = APP_CONFIG.MAX_PROJECTS; // 3
```

#### 2. **api-client.js** - API 통신 레이어

모든 백엔드 API 호출을 중앙에서 관리합니다.

```javascript
// 주요 메서드
- request(endpoint, options): 범용 HTTP 요청
- get(endpoint): GET 요청
- post(endpoint, body): POST 요청
- createProject(projectData): 프로젝트 생성
- pauseProject(projectId): 프로젝트 중지
- cancelProject(projectId): 프로젝트 취소
- getStats(): 통계 조회
- getActiveProjects(): 활성 프로젝트 목록
```

**사용 예시:**
```javascript
import apiClient from './api-client.js';

const result = await apiClient.createProject({
  projectName: '신제품 기획서',
  userIdea: '혁신적인 AI 기반 서비스',
  outputFormat: 'pdf'
});
```

#### 3. **project-manager.js** - 비즈니스 로직

프로젝트 상태 관리 및 비즈니스 규칙을 담당합니다.

```javascript
// 주요 메서드
- init(): 초기화
- loadProjects(): 프로젝트 목록 로드
- createProject(projectData): 프로젝트 생성
- pauseProject(projectId): 중지
- cancelProject(projectId): 취소
- calculateTimeInfo(project): 시간 정보 계산
- formatTimeMinutes(minutes): 시간 포맷팅
```

**주요 기능:**
- 최대 프로젝트 수 제한 (3개)
- 프로젝트 생명주기 관리
- 시간 계산 및 포맷팅
- 자동 새로고침

#### 4. **ui-renderer.js** - UI 레이어

모든 DOM 조작과 화면 업데이트를 담당합니다.

```javascript
// 주요 메서드
- init(): UI 초기화
- renderProjects(projects): 프로젝트 목록 렌더링
- createProjectCard(project): 프로젝트 카드 생성
- updateProjectTimeDisplay(projectId): 시간 표시 업데이트
- updateStats(stats): 통계 업데이트
- addLog(level, message): 로그 추가
- showError(title, message): 에러 모달 표시
```

**특징:**
- 비즈니스 로직 분리
- 엘리먼트 캐싱으로 성능 최적화
- XSS 방지 (HTML 이스케이프)
- 최대 10개 로그 유지

#### 5. **execution-engine.js** - 실행 엔진 (NEW)

문서 생성 프로세스를 실행하고 관리합니다.

```javascript
// 주요 메서드
- executeProject(projectId): 프로젝트 실행
- executePhase(projectId, phase, ...): 단계 실행
- simulatePhaseExecution(...): 단계별 진행 시뮬레이션
- handleProjectCompletion(projectId): 완료 처리
- showCompletionModal(...): 완료 모달 표시
- downloadDocument(projectId): 문서 다운로드
- cancelExecution(projectId): 실행 취소
```

**특징:**
- 10단계 순차 실행
- 각 단계를 10개 스텝으로 세분화
- 상세한 진행 상황 로깅
- AI 모델 트래킹 통합
- 완료 시 출력 형식 선택 모달

#### 6. **real-time-timer.js** - 실시간 타이머 (NEW)

1초 정밀도의 타이머를 관리합니다.

```javascript
// 주요 메서드
- start(projectId): 타이머 시작 (1초 카운터)
- stop(projectId): 타이머 중지
- getElapsed(projectId): 경과 시간 조회 (초)
- formatTime(seconds): 시간 포맷팅
- updateUI(projectId): UI 업데이트 (10초마다)
```

**특징:**
- 1초 단위 정밀 카운팅
- 10초 단위 UI 업데이트
- 프로젝트별 독립 타이머
- 자동 포맷팅 (초/분/시간)

#### 7. **app-v3.js** - 메인 애플리케이션

모든 모듈을 통합하고 애플리케이션을 실행합니다.

```javascript
// 주요 메서드
- init(): 애플리케이션 초기화
- setupEventHandlers(): 이벤트 핸들러 설정
- handleProjectCreation(e): 프로젝트 생성 처리
- handleStopAll(): 모든 프로젝트 중지
- handleCancelAll(): 모든 프로젝트 취소
- refreshProjects(): 프로젝트 목록 새로고침
- refreshStats(): 통계 새로고침
```

**특징:**
- 모듈 오케스트레이션
- 이벤트 관리
- 자동 새로고침 루프
- 파일 업로드 처리

---

## 🔄 모듈 간 의존성

```
app-v3.js (진입점)
├── constants.js ✓
├── api-client.js
│   └── constants.js ✓
├── project-manager.js
│   ├── api-client.js ✓
│   └── constants.js ✓
├── ui-renderer.js
│   ├── project-manager.js ✓
│   └── constants.js ✓
├── execution-engine.js
│   ├── project-manager.js ✓
│   ├── ui-renderer.js ✓
│   └── constants.js ✓
└── real-time-timer.js
    └── project-manager.js ✓
```

### 📊 의존성 규칙

1. **constants.js**: 독립 모듈, 의존성 없음
2. **api-client.js**: constants만 의존
3. **project-manager.js**: api-client + constants
4. **ui-renderer.js**: project-manager + constants
5. **execution-engine.js**: project-manager + ui-renderer + constants
6. **real-time-timer.js**: project-manager
7. **app-v3.js**: 모든 모듈 통합

---

## 📁 프로젝트 구조

```
/home/user/webapp/
├── src/
│   ├── index.tsx                 # Hono 메인 애플리케이션
│   ├── renderer.tsx              # HTML 렌더러
│   └── api/
│       └── routes.ts             # API 라우트
├── public/
│   └── static/
│       ├── constants.js          # ⭐ 핵심 상수
│       ├── api-client.js         # ⭐ API 클라이언트
│       ├── project-manager.js    # ⭐ 프로젝트 관리
│       ├── ui-renderer.js        # ⭐ UI 렌더러
│       ├── execution-engine.js   # ⭐ 실행 엔진
│       ├── real-time-timer.js    # ⭐ 실시간 타이머
│       ├── app-v3.js             # ⭐ 메인 앱
│       ├── enhanced-tracking.js  # Legacy: AI 트래킹
│       ├── real-execution.js     # Legacy: 실행 시스템
│       └── aggressive-debug.js   # Legacy: 디버그
├── dist/                         # 빌드 출력
├── package.json
├── vite.config.ts
├── wrangler.jsonc                # Cloudflare 설정
└── README.md                     # 이 파일
```

---

## 🚀 사용 방법

### 1. 개발 환경 실행

```bash
# 의존성 설치
npm install

# 빌드
npm run build

# PM2로 서비스 시작
pm2 start ecosystem.config.cjs

# 로그 확인
pm2 logs plan-craft --nostream
```

### 2. 프로젝트 생성

1. **프로젝트 이름 입력**: 예) "신제품 출시 계획서"
2. **아이디어 설명**: 상세한 프로젝트 설명 작성
3. **참조 문서 업로드** (선택사항): 이미지, PDF, 문서 파일
4. **출력 형식 선택**: HTML 또는 PDF
5. **"문서 생성 시작"** 클릭

### 3. 진행 상황 확인

- **AI 에이전트 상태**: 상단의 4개 에이전트 카드에서 현재 작업 중인 모델 확인
- **프로젝트 카드**: 경과 시간, 남은 시간, 진행률 실시간 표시
- **빌드 로그**: 상세한 단계별 진행 로그 (최신 10개)
- **시스템 통계**: 전체/진행 중/일시정지/완료 카운트

### 4. 프로젝트 제어

- **중지**: 모든 프로젝트 일시 중지
- **일부취소**: 특정 프로젝트만 취소 (개발 예정)
- **전체취소**: 모든 프로젝트 취소

### 5. 문서 다운로드

프로젝트 완료 시 자동으로 팝업이 표시되며, 출력 형식(HTML/PDF)을 선택하여 다운로드할 수 있습니다.

---

## 🎨 UI 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│  [Master] [Code] [Quality] [DevOps] ← AI 에이전트 상태  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  진행 중인 문서 (최대 3개)          [중지]              │
│  ┌──────────────────────────┐      [일부취소]          │
│  │ 프로젝트 1               │      [전체취소]          │
│  │ ▓▓▓▓▓▓▓▓░░░░ 60%        │                          │
│  │ 경과: 3분 25초 | 남음: 2분│                          │
│  └──────────────────────────┘                          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  새 프로젝트 시작                                        │
│  [프로젝트 이름]  [아이디어 설명]                        │
│  [파일 업로드]    [○ HTML  ○ PDF]                       │
│  [문서 생성 시작]                                        │
├─────────────────────────────────────────────────────────┤
│  시스템 통계      │  빌드 로그                           │
│  [전체: 0]       │  > [시간] INFO: 로그 메시지           │
│  [진행: 0]       │  > [시간] SUCCESS: 완료               │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 기술 스택

- **Frontend**: Hono + TypeScript + TailwindCSS
- **Backend**: Hono (Cloudflare Workers)
- **Build**: Vite + TypeScript
- **Deployment**: Cloudflare Pages
- **Process Manager**: PM2 (개발 환경)

---

## 📝 개발 가이드

### 새 모듈 추가 방법

1. **모듈 생성**: `/public/static/my-module.js`
2. **ES6 모듈 형식 사용**:
```javascript
import { APP_CONFIG } from './constants.js';

class MyModule {
  // ...
}

const myModule = new MyModule();
export default myModule;

if (typeof window !== 'undefined') {
  window.myModule = myModule;
}
```

3. **index.tsx에 추가**:
```tsx
<script type="module" src="/static/my-module.js"></script>
```

4. **의존성 임포트**:
```javascript
import myModule from './my-module.js';
```

### 코딩 규칙

- ✅ **단일 책임 원칙**: 각 모듈은 하나의 명확한 책임
- ✅ **의존성 최소화**: 필요한 모듈만 임포트
- ✅ **에러 처리**: 모든 async 함수에 try-catch
- ✅ **로깅**: 중요한 동작은 console.log
- ✅ **주석**: 각 함수에 JSDoc 주석
- ✅ **타입 안전**: TypeScript 또는 JSDoc 타입

---

## 🐛 트러블슈팅

### Q: 프로젝트가 생성되지 않아요
A: 브라우저 콘솔(F12)을 열어 에러 메시지를 확인하세요. API 서버가 정상 작동 중인지 확인하세요.

### Q: 시간이 업데이트되지 않아요
A: `real-time-timer.js`가 로드되었는지 확인하세요. `window.realTimeTimer`가 정의되어 있어야 합니다.

### Q: AI 에이전트 애니메이션이 작동하지 않아요
A: `enhanced-tracking.js`가 로드되었는지 확인하세요. `window.aiModelTracker`가 정의되어 있어야 합니다.

### Q: 모듈 로드 오류가 발생해요
A: ES6 모듈은 `type="module"`이 필요합니다. 또한 `.js` 확장자를 명시해야 합니다.

---

## 📊 성능 지표

- **번들 크기**: 80.91 kB
- **모듈 수**: 7개 (v3.1)
- **빌드 시간**: ~1초
- **로드 시간**: < 100ms
- **메모리 사용**: ~20MB (PM2)

---

## 🔐 보안

- ✅ XSS 방지: HTML 이스케이프 처리
- ✅ CSRF 방지: API 토큰 사용 (예정)
- ✅ 입력 검증: 프론트엔드 + 백엔드 검증
- ✅ 에러 메시지: 민감 정보 노출 방지

---

## 📄 라이선스

MIT License

---

## 👥 기여

이 프로젝트는 모듈형 아키텍처로 설계되어 있어 새로운 기능을 쉽게 추가할 수 있습니다.

**기여 방법:**
1. 새 모듈 작성
2. 의존성 명시
3. 테스트 작성
4. Pull Request 제출

---

## 📞 문의

문제가 발생하거나 질문이 있으시면 GitHub Issues를 통해 문의해주세요.

---

**Plan-Craft v3.1** - AI 자율 문서 생성 시스템 🚀
