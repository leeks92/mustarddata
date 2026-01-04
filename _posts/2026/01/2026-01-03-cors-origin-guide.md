---
layout: single
title: " CORS policy 에러로 알아보는 CORS, Origin 개념잡기"
date: 2026-01-03
last_modified_at: 2026-01-03T14:30:00+09:00
categories:
  - frontend
tags:
  - cors
  - origin
  - web-security
  - http
author: Daniel
excerpt: "CORS와 Origin의 개념부터 실제 해결 방법까지, 웹 개발에서 자주 마주치는 크로스 오리진 요청 문제를 완벽하게 이해하고 해결하는 방법을 알아봅니다."
toc: true
toc_sticky: true
toc_label: "목차"
related_posts:
  - 2026-01-04-dns-records-guide.md
---

## 들어가며

웹 개발을 하다 보면 다음과 같은 에러를 콘솔에서 자주 마주치게 됩니다.

``` js
Access to fetch at 'https://api.example.com/data' from origin 'https://myapp.com' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

이 에러는 **CORS(Cross-Origin Resource Sharing)** 정책 때문에 발생합니다. 이 글에서는 CORS와 Origin의 개념을 이해하고, 실제 개발 상황에서 어떻게 해결할 수 있는지 알아보겠습니다.

## Origin이란?

### Origin의 정의

**Origin(출처)**은 웹 페이지의 프로토콜, 도메인, 포트를 조합한 고유 식별자로 Origin의 구성요소 중 하나라도 다르면 다른 Origin입니다. 

Origin은 다음 세 가지 요소로 구성됩니다:
1. **프로토콜(Protocol)**: `http://` 또는 `https://`
2. **도메인(Domain)**: `example.com`
3. **포트(Port)**: `:80`, `:3000`, `:8080` 등

### Origin 예시

```javascript
// 같은 Origin
https://example.com/page1  → Origin: https://example.com
https://example.com/page2  → Origin: https://example.com

// 다른 Origin (프로토콜이 다름)
http://example.com  → Origin: http://example.com
https://example.com → Origin: https://example.com

// 다른 Origin (도메인이 다름)
https://example.com → Origin: https://example.com
https://api.example.com → Origin: https://api.example.com

// 다른 Origin (포트가 다름)
https://example.com → Origin: https://example.com
https://example.com:3000 → Origin: https://example.com:3000
```

### JavaScript에서 Origin 확인하기

```javascript
// 현재 페이지의 Origin 확인
console.log(window.location.origin);
// 예시: https://example.com

// URL에서 Origin 추출
const url = new URL('https://example.com:3000/path?query=1');
console.log(url.origin);
// 예시: https://example.com:3000
```

## Same-Origin Policy (동일 출처 정책)

### Same-Origin Policy란?

**Same-Origin Policy(동일 출처 정책)**[^2]는 브라우저의 보안 메커니즘으로, 한 Origin에서 로드된 스크립트가 다른 Origin의 리소스에 접근하는 것을 제한합니다.

### Same-Origin Policy의 목적

1. **쿠키 보호**: 다른 사이트가 사용자의 쿠키를 읽거나 수정하는 것을 방지
2. **CSRF 공격 방지**: 악의적인 사이트가 사용자 인증 정보를 이용해 요청을 보내는 것을 방지
3. **데이터 유출 방지**: 민감한 정보가 다른 Origin으로 전송되는 것을 차단

### Same-Origin Policy가 적용되는 경우

```javascript
// ❌ 차단됨: 다른 Origin으로의 ajax 요청
fetch('https://api.example.com/data')
  .then(response => response.json())
  .catch(error => console.error('CORS error:', error));

// ❌ 차단됨: 다른 Origin의 iframe 접근
const iframe = document.querySelector('iframe');
iframe.contentWindow.document; // SecurityError 발생

// ✅ 허용됨: 같은 Origin으로의 요청
fetch('/api/data')
  .then(response => response.json());
```

## CSRF (Cross-Site Request Forgery)란?

### CSRF 공격이란?

**CSRF(Cross-Site Request Forgery)**[^5]는 사용자가 의도하지 않은 요청을 악의적인 웹사이트가 대신 보내는 공격입니다. 사용자가 로그인한 상태에서 악의적인 사이트를 방문하면, 해당 사이트가 사용자의 인증 정보(쿠키 등)를 이용해 사용자 모르게 요청을 보낼 수 있습니다.

### CSRF 공격 예시

```html
<!-- 악의적인 사이트 (evil.com) -->
<img src="https://bank.com/transfer?to=attacker&amount=1000" />

<!-- 사용자가 이 이미지를 보는 순간, 
     로그인된 bank.com 세션으로 자동으로 송금 요청이 전송됨 -->
```

### CORS와 CSRF의 관계

- **CORS는 CSRF를 완전히 막지 못합니다**: CORS는 브라우저의 정책이지만, 서버가 CORS를 허용하면 CSRF 공격이 여전히 가능할 수 있습니다.
- **CORS + CSRF 토큰**: CORS를 사용하더라도 CSRF 토큰을 함께 사용하여 보안을 강화해야 합니다.

### CSRF 방어 방법

1. **CSRF 토큰 사용**: 서버에서 생성한 토큰을 요청에 포함
2. **SameSite 쿠키**: 쿠키에 `SameSite=Strict` 속성 설정
3. **Referer 검증**: 요청의 Referer 헤더 확인

## CORS (Cross-Origin Resource Sharing)

### CORS란?

**CORS(Cross-Origin Resource Sharing)**[^1]는 Same-Origin Policy를 완화하여, 서버가 명시적으로 허용하는 경우 다른 Origin에서 리소스에 접근할 수 있도록 하는 메커니즘입니다.

### CORS 동작 방식

CORS는 **프리플라이트(Preflight) 요청**과 **실제 요청** 두 단계로 이루어집니다.

#### 1. Simple Request (단순 요청)

다음 조건을 모두 만족하면 프리플라이트 없이 바로 요청이 전송됩니다:

- 메서드: `GET`, `POST`, `HEAD`만 허용
- 헤더: 특정 헤더만 허용 (`Content-Type`은 `text/plain`, `multipart/form-data`, `application/x-www-form-urlencoded`만)
- 커스텀 헤더 없음

```javascript
// Simple Request 예시
fetch('https://api.example.com/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'text/plain'
  }
});
```

#### 2. Preflight Request (프리플라이트 요청)

Simple Request 조건을 만족하지 않으면, 브라우저가 먼저 **OPTIONS** 메서드로 프리플라이트 요청을 보냅니다.

```javascript
// Preflight가 필요한 요청
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  body: JSON.stringify({ data: 'value' })
});
```

**프리플라이트 요청 흐름:**

```
1. 브라우저 → 서버: OPTIONS 요청 (프리플라이트)
   Headers:
     Origin: https://myapp.com
     Access-Control-Request-Method: POST
     Access-Control-Request-Headers: content-type, authorization

2. 서버 → 브라우저: OPTIONS 응답
   Headers:
     Access-Control-Allow-Origin: https://myapp.com
     Access-Control-Allow-Methods: POST, GET, OPTIONS
     Access-Control-Allow-Headers: content-type, authorization
     Access-Control-Max-Age: 86400

3. 브라우저 → 서버: 실제 POST 요청 (프리플라이트 성공 시)
```

### CORS 헤더 설명

#### 서버에서 설정하는 CORS 헤더

| 헤더 | 설명 | 예시 |
|------|------|------|
| `Access-Control-Allow-Origin` | 허용할 Origin 지정 | `*` 또는 `https://example.com` |
| `Access-Control-Allow-Methods` | 허용할 HTTP 메서드 | `GET, POST, PUT, DELETE` |
| `Access-Control-Allow-Headers` | 허용할 요청 헤더 | `Content-Type, Authorization` |
| `Access-Control-Allow-Credentials` | 쿠키/인증 정보 포함 허용 | `true` |
| `Access-Control-Max-Age` | 프리플라이트 캐시 시간(초) | `86400` (24시간) |
| `Access-Control-Expose-Headers` | 클라이언트가 읽을 수 있는 응답 헤더 | `X-Custom-Header` |

#### 클라이언트에서 보내는 CORS 헤더

| 헤더 | 설명 |
|------|------|
| `Origin` | 요청을 보내는 Origin |
| `Access-Control-Request-Method` | 실제 요청에서 사용할 메서드 (프리플라이트) |
| `Access-Control-Request-Headers` | 실제 요청에서 사용할 헤더 (프리플라이트) |

## 실제 구현 예시

### 서버 측 구현 (Node.js/Express)

```javascript
const express = require('express');
const app = express();

// CORS 미들웨어 설정
app.use((req, res, next) => {
  // 허용할 Origin 목록
  const allowedOrigins = [
    'https://myapp.com',
    'https://www.myapp.com',
    'http://localhost:3000' // 개발 환경
  ];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // 인증 정보 포함 허용 (쿠키, Authorization 헤더 등)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // 프리플라이트 요청 처리
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24시간 캐시
    return res.sendStatus(200);
  }
  
  next();
});

// 또는 cors 라이브러리 사용
const cors = require('cors');
app.use(cors({
  origin: ['https://myapp.com', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/api/data', (req, res) => {
  res.json({ message: 'CORS가 설정된 응답입니다!' });
});

app.listen(3000);
```

### 클라이언트 측 구현 (JavaScript)

```javascript
// 기본 fetch 요청
fetch('https://api.example.com/data', {
  method: 'GET',
  credentials: 'include', // 쿠키 포함 (서버에서 Allow-Credentials 필요)
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error('CORS Error:', error));

// Axios 사용 시
const axios = require('axios');

axios.get('https://api.example.com/data', {
  withCredentials: true, // 쿠키 포함
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => console.log(response.data))
  .catch(error => console.error('CORS Error:', error));
```

## CORS 에러 해결 방법

### 1. 서버에서 CORS 헤더 설정 (권장)

가장 올바른 방법은 **서버에서 CORS 헤더를 설정**하는 것입니다.

```javascript
// ❌ 잘못된 방법: 클라이언트에서 해결 불가능
// CORS는 브라우저 정책이므로 클라이언트 코드로 우회 불가

// ✅ 올바른 방법: 서버에서 CORS 헤더 설정
res.setHeader('Access-Control-Allow-Origin', 'https://myapp.com');
```

### 2. 개발 환경에서 프록시 사용

개발 중에는 프록시를 사용하여 CORS 문제를 우회할 수 있습니다.

**Vite 설정 (vite.config.js):**
```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
};
```

**Create React App (package.json):**
```json
{
  "proxy": "https://api.example.com"
}
```

### 3. 서버리스 함수 사용

Netlify Functions, Vercel Functions 등을 사용하여 서버 측에서 API를 호출하면 CORS 문제를 피할 수 있습니다.

```javascript
// Netlify Function 예시
exports.handler = async (event, context) => {
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };
};
```

## 주의사항 및 보안 고려사항

### 1. `Access-Control-Allow-Origin: *` 사용 시 주의

```javascript
// ⚠️ 위험: 모든 Origin 허용
res.setHeader('Access-Control-Allow-Origin', '*');

// ⚠️ 문제: credentials와 함께 사용 불가
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Credentials', 'true');
// → 브라우저가 에러 발생

// ✅ 안전: 특정 Origin만 허용
res.setHeader('Access-Control-Allow-Origin', 'https://myapp.com');
res.setHeader('Access-Control-Allow-Credentials', 'true');
```

### 2. 민감한 정보 노출 방지

```javascript
// ❌ 위험: 에러 메시지에 민감한 정보 포함
res.status(500).json({
  error: 'Database password: xyz123'
});

// ✅ 안전: 일반적인 에러 메시지만 반환
res.status(500).json({
  error: 'Internal server error'
});
```

### 3. CSRF 토큰 사용

CORS를 허용하더라도 CSRF 공격을 방지하기 위해 토큰을 사용하세요.

```javascript
// 서버에서 CSRF 토큰 생성
const csrfToken = generateToken();
res.cookie('csrf-token', csrfToken, { httpOnly: false });

// 클라이언트에서 토큰 포함하여 요청
fetch('/api/data', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': getCookie('csrf-token')
  }
});
```

## 실전 문제 해결 시나리오

### 시나리오 1: API 서버와 프론트엔드가 다른 도메인

**문제:**
- 프론트엔드: `https://myapp.com`
- API 서버: `https://api.myapp.com`

**해결:**
```javascript
// API 서버에서 설정
app.use(cors({
  origin: 'https://myapp.com',
  credentials: true
}));
```

### 시나리오 2: 개발 환경에서 localhost 사용

**문제:**
- 개발: `http://localhost:3000` → `http://localhost:8000`
- 프로덕션: `https://myapp.com` → `https://api.myapp.com`

**해결:**
```javascript
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://myapp.com']
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### 시나리오 3: 쿠키가 전송되지 않음

**문제:** `credentials: 'include'`를 설정했는데도 쿠키가 전송되지 않음

**해결:**
```javascript
// 클라이언트
fetch('https://api.example.com/data', {
  credentials: 'include' // 쿠키 포함
});

// 서버
res.setHeader('Access-Control-Allow-Origin', 'https://myapp.com');
res.setHeader('Access-Control-Allow-Credentials', 'true');
// ⚠️ 주의: Allow-Origin을 '*'로 설정하면 credentials 작동 안 함
```

**`credentials: 'include'`란?**

* `credentials: 'include'`[^4]는 fetch API에서 사용하는 옵션으로, **쿠키, 인증 헤더, TLS 클라이언트 인증서** 등 인증 정보를 요청에 포함하도록 설정합니다.

**주요 특징:**

1. **쿠키 포함**: Same-Origin과 Cross-Origin 요청 모두에서 쿠키를 자동으로 포함
2. **인증 헤더 포함**: Authorization 헤더 등 인증 관련 헤더를 포함
3. **서버 설정 필요**: 클라이언트에서 `credentials: 'include'`를 사용하려면 서버에서 `Access-Control-Allow-Credentials: true`를 설정해야 함

**다른 옵션들:**

```javascript
// credentials 옵션 값들
fetch(url, {
  credentials: 'omit'      // 인증 정보를 절대 포함하지 않음 (기본값)
});

fetch(url, {
  credentials: 'same-origin' // 같은 Origin 요청에만 인증 정보 포함
});

fetch(url, {
  credentials: 'include'    // 모든 요청에 인증 정보 포함
});
```

**주의사항:**

- `credentials: 'include'`를 사용할 때는 서버의 `Access-Control-Allow-Origin`이 `*`가 아닌 **구체적인 Origin**이어야 합니다
- 보안상 필요한 경우에만 사용하고, 불필요한 경우 `omit` 또는 `same-origin`을 사용하는 것이 좋습니다

## 마무리

CORS와 Origin은 웹 보안의 핵심 개념입니다. 이 글에서 다룬 내용을 정리하면,

1. **Origin의 이해**: 프로토콜, 도메인, 포트로 구성된 출처의 개념
2. **Same-Origin Policy**: 브라우저의 기본 보안 메커니즘
3. **CORS의 동작**: 프리플라이트 요청과 실제 요청의 흐름
4. **실전 해결 방법**: 서버 설정, 프록시, 서버리스 함수 활용
5. **보안 고려사항**: CSRF 방어와 credentials 옵션의 올바른 사용

올바르게 이해하고 구현하면 보안을 유지하면서도 필요한 경우 다른 Origin과 안전하게 통신할 수 있으며, CORS 에러를 빠르게 해결할 수 있습니다.

---

**참고 자료:**

[^1]: [MDN: CORS](https://developer.mozilla.org/ko/docs/Web/HTTP/CORS) - CORS에 대한 상세한 문서
[^2]: [MDN: Same-Origin Policy](https://developer.mozilla.org/ko/docs/Web/Security/Same-origin_policy) - 동일 출처 정책 설명
[^3]: [CORS 공식 명세](https://fetch.spec.whatwg.org/#http-cors-protocol) - WHATWG Fetch 표준의 CORS 프로토콜
[^4]: [MDN: Fetch API credentials](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API/Using_Fetch#credentials) - credentials 옵션 상세 설명
[^5]: [OWASP: CSRF](https://owasp.org/www-community/attacks/csrf) - CSRF 공격에 대한 상세 정보

