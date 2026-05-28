# AFX API Tester

백엔드 API 엔드포인트를 브라우저에서 빠르게 시험하는 간단한 React UI입니다.

## 사전 조건

- 백엔드 서버가 실행 중이어야 합니다 (`npm run dev`, 기본 포트 `8080`)
- CORS: 백엔드 `.env`의 `CORS_ORIGIN`이 `http://localhost:3000`이거나 미설정(기본값)이어야 합니다

## 실행

```bash
cd front
npm install
npm run dev
```

브라우저에서 http://localhost:3000 을 엽니다.

## 시험 가능한 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/health` | 서버 상태 |
| GET | `/api-docs` | API 문서 (버튼으로 새 탭) |
| POST | `/api/users/register` | 회원가입 |
| POST | `/api/users/login` | 로그인 (토큰 자동 저장) |
| GET | `/api/users/me` | 내 프로필 (JWT 필요) |

## 사용 순서

1. **Health** 로 서버 연결 확인
2. **Register** 로 계정 생성
3. **Login** 으로 토큰 발급 (자동 저장)
4. **Me** 로 프로필 조회
