---
layout: single
title: "Jenkins를 활용한 CI/CD 파이프라인 구축하기"
date: 2026-01-11
last_modified_at: 2026-01-11T18:20:00+09:00
categories:
  - backend
tags:
  - jenkins
  - cicd
  - devops
  - backend
author: Daniel
excerpt: "Jenkins의 핵심 개념과 Pipeline 문법, 그리고 GitHub 연동을 통한 자동화된 CI/CD 환경 구축 방법을 상세히 살펴봅니다."
toc: true
toc_sticky: true
toc_label: "목차"
---

## 들어가며
소프트웨어 배포 과정에서 코드를 빌드하고, 테스트를 수행하며, 서버에 배포하는 일련의 과정을 수동으로 진행하는 것은 매우 위험하고 비효율적입니다. 사람이 직접 진행할 때 발생할 수 있는 실수를 줄이고, 개발자가 코드 작성에만 집중할 수 있는 환경을 만들기 위해서는 **CI/CD(지속적 통합/지속적 배포)** 자동화가 필수적입니다. [^1]

그중에서도 **Jenkins**는 가장 많이 사용되는 오픈소스 자동화 서버로, 수많은 플러그인을 통해 거의 모든 기술 스택과 연동할 수 있는 강력한 확장성을 제공합니다.

## Jenkins란 무엇인가?
Jenkins는 자바 기반의 오픈소스 자동화 서버로, 소프트웨어 개발 과정에서 반복되는 작업을 자동화해 줍니다. [^2]

*   **지속적 통합(CI)**: 여러 명의 개발자가 작업한 코드를 정기적으로 빌드하고 테스트하여 병합 이슈를 조기에 발견합니다.
*   **지속적 배포(CD)**: 빌드된 결과물을 스테이징 또는 프로덕션 환경에 자동으로 배포합니다.
*   **플러그인 생태계**: Git, Docker, Kubernetes, Slack 등 1,800개 이상의 플러그인을 지원하여 사용자 맞춤형 환경을 구축할 수 있습니다.

*Jenkins를 이용한 CI/CD 파이프라인의 전체적인 워크플로우*

![Jenkins CI/CD Workflow](/assets/images/2026-01-11-jenkins-cicd-guide/jenkins-workflow.png)

## Jenkins 설치 가이드
Jenkins는 컨테이너 환경에서 실행할 때 설정이 간편하고 호스트 OS와의 격리가 용이합니다. [^4]

### Docker를 이용한 설치 (권장)
Docker를 사용하여 Jenkins를 설치하고 실행하는 방법입니다.

```bash
# ✅ Docker를 이용한 Jenkins 실행
docker run -d \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  --name jenkins-server \
  jenkins/jenkins:lts
```
- `-p 8080:8080`: 웹 UI 접속 포트
- `-v jenkins_home:/var/jenkins_home`: 데이터 영속성을 위한 볼륨 설정

## 주요 개념 이해하기
Jenkins를 효율적으로 사용하기 위해 반드시 알아야 할 핵심 용어들입니다.

1.  **Pipeline**: 빌드-테스트-배포의 전 과정을 코드로 정의한 것입니다. (Pipeline as Code)
2.  **Node**: Jenkins가 작업을 실행하는 환경을 의미합니다. (Master와 Agent로 구성)
3.  **Stage**: 파이프라인 내의 독립적인 단계입니다. (예: Build, Test, Deploy)
4.  **Step**: Stage 내부에서 실행되는 구체적인 단일 작업입니다.

## Jenkins Pipeline 작성 예시 (Declarative)
현대적인 Jenkins 사용 방식인 **Declarative Pipeline** 문법을 활용한 코드 예시입니다.

```groovy
pipeline {
    agent any // 어느 에이전트에서든 실행 가능하도록 설정

    stages {
        stage('Checkout') {
            steps {
                // ✅ 올바른 예시: SCM에서 소스 코드 가져오기
                checkout scm
                echo 'Checking out source code...'
            }
        }
        
        stage('Build') {
            steps {
                // 빌드 스크립트 실행 (예: Gradle)
                sh './gradlew build'
                echo 'Building application...'
            }
        }

        stage('Test') {
            steps {
                // 테스트 수행
                sh './gradlew test'
                echo 'Running automated tests...'
            }
        }

        stage('Deploy') {
            steps {
                // ✅ 올바른 예시: 빌드 성공 시 배포 서버로 전송
                echo 'Deploying to server...'
                // sh './deploy.sh'
            }
        }
    }

    post {
        always {
            // ❌ 잘못된 예시: 결과 알림을 누락하면 안 됩니다.
            // 성공/실패 여부에 관계없이 실행
            echo 'Pipeline finished.'
        }
        success {
            echo 'CI/CD Pipeline Succeeded!'
        }
        failure {
            echo 'CI/CD Pipeline Failed. Check logs.'
        }
    }
}
```

## 실전 활용: GitHub Webhook 연동
Jenkins를 진정으로 가치 있게 만드는 것은 **이벤트 기반 자동화**입니다. GitHub Webhook을 연동하면 다음과 같은 흐름이 가능해집니다. [^3]

1.  개발자가 GitHub 리포지토리에 코드를 `push` 합니다.
2.  GitHub가 Jenkins 서버에 Webhook 이벤트를 보냅니다.
3.  Jenkins는 이벤트를 감지하고 미리 정의된 Pipeline을 즉시 실행합니다.
4.  빌드 및 테스트 결과가 Slack이나 이메일로 팀원들에게 공유됩니다.

## 마무리
Jenkins는 강력한 유연성과 방대한 커뮤니티 지원을 바탕으로 CI/CD 환경의 표준으로 자리 잡았습니다.

1.  **Pipeline as Code**: `Jenkinsfile`을 통해 인프라의 형상 관리가 가능합니다.
2.  **확장성**: 1,800개 이상의 플러그인을 통해 어떤 환경과도 연동할 수 있습니다.
3.  **자동화**: Webhook 연동을 통해 개발 생산성을 극대화할 수 있습니다.

---

**참고 자료:**

[^1]: [Jenkins 공식 문서 - Guided Tour](https://www.jenkins.io/doc/pipeline/tour/getting-started/) - Jenkins 시작하기 가이드
[^2]: [Red Hat - CI/CD란 무엇인가?](https://www.redhat.com/ko/topics/devops/what-is-ci-cd) - CI/CD의 기본 개념과 중요성
[^3]: [Jenkins Wiki - GitHub Plugin](https://plugins.jenkins.io/github/) - GitHub와 Jenkins 연동 방법
[^4]: [Jenkins 공식 문서 - Installing Jenkins](https://www.jenkins.io/doc/book/installing/) - 플랫폼별 Jenkins 설치 상세 가이드
