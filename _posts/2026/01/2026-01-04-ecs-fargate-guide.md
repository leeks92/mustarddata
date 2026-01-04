---
layout: single
title: "[AWS] ECS Fargate 구성 파헤쳐보기"
date: 2026-01-04
last_modified_at: 2026-01-04T23:23:52+09:00
categories:
  - cloud
tags:
  - aws
  - ecs
  - fargate
  - docker
  - container
  - cloud
author: Daniel
excerpt: "AWS ECS Fargate의 구성 요소와 작동 방식을 자세히 알아봅니다. 태스크 정의, 용량 공급자, 네트워킹까지 실전 가이드."
toc: true
toc_sticky: true
toc_label: "목차"
related_posts:
  - 2026-01-04-cloudfront-vs-ecs-comparison.md
---

## 들어가며

컨테이너 기반 애플리케이션을 AWS에서 운영하다 보면 다음과 같은 고민을 하게 됩니다:

- EC2 인스턴스를 직접 관리하는 것이 부담스러움
- 클러스터 크기 조정과 패킹 최적화가 복잡함
- 서버 유형 선택과 용량 계획이 어려움
- 인프라 관리보다 애플리케이션 개발에 집중하고 싶음

이런 문제들을 해결하기 위해 **AWS Fargate**를 사용할 수 있습니다. Fargate는 Amazon ECS에서 서버나 클러스터를 관리할 필요 없이 컨테이너를 실행할 수 있게 해주는 서버리스 컨테이너 실행 기술입니다[^1]. 이 글에서는 ECS Fargate의 구성 요소와 작동 방식을 자세히 살펴보고자 합니다.

## ECS Fargate란?

### 기본 개념

**AWS Fargate**는 Amazon ECS에 사용할 수 있는 서버리스 컴퓨팅 엔진으로, EC2 인스턴스의 서버나 클러스터를 관리할 필요 없이 컨테이너를 실행할 수 있게 해줍니다. Fargate를 사용하면 가상 머신의 클러스터를 프로비저닝, 구성 또는 조정할 필요가 없습니다.

### Fargate의 주요 특징

1. **서버리스**: 인프라 관리 불필요, 컨테이너만 실행
2. **자동 스케일링**: 애플리케이션 요구사항에 따라 자동으로 확장/축소
3. **격리**: 각 태스크는 자체 격리 경계를 가지며 다른 태스크와 리소스를 공유하지 않음
4. **간편한 시작**: 컨테이너 패키징 → CPU/메모리 지정 → 네트워킹 정의 → 실행
5. **다양한 플랫폼**: Linux(Amazon Linux 2, Bottlerocket) 및 Windows 지원

### Fargate vs EC2 비교

| 특징 | EC2 | Fargate |
|------|----------------|---------------------|
| 인프라 관리 | 직접 관리 필요 | AWS가 관리 |
| 클러스터 구성 | 수동 구성 | 자동 구성 |
| 용량 계획 | 직접 계획 | 자동 처리 |
| 서버 유형 선택 | 필요 | 불필요 |
| 격리 | 컨테이너 레벨 | 태스크 레벨 (완전 격리) |
| 비용 | 인스턴스 시간 기준 | 태스크 실행 시간 기준 |

## 태스크 정의 (Task Definition)

### 태스크 정의란?

태스크 정의는 컨테이너가 어떻게 실행될지 정의하는 JSON 문서입니다. Fargate를 사용하려면 `requiresCompatibilities` 파라미터를 `FARGATE`로 설정해야 합니다.

### 기본 태스크 정의 구조

```json
{
  "family": "my-fargate-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "my-container",
      "image": "nginx:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/my-fargate-task",
          "awslogs-region": "ap-northeast-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### 필수 파라미터

#### 1. requiresCompatibilities

Fargate를 사용하려면 반드시 `FARGATE`로 설정해야 합니다:

```json
"requiresCompatibilities": ["FARGATE"]
```

#### 2. networkMode

Fargate는 `awsvpc` 네트워크 모드만 지원합니다:

```json
"networkMode": "awsvpc"
```

#### 3. CPU와 Memory

Fargate는 특정 CPU/메모리 조합만 지원합니다. 유효한 조합은 다음과 같습니다:

| CPU (vCPU) | CPU (단위) | Memory 옵션 (MB) | Memory 옵션 (GB) |
|------------|------------|------------------|------------------|
| 0.25 | 256 | 512; 1024; 2048 | 0.5; 1; 2 |
| 0.5 | 512 | 1024; 2048; 3072; 4096 | 1; 2; 3; 4 |
| 1 | 1024 | 2048; 3072; 4096; 5120; 6144; 7168; 8192 | 2; 3; 4; 5; 6; 7; 8 |
| 2 | 2048 | 4096 ~ 16384 (1GB 단위) | 4 ~ 16 |
| 4 | 4096 | 8192 ~ 30720 (1GB 단위) | 8 ~ 30 |

```json
"cpu": "256",
"memory": "512"
```

## 용량 공급자 (Capacity Provider)

### 용량 공급자란?

용량 공급자는 태스크를 실행할 컴퓨팅 리소스를 제공하는 메커니즘입니다. Fargate에서는 두 가지 용량 공급자를 사용할 수 있습니다.

### 용량 공급자 비교

| 특징 | Fargate | Fargate Spot |
|------|---------|-------------|
| **실행 방식** | 온디맨드 실행 | 여분의 컴퓨팅 용량 사용 |
| **비용** | 표준 요금 | 최대 70% 할인 |
| **중단 가능 여부** | 중단 없음 | 2분 경고 후 중단 가능 |
| **성능** | 안정적인 성능 | 안정적인 성능 (중단 시 제한) |
| **사용 시나리오** | 프로덕션 워크로드<br>중단 불가능한 서비스 | 배치 작업<br>테스트 환경<br>개발 환경<br>중단 가능한 워크로드 |

### 용량 공급자 전략

클러스터에 여러 용량 공급자를 설정하고 우선순위를 지정할 수 있습니다:

```json
{
  "capacityProviderStrategy": [
    {
      "capacityProvider": "FARGATE_SPOT",
      "weight": 2,
      "base": 0
    },
    {
      "capacityProvider": "FARGATE",
      "weight": 1,
      "base": 1
    }
  ]
}
```

이 설정은:
- 기본적으로 1개의 태스크는 FARGATE에서 실행 (base: 1)
- 추가 태스크는 FARGATE_SPOT을 2배 더 선호 (weight: 2)

## 네트워킹 구성

### awsvpc 네트워크 모드

Fargate는 `awsvpc` 네트워크 모드만 지원합니다. 이 모드는 각 태스크에 자체 탄력적 네트워크 인터페이스(ENI)를 제공합니다.

### 네트워크 구성 요소

#### 1. 서브넷

태스크가 실행될 서브넷을 지정합니다:

```bash
aws ecs run-task \
  --cluster my-cluster \
  --task-definition my-fargate-task:1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],assignPublicIp=ENABLED}"
```

#### 2. 보안 그룹

태스크에 적용할 보안 그룹을 지정합니다:

```bash
--network-configuration "awsvpcConfiguration={
  subnets=[subnet-12345],
  securityGroups=[sg-12345],
  assignPublicIp=ENABLED
}"
```

#### 3. Public IP 할당

인터넷 접근이 필요한 경우 Public IP를 할당합니다:

```yaml
assignPublicIp: ENABLED  # 인터넷 게이트웨이를 통한 접근
assignPublicIp: DISABLED # NAT 게이트웨이를 통한 접근
```

### 서비스 네트워크 구성 예시

```json
{
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": [
        "subnet-12345",
        "subnet-67890"
      ],
      "securityGroups": [
        "sg-12345"
      ],
      "assignPublicIp": "DISABLED"
    }
  }
}
```

## 로드 밸런싱

### 지원되는 로드 밸런서

Fargate 서비스는 다음 로드 밸런서를 지원합니다:

1. **Application Load Balancer (ALB)**: HTTP/HTTPS 트래픽 (Layer 7)
2. **Network Load Balancer (NLB)**: TCP/UDP 트래픽 (Layer 4)
3. **Gateway Load Balancer**: 트래픽 검사 및 라우팅

### 대상 그룹 설정

**중요**: Fargate 태스크는 `awsvpc` 네트워크 모드를 사용하므로, 대상 그룹의 대상 유형을 `instance`가 아닌 `ip`로 설정해야 합니다.

```yaml
대상 그룹 설정:
  대상 유형: ip (instance 아님)
  프로토콜: HTTP 또는 HTTPS
  포트: 컨테이너 포트
  Health Check: 적절한 경로 설정
```

### 로드 밸런서 연결 예시

```bash
aws ecs create-service \
  --cluster my-cluster \
  --service-name my-service \
  --task-definition my-fargate-task:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-12345,subnet-67890],
    securityGroups=[sg-12345],
    assignPublicIp=DISABLED
  }" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,
    containerName=my-container,
    containerPort=80"
```

## 태스크 실행 방법

### 1. 콘솔을 사용한 태스크 실행

AWS 콘솔에서 ECS → 클러스터 → 태스크 실행:

1. 클러스터 선택
2. "태스크 실행" 클릭
3. 태스크 정의 선택
4. 플랫폼 버전 선택 (선택사항)
5. 네트워크 구성 설정
6. 태스크 실행

### 2. AWS CLI를 사용한 태스크 실행

```bash
aws ecs run-task \
  --cluster my-cluster \
  --task-definition my-fargate-task:1 \
  --launch-type FARGATE \
  --platform-version "LATEST" \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-12345,subnet-67890],
    securityGroups=[sg-12345],
    assignPublicIp=ENABLED
  }"
```

### 3. 서비스로 실행

지속적으로 실행되는 애플리케이션은 서비스로 생성합니다:

```bash
aws ecs create-service \
  --cluster my-cluster \
  --service-name my-service \
  --task-definition my-fargate-task:1 \
  --desired-count 2 \
  --launch-type FARGate \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-12345,subnet-67890],
    securityGroups=[sg-12345],
    assignPublicIp=DISABLED
  }"
```

## 로깅 및 모니터링

### CloudWatch Logs 통합

Fargate 태스크의 로그를 CloudWatch Logs로 전송할 수 있습니다:

```json
{
  "logConfiguration": {
    "logDriver": "awslogs",
    "options": {
      "awslogs-group": "/ecs/my-fargate-task",
      "awslogs-region": "ap-northeast-2",
      "awslogs-stream-prefix": "ecs"
    }
  }
}
```

### CloudWatch 메트릭

Fargate 태스크는 다음 메트릭을 제공합니다:

- CPU 사용률
- 메모리 사용률
- 네트워크 I/O
- 태스크 수

### 사용량 지표

CloudWatch 사용량 지표를 통해 계정의 리소스 사용량을 확인할 수 있습니다:

```yaml
주요 지표:
  - FargateOnDemandTaskCount: 온디맨드 태스크 수
  - FargateSpotTaskCount: Spot 태스크 수
  - FargateTaskCount: 전체 태스크 수
```

## 실전 활용 시나리오

### 시나리오 1: 웹 애플리케이션 배포

```yaml
구성:
  - 태스크 정의: 웹 서버 컨테이너
  - 서비스: ALB와 연결된 서비스
  - 용량: Fargate (안정성 우선)
  - 네트워크: Private 서브넷 + NAT Gateway
  - 로그: CloudWatch Logs

장점:
  - 인프라 관리 불필요
  - 자동 스케일링
  - 고가용성
```

### 시나리오 2: 배치 작업 처리

```yaml
구성:
  - 태스크 정의: 배치 작업 컨테이너
  - 실행: EventBridge 스케줄 또는 수동 실행
  - 용량: Fargate Spot (비용 절감)
  - 네트워크: Private 서브넷

장점:
  - 비용 효율적 (Spot 사용)
  - 필요할 때만 실행
  - 인프라 관리 불필요
```

### 시나리오 3: 마이크로서비스 아키텍처

```yaml
구성:
  - 여러 서비스: 각각 독립적인 Fargate 서비스
  - 서비스 디스커버리: ECS Service Discovery 또는 ALB
  - 로드 밸런싱: ALB를 통한 트래픽 분산
  - 네트워크: VPC 내부 통신

장점:
  - 각 서비스 독립적 스케일링
  - 격리된 실행 환경
  - 간편한 배포 및 관리
```

## 마무리

ECS Fargate를 올바르게 구성하면:

1. **서버리스 운영**: 인프라 관리 없이 컨테이너 실행
2. **자동 스케일링**: 애플리케이션 요구사항에 따라 자동 확장/축소
3. **비용 효율성**: Fargate Spot을 활용한 비용 절감
4. **보안**: 격리된 실행 환경과 세밀한 네트워크 제어
5. **간편성**: 컨테이너 패키징 후 간단한 설정으로 실행

Fargate는 서버 관리의 복잡성을 제거하고 애플리케이션 개발에 집중할 수 있게 해주는 강력한 서비스입니다. 적절한 태스크 정의, 네트워크 구성, 용량 공급자 전략을 통해 효율적이고 안정적인 컨테이너 환경을 구축할 수 있습니다.

---

**참고 자료:**

[^1]: [AWS 공식 문서: Amazon ECS에 대한 AWS Fargate](https://docs.aws.amazon.com/ko_kr/AmazonECS/latest/developerguide/AWS_Fargate.html) - Fargate 아키텍처 및 구성 가이드
[^2]: [AWS 문서: Fargate 태스크 CPU 및 메모리](https://docs.aws.amazon.com/ko_kr/AmazonECS/latest/developerguide/task_definition_parameters.html#task_size) - CPU/메모리 조합 및 제한사항
[^3]: [AWS 문서: Fargate 플랫폼 버전](https://docs.aws.amazon.com/ko_kr/AmazonECS/latest/developerguide/platform_versions.html) - 플랫폼 버전 상세 정보
[^4]: [AWS 문서: Fargate Spot](https://docs.aws.amazon.com/ko_kr/AmazonECS/latest/developerguide/fargate-capacity-providers.html) - Fargate Spot 용량 공급자 가이드
[^5]: [AWS 문서: 로드 밸런싱을 사용하여 Amazon ECS 서비스 트래픽 분산](https://docs.aws.amazon.com/ko_kr/AmazonECS/latest/developerguide/service-load-balancing.html) - 로드 밸런서 설정 가이드

