# 📚 다니엘 노트 (Daniel's Note)

> **데이터와 개발에 관한 이야기를 담은 기술 블로그**  
> 🌐 **사이트**: [https://mustarddata.com](https://mustarddata.com)

## 🎯 프로젝트 개요

이 저장소는 Jekyll과 Minimal Mistakes 테마를 사용하여 구축된 개인 기술 블로그입니다. 데이터 엔지니어링, 웹 개발, SEO 등 다양한 기술 주제를 다루며, 애드센스 승인에 최적화된 구조로 설계되었습니다.

### 🛠️ 기술 스택
- **SSG**: Jekyll 4.3.3
- **테마**: Minimal Mistakes
- **호스팅**: GitHub Pages
- **분석**: Google Analytics
- **댓글**: Disqus
- **스타일링**: SCSS

### ✨ 주요 특징
- 📱 완전한 반응형 디자인
- 🔍 SEO 최적화 완료
- 📊 Google Analytics 연동
- 💬 댓글 시스템 (Disqus)
- 🏷️ 카테고리별 콘텐츠 분류
- 📄 법적 고지 페이지 완비 (개인정보처리방침, 이용약관)

---

## 🚀 개발 환경 설정

### 필수 요구사항
- Ruby 3.0+
- Bundler
- Git

### 로컬 실행
```bash
# 저장소 클론
git clone https://github.com/your-username/mustarddata.git
cd mustarddata

# 의존성 설치
bundle install

# 개발 서버 시작
bundle exec jekyll serve

# 브라우저에서 접속
# http://localhost:4000
```

### 🛠️ 문제 해결

#### WebRick 오류
```bash
bundle add webrick
```

#### 포트 충돌 (4000번 포트 사용 중)
```bash
# 포트 사용 프로세스 확인
lsof -ti:4000

# 프로세스 종료
kill [PID]

# 또는 다른 포트 사용
bundle exec jekyll serve --port 4001
```

---

## ✍️ 글 작성 가이드

### 📁 파일 구조
```
_posts/
├── YYYY-MM-DD-title.md
└── 2024-09-06-example-post.md
```

### 📝 기본 템플릿

새 글을 작성할 때는 다음 템플릿을 사용하세요:

```markdown
---
layout: single
title: "글 제목 (SEO 최적화된 키워드 포함)"
date: 2024-09-06
last_modified_at: 2024-09-06T14:30:00+09:00
categories: [category1, category2]
tags: [tag1, tag2, tag3]
author: Daniel
excerpt: "이 글의 요약 내용 (120자 이내, 검색 결과에 표시됨)"
header:
  teaser: "/assets/images/post-thumbnail.jpg"
  og_image: "/assets/images/post-thumbnail.jpg"
toc: true
toc_sticky: true
toc_label: "목차"
---

## 서론

독자의 관심을 끄는 도입 문장으로 시작하세요.

## 본문

### 소제목 1
내용 작성...

### 소제목 2
내용 작성...

## 결론

핵심 내용을 요약하고 독자에게 가치를 제공하는 마무리를 작성하세요.

---

*이 글이 도움이 되었다면 댓글로 의견을 남겨주세요!*
```

### 🎨 Front Matter 옵션

| 옵션 | 설명 | 예시 |
|------|------|------|
| `layout` | 레이아웃 지정 | `single`, `home`, `archive` |
| `title` | 글 제목 (SEO 중요) | `"AWS Athena 성능 최적화 가이드"` |
| `date` | 발행일 | `2024-09-06` |
| `last_modified_at` | 수정일 (SEO 도움) | `2024-09-06T14:30:00+09:00` |
| `categories` | 카테고리 (복수 가능) | `[aws, data-engineering]` |
| `tags` | 태그 | `[athena, sql, performance]` |
| `excerpt` | 글 요약 (검색 결과 표시) | `"Athena 쿼리 성능을 10배 향상시키는 방법"` |
| `toc` | 목차 표시 | `true` / `false` |
| `toc_sticky` | 목차 고정 | `true` / `false` |
| `author_profile` | 작성자 프로필 표시 | `true` / `false` |
| `search` | 사이트 내 검색 포함 | `true` / `false` |

### 🏷️ 카테고리 가이드

현재 사용 가능한 카테고리:

- **`python`**: Python 관련 내용
- **`aws`**: AWS 서비스 및 클라우드
- **`chatgpt`**: AI/ML 도구 활용
- **`seo`**: 검색엔진 최적화
- **`airflow`**: 데이터 파이프라인
- **`notion`**: 생산성 도구

새로운 카테고리 추가 시 `_data/navigation.yml` 파일도 함께 업데이트하세요.

---

## 🔍 SEO 최적화 전략

### 📈 핵심 SEO 체크리스트

#### ✅ 제목 최적화
- **길이**: 30-60자 (모바일 검색 고려)
- **키워드**: 타겟 키워드를 제목 앞쪽에 배치
- **매력도**: 클릭을 유도하는 표현 사용

**예시**:
```
❌ "데이터베이스에 대해"
✅ "AWS Athena 쿼리 성능 최적화: 실행 속도 10배 향상 가이드"
```

#### ✅ 메타 설명 (excerpt) 작성
- **길이**: 120-160자
- **키워드 포함**: 자연스럽게 타겟 키워드 포함
- **행동 유도**: "방법", "가이드", "해결책" 등 사용

#### ✅ 헤딩 구조 최적화
```markdown
# H1: 글 제목 (자동 생성)
## H2: 주요 섹션
### H3: 하위 주제
#### H4: 세부 내용
```

#### ✅ 내부 링크 전략
- 관련 포스트들 간 연결
- 카테고리 페이지 링크
- About, Contact 페이지 자연스러운 연결

```markdown
이전에 작성한 [Airflow 설치 가이드](/categories/airflow/)에서 다뤘듯이...

더 자세한 내용은 [저에게 문의](/contact/)해 주세요.
```

#### ✅ 이미지 최적화
```markdown
![AWS Athena 성능 최적화 결과](/assets/images/athena-performance.png)
{: .align-center}
*Athena 쿼리 최적화 전후 성능 비교*
```

**이미지 SEO 가이드**:
- 파일명에 키워드 포함: `athena-performance-optimization.png`
- Alt 텍스트 작성: 화면 낭독기와 SEO에 도움
- 적절한 크기: 웹 최적화된 크기 사용

### 🎯 키워드 전략

#### 키워드 리서치 도구
- **Google Keyword Planner**
- **Google Trends**
- **AnswerThePublic**
- **관련 검색어** (구글 검색 결과 하단)

#### 롱테일 키워드 활용
```
❌ "AWS" (경쟁 치열)
✅ "AWS Athena 쿼리 성능 최적화 방법" (구체적, 경쟁 낮음)
```

#### 키워드 밀도
- **자연스러운 사용**: 키워드 과도 사용 금지
- **LSI 키워드**: 관련 용어도 함께 사용
- **동의어 활용**: 다양한 표현으로 자연스럽게

### 📊 구조화된 데이터

블로그 포스트에 스키마 마크업 추가:

```html
<!-- _includes/head/custom.html에 추가 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{{ page.title }}",
  "author": {
    "@type": "Person",
    "name": "{{ site.author.name }}"
  },
  "datePublished": "{{ page.date | date_to_xmlschema }}",
  "dateModified": "{{ page.last_modified_at | date_to_xmlschema }}",
  "description": "{{ page.excerpt | strip_html | strip }}"
}
</script>
```

---

## 🖼️ 이미지 및 미디어 가이드

### 📸 이미지 삽입 방법

#### 방법 1: GitHub Issues 활용 (추천)
1. GitHub 저장소의 Issues 탭으로 이동
2. 새 이슈 생성 화면에서 이미지 드래그 앤 드롭
3. 생성된 마크다운 코드 복사하여 사용

#### 방법 2: assets 폴더 사용
```markdown
![이미지 설명](/assets/images/filename.jpg)
{: .align-center width="70%"}
```

### 🎨 이미지 스타일링
```markdown
![이미지](/path/to/image.jpg)
{: .align-center}     <!-- 가운데 정렬 -->
{: .align-left}       <!-- 왼쪽 정렬 -->
{: .align-right}      <!-- 오른쪽 정렬 -->
{: width="50%"}       <!-- 너비 지정 -->
{: .shadow}           <!-- 그림자 효과 -->
```

### 📱 반응형 이미지
```markdown
![반응형 이미지](/assets/images/example.jpg)
{: .align-center width="100%" height="auto"}
```

---

## 🎨 콘텐츠 작성 팁

### 📖 독자 친화적인 구조

#### 도입부 (Hook)
```markdown
## 이런 경험 있으신가요?

AWS Athena로 대용량 데이터를 분석하는데 쿼리 하나 실행하는 데 10분이 넘게 걸린다면? 
이 글에서는 실행 시간을 10분의 1로 줄이는 구체적인 방법을 알려드립니다.
```

#### 본문 (가독성)
- **짧은 문단**: 3-4문장으로 구성
- **목록 활용**: 복잡한 내용을 정리
- **강조 표시**: **중요한 내용** 볼드 처리
- **코드 블록**: 구문 강조 활용

```python
# Athena 쿼리 최적화 예시
SELECT 
    year,
    month,
    COUNT(*) as total_count
FROM s3_data 
WHERE year BETWEEN 2023 AND 2024
    AND region = 'us-east-1'
PARTITION BY (year, month)
ORDER BY year, month;
```

#### 마무리 (Call-to-Action)
```markdown
## 마무리

이 글에서 소개한 Athena 최적화 기법들을 적용하면 쿼리 성능을 크게 개선할 수 있습니다. 

**실제로 적용해보시고 결과를 댓글로 공유해 주세요!** 
다른 최적화 팁이나 궁금한 점이 있다면 [연락처](/contact/)를 통해 문의해 주시기 바랍니다.
```

### 🔍 검색 의도 맞추기

#### 정보성 쿼리 (How-to)
- "방법", "가이드", "튜토리얼" 키워드 사용
- 단계별 설명 제공
- 예시 코드와 스크린샷 포함

#### 비교성 쿼리 (vs, 비교)
- 장단점 표로 정리
- 사용 사례별 추천
- 객관적인 비교 기준 제시

#### 문제해결 쿼리 (Error, 해결)
- 에러 메시지 원문 포함
- 원인 분석
- 단계별 해결 방법
- 예방책 제시

---

## 🚀 배포 및 관리

### 📤 GitHub Pages 배포

1. **저장소 설정**:
   - Settings > Pages
   - Source: Deploy from a branch
   - Branch: main (또는 master)

2. **커스텀 도메인** (선택사항):
   - `CNAME` 파일에 도메인 추가
   - DNS 설정 (A 레코드 또는 CNAME)

3. **HTTPS 강제**:
   - Settings > Pages > Enforce HTTPS 체크

### 📊 성능 모니터링

#### Google Search Console 설정
1. [search.google.com/search-console](https://search.google.com/search-console) 접속
2. 속성 추가 (URL 접두어 방식)
3. `_config.yml`의 `google_site_verification` 값 입력
4. 사이트맵 제출: `https://yourdomain.com/sitemap.xml`

#### Google Analytics 설정
- `_config.yml`의 `tracking_id` 확인
- 목표 설정 (페이지 뷰, 체류 시간 등)
- 실시간 리포트로 트래픽 모니터링

#### 페이지 속도 최적화
- [PageSpeed Insights](https://pagespeed.web.dev/) 테스트
- 이미지 압축 및 최적화
- 불필요한 플러그인 제거

---

## 🎯 애드센스 최적화 가이드

### ✅ 승인 체크리스트

#### 필수 페이지 (완료됨)
- ✅ **소개 페이지** (`/about/`)
- ✅ **연락처** (`/contact/`)
- ✅ **개인정보처리방침** (`/privacy/`)
- ✅ **이용약관** (`/terms/`)

#### 콘텐츠 요구사항
- **최소 포스트 수**: 20-30개 (현재: 6개)
- **정기 업데이트**: 주 1-2회
- **고품질 콘텐츠**: 1000자 이상, 독창적 내용
- **사용자 참여**: 댓글, 공유 활성화

#### 기술적 요구사항 (완료됨)
- ✅ **모바일 친화적**: 반응형 디자인
- ✅ **사이트 속도**: 빠른 로딩
- ✅ **네비게이션**: 명확한 사이트 구조
- ✅ **Search Console**: 등록 및 사이트맵 제출

### 📈 승인 후 최적화

#### 광고 배치 최적화
- **Above the fold**: 첫 화면에 1개
- **본문 중간**: 긴 글의 중간 지점
- **글 하단**: 마무리 부분
- **사이드바**: 관련 링크와 함께

#### 수익 최적화
- **키워드 리서치**: 고CPC 키워드 타겟팅
- **계절성 콘텐츠**: 시즌별 검색량 활용
- **롱테일 키워드**: 틈새 주제 발굴

---

## 📚 유용한 참고 자료

### 📖 공식 문서
- [Jekyll 공식 문서](https://jekyllrb.com/docs/)
- [Minimal Mistakes 가이드](https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide/)
- [GitHub Pages 가이드](https://docs.github.com/en/pages)

### 🔧 도구 및 플러그인
- **마크다운 에디터**: Typora, Mark Text
- **이미지 최적화**: TinyPNG, ImageOptim
- **SEO 분석**: Ahrefs, SEMrush
- **키워드 도구**: Google Keyword Planner

### 💡 블로그 운영 팁
- **일관성**: 정기적인 발행 스케줄
- **소통**: 댓글과 피드백에 적극 응답
- **네트워킹**: 다른 개발자들과 교류
- **학습**: 지속적인 기술 학습과 공유

---

## 🤝 기여하기

버그 리포트, 기능 제안, 오타 수정 등 모든 기여를 환영합니다!

1. 이 저장소를 Fork
2. 새 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경 사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

---

## 📧 연락처

- **블로그**: [https://mustarddata.com](https://mustarddata.com)
- **GitHub**: [@LifeIsBelieveful](https://github.com/LifeIsBelieveful)
- **이메일**: [연락처 페이지](/contact/) 참조

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

*⭐ 이 저장소가 도움이 되셨다면 스타를 눌러주세요!*