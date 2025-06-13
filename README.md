# 비욘드 오더 허브 (Beyond Order Hub)

통합 주문 관리 시스템 - 전자상거래 플랫폼을 위한 종합 대시보드

## 🚀 Live Demo

**프론트엔드**: https://beyondworks.github.io/beyond-order-hub-frontend/
**백엔드 API**: https://beyond-order-hub-backend.onrender.com

## 📋 주요 기능

- 사용자 인증 및 권한 관리 (JWT 기반)
- 상품 관리 및 재고 추적
- 주문 처리 및 배송 관리
- 반품/교환 처리
- 플랫폼 설정 및 3PL 연동
- 에러 로그 모니터링
- 대시보드 및 분석

## 🛠 기술 스택

**Frontend:**
- React + TypeScript
- Vite
- PWA 지원

**Backend:**
- NestJS + TypeScript
- PostgreSQL
- JWT Authentication

## 🏃‍♂️ 로컬 실행

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables in [.env.local](.env.local):
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

## 🚀 배포

GitHub Actions를 통해 자동 배포됩니다:
- `main` 브랜치에 push 시 자동으로 GitHub Pages에 배포
- 백엔드는 Render에서 호스팅

## 📁 프로젝트 구조

```
├── src/
│   ├── components/     # React 컴포넌트
│   ├── pages/         # 페이지 컴포넌트
│   ├── services/      # API 서비스
│   └── types.ts       # TypeScript 타입 정의
├── boh-backend/       # NestJS 백엔드
└── dist/             # 빌드 결과물
```
