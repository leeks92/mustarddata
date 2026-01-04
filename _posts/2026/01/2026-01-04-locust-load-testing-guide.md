---
layout: single
title: "Locust 부하테스트로 우리 서비스가 수용 가능한 범위 측정하기"
date: 2026-01-04
last_modified_at: 2026-01-04T22:31:52+09:00
categories:
  - backend
tags:
  - locust
  - load-testing
  - performance-testing
  - python
  - backend
author: Daniel
excerpt: "Locust를 사용하여 서비스의 성능 한계를 측정하고 수용 가능한 트래픽 범위를 파악하는 방법을 알아봅니다. Python 기반의 부하테스트 도구 활용 가이드."
toc: true
toc_sticky: true
toc_label: "목차"
---

## 들어가며

서비스를 운영하다 보면 다음과 같은 질문을 마주하게 됩니다:

- 우리 서비스는 동시에 몇 명의 사용자를 처리할 수 있을까?
- 트래픽이 급증했을 때 서비스가 정상적으로 동작할까?
- 어느 지점에서 성능이 저하되기 시작할까?
- 서버 리소스가 부족해지는 시점은 언제일까?

이런 질문에 답하기 위해서는 **부하테스트(Load Testing)**가 필요합니다. 부하테스트는 실제 사용자 시나리오를 시뮬레이션하여 서비스의 성능 한계를 측정하는 과정입니다[^1].

**Locust**는 Python으로 작성된 오픈소스 부하테스트 도구로, 코드로 테스트 시나리오를 작성할 수 있어 유연하게 테스트를 구성할 수 있습니다. 이 글에서는 Locust를 사용하여 서비스의 수용 가능한 범위를 측정하는 방법을 알아봅니다.

## Locust란?

### 기본 개념

**Locust**는 Python 기반의 오픈소스 부하테스트 프레임워크입니다. 사용자 행동을 Python 코드로 정의하고, 수천 명의 동시 사용자를 시뮬레이션할 수 있습니다.

### Locust의 주요 특징

1. **코드 기반 테스트**: Python 코드로 테스트 시나리오 작성
2. **분산 실행**: 여러 머신에서 분산하여 대규모 부하 생성 가능
3. **실시간 모니터링**: 웹 UI를 통한 실시간 통계 확인
4. **유연한 시나리오**: 복잡한 사용자 행동 패턴 구현 가능
5. **확장성**: 수천 명의 동시 사용자 시뮬레이션 가능

### 다른 부하테스트 도구와의 비교

| 도구 | 언어 | 특징 |
|------|------|------|
| **Locust** | Python | 코드 기반, 유연함, 웹 UI 제공 |
| Apache JMeter | Java | GUI 기반, XML 설정 |
| Gatling | Scala | 코드 기반, 고성능 |
| k6 | JavaScript | 코드 기반, 클라우드 통합 |

## 설치 및 기본 설정

### 1. Locust 설치

```bash
# pip를 사용한 설치
pip install locust
```

### 2. 기본 테스트 파일 작성

가장 간단한 Locust 테스트 파일 예시:

```python
# locustfile.py
from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(1, 3)  # 요청 간 1~3초 대기
    
    @task
    def index_page(self):
        self.client.get("/")
    
    @task(3)  # 가중치 3 (더 자주 실행)
    def view_item(self):
        self.client.get("/item/1")
```

### 3. Locust 실행

```bash
# 기본 실행 (웹 UI: http://localhost:8089)
locust

# 특정 파일 지정
locust -f locustfile.py

# 호스트 지정
locust --host=https://api.example.com

# 헤드리스 모드 (웹 UI 없이 실행)
locust --headless -u 100 -r 10 -t 30s
```

## 테스트 시나리오 작성

### 기본 사용자 클래스 구조

```python
from locust import HttpUser, task, between

class ApiUser(HttpUser):
    # 요청 간 대기 시간 (초)
    wait_time = between(1, 2)
    
    # 테스트 시작 전 실행 (로그인 등)
    def on_start(self):
        self.login()
    
    def login(self):
        response = self.client.post("/api/login", json={
            "username": "testuser",
            "password": "testpass"
        })
        if response.status_code == 200:
            self.token = response.json()["token"]
    
    @task
    def get_profile(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        self.client.get("/api/profile", headers=headers)
    
    @task(2)
    def get_items(self):
        self.client.get("/api/items")
```

### 태스크 가중치 설정

태스크에 가중치를 부여하여 실행 빈도를 조절할 수 있습니다:

```python
class WebsiteUser(HttpUser):
    @task(1)  # 가중치 1 (덜 자주 실행)
    def view_homepage(self):
        self.client.get("/")
    
    @task(3)  # 가중치 3 (더 자주 실행)
    def view_product(self):
        self.client.get("/product/1")
    
    @task(5)  # 가중치 5 (가장 자주 실행)
    def search(self):
        self.client.get("/search?q=test")
```

### 시퀀스 태스크 (순차 실행)

여러 태스크를 순차적으로 실행하려면 `SequentialTaskSet`을 사용합니다:

```python
from locust import HttpUser, task, SequentialTaskSet, between

class CheckoutFlow(SequentialTaskSet):
    @task
    def add_to_cart(self):
        self.client.post("/api/cart", json={"item_id": 1})
    
    @task
    def view_cart(self):
        self.client.get("/api/cart")
    
    @task
    def checkout(self):
        self.client.post("/api/checkout", json={"cart_id": 1})

class ECommerceUser(HttpUser):
    wait_time = between(1, 3)
    tasks = [CheckoutFlow]
```

### 동적 데이터 사용

테스트에 동적 데이터를 사용하여 더 현실적인 시나리오를 만들 수 있습니다:

```python
import random
from locust import HttpUser, task, between

class ApiUser(HttpUser):
    wait_time = between(1, 2)
    
    def on_start(self):
        # 랜덤 사용자 ID 생성
        self.user_id = random.randint(1, 1000)
    
    @task
    def get_user_data(self):
        # 동적 경로 사용
        self.client.get(f"/api/users/{self.user_id}")
    
    @task
    def create_post(self):
        # 랜덤 데이터 생성
        post_data = {
            "title": f"Test Post {random.randint(1, 10000)}",
            "content": "Test content"
        }
        self.client.post("/api/posts", json=post_data)
```

## 부하 테스트 실행

### 웹 UI를 통한 실행

```bash
locust --host=https://api.example.com
```

웹 브라우저에서 `http://localhost:8089`에 접속하면 Locust 웹 UI가 표시됩니다:

- **Number of users**: 동시 사용자 수
- **Spawn rate**: 초당 생성할 사용자 수
- **Host**: 테스트 대상 서버 주소

### 커맨드라인 실행 (헤드리스 모드)

```bash
# 기본 헤드리스 실행
locust --headless -u 100 -r 10 -t 30s --host=https://api.example.com

# 옵션 설명:
# -u, --users: 총 사용자 수
# -r, --spawn-rate: 초당 생성할 사용자 수
# -t, --run-time: 테스트 실행 시간 (예: 30s, 5m, 1h)
# --host: 테스트 대상 호스트
```

### 추가 실행 옵션

```bash
# 결과를 CSV로 저장
locust --headless -u 100 -r 10 -t 30s \
  --csv=results \
  --html=report.html \
  --host=https://api.example.com

# 로그 레벨 설정
locust --loglevel=DEBUG

# 특정 태스크만 실행
locust --tags=api,heavy
```

## 결과 분석 및 해석

### 웹 UI에서 확인할 수 있는 메트릭

Locust 웹 UI에서는 다음과 같은 메트릭을 실시간으로 확인할 수 있습니다:

1. **Statistics**: 요청별 통계
   - 총 요청 수
   - 실패 수
   - 평균 응답 시간
   - 최소/최대 응답 시간
   - 중간값(Median)
   - 95th/99th 백분위수

2. **Charts**: 실시간 차트
   - 총 RPS (Requests Per Second)
   - 응답 시간 추이
   - 사용자 수 추이

3. **Failures**: 실패한 요청 상세 정보

### 주요 메트릭 해석

#### 응답 시간 (Response Time)

```yaml
평균 응답 시간: 200ms
  → 대부분의 요청이 빠르게 처리됨

95th 백분위수: 500ms
  → 95%의 요청이 500ms 이내에 완료됨

99th 백분위수: 2000ms
  → 일부 요청은 2초 이상 소요 (최적화 필요)
```

#### RPS (Requests Per Second)

```yaml
현재 RPS: 100
  → 초당 100개의 요청 처리 중

목표 RPS: 500
  → 목표에 도달하지 못함 (서버 성능 개선 필요)
```

#### 실패율 (Failure Rate)

```yaml
실패율: 0%
  → 모든 요청이 성공적으로 처리됨

실패율: 5%
  → 일부 요청 실패 (서버 부하 또는 버그 가능성)
```

### CSV 결과 분석

Locust는 테스트 결과를 CSV 파일로 저장할 수 있습니다:

```bash
locust --headless -u 100 -r 10 -t 30s --csv=results
```

생성되는 파일:
- `results_stats.csv`: 요청별 통계
- `results_stats_history.csv`: 시간별 통계 히스토리
- `results_failures.csv`: 실패한 요청 목록

## 실전 활용 시나리오

### 시나리오 1: API 엔드포인트 부하테스트

REST API의 여러 엔드포인트를 테스트하는 예시:

```python
from locust import HttpUser, task, between

class ApiUser(HttpUser):
    wait_time = between(0.5, 2)
    
    def on_start(self):
        # 인증 토큰 획득
        response = self.client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        if response.status_code == 200:
            self.token = response.json()["access_token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
    
    @task(3)
    def get_users(self):
        self.client.get("/api/users", headers=self.headers)
    
    @task(2)
    def get_user_detail(self):
        self.client.get("/api/users/1", headers=self.headers)
    
    @task(1)
    def create_user(self):
        self.client.post("/api/users", json={
            "name": "Test User",
            "email": "newuser@example.com"
        }, headers=self.headers)
```

### 시나리오 2: 단계적 부하 증가 (Ramp-up)

서버가 점진적으로 부하를 처리할 수 있는지 확인:

```python
from locust import HttpUser, task, between

class RampUpUser(HttpUser):
    wait_time = between(1, 3)
    
    @task
    def api_call(self):
        self.client.get("/api/data")

# 실행 방법:
# 1단계: 10명의 사용자로 시작
# 2단계: 10초마다 10명씩 증가
# 3단계: 최대 100명까지 증가
```

실행 명령어:

```bash
# 단계적으로 사용자 수 증가
locust --headless \
  -u 100 \           # 최대 100명
  -r 10 \            # 초당 10명씩 증가
  -t 5m \            # 5분간 실행
  --host=https://api.example.com
```

### 시나리오 3: 스트레스 테스트

서비스의 한계점을 찾는 스트레스 테스트:

```python
from locust import HttpUser, task, between

class StressTestUser(HttpUser):
    wait_time = between(0.1, 0.5)  # 짧은 대기 시간
    
    @task
    def heavy_operation(self):
        # 무거운 작업 시뮬레이션
        self.client.get("/api/complex-calculation")
    
    @task(2)
    def database_query(self):
        # 데이터베이스 쿼리 시뮬레이션
        self.client.get("/api/data?filter=complex")
```

실행:

```bash
# 높은 부하로 스트레스 테스트
locust --headless \
  -u 1000 \          # 1000명의 동시 사용자
  -r 50 \            # 초당 50명씩 증가
  -t 10m \           # 10분간 실행
  --host=https://api.example.com
```

### 시나리오 4: 분산 부하테스트

여러 머신에서 분산하여 대규모 부하 생성:

**마스터 노드 (Master)**:

```bash
locust --master --host=https://api.example.com
```

**워커 노드 (Worker)**:

```bash
locust --worker --master-host=<마스터_IP>
```

여러 워커를 실행하면 부하가 분산되어 더 많은 동시 사용자를 시뮬레이션할 수 있습니다.

## 마무리

Locust를 사용하여 부하테스트를 수행하면:

1. **성능 한계 파악**: 서비스가 처리할 수 있는 최대 트래픽 확인
2. **병목 지점 발견**: 성능 저하가 발생하는 지점 식별
3. **용량 계획**: 필요한 서버 리소스 예측
4. **안정성 검증**: 트래픽 급증 시 서비스 안정성 확인

부하테스트는 서비스를 배포하기 전에 반드시 수행해야 하는 중요한 과정입니다. Locust를 활용하여 코드 기반의 유연하고 강력한 부하테스트를 구현하고, 서비스의 수용 가능한 범위를 정확히 측정할 수 있습니다.

---

**참고 자료:**

[^1]: [Locust 공식 문서](https://docs.locust.io/) - Locust 사용 가이드 및 API 레퍼런스
[^2]: [Locust GitHub 저장소](https://github.com/locustio/locust) - 소스 코드 및 이슈 트래킹
[^3]: [부하테스트 모범 사례](https://docs.locust.io/en/stable/writing-a-locustfile.html) - 효과적인 테스트 시나리오 작성 방법
[^4]: [분산 실행 가이드](https://docs.locust.io/en/stable/running-distributed.html) - 여러 머신에서 분산 실행하는 방법

