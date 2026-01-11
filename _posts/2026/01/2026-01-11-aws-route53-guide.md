---
layout: single
title: "AWS Route 53 완벽 가이드: DNS 설정부터 고급 라우팅 정책까지"
date: 2026-01-11
last_modified_at: 2026-01-11T14:30:00+09:00
categories:
  - cloud
tags:
  - aws
  - route53
  - dns
  - cloud-computing
  - devops
author: Daniel
excerpt: "AWS의 고가용성 DNS 서비스인 Route 53의 핵심 개념과 다양한 라우팅 정책을 알아봅니다. Alias 레코드의 장점과 실전 활용 시나리오를 통해 안정적인 인프라를 구축해 보세요."
toc: true
toc_sticky: true
toc_label: "목차"
---

## 들어가며

현대의 클라우드 인프라에서 도메인은 단순히 IP 주소를 연결하는 것을 넘어, 전 세계 사용자에게 가장 빠른 경로를 제공하고 서비스 장애 시 자동으로 복구하는 스마트한 관문 역할을 합니다. 

AWS의 **Route 53**[^1]은 단순한 DNS 서비스를 넘어 다음과 같은 고민을 해결해 줍니다:

- "사용자와 가장 가까운 리전의 서버로 접속하게 할 수 없을까?"
- "기본 서버가 다운되었을 때 자동으로 백업 서버로 연결할 수 없을까?"
- "S3 버킷이나 CloudFront 배포를 도메인에 연결할 때 비용을 절감할 방법은 없을까?"

이 글에서는 Route 53의 핵심 기능과 실무에서 반드시 알아야 할 라우팅 정책들을 정리해 보겠습니다.

## Route 53의 핵심 개념

### Hosted Zone (호스팅 영역)

호스팅 영역은 DNS 레코드를 관리하는 컨테이너입니다.

- **Public Hosted Zone**: 인터넷에서 접근 가능한 도메인의 레코드를 관리합니다.
- **Private Hosted Zone**: VPC 내부에서만 유효한 도메인 이름을 관리하며, 내부 마이크로서비스 간 통신에 유용합니다.

### Alias (별칭) 레코드

Route 53만의 강력한 기능 중 하나가 바로 **Alias 레코드**[^2]입니다. 일반적인 CNAME과 비슷해 보이지만 결정적인 차이가 있습니다.

*Alias 레코드와 CNAME의 비교*

| 특징 | CNAME Record | Alias Record (Route 53 전용) |
|------|--------------|------------------------------|
| **비용** | 일반적인 DNS 쿼리 요금 발생 | AWS 서비스(S3, ELB 등) 대상 쿼리는 무료 |
| **성능** | 추가 DNS 조회 필요 | Route 53이 내부적으로 처리하여 빠름 |
| **루트 도메인** | `example.com`에 설정 불가 | `example.com`에 설정 가능 (Zone Apex 지원) |
| **대상** | 도메인 이름만 가능 | AWS 리소스 (ELB, CloudFront, S3 등) |

## 다양한 라우팅 정책

Route 53은 트래픽을 처리하는 다양한 정책을 제공합니다[^3]. 각 정책은 사용 사례에 따라 선택해야 합니다.

### 1. Simple Routing (단순 라우팅)
가장 기본적인 방식으로, 하나의 도메인에 하나 이상의 IP 주소를 연결합니다. 여러 IP를 입력하면 DNS가 무작위 순서로 모든 값을 반환합니다.

### 2. Weighted Routing (가중치 기반 라우팅)
트래픽을 지정한 비율(0~255)에 따라 여러 리소스로 분산합니다.
- **활용**: 신규 버전 배포 시 10%의 트래픽만 먼저 보내는 **카나리 배포(Canary Deployment)**에 유용합니다.

### 3. Latency-based Routing (지연 시간 기반 라우팅)
사용자와 AWS 리전 간의 네트워크 지연 시간을 측정하여, 가장 빠른 응답을 줄 수 있는 리전으로 연결합니다.
- **활용**: 전 세계 사용자에게 최고의 속도를 제공해야 하는 글로벌 서비스.

### 4. Failover Routing (장애 조치 라우팅)
**Health Check**와 연동하여 기본(Primary) 리소스가 비정상일 때 보조(Secondary) 리소스로 트래픽을 자동 전환합니다.
- **활용**: Active-Passive 재해 복구(DR) 구성.

### 5. Geolocation Routing (지리적 위치 라우팅)
사용자의 실제 위치(국가, 대륙 등)를 기반으로 트래픽을 라우팅합니다.
- **활용**: 현지 언어 페이지 제공 또는 특정 국가의 법적 규제 준수.

### 6. Multi-value Answer Routing (다중값 응답 라우팅)
상태 확인을 거친 최대 8개의 레코드를 반환하여 로드 밸런싱 효과를 줍니다.

## 실전 활용: Failover 및 Health Check 구성

가장 많이 사용되는 장애 조치(Failover) 시나리오를 코드로 살펴보겠습니다.

```bash
# AWS CLI를 이용한 Health Check 생성 예시
aws route53 create-health-check \
    --caller-reference $(date +%s) \
    --health-check-config \
    '{
        "Type": "HTTP",
        "ResourcePath": "/health",
        "FullyQualifiedDomainName": "primary.example.com",
        "RequestInterval": 30,
        "FailureThreshold": 3
    }'
```

*Route 53 장애 조치 구성도*

![Route 53 Failover Workflow](/assets/images/2026-01-11-aws-route53-guide/failover-diagram.png)

1. **Health Check**가 기본 서버의 `/health` 경로를 감시합니다.
2. 서버가 3번 연속 응답하지 않으면 상태를 `Unhealthy`로 변경합니다.
3. Route 53은 즉시 DNS 응답을 보조(Secondary) 서버의 IP로 변경합니다.

## 마무리

AWS Route 53은 단순한 도메인 관리를 넘어 서비스의 안정성과 성능을 책임지는 핵심 서비스입니다.

1. **Alias 레코드**를 활용해 루트 도메인 설정과 비용 절감을 동시에 챙기세요.
2. **Health Check**와 **Failover 정책**을 결합하여 고가용성 인프라를 구축하세요.
3. 서비스 특성에 맞는 **라우팅 정책**(지연 시간, 가중치 등)을 선택해 사용자 경험을 최적화하세요.

---

**참고 자료:**

[^1]: [AWS Route 53 공식 문서](https://docs.aws.amazon.com/ko_kr/Route53/latest/DeveloperGuide/Welcome.html) - Route 53 개념 및 시작하기
[^2]: [Route 53 별칭 레코드와 CNAME 비교](https://docs.aws.amazon.com/ko_kr/Route53/latest/DeveloperGuide/resource-record-sets-choosing-alias-non-alias.html) - 별칭 레코드의 특징과 장점
[^3]: [Route 53 라우팅 정책 선택 가이드](https://docs.aws.amazon.com/ko_kr/Route53/latest/DeveloperGuide/routing-policy.html) - 상황별 최적의 라우팅 정책 설명
