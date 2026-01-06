---
layout: single
title: "Sentry로 에러 모니터링하기: 언제, 왜, 어떻게 사용해야 할까?"
date: 2026-01-06
last_modified_at: 2026-01-07T00:20:00+09:00
categories:
  - backend
  - frontend
tags:
  - sentry
  - error-monitoring
  - debugging
  - devops
  - webdev
author: Daniel
excerpt: "사용자가 에러를 발견하기 전에 먼저 알고 수정하고 싶으신가요? Sentry의 핵심 기능과 도입 시기, 그리고 프레임워크별 연동 방법을 단계별로 가이드합니다."
toc: true
toc_sticky: true
toc_label: "목차"
---

## 들어가며

서비스를 배포하고 나면 가장 두려운 순간 중 하나는 사용자가 **"어, 이거 안 돼요"**라며 CS(Customer Service)를 남길 때입니다. 하지만 더 무서운 것은 사용자가 조용히 서비스를 떠나는 것입니다. 

운영 중인 서비스에서 발생하는 에러를 실시간으로 파악하고, 개발자가 사용자의 제보 없이도 문제를 즉시 수정할 수 있게 도와주는 도구가 바로 **Sentry**입니다. 이 글에서는 Sentry를 왜 도입해야 하는지, 언제 사용하면 좋은지, 그리고 실제 프로젝트에 어떻게 연동하는지 알아보겠습니다.

## Sentry란 무엇인가?

Sentry[^1]는 애플리케이션에서 발생하는 에러와 성능 이슈를 실시간으로 추적하고 분석해주는 오픈 소스 기반의 에러 모니터링 플랫폼입니다. 단순히 "에러가 발생했다"는 사실만 알려주는 것이 아니라, 에러가 발생한 지점의 **Stack Trace**, 당시의 **사용자 이동경로(Breadcrumbs)**, **환경 정보** 등을 상세히 제공합니다.

### 왜 Sentry를 사용해야 할까?

1. **실시간 알림**: 에러 발생 즉시 슬랙(Slack), 이메일 등으로 알림을 받아 신속하게 대응할 수 있습니다.
2. **상세한 디버깅 정보**: 에러가 발생하기 직전에 사용자가 어떤 클릭을 했는지, 어떤 API를 호출했는지 등의 기록을 보여줍니다.
3. **이슈 그룹화**: 동일한 에러가 수천 번 발생해도 하나의 이슈로 그룹화하여 관리의 피로도를 낮춰줍니다.
4. **성능 모니터링**: API 응답 시간이나 프론트엔드 렌더링 성능을 추적하여 병목 지점을 찾을 수 있습니다.

## 언제 Sentry를 도입해야 할까?

Sentry는 개발 초기 단계보다는 **실제 사용자가 있는 환경**에 가까워질 때 그 진가가 드러납니다.

- **MVP 배포 직전**: 소수의 사용자라도 에러를 겪는 것을 최소화해야 할 때 필수입니다.
- **프로덕션 환경**: 로컬 환경에서는 재현되지 않는 운영 서버만의 특수한 에러를 잡아야 할 때 사용합니다.
- **복잡한 프론트엔드/백엔드 아키텍처**: MSA(Microservices Architecture) 환경에서 에러의 근원지를 파악하기 어려울 때 매우 유용합니다.

## 어떻게 Sentry를 연동할까?

Sentry는 다양한 언어와 프레임워크를 지원합니다. 대표적으로 많이 사용되는 **React**와 **Node.js**에서의 연동 방법을 살펴보겠습니다.

### 1. React (Frontend) 연동

React에서는 `@sentry/react` 패키지를 사용하여 간편하게 설정할 수 있습니다.

```javascript
import React from "react";
import * as Sentry from "@sentry/react";

// Sentry 초기화
Sentry.init({
  dsn: "YOUR_SENTRY_DSN", // Sentry 프로젝트 대시보드에서 확인 가능
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0, // 성능 측정 비율 (1.0 = 100%)
});

function App() {
  return (
    // Sentry ErrorBoundary로 감싸기
    <Sentry.ErrorBoundary fallback={<p>에러가 발생했습니다.</p>}>
      <MyComponent />
    </Sentry.ErrorBoundary>
  );
}
```

### 2. Node.js (Backend) 연동

Express 프레임워크를 사용하는 경우, 미들웨어 형태로 에러를 수집합니다.

```javascript
const express = require("express");
const Sentry = require("@sentry/node");

const app = express();

// 반드시 다른 핸들러보다 먼저 초기화해야 합니다.
Sentry.init({ dsn: "YOUR_SENTRY_DSN" });

// 요청 핸들러
app.use(Sentry.Handlers.requestHandler());

app.get("/", function mainHandler(req, res) {
  throw new Error("Sentry Test Error!"); // 테스트 에러 발생
});

// 에러 핸들러 (반드시 다른 미들웨어 뒤, 라우트 뒤에 위치)
app.use(Sentry.Handlers.errorHandler());

app.listen(3000);
```

### 3. FastAPI (Python) 연동

Python의 FastAPI에서도 `sentry-sdk`를 사용하여 간단하게 연동할 수 있습니다.

```python
import sentry_sdk
from fastapi import FastAPI

sentry_sdk.init(
    dsn="YOUR_SENTRY_DSN",
    # 성능 모니터링을 위한 설정
    traces_sample_rate=1.0,
    # 프로파일링 설정 (선택 사항)
    profiles_sample_rate=1.0,
)

app = FastAPI()

@app.get("/")
async def root():
    # 의도적으로 에러 발생
    1 / 0
    return {"message": "Hello World"}
```

## Sentry 요금제 비교

프로젝트의 규모와 필요 기능에 따라 적절한 요금제를 선택하는 것이 중요합니다. 주요 요금제별 차이점은 다음과 같습니다.

| 구분 | Developer (Free) | Team | Business | Enterprise |
| :--- | :--- | :--- | :--- | :--- |
| **대상** | 개인 개발자, 테스트용 | 소규모 팀 | 중소기업, 성장하는 팀 | 대기업 |
| **가격** | $0 (무료) | 약 $26 / 월~ | 약 $80 / 월~ | 별도 문의 |
| **사용자 수** | 1명 | 무제한 | 무제한 | 무제한 |
| **데이터 보관** | 30일 | 90일 | 90일 | 90일 이상 |
| **핵심 기능** | 기본 에러 트래킹 | 이슈 할당, 알림 통합 | SSO, SAML, 고급 분석 | 보안 및 규정 준수 |
| **이벤트 한도** | 제한적 (기본 할당) | 유료 할당 가능 | 대용량 처리 가능 | 맞춤형 |

> **참고**: 개인 사이드 프로젝트나 초기 개발 단계에서는 **Developer** 플랜으로도 충분한 기능을 활용할 수 있습니다. 팀 단위 협업과 에러 관리 프로세스가 필요한 경우에는 이슈 할당 기능이 포함된 **Team** 이상의 플랜이 주로 사용됩니다.

## Sentry에서 로그와 에러 확인하기

에러가 발생하면 Sentry 대시보드에서 어떻게 구체적으로 정보를 확인하는지 단계별로 알아보겠습니다.

### 1. Issues (이슈 리스트)

Sentry의 메인 화면인 **Issues** 탭에서는 발생한 에러들이 그룹화되어 나타납니다. 여기서 다음 정보를 한눈에 볼 수 있습니다:
- **Events**: 해당 에러가 총 몇 번 발생했는지
- **Users**: 몇 명의 사용자가 이 에러를 경험했는지
- **Last Seen**: 가장 최근에 언제 발생했는지

### 2. Stack Trace (코드 실행 경로)

특정 이슈를 클릭해 들어가면 **Stack Trace** 섹션을 볼 수 있습니다. 
- 에러가 발생한 **정확한 파일명과 라인 번호**를 표시합니다.
- 로컬 환경이 아니더라도 실제 소스 코드의 어느 지점에서 문제가 생겼는지 즉시 파악할 수 있습니다.

### 3. Breadcrumbs (사용자 활동 경로)

**Breadcrumbs**는 에러 발생 직전의 기록입니다. 디버깅에서 가장 강력한 도구 중 하나입니다.
- 사용자가 어떤 버튼을 눌렀는지(UI Click)
- 어떤 API 요청이 나갔고 어떤 응답을 받았는지(XHR/Fetch)
- `console.log`로 남긴 기록들

### 4. Tags (환경 정보)

이슈 하단의 **Tags** 섹션에서는 다음과 같은 메타데이터를 확인하여 특정 환경의 문제인지 파악합니다.
- **browser**: Chrome, Safari 등 브라우저 종류
- **os**: Windows, macOS, iOS 등 운영체제
- **url**: 에러가 발생한 페이지 주소
- **user**: 로그인된 사용자의 ID나 이메일 (설정 시)

## Sentry 자체 호스팅 (Self-Hosted)

Sentry는 클라우드 서비스(SaaS)뿐만 아니라, 사용자의 인프라에 직접 설치하여 운영할 수 있는 **자체 호스팅(Self-Hosted)**[^3] 옵션도 제공합니다.

### 왜 자체 호스팅을 사용할까?

1. **데이터 보안 및 규정 준수**: 민감한 사용자 데이터를 외부 클라우드에 전송할 수 없는 보안 규정이 있는 경우 유용합니다.
2. **비용 절감**: 에러 발생량이 매우 많은 서비스의 경우, 클라우드 비용보다 자체 서버 운영 비용이 더 저렴할 수 있습니다.
3. **데이터 보관 기간**: 클라우드 무료/저가 플랜의 짧은 데이터 보관 기간 제한 없이 원하는 만큼 데이터를 쌓아둘 수 있습니다.

### 설치 및 운영 환경

Sentry 자체 호스팅은 **Docker**와 **Docker Compose**를 기반으로 한 `self-hosted` 리포지토리를 통해 설치합니다.

- **최소 사양**: 4 vCPU, 16GB RAM, 20GB 이상의 여유 공간
- **주요 구성 요소**: PostgreSQL, Redis, Kafka, ClickHouse, Snuba 등 매우 복잡한 아키텍처로 구성되어 있어 관리에 공수가 필요합니다.

### 설치 과정 요약

```bash
# 1. self-hosted 리포지토리 클론
git clone https://github.com/getsentry/self-hosted.git
cd self-hosted

# 2. 설치 스크립트 실행 (환경 점검 및 도커 이미지 빌드)
./install.sh

# 3. 서비스 실행
docker-compose up -d
```

> **주의**: Sentry는 내부적으로 많은 오픈소스 컴포넌트를 사용하므로 운영 난이도가 높은 편입니다. 인프라 관리 리소스가 부족한 소규모 팀의 경우 클라우드(SaaS) 버전이 대안이 될 수 있습니다.

## 실전 활용 시나리오

*Sentry 대시보드에서 에러의 원인을 분석하는 화면 예시*

![Sentry 이슈 대시보드 예시](/assets/images/2026-01-06-sentry-guide/sentry-dashboard.png)

에러가 발생하면 Sentry 대시보드에서 다음과 같은 작업을 수행할 수 있습니다.

1. **이슈 할당**: 담당 개발자에게 해당 에러 수정을 할당(Assign)합니다.
2. **사용자 환경 확인**: Chrome 브라우저의 특정 버전에서만 발생하는 에러인지 확인합니다.
3. **릴리즈 추적**: 특정 버전 배포 이후에 새로운 에러가 급증했는지 파악합니다.

## 마무리

Sentry는 에러 수집뿐만 아니라 개발 팀의 생산성을 높여주는 모니터링 도구입니다. 이 글에서 다룬 핵심 내용은 다음과 같습니다.

1. **에러 추적**: 실시간 알림과 상세한 Stack Trace를 통한 빠른 대응 가능
2. **분석 도구**: Breadcrumbs와 Tags를 활용한 에러 발생 전후 맥락 파악
3. **유연한 연동**: React, Node.js, FastAPI 등 다양한 환경 지원
4. **운영 옵션**: SaaS 버전의 편리함과 Self-Hosted 버전의 데이터 제어권 선택 가능

---

**참고 자료:**

[^1]: [Sentry 공식 홈페이지](https://sentry.io/) - 전 세계 개발자들이 사용하는 에러 모니터링 솔루션
[^2]: [Sentry Documentation](https://docs.sentry.io/) - 각 언어 및 프레임워크별 상세 가이드
[^3]: [Sentry Self-Hosted GitHub](https://github.com/getsentry/self-hosted) - 자체 호스팅 설치 가이드 및 리포지토리

