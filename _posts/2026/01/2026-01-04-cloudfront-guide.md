---
layout: single
title: "[AWS] CloudFront 바르게 이해하기"
date: 2026-01-04
last_modified_at: 2026-01-04T22:47:08+09:00
categories:
  - cloud
tags:
  - aws
  - cloudfront
  - s3
  - cdn
  - cloud
author: Daniel
excerpt: "Amazon CloudFront를 올바르게 설정하고 활용하는 방법을 알아봅니다. S3와의 통합, OAC 설정, 성능 최적화, 보안 강화까지 실전 가이드."
toc: true
toc_sticky: true
toc_label: "목차"
related_posts:
  - 2026-01-04-cloudfront-vs-ecs-comparison.md
  - 2026-01-04-dns-records-guide.md
---

## 들어가며

정적 웹사이트를 운영하다 보면 다음과 같은 문제를 마주하게 됩니다:

- 전 세계 사용자에게 빠른 콘텐츠 전송이 필요함
- S3에서 직접 파일을 제공하면 비용이 높아짐
- 보안을 위해 S3 버킷을 공개하지 않고 싶음
- 이미지나 동영상 같은 대용량 파일의 로딩 속도가 느림

이런 문제들을 해결하기 위해 **Amazon CloudFront**를 사용할 수 있습니다. CloudFront는 AWS의 콘텐츠 전송 네트워크(CDN) 서비스로, 전 세계 엣지 로케이션을 통해 사용자에게 콘텐츠를 빠르고 안전하게 전달합니다[^1]. 이 글에서는 CloudFront를 올바르게 설정하고 활용하는 방법을 알아봅니다.

## CloudFront란?

### 기본 개념

**Amazon CloudFront**는 전 세계에 분산된 엣지 로케이션(Edge Location)을 통해 콘텐츠를 캐싱하고 전송하는 CDN 서비스입니다. 사용자가 콘텐츠를 요청하면 가장 가까운 엣지 로케이션에서 응답하므로 지연 시간을 최소화할 수 있습니다.

*CloudFront의 전 세계 인프라 구조: S3 오리진에서 시작하여 전 세계 엣지 로케이션과 Regional 엣지 캐시를 통해 사용자에게 콘텐츠를 전달하는 구조를 보여줍니다.*

![CloudFront 전 세계 인프라 구조](/assets/images/2026-01-04-cloudfront-guide/cloudfront-global-infrastructure.png)

### CloudFront의 주요 특징

1. **전 세계 엣지 로케이션**: 400개 이상의 엣지 로케이션을 통해 낮은 지연 시간 제공
2. **다양한 오리진 지원**: S3, ALB, EC2, Lambda, 커스텀 오리진 등
3. **보안 강화**: AWS WAF, AWS Shield와 통합하여 DDoS 공격 방어
4. **비용 효율성**: S3에서 직접 전송하는 것보다 저렴한 데이터 전송 비용
5. **HTTPS 지원**: SSL/TLS 인증서를 통한 보안 연결

### CloudFront 동작 방식

```
사용자 요청 → 가장 가까운 엣지 로케이션
  ↓
캐시에 콘텐츠가 있는가?
  ├─ Yes → 엣지에서 즉시 응답 (캐시 히트)
  └─ No → 오리진(S3 등)에서 콘텐츠 가져오기 → 캐시 저장 → 사용자에게 응답
```

## S3와 CloudFront 함께 사용하기

### 왜 S3만으로는 부족한가?

S3에서 직접 파일을 제공하는 것도 가능하지만, 다음과 같은 한계가 있습니다:

1. **비용**: S3에서 인터넷으로 직접 전송하는 비용이 높음
2. **성능**: 사용자 위치에 따라 지연 시간이 길어질 수 있음
3. **보안**: 버킷을 공개해야 하므로 보안 위험 증가
4. **확장성**: 트래픽이 급증하면 S3에 부하가 집중됨

*S3만 사용할 때의 문제점: 전 세계 사용자들이 모두 한 지역의 S3 오리진으로 직접 요청을 보내면서 트래픽이 집중되고, 지리적으로 먼 사용자는 높은 지연 시간을 경험하게 됩니다.*

![S3 직접 사용 시 트래픽 집중 문제](/assets/images/2026-01-04-cloudfront-guide/cloudfront-content-delivery-flow.png)

### CloudFront를 사용하면?

CloudFront를 S3 앞에 배치하면 다음과 같은 이점을 얻을 수 있습니다:

1. **비용 절감**: CloudFront에서 전송하는 데이터는 S3에서 전송하는 것보다 저렴
2. **성능 향상**: 엣지 로케이션에서 캐싱하여 응답 속도 향상
3. **보안 강화**: OAC를 통해 S3 버킷을 비공개로 유지하면서 CloudFront를 통해서만 접근 가능
4. **부하 분산**: 엣지 로케이션에 트래픽이 분산되어 오리진 부하 감소

## CloudFront 배포 생성하기

### 1. 기본 배포 설정

AWS 콘솔에서 CloudFront 배포를 생성할 때 다음 설정을 고려해야 합니다:

#### 오리진 설정

```yaml
Origin Domain: your-bucket.s3.amazonaws.com
Origin Path: (선택사항) 특정 경로만 사용하는 경우
Origin Access: Origin Access Control (OAC) 권장
```

#### 캐시 동작 설정

```yaml
Viewer Protocol Policy: Redirect HTTP to HTTPS (권장)
Allowed HTTP Methods: GET, HEAD, OPTIONS (정적 콘텐츠의 경우)
Cache Policy: CachingOptimized (정적 콘텐츠)
```

### 2. Origin Access Control (OAC) 설정

**OAC(Origin Access Control)**는 CloudFront를 통해서만 S3 버킷에 접근할 수 있도록 하는 보안 기능입니다[^2]. 이전의 OAI(Origin Access Identity)를 대체하는 최신 방법입니다.

#### OAC의 장점

- **세분화된 정책**: 더 유연한 IAM 정책 구성 가능
- **POST 메서드 지원**: OAI에서는 불가능했던 POST 요청 지원
- **AWS Signature Version 4**: 더 안전한 인증 방식
- **SSE-KMS 지원**: 서버 측 암호화(SSE-KMS) 사용 가능

#### OAC 설정 방법

**1단계: OAC 생성**

AWS 콘솔에서 CloudFront → Origin Access Control → Create control setting:

```yaml
Name: s3-oac
Description: OAC for S3 bucket access
Signing behavior: Sign requests (recommended)
Signing protocol: SigV4
Origin type: S3
```

**2단계: S3 버킷 정책 설정**

OAC를 생성하면 ARN이 생성됩니다. 이를 사용하여 S3 버킷 정책을 설정합니다:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

**3단계: CloudFront 배포에 OAC 연결**

CloudFront 배포의 오리진 설정에서 생성한 OAC를 선택합니다.

#### OAC vs OAI 비교

| 특징 | OAI (구버전) | OAC (신버전) |
|------|-------------|-------------|
| POST 메서드 | ❌ 지원 안 함 | ✅ 지원 |
| SSE-KMS | ❌ 지원 안 함 | ✅ 지원 |
| 정책 유연성 | 제한적 | 높음 |
| SigV4 | ❌ | ✅ |
| 권장 여부 | ❌ 구버전 | ✅ 권장 |

### 3. S3 버킷 정책 설정

OAC를 사용할 때는 S3 버킷을 **비공개(Private)**로 유지하고, CloudFront를 통해서만 접근할 수 있도록 설정합니다.

#### ❌ 잘못된 설정: 버킷을 공개로 설정

```json
// S3 버킷 정책 - 공개 접근 허용 (보안 위험)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket/*"
    }
  ]
}
```

#### ✅ 올바른 설정: OAC를 통한 접근만 허용

```json
// S3 버킷 정책 - CloudFront OAC만 허용
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontOAC",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/E1234567890ABC"
        }
      }
    }
  ]
}
```

## CloudFront 캐싱 전략

### 캐시 정책 선택

CloudFront는 다양한 캐시 정책을 제공합니다:

#### 1. CachingOptimized (정적 콘텐츠)

정적 파일(이미지, CSS, JS 등)에 적합:

```yaml
Cache-Control 헤더: 존중
TTL: 최대 1년
쿼리 문자열: 무시
```

#### 2. CachingDisabled (동적 콘텐츠)

동적 콘텐츠나 API 응답에 적합:

```yaml
캐싱: 비활성화
모든 요청을 오리진으로 전달
```

#### 3. Elemental-MediaPackage (비디오 스트리밍)

비디오 스트리밍에 최적화:

```yaml
비디오 세그먼트 캐싱
부분 콘텐츠 요청 지원
```

### 커스텀 캐시 정책 생성

특정 요구사항이 있다면 커스텀 캐시 정책을 생성할 수 있습니다:

```yaml
Minimum TTL: 0 (초)
Maximum TTL: 31536000 (1년)
Default TTL: 86400 (1일)
쿼리 문자열: 지정된 쿼리 문자열만 포함
헤더: 특정 헤더를 캐시 키에 포함
```

### 캐시 무효화 (Invalidation)

콘텐츠를 업데이트했을 때 캐시를 즉시 갱신하려면 무효화를 사용합니다:

```bash
# AWS CLI를 사용한 캐시 무효화
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*" "/images/*"
```

> **주의**: 무효화는 비용이 발생할 수 있으므로 필요한 경로만 지정하는 것이 좋습니다. `/*`는 모든 캐시를 무효화하므로 신중하게 사용해야 합니다.

## 성능 최적화

### 1. 압축 활성화

CloudFront는 자동으로 콘텐츠를 압축하여 전송합니다:

```yaml
Compress Objects Automatically: Yes
지원 형식: text/html, text/css, application/javascript, application/json 등
```

### 2. HTTP/2 및 HTTP/3 지원

최신 프로토콜을 사용하여 성능 향상:

```yaml
HTTP Version: HTTP/2, HTTP/3
자동으로 최신 프로토콜 사용
```

### 3. 지리적 제한 (Geo Restriction)

특정 국가에서만 접근을 허용하거나 차단:

```yaml
Restriction Type: 
  - Whitelist: 허용 목록
  - Blacklist: 차단 목록
```

## 보안 강화

### 1. AWS WAF 통합

**AWS WAF(Web Application Firewall)**는 웹 애플리케이션을 보호하는 방화벽 서비스로, CloudFront와 통합하여 웹 공격을 방어할 수 있습니다[^6].

CloudFront와 AWS WAF를 통합하여 웹 공격을 방어:

```yaml
보호 기능:
  - SQL Injection 방어
  - XSS 방어
  - Rate Limiting
  - IP 화이트리스트/블랙리스트
```

### 2. AWS Shield

DDoS 공격으로부터 자동 보호:

```yaml
AWS Shield Standard: 모든 CloudFront 배포에 자동 적용
AWS Shield Advanced: 추가 보호 및 비용 보호
```

### 3. 사용자 지정 도메인 및 SSL/TLS

자체 도메인을 사용하고 SSL 인증서를 적용:

```yaml
Custom Domain: www.example.com
SSL Certificate: ACM(AWS Certificate Manager)에서 발급
Minimum Protocol Version: TLSv1.2_2021 (권장)
```

## 실전 활용 시나리오

### 시나리오 1: 정적 웹사이트 호스팅

S3 + CloudFront를 사용하여 정적 웹사이트를 호스팅:

```yaml
구성:
  - S3 버킷: 웹사이트 파일 저장
  - CloudFront: CDN으로 콘텐츠 전송
  - OAC: S3 버킷 보호
  - Route 53: 도메인 연결 (선택사항)

장점:
  - 서버 관리 불필요
  - 전 세계 빠른 접근
  - 비용 효율적
```

### 시나리오 2: 이미지/동영상 CDN

대용량 미디어 파일을 CloudFront로 제공:

```yaml
구성:
  - S3: 원본 파일 저장
  - CloudFront: 캐싱 및 전송
  - CloudFront Functions: 이미지 최적화 (선택사항)

최적화:
  - 적절한 캐시 TTL 설정
  - 압축 활성화
  - HTTP/2, HTTP/3 사용
```

### 시나리오 3: API 가속화

ALB나 API Gateway 앞에 CloudFront를 배치:

```yaml
구성:
  - CloudFront: 엣지 캐싱
  - ALB/API Gateway: 백엔드 API
  - 캐시 정책: CachingDisabled 또는 짧은 TTL

장점:
  - 엣지에서 정적 응답 캐싱
  - 동적 요청은 오리진으로 전달
  - 지연 시간 감소
```

## 비용 최적화

### CloudFront vs S3 직접 전송 비용 비교

CloudFront를 사용하면 데이터 전송 비용을 절감할 수 있습니다:

```yaml
예시 (한국 리전 기준):
  - S3 → 인터넷: $0.12/GB
  - CloudFront → 인터넷: $0.12/GB (첫 10TB, 아시아 태평양 지역)
  
추가 이점:
  - S3 → CloudFront 전송: 무료
  - 캐싱으로 실제 전송량 감소
  - 한국 사용자에게 더 빠른 응답 속도 제공
```

### 비용 절감 팁

1. **적절한 캐시 TTL 설정**: 자주 변경되지 않는 콘텐츠는 긴 TTL 설정
2. **압축 활성화**: 전송 데이터량 감소
3. **지역별 가격 고려**: 일부 지역은 더 저렴한 요금 적용
4. **캐시 히트율 모니터링**: CloudWatch를 통해 캐시 효율 확인

## 마무리

CloudFront를 올바르게 사용하면:

1. **성능 향상**: 엣지 캐싱으로 전 세계 사용자에게 빠른 콘텐츠 전달
2. **비용 절감**: S3 직접 전송보다 저렴한 데이터 전송 비용
3. **보안 강화**: OAC를 통한 S3 버킷 보호 및 HTTPS 강제
4. **확장성**: 급증하는 트래픽에 자동으로 대응

S3와 CloudFront를 함께 사용하면 서버 관리 없이 전 세계 사용자에게 빠르고 안전하게 콘텐츠를 제공할 수 있으며, 비용 효율적인 정적 웹사이트 호스팅 솔루션을 구축할 수 있습니다.

---

**참고 자료:**

[^1]: [AWS 공식 문서: Amazon CloudFront](https://aws.amazon.com/ko/cloudfront/) - CloudFront 서비스 개요 및 기능
[^2]: [AWS 블로그: CloudFront Origin Access Control (OAC) 소개](https://aws.amazon.com/ko/blogs/korea/amazon-cloudfront-introduces-origin-access-control-oac/) - OAC 설정 방법 및 OAI와의 차이점
[^3]: [AWS 블로그: S3와 CloudFront로 정적 파일 배포하기](https://aws.amazon.com/ko/blogs/korea/amazon-s3-amazon-cloudfront-a-match-made-in-the-cloud/) - S3와 CloudFront 통합 가이드
[^4]: [AWS 문서: CloudFront 캐싱 정책](https://docs.aws.amazon.com/ko_kr/AmazonCloudFront/latest/DeveloperGuide/controlling-the-cache-key.html) - 캐시 정책 설정 가이드
[^5]: [AWS 문서: CloudFront 보안 모범 사례](https://docs.aws.amazon.com/ko_kr/AmazonCloudFront/latest/DeveloperGuide/security-best-practices.html) - 보안 설정 가이드
[^6]: [AWS 공식 문서: AWS WAF](https://aws.amazon.com/ko/waf/) - AWS WAF 서비스 개요 및 기능

