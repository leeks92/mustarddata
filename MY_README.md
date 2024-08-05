---
sitemap: false
---

# handy

1. github desktop -> sourcetree로 대체
2. visual studio
3. 마크다운 에디터인 typora는 현재 유료

# Step 1. 테마 선택 후 기본 세팅

마음에 드는 테마 선택

- https://github.com/topics/jekyll-theme
- https://mmistakes.github.io/minimal-mistakes/
- https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide/
  - minimal-mistakes로 진행
- repository fork
- repository명을 github ID.github.io로 수정(https://lifeisbelieveful.github.io/)
- \_config.yaml 파일 내 url을 repository와 동일한 명으로 변경

# Step2. 포스팅

마크다운 형식으로 포스팅을 작성하고 커밋하면 블로그에 포스팅이 발행된다.

## 이미지 삽입하기

이미지 복사(gif는 이미지 주소 복사) 한 다음 github repo에서 이슈 생성 화면에 붙여넣기 하고 생성되는 코드를 그대로 사용

- {: .align-center}을 뒤에 붙여주면 가운데 정렬
- {: .align-left}을 뒤에 붙여주면 왼쪽 정렬
- {: .align-right}을 뒤에 붙여주면 오른쪽 정렬
- {: width="30px", height="100px"} 이미지 크기 직접 지정
- {: width="50%", height="50%"} 이미지 크기 비율

### 참고

https://ansohxxn.github.io/blog/insert-image/
<br>https://ansohxxn.github.io/blog/image/

# Step3. 실시간 업데이트

1. Ruby 설치(https://www.ruby-lang.org/en/downloads/)
   1. `brew install ruby`
2. jekyll 설치
   1. `gem install jekyll`
3. bundler 설치
   1. `gem install bundler`
4. repository 폴더로 이동해서 환경 설치
   1. `bundle install`
5. 서버 기동
   1. `bundle exec jekyll serve`
   2. webrick 관련 오류 발생시
      <br> `bundle add webrick`
   3. package.json 오류 발생시
      <br> Gemfile을 공식문서에서 가이드하는 내용으로 복사해서 넣어두기

# Step4. 블로그 설정 변경하기

1. \_config.yml 파일에서 각종 설정 변경 가능(설정에 대해서는 https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide/ 참고)

# Step5. 댓글 기능 추가하기

1. https://disqus.com/ 사용(로그인 필요)
2. 프로필 설정하고 무료 플랜 -> jekyll 테마 선택
3. configure에서 블로그 주소(https://github 주소)

## 참고

- https://jekyllrb.com/docs/posts/
- https://teddylee777.github.io/jekyll/Jekyll-%EC%82%AC%EC%9A%A9%EC%9D%84-%EC%9C%84%ED%95%9C-markdown-%EB%AC%B8%EB%B2%95/
