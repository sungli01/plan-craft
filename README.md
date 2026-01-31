# Plan-Craft: AI 자율 풀스택 개발 엔진

**Code-First Edition** - 작동하는 코드가 모든 것의 중심입니다.

## 🎯 프로젝트 개요

사용자의 아이디어를 입력받아 **상용화 가능한 수준의 완성된 소프트웨어**를 자동으로 개발하고 배포하는 완전 자율형 AI 풀스택 개발 엔진입니다.

### 핵심 원칙

1. **Code-First**: 문서가 아닌 작동하는 코드를 우선 생성
2. **Strict Quality Gate**: 빌드 100% 성공, 테스트 커버리지 95% 이상 필수
3. **Full Autonomy**: 비개발자도 사용 가능한 완전 자율 시스템

## 🌐 URL

- **Production**: https://plan-craft.pages.dev (준비 중)
- **Sandbox Dev**: https://3000-i5y2r8i7qfa5gukpxw2ov-a402f90a.sandbox.novita.ai
- **API Base**: `/api`
- **GitHub**: (연결 예정)

## ✨ 완료된 기능

### Phase 1: Core Implementation ✅
- ✅ Pipeline State Manager - 10단계 개발 파이프라인 관리
- ✅ Quality Gate Validator - 엄격한 품질 검증 (빌드 100%, 테스트 95%+)
- ✅ Agent Protocol - Tech Lead, Dev, QA, Ops 에이전트 통신
- ✅ Build Logger - 실시간 빌드 로그 및 이벤트 스트리밍

### Phase 2: API Server ✅
- ✅ 10개 REST API 엔드포인트
  - `POST /api/projects` - 프로젝트 생성
  - `GET /api/projects/:id` - 프로젝트 조회
  - `GET /api/projects/:id/phases` - 단계별 진행 상황
  - `POST /api/projects/:id/phases/:gate/start` - 단계 시작
  - `POST /api/projects/:id/phases/:gate/complete` - 단계 완료
  - `PUT /api/projects/:id/phases/:gate/metrics` - 메트릭 업데이트
  - `GET /api/projects/:id/logs` - 빌드 로그 조회
  - `GET /api/health` - 헬스 체크
  - `GET /api/stats` - 시스템 통계

### Phase 3: Frontend UI ✅
- ✅ DevOps 대시보드 스타일 UI
- ✅ 실시간 파이프라인 뷰어 (G1-G10 상태 표시)
- ✅ 터미널 콘솔 (실시간 로그 스트리밍)
- ✅ 프로젝트 생성 폼
- ✅ 프로젝트 상세 페이지
- ✅ 시스템 통계 대시보드

### Phase 4-7: Integration & Testing ✅
- ✅ 프론트엔드-백엔드 완전 연동
- ✅ 단위 테스트 커버리지: **98.63%** (Statements), **100%** (Functions)
- ✅ 77개 테스트 케이스 통과
- ✅ 보안 검증 완료
- ✅ 빌드 최적화 완료 (Vite + TypeScript)

## 📊 데이터 아키텍처

### 데이터 모델

```typescript
// Pipeline State
- ProjectState: 프로젝트 전체 상태
- PhaseState: 각 단계(G1-G10) 상태
- PhaseMetrics: 빌드 성공률, 테스트 커버리지, 보안 이슈

// Agent Communication
- AgentMessage: 에이전트 간 메시지
- TaskAssignment: 작업 할당
- BuildResult: 빌드 결과

// Build Logging
- LogEntry: 로그 엔트리 (DEBUG, INFO, WARN, ERROR, SUCCESS)
- BuildEvent: 빌드 이벤트 (phase_started, build_completed, etc.)
```

### 스토리지 서비스

- **Current**: In-memory storage (Map 기반)
- **Planned**: Cloudflare D1 (SQLite) for production persistence

### 데이터 흐름

```
User Input (Idea) 
  → Tech Lead (Pipeline Manager)
    → Dev Agent (Code Generation)
      → QA Agent (Test Execution)
        → Quality Gate Validation
          → Ops Agent (Deployment)
            → Deployed Application
```

## 🚀 사용 가이드

### 1. 프로젝트 생성

1. 메인 대시보드 접속
2. "프로젝트 이름"과 "아이디어 설명" 입력
3. "프로젝트 생성 및 시작" 클릭

### 2. 진행 상황 모니터링

- 파이프라인 뷰어에서 G1-G10 단계별 상태 확인
- 터미널 콘솔에서 실시간 로그 확인
- 프로젝트 상세 페이지에서 메트릭 확인

### 3. 완료 확인

- 모든 10단계가 🟢 COMPLETED 상태가 되면 배포 완료
- 생성된 애플리케이션 URL 확인

## 🔧 배포 정보

### 플랫폼
- **개발**: Cloudflare Pages Dev (Sandbox)
- **프로덕션**: Cloudflare Pages (예정)

### 상태
- ✅ 개발 환경 활성화
- 🔄 프로덕션 배포 준비 중

### 기술 스택
- **Backend**: Hono (Cloudflare Workers)
- **Frontend**: TypeScript + Tailwind CSS
- **Build**: Vite
- **Testing**: Jest (98.63% coverage)
- **Deployment**: Wrangler (Cloudflare)

### 마지막 업데이트
- 2026-01-31

## 📝 API 엔드포인트 요약

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects` | 새 프로젝트 생성 |
| GET | `/api/projects/:id` | 프로젝트 상세 조회 |
| GET | `/api/projects/:id/phases` | 단계별 진행 상황 |
| POST | `/api/projects/:id/phases/:gate/start` | 단계 시작 |
| POST | `/api/projects/:id/phases/:gate/complete` | 단계 완료 (Quality Gate) |
| PUT | `/api/projects/:id/phases/:gate/metrics` | 메트릭 업데이트 |
| GET | `/api/projects/:id/logs` | 빌드 로그 조회 |
| POST | `/api/projects/:id/logs` | 로그 추가 |
| GET | `/api/projects/:id/messages` | 에이전트 메시지 조회 |
| POST | `/api/projects/:id/messages` | 메시지 전송 |
| GET | `/api/health` | 헬스 체크 |
| GET | `/api/stats` | 시스템 통계 |

## 🧪 테스트 커버리지

```
File               | % Stmts | % Branch | % Funcs | % Lines
-------------------|---------|----------|---------|--------
All files          |   98.63 |    86.41 |     100 |   99.04
 agent-protocol.ts |   97.33 |     87.5 |     100 |   97.22
 build-logger.ts   |     100 |    88.88 |     100 |     100
 pipeline-state.ts |   98.83 |     82.6 |     100 |     100
```

## 📦 로컬 개발

```bash
# 의존성 설치
npm install

# 빌드
npm run build

# 개발 서버 시작
pm2 start ecosystem.config.cjs

# 테스트 실행
npm run test:coverage

# 로그 확인
pm2 logs plan-craft --nostream
```

## 🎯 다음 단계 (Remaining)

### G9: API 문서 자동 생성
- Swagger/OpenAPI 명세 생성
- 사용자 매뉴얼 자동 생성

### G10: 소스코드 이관
- GitHub 저장소 생성 및 푸시
- 프로젝트 백업 및 다운로드 링크

## 🔐 보안

- ✅ CORS 설정 완료
- ✅ 입력 검증 구현
- ✅ 타입스크립트 엄격 모드
- ✅ 보안 취약점 0개

## 📄 라이선스

MIT License

---

**Built with Plan-Craft Engine** - Where code speaks louder than documents.
