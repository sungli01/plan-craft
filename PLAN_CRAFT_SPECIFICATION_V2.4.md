# Plan-Craft v2.4 - 완전 자율형 AI 풀스택 개발 엔진
**Code-First Edition - 최종 사양서**

---

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [핵심 원칙 및 실행 규칙](#핵심-원칙-및-실행-규칙)
3. [시스템 아키텍처](#시스템-아키텍처)
4. [개발 파이프라인 (10단계)](#개발-파이프라인-10단계)
5. [기술 스택](#기술-스택)
6. [주요 기능](#주요-기능)
7. [UI/UX 설계](#uiux-설계)
8. [API 명세](#api-명세)
9. [배포 및 운영](#배포-및-운영)
10. [버전 히스토리](#버전-히스토리)

---

## 프로젝트 개요

### 프로젝트 명칭
**Plan-Craft, Code-First Edition v2.4**

### 목표
사용자의 아이디어를 입력받아 **상용화 가능한 수준의 완성된 소프트웨어**를 자동으로 개발하고 배포하는 완전 자율형 AI 풀스택 개발 엔진

### 대상 사용자
- **End-User**: 비개발자 (개발 지식 불필요)
- **입력**: 아이디어 설명, 참조 문서 (URL/파일), 추가 지시사항
- **출력**: 작동하는 웹 애플리케이션, 소스코드, 기술 문서

### 배포 정보
- **Production**: https://plan-craft.pages.dev
- **GitHub**: https://github.com/sungli01/plan-craft
- **Platform**: Cloudflare Pages + Workers
- **Status**: ✅ Live & Production-Ready

---

## 핵심 원칙 및 실행 규칙

### 절대 실행 원칙

#### 1. Code-First가 핵심
- **작동하는 코드가 최우선** - 문서는 후행 산출물
- 모든 단계는 실제로 작동하는 코드로 검증
- 문서는 완성된 코드에서 자동 생성

#### 2. Strict Quality Gate
**빌드 오류 또는 테스트 커버리지 < 95% 시 다음 단계 진입 불가 (REJECT)**

```typescript
interface QualityGate {
  buildSuccessRate: 100;  // 필수: 100%
  testCoverage: >= 95;    // 필수: 95% 이상
  securityIssues: 0;      // 필수: 치명적 보안 이슈 0개
}
```

**Hard Rules:**
- ❌ Build Success Rate ≠ 100% → REJECT (디버깅 모드 진입)
- ❌ Test Coverage < 95% → REJECT (테스트 케이스 추가)
- ❌ Critical Security Issues 발견 → REJECT (보안 패치 우선)

#### 3. Full Autonomy
- End-User는 비개발자
- AI가 필요한 자격 증명(API Key 등)만 요청
- 모든 개발 과정은 자동화

---

## 시스템 아키텍처

### 내부 에이전트 구조

```
┌─────────────────────────────────────────────────┐
│         Plan-Craft Engine v2.4                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌──────────────┐           │
│  │ Tech Lead    │  │ Dev Agent    │           │
│  │ (Orchestrator)│  │ (Coder)      │           │
│  │ Gemini 2.0   │  │ Claude 3.5   │           │
│  └──────┬───────┘  └──────┬───────┘           │
│         │                  │                    │
│         ▼                  ▼                    │
│  ┌──────────────┐  ┌──────────────┐           │
│  │ QA Agent     │  │ Ops Agent    │           │
│  │ (Tester)     │  │ (Deployer)   │           │
│  │ GPT-4o/O1    │  │ Gemini 2.0   │           │
│  └──────────────┘  └──────────────┘           │
│                                                 │
├─────────────────────────────────────────────────┤
│  핵심 컴포넌트                                   │
│  • Pipeline State Manager (상태 관리)          │
│  • Quality Gate Validator (품질 검증)          │
│  • Agent Communication Protocol (협업)         │
│  • Build Logger (실시간 로그)                   │
│  • PDF Generator (문서 생성 & 자동 분할)        │
│  • Time Estimator (예상 시간 계산)              │
└─────────────────────────────────────────────────┘
```

### 에이전트 역할

| 에이전트 | 모델 | 역할 | 주요 업무 |
|---------|------|------|----------|
| **Tech Lead** | Gemini 2.0 Flash | 오케스트레이터 | CI/CD 파이프라인 관리, Quality Gate 검증 |
| **Dev Agent** | Claude 3.5 Sonnet | 주 코딩 담당 | 백엔드/프론트엔드 개발, API 구현 |
| **QA Agent** | GPT-4o/O1 | 테스터 | 테스트 코드 작성, 버그 리포트, 커버리지 검증 |
| **Ops Agent** | Gemini 2.0 Flash | 배포 담당 | 환경 구성, 배포, URL 생성 |

---

## 개발 파이프라인 (10단계)

### Phase 1: Core Implementation (G1 → G2)

#### G1: 핵심 로직 (Core Logic)
**목표:** 프로젝트의 핵심 비즈니스 로직 구현
- **예상 시간:** 3분
- **산출물:**
  - Pipeline State Manager
  - Quality Gate Validator
  - Agent Communication Protocol
  - Build Logger
- **Quality Gate:**
  - ✅ 빌드 성공률 100%
  - ✅ 테스트 커버리지 ≥ 95%
  - ✅ 핵심 기능 동작 검증

**실제 구현 예시:**
```typescript
// src/core/pipeline-state.ts
export class PipelineStateManager {
  private phases: Map<PhaseGate, PhaseState> = new Map();
  
  startPhase(gate: PhaseGate): void {
    // 단계 시작 로직
  }
  
  completePhase(gate: PhaseGate): boolean {
    // Quality Gate 검증
    if (!QualityGateValidator.canProgress(phase)) {
      return false; // REJECT
    }
    // 단계 완료
    return true;
  }
}
```

#### G2: API 서버 (API Server)
**목표:** RESTful API 엔드포인트 구현
- **예상 시간:** 4분
- **산출물:**
  - 23개 REST API 엔드포인트
  - Hono 기반 서버리스 백엔드
- **주요 API:**
  - `POST /api/projects` - 프로젝트 생성
  - `GET /api/projects/:id` - 프로젝트 조회
  - `POST /api/projects/:id/pause` - 일시중지
  - `POST /api/projects/:id/resume` - 재개
  - `POST /api/projects/:id/cancel` - 취소
  - `POST /api/projects/:id/upgrade` - 업그레이드
  - `POST /api/projects/:id/references` - 참조 추가
  - `POST /api/projects/:id/export/pdf` - PDF 생성
  - `GET /api/projects/:id/download/pdf/:partNumber?` - PDF 다운로드 (분할 지원)

### Phase 2: Frontend & UX (G3 → G4)

#### G3: UI 컴포넌트 (UI Components)
**목표:** 사용자 인터페이스 구현
- **예상 시간:** 5분
- **산출물:**
  - 반응형 2컬럼 레이아웃 (데스크톱)
  - DevOps 대시보드 스타일 UI
  - 실시간 프로젝트 모니터링
- **주요 컴포넌트:**
  - 진행 중인 프로젝트 목록
  - 프로젝트 생성 폼
  - 파이프라인 뷰어
  - 빌드 로그 콘솔
  - 시스템 통계

#### G4: 통합 (Integration)
**목표:** 프론트엔드-백엔드 연동
- **예상 시간:** 3분
- **산출물:**
  - API 클라이언트 통합
  - 실시간 데이터 바인딩
  - 자동 새로고침 (프로젝트: 10초, 통계: 5초)

### Phase 3: Testing & Hardening (G5 → G6)

#### G5: 단위 테스트 (Unit Tests)
**목표:** 95% 이상 테스트 커버리지 달성
- **예상 시간:** 4분
- **산출물:**
  - Jest 테스트 스위트
  - 77개 테스트 케이스
- **실제 달성:**
  - Statements: 98.63%
  - Branches: 86.41%
  - Functions: 100%
  - Lines: 99.04%

#### G6: 보안 스캔 (Security Scan)
**목표:** 보안 취약점 제거
- **예상 시간:** 2분
- **검증 항목:**
  - API 토큰 보안 (환경 변수 사용)
  - XSS 방어
  - SQL Injection 방어 (없음 - NoSQL 사용)
  - CORS 설정

### Phase 4: Deployment (G7 → G8)

#### G7: 빌드 최적화 (Build Optimization)
**목표:** 프로덕션 빌드 최적화
- **예상 시간:** 2분
- **산출물:**
  - Vite SSR 빌드
  - 번들 크기: 78.77 KB
  - Tree-shaking 적용

#### G8: 배포 (Deployment)
**목표:** 프로덕션 환경 배포
- **예상 시간:** 3분
- **플랫폼:** Cloudflare Pages
- **결과:**
  - Production: https://plan-craft.pages.dev
  - 전 세계 CDN 배포 (300+ locations)
  - 자동 HTTPS

### Phase 5: Handover (G9 → G10)

#### G9: 문서화 (Documentation)
**목표:** 완전한 기술 문서 작성
- **예상 시간:** 2분
- **산출물:**
  - README.md (사용자 가이드)
  - API 명세서 (23개 엔드포인트)
  - 배포 가이드
  - 아키텍처 문서

#### G10: 소스 이관 (Handover)
**목표:** 최종 산출물 전달
- **예상 시간:** 1분
- **산출물:**
  - GitHub 저장소: https://github.com/sungli01/plan-craft
  - 백업 파일 (tar.gz)
  - PDF 문서 (자동 50페이지 분할)

### 총 예상 시간
**29분** (G1: 3분 + G2: 4분 + ... + G10: 1분)

---

## 기술 스택

### Backend
```yaml
Framework: Hono (v4.11.7)
Runtime: Cloudflare Workers
Language: TypeScript (v5.0.0)
Build: Vite (v6.4.1)
Testing: Jest
Coverage: 98.63%
```

### Frontend
```yaml
Framework: Vanilla TypeScript
Styling: Tailwind CSS (CDN)
Icons: FontAwesome (CDN)
Layout: 2-Column Responsive Grid
Breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1280px
  - Desktop: ≥ 1280px
```

### Infrastructure
```yaml
Hosting: Cloudflare Pages
Serverless: Cloudflare Workers
Version Control: Git / GitHub
CI/CD: Wrangler CLI
Package Manager: npm
```

### Data Models
```typescript
// Core Types
interface ProjectState {
  projectId: string;
  projectName: string;
  userIdea: string;
  techStack: string[];
  currentPhase: PhaseGate;
  phases: Map<PhaseGate, PhaseState>;
  references: ReferenceDocument[];
  upgrades: ProjectUpgrade[];
  isPaused: boolean;
  isCancelled: boolean;
  createdAt: number;
  updatedAt: number;
}

interface PhaseState {
  gate: PhaseGate;
  status: PhaseStatus;
  metrics: PhaseMetrics;
  startedAt?: number;
  completedAt?: number;
  errorLog: string[];
  artifacts: string[];
}

interface PhaseMetrics {
  testCoverage: number;      // 0-100
  buildSuccessRate: number;  // 0-100
  securityIssues: number;    // 0+
  executionTime: number;     // milliseconds
}
```

---

## 주요 기능

### 1. 참조 문서 관리 (v2.1)

#### 1.1 드래그 앤 드롭 파일 업로드
```typescript
// 지원 파일 형식
accept: "image/*,.pdf,.txt,.md,.doc,.docx"

// 기능
- 다중 파일 선택
- 실시간 파일 크기 표시
- 파일 타입별 아이콘 구분
- 드래그 시 시각적 피드백
```

#### 1.2 URL 자동 감지 및 추출
```typescript
// URL 패턴 매칭
const urlPattern = /(https?:\/\/[^\s]+)/g;

// 기능
- 아이디어 설명란에서 URL 자동 감지
- 여러 개의 URL 동시 감지
- 원클릭으로 참조 문서로 추가
- 도메인 이름 자동 추출
```

#### 1.3 통합 참조 문서 목록
- URL 참조 (링크 아이콘)
- 파일 참조 (파일 아이콘)
- 이미지 참조 (이미지 아이콘)
- 개별 삭제 버튼
- 색상 구분 (Purple/Blue/Pink)

### 2. PDF 자동 분할 (v2.2)

#### 2.1 페이지 수 자동 추정
```typescript
// 섹션별 페이지 계산
- 텍스트: 45줄/페이지, 80자/줄
- 이미지: 각 1/3 페이지
- 코드 블록: 20% 추가 공간 (포맷팅)

// 예시
estimateSectionPages(section: PDFSection): number {
  let pages = 1; // 헤더
  pages += contentLines / AVG_LINES_PER_PAGE;
  pages += images.length * 0.33;
  pages += codeLines / AVG_LINES_PER_PAGE * 1.2;
  return Math.ceil(pages);
}
```

#### 2.2 50페이지 단위 자동 분할
```typescript
// 분할 로직
MAX_PAGES_PER_PART = 50;

splitIntoParts(document: PDFDocument): PDFPart[] {
  // 섹션 단위로 분할 (내용 중간에 잘리지 않음)
  // Part 1 of 4, Part 2 of 4 형식
}
```

#### 2.3 멀티 파트 다운로드 UI
- 개별 파트 다운로드 버튼
- 전체 다운로드 버튼 (순차 다운로드)
- 다운로드 진행 상황 실시간 표시
- 파일명: `ProjectName_Part1of3.html`

### 3. 프로젝트 제어 (v2.0)

#### 3.1 일시중지/재개
```typescript
POST /api/projects/:id/pause
POST /api/projects/:id/resume

// 상태 관리
isPaused: boolean
pausedAt: number
resumedAt: number
```

#### 3.2 취소
```typescript
POST /api/projects/:id/cancel

// 영구적 중지
isCancelled: true
cancelledAt: number
```

#### 3.3 업그레이드
```typescript
POST /api/projects/:id/upgrade

interface ProjectUpgrade {
  upgradeId: string;
  instruction: string;
  references: ReferenceDocument[];
  requestedAt: number;
  completedAt?: number;
  changes: string[];
}
```

### 4. 시간 추정 및 표시 (v2.3)

#### 4.1 단계별 예상 시간
```typescript
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
// 총 29분
```

#### 4.2 실시간 시간 표시
```typescript
// 경과 시간
elapsedMinutes = sum(완료된 단계들의 시간)

// 남은 시간
remainingMinutes = sum(남은 단계들의 시간)

// 화면 표시
"12분 / 29분"
"17분 남음"
```

#### 4.3 시간 진행률 바
- 오렌지-레드 그라데이션
- 실시간 업데이트
- 시각적 진행 상황

### 5. 반응형 레이아웃 (v2.4)

#### 5.1 2컬럼 그리드 (데스크톱)
```html
<div class="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 h-[calc(100vh-180px)]">
  <div class="overflow-y-auto pr-2">
    <!-- 좌측: 프로젝트 관리 -->
  </div>
  <div class="overflow-hidden">
    <!-- 우측: 빌드 로그 -->
  </div>
</div>
```

#### 5.2 높이 최적화
```css
/* 전체 레이아웃 */
height: calc(100vh - 180px);

/* 스크롤 영역 */
.overflow-y-auto {
  max-height: 100%;
}

/* 빌드 로그 (자동 확장) */
.flex-1 {
  flex: 1 1 0%;
}
```

#### 5.3 반응형 브레이크포인트
| 화면 크기 | 클래스 | 동작 |
|----------|--------|------|
| < 768px | 기본 | 단일 컬럼, 컴팩트 UI |
| ≥ 768px | `md:` | 중간 크기 텍스트/간격 |
| ≥ 1280px | `xl:` | 2컬럼 그리드 |
| ≥ 1536px | `2xl:` | 최대 1920px 컨테이너 |

---

## UI/UX 설계

### DevOps 대시보드 스타일

```
╔═══════════════════════════════════════════════════════════╗
║  Plan-Craft v2.4 - AI 자율 풀스택 개발 엔진                 ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌─────────────────────┬─────────────────────────────┐   ║
║  │ 📋 진행 중인 프로젝트  │ 🔀 개발 파이프라인            │   ║
║  ├─────────────────────┤                             │   ║
║  │ • My App (진행 중)   │ [G1][G2][G3][G4]...         │   ║
║  │   45% 완료           │                             │   ║
║  │   12분/29분 (17분 남음)│                             │   ║
║  │   [상세] [중지]       │                             │   ║
║  ├─────────────────────┼─────────────────────────────┤   ║
║  │ ➕ 새 프로젝트 시작   │ 💻 빌드 로그                 │   ║
║  │                     │ ┌───────────────────────┐   │   ║
║  │ 이름: [          ]  │ │ ║ Console v2.4      ║ │   │   ║
║  │ 아이디어: [      ]  │ │ ╚═══════════════════╝ │   │   ║
║  │ 📎 참조: [드래그]   │ │ [LOG] Building...    │   │   ║
║  │                     │ │ [SUCCESS] Complete!  │   │   ║
║  │ [프로젝트 생성]      │ │ ↕️ 실시간 스크롤       │   │   ║
║  ├─────────────────────┤ └───────────────────────┘   │   ║
║  │ 📊 시스템 통계       │                             │   ║
║  │ [전체|진행|중지|완료] │                             │   ║
║  └─────────────────────┴─────────────────────────────┘   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### 색상 스킴 (Glass-morphism + Light Theme)

```css
/* 배경 */
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 패널 */
.glass-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

.dark-glass-panel {
  background: rgba(30, 30, 50, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 그라데이션 텍스트 */
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### 상태 아이콘 및 배지

| 상태 | 아이콘 | 색상 | 배지 |
|------|--------|------|------|
| 진행 중 | ▶️ | 파란색 | `bg-blue-100 text-blue-700` |
| 일시중지 | ⏸️ | 노란색 | `bg-yellow-100 text-yellow-700` |
| 완료 | ✅ | 초록색 | `bg-green-100 text-green-700` |
| 실패 | ❌ | 빨간색 | `bg-red-100 text-red-700` |
| 빌드 중 | 🔧 | 주황색 | `bg-orange-100 text-orange-700` |
| 배포 중 | 🚀 | 보라색 | `bg-purple-100 text-purple-700` |

---

## API 명세

### Base URL
```
Production: https://plan-craft.pages.dev/api
Development: http://localhost:3000/api
```

### 인증
현재 버전은 인증 불필요 (데모 목적)

### 엔드포인트 목록 (23개)

#### 프로젝트 관리

**1. 프로젝트 생성**
```http
POST /api/projects
Content-Type: application/json

Request:
{
  "projectName": "AI 쇼핑몰",
  "userIdea": "사용자가 상품을 검색하고 구매할 수 있는 쇼핑몰",
  "references": [
    {
      "type": "url",
      "url": "https://stripe.com/docs",
      "content": "Stripe API"
    }
  ]
}

Response: 201 Created
{
  "projectId": "project_abc123",
  "projectName": "AI 쇼핑몰",
  "currentPhase": "G1_CORE_LOGIC",
  "progress": 0,
  "createdAt": 1706000000000,
  "estimatedCompletionTime": 29
}
```

**2. 프로젝트 조회**
```http
GET /api/projects/:projectId

Response: 200 OK
{
  "projectId": "project_abc123",
  "projectName": "AI 쇼핑몰",
  "userIdea": "...",
  "currentPhase": "G3_UI_COMPONENTS",
  "progress": 45.5,
  "isPaused": false,
  "isCancelled": false,
  "isCompleted": false,
  "phases": [...],
  "references": [...],
  "upgrades": [...]
}
```

**3. 프로젝트 일시중지**
```http
POST /api/projects/:projectId/pause

Response: 200 OK
{
  "projectId": "project_abc123",
  "isPaused": true,
  "pausedAt": 1706000000000
}
```

**4. 프로젝트 재개**
```http
POST /api/projects/:projectId/resume

Response: 200 OK
{
  "projectId": "project_abc123",
  "isPaused": false,
  "resumedAt": 1706000000000
}
```

**5. 프로젝트 취소**
```http
POST /api/projects/:projectId/cancel

Response: 200 OK
{
  "projectId": "project_abc123",
  "isCancelled": true,
  "cancelledAt": 1706000000000
}
```

#### 참조 문서 관리

**6. 참조 문서 추가**
```http
POST /api/projects/:projectId/references

Request:
{
  "type": "url",
  "url": "https://tailwindcss.com/docs",
  "content": "Tailwind CSS 문서"
}

Response: 201 Created
{
  "referenceId": "ref_xyz789",
  "projectId": "project_abc123",
  "type": "url",
  "url": "https://tailwindcss.com/docs"
}
```

**7. 참조 문서 목록**
```http
GET /api/projects/:projectId/references

Response: 200 OK
{
  "projectId": "project_abc123",
  "references": [
    {
      "referenceId": "ref_xyz789",
      "type": "url",
      "url": "https://tailwindcss.com/docs",
      "addedAt": 1706000000000
    }
  ]
}
```

#### 업그레이드 관리

**8. 업그레이드 요청**
```http
POST /api/projects/:projectId/upgrade

Request:
{
  "instruction": "로그인 기능 추가",
  "references": [
    {
      "type": "url",
      "url": "https://auth0.com/docs"
    }
  ]
}

Response: 201 Created
{
  "upgradeId": "upgrade_def456",
  "projectId": "project_abc123",
  "instruction": "로그인 기능 추가",
  "requestedAt": 1706000000000
}
```

**9. 업그레이드 목록**
```http
GET /api/projects/:projectId/upgrades

Response: 200 OK
{
  "projectId": "project_abc123",
  "upgrades": [
    {
      "upgradeId": "upgrade_def456",
      "instruction": "로그인 기능 추가",
      "completedAt": 1706001000000,
      "changes": ["Added auth middleware", "Created login page"]
    }
  ]
}
```

**10. 업그레이드 완료**
```http
POST /api/projects/:projectId/upgrades/:upgradeId/complete

Response: 200 OK
{
  "upgradeId": "upgrade_def456",
  "projectId": "project_abc123",
  "completedAt": 1706001000000
}
```

#### 단계 관리

**11. 단계 시작**
```http
POST /api/projects/:projectId/phases/:gate/start

Request: (empty)

Response: 200 OK
{
  "projectId": "project_abc123",
  "gate": "G2_API_SERVER",
  "status": "CODING",
  "startedAt": 1706000000000
}
```

**12. 단계 메트릭 업데이트**
```http
PUT /api/projects/:projectId/phases/:gate/metrics

Request:
{
  "testCoverage": 98,
  "buildSuccessRate": 100,
  "securityIssues": 0
}

Response: 200 OK
{
  "projectId": "project_abc123",
  "gate": "G5_UNIT_TESTS",
  "metrics": {
    "testCoverage": 98,
    "buildSuccessRate": 100,
    "securityIssues": 0
  }
}
```

**13. 단계 완료**
```http
POST /api/projects/:projectId/phases/:gate/complete

Response: 200 OK | 400 Bad Request
{
  "projectId": "project_abc123",
  "gate": "G1_CORE_LOGIC",
  "status": "COMPLETED",
  "completedAt": 1706000000000,
  "nextPhase": "G2_API_SERVER"
}

// Quality Gate 실패 시
{
  "error": "Quality gate failed",
  "gate": "G5_UNIT_TESTS",
  "reason": "Test coverage below 95%",
  "currentCoverage": 87
}
```

**14. 단계 목록**
```http
GET /api/projects/:projectId/phases

Response: 200 OK
{
  "projectId": "project_abc123",
  "phases": [
    {
      "gate": "G1_CORE_LOGIC",
      "status": "COMPLETED",
      "metrics": {...},
      "startedAt": 1706000000000,
      "completedAt": 1706000180000
    },
    {
      "gate": "G2_API_SERVER",
      "status": "CODING",
      "metrics": {...},
      "startedAt": 1706000180000
    }
  ]
}
```

#### PDF 생성 및 다운로드

**15. PDF 생성 요청**
```http
POST /api/projects/:projectId/export/pdf

Response: 200 OK
{
  "projectId": "project_abc123",
  "status": "generated",
  "estimatedPages": 127,
  "totalParts": 3,
  "downloadUrls": [
    "/api/projects/project_abc123/download/pdf/1",
    "/api/projects/project_abc123/download/pdf/2",
    "/api/projects/project_abc123/download/pdf/3"
  ],
  "generatedAt": 1706000000000,
  "note": "Document split into 3 parts (max 50 pages each)"
}
```

**16. PDF 다운로드 (전체)**
```http
GET /api/projects/:projectId/download/pdf

Response: 200 OK
Content-Type: text/html
Content-Disposition: attachment; filename="AI_Shopping_Mall_Full.html"

[HTML content]
```

**17. PDF 다운로드 (특정 파트)**
```http
GET /api/projects/:projectId/download/pdf/:partNumber

Response: 200 OK
Content-Type: text/html
Content-Disposition: attachment; filename="AI_Shopping_Mall_Part2of3.html"

[HTML content with Part 2 of 3 indicator]
```

#### 로그 관리

**18. 로그 조회**
```http
GET /api/projects/:projectId/logs?level=INFO&limit=100

Response: 200 OK
{
  "projectId": "project_abc123",
  "logs": [
    {
      "timestamp": 1706000000000,
      "level": "INFO",
      "source": "dev-agent",
      "phase": "G2_API_SERVER",
      "message": "API endpoint created: POST /api/users"
    }
  ],
  "total": 250,
  "page": 1
}
```

**19. 로그 추가**
```http
POST /api/projects/:projectId/messages

Request:
{
  "level": "SUCCESS",
  "source": "qa-agent",
  "phase": "G5_UNIT_TESTS",
  "message": "Test coverage: 98.63%"
}

Response: 201 Created
{
  "logId": "log_ghi789",
  "projectId": "project_abc123",
  "timestamp": 1706000000000
}
```

#### 에이전트 통신

**20. 메시지 전송**
```http
POST /api/messages

Request:
{
  "from": "tech-lead",
  "to": "dev-agent",
  "type": "TASK_ASSIGNMENT",
  "projectId": "project_abc123",
  "payload": {
    "taskId": "task_001",
    "phase": "G2_API_SERVER",
    "description": "Implement user authentication API"
  }
}

Response: 201 Created
{
  "messageId": "msg_jkl012",
  "from": "tech-lead",
  "to": "dev-agent",
  "timestamp": 1706000000000
}
```

**21. 메시지 조회**
```http
GET /api/projects/:projectId/messages?agent=dev-agent

Response: 200 OK
{
  "projectId": "project_abc123",
  "messages": [
    {
      "messageId": "msg_jkl012",
      "from": "tech-lead",
      "to": "dev-agent",
      "type": "TASK_ASSIGNMENT",
      "payload": {...}
    }
  ]
}
```

#### 시스템 정보

**22. 헬스 체크**
```http
GET /api/health

Response: 200 OK
{
  "status": "ok",
  "timestamp": 1706000000000,
  "activeProjects": 3,
  "totalLogs": "active",
  "queuedMessages": 5
}
```

**23. 시스템 통계**
```http
GET /api/stats

Response: 200 OK
{
  "totalProjects": 15,
  "activeProjects": 3,
  "completedProjects": 10,
  "pausedProjects": 2,
  "projects": [
    {
      "projectId": "project_abc123",
      "projectName": "AI 쇼핑몰",
      "currentPhase": "G3_UI_COMPONENTS",
      "progress": 45.5,
      "isCompleted": false,
      "estimatedTimeRemaining": 17
    }
  ]
}
```

---

## 배포 및 운영

### 로컬 개발

```bash
# 1. 저장소 클론
git clone https://github.com/sungli01/plan-craft.git
cd plan-craft

# 2. 의존성 설치
npm install

# 3. 빌드
npm run build

# 4. PM2로 개발 서버 시작
npm run clean-port  # 포트 3000 정리
pm2 start ecosystem.config.cjs

# 5. 헬스 체크
curl http://localhost:3000/api/health

# 6. 로그 확인
pm2 logs plan-craft --nostream
```

### Cloudflare Pages 배포

```bash
# 1. Cloudflare API 토큰 설정
export CLOUDFLARE_API_TOKEN="your-token-here"

# 2. 인증 확인
npx wrangler whoami

# 3. 프로젝트 생성 (최초 1회)
npx wrangler pages project create plan-craft --production-branch main

# 4. 빌드
npm run build

# 5. 배포
npx wrangler pages deploy dist --project-name plan-craft --branch main

# 결과
✨ Deployment complete! 
https://plan-craft.pages.dev
```

### 환경 변수

```bash
# .dev.vars (로컬 개발)
NODE_ENV=development
PORT=3000

# Cloudflare Pages (프로덕션)
# Wrangler 대시보드에서 설정
NODE_ENV=production
```

### 모니터링

```bash
# PM2 모니터링
pm2 monit

# Cloudflare Analytics
# https://dash.cloudflare.com/[account]/pages/plan-craft

# GitHub Actions (선택사항)
# .github/workflows/deploy.yml
```

---

## 버전 히스토리

### v2.4 (2026-01-31) - 반응형 레이아웃
- ✅ 2컬럼 그리드 레이아웃 (데스크톱)
- ✅ 한 화면에 모든 컨텐츠 표시
- ✅ 독립적인 스크롤 영역
- ✅ 모바일/태블릿/데스크톱 반응형
- ✅ 컴팩트한 UI 요소

### v2.3 (2026-01-31) - 프로젝트 관리
- ✅ 진행 중인 프로젝트 목록
- ✅ 예상 시간 계산 시스템 (29분)
- ✅ 실시간 시간 표시 (경과/남음)
- ✅ 빠른 중지 버튼
- ✅ 시간 진행률 바

### v2.2 (2026-01-31) - PDF 자동 분할
- ✅ 스마트 페이지 추정 엔진
- ✅ 50페이지 단위 자동 분할
- ✅ 멀티 파트 다운로드 시스템
- ✅ 향상된 UI/UX

### v2.1 (2026-01-31) - 참조 문서 UX
- ✅ 드래그 앤 드롭 파일 업로드
- ✅ URL 자동 감지 및 추출
- ✅ 통합 참조 문서 관리

### v2.0 (2026-01-31) - 기본 기능
- ✅ 프로젝트 생성
- ✅ 10단계 파이프라인
- ✅ 일시중지/재개/취소
- ✅ 업그레이드 기능
- ✅ DevOps 대시보드 UI

### v1.0 (2026-01-31) - 코어 로직
- ✅ Pipeline State Manager
- ✅ Quality Gate Validator
- ✅ Agent Communication Protocol
- ✅ Build Logger
- ✅ 98.63% 테스트 커버리지

---

## 산출물 체크리스트

### ✅ 작동하는 소프트웨어
- [x] Production URL: https://plan-craft.pages.dev
- [x] 실시간 작동 중
- [x] 전 세계 CDN 배포

### ✅ 클린 소스코드
- [x] GitHub: https://github.com/sungli01/plan-craft
- [x] 15개 커밋
- [x] 체계적인 디렉토리 구조
- [x] TypeScript 타입 안전성

### ✅ 완전한 문서
- [x] README.md (사용자 가이드)
- [x] DEPLOYMENT_GUIDE.md (배포 가이드)
- [x] API 명세서 (23개 엔드포인트)
- [x] 이 사양서 (PLAN_CRAFT_SPECIFICATION_V2.4.md)

### ✅ 백업 파일
- [x] 최신 백업: https://www.genspark.ai/api/files/s/w7LYBTwc
- [x] 크기: 388 KB
- [x] 포함: 전체 소스코드 + Git 히스토리

---

## 사용 시나리오

### 시나리오 1: 간단한 Todo 앱 생성

```
1. 사용자 입력:
   - 프로젝트 이름: "나의 Todo 앱"
   - 아이디어: "사용자가 할 일을 추가하고 완료 표시할 수 있는 앱"

2. AI 자동 개발 (29분):
   - G1-G2: 백엔드 API 구현 (7분)
   - G3-G4: 프론트엔드 UI 구현 (8분)
   - G5-G6: 테스트 및 보안 (6분)
   - G7-G8: 빌드 및 배포 (5분)
   - G9-G10: 문서화 및 이관 (3분)

3. 결과:
   - 작동하는 Todo 앱 URL
   - GitHub 저장소
   - 완전한 문서
```

### 시나리오 2: 복잡한 이커머스 플랫폼

```
1. 사용자 입력:
   - 프로젝트 이름: "AI 쇼핑몰 플랫폼"
   - 아이디어: "상품 검색, 장바구니, 결제 기능이 있는 쇼핑몰"
   - 참조 문서:
     - https://stripe.com/docs (결제)
     - https://tailwindcss.com/docs (스타일링)
     - design.pdf (디자인 가이드)

2. AI 자동 개발 (29분):
   - 참조 문서 분석
   - Stripe API 통합
   - Tailwind CSS 적용
   - 디자인 가이드 반영

3. 중간 업그레이드:
   - "로그인 기능 추가"
   - "상품 리뷰 기능 추가"
   - AI가 자동으로 기능 확장

4. 최종 결과:
   - 완성된 이커머스 플랫폼
   - PDF 문서 (자동 3개 파트로 분할)
   - 배포된 URL
```

---

## 결론

**Plan-Craft v2.4**는 비개발자도 아이디어만으로 완전한 웹 애플리케이션을 자동으로 개발하고 배포할 수 있는 **Production-Ready AI 개발 엔진**입니다.

### 핵심 강점
1. **Code-First 철학** - 작동하는 코드 최우선
2. **Strict Quality Gate** - 100% 빌드, 95% 커버리지 필수
3. **Full Autonomy** - 완전 자율 개발 (29분)
4. **Production Deployment** - 실제 배포된 URL 제공
5. **Complete Documentation** - 모든 문서 자동 생성

### 지금 바로 시작
🚀 **https://plan-craft.pages.dev**

---

*이 문서는 Plan-Craft v2.4의 완전한 사양을 정의합니다.*
*최종 업데이트: 2026년 1월 31일*
