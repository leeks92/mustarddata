/* ==========================================================================
   Dark Mode Toggle
   ========================================================================== */

(function() {
  'use strict';

  // 아이콘 업데이트
  function updateIcon(isDark) {
    const icon = document.getElementById('dark-mode-icon');
    if (icon) {
      if (isDark) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      }
    }
  }

  // 다크모드 상태 확인 및 적용
  function initDarkMode() {
    const darkMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // localStorage에 값이 없으면 시스템 설정 확인
    if (darkMode === null) {
      if (prefersDark) {
        document.body.classList.add('dark-mode');
        updateIcon(true);
      } else {
        document.body.classList.remove('dark-mode');
        updateIcon(false);
      }
    } else if (darkMode === 'true') {
      document.body.classList.add('dark-mode');
      updateIcon(true);
    } else {
      document.body.classList.remove('dark-mode');
      updateIcon(false);
    }
  }

  // 다크모드 토글
  function toggleDarkMode() {
    const isDark = document.body.classList.contains('dark-mode');
    
    if (isDark) {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
      updateIcon(false);
    } else {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
      updateIcon(true);
    }
  }

  // 초기화 함수
  function init() {
    // 다크모드 상태 초기화
    initDarkMode();
    
    // 버튼 클릭 이벤트 등록
    const toggleButton = document.querySelector('.dark-mode__toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', toggleDarkMode);
    }

    // 시스템 테마 변경 감지
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      // addEventListener 대신 addListener 사용 (더 넓은 브라우저 호환성)
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', function(e) {
          // localStorage에 사용자 설정이 없을 때만 시스템 설정 따름
          if (localStorage.getItem('darkMode') === null) {
            if (e.matches) {
              document.body.classList.add('dark-mode');
              updateIcon(true);
            } else {
              document.body.classList.remove('dark-mode');
              updateIcon(false);
            }
          }
        });
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(function(e) {
          if (localStorage.getItem('darkMode') === null) {
            if (e.matches) {
              document.body.classList.add('dark-mode');
              updateIcon(true);
            } else {
              document.body.classList.remove('dark-mode');
              updateIcon(false);
            }
          }
        });
      }
    }
  }

  // DOM이 준비되면 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM이 이미 로드된 경우 즉시 실행
    init();
  }
})();

