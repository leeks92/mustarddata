---
layout: single
title: "Apache Airflow MCP 설치방법 및 활용 가이드"
date: 2026-01-04
last_modified_at: 2026-01-04T20:00:00+09:00
categories:
  - ai
tags:
  - airflow
  - mcp
  - ai
  - automation
  - data-engineering
  - cursor
author: Daniel
excerpt: "Apache Airflow를 AI 에이전트와 통합하여 DAG 관리, 모니터링, 작업 실행을 자동화하는 방법을 알아봅니다. MCP 서버 설치부터 실전 활용까지 완벽 가이드."
toc: true
toc_sticky: true
toc_label: "목차"
---

## 들어가며

Apache Airflow를 운영하다 보면 다음과 같은 작업을 반복적으로 수행해야 합니다:

- DAG 상태 확인 및 모니터링
- DAG 실행 트리거 및 관리
- 변수(Variables)와 연결(Connections) 설정
- 태스크 인스턴스 상태 확인 및 재실행
- 에러 로그 분석 및 디버깅

이런 반복적인 작업을 AI 에이전트에게 위임할 수 있다면 시간을 효율적으로 사용할 수 있지 않을까라는 생각에서 Airflow MCP를 도입하게 되었습니다. **Apache Airflow MCP 서버**는 Cursor AI나 Claude Desktop과 같은 AI 도구에서 Airflow를 직접 제어할 수 있게 해주는 MCP(Model Context Protocol) 서버입니다[^1]. 이 가이드에서는 Apache Airflow MCP 서버의 설치부터 실전 활용까지 단계별로 설명합니다.

## Apache Airflow MCP 서버란?

### 기본 개념

Apache Airflow MCP 서버는 Airflow의 REST API를 MCP 프로토콜[^3]을 통해 노출하여, AI 에이전트가 Airflow 인스턴스와 상호작용할 수 있게 해주는 서버입니다. 이를 통해 AI 에이전트가 DAG 관리, 모니터링, 작업 실행 등 다양한 Airflow 작업을 수행할 수 있습니다. Apache Airflow에 대한 기본 개념은 [공식 문서](https://airflow.apache.org/docs/)[^4]를 참고할 수 있습니다.

### 주요 특징

1. **완전한 API 지원**: DAG, DAG Run, Task Instance, Variable, Connection 등 Airflow의 주요 리소스 관리
2. **읽기 전용 모드**: 안전한 모니터링을 위한 읽기 전용 모드 지원
3. **유연한 인증**: Basic Authentication과 JWT Token 인증 지원
4. **선택적 API 그룹**: 필요한 API만 선택하여 사용 가능

### 지원하는 주요 기능

- **DAG 관리**: DAG 목록 조회, 상세 정보 확인, 일시정지/재개, 삭제
- **DAG Run 관리**: DAG Run 생성, 상태 조회, 업데이트, 삭제
- **Task Instance 관리**: Task Instance 상태 조회, 재실행, 클리어
- **Variable 관리**: 변수 생성, 조회, 업데이트, 삭제
- **Connection 관리**: 연결 생성, 조회, 업데이트, 삭제, 테스트
- **모니터링**: Health 상태 확인, 버전 정보 조회, Import Error 확인

## 설치 방법

### 사전 요구사항

- Python 3.10 이상
- `uv` 또는 `uvx` 설치 (권장)

### uvx를 사용한 설치 (권장)

`uvx`는 패키지를 임시 환경에서 실행하는 도구로, 별도 설치 없이 바로 사용할 수 있습니다:

```bash
# uvx 설치 (아직 설치하지 않은 경우)
curl -LsSf https://astral.sh/uv/install.sh | sh
```

설치 확인:

```bash
uvx --version
```

### uv를 사용한 설치

프로젝트에 직접 설치하려면 `uv`를 사용합니다:

```bash
# uv 설치
curl -LsSf https://astral.sh/uv/install.sh | sh

# 프로젝트 디렉토리에서 실행
uv run mcp-server-apache-airflow
```

### Smithery를 통한 자동 설치

Claude Desktop 사용자는 Smithery를 통해 자동으로 설치할 수 있습니다[^2]:

```bash
npx -y @smithery/cli install @yangkyeongmo/mcp-server-apache-airflow --client claude
```

## 설정 방법

### 환경 변수 설정

Apache Airflow MCP 서버는 다음 환경 변수를 사용합니다:

```bash
# 필수: Airflow 호스트 URL
AIRFLOW_HOST=https://your-airflow-host.com

# 선택: API 버전 (기본값: v1)
AIRFLOW_API_VERSION=v1

# 선택: 읽기 전용 모드 활성화 (기본값: false)
READ_ONLY=true
```

### 인증 설정

Basic Authentication과 JWT Token 인증 중 하나를 선택할 수 있습니다.

#### Basic Authentication (기본)

```bash
AIRFLOW_USERNAME=your-username
AIRFLOW_PASSWORD=your-password
```

#### JWT Token Authentication

JWT Token을 사용하려면 먼저 토큰을 발급받아야 합니다:

```bash
# JWT 토큰 발급
ENDPOINT_URL="http://localhost:8080"
curl -X 'POST' \
  "${ENDPOINT_URL}/auth/token" \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "your-username",
    "password": "your-password"
  }'
```

발급받은 토큰을 환경 변수로 설정:

```bash
AIRFLOW_JWT_TOKEN=your-jwt-token
```

> **참고**: JWT Token과 Basic Authentication이 모두 설정된 경우, JWT Token이 우선순위를 가집니다.

## Claude Desktop 설정

*Cursor에서 MCP 서버 설정 화면 - mcp-server-apache-airflow가 68개의 도구와 함께 활성화되어 있음*

![MCP 서버 설정 화면](/assets/images/2026-01-04-airflow-mcp-guide/mcp-server-settings.png)

### Basic Authentication 사용

`claude_desktop_config.json` 파일에 다음 설정을 추가합니다:

```json
{
  "mcpServers": {
    "mcp-server-apache-airflow": {
      "command": "uvx",
      "args": ["mcp-server-apache-airflow"],
      "env": {
        "AIRFLOW_HOST": "https://your-airflow-host",
        "AIRFLOW_USERNAME": "your-username",
        "AIRFLOW_PASSWORD": "your-password"
      }
    }
  }
}
```

### JWT Token Authentication 사용

```json
{
  "mcpServers": {
    "mcp-server-apache-airflow": {
      "command": "uvx",
      "args": ["mcp-server-apache-airflow"],
      "env": {
        "AIRFLOW_HOST": "https://your-airflow-host",
        "AIRFLOW_JWT_TOKEN": "your-jwt-token"
      }
    }
  }
}
```

### 읽기 전용 모드 설정

안전한 모니터링을 위해 읽기 전용 모드를 활성화할 수 있습니다:

```json
{
  "mcpServers": {
    "mcp-server-apache-airflow": {
      "command": "uvx",
      "args": ["mcp-server-apache-airflow"],
      "env": {
        "AIRFLOW_HOST": "https://your-airflow-host",
        "AIRFLOW_USERNAME": "your-username",
        "AIRFLOW_PASSWORD": "your-password",
        "READ_ONLY": "true"
      }
    }
  }
}
```

### uv를 사용한 설정

`uvx` 대신 `uv`를 사용하려면:

```json
{
  "mcpServers": {
    "mcp-server-apache-airflow": {
      "command": "uv",
      "args": [
        "--directory",
        "/path/to/mcp-server-apache-airflow",
        "run",
        "mcp-server-apache-airflow"
      ],
      "env": {
        "AIRFLOW_HOST": "https://your-airflow-host",
        "AIRFLOW_USERNAME": "your-username",
        "AIRFLOW_PASSWORD": "your-password"
      }
    }
  }
}
```

## 고급 설정

### API 그룹 선택

필요한 API만 선택하여 사용할 수 있습니다. 이는 서버 리소스를 절약하고 보안을 강화하는 데 도움이 됩니다:

```bash
uvx mcp-server-apache-airflow --apis dag --apis dagrun --apis variable
```

사용 가능한 API 그룹:

- `config`: 설정 관리
- `connections`: 연결 관리
- `dag`: DAG 관리
- `dagrun`: DAG Run 관리
- `dagstats`: DAG 통계
- `dataset`: 데이터셋 관리
- `eventlog`: 이벤트 로그
- `importerror`: Import 에러 관리
- `monitoring`: 모니터링
- `plugin`: 플러그인 관리
- `pool`: Pool 관리
- `provider`: Provider 관리
- `taskinstance`: Task Instance 관리
- `variable`: Variable 관리
- `xcom`: XCom 관리

### 읽기 전용 모드와 API 그룹 조합

읽기 전용 모드와 API 그룹을 함께 사용:

```bash
uvx mcp-server-apache-airflow --read-only --apis dag --apis variable
```

## 주요 기능 활용

### DAG 관리

#### DAG 목록 조회

```
모든 DAG 목록을 보여줘
```

#### DAG 상세 정보 확인

```
example_dag의 상세 정보를 알려줘
```

#### DAG 일시정지/재개

```
example_dag를 일시정지시켜줘
```

```
example_dag를 재개시켜줘
```

### DAG Run 관리

#### DAG Run 생성 (트리거)

```
example_dag를 지금 실행시켜줘
```

#### DAG Run 상태 확인

```
example_dag의 최근 실행 상태를 확인해줘
```

#### DAG Run 삭제

```
example_dag의 특정 DAG Run을 삭제해줘
```

### Task Instance 관리

#### Task Instance 상태 확인

```
example_dag의 task_1 상태를 확인해줘
```

#### Task Instance 재실행

```
example_dag의 task_1을 재실행해줘
```

#### Task Instance 클리어

```
example_dag의 실패한 모든 task를 클리어해줘
```

### Variable 관리

#### Variable 조회

```
모든 Variable 목록을 보여줘
```

#### Variable 생성/업데이트

```
API_KEY라는 Variable을 생성하고 값은 'secret-key-123'으로 설정해줘
```

#### Variable 삭제

```
API_KEY Variable을 삭제해줘
```

### Connection 관리

#### Connection 목록 조회

```
모든 Connection 목록을 보여줘
```

#### Connection 생성

```
postgres_default라는 Connection을 생성하고, 
host는 localhost, port는 5432, 
login은 postgres, password는 password로 설정해줘
```

#### Connection 테스트

```
postgres_default Connection이 정상적으로 작동하는지 테스트해줘
```

### 모니터링

#### Health 상태 확인

```
Airflow의 Health 상태를 확인해줘
```

#### Import Error 확인

```
Import Error가 있는지 확인해줘
```

## 실전 활용 시나리오

### 시나리오 1: 일일 모니터링 리포트 생성

매일 아침 Airflow 상태를 확인하고 리포트를 생성하는 작업을 자동화할 수 있습니다:

```
오늘 실행된 모든 DAG의 상태를 확인하고, 
실패한 DAG와 Task를 정리해서 리포트를 만들어줘
```

### 시나리오 2: 실패한 DAG 자동 재실행

실패한 DAG를 자동으로 감지하고 재실행하는 워크플로우:

```
실패한 DAG Run을 찾아서 재실행해줘
```

### 시나리오 3: Variable 기반 설정 관리

환경별 설정을 Variable로 관리하고 AI 에이전트가 이를 활용:

```
프로덕션 환경의 모든 Variable을 조회하고, 
필요한 설정이 모두 있는지 확인해줘
```

### 시나리오 4: Connection 검증

모든 Connection이 정상적으로 작동하는지 주기적으로 검증:

```
모든 Connection을 테스트하고, 
실패한 Connection 목록을 알려줘
```

## 보안 고려사항

### 읽기 전용 모드 활용

프로덕션 환경에서는 읽기 전용 모드를 활성화하여 실수로 인한 변경을 방지하는 것이 좋습니다:

```json
{
  "env": {
    "READ_ONLY": "true"
  }
}
```

### 최소 권한 원칙

필요한 API 그룹만 선택하여 사용:

```bash
uvx mcp-server-apache-airflow --read-only --apis dag --apis dagrun
```

## 문제 해결

### 연결 오류

Airflow 호스트에 연결할 수 없는 경우:

1. `AIRFLOW_HOST` 환경 변수가 올바른지 확인
2. 네트워크 연결 상태 확인
3. Airflow 서버가 실행 중인지 확인

### 인증 오류

인증이 실패하는 경우:

1. 사용자 이름과 비밀번호가 올바른지 확인
2. JWT Token이 만료되지 않았는지 확인
3. Airflow 인증 설정 확인

### API 오류

특정 API 호출이 실패하는 경우:

1. 해당 API 그룹이 활성화되어 있는지 확인
2. 읽기 전용 모드에서 쓰기 작업을 시도하지 않았는지 확인
3. Airflow 버전과 호환성 확인

## 마무리

Apache Airflow MCP 서버를 활용하면:

1. **자동화**: 반복적인 Airflow 관리 작업 자동화
2. **모니터링**: 실시간 상태 확인 및 알림
3. **효율성**: AI 에이전트를 통한 빠른 작업 수행
4. **안전성**: 읽기 전용 모드로 안전한 모니터링

MCP 서버를 통해 Airflow 관리 작업을 AI 에이전트에게 위임하면, 일상적인 모니터링과 반복 작업에 소요하는 시간을 절약하고 더 중요한 작업에 집중할 수 있습니다.

---

**참고 자료:**

[^1]: [Apache Airflow MCP Server GitHub 저장소](https://github.com/yangkyeongmo/mcp-server-apache-airflow) - 공식 저장소 및 상세 문서
[^2]: [Apache Airflow MCP Server PyPI 패키지](https://pypi.org/project/mcp-server-apache-airflow/) - PyPI 패키지 페이지
[^3]: [Model Context Protocol (MCP) 문서](https://modelcontextprotocol.io/) - MCP 프로토콜 공식 문서
[^4]: [Apache Airflow 공식 문서](https://airflow.apache.org/docs/) - Apache Airflow 공식 문서

