---
layout: single
title: "Cursor AI 공식문서 훑어보기: 병렬 에이전트"
date: 2026-01-03
last_modified_at: 2026-01-03T17:00:00+09:00
categories:
  - ai
tags:
  - cursor
  - ai
  - parallel-agents
  - worktree
  - documentation
  - productivity
author: Daniel
excerpt: "Cursor AI의 병렬 에이전트 기능을 완벽하게 이해하고 활용하는 방법을 알아봅니다. Git worktree를 활용한 병렬 작업, Best-of-N 기능, 초기화 스크립트 설정까지 실전 예시와 함께 설명합니다."
toc: true
toc_sticky: true
toc_label: "목차"
related_posts:
  - 2026-01-03-cursor-ai-browser-guide.md
  - 2026-01-03-cursor-ai-rules-guide.md
---

## 들어가며

개발을 하다 보면 여러 가지 접근 방식을 동시에 시도하거나, 여러 모델의 결과를 비교해보고 싶을 때가 있습니다. 예를 들어,

- 여러 기능을 동시에 개발하고 싶을 때
- 같은 작업을 다른 AI 모델로 실행해 최적의 결과를 선택하고 싶을 때
- 각 에이전트가 독립적으로 빌드하고 테스트할 수 있는 환경이 필요할 때

Cursor AI의 **병렬 에이전트(Parallel Agents)** 기능은 Git worktree를 활용하여 여러 에이전트를 동시에 실행하고, 각 에이전트가 독립적인 환경에서 작업할 수 있게 해줍니다[^1].

## 병렬 에이전트란?

### Worktree의 개념

병렬 에이전트는 **Git worktree** 기능을 기반으로 동작합니다. Worktree는 하나의 저장소에서 여러 브랜치를 동시에 사용할 수 있게 해주는 Git 기능입니다. 각 worktree는 독립적인 파일 세트와 변경사항을 가지며, 서로 간섭하지 않습니다.

Cursor는 자동으로 worktree를 생성하고 설정하며, 현재는 에이전트와 worktree가 1:1로 매핑됩니다. 각 에이전트는 자신만의 worktree에서 파일을 편집하고, 코드를 빌드하고 테스트할 수 있습니다.

### 병렬 에이전트의 장점

1. **독립성**: 각 에이전트가 서로 간섭하지 않고 작업 가능
2. **비교 분석**: 여러 모델의 결과를 동시에 비교 가능
3. **병렬 처리**: 여러 작업을 동시에 진행하여 시간 절약
4. **안전성**: 메인 브랜치에 영향을 주지 않고 실험 가능

## 기본 사용법

### 단일 에이전트 실행

가장 기본적인 사용법은 worktree에서 단일 에이전트를 실행하는 것입니다:

![Worktree 드롭다운 메뉴](/assets/images/2026-01-03-cursor-ai-parallel-agents/worktree-dropdown.png)

에이전트 드롭다운에서 "Worktree" 옵션을 선택하면 worktree 환경에서 에이전트를 실행할 수 있습니다:

1. 에이전트 드롭다운에서 "Worktree" 선택
2. 프롬프트 입력 후 실행
3. 작업 완료 후 "Apply" 버튼 클릭하여 변경사항 적용

**로컬 에이전트와의 차이점:**
- 로컬 에이전트: "Keep" 버튼으로 변경사항 유지
- Worktree 에이전트: "Apply" 버튼으로 메인 브랜치에 변경사항 병합

### Worktree 확인

모든 worktree를 확인하려면 터미널에서 다음 명령어를 실행하세요:

``` bash
git worktree list
```

출력 예시:

```
/.../<repo>                                  15ae12e   [main]
/Users/<you>/.cursor/worktrees/<repo>/98Zlw  15ae12e   [feat-1-98Zlw]
/Users/<you>/.cursor/worktrees/<repo>/a4Xiu  15ae12e   [feat-2-a4Xiu]
```

## Best-of-N: 여러 모델 동시 실행

Best-of-N은 하나의 프롬프트를 여러 모델에 동시에 실행하는 강력한 기능입니다.

### 사용 방법

1. 에이전트 드롭다운에서 여러 모델 선택 (예: Claude 4.5 Sonnet, GPT-5.1)
2. 프롬프트 입력 후 실행
3. 각 모델의 결과를 카드 형태로 확인
4. 가장 마음에 드는 결과의 "Apply" 버튼 클릭

### 결과 비교

각 모델의 결과는 별도의 카드로 표시되며, 카드를 클릭하여 각 에이전트가 만든 변경사항을 확인할 수 있습니다. 이를 통해,

- 각 모델의 접근 방식 비교
- 코드 품질 평가
- 최적의 결과 선택

### 여러 결과 적용 시

같은 Best-of-N 실행에서 여러 결과를 적용하려고 하면 Cursor가 다음 옵션을 제공합니다.

- **Full Overwrite**: 모든 파일의 전체 내용을 worktree의 변경사항으로 교체
- **Merge**: 네이티브 충돌 해결 UI를 사용하여 여러 옵션 병합

## Apply 기능 동작 방식

"Apply" 버튼을 클릭하면 다음과 같은 과정을 거칩니다:

1. **Worktree 생성**: Cursor가 worktree를 생성할 때, 메인 작업 트리의 모든 새 파일과 편집된 파일이 worktree로 복사됩니다 (Git에서 무시되는 파일 제외).
2. **독립 작업**: 에이전트가 worktree 내에서 격리된 상태로 작업하며 파일을 편집할 수 있습니다.
3. **변경사항 병합**: "Apply" 클릭 시, Cursor가 변경사항을 메인 작업 트리에 깔끔하게 병합합니다.

## 초기화 스크립트 설정

Worktree 설정을 커스터마이징하려면 `.cursor/worktrees.json` 파일을 편집하세요. Cursor는 다음 순서로 이 파일을 찾습니다:

1. Worktree 경로
2. 프로젝트 루트 경로

### 설정 옵션

`worktrees.json` 파일은 세 가지 설정 키를 지원합니다:

- **`setup-worktree-unix`**: macOS/Linux용 명령어 또는 스크립트 경로
- **`setup-worktree-windows`**: Windows용 명령어 또는 스크립트 경로
- **`setup-worktree`**: 모든 운영체제용 일반 폴백

각 키는 다음 중 하나를 받습니다:
- **명령어 배열**: worktree에서 순차적으로 실행될 셸 명령어
- **문자열 파일 경로**: `.cursor/worktrees.json`에 상대적인 스크립트 파일 경로

### 설정 예시

#### Node.js 프로젝트

```json
{
  "setup-worktree": [
    "npm ci",
    "cp $ROOT_WORKTREE_PATH/.env .env"
  ]
}
```

#### Python 프로젝트 (가상 환경)

```json
{
  "setup-worktree": [
    "python -m venv venv",
    "source venv/bin/activate && pip install -r requirements.txt",
    "cp $ROOT_WORKTREE_PATH/.env .env"
  ]
}
```

#### 데이터베이스 마이그레이션 포함

```json
{
  "setup-worktree": [
    "npm ci",
    "cp $ROOT_WORKTREE_PATH/.env .env",
    "npm run db:migrate"
  ]
}
```

#### 빌드 및 의존성 링크

```json
{
  "setup-worktree": [
    "pnpm install",
    "pnpm run build",
    "cp $ROOT_WORKTREE_PATH/.env.local .env.local"
  ]
}
```

### 스크립트 파일 사용

복잡한 설정의 경우 인라인 명령어 대신 스크립트 파일을 참조할 수 있습니다:

```json
{
  "setup-worktree-unix": "setup-worktree-unix.sh",
  "setup-worktree-windows": "setup-worktree-windows.ps1",
  "setup-worktree": [
    "echo 'Using generic fallback. For better support, define OS-specific scripts.'"
  ]
}
```

스크립트는 `.cursor/` 디렉토리에 `worktrees.json`과 함께 배치합니다:

**setup-worktree-unix.sh** (Unix/macOS):

```bash
#!/bin/bash
set -e

# 의존성 설치
npm ci

# 환경 파일 복사
cp "$ROOT_WORKTREE_PATH/.env" .env

# 데이터베이스 마이그레이션 실행
npm run db:migrate

echo "Worktree setup complete!"
```

**setup-worktree-windows.ps1** (Windows):

```powershell
$ErrorActionPreference = 'Stop'

# 의존성 설치
npm ci

# 환경 파일 복사
Copy-Item "$env:ROOT_WORKTREE_PATH\.env" .env

# 데이터베이스 마이그레이션 실행
npm run db:migrate

Write-Host "Worktree setup complete!"
```

### OS별 설정

다른 운영체제에 대해 다른 설정 명령어를 제공할 수 있습니다:

```json
{
  "setup-worktree-unix": [
    "npm ci",
    "cp $ROOT_WORKTREE_PATH/.env .env",
    "chmod +x scripts/*.sh"
  ],
  "setup-worktree-windows": [
    "npm ci",
    "copy %ROOT_WORKTREE_PATH%\\.env .env"
  ]
}
```

### 디버깅

Worktree 설정 스크립트를 디버깅하려면 하단 패널의 "Output"을 열고 드롭다운에서 "Worktree Setup"을 선택하세요.

## Worktree 정리

Cursor는 과도한 디스크 사용을 방지하기 위해 worktree를 자동으로 관리합니다:

- **워크스페이스당 제한**: 각 워크스페이스는 최대 20개의 worktree를 가질 수 있습니다
- **자동 정리**: 새 worktree를 생성하고 제한을 초과하면 Cursor가 가장 오래된 worktree를 자동으로 제거합니다

Worktree는 마지막 접근 시간을 기준으로 제거되며, 가장 오래된 worktree가 먼저 제거됩니다. 정리는 워크스페이스별로 적용되므로 다른 저장소의 worktree는 서로 간섭하지 않습니다.

### 정리 설정

설정에서 정리 일정을 구성할 수 있습니다:

```json
{
  "cursor.worktreeCleanupIntervalHours": 6,
  "cursor.worktreeMaxCount": 20
}
```

## SCM 패널에서 Worktree 시각화

Cursor가 생성한 worktree를 SCM 패널에서 시각화하려면 `git.showCursorWorktree` 설정을 활성화하세요 (기본값: `false`).

## LSP 지원

**LSP(Language Server Protocol)**는 코드 편집기와 언어 서버 간의 통신 프로토콜로, 자동 완성, 린팅, 타입 체크 등의 IDE 기능을 제공합니다.

성능상의 이유로 Cursor는 현재 worktree에서 LSP를 지원하지 않습니다. 에이전트는 파일을 린트할 수 없습니다. 이 기능 지원을 위해 작업 중입니다.

## 실전 활용 팁

### 팁 1: 여러 기능 동시 개발

여러 기능을 동시에 개발할 때 각각 다른 worktree에서 작업:

```
에이전트 1: "사용자 인증 기능 추가" (worktree: feat-auth)
에이전트 2: "결제 시스템 구현" (worktree: feat-payment)
에이전트 3: "알림 기능 추가" (worktree: feat-notification)
```

### 팁 2: 모델 성능 비교

같은 작업을 여러 모델에 실행하여 결과 비교:

```
프롬프트: "React 컴포넌트를 Vue 3로 마이그레이션"
- Claude 4.5 Sonnet 결과 확인
- GPT-5.1 결과 확인
- 최적의 결과 선택
```

### 팁 3: 실험적 기능 테스트

메인 브랜치에 영향을 주지 않고 실험적 기능 테스트:

```
worktree에서 실험적 기능 개발
→ 빌드 및 테스트
→ 결과가 만족스러우면 Apply
→ 문제가 있으면 worktree만 삭제
```

## 주의사항

### 1. LSP 제한

현재 worktree에서는 LSP가 지원되지 않으므로:
- 파일 린팅 불가
- 타입 체크 제한적
- 코드 자동 완성 제한적

### 2. 디스크 공간

각 worktree는 독립적인 파일 복사본을 가지므로:
- 디스크 공간 사용량 증가
- 자동 정리 기능 활용 권장

### 3. 의존성 설치

심볼릭 링크 대신 빠른 패키지 매니저 사용:
- `bun`, `pnpm`, `uv` 등 권장
- 메인 worktree와의 충돌 방지

## 마무리

Cursor AI의 병렬 에이전트 기능을 효과적으로 활용하면:

1. **병렬 작업**: 여러 기능을 동시에 개발하여 시간 절약
2. **모델 비교**: Best-of-N으로 최적의 결과 선택
3. **안전한 실험**: 메인 브랜치에 영향을 주지 않고 테스트
4. **자동화**: 초기화 스크립트로 환경 설정 자동화

병렬 에이전트는 복잡한 개발 작업을 효율적으로 처리할 수 있게 해주는 강력한 기능입니다. 초기화 스크립트를 적절히 설정하고, Best-of-N 기능을 활용하면 개발 생산성을 크게 향상시킬 수 있습니다.

---

**참고 자료:**

[^1]: [Cursor AI Parallel Agents 공식 문서](https://cursor.com/docs/configuration/worktrees) - 병렬 에이전트 기능의 전체 가이드와 예시

