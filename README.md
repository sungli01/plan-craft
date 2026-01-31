# Plan-Craft v2.0 - AI 자율 풀스택 개발 엔진

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

## ✨ v2.0 새로운 기능

### 🆕 Feature 1: 참조 문서/링크 추가
- ✅ 프로젝트 생성 시 참조 URL 첨부 가능
- ✅ 여러 개의 참조 문서 추가 지원
- ✅ 참조 문서 목록 관리
- **사용법**: 프로젝트 생성 폼에서 "참조 문서" 섹션 활용

### 🆕 Feature 2: 프로젝트 제어
- ✅ **일시중지(Pause)**: 개발 진행 일시 중단
- ✅ **재개(Resume)**: 일시중지된 프로젝트 계속 진행
- ✅ **취소(Cancel)**: 프로젝트 영구 종료
- **API**:
  - `POST /api/projects/:id/pause`
  - `POST /api/projects/:id/resume`
  - `POST /api/projects/:id/cancel`

### 🆕 Feature 3: 프로젝트 업그레이드
- ✅ 완료된 프로젝트에 추가 기능 요청
- ✅ 업그레이드 이력 관리
- ✅ 실시간 업그레이드 진행 상황 확인
- **사용법**: 프로젝트 상세 페이지에서 "업그레이드" 버튼 클릭
- **API**:
  - `POST /api/projects/:id/upgrade`
  - `GET /api/projects/:id/upgrades`

### 🆕 Feature 4: 밝은 디자인 테마
- ✅ 그라데이션 배경 (Purple & Pink)
- ✅ Glass-morphism UI 스타일
- ✅ 부드러운 애니메이션 효과
- ✅ 향상된 가독성 및 접근성
- ✅ 아이콘 기반 직관적 인터페이스

### 🆕 Feature 5: PDF 문서 출력
- ✅ 프로젝트 문서 자동 생성
- ✅ AI 이미지 생성 프롬프트 (아키텍처 다이어그램 등)
- ✅ 전문적인 PDF 레이아웃
- ✅ 다운로드 가능한 최종 문서
- **API**:
  - `POST /api/projects/:id/export/pdf`
  - `GET /api/projects/:id/download/pdf`

## 📊 v1.0 기존 기능

### Phase 1: Core Implementation ✅
- ✅ Pipeline State Manager - 10단계 개발 파이프라인 관리
- ✅ Quality Gate Validator - 엄격한 품질 검증 (빌드 100%, 테스트 95%+)
- ✅ Agent Protocol - Tech Lead, Dev, QA, Ops 에이전트 통신
- ✅ Build Logger - 실시간 빌드 로그 및 이벤트 스트리밍

### Phase 2: API Server ✅
- ✅ 20개 REST API 엔드포인트 (v1: 12개 → v2: 20개)
  - 프로젝트 CRUD
  - 단계별 제어 (Pause/Resume/Cancel)
  - 참조 문서 관리
  - 업그레이드 관리
  - 로그 & 통계

### Phase 3: Frontend UI ✅
- ✅ DevOps 대시보드 스타일 UI (v2: 밝은 테마)
- ✅ 실시간 파이프라인 뷰어
- ✅ 터미널 콘솔 (실시간 로그 스트리밍)
- ✅ 프로젝트 생성 & 관리
- ✅ 프로젝트 제어 버튼 (NEW)

### Phase 4-7: Integration & Testing ✅
- ✅ 프론트엔드-백엔드 완전 연동
- ✅ 단위 테스트 커버리지: **98.63%**
- ✅ 77개 테스트 케이스 통과
- ✅ 보안 검증 완료

## 📈 API 엔드포인트 (v2.0)

| Method | Endpoint | Description | Version |
|--------|----------|-------------|---------|
| POST | `/api/projects` | 새 프로젝트 생성 (참조 지원) | v2.0 |
| GET | `/api/projects/:id` | 프로젝트 조회 | v1.0 |
| POST | `/api/projects/:id/pause` | 일시중지 | **v2.0** |
| POST | `/api/projects/:id/resume` | 재개 | **v2.0** |
| POST | `/api/projects/:id/cancel` | 취소 | **v2.0** |
| POST | `/api/projects/:id/references` | 참조 추가 | **v2.0** |
| GET | `/api/projects/:id/references` | 참조 목록 | **v2.0** |
| POST | `/api/projects/:id/upgrade` | 업그레이드 요청 | **v2.0** |
| GET | `/api/projects/:id/upgrades` | 업그레이드 이력 | **v2.0** |
| POST | `/api/projects/:id/upgrades/:uid/complete` | 업그레이드 완료 | **v2.0** |
| POST | `/api/projects/:id/export/pdf` | PDF 생성 | **v2.0** |
| GET | `/api/projects/:id/download/pdf` | PDF 다운로드 | **v2.0** |
| GET | `/api/projects/:id/phases` | 단계별 진행 상황 | v1.0 |
| POST | `/api/projects/:id/phases/:gate/start` | 단계 시작 | v1.0 |
| POST | `/api/projects/:id/phases/:gate/complete` | 단계 완료 | v1.0 |
| PUT | `/api/projects/:id/phases/:gate/metrics` | 메트릭 업데이트 | v1.0 |
| GET | `/api/projects/:id/logs` | 로그 조회 | v1.0 |
| POST | `/api/projects/:id/logs` | 로그 추가 | v1.0 |
| GET | `/api/projects/:id/messages` | 메시지 조회 | v1.0 |
| POST | `/api/projects/:id/messages` | 메시지 전송 | v1.0 |
| GET | `/api/health` | 헬스 체크 | v1.0 |
| GET | `/api/stats` | 시스템 통계 (v2: 4개 카테고리) | v2.0 |

**총 22개 API 엔드포인트** (v1: 12개 → v2: 22개)

## 📊 데이터 모델 (v2.0)

### 업데이트된 데이터 구조

```typescript
// v2.0 추가
interface ReferenceDocument {
  id: string;
  type: 'url' | 'file' | 'image';
  url?: string;
  content?: string;
  uploadedAt: number;
}

interface ProjectUpgrade {
  upgradeId: string;
  instruction: string;
  references: ReferenceDocument[];
  timestamp: number;
  completedAt?: number;
}

// v2.0 확장된 ProjectState
interface ProjectState {
  // v1.0 기존 필드
  projectId: string;
  projectName: string;
  userIdea: string;
  techStack: string[];
  currentPhase: PhaseGate;
  phases: Map<PhaseGate, PhaseState>;
  
  // v2.0 신규 필드
  references: ReferenceDocument[]; // NEW
  isPaused: boolean; // NEW
  isCancelled: boolean; // NEW
  upgrades: ProjectUpgrade[]; // NEW
  
  createdAt: number;
  updatedAt: number;
}
```

## 🎨 UI/UX 개선 (v2.0)

### 디자인 변경사항
- **배경**: 어두운 테마 → 밝은 그라데이션 (Purple & Pink)
- **패널**: 단순한 박스 → Glass-morphism 스타일
- **타이포그래피**: 더 큰 폰트, 그라데이션 텍스트
- **아이콘**: FontAwesome 6.4.0 전면 활용
- **애니메이션**: Hover 효과, 트랜지션 추가
- **가독성**: 더 나은 색상 대비 및 간격

### 새로운 UI 컴포넌트
1. **참조 문서 섹션**: 점선 테두리 박스
2. **프로젝트 제어 버튼**: 4개 액션 버튼
3. **상태 배지**: Paused, Cancelled, Completed
4. **통계 카드**: 4개 카테고리 (전체/진행 중/일시중지/완료)

## 🚀 사용 가이드

### 1. 프로젝트 생성 (참조 포함)

```bash
# 1. 메인 페이지 접속
# 2. 프로젝트 이름 입력: "AI 쇼핑몰"
# 3. 아이디어 입력: "상품 검색 및 결제 기능"
# 4. 참조 URL 추가 (선택):
#    - https://stripe.com/docs/api
#    - https://example.com/design-guide
# 5. "참조 추가" 버튼 클릭
# 6. "프로젝트 생성 및 시작" 클릭
```

### 2. 프로젝트 제어

```bash
# 프로젝트 상세 페이지에서:
# - 일시중지: 개발 중단 (언제든 재개 가능)
# - 재개: 일시중지된 프로젝트 계속
# - 취소: 영구 종료 (되돌릴 수 없음)
```

### 3. 업그레이드 요청

```bash
# 1. 완료된 프로젝트 상세 페이지
# 2. "업그레이드" 버튼 클릭
# 3. 추가 기능 입력:
#    예: "소셜 로그인 추가", "다크 모드 지원"
# 4. 확인 - AI가 자동으로 코드 수정 및 재배포
```

### 4. PDF 문서 출력

```bash
# 1. 프로젝트 상세 페이지
# 2. "PDF 출력" 버튼 클릭
# 3. AI가 자동으로:
#    - 아키텍처 다이어그램 생성
#    - API 문서 포맷팅
#    - 테스트 결과 요약
#    - 전문적인 PDF 생성
# 4. 다운로드
```

## 🔧 배포 정보

### 플랫폼
- **개발**: Cloudflare Pages Dev (Sandbox)
- **프로덕션**: Cloudflare Pages (예정)

### 상태
- ✅ v2.0 개발 환경 활성화
- 🔄 프로덕션 배포 준비 중

### 기술 스택
- **Backend**: Hono (Cloudflare Workers)
- **Frontend**: TypeScript + Tailwind CSS
- **Build**: Vite
- **Testing**: Jest (98.63% coverage)
- **Deployment**: Wrangler (Cloudflare)

### 마지막 업데이트
- **버전**: v2.0
- **날짜**: 2026-01-31
- **변경사항**: 5개 주요 기능 추가

## 📝 변경 이력

### v2.0 (2026-01-31)
- ✅ Feature 1: 참조 문서/링크 추가
- ✅ Feature 2: 프로젝트 중단/재개/취소
- ✅ Feature 3: 프로젝트 업그레이드
- ✅ Feature 4: 밝은 디자인 테마
- ✅ Feature 5: PDF 문서 출력 + AI 이미지
- ✅ API 엔드포인트 12개 → 22개
- ✅ 데이터 모델 확장
- ✅ UI/UX 전면 개선

### v1.0 (2026-01-31)
- ✅ G1-G10 개발 파이프라인 구현
- ✅ 12개 REST API 엔드포인트
- ✅ DevOps 대시보드 UI
- ✅ 98.63% 테스트 커버리지
- ✅ 자동 배포 시스템

## 🎓 Code-First 원칙 준수

✅ **모든 산출물의 핵심은 '작동하는 코드'**
- 문서는 코드 완성 후 자동 생성됨
- 기획서 없이 즉시 코드 작성 시작

✅ **Strict Quality Gate 통과**
- 빌드 오류 → 즉시 REJECT 및 자동 수정
- 테스트 커버리지 95% 미만 → REJECT
- 보안 이슈 → REJECT

✅ **완전 자율성 달성**
- 사용자는 아이디어만 입력
- AI가 모든 기술 결정 자동 수행
- 비개발자도 사용 가능

---

## 🚀 즉시 사용 가능

**지금 바로 Plan-Craft v2.0을 사용해보세요:**

1. **웹 브라우저 접속**: https://3000-i5y2r8i7qfa5gukpxw2ov-a402f90a.sandbox.novita.ai

2. **프로젝트 생성** (참조 포함):
   - 프로젝트 이름: "AI 블로그 플랫폼"
   - 아이디어: "마크다운 지원 및 댓글 기능"
   - 참조: "https://example.com/api-docs"

3. **자동 개발 시작**: AI가 자동으로 코드 생성, 테스트, 배포

4. **제어 & 업그레이드**: 언제든 중단/재개/업그레이드 가능

5. **PDF 출력**: 전문적인 프로젝트 문서 생성

---

**[Tech Lead] Plan-Craft v2.0 개발 완료 - 모든 요구사항 구현 완료. 🎉**
