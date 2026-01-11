---
layout: single
title: "AJAX란 무엇인가? 비동기 자바스크립트 통신 개념 이해하기"
date: 2026-01-11
last_modified_at: 2026-01-11T17:15:00+09:00
categories:
  - frontend
tags:
  - ajax
  - javascript
  - frontend
  - webdev
author: Daniel
excerpt: "AJAX의 정의부터 동작 원리, 그리고 현대 웹 개발에서 XML 대신 JSON을 사용하는 이유와 실전 활용 예시까지 완벽하게 정리합니다."
toc: true
toc_sticky: true
toc_label: "목차"
---

## 들어가며
웹 페이지에서 버튼을 클릭할 때마다 화면 전체가 새로고침되어 '깜빡'이는 현상을 경험해 보셨나요? 과거의 웹은 작은 데이터 하나를 변경하려 해도 서버로부터 전체 HTML을 다시 받아와야 했습니다. 하지만 오늘날 우리가 사용하는 구글 맵이나 페이스북은 페이지 전환 없이도 실시간으로 데이터를 주고받습니다. 이러한 사용자 경험의 혁신을 가능하게 만든 핵심 기술이 바로 **AJAX**입니다.

이번 포스트에서는 AJAX의 정의와 동작 원리, 그리고 현대적인 구현 방식에 대해 살펴보겠습니다.

## AJAX란 무엇인가?
**AJAX(Asynchronous JavaScript and XML)**는 이름 그대로 자바스크립트를 이용해 **비동기적**으로 서버와 데이터를 주고받는 기술을 의미합니다. [^1]

*   **Asynchronous (비동기성)**: 서버에 데이터를 요청한 후, 응답이 올 때까지 기다리지 않고 다른 작업을 계속 수행할 수 있습니다.
*   **JavaScript**: 브라우저 내장 객체인 `XMLHttpRequest`나 최신 `fetch` API를 사용하여 통신을 제어합니다.
*   **XML**: 초기에는 데이터 교환 포맷으로 XML을 주로 사용했으나, 현재는 가볍고 다루기 쉬운 **JSON(JavaScript Object Notation)**이 표준으로 자리 잡았습니다.

## AJAX의 동작 원리
AJAX의 핵심은 브라우저가 직접 페이지 전체를 요청하는 대신, 백그라운드에서 자바스크립트를 통해 서버와 통신하는 데 있습니다.

1.  **이벤트 발생**: 사용자가 버튼 클릭 등의 액션을 취합니다.
2.  **요청 생성**: 자바스크립트가 서버로 보낼 요청(Request)을 생성합니다.
3.  **HTTP 요청**: 브라우저의 `XMLHttpRequest` 또는 `fetch` API가 백그라운드에서 서버에 데이터를 요청합니다.
4.  **서버 처리**: 서버는 요청을 받아 필요한 데이터를 처리하고 응답(Response)을 보냅니다.
5.  **데이터 수신 및 업데이트**: 자바스크립트가 응답 데이터를 받아 DOM(Document Object Model)을 조작하여 페이지의 **일부만** 업데이트합니다. [^2]

## AJAX 구현 방식: 과거와 현재

### 1. XMLHttpRequest (과거의 방식)
초기 AJAX 통신에 사용되던 방식입니다. 코드가 다소 복잡하고 가독성이 떨어지는 단점이 있습니다.

```javascript
var xhr = new XMLHttpRequest();
xhr.open('GET', 'https://api.example.com/data', true);
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4 && xhr.status === 200) {
    // ✅ 성공 시 처리
    console.log(JSON.parse(xhr.responseText));
  }
};
xhr.send();
```

### 2. Fetch API (현대적인 방식)
ES6에서 도입된 `fetch`는 Promise 기반으로 동작하며, 훨씬 간결하고 직관적인 문법을 제공합니다.

```javascript
// ✅ 올바른 예시: Fetch API와 async/await 사용
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) throw new Error('네트워크 응답 에러');
    
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('데이터 로드 실패:', error);
  }
}

// ❌ 잘못된 예시: 에러 처리가 없는 고전적 콜백 방식
// fetch는 404나 500 에러 시에도 reject되지 않으므로 response.ok 체크가 필수입니다.
```

## 실전 활용 시나리오

### 1. 실시간 검색어 추천
사용자가 검색창에 한 글자를 입력할 때마다 AJAX 요청을 보내 관련 검색어를 실시간으로 보여줍니다. 페이지 새로고침 없이 빠른 피드백을 줄 수 있습니다.

### 2. 무한 스크롤 (Infinite Scroll)
사용자가 페이지 하단에 도달했을 때, 다음 콘텐츠를 AJAX로 불러와 기존 리스트 아래에 추가합니다. [^3]

### 3. 좋아요/댓글 기능
'좋아요' 버튼을 누르면 서버에 해당 정보를 저장하고, 화면의 숫자만 1 증가시킵니다. 사용자는 현재 보던 화면의 맥락을 유지할 수 있습니다.

## 마무리
AJAX는 현대 웹 개발에서 빼놓을 수 없는 필수 기술입니다.

1.  **비동기성**: 페이지 새로고침 없이 백그라운드에서 서버와 통신합니다.
2.  **사용자 경험(UX)**: 웹 페이지를 마치 데스크톱 애플리케이션처럼 부드럽게 작동하게 합니다.
3.  **데이터 포맷**: XML에서 JSON으로 변화해 왔으며, 최신 `fetch` API를 사용하는 것이 권장됩니다.

서버와의 효율적인 통신을 통해 더 나은 웹 서비스를 구축해 보시기 바랍니다.

---

**참고 자료:**

[^1]: [MDN Web Docs - AJAX](https://developer.mozilla.org/ko/docs/Web/Guide/AJAX) - AJAX의 기초 개념과 가이드
[^2]: [W3Schools - AJAX Introduction](https://www.w3schools.com/xml/ajax_intro.asp) - AJAX의 동작 원리와 예제
[^3]: [Wikipedia - AJAX](https://en.wikipedia.org/wiki/Ajax_(programming)) - AJAX 기술의 역사와 배경
