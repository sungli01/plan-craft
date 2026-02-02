# Plan-Craft v4.0 - AI Document Generation System

## 📋 프로젝트 개요

**Plan-Craft는 보고서 작성을 위한 AI 자율 문서 생성 시스템입니다.**

- **목적**: 아이디어 → 기획문서 생성 → 가설 검증 → 프로토타입 문서 제공
- **강조**: 이 시스템은 코딩 도구가 아니라 **보고서 작성 도구**입니다
- **버전**: v4.0 UNIFIED CORE (Complete Rewrite)
- **최종 업데이트**: 2026-02-02

## 🚀 주요 기능

### ✅ 완료된 기능

1. **실시간 프로젝트 진행 추적**
   - 1초 단위 타이머 (경과 시간/남은 시간)
   - 10초마다 UI 자동 업데이트
   - 프로그레스 바 실시간 표시 (0-100%)

2. **AI 모델 상태 표시**
   - Master Orchestrator (Claude 3.5 Sonnet)
   - Code Agent (GPT-4 Turbo)
   - Quality Agent (GPT-4O Mini)
   - DevOps Agent (Gemini 2.0 Flash)
   - 회전 애니메이션 (작업 중)
   - 파란 점 (현재 동작 중)
   - 초록 점 (대기 중)

3. **빌드 로그 시스템**
   - HH:MM:SS 형식 타임스탬프
   - 10초마다 상세 단계 설명
   - 색상 코딩 (INFO: 파란색, SUCCESS: 초록색, WARN: 노란색, ERROR: 빨간색)
   - 최대 15개 로그 자동 관리

4. **프로젝트 완료 팝업**
   - HTML/PDF 선택 옵션
   - 다운로드 버튼
   - 프로젝트 정보 표시

5. **프로젝트 제어**
   - 중지 버튼 (개별/전체)
   - 일부 취소 버튼 (준비 중)
   - 전체 취소 버튼
   - 상태 동기화 보장

6. **시스템 통계**
   - 전체 프로젝트 수
   - 진행 중 프로젝트 수
   - 일시정지 프로젝트 수
   - 완료된 프로젝트 수

7. **최대 3개 동시 진행**
   - MAX_PROJECTS = 3
   - 자동 제한 검증

## 🏗️ 시스템 아키텍처

### v4.0 UNIFIED CORE 구조

```
Plan-Craft v4.0
│
├─ unified-core.js (21.9 KB) ⭐ 핵심 통합 시스템
│  ├─ 프로젝트 관리 (생성, 실행, 중지, 취소)
│  ├─ 타이머 관리 (1초 단위 정확도)
│  ├─ UI 업데이트 (매초 자동)
│  ├─ 로그 시스템
│  ├─ AI 모델 추적
│  └─ 완료 모달 관리
│
├─ app-v4.js (7.6 KB) ⭐ 메인 애플리케이션
│  ├─ 이벤트 핸들러
│  ├─ 파일 업로드
│  ├─ 프로젝트 생성 폼
│  └─ 데모 모드
│
└─ constants.js (4.3 KB) ⭐ 공통 상수
   ├─ PHASE_DURATION (단계별 소요 시간)
   ├─ PHASE_TO_MODEL (단계 → AI 모델 매핑)
   ├─ MODEL_TO_AGENT (모델 → 에이전트 매핑)
   └─ APP_CONFIG (앱 설정)
```

### 데이터 흐름

```
사용자 입력
    ↓
프로젝트 생성 (unified-core.createProject)
    ↓
실행 시작 (unified-core.startExecution)
    ↓
타이머 시작 (unified-core.startTimer)
    ↓
10단계 실행 (unified-core.executePhase)
    ├─ AI 모델 활성화
    ├─ 로그 추가 (10초마다)
    ├─ 진행도 업데이트
    └─ AI 모델 비활성화
    ↓
프로젝트 완료 (unified-core.completeProject)
    ↓
완료 모달 표시 (HTML/PDF 선택)
```

## 📝 문서 생성 프로세스

### 10단계 게이트 시스템

| 단계 | 게이트 | 담당 AI | 소요 시간 | 설명 |
|------|--------|---------|----------|------|
| G1 | 핵심 로직 구현 | Master Orchestrator | 3분 | 요구사항 분석, 구조 설계, 초안 작성 |
| G2 | API 서버 구축 | Code Agent | 4분 | 내용 검토, 중간 점검, 세부 작성 |
| G3 | UI 컴포넌트 개발 | Code Agent | 5분 | 품질 확인, 최종 검토, 문서 정리 |
| G4 | 시스템 통합 | Master Orchestrator | 3분 | 완료 확인 |
| G5 | 단위 테스트 작성 | Quality Agent | 4분 | 테스트 계획 수립 |
| G6 | 보안 스캔 수행 | Quality Agent | 2분 | 보안 검증 |
| G7 | 빌드 최적화 | DevOps Agent | 2분 | 최적화 검토 |
| G8 | 배포 준비 | DevOps Agent | 3분 | 배포 준비 확인 |
| G9 | 문서화 작업 | Code Agent | 2분 | 최종 문서 작성 |
| G10 | 최종 인수인계 | Master Orchestrator | 1분 | 완료 확인 및 제공 |

**총 소요 시간: 29분 (1,740초)**

### 각 단계별 세부 작업 (10초 단위)

1. 요구사항 분석 중
2. 구조 설계 중
3. 초안 작성 중
4. 내용 검토 중
5. 중간 점검 중
6. 세부 작성 중
7. 품질 확인 중
8. 최종 검토 중
9. 문서 정리 중
10. 완료 확인 중

## 🔧 기술 스택

- **Backend**: Hono (Edge Runtime)
- **Frontend**: Vanilla JavaScript (ES6 Modules)
- **Styling**: TailwindCSS (CDN)
- **Icons**: Font Awesome 6.4.0
- **Platform**: Cloudflare Pages
- **Language**: TypeScript + JSX

## 🌐 URL 정보

- **Sandbox URL**: https://3000-i5y2r8i7qfa5gukpxw2ov-a402f90a.sandbox.novita.ai
- **GitHub**: https://github.com/sungli01/plan-craft
- **Production**: (배포 후 업데이트 예정)

## 💾 데이터 모델

### Project 객체 구조

```javascript
{
  projectId: 'proj_1234567890_abc123',      // 고유 ID
  projectName: 'AI 쇼핑몰 기획서',          // 프로젝트 이름
  userIdea: '사용자가 상품을 검색하고...',  // 아이디어 설명
  outputFormat: 'html',                      // 출력 형식 (html/pdf)
  status: 'active',                          // 상태 (active/paused/completed/cancelled)
  currentPhase: 'G1_CORE_LOGIC',            // 현재 단계
  currentPhaseIndex: 0,                      // 현재 단계 인덱스 (0-9)
  progress: 45,                              // 진행도 (0-100%)
  startTime: 1738483200000,                  // 시작 시간 (timestamp)
  estimatedDuration: 1740,                   // 예상 소요 시간 (초)
  logs: []                                   // 로그 배열
}
```

### 상태 관리

- **projects**: Map<projectId, Project>
- **activeExecutions**: Map<projectId, ExecutionInfo>
- **timers**: Map<projectId, TimerInfo>

모든 상태는 `unified-core.js`에서 중앙 관리됩니다.

## 📖 사용 방법

### 1. 로컬 개발

```bash
# 의존성 설치
cd /home/user/webapp
npm install

# 빌드
npm run build

# 개발 서버 시작 (PM2)
pm2 start ecosystem.config.cjs

# 서비스 확인
curl http://localhost:3000

# 로그 확인
pm2 logs plan-craft --nostream
```

### 2. 프로젝트 생성

1. **Sandbox URL 접속**
2. **"새 프로젝트 시작" 섹션에서:**
   - 프로젝트 이름 입력
   - 아이디어 설명 입력
   - (선택) 참조 문서 업로드
   - 출력 형식 선택 (HTML/PDF)
3. **"문서 생성 시작" 버튼 클릭**

### 3. 진행 상황 확인

- **상단**: AI 에이전트 상태 (초록 점 = 대기, 파란 점 = 동작 중)
- **진행 중인 문서**: 
  - 프로젝트 카드 (최대 3개)
  - 프로그레스 바 (0-100%)
  - 경과 시간 / 남은 시간
- **빌드 로그**: 실시간 진행 상황 (HH:MM:SS 형식)
- **시스템 통계**: 전체/진행/정지/완료 개수

### 4. 프로젝트 제어

- **중지**: 일시 정지 (재개 기능 준비 중)
- **전체 취소**: 모든 프로젝트 취소 (되돌릴 수 없음)

### 5. 완료 및 다운로드

- 프로젝트 완료 시 자동 팝업
- HTML 또는 PDF 선택
- 다운로드 버튼 클릭

## 🧪 데모 모드

빠른 기능 확인을 위한 데모 모드 제공:

1. **"데모 모드 실행"** 버튼 클릭
2. 자동으로 샘플 프로젝트 생성
3. 전체 프로세스 시연

## ⚠️ 제한 사항

- 최대 동시 진행 프로젝트: **3개**
- 각 단계별 소요 시간: 고정 (1~5분)
- 실제 문서 생성 기능: 시뮬레이션 (백엔드 연동 필요)

## 🐛 알려진 문제

- ~~프로젝트 상태 동기화 문제~~ ✅ v4.0에서 해결
- ~~타이머 UI 업데이트 안됨~~ ✅ v4.0에서 해결
- ~~중지/취소 버튼 작동 안함~~ ✅ v4.0에서 해결
- 일부 취소 기능: 준비 중

## 🔜 개발 예정 기능

- [ ] 실제 AI API 연동 (Claude, GPT-4, Gemini)
- [ ] 프로젝트 재개 기능
- [ ] 일부 취소 기능
- [ ] 실제 문서 생성 및 다운로드
- [ ] Cloudflare D1 데이터베이스 연동
- [ ] 프로젝트 히스토리 저장
- [ ] 사용자 인증 시스템

## 📊 프로젝트 구조

```
webapp/
├── src/
│   ├── index.tsx           # Hono 서버 엔트리포인트
│   ├── renderer.tsx        # HTML 렌더러
│   └── api/
│       └── routes.ts       # API 라우트
├── public/
│   └── static/
│       ├── constants.js    # 공통 상수 (4.3 KB)
│       ├── unified-core.js # 통합 코어 시스템 (21.9 KB) ⭐
│       ├── app-v4.js       # 메인 애플리케이션 (7.6 KB) ⭐
│       ├── enhanced-tracking.js
│       ├── real-execution.js
│       └── aggressive-debug.js
├── dist/                   # 빌드 출력
│   ├── _worker.js          # Cloudflare Worker
│   └── _routes.json        # 라우팅 설정
├── ecosystem.config.cjs    # PM2 설정
├── wrangler.jsonc          # Cloudflare 설정
├── package.json
├── tsconfig.json
└── README.md               # 이 문서
```

## 📚 모듈 설명

### 1. unified-core.js (핵심 통합 시스템)

**단일 진실 공급원 (Single Source of Truth)**

- **프로젝트 관리**: `createProject()`, `startExecution()`, `stopProject()`, `cancelAllProjects()`
- **타이머 관리**: `startTimer()`, `stopTimer()`, `getElapsedTime()`, `getRemainingTime()`
- **UI 업데이트**: `updateAllUI()` (매초 자동 실행)
- **로그 시스템**: `addLog()` (레벨별 색상 코딩)
- **AI 모델 추적**: `activateAIModel()`, `deactivateAIModel()`
- **완료 처리**: `completeProject()`, `showCompletionModal()`, `downloadDocument()`

**장점:**
- 모든 상태가 하나의 객체에서 관리
- 동기화 문제 원천 차단
- 간단한 디버깅

### 2. app-v4.js (메인 애플리케이션)

**사용자 인터랙션 담당**

- 이벤트 핸들러 설정
- 파일 업로드 관리
- 프로젝트 생성 폼 처리
- 데모 모드 실행

### 3. constants.js (공통 상수)

**설정 중앙화**

- `PHASE_DURATION`: 각 단계별 소요 시간 (분)
- `PHASE_TO_MODEL`: 단계 → AI 모델 매핑
- `MODEL_TO_AGENT`: 모델 → 에이전트 이름 매핑
- `PHASE_TASKS`: 단계별 작업 설명
- `APP_CONFIG`: 앱 전역 설정 (MAX_PROJECTS, REFRESH_INTERVAL 등)

## 🔒 보안 고려사항

- 사용자 입력 HTML 이스케이프
- XSS 방지
- CORS 설정
- API 레이트 리미팅 (예정)

## 🚀 배포 정보

### Sandbox 환경

- **URL**: https://3000-i5y2r8i7qfa5gukpxw2ov-a402f90a.sandbox.novita.ai
- **포트**: 3000
- **PM2**: 실행 중
- **상태**: ✅ Active

### Production 배포 (예정)

```bash
# Cloudflare Pages 배포
npm run build
wrangler pages deploy dist --project-name plan-craft
```

## 🤝 기여 가이드

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

MIT License

## 📞 문의

- GitHub: https://github.com/sungli01/plan-craft
- Issues: https://github.com/sungli01/plan-craft/issues

## 🎉 변경 이력

### v4.0 (2026-02-02) - UNIFIED CORE REWRITE

**완전 재작성:**
- ✅ 통합 코어 시스템 (unified-core.js)
- ✅ 1초 단위 정확한 타이머
- ✅ 실시간 UI 업데이트 (매초)
- ✅ 프로젝트 상태 동기화 보장
- ✅ AI 모델 애니메이션 및 추적
- ✅ 빌드 로그 시간 명확화 (HH:MM:SS)
- ✅ 10초마다 상세 단계 설명
- ✅ 프로젝트 완료 팝업 (HTML/PDF 선택)
- ✅ 중지/취소 버튼 정상 작동
- ✅ 문서 작성 목적 명확화

### v3.1 (2026-02-01)

- 모듈형 아키텍처 (7개 모듈)
- 실행 엔진 분리
- 실시간 타이머 모듈

### v3.0 (2026-01-31)

- UI 완전 재설계
- 최대 3개 동시 프로젝트 지원
- AI 에이전트 상태 바 추가

---

**Plan-Craft v4.0 - Document Generation System**
*아이디어를 문서로, 문서를 현실로* 📋✨
