---
layout: single
title: "[AWS] Athena 성능 향상 TIP - 데이터 압축, 파티셔닝 최적화"
date: 2024-08-05
last_modified_at: 2024-08-05T00:00:00+09:00
categories:
  - cloud
tags:
  - aws
  - athena
  - s3
  - optimization
author: Daniel
excerpt: "AWS Athena 쿼리 비용과 성능을 개선하기 위한 데이터 압축 및 파티셔닝 최적화 방법을 알아봅니다."
toc: true
toc_sticky: true
toc_label: "목차"
---

## 들어가며

AWS Athena는 서버리스 쿼리 서비스로, 실행한 쿼리가 스캔한 데이터 용량만큼 비용이 청구됩니다. 쿼리 실행 시간이 3~5분 이상 걸리거나, 예상보다 높은 비용이 발생하는 경우가 있다면 데이터 압축과 파티셔닝을 통해 성능과 비용 개선을 고민해볼 수 있습니다[^1].

> **참고**: DDL문(CREATE, ALTER)과 실패한 쿼리문에 대한 비용은 청구되지 않습니다.

## 데이터 압축

Athena의 비용은 스캔한 데이터의 크기를 기준으로 발생합니다. 따라서 S3에 저장된 데이터를 압축하여 저장하는 것을 권장합니다. 데이터 압축을 통해 얻을 수 있는 이점은 다음과 같습니다:

1. **스캔 데이터 크기 감소** → 비용 절감
2. **쿼리 속도 향상** → 네트워크 전송 시간 단축
3. **네트워크 비용 감소**

### Athena가 지원하는 압축 형식

Athena는 다양한 압축 형식을 지원합니다[^2]:

- **snappy**: Parquet 데이터 스토리지 형식의 기본 압축 형식
- **zlib**: ORC 데이터 스토리지 형식의 기본 압축 형식
- **gzip**: 데이터 파일에 `.gz` 확장자를 사용하는 기본 압축 형식

### 데이터 압축 설정하기

압축 형식은 `TBLPROPERTIES` 속성으로 지정할 수 있습니다. `CREATE` 문이나 `ALTER` 문에 `orc.compress` 또는 `parquet.compression` 값을 설정하면 됩니다.

#### CREATE 문에서 압축 설정

```sql
CREATE EXTERNAL TABLE IF NOT EXISTS test.myjson2 (
  `time` STRING,
  `user_id` STRING,
  `board_name` STRING,
  `action` STRING
) 
LOCATION 's3://athena-log-test-11/jsonTest'
TBLPROPERTIES("PARQUET.COMPRESS"="GZIP");
```

#### ALTER 문으로 기존 테이블 압축 설정 변경

```sql
ALTER TABLE test.myjson SET TBLPROPERTIES("PARQUET.COMPRESS"="GZIP");
```

#### 압축 설정 확인하기

```sql
SHOW TBLPROPERTIES test.myjson('parquet.compression');
```

또는 AWS Glue 콘솔에서도 테이블 속성을 확인할 수 있습니다.

## 데이터 파티셔닝

데이터 파티셔닝(Data Partitioning)은 데이터를 분할 저장하여 조건에 따라 일부 데이터만 검색할 수 있도록 하는 기법입니다. 파티셔닝을 통해 쿼리당 스캔하는 데이터의 양을 줄여 성능을 향상시키고 비용을 절감할 수 있습니다.

파티셔닝을 적절히 적용하면 테이블 조회 쿼리 실행 시간이 **3~5분에서 5초로 단축**되는 경우가 있습니다. 따라서 Athena를 사용할 때 파티셔닝은 필수로 적용하는 것이 좋습니다.

보통 파티셔닝은 **날짜 기준**으로 쿼리가 스캔하는 범위를 제한합니다. 예를 들어:

- ❌ **파티셔닝 없음**: 10년치 로그가 한 폴더에 있는 경우 → 10년치 로그를 모두 스캔
- ✅ **파티셔닝 적용**: `bucket/2022/7/1` 형식으로 분할된 경우 → 해당 날짜의 로그만 스캔

### 자동 맵핑 (Partition Projection)

자동 맵핑은 S3 버킷의 폴더 구조를 기반으로 파티션을 자동으로 인식하는 방법입니다. 공식 문서에서는 다음과 같은 폴더 구조를 권장합니다[^3]:

```
s3://bucket-name/
  year=2022/
    month=7/
      day=1/
        data-file.parquet
      day=2/
        data-file.parquet
    month=8/
      day=1/
        data-file.parquet
```

이 구조로 데이터를 저장하면, Athena가 자동으로 `year`, `month`, `day` 파티션을 인식합니다.

#### 자동 맵핑 테이블 생성 예시

```sql
CREATE EXTERNAL TABLE test.logs (
  `time` STRING,
  `user_id` STRING,
  `action` STRING
)
PARTITIONED BY (
  year INT,
  month INT,
  day INT
)
STORED AS PARQUET
LOCATION 's3://bucket-name/'
TBLPROPERTIES (
  'projection.enabled'='true',
  'projection.year.type'='integer',
  'projection.year.range'='2020,2025',
  'projection.month.type'='integer',
  'projection.month.range'='1,12',
  'projection.day.type'='integer',
  'projection.day.range'='1,31',
  'storage.location.template'='s3://bucket-name/year=${year}/month=${month}/day=${day}/'
);
```

#### 파티셔닝된 테이블 쿼리 예시

```sql
-- 특정 날짜의 데이터만 조회 (파티션 프루닝)
SELECT * 
FROM test.logs 
WHERE year = 2022 
  AND month = 7 
  AND day = 1;
```

### 수동 맵핑

이미 S3에 데이터가 쌓여있고 폴더 구조가 다른 경우, 수동으로 파티션을 추가할 수 있습니다.

#### 수동 파티션 추가

```sql
ALTER TABLE test.logs ADD PARTITION (year=2022, month=7, day=1)
LOCATION 's3://bucket-name/2022/07/01/';
```

#### 모든 파티션 일괄 추가

```sql
MSCK REPAIR TABLE test.logs;
```

`MSCK REPAIR TABLE` 명령은 S3의 폴더 구조를 스캔하여 누락된 파티션을 자동으로 추가합니다.

## 실전 활용 시나리오

### 시나리오 1: 기존 테이블 최적화

이미 생성된 테이블에 압축과 파티셔닝을 적용하는 경우:

```sql
-- 1. 압축 설정 추가
ALTER TABLE test.logs SET TBLPROPERTIES("PARQUET.COMPRESS"="SNAPPY");

-- 2. 파티션 추가 (수동)
ALTER TABLE test.logs ADD PARTITION (year=2024, month=8, day=5)
LOCATION 's3://bucket-name/2024/08/05/';

-- 3. 파티션 확인
SHOW PARTITIONS test.logs;
```

### 시나리오 2: 새 테이블 생성 시 최적화 적용

새로운 테이블을 생성할 때부터 최적화를 적용하는 경우:

```sql
CREATE EXTERNAL TABLE test.optimized_logs (
  `time` STRING,
  `user_id` STRING,
  `action` STRING,
  `status_code` INT
)
PARTITIONED BY (
  year INT,
  month INT,
  day INT
)
STORED AS PARQUET
LOCATION 's3://bucket-name/'
TBLPROPERTIES (
  'PARQUET.COMPRESS'='SNAPPY',
  'projection.enabled'='true',
  'projection.year.type'='integer',
  'projection.year.range'='2020,2025',
  'projection.month.type'='integer',
  'projection.month.range'='1,12',
  'projection.day.type'='integer',
  'projection.day.range'='1,31',
  'storage.location.template'='s3://bucket-name/year=${year}/month=${month}/day=${day}/'
);
```

## 마무리

- **데이터 압축**: `TBLPROPERTIES`로 `PARQUET.COMPRESS` 또는 `ORC.COMPRESS` 설정하여 스캔 데이터 크기 감소
- **데이터 파티셔닝**: 날짜 기준으로 파티션을 구성하여 필요한 데이터만 스캔하도록 최적화
- **자동 맵핑**: 새로운 데이터 적재 시 `year=YYYY/month=MM/day=DD` 구조로 저장하면 자동 인식
- **수동 맵핑**: 기존 데이터는 `ALTER TABLE ADD PARTITION` 또는 `MSCK REPAIR TABLE`로 파티션 추가

---

**참고 자료:**

[^1]: [Amazon Athena 요금](https://aws.amazon.com/athena/pricing/) - Athena 요금 체계 및 비용 최적화 방법
[^2]: [Athena 압축 지원](https://docs.aws.amazon.com/athena/latest/ug/compression-formats.html) - Athena가 지원하는 압축 형식 목록
[^3]: [Athena 파티션 프로젝션](https://docs.aws.amazon.com/athena/latest/ug/partition-projection.html) - 파티션 프로젝션 설정 방법 및 예시
