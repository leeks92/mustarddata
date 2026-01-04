---
layout: single
title: "DNS 레코드 간단 정리(CNAME과 A Record의 차이)"
date: 2026-01-04
last_modified_at: 2026-01-04T22:25:00+09:00
categories:
  - frontend
tags:
  - dns
  - cname
  - a-record
  - domain
  - webdev
author: Daniel
excerpt: "도메인을 설정할 때 CNAME과 A Record 중 어떤 것을 사용해야 할지 헷갈리셨나요? 두 레코드의 차이점과 언제 어떤 것을 사용해야 하는지 실전 예시와 함께 알아봅니다."
toc: true
toc_sticky: true
toc_label: "목차"
related_posts:
  - 2026-01-04-cloudfront-guide.md
  - 2026-01-03-cors-origin-guide.md
---

## 들어가며

도메인을 설정하다 보면 다음과 같은 상황을 마주하게 됩니다:

- `www.example.com`을 서버 IP 주소로 연결하려고 하는데, CNAME과 A Record 중 어떤 것을 사용해야 할지 모르겠다
- GitHub Pages나 Vercel 같은 서비스를 연결할 때 어떤 레코드를 사용해야 하는지 헷갈린다
- 서브도메인을 만들 때 CNAME을 사용해야 하는지 A Record를 사용해야 하는지 불명확하다

이런 혼란은 **CNAME**과 **A Record**의 차이를 명확히 이해하지 못해서 발생합니다. 이 글에서는 두 레코드의 차이점을 이해하고, 상황에 따라 적절하게 어떤 것을 사용해야 하는지 알아보겠습니다.

## DNS 기본 개념

### DNS란?

**DNS(Domain Name System)**[^1]는 사람이 읽을 수 있는 도메인 이름(예: `example.com`)을 컴퓨터가 이해할 수 있는 IP 주소(예: `192.0.2.1`)로 변환하는 시스템입니다.

### DNS 레코드의 역할

DNS 레코드는 도메인 이름을 특정 값으로 연결하는 규칙입니다. 각 레코드 타입은 다른 목적을 가지고 있습니다:

- **A Record**: 도메인을 IPv4 주소로 연결
- **AAAA Record**: 도메인을 IPv6 주소로 연결
- **CNAME Record**: 도메인을 다른 도메인 이름으로 연결
- **MX Record**: 이메일 서버 지정
- **TXT Record**: 텍스트 정보 저장 (SPF, DKIM 등)

## A Record란?

### A Record의 정의

**A Record(Address Record)**는 도메인 이름을 **IPv4 주소**로 직접 연결하는 DNS 레코드입니다. "A"는 "Address"를 의미합니다.

### A Record 구조

```
도메인 이름 → IPv4 주소
```

예시:
```
example.com → 192.0.2.1
www.example.com → 192.0.2.1
```

### A Record 설정 예시

```yaml
# DNS 설정 예시
Type: A
Name: @ (또는 example.com)
Value: 192.0.2.1
TTL: 3600

# 서브도메인도 A Record로 설정 가능
Type: A
Name: www
Value: 192.0.2.1
TTL: 3600
```

### A Record의 특징

1. **직접 IP 주소 연결**: 도메인을 IP 주소로 직접 매핑
2. **루트 도메인 사용 가능**: `example.com` (루트 도메인)에 직접 설정 가능
3. **빠른 응답**: IP 주소로 직접 연결되므로 추가 DNS 조회 불필요
4. **고정 IP 필요**: IP 주소가 변경되면 수동으로 업데이트해야 함

## CNAME Record란?

### CNAME Record의 정의

**CNAME Record(Canonical Name Record)**는 도메인 이름을 **다른 도메인 이름**으로 연결하는 DNS 레코드입니다. "CNAME"은 "Canonical Name"을 의미하며, 별칭(alias)을 만드는 역할을 합니다.

### CNAME Record 구조

```
도메인 이름 → 다른 도메인 이름 → (최종적으로) IP 주소
```

예시:
```
www.example.com → example.com → 192.0.2.1
```

### CNAME Record 설정 예시

```yaml
# DNS 설정 예시
Type: CNAME
Name: www
Value: example.com
TTL: 3600

# 또는 외부 서비스로 연결
Type: CNAME
Name: blog
Value: cname.vercel-dns.com
TTL: 3600
```

### CNAME Record의 특징

1. **도메인 간 연결**: 도메인을 다른 도메인으로 연결
2. **루트 도메인 사용 불가**: `example.com`에는 CNAME을 설정할 수 없음 (서브도메인만 가능)
3. **추가 DNS 조회**: 최종 IP 주소를 얻기 위해 추가 DNS 조회 필요
4. **유연성**: 대상 도메인의 IP가 변경되어도 자동으로 반영됨

## CNAME vs A Record 비교

### 주요 차이점

| 특징 | A Record | CNAME Record |
|------|----------|--------------|
| **연결 대상** | IPv4 주소 | 도메인 이름 |
| **루트 도메인 사용** | ✅ 가능 | ❌ 불가능 |
| **서브도메인 사용** | ✅ 가능 | ✅ 가능 |
| **DNS 조회** | 1회 (직접) | 2회 이상 (간접) |
| **IP 변경 대응** | 수동 업데이트 필요 | 자동 반영 |
| **성능** | 빠름 | 상대적으로 느림 |

### 언제 A Record를 사용해야 할까?

#### ✅ A Record를 사용하는 경우

1. **루트 도메인 연결** (`example.com`)
   ```yaml
   Type: A
   Name: @
   Value: 192.0.2.1
   ```

2. **고정 IP 주소를 가진 서버**
   ```yaml
   Type: A
   Name: api
   Value: 203.0.113.10
   ```

3. **성능이 중요한 경우**: 추가 DNS 조회를 피하고 싶을 때

4. **이메일 서버 설정**: MX 레코드와 함께 사용할 때

> **MX 레코드(Mail Exchange Record)**[^6]는 이메일 서버를 지정하는 DNS 레코드입니다. MX 레코드가 가리키는 도메인은 반드시 **A Record**로 IP 주소에 연결되어야 하며, CNAME을 사용할 수 없습니다.

#### ❌ A Record를 사용하지 말아야 할 경우

- IP 주소가 자주 변경되는 경우 (CDN, 클라우드 서비스 등)
- 외부 서비스(GitHub Pages, Vercel 등)를 연결할 때

### 언제 CNAME Record를 사용해야 할까?

#### ✅ CNAME Record를 사용하는 경우

1. **서브도메인을 루트 도메인으로 연결**
   ```yaml
   Type: CNAME
   Name: www
   Value: example.com
   ```

2. **외부 서비스 연결** (GitHub Pages, Vercel, Netlify 등)
   ```yaml
   Type: CNAME
   Name: blog
   Value: username.github.io
   ```

3. **IP 주소가 자주 변경되는 경우**
   ```yaml
   Type: CNAME
   Name: cdn
   Value: d1234abcdef.cloudfront.net
   ```

4. **여러 서브도메인을 같은 서버로 연결**
   ```yaml
   Type: CNAME
   Name: api
   Value: example.com
   
   Type: CNAME
   Name: www
   Value: example.com
   ```

#### ❌ CNAME Record를 사용하지 말아야 할 경우

- 루트 도메인 (`example.com`)에 설정하려고 할 때
- MX 레코드와 함께 사용해야 할 때 (CNAME과 MX는 같은 도메인에 공존 불가)

## 실전 활용 시나리오

### 시나리오 1: 루트 도메인과 www 서브도메인 설정

**목표**: `example.com`과 `www.example.com`을 같은 서버로 연결

**해결 방법**:

```yaml
# 루트 도메인: A Record 사용 (필수)
Type: A
Name: @
Value: 192.0.2.1

# www 서브도메인: CNAME으로 루트 도메인에 연결
Type: CNAME
Name: www
Value: example.com
```

**장점**:
- IP 주소가 변경되면 A Record만 수정하면 됨
- www는 자동으로 루트 도메인을 따라감

### 시나리오 2: GitHub Pages 연결

**목표**: `blog.example.com`을 GitHub Pages로 연결

**해결 방법**:

```yaml
# GitHub Pages는 CNAME만 지원
Type: CNAME
Name: blog
Value: username.github.io
```

**주의사항**:
- GitHub Pages는 CNAME만 지원하므로 A Record 사용 불가
- 루트 도메인을 GitHub Pages에 연결하려면 별도 설정 필요

### 시나리오 3: Vercel 배포 연결

**목표**: `app.example.com`을 Vercel 배포로 연결

**해결 방법**:

```yaml
# Vercel은 CNAME 사용
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

또는 Vercel에서 제공하는 다른 CNAME 값 사용:
```yaml
Type: CNAME
Name: app
Value: 76.76.21.21  # Vercel의 IP (A Record처럼 보이지만 실제로는 CNAME 권장)
```

### 시나리오 4: CloudFront CDN 연결

**목표**: `cdn.example.com`을 CloudFront 배포로 연결

**해결 방법**:

```yaml
# CloudFront는 CNAME 사용 권장
Type: CNAME
Name: cdn
Value: d1234abcdef.cloudfront.net
```

**이유**:
- CloudFront의 IP 주소는 동적으로 변경될 수 있음
- CNAME을 사용하면 IP 변경 시 자동으로 반영됨

### 시나리오 5: API 서버 연결

**목표**: `api.example.com`을 고정 IP를 가진 서버로 연결

**해결 방법**:

```yaml
# 고정 IP가 있는 경우 A Record 사용
Type: A
Name: api
Value: 203.0.113.10
```

또는 여러 IP로 로드 밸런싱:
```yaml
Type: A
Name: api
Value: 203.0.113.10

Type: A
Name: api
Value: 203.0.113.11

Type: A
Name: api
Value: 203.0.113.12
```

### 시나리오 6: 이메일 서버 설정 (MX 레코드)

**목표**: `example.com` 도메인으로 이메일을 받을 수 있도록 설정

**해결 방법**:

```yaml
# MX 레코드가 가리키는 도메인은 반드시 A Record로 설정
Type: MX
Name: @
Value: mail.example.com (우선순위: 10)

Type: A
Name: mail
Value: 203.0.113.50
```

**주의사항**: MX 레코드가 가리키는 도메인은 CNAME을 사용할 수 없으며, 반드시 A Record로 설정해야 합니다.

## 주의사항 및 제약사항

### 1. 루트 도메인에는 CNAME 사용 불가

```yaml
# ❌ 불가능: 루트 도메인에 CNAME 설정
Type: CNAME
Name: @
Value: example.com
# → DNS 에러 발생

# ✅ 올바른 방법: 루트 도메인은 A Record 사용
Type: A
Name: @
Value: 192.0.2.1
```

**이유**: DNS 표준에 따라 루트 도메인에는 CNAME을 설정할 수 없습니다. 루트 도메인에는 A Record나 다른 레코드 타입을 사용해야 합니다.

### 2. CNAME과 다른 레코드 공존 불가

같은 도메인 이름에 CNAME과 다른 레코드(A, MX 등)를 동시에 설정할 수 없습니다:

```yaml
# ❌ 불가능: 같은 도메인에 CNAME과 A Record 동시 설정
Type: CNAME
Name: example.com
Value: other.com

Type: A
Name: example.com
Value: 192.0.2.1
# → DNS 에러 발생
```

### 3. CNAME 체인 제한

CNAME은 체인을 만들 수 있지만, 너무 깊은 체인은 성능 문제를 일으킬 수 있습니다:

```yaml
# 가능하지만 권장하지 않음
Type: CNAME
Name: www
Value: example.com

Type: CNAME
Name: example.com
Value: other.com  # ❌ 루트 도메인에 CNAME 불가

# ✅ 권장: 최대 1단계 CNAME
Type: CNAME
Name: www
Value: example.com  # example.com은 A Record
```

### 4. 성능 고려사항

CNAME은 추가 DNS 조회가 필요하므로 약간의 지연이 발생할 수 있습니다:

```
A Record 조회:
  사용자 → DNS 서버 → IP 주소 (1회 조회)

CNAME 조회:
  사용자 → DNS 서버 → 다른 도메인 → DNS 서버 → IP 주소 (2회 조회)
```

하지만 현대적인 DNS 서버와 캐싱으로 인해 이 차이는 미미합니다.

## DNS 레코드 확인 방법

### 명령줄 도구 사용

#### `dig` 명령어

```bash
# A Record 확인
dig example.com A

# CNAME Record 확인
dig www.example.com CNAME

# 모든 레코드 확인
dig example.com ANY
```

#### `nslookup` 명령어

```bash
# A Record 확인
nslookup example.com

# CNAME Record 확인
nslookup -type=CNAME www.example.com
```

#### `host` 명령어

```bash
# A Record 확인
host example.com

# CNAME Record 확인
host -t CNAME www.example.com

# MX Record 확인
host -t MX example.com
```

### 온라인 도구 사용

- **[DNS Checker](https://dnschecker.org/)**: 전 세계 DNS 서버에서 DNS 레코드 확인
- **[MXToolbox](https://mxtoolbox.com/)**: DNS, MX, SPF 등 다양한 레코드 확인 도구
- **[What's My DNS](https://www.whatsmydns.net/)**: 전 세계 DNS 전파 상태 확인

## 마무리

DNS 레코드 설정은 웹사이트 운영의 기초입니다. 이 글에서 다룬 내용을 정리하면:

1. **A Record**: 도메인을 IPv4 주소로 직접 연결, 루트 도메인에 사용 가능
2. **CNAME Record**: 도메인을 다른 도메인으로 연결, 서브도메인에만 사용 가능
3. **선택 기준**: 고정 IP는 A Record, 외부 서비스나 유동 IP는 CNAME
4. **제약사항**: 루트 도메인에는 CNAME 사용 불가, CNAME과 다른 레코드 공존 불가
5. **이메일 서버**: MX 레코드가 가리키는 도메인은 반드시 A Record로 설정해야 함

올바른 레코드 타입을 선택하면 도메인 관리가 쉬워지고, IP 주소 변경 시에도 유연하게 대응할 수 있으며, 외부 서비스와의 통합도 원활하게 진행할 수 있습니다.

---

**참고 자료:**

[^1]: [MDN: DNS란 무엇인가?](https://developer.mozilla.org/ko/docs/Glossary/DNS) - DNS의 기본 개념과 동작 방식
[^2]: [Cloudflare: DNS 레코드 타입](https://www.cloudflare.com/learning/dns/dns-records/) - 다양한 DNS 레코드 타입 설명
[^3]: [AWS Route 53: DNS 레코드 타입](https://docs.aws.amazon.com/ko_kr/Route53/latest/DeveloperGuide/ResourceRecordTypes.html) - Route 53에서 지원하는 DNS 레코드 타입
[^4]: [RFC 1034: Domain Names - Concepts and Facilities](https://tools.ietf.org/html/rfc1034) - DNS 표준 명세서
[^5]: [RFC 2181: Clarifications to the DNS Specification](https://tools.ietf.org/html/rfc2181) - CNAME 제약사항에 대한 명세
[^6]: [RFC 5321: Simple Mail Transfer Protocol](https://tools.ietf.org/html/rfc5321) - SMTP 및 MX 레코드에 대한 표준 명세

