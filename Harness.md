# 협업 프로젝트 시작 가이드

### AI 에이전트와 함께하는 web(React) + api(Spring Boot/MyBatis) 팀 프로젝트

> **이 문서의 목적**
우리는 두 개의 Git 레포지토리(web · api)를 AI 에이전트(Claude Code, Cursor 등)의 도움을 받아 팀으로 개발한다.
이 가이드는 **① 협업 환경을 어떻게 준비하고 → ② 어떤 규칙으로 일하고 → ③ 실제 코드는 어떻게 생기는지**를 한 번에 보여준다.
처음 보는 사람은 위에서 아래로 순서대로 읽으면 된다.
> 

---

## 📑 목차

- **Part 1. 협업의 큰 그림** — 왜 공통 규칙 파일이 필요한가
- **Part 2. 환경 준비** — 레포 구조와 만들어야 할 파일들
- **Part 3. Harness 파일 작성** — AGENTS.md / CLAUDE.md / API-CONTRACT
- **Part 4. 협업 규칙** — Git 브랜치 · 커밋 · PR
- **Part 5. AI 에이전트와 일하는 법** — 작업 4단계 사이클
- **Part 6. 실전 코드** — MyBatis 로그인 기능 전체
- **부록.** 시연 시나리오 · 최종 체크리스트

---

---

# Part 1. 협업의 큰 그림

## 1-1. AI 에이전트는 "약속된 파일"을 읽는다

AI 에이전트(Claude Code, Cursor, Copilot 등)는 레포를 열 때 **정해진 위치의 마크다운 파일을 자동으로 읽어** 이 프로젝트의 규칙을 파악한다. 사람에게 README를 주듯, 에이전트에게는 "에이전트용 README"를 준다. 이 파일이 **harness(하네스) 파일**이다.

표준이 두 갈래다.

| 파일 | 누가 읽나 | 설명 |
| --- | --- | --- |
| **AGENTS.md** | Codex, Copilot, Cursor, Gemini, Aider 등 거의 전부 | 사실상의 범용 오픈 표준 (2025~) |
| **CLAUDE.md** | Claude Code | Claude 전용 |

> ✅ **핵심 원칙**: 규칙 내용은 **AGENTS.md 한 곳에만** 쓰고, CLAUDE.md는 그걸 가리키게 만든다.
그래야 여러 파일에 비슷한 내용이 흩어져 조금씩 어긋나는 사고를 막는다.
> 

## 1-2. 우리 프로젝트 구조 = 폴리레포(polyrepo)

```
project/          ← 그냥 묶어둔 로컬 폴더 (git 아님)
├── web/          ← GitHub 레포 A (React)
└── api/          ← GitHub 레포 B (Spring Boot + MyBatis)
```

여기서 반드시 이해할 두 가지:

1. **에이전트는 자기가 열린 레포만 본다.** `web/`에서 켜면 백엔드 코드를 못 본다.
→ 그래서 **API 명세를 web 레포 안에도 복사**해 둔다.
2. **두 레포는 따로지만 규칙은 똑같아야 한다.** 커밋·브랜치 같은 공통 규칙은 양쪽 AGENTS.md에 동일하게 넣는다.

---

---

# Part 2. 환경 준비 — 파일 배치

각 레포에 아래처럼 파일을 만든다.

```
web/
├── AGENTS.md              ← 프론트 규칙 (에이전트가 읽음)
├── CLAUDE.md              ← "@AGENTS.md 읽어라" 한 줄
├── docs/API-CONTRACT.md   ← 백엔드와 합의한 API 명세 (복사본)
└── README.md              ← 사람용

api/
├── AGENTS.md              ← 백엔드 규칙
├── CLAUDE.md              ← "@AGENTS.md 읽어라" 한 줄
├── docs/API-CONTRACT.md   ← 동일한 API 명세 (원본)
└── README.md
```

CLAUDE.md는 이 한 줄이면 된다.

```markdown
이 프로젝트의 규칙은 @AGENTS.md 를 따른다.
```

---

---

# Part 3. Harness 파일 작성

> 작성 원칙: **명령어를 맨 앞에**, **버전은 명시적으로 못박고**, **150~200줄을 넘기지 않는다.**
> 

## 3-1. `web/AGENTS.md` (React)

```markdown
# AGENTS.md — Web (React)

## 실행 명령어
- 설치: `npm install`
- 개발 서버: `npm run dev`
- 빌드: `npm run build`
- 린트: `npm run lint`
> 작업을 끝내기 전 `npm run lint`와 `npm run build`가 통과해야 한다.

## 기술 스택 (버전 고정)
- React 19 + Vite
- react-router-dom v7 (라우팅)
- TanStack Query v5 (서버 상태)
- Zustand (클라이언트 전역 상태)
- axios (HTTP)
> 위 버전의 API만 사용한다. 구버전 문법을 쓰지 말 것.

## 폴더 구조
- `src/pages/` — 라우트 단위 페이지
- `src/components/` — 재사용 컴포넌트
- `src/api/` — axios 인스턴스 및 API 호출 함수
- `src/stores/` — Zustand 스토어
- `src/hooks/` — 커스텀 훅

## 코딩 컨벤션
- 컴포넌트 파일/이름: PascalCase (예: LoginForm.jsx)
- 함수/변수: camelCase
- API 호출은 반드시 src/api/ 안의 함수를 통해서만 (컴포넌트에서 직접 fetch 금지)
- 서버 데이터는 TanStack Query로만 관리한다

## 백엔드 연동
- API 명세는 docs/API-CONTRACT.md를 단일 기준으로 삼는다
- baseURL: 환경변수 VITE_API_BASE_URL
- 인증: 보호 요청에 Authorization: Bearer <accessToken> 헤더

## 공통 규칙 (api 레포와 동일) — Part 4 참조

## 에이전트 행동 규칙
- 한 번에 하나의 작업 단위만 수정한다
- 새 라이브러리 추가 전 먼저 물어본다
- .env / 시크릿을 만지지 않는다
- 작업 후 변경 요약을 3줄 이내로 보고한다
```

## 3-2. `api/AGENTS.md` (Spring Boot + MyBatis)

```markdown
# AGENTS.md — API (Spring Boot)

## 실행 명령어
- 빌드: `./gradlew build`
- 실행: `./gradlew bootRun`
- 테스트: `./gradlew test`
> 작업 종료 전 `./gradlew test`가 통과해야 한다.

## 기술 스택 (버전 고정)
- Java 21 + Spring Boot 4.x
- Spring Security 6 + JWT (jjwt 0.12.x — 0.11 이하 deprecated API 금지)
- 데이터 접근: MyBatis (mybatis-spring-boot-starter 3.x) + MySQL 8
- 빌드: Gradle
> JPA(Spring Data JPA, @Entity, JpaRepository)를 절대 사용하지 않는다.
> SQL은 직접 작성하며 ORM 자동 쿼리에 의존하지 않는다.

## 패키지 구조 (도메인형)
- domain/user/
  - controller/  — UserController
  - service/     — UserService
  - mapper/      — UserMapper (인터페이스, @Mapper)
  - dto/         — 요청/응답 DTO
  - entity/      — DB 행 매핑 클래스 (순수 POJO, JPA 아님)
- global/        — 공통 설정, 예외처리, 응답 포맷
- SQL XML: src/main/resources/mapper/UserMapper.xml
> entity는 DB 행을 담는 순수 자바 클래스다. @Entity·@Id·@Column 등 JPA 어노테이션 금지.
> Mapper 인터페이스와 XML의 namespace/메서드명/id는 정확히 일치시킨다.

## MyBatis 규칙 (반드시 지킬 것)
- SQL은 XML Mapper에 작성한다 (간단한 단건만 어노테이션 허용)
- 파라미터 바인딩은 #{} 만 사용한다 (${} 는 SQL 인젝션 위험 — 원칙적으로 금지)
- snake_case ↔ camelCase 자동 매핑 사용
  → application.yml: mybatis.configuration.map-underscore-to-camel-case: true
- 컬럼/별칭이 복잡하면 <resultMap>을 명시한다
- 조건/반복은 <if>, <foreach>, <choose> 동적 SQL로 처리한다
- 비즈니스 로직은 Service에, Mapper는 순수 데이터 접근만 담당

## 코딩 컨벤션
- entity(DB 행)와 응답 DTO를 분리한다 (DB 구조를 그대로 API에 노출 금지)
- Controller는 얇게, 트랜잭션은 Service에 @Transactional로 건다

## API 응답 규약
- 성공: { "success": true, "data": {...} }
- 실패: { "success": false, "error": { "code": "...", "message": "..." } }
- 명세는 docs/API-CONTRACT.md를 단일 기준으로 삼고, 변경 시 이 파일을 먼저 수정한다

## 공통 규칙 (web 레포와 동일) — Part 4 참조

## 에이전트 행동 규칙
- DB 스키마/테이블 변경은 먼저 보고하고 승인받는다
- application.yml의 시크릿/DB 비밀번호를 만지지 않는다
- 한 번에 하나의 도메인만 작업한다
- SQL을 작성하면 어떤 쿼리를 왜 그렇게 짰는지 한 줄로 설명한다
```

## 3-3. `docs/API-CONTRACT.md` (양쪽 레포에 동일하게)

> **프론트와 백엔드가 동시에 일하려면, 코드보다 "약속"을 먼저 만든다.**
이 명세가 있으면 백엔드가 안 끝나도 프론트는 화면을 먼저 만들 수 있다.
> 

```markdown
# API CONTRACT v1

## POST /api/auth/login
요청: { "email": "string", "password": "string" }
응답(200): { "success": true, "data": { "accessToken": "string", "user": {...} } }
실패(401): { "success": false, "error": { "code": "INVALID_CREDENTIALS", "message": "..." } }

## GET /api/users/me  (인증 필요)
헤더: Authorization: Bearer <accessToken>
응답(200): { "success": true, "data": { "id": 1, "email": "...", "name": "..." } }
```

> 🔑 **철칙: "명세를 먼저 고치고, 그다음 코드를 고친다."**
> 

---

---

# Part 4. 협업 규칙 (공통)

> 아래 내용을 **web · api 양쪽 AGENTS.md에 똑같이** 넣는다.
> 

```markdown
## 공통 협업 규칙

### 브랜치 전략 (GitHub Flow)
- main 브랜치는 항상 동작하는 상태로 유지 (직접 push 금지)
- 모든 작업은 feature 브랜치 → PR로 머지
- 브랜치 이름: feat/login, fix/token-expire, docs/readme

### 커밋 메시지 (Conventional Commits)
- 형식: type: 한 줄 요약
- type: feat / fix / docs / refactor / test / chore
- 예: "feat: 로그인 API 연동", "fix: 토큰 만료 시 401 처리"

### PR 규칙
- PR 제목도 커밋 규칙을 따른다
- 본문에 "무엇을 / 왜 / 어떻게 테스트했는지" 작성
- 최소 1명 리뷰 승인 후 머지
- 자기 코드는 자기가 머지하지 않는다 (리뷰어가 머지)
```

> 💡 GitHub 저장소 설정에서 **main 브랜치 보호(직접 push 금지)** 를 켜두면 사고를 예방한다.
> 

---

---

# Part 5. AI 에이전트와 일하는 4단계 사이클

에이전트는 **대신 일해주는 사람이 아니라 페어 프로그래밍 짝꿍**이다. 아래 루프를 반복한다.

| 단계 | 할 일 | 예시 |
| --- | --- | --- |
| **① 컨텍스트 로드** | 작업 시작 시 명세를 같이 읽게 한다 | "AGENTS.md와 API-CONTRACT.md를 읽고 시작해" |
| **② 작은 단위 지시** | 기능 전체(❌)가 아니라 작은 단위(✅)로 | "API-CONTRACT의 /login 명세대로 AuthService.login()을 만들어줘" |
| **③ 사람이 검증** | 코드를 직접 읽고 lint/build/test 실행 | 그대로 믿지 않는다 |
| **④ 커밋 & PR** | 규칙대로 커밋 → PR 올림 | PR 본문에서 에이전트에게 셀프 리뷰도 시킬 수 있다 |

---

---

# Part 6. 실전 코드 — MyBatis 로그인 기능

> 지금까지의 규칙이 **실제 코드에서 어떻게 드러나는지** 로그인 기능 하나로 끝까지 따라가 본다.
> 

## 6-0. 전체 흐름

```
[Controller] POST /api/auth/login (@Valid LoginRequest)
     │
     ▼
[Service]    AuthService.login()
     │  ① userMapper.findByEmail(email)
     ▼
[Mapper]     UserMapper(인터페이스) → UserMapper.xml(SQL #{email}) → DB
     │  ② passwordEncoder.matches(평문, 해시)
     │  ③ jwtTokenProvider.createAccessToken(...)
     ▼
[Service]    LoginResponse(accessToken, UserResponse) 반환
     │
     ▼
[Controller] ApiResponse.success(...)로 감싸서 응답
```

## 6-1. 테이블 (MySQL)

```sql
CREATE TABLE users (
    id          BIGINT       PRIMARY KEY AUTO_INCREMENT,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,          -- BCrypt 해시 저장
    name        VARCHAR(50)  NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (email, password, name, role)
VALUES ('test@test.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- 평문 1234
        '홍길동', 'USER');
```

## 6-2. 설정 — `application.yml`

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/home_db?serverTimezone=Asia/Seoul
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver

mybatis:
  mapper-locations: classpath:mapper/*.xml          # XML 위치
  type-aliases-package: com.example.api.domain       # resultType 짧게 쓰기
  configuration:
    map-underscore-to-camel-case: true               # created_at -> createdAt 자동 매핑

jwt:
  secret: ${JWT_SECRET:please-change-this-secret-to-at-least-32-bytes-long}
  access-token-validity-ms: 1800000                  # 30분
```

> ⚠️ `map-underscore-to-camel-case: true`를 빼면 createdAt이 null로 들어온다. 반드시 켤 것.
> 

## 6-3. build.gradle 의존성 (핵심)

```
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-validation'

    // MyBatis (JPA starter는 넣지 않는다!)
    implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.4'
    runtimeOnly 'com.mysql:mysql-connector-j'

    // JWT (jjwt 0.12.x)
    implementation 'io.jsonwebtoken:jjwt-api:0.12.6'
    runtimeOnly  'io.jsonwebtoken:jjwt-impl:0.12.6'
    runtimeOnly  'io.jsonwebtoken:jjwt-jackson:0.12.6'

    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
}
```

## 6-4. entity — `User.java`

```java
package com.example.api.domain.user.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * users 테이블의 한 행을 담는 순수 자바 클래스(POJO).
 * ⚠️ JPA의 @Entity가 아니다. @Entity·@Id·@Column 등 JPA 어노테이션을 붙이지 않는다.
 * MyBatis가 resultType으로 이 클래스에 값을 채운다(기본 생성자 + setter 사용).
 */
@Getter
@Setter
@NoArgsConstructor
public class User {
    private Long id;
    private String email;
    private String password;      // BCrypt 해시
    private String name;
    private String role;
    private LocalDateTime createdAt;   // DB의 created_at에서 자동 매핑
}
```

## 6-5. Mapper 인터페이스 — `UserMapper.java`

```java
package com.example.api.domain.user.mapper;

import com.example.api.domain.user.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {
    User findByEmail(String email);   // 없으면 null
}
```

## 6-6. SQL XML — `resources/mapper/UserMapper.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-mapper.dtd">

<!-- namespace = Mapper 인터페이스 풀패키지명 (정확히 일치!) -->
<mapper namespace="com.example.api.domain.user.mapper.UserMapper">

    <!-- id = 인터페이스 메서드명 (정확히 일치!) -->
    <select id="findByEmail" parameterType="string" resultType="User">
        SELECT id, email, password, name, role, created_at
        FROM users
        WHERE email = #{email}
    </select>

</mapper>
```

> 🔒 파라미터는 **`#{email}`** 으로 바인딩한다. `${email}`는 SQL 인젝션 위험이 있어 쓰지 않는다.
> 

## 6-7. DTO (record)

```java
// LoginRequest.java
package com.example.api.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @Email @NotBlank String email,
        @NotBlank String password
) {}
```

```java
// UserResponse.java  ── password는 절대 포함하지 않는다
package com.example.api.domain.user.dto;

import com.example.api.domain.user.entity.User;

public record UserResponse(Long id, String email, String name, String role) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getName(), user.getRole());
    }
}
```

```java
// LoginResponse.java
package com.example.api.domain.user.dto;

public record LoginResponse(String accessToken, UserResponse user) {}
```

## 6-8. 공통 응답 — `ApiResponse.java`

```java
package com.example.api.global.response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)   // null 필드는 응답에서 제외
public record ApiResponse<T>(boolean success, T data, ErrorBody error) {

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }
    public static <T> ApiResponse<T> error(String code, String message) {
        return new ApiResponse<>(false, null, new ErrorBody(code, message));
    }
    public record ErrorBody(String code, String message) {}
}
```

## 6-9. JWT 발급 — `JwtTokenProvider.java` (jjwt 0.12.x)

```java
package com.example.api.global.jwt;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long validityMs;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-validity-ms}") long validityMs) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.validityMs = validityMs;
    }

    public String createAccessToken(String email, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + validityMs);

        return Jwts.builder()          // ← 0.12.x 신 API
                .subject(email)        // (옛 setSubject() 아님)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }
}
```

> ⚠️ jjwt **0.12.x**는 `setSubject()`·`setExpiration()`이 deprecated → `subject()`·`expiration()` 사용. 검색해서 나오는 옛 코드 주의.
> 

## 6-10. 비즈니스 로직 — `AuthService.java`

```java
package com.example.api.domain.user.service;

import com.example.api.domain.user.dto.LoginRequest;
import com.example.api.domain.user.dto.LoginResponse;
import com.example.api.domain.user.dto.UserResponse;
import com.example.api.domain.user.entity.User;
import com.example.api.domain.user.mapper.UserMapper;
import com.example.api.global.exception.InvalidCredentialsException;
import com.example.api.global.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public LoginResponse login(LoginRequest request) {
        // 1) 이메일로 사용자 조회
        User user = userMapper.findByEmail(request.email());

        // 2) 없거나 비밀번호가 틀리면 동일 예외 (계정 존재 여부 노출 방지)
        if (user == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        // 3) 토큰 발급 + 응답 조립
        String accessToken = jwtTokenProvider.createAccessToken(user.getEmail(), user.getRole());
        return new LoginResponse(accessToken, UserResponse.from(user));
    }
}
```

> 💡 비밀번호는 `passwordEncoder.matches(평문, 해시)`로 비교한다. DB엔 평문이 아니라 BCrypt 해시가 저장돼 있다.
> 

## 6-11. 예외 처리

```java
// InvalidCredentialsException.java
package com.example.api.global.exception;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() {
        super("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
}
```

```java
// GlobalExceptionHandler.java
package com.example.api.global.exception;

import com.example.api.global.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidCredentials(InvalidCredentialsException e) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)   // 401
                .body(ApiResponse.error("INVALID_CREDENTIALS", e.getMessage()));
    }
}
```

## 6-12. 진입점 — `AuthController.java`

```java
package com.example.api.domain.user.controller;

import com.example.api.domain.user.dto.LoginRequest;
import com.example.api.domain.user.dto.LoginResponse;
import com.example.api.domain.user.service.AuthService;
import com.example.api.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }
}
```

> 💡 Controller는 얇다 — 요청을 받아 Service에 넘기고 결과를 감싸기만 한다.
> 

## 6-13. 보안 설정 — `SecurityConfig.java` (로그인용 최소 구성)

```java
package com.example.api.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())   // 토큰 기반이라 CSRF 비활성
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()   // 로그인은 인증 없이 허용
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
```

> 여기까지가 **토큰 발급(로그인)**. 토큰을 **검증**해서 보호 API(`GET /api/users/me`)를 여는 JWT 인증 필터는 다음 단계 주제다.
> 

## 6-14. 동작 확인 (cURL)

```bash
# 성공
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"1234"}'
# → { "success": true, "data": { "accessToken": "eyJ...", "user": {...} } }

# 실패
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'
# → 401, { "success": false, "error": { "code":"INVALID_CREDENTIALS", ... } }
```