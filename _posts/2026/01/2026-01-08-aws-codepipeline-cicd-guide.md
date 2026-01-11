---
layout: single
title: "AWS CodePipeline으로 CI/CD 구성하기"
date: 2026-01-08
last_modified_at: 2026-01-11T16:30:00+09:00
categories:
  - cloud
tags:
  - aws
  - codepipeline
  - codebuild
  - codedeploy
  - cicd
  - cloud
author: Daniel
excerpt: "AWS CodePipeline을 활용하여 소스 코드 관리부터 빌드, 배포까지 전 과정을 자동화하는 CI/CD 파이프라인 구축 방법을 상세히 알아봅니다."
toc: true
toc_sticky: true
toc_label: "목차"
---

## 들어가며

현대적인 소프트웨어 개발에서 자동화된 배포 파이프라인은 선택이 아닌 필수입니다. 수동으로 서버에 접속하여 코드를 빌드하고 배포하는 방식은 다음과 같은 치명적인 문제들을 야기합니다:

- **인적 오류**: 배포 과정에서 누락되거나 잘못 입력된 명령어로 인한 장애 발생
- **시간 낭비**: 단순 반복적인 작업에 개발자의 귀중한 시간이 소모됨
- **일관성 부족**: 개발, 스테이징, 운영 환경마다 배포 절차가 달라질 수 있음
- **느린 피드백**: 코드 변경 사항이 사용자에게 전달되기까지 너무 많은 시간이 소요됨

이러한 문제들을 해결하기 위해 **AWS CodePipeline**을 사용하여 빠르고 안정적인 CI/CD(지속적 통합 및 지속적 배포) 환경을 구축할 수 있습니다[^1]. 이 글에서는 AWS의 네이티브 서비스들을 활용해 배포 자동화를 구현하는 방법을 알아봅니다.

## AWS CodePipeline이란?

### 기본 개념

**AWS CodePipeline**은 빠르고 안정적인 애플리케이션 및 인프라 업데이트를 위해 릴리스 파이프라인을 자동화하는 완전관리형 지속적 전달 서비스입니다. 소스 코드의 변경이 발생할 때마다 정의된 워크플로에 따라 빌드, 테스트, 배포 단계를 자동으로 실행합니다.

*AWS CodePipeline의 전체적인 흐름: 소스 저장소부터 빌드 단계를 거쳐 최종 배포 환경까지 자동화된 워크플로를 시각화합니다.*

![AWS CodePipeline 워크플로 구조](/assets/images/2026-01-08-aws-codepipeline-cicd-guide/codepipeline-workflow.png)

### 핵심 구성 요소 (AWS Developer Tools)

1. **AWS CodeCommit / GitHub**: 소스 코드 저장소 (Source)
2. **AWS CodeBuild**: 소스 코드를 컴파일하고 유닛 테스트를 실행하며 소프트웨어 패키지를 생성 (Build)[^2]
3. **AWS CodeDeploy**: 인스턴스, 서버, 컨테이너 또는 Lambda 함수에 패키지를 배포 (Deploy)[^3]
4. **AWS CodePipeline**: 이 모든 단계들을 연결하고 관리하는 오케스트레이터

## 파이프라인 구축 단계

### 1. 소스 단계 설정 (Source Stage)

먼저 코드 변경을 감지할 소스 저장소를 연결합니다. AWS CodeCommit, GitHub, Bitbucket, S3 등을 사용할 수 있습니다.

- **연결 방식**: 최근에는 GitHub App 연결 방식을 주로 사용합니다.
- **감지 옵션**: 특정 브랜치(예: `main`)의 푸시 이벤트를 감지하여 파이프라인을 트리거합니다.

### 2. 빌드 단계 설정 (Build Stage)

**AWS CodeBuild**를 사용하여 애플리케이션을 빌드합니다. 프로젝트 루트에 `buildspec.yml` 파일을 작성하여 빌드 절차를 정의해야 합니다.

#### buildspec.yml 예시

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - echo Installing dependencies...
      - npm install
  pre_build:
    commands:
      - echo Running unit tests...
      - npm test
  build:
    commands:
      - echo Build started on `date`
      - npm run build
  post_build:
    commands:
      - echo Build completed on `date`
artifacts:
  files:
    - '**/*'
  base-directory: 'dist' # 빌드 결과물이 위치한 디렉토리
```

### 3. 배포 단계 설정 (Deploy Stage)

**AWS CodeDeploy**를 사용하여 빌드 결과물을 실제 환경(EC2, ECS, Lambda 등)에 배포합니다. EC2에 배포하는 경우 `appspec.yml` 파일이 필요합니다.

#### appspec.yml 예시 (EC2 기준)

```yaml
version: 0.0
os: linux
files:
  - source: /
    destination: /var/www/html
hooks:
  AfterInstall:
    - location: scripts/install_dependencies.sh
      timeout: 300
      runas: root
  ApplicationStart:
    - location: scripts/start_server.sh
      timeout: 300
      runas: root
```

## 실전 활용 시나리오

### 시나리오: EC2로의 Blue/Green 배포

가장 흔한 실전 사례 중 하나는 무중단 배포를 위한 Blue/Green 전략입니다.

1. **상황**: 기존 서버(Blue)가 운영 중인 상태에서 새로운 버전(Green)을 배포해야 함
2. **구성**:
   - CodePipeline이 GitHub에서 코드를 가져옴
   - CodeBuild가 아티팩트를 생성하고 S3에 저장
   - CodeDeploy가 새로운 인스턴스를 생성하고 배포 수행
   - 로드 밸런서 트래픽을 Blue에서 Green으로 전환 후 이전 인스턴스 삭제

### 시나리오 2: ECS Fargate를 이용한 컨테이너 기반 CI/CD

최근 클라우드 네이티브 환경에서는 컨테이너 기반의 배포 자동화가 많이 사용됩니다. ECS Fargate와 CodeDeploy를 연동하여 더욱 정교한 Blue/Green 배포를 구현할 수 있습니다.

*ECS Fargate와 CodeDeploy를 활용한 컨테이너 Blue/Green 배포 아키텍처: Docker 빌드, ECR 푸시, CloudFormation 인프라 배포, 그리고 로드 밸런서의 트래픽 전환까지의 전 과정을 상세히 보여줍니다.*

![ECS Fargate Blue/Green 배포 아키텍처](/assets/images/2026-01-08-aws-codepipeline-cicd-guide/ecs-blue-green-deployment.png)

## 파이프라인 관리 모범 사례

### 1. 보안 준수 (IAM)

파이프라인이 최소 권한 원칙을 준수하도록 IAM 역할을 설정해야 합니다.

- ❌ **잘못된 예시**: 파이프라인 역할에 `AdministratorAccess` 부여
- ✅ **올바른 예시**: S3 읽기/쓰기, CodeBuild 실행, 특정 리소스에 대한 배포 권한만 허용

### 2. 환경 변수 활용

보안이 중요한 정보(API Key, DB 패스워드 등)는 코드에 직접 하드코딩하지 말고 AWS Systems Manager Parameter Store나 Secrets Manager를 활용하는 것이 안전합니다.

```bash
# CodeBuild에서 Secrets Manager 값 가져오기 예시
commands:
  - export DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id my-db-pass --query SecretString --output text)
```

### 3. 수동 승인 단계 추가

운영 환경(Production) 배포 전에는 담당자의 확인이 필요할 수 있습니다. CodePipeline은 단계 사이에 'Manual Approval' 액션을 추가하여 안전장치를 마련할 수 있습니다.

## 마무리

AWS CodePipeline을 활용한 CI/CD 구성의 핵심은 다음과 같습니다:

1. **자동화**: 소스 변경부터 배포까지 수동 개입 최소화
2. **일관성**: `buildspec.yml`과 `appspec.yml`을 통한 표준화된 배포 절차
3. **안전성**: Blue/Green 배포 및 수동 승인 단계를 통한 장애 방지
4. **확장성**: 다양한 AWS 서비스와의 긴밀한 통합으로 유연한 구성 가능

배포 자동화는 단순히 편리함을 넘어 서비스의 품질과 개발 생산성을 높이는 핵심 인프라입니다. 수동 배포 환경이라면 AWS CodePipeline을 통해 자동화된 파이프라인 구축이 가능합니다.

---

**참고 자료:**

[^1]: [AWS 공식 문서: AWS CodePipeline이란 무엇입니까?](https://docs.aws.amazon.com/ko_kr/codepipeline/latest/userguide/welcome.html) - 서비스 개요 및 주요 기능 설명
[^2]: [AWS 공식 문서: AWS CodeBuild 개념](https://docs.aws.amazon.com/ko_kr/codebuild/latest/userguide/concepts.html) - 빌드 환경 및 설정 방법
[^3]: [AWS 공식 문서: AWS CodeDeploy 소개](https://docs.aws.amazon.com/ko_kr/codedeploy/latest/userguide/welcome.html) - 배포 그룹 및 전략 가이드
[^4]: [AWS 블로그: CI/CD 파이프라인 보안 모범 사례](https://aws.amazon.com/ko/blogs/devops/security-best-practices-for-ci-cd-pipelines/) - 보안 강화를 위한 IAM 설정 팁

