---
layout: single
title: "Cursor AI 공식문서 훑어보기: Rules"
date: 2026-01-03
last_modified_at: 2026-01-03T16:00:00+09:00
categories:
  - ai
tags:
  - cursor
  - ai
  - rules
  - documentation
  - productivity
author: Daniel
excerpt: "Cursor AI의 Rules 기능을 완벽하게 이해하고 활용하는 방법을 알아봅니다. Project Rules, Team Rules, User Rules, AGENTS.md까지 모든 규칙 타입을 실전 예시와 함께 설명합니다."
toc: true
toc_sticky: true
toc_label: "목차"
---

## 들어가며

Cursor AI를 사용하다 보면 매번 같은 프롬프트를 반복하거나, 프로젝트의 코딩 스타일을 일관되게 유지하기 어려울 때가 있습니다. 예를 들어,

- "항상 TypeScript strict 모드를 사용해줘"
- "기존 코드 스타일을 따라서 작성해줘"
- "에러 처리를 포함해서 작성해줘"

이런 반복적인 지시사항을 **Rules**로 정의하면, Cursor AI가 자동으로 이를 고려하여 코드를 생성합니다. Rules는 시스템 레벨의 지시사항을 제공하여 Agent의 동작을 일관되게 만들어줍니다[^1].

## Rules란?

### Rules의 개념

Rules는 Cursor AI에게 지속적이고 재사용 가능한 컨텍스트를 제공하는 시스템 레벨 지시사항입니다. 대규모 언어 모델은 각 완성(completion) 사이에 메모리를 유지하지 않기 때문에, Rules를 통해 프롬프트 레벨에서 지속적인 컨텍스트를 제공합니다.

Rules가 적용되면, 규칙 내용이 모델 컨텍스트의 시작 부분에 포함되어 AI가 코드 생성, 편집 해석, 워크플로우 지원 시 일관된 가이드를 받게 됩니다.

### Rules의 장점

1. **일관성**: 프로젝트 전반에 걸쳐 일관된 코딩 스타일 유지
2. **재사용성**: 반복적인 프롬프트를 Rules로 저장하여 재사용
3. **협업**: 팀 전체가 동일한 규칙을 공유하여 표준화
4. **효율성**: 매번 같은 지시사항을 입력할 필요 없음

## Rules의 종류

Cursor AI는 4가지 타입의 Rules를 지원합니다:

### 1. Project Rules

- **위치**: `.cursor/rules` 폴더에 저장
- **특징**: 버전 관리되며 코드베이스에 스코프됨
- **용도**: 프로젝트별 도메인 지식, 워크플로우, 스타일 표준화

### 2. User Rules

- **위치**: Cursor 설정에서 관리
- **특징**: Cursor 환경 전역에 적용, Agent (Chat)에서 사용
- **용도**: 개인 선호 코딩 스타일, 커뮤니케이션 스타일 설정

### 3. Team Rules

- **위치**: Cursor 대시보드에서 관리
- **특징**: 팀 전체에 적용, Team 및 Enterprise 플랜에서 사용 가능
- **용도**: 조직 전체의 코딩 표준, 관행, 워크플로우 강제

### 4. AGENTS.md

- **위치**: 프로젝트 루트 또는 하위 디렉토리
- **특징**: 마크다운 형식의 간단한 대안
- **용도**: `.cursor/rules`보다 단순한 사용 사례

## Project Rules 상세 가이드

### Rule 폴더 구조

각 Rule은 폴더로 구성되며, 다음 구조를 가집니다:

```bash
.cursor/rules/
  my-rule/
    RULE.md           # 메인 규칙 파일
    scripts/          # 헬퍼 스크립트 (선택사항)
```

### RULE.md 파일 형식

`RULE.md` 파일은 frontmatter 메타데이터와 내용으로 구성됩니다:

```markdown
---
description: "프론트엔드 컴포넌트 및 API 검증 표준"
alwaysApply: false
globs:
  - "**/*.tsx"
  - "**/*.ts"
---

컴포넌트 디렉토리에서 작업할 때:
- 항상 Tailwind를 스타일링에 사용
- 애니메이션은 Framer Motion 사용
- 컴포넌트 네이밍 컨벤션 준수

API 디렉토리에서:
- 모든 검증에 zod 사용
- zod 스키마로 반환 타입 정의
- 스키마에서 생성된 타입 export
```

### Rule 적용 타입

Rule은 4가지 타입으로 적용할 수 있습니다:

| Rule Type | 설명 |
|-----------|------|
| **Always Apply** | 모든 채팅 세션에 적용 |
| **Apply Intelligently** | Agent가 설명을 기반으로 관련성 판단하여 적용 |
| **Apply to Specific Files** | 파일이 지정된 패턴과 일치할 때 적용 |
| **Apply Manually** | 채팅에서 @-mention으로 수동 적용 (예: `@my-rule`) |

**Always Apply 예시:**

```markdown
---
alwaysApply: true
---

- 모든 새 파일은 TypeScript로 작성
- 함수형 컴포넌트 사용
- 에러 처리는 항상 try-catch 사용
```

**Apply to Specific Files 예시:**

```markdown
---
globs:
  - "**/api/**/*.ts"
  - "**/routes/**/*.ts"
---

API 엔드포인트에서:
- zod를 사용한 입력 검증 필수
- 에러 응답은 일관된 형식으로 반환
- 로깅 미들웨어 사용
```

**Apply Manually 예시:**

```markdown
---
description: "Express 서비스 템플릿"
alwaysApply: false
---

Express 서비스를 생성할 때 이 템플릿을 사용:
- RESTful 원칙 준수
- 에러 처리 미들웨어 포함
- 적절한 로깅 설정

@express-service-template.ts
```

### Rule 생성 방법

1. **명령어 사용**: `New Cursor Rule` 명령어 실행
2. **설정에서**: `Cursor Settings > Rules, Commands`에서 생성
3. **채팅에서**: Agent에게 Rule 생성 요청

생성된 Rule은 `.cursor/rules` 폴더에 저장되며, 설정에서 모든 Rule과 상태를 확인할 수 있습니다.

### Rule 작성 베스트 프랙티스

효과적인 Rule을 작성하기 위한 가이드라인:

**✅ DO (해야 할 것)**

1. **집중된 내용**: Rule은 500줄 이하로 유지
2. **구체적인 예시**: 추상적인 지시보다 구체적인 예시 제공
3. **파일 참조**: `@filename.ts` 형식으로 템플릿 파일 참조
4. **명확한 설명**: 내부 문서처럼 명확하게 작성

**❌ DON'T (하지 말아야 할 것)**

1. **너무 긴 Rule**: 큰 Rule은 여러 개로 분할
2. **모호한 지시**: "좋은 코드 작성" 같은 모호한 표현 피하기
3. **중복**: 반복되는 내용은 재사용 가능한 Rule로 분리

### 실전 Rule 예시

**예시 1: 프론트엔드 컴포넌트 표준**

```markdown
---
description: "React 컴포넌트 스타일 가이드"
globs:
  - "**/components/**/*.tsx"
---

컴포넌트 작성 시:
- Props 인터페이스를 상단에 정의
- 함수형 컴포넌트만 사용
- Tailwind CSS로 스타일링
- Framer Motion으로 애니메이션
- 컴포넌트는 named export로 내보내기

@component-template.tsx
```

**예시 2: API 엔드포인트 검증**

```markdown
---
description: "API 엔드포인트 검증 표준"
globs:
  - "**/api/**/*.ts"
  - "**/routes/**/*.ts"
---

모든 API 엔드포인트에서:
- zod를 사용한 입력 검증 필수
- zod 스키마로 반환 타입 정의
- 스키마에서 생성된 타입 export
- 에러는 일관된 형식으로 반환

@api-validation-template.ts
```

**예시 3: 개발 워크플로우 자동화**

```markdown
---
description: "앱 분석 워크플로우"
alwaysApply: false
---

앱 분석을 요청받으면:
1. `npm run dev`로 개발 서버 실행
2. 콘솔에서 로그 가져오기
3. 성능 개선 사항 제안
```

## Team Rules

Team Rules는 Team 및 Enterprise 플랜에서 사용할 수 있으며, 조직 전체에 걸쳐 규칙을 강제할 수 있습니다.

### Team Rules의 특징

- **관리 위치**: [Cursor 대시보드](https://cursor.com/dashboard?tab=team-content)에서 관리
- **적용 범위**: 팀 전체의 모든 프로젝트와 저장소
- **우선순위**: Team Rules → Project Rules → User Rules 순서로 적용
- **강제 적용**: 관리자가 규칙을 강제할 수 있어 팀원이 비활성화 불가

### Team Rules 설정 옵션

1. **Enable this rule immediately**: 체크 시 즉시 활성화, 미체크 시 초안으로 저장
2. **Enforce this rule**: 활성화 시 모든 팀원에게 필수 적용, 비활성화 불가

### Team Rules 형식

Team Rules는 일반 텍스트 형식이며, Project Rules와 달리 폴더 구조나 메타데이터(`globs`, `alwaysApply` 등)를 지원하지 않습니다.

## User Rules

User Rules는 Cursor 환경 전역에 적용되는 개인 설정입니다.

### User Rules 설정 방법

1. `Cursor Settings → Rules`로 이동
2. User Rules 섹션에서 규칙 작성

### User Rules 예시

```markdown
간결한 스타일로 답변해주세요. 불필요한 반복이나 채움말을 피해주세요.
```

**주의사항**: User Rules는 Agent (Chat)에만 적용되며, Inline Edit (Cmd/Ctrl+K)에는 적용되지 않습니다.

## AGENTS.md

`AGENTS.md`는 `.cursor/rules`의 간단한 대안으로, 프로젝트 루트나 하위 디렉토리에 배치할 수 있습니다.

### AGENTS.md 특징

- **형식**: 일반 마크다운 파일 (메타데이터 없음)
- **용도**: 단순하고 읽기 쉬운 지시사항
- **중첩 지원**: 하위 디렉토리에 배치 가능

### AGENTS.md 예시

```markdown
# 프로젝트 지시사항

## 코드 스타일

- 모든 새 파일은 TypeScript 사용
- React에서는 함수형 컴포넌트 선호
- 데이터베이스 컬럼은 snake_case 사용

## 아키텍처

- Repository 패턴 준수
- 비즈니스 로직은 서비스 레이어에 유지
```

### 중첩 AGENTS.md 지원

하위 디렉토리에 `AGENTS.md`를 배치하면 해당 디렉토리와 하위 디렉토리에서 자동으로 적용됩니다:

```bash
project/
  AGENTS.md              # 전역 지시사항
  frontend/
    AGENTS.md            # 프론트엔드 전용 지시사항
    components/
      AGENTS.md          # 컴포넌트 전용 지시사항
  backend/
    AGENTS.md            # 백엔드 전용 지시사항
```

더 구체적인 지시사항이 우선순위를 가집니다.

## Rules 가져오기

### GitHub에서 가져오기

외부 GitHub 저장소의 Rules를 가져와 재사용할 수 있습니다:

1. `Cursor Settings → Rules, Commands` 열기
2. `Project Rules` 옆의 `+ Add Rule` 클릭
3. `Remote Rule (Github)` 선택
4. Rule이 포함된 GitHub 저장소 URL 붙여넣기
5. Cursor가 Rule을 가져와 프로젝트에 동기화

가져온 Rule은 원본 저장소와 동기화되어 업데이트가 자동으로 반영됩니다.

### Agent Skills

Agent Skills AI 에이전트를 확장하는 오픈 표준으로, Cursor가 이 표준을 지원합니다. 가져온 Skills는 항상 agent-decided 규칙으로 적용되며, Cursor가 컨텍스트에 따라 관련성을 판단합니다.

**활성화 방법:**
1. `Cursor Settings → Rules` 열기
2. **Import Settings** 섹션 찾기
3. **Agent Skills** 토글 켜기/끄기

## Rules 적용 우선순위

Rules는 다음 순서로 적용됩니다:

1. **Team Rules** (최우선)
2. **Project Rules**
3. **User Rules**

모든 적용 가능한 Rules가 병합되며, 충돌 시 앞선 소스가 우선순위를 가집니다.

## 실전 활용 팁

### 팁 1: 단계별 Rule 작성

복잡한 프로젝트는 여러 Rule로 분할:

```markdown
# .cursor/rules/frontend-components/RULE.md
컴포넌트 관련 규칙

# .cursor/rules/api-validation/RULE.md
API 검증 관련 규칙

# .cursor/rules/database/RULE.md
데이터베이스 관련 규칙
```

### 팁 2: 템플릿 파일 활용

Rule에서 템플릿 파일을 참조하여 일관된 코드 생성:

```markdown
---
description: "Express 서비스 템플릿"
---

Express 서비스를 생성할 때 이 템플릿을 사용:

@express-service-template.ts
```

### 팁 3: 파일 패턴 활용

특정 파일 타입에만 적용되는 Rule 작성:

```markdown
---
globs:
  - "**/*.test.ts"
  - "**/*.spec.ts"
---

테스트 파일에서:
- Jest 사용
- 각 테스트는 독립적으로 실행 가능해야 함
- describe 블록으로 그룹화
```

### 팁 4: 채팅에서 Rule 생성 요청

Agent에게 직접 Rule 생성 요청:

```
"프로젝트의 React 컴포넌트 스타일 가이드를 
Project Rule로 만들어줘. 
components 폴더의 파일에만 적용되도록 해줘."
```

## 주의사항

### Rules의 한계

1. **Cursor Tab 미적용**: Rules는 Cursor Tab이나 다른 AI 기능에는 영향을 주지 않습니다
2. **Inline Edit 미적용**: User Rules는 Inline Edit (Cmd/Ctrl+K)에 적용되지 않습니다
3. **검토 필요**: AI가 생성한 코드는 항상 검토하고 테스트해야 합니다

### 보안 고려사항

일부 팀은 규정 준수 워크플로우의 일부로 강제 규칙을 사용하지만, AI 가이드는 보안 제어의 유일한 수단이 되어서는 안 됩니다.

## 마무리

Cursor AI의 Rules 기능을 효과적으로 활용하면:

1. **일관성**: 프로젝트 전반에 걸쳐 일관된 코딩 스타일 유지
2. **효율성**: 반복적인 프롬프트 입력 불필요
3. **협업**: 팀 전체가 동일한 표준 공유
4. **자동화**: 워크플로우와 템플릿 자동화

Rules는 Cursor AI를 더욱 강력하게 만드는 핵심 기능입니다. 프로젝트의 특성에 맞는 Rules를 작성하고, 팀과 공유하여 개발 생산성을 크게 향상시킬 수 있습니다.

---

**참고 자료:**

[^1]: [Cursor AI Rules 공식 문서](https://cursor.com/docs/context/rules) - Rules 기능의 전체 가이드와 예시
[^2]: [Agent Skills 문서](https://cursor.com/docs/context/skills) - Agent Skills 표준에 대한 상세 정보
[^3]: [Cursor 대시보드](https://cursor.com/dashboard?tab=team-content) - Team Rules 관리 대시보드

