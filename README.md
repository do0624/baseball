# baseball

스프링 부트와 리액트를 활용한 야구 기록과 게임을 포함한 웹 어플리케이션

## 프로젝트 구조

```
baseball/
├── backend/      # 스프링 부트 백엔드 프로젝트
│   ├── build.gradle (or pom.xml)
│   └── src/
│       ├── main/
│       │   ├── java/com/baseball/
│       │   │   ├── config/         # Security, CORS 등 설정 클래스
│       │   │   ├── controller/     # API 엔드포인트 정의
│       │   │   ├── dto/            # 데이터 전송 객체
│       │   │   ├── entity/         # JPA 엔티티
│       │   │   ├── repository/     # 데이터베이스 접근
│       │   │   ├── service/        # 비즈니스 로직
│       │   │   └── util/           # 유틸리티 클래스
│       │   └── resources/
│       │       └── application.yml # 설정 파일
│       └── test/
│           └── java/com/baseball/
│               ├── service/
│               └── controller/
│
└── frontend/     # 리액트 프론트엔드 프로젝트
    ├── public/
    │   └── index.html
    └── src/
        ├── api/            # API 호출 함수
        ├── assets/         # 정적 자원
        ├── components/     # UI 컴포넌트
        ├── hooks/          # 커스텀 훅
        ├── pages/          # 라우팅 페이지
        ├── store/          # 상태 관리
        ├── styles/         # 스타일 파일
        ├── App.js          # 메인 컴포넌트
        └── index.js        # 진입점
```

## 개발 환경

- 백엔드: Java 11+, Spring Boot 2.7.x, Gradle 7.5+
- 프론트엔드: Node.js 16+, React 18+, npm 8+
- 데이터베이스: MySQL

## 시작하기

### 1. 백엔드 실행

```bash
# 백엔드 디렉토리로 이동
cd backend

# 의존성 설치 및 빌드
./gradlew build

# 애플리케이션 실행
./gradlew bootRun
```

백엔드는 기본적으로 `http://localhost:8080`에서 실행됩니다.

### 2. 프론트엔드 실행

```bash
# 프론트엔드 디렉토리로 이동
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```
프론트엔드는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## API 문서

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- API 문서: `http://localhost:8080/v3/api-docs`

## 주요 기능

- 실시간 경기 기록
- 선수 및 팀 통계 조회
- 기록 분석 대시보드
- 성적 기반 모의 야구 게임

## 개발 가이드

### 백엔드

1. `application.yml`에서 데이터베이스 설정을 확인하세요.
2. 엔티티 클래스는 `entity` 패키지에 작성합니다.
3. API 엔드포인트는 `controller` 패키지에 REST 컨트롤러로 구현합니다.
4. 비즈니스 로직은 `service` 패키지에 구현합니다.

### 프론트엔드

1. API 호출은 `api` 디렉토리의 모듈을 사용하세요.
2. 재사용 가능한 컴포넌트는 `components` 디렉토리에 작성하세요.
3. 페이지 컴포넌트는 `pages` 디렉토리에 작성하세요.
