# Plan-Craft 배포 가이드

## 로컬 개발 환경

### 사전 요구사항
- Node.js 18+ 
- npm 10+
- PM2 (글로벌 설치 권장)

### 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 빌드
npm run build

# 3. 포트 정리 (필요시)
fuser -k 3000/tcp 2>/dev/null || true

# 4. 개발 서버 시작
pm2 start ecosystem.config.cjs

# 5. 서비스 확인
curl http://localhost:3000/api/health

# 6. 로그 확인
pm2 logs plan-craft --nostream
```

### 테스트 실행

```bash
# 단위 테스트 실행
npm run test

# 커버리지 리포트
npm run test:coverage
```

## Cloudflare Pages 배포

### 사전 준비

1. **Cloudflare 계정 생성**
   - https://dash.cloudflare.com 에서 계정 생성

2. **API 토큰 발급**
   - Cloudflare Dashboard → My Profile → API Tokens
   - "Edit Cloudflare Workers" 템플릿 사용
   - 토큰 복사 및 안전하게 보관

3. **Wrangler 설정**
   ```bash
   # 토큰 설정
   export CLOUDFLARE_API_TOKEN="your-api-token"
   
   # 또는 wrangler login 사용
   npx wrangler login
   ```

### 배포 단계

```bash
# 1. 빌드
npm run build

# 2. Pages 프로젝트 생성 (최초 1회)
npx wrangler pages project create plan-craft \
  --production-branch main

# 3. 배포
npm run deploy

# 또는 프로젝트 이름 지정 배포
npm run deploy:prod
```

### 배포 후 확인

```bash
# 배포 URL 확인 (출력 결과에서 확인)
# 예: https://plan-craft.pages.dev

# 헬스 체크
curl https://plan-craft.pages.dev/api/health

# API 테스트
curl https://plan-craft.pages.dev/api/stats
```

## 환경 변수 설정

### 로컬 개발

`.dev.vars` 파일 생성:
```env
# 필요한 환경 변수 추가
NODE_ENV=development
```

### 프로덕션 (Cloudflare)

```bash
# Wrangler를 통한 시크릿 설정
npx wrangler pages secret put API_KEY --project-name plan-craft

# 시크릿 목록 확인
npx wrangler pages secret list --project-name plan-craft
```

## 트러블슈팅

### 빌드 실패

```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 정리
rm -rf dist .wrangler
npm run build
```

### 포트 충돌

```bash
# 포트 3000 사용 프로세스 종료
fuser -k 3000/tcp

# 또는 PM2 프로세스 재시작
pm2 delete plan-craft
pm2 start ecosystem.config.cjs
```

### 배포 오류

```bash
# Wrangler 재인증
npx wrangler logout
npx wrangler login

# 프로젝트 재배포
npm run build
npm run deploy
```

## 모니터링

### PM2 모니터링

```bash
# 프로세스 목록
pm2 list

# 실시간 로그
pm2 logs plan-craft

# 메모리 사용량
pm2 monit

# 프로세스 재시작
pm2 restart plan-craft
```

### Cloudflare 모니터링

- Cloudflare Dashboard → Pages → plan-craft
- Analytics 탭에서 트래픽, 에러 확인
- Real-time Logs에서 실시간 로그 확인

## 프로덕션 체크리스트

- [ ] 모든 테스트 통과 (npm test)
- [ ] 빌드 성공 (npm run build)
- [ ] 로컬 테스트 완료 (pm2 start)
- [ ] API 엔드포인트 동작 확인
- [ ] 환경 변수 설정 완료
- [ ] README.md 업데이트
- [ ] Git 커밋 및 태그 생성
- [ ] Cloudflare 배포 성공
- [ ] 프로덕션 URL 테스트
- [ ] 모니터링 설정 완료

## 지원

문제가 발생하면:
1. 로그 확인 (`pm2 logs` 또는 Cloudflare Dashboard)
2. GitHub Issues에 문제 등록
3. README.md의 API 문서 참조

---

**Plan-Craft** - Code-First AI Development Engine
