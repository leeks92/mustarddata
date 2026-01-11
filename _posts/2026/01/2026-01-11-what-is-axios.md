---
layout: single
title: "axios란 무엇인가: 브라우저와 Node.js를 위한 HTTP 클라이언트"
date: 2026-01-11
last_modified_at: 2026-01-11T22:37:08+09:00
categories:
  - frontend
tags:
  - axios
  - javascript
  - http
  - frontend
  - backend
author: Daniel
excerpt: "브라우저와 Node.js 환경에서 널리 사용되는 HTTP 클라이언트 Axios의 개념, 주요 특징, 그리고 Fetch API와의 차이점을 상세히 알아봅니다."
toc: true
toc_sticky: true
toc_label: "목차"
---

## 들어가며
웹 개발을 하다 보면 서버와 데이터를 주고받기 위해 HTTP 통신을 필수로 수행하게 됩니다. 자바스크립트 생태계에는 이를 돕는 여러 도구가 있지만, 그중에서도 **Axios**는 가장 대중적이고 강력한 라이브러리로 손꼽힙니다.

기본적인 `fetch` API가 있음에도 불구하고 왜 수많은 개발자가 여전히 Axios를 선택하는지, 그 이유와 핵심 기능을 상세히 살펴보겠습니다.

## Axios란 무엇인가?
**Axios**는 브라우저와 Node.js 환경에서 사용할 수 있는 **Promise 기반의 HTTP 클라이언트 라이브러리**입니다.[^1] 

동일한 코드베이스로 클라이언트(브라우저)와 서버(Node.js) 양쪽에서 동작하는 **이형(Isomorphic)** 특성을 가지고 있으며, 내부적으로는 브라우저의 `XMLHttpRequest`와 Node.js의 `http` 모듈을 사용하여 통신을 처리합니다.

## Axios의 주요 특징
Axios가 `fetch` API보다 선호되는 이유는 개발자 편의성을 고려한 강력한 기능들 덕분입니다.

### 1. 인터셉터 (Interceptors)
요청(Request)이나 응답(Response)이 처리되기 전에 가로채서 특정 로직을 실행할 수 있습니다. 예를 들어, 모든 요청 헤더에 인증 토큰을 자동으로 추가하거나, 에러 응답이 왔을 때 공통적으로 처리하는 로직을 구현할 수 있습니다.

```javascript
// 요청 인터셉터 추가
axios.interceptors.request.use(function (config) {
    // 요청을 보내기 전에 토큰 추가 등의 작업 수행
    config.headers.Authorization = 'Bearer token';
    return config;
  }, function (error) {
    return Promise.reject(error);
  });
```

### 2. 자동 JSON 변환
`fetch`를 사용할 때는 응답 데이터를 처리하기 위해 `response.json()`을 매번 호출해야 하지만, Axios는 응답 본문을 자동으로 JSON으로 변환하여 `response.data`에 담아줍니다.

### 3. 요청 취소 및 타임아웃
진행 중인 HTTP 요청을 중단시키거나, 서버 응답이 너무 오래 걸릴 경우 타임아웃을 설정하는 기능을 내장하고 있습니다.

### 4. XSRF 보호
사이트 간 요청 위조(Cross-Site Request Forgery)를 방지하기 위한 보안 기능을 기본적으로 제공합니다.[^2]

## Axios vs Fetch API
두 도구의 주요 차이점을 요약하면 다음과 같습니다.

| 특징 | Axios | Fetch API |
| :--- | :--- | :--- |
| **설치** | 별도 설치 필요 (`npm install axios`) | 내장 API (설치 불필요) |
| **JSON 변환** | 자동 변환 지원 | `res.json()` 수동 호출 필요 |
| **인터셉터** | 기본 지원 | 직접 구현 필요 |
| **타임아웃** | `timeout` 설정 지원 | `AbortController` 등으로 구현 필요 |
| **브라우저 지원** | 구형 브라우저 포함 폭넓은 지원 | 최신 브라우저 위주 지원 |

## 실전 활용 예시
Axios를 사용하는 가장 기본적인 형태는 다음과 같습니다.

### GET 요청 예시
```javascript
async function getUserData(userId) {
  try {
    // params 옵션을 통해 쿼리 스트링 전달 가능
    const response = await axios.get(`/users/${userId}`, {
      params: { detail: true }
    });
    
    // response.data에 결과가 자동으로 파싱됨
    console.log(response.data);
  } catch (error) {
    console.error('데이터 조회 실패:', error);
  }
}
```

### POST 요청 예시
```javascript
async function createUser(userData) {
  try {
    const response = await axios.post('/users', userData);
    console.log('생성 완료:', response.data);
  } catch (error) {
    if (error.response) {
      // 서버가 2xx 범위를 벗어난 상태 코드로 응답한 경우
      console.log(error.response.status);
    }
  }
}
```

## 마무리
Axios는 단순한 HTTP 통신을 넘어, 가독성 높은 코드 작성과 유지보수가 용이한 네트워크 아키텍처를 구축하는 데 매우 효과적인 도구입니다.

- **Promise 기반**으로 비동기 처리가 간편함
- **인터셉터**를 통한 공통 로직 처리의 강력함
- **자동 데이터 변환**으로 코드 간결성 확보
- **넓은 호환성**과 보안 기능 제공

프로젝트의 규모가 크고 복잡한 API 통신이 많다면, Axios는 여전히 좋은 선택이 될 수 있습니다.

---

**참고 자료:**

[^1]: [Axios 공식 문서](https://axios-http.com/docs/intro) - Axios의 개요 및 시작하기 가이드
[^2]: [MDN XMLHttpRequest](https://developer.mozilla.org/ko/docs/Web/API/XMLHttpRequest) - Axios의 내부 동작 기반이 되는 API 설명
