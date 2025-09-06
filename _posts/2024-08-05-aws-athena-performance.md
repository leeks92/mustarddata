---
layout: single
title: "[AWS] Athena 데이터 압축, 데이터 파티셔닝 최적화 방법"
# date: 2024-06-01
# last_modified_at: 2024-06-03T14:02:00
categories:
  - aws
# tags:
#     - [common]
# 목차 활성화
toc: true
# 목차 라벨
# toc_label: 목차
# 목차 스크롤 고정
toc_sticky: true
# 글 좌측 프로필 안 보이게 하기
# author_profile: false
# 블로그 내에서 글 검색 안되도록 하기
# search: false
---

## AWS Athena 최적화

AWS에서 제공하는 서버리스 서비스인 Athena는 실제로 실행한 쿼리에 대한 비용이 청구되며 데이터 스캔량에 따라서 비용이 결정된다(온디멘드).

비용은 1TB당 5달러로 책정되고 비싸다고 체감이 되는 편은 아니기 때문에 크게 신경쓰지 않고 쿼리를 실행할 수 있지만 무분별하게 사용하다보면 막대한 비용을 치르게 될 수도 있어 항상 최적화에 주의를 기울여야 한다.

이 때, 데이터 압축과 파티셔닝은 Athena 최적화를 위한 접근을 할 수 있다.

## AWS Athena 데이터 압축

서두에서 언급한 것처럼 Athena의 비용은 스캔한 데이터 양에 따라서 결정된다. Athena에서는 스캔 크기를 줄일 수 있도록 데이터를 압축해서 저장할 수 있는 것을 권장하고 있는데, 데이터를 압축함으로써 아래와 같은 효과를 기대할 수 있다.

1. 스캔하는 데이터 크기 감소로 인한 비용 절감
2. 쿼리 속도 향상
3. 네트워크 비용 감소

aws s3 ls s3://vaivcompany-dev/package_adid_master/20240727 --recursive --summarize --human-readable --profile vaiv
aws s3 ls s3://vaivcompany-dev/package_adid_master_test --recursive --summarize --human-readable --profile vaiv
aws s3 ls s3://vaivcompany-dev/package_adid_master_snappy --recursive --summarize --human-readable --profile vaiv
aws s3 ls s3://vaivcompany-dev/package_adid_master_gzip --recursive --summarize --human-readable --profile vaiv
aws s3 ls s3://vaivcompany-dev/package_adid_master_lz4 --recursive --summarize --human-readable --profile vaiv
aws s3 ls s3://vaivcompany-dev/package_adid_master_lzo --recursive --summarize --human-readable --profile vaiv
aws s3 ls s3://vaivcompany-dev/package_adid_master_zstd_3 --recursive --summarize --human-readable --profile vaiv

https://hook.dooray.com/services/2044091570192967999/3758767381136131139/keNhgUSHQDO5z5jNwpiSgg
https://hook.dooray.com/services/2044091570192967999/3804568467182843756/ZdnndlsCRMSvAwKe-BlvEg
https://hook.dooray.com/services/2044091570192967999/3804568467182843756/ZdnndlsCRMSvAwKe-BlvEg
