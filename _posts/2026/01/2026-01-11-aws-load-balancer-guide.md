---
layout: single
title: "AWS ELB(Elastic Load Balancing): ALB, NLB, GLB 차이점 정리"
date: 2026-01-11
last_modified_at: 2026-01-11T12:30:00+09:00
categories:
  - cloud
tags:
  - aws
  - elb
  - alb
  - nlb
  - glb
  - load-balancer
  - cloud
author: Daniel
excerpt: "AWS의 로드 밸런싱 서비스인 ELB의 종류(ALB, NLB, GLB, CLB)와 각각의 특징, 용도, 그리고 올바른 선택 기준을 상세히 알아봅니다."
toc: true
toc_sticky: true
toc_label: "목차"
---

## 들어가며

현대적인 클라우드 아키텍처에서 서비스의 가용성(Availability)과 확장성(Scalability)을 확보하기 위해 가장 핵심적인 요소 중 하나가 바로 **로드 밸런서(Load Balancer)**입니다. 단일 서버로 모든 트래픽을 감당하는 것은 위험하며, 트래픽이 몰릴 때 서버가 다운되는 '단일 장애점(SPOF)'을 초래할 수 있기 때문입니다.

AWS에서는 **Elastic Load Balancing(ELB)**이라는 이름으로 완전관리형 로드 밸런싱 서비스를 제공합니다. ELB는 유입되는 애플리케이션 트래픽을 EC2 인스턴스, 컨테이너, IP 주소 등 여러 대상에 자동으로 분산시켜 줍니다[^1]. 하지만 AWS에는 여러 종류의 로드 밸런서가 있어 상황에 맞는 적절한 선택이 필요합니다. 이번 글에서는 각 로드 밸런서의 특징과 차이점을 자세히 살펴보겠습니다.

## ELB의 핵심 구성 요소

로드 밸런서가 어떻게 트래픽을 전달하는지 이해하려면 리스너, 규칙, 대상 그룹의 관계를 알아야 합니다.

*ELB의 기본 아키텍처: 로드 밸런서는 리스너를 통해 요청을 받고, 규칙에 따라 적절한 대상 그룹으로 트래픽을 분산합니다.*

![ELB의 기본 구성 요소: 리스너, 규칙, 대상 그룹](/assets/images/2026-01-11-aws-load-balancer-guide/elb-structure.png)

1.  **리스너(Listener)**: 설정한 프로토콜 및 포트를 사용하여 클라이언트의 연결 요청을 확인하는 프로세스입니다.
2.  **규칙(Rule)**: 리스너가 요청을 대상 그룹으로 라우팅하는 방법을 정의합니다. 우선순위, 작업, 조건으로 구성됩니다.
3.  **대상 그룹(Target Group)**: 요청을 라우팅할 하나 이상의 대상을 등록합니다. 각 대상 그룹에 대해 상태 확인(Health Check)을 설정할 수 있습니다.
4.  **대상(Target)**: 실제 트래픽이 전달되는 EC2 인스턴스, Lambda 함수, 또는 IP 주소입니다.

## AWS 로드 밸런서 종류와 특징

AWS ELB는 크게 네 가지 유형으로 분류됩니다. 각 로드 밸런서는 OSI 7계층 중 어느 계층에서 동작하는지에 따라 그 특성이 나뉩니다.

### 1. Application Load Balancer (ALB) - 애플리케이션 계층 (L7)

ALB는 HTTP 및 HTTPS 트래픽의 로드 밸런싱에 최적화된 로드 밸런서입니다.

*   **동작 계층**: OSI 7계층 (Application Layer)
*   **주요 기능**: 
    *   **경로 기반 라우팅**: URL 경로(`example.com/api`)에 따라 서로 다른 대상 그룹으로 트래픽을 전달할 수 있습니다.
    *   **호스트 기반 라우팅**: 호스트 이름(`api.example.com`, `web.example.com`)에 따른 라우팅이 가능합니다.
    *   **HTTP/2 및 WebSocket 지원**: 최신 프로토콜을 완벽하게 지원합니다.
    *   **사용자 인증**: AWS Cognito 등을 통한 외부 ID 제공업체 인증 기능을 제공합니다.

### 2. Network Load Balancer (NLB) - 전송 계층 (L4)

NLB는 극도로 높은 성능과 낮은 지연 시간이 필요한 TCP, UDP 트래픽에 적합합니다.

*   **동작 계층**: OSI 4계층 (Transport Layer)
*   **주요 기능**:
    *   **초고성능**: 초당 수백만 개의 요청을 처리할 수 있으며 지연 시간이 매우 낮습니다.
    *   **고정 IP 지원**: 각 가용 영역(AZ)마다 하나의 고정 IP(Elastic IP)를 할당받을 수 있어, 방화벽 규칙 설정이 용이합니다.
    *   **Source IP 보존**: 클라이언트의 소스 IP 주소를 백엔드로 그대로 전달할 수 있습니다.

### 3. Gateway Load Balancer (GLB) - 보안 및 네트워킹 (L3)

GLB는 타사 가상 어플라이언스(방화벽, 침입 탐지 시스템 등)를 쉽게 배포하고 확장할 수 있도록 설계되었습니다.

*   **동작 계층**: OSI 3계층 (Network Layer) + 4계층 (Transport Layer)
*   **주요 기능**:
    *   **보안 검사**: 모든 트래픽을 보안 어플라이언스를 거치게 한 뒤 대상으로 전달하는 'Bump-in-the-wire' 방식을 지원합니다.
    *   **투명성**: 트래픽의 소스나 목적지를 변경하지 않고 중간에서 검사만 수행할 수 있습니다.

### 4. Classic Load Balancer (CLB) - 레거시

과거에 주로 사용되던 이전 세대의 로드 밸런서입니다. 현재는 특수한 경우가 아니면 ALB나 NLB 사용을 권장합니다.

## 로드 밸런서 선택 기준

서비스의 요구 사항에 따라 어떤 로드 밸런서를 사용할지 결정해야 합니다.

| 특성 | Application Load Balancer (ALB) | Network Load Balancer (NLB) | Gateway Load Balancer (GLB) |
| :--- | :--- | :--- | :--- |
| **주요 용도** | HTTP/HTTPS 애플리케이션 | 고성능, TCP/UDP, 고정 IP | 보안 가상 어플라이언스 |
| **동작 계층** | L7 (Application) | L4 (Transport) | L3 (Gateway) |
| **라우팅 기준** | URL 경로, 호스트명, 쿼리 파라미터 등 | IP 주소, 포트 번호 | IP 패킷 |
| **지연 시간** | NLB보다 상대적으로 높음 | 매우 낮음 | 중간 |
| **사용 예시** | 마이크로서비스 아키텍처, 웹 서비스 | 실시간 게임, 화상 회의, 대규모 트래픽 | 방화벽 시스템, 침입 탐지 시스템(IDS) |

## 실전 활용 시나리오

### 시나리오: 복합 아키텍처에서의 ELB 활용

대규모 이커머스 서비스의 경우 다음과 같이 ELB를 조합하여 사용할 수 있습니다.

1.  **사용자 트래픽 수신**: **ALB**를 사용하여 웹 페이지 요청(`www.example.com`)과 API 요청(`api.example.com`)을 각각의 마이크로서비스 컨테이너(ECS)로 라우팅합니다.
2.  **대규모 데이터 처리**: 실시간 로그 수집이나 데이터 스트리밍 시스템에는 **NLB**를 배치하여 지연 시간을 최소화하고 고정 IP를 통해 안정적인 연결을 유지합니다.
3.  **보안 강화**: 모든 외부 유입 트래픽을 **GLB** 뒤에 배치된 방화벽 어플라이언스를 거치게 하여 보안 검사를 수행합니다.

## 보안 및 관리 모범 사례

ELB를 안전하게 운영하기 위한 몇 가지 팁입니다.

-   **보안 그룹(Security Groups) 설정**:
    -   ❌ **잘못된 예시**: 모든 포트(0-65535)를 공개(`0.0.0.0/0`)로 개방
    -   ✅ **올바른 예시**: 필요한 포트(80, 443)만 개방하고, 백엔드 서버는 오직 로드 밸런서로부터 오는 트래픽만 받도록 설정[^2]
-   **SSL/TLS 인증서 관리**: ALB에 AWS Certificate Manager(ACM)를 연동하여 손쉽게 HTTPS를 적용하고 인증서를 자동 갱신하세요.
-   **상태 확인(Health Checks)**: 각 대상 그룹의 상태 확인 경로를 정확히 설정하여, 장애가 발생한 인스턴스로 트래픽이 가지 않도록 해야 합니다.

## 마무리

AWS Elastic Load Balancing은 서비스의 규모와 성격에 따라 최적의 선택지를 제공합니다.

1.  **ALB**: 유연한 라우팅과 애플리케이션 수준의 세밀한 제어가 필요한 경우
2.  **NLB**: 초고성능, 낮은 지연 시간, 고정 IP가 필수적인 경우
3.  **GLB**: 네트워크 보안 어플라이언스를 중앙 집중적으로 관리해야 하는 경우

각 로드 밸런서의 특징을 정확히 이해하고 아키텍처를 설계한다면, 보다 견고하고 확장성 있는 클라우드 시스템을 구축할 수 있습니다.

---

**참고 자료:**

[^1]: [AWS 공식 문서: Elastic Load Balancing이란 무엇입니까?](https://docs.aws.amazon.com/ko_kr/elasticloadbalancing/latest/userguide/what-is-load-balancing.html) - ELB 서비스의 전체적인 개념 설명
[^2]: [AWS 기술 블로그: 로드 밸런서 보안 그룹 설정 가이드](https://aws.amazon.com/ko/blogs/korea/best-practices-for-securing-your-application-with-elb/) - 보안 그룹을 활용한 인프라 보호 전략
[^3]: [AWS 공식 문서: Application Load Balancer란?](https://docs.aws.amazon.com/ko_kr/elasticloadbalancing/latest/application/introduction.html) - ALB의 주요 기능 및 구성 요소
[^4]: [AWS 공식 문서: Network Load Balancer란?](https://docs.aws.amazon.com/ko_kr/elasticloadbalancing/latest/network/introduction.html) - NLB의 특징 및 이점
