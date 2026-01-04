/* ==========================================================================
   jQuery plugin settings and other scripts
   ========================================================================== */

$(document).ready(function () {
  // FitVids init
  $("#main").fitVids();

  // Follow menu drop down
  $(".author__urls-wrapper button").on("click", function () {
    $(".author__urls").toggleClass("is--visible");
    $(".author__urls-wrapper").find("button").toggleClass("open");
  });

  // Close search screen with Esc key
  $(document).keyup(function (e) {
    if (e.keyCode === 27) {
      if ($(".initial-content").hasClass("is--hidden")) {
        $(".search-content").toggleClass("is--visible");
        $(".initial-content").toggleClass("is--hidden");
      }
    }
  });

  // Search toggle
  $(".search__toggle").on("click", function () {
    $(".search-content").toggleClass("is--visible");
    $(".initial-content").toggleClass("is--hidden");
    // set focus on input
    setTimeout(function () {
      $(".search-content input").focus();
    }, 400);
  });

  // Dark mode toggle은 head.html에서 처리하므로 여기서는 제거
  // 중복 실행 방지를 위해 주석 처리

  // Smooth scrolling
  var scroll = new SmoothScroll('a[href*="#"]', {
    offset: 20,
    speed: 400,
    speedAsDuration: true,
    durationMax: 500,
  });

  // Gumshoe scroll spy init
  if ($("nav.toc").length > 0) {
    var spy = new Gumshoe("nav.toc a", {
      // Active classes
      navClass: "active", // applied to the nav list item
      contentClass: "active", // applied to the content

      // Nested navigation
      nested: false, // if true, add classes to parents of active link
      nestedClass: "active", // applied to the parent items

      // Offset & reflow
      offset: 20, // how far from the top of the page to activate a content area
      reflow: true, // if true, listen for reflows

      // Event support
      events: true, // if true, emit custom events
    });
  }

  // Auto scroll sticky ToC with content
  const scrollTocToContent = function (event) {
    var target = event.target;
    var scrollOptions = { behavior: "auto", block: "nearest", inline: "start" };

    var tocElement = document.querySelector("aside.sidebar__right.sticky");
    if (!tocElement) return;
    if (window.getComputedStyle(tocElement).position !== "sticky") return;

    if (target.parentElement.classList.contains("toc__menu") && target == target.parentElement.firstElementChild) {
      // Scroll to top instead
      document.querySelector("nav.toc header").scrollIntoView(scrollOptions);
    } else {
      target.scrollIntoView(scrollOptions);
    }
  };

  // Has issues on Firefox, whitelist Chrome for now
  if (!!window.chrome) {
    document.addEventListener("gumshoeActivate", scrollTocToContent);
  }

  // add lightbox class to all image links
  $(
    "a[href$='.jpg'],a[href$='.jpeg'],a[href$='.JPG'],a[href$='.png'],a[href$='.gif'],a[href$='.webp']"
  ).has("> img").addClass("image-popup");

  // Magnific-Popup options
  $(".image-popup").magnificPopup({
    // disableOn: function() {
    //   if( $(window).width() < 500 ) {
    //     return false;
    //   }
    //   return true;
    // },
    type: "image",
    tLoading: "Loading image #%curr%...",
    gallery: {
      enabled: true,
      navigateByImgClick: true,
      preload: [0, 1], // Will preload 0 - before current, and 1 after the current image
    },
    image: {
      tError: '<a href="%url%">Image #%curr%</a> could not be loaded.',
    },
    removalDelay: 500, // Delay in milliseconds before popup is removed
    // Class that is added to body when popup is open.
    // make it unique to apply your CSS animations just to this exact popup
    mainClass: "mfp-zoom-in",
    callbacks: {
      beforeOpen: function () {
        // just a hack that adds mfp-anim class to markup
        this.st.image.markup = this.st.image.markup.replace(
          "mfp-figure",
          "mfp-figure mfp-with-anim"
        );
      },
    },
    closeOnContentClick: true,
    midClick: true, // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
  });

  // Remove any existing header-link and header-clipboard-button elements
  document.querySelectorAll('.header-link, .header-clipboard-button').forEach(function(element) {
    element.remove();
  });

  // Permalink copy functionality for archive pages
  document.querySelectorAll('a[rel="permalink"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      // Ctrl/Cmd + Click은 기본 동작 유지 (새 탭에서 열기)
      if (e.ctrlKey || e.metaKey) {
        return;
      }
      
      e.preventDefault();
      e.stopPropagation();
      
      var url = this.href;
      // relative URL을 absolute URL로 변환
      if (url.startsWith('/')) {
        url = window.location.origin + url;
      }
      
      copyUrlToClipboard(url, link);
    });
  });

  // Permalink copy functionality for page title
  var pageTitle = document.querySelector('h1.page__title');
  if (pageTitle) {
    var titleLink = pageTitle.querySelector('a');
    if (titleLink) {
      // 페이지 제목 옆에 복사 버튼 추가
      var copyButton = document.createElement('button');
      copyButton.className = 'page-title-copy-button';
      copyButton.title = 'Copy page URL to clipboard';
      copyButton.innerHTML = '<span class="sr-only">Copy link</span><i class="far fa-copy"></i>';
      copyButton.style.cssText = 'margin-left: 0.5em; background: none; border: none; color: inherit; cursor: pointer; opacity: 0.6; font-size: 0.8em; vertical-align: middle;';
      copyButton.addEventListener('mouseenter', function() {
        this.style.opacity = '1';
      });
      copyButton.addEventListener('mouseleave', function() {
        this.style.opacity = '0.6';
      });
      copyButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var url = titleLink.href;
        if (url.startsWith('/')) {
          url = window.location.origin + url;
        }
        copyUrlToClipboard(url, copyButton);
      });
      pageTitle.appendChild(copyButton);
    }
  }

  // URL 복사 헬퍼 함수
  function copyUrlToClipboard(url, element) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function() {
        showCopyFeedback(element);
      }).catch(function(err) {
        console.error('Failed to copy URL:', err);
      });
    } else {
      // Fallback for older browsers
      var textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        showCopyFeedback(element);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      document.body.removeChild(textarea);
    }
  }

  // 복사 완료 피드백 표시
  function showCopyFeedback(element) {
    var icon = element.querySelector('i');
    if (icon) {
      var originalIconClass = icon.className;
      icon.className = 'fas fa-check';
      element.title = 'Copied!';
      if (element.style) {
        element.style.color = '#4caf50';
      }
      setTimeout(function() {
        icon.className = originalIconClass;
        element.title = element.getAttribute('data-original-title') || 'Copy link';
        if (element.style) {
          element.style.color = '';
        }
      }, 1500);
    } else {
      // 아이콘이 없는 경우 (텍스트 링크)
      var originalText = element.textContent;
      element.textContent = 'Copied!';
      if (element.style) {
        element.style.color = '#4caf50';
      }
      setTimeout(function() {
        element.textContent = originalText;
        if (element.style) {
          element.style.color = '';
        }
      }, 1500);
    }
  }

  // Add copy button for <pre> blocks
  var copyText = function (text) {
    if (document.queryCommandEnabled("copy") && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => true,
        () => console.error("Failed to copy text to clipboard: " + text)
      );
      return true;
    } else {
      var isRTL = document.documentElement.getAttribute("dir") === "rtl";

      var textarea = document.createElement("textarea");
      textarea.className = "clipboard-helper";
      textarea.style[isRTL ? "right" : "left"] = "-9999px";
      // Move element to the same position vertically
      var yPosition = window.pageYOffset || document.documentElement.scrollTop;
      textarea.style.top = yPosition + "px";

      textarea.setAttribute("readonly", "");
      textarea.value = text;
      if (document.body) {
        document.body.appendChild(textarea);
      } else {
        return false;
      }

      var success = true;
      try {
        textarea.select();
        success = document.execCommand("copy");
      } catch (e) {
        success = false;
      }
      textarea.parentNode.removeChild(textarea);
      return success;
    }
  };

  var copyButtonEventListener = function (event) {
    var thisButton = event.target;

    // Locate the <code> element
    var codeBlock = thisButton.nextElementSibling;
    while (codeBlock && codeBlock.tagName.toLowerCase() !== "code") {
      codeBlock = codeBlock.nextElementSibling;
    }
    if (!codeBlock) {
      // No <code> found - wtf?
      console.warn(thisButton);
      throw new Error("No code block found for this button.");
    }

    // Skip line numbers if present (i.e. {% highlight lineno %})
    var realCodeBlock = codeBlock.querySelector("td.code, td.rouge-code");
    if (realCodeBlock) {
      codeBlock = realCodeBlock;
    }
    var result = copyText(codeBlock.innerText);
    // Restore the focus to the button
    thisButton.focus();
    if (result) {
      if (thisButton.interval !== null) {
        clearInterval(thisButton.interval);
      }
      thisButton.classList.add('copied');
      thisButton.interval = setTimeout(function () {
        thisButton.classList.remove('copied');
        clearInterval(thisButton.interval);
        thisButton.interval = null;
      }, 1500);
    }
    return result;
  };

  if (window.enable_copy_code_button) {
    var pageContent = document.querySelector(".page__content");
    if (pageContent) {
      pageContent
        .querySelectorAll("pre.highlight > code")
        .forEach(function (element, index, parentList) {
        // Locate the <pre> element
        var container = element.parentElement;
        // Sanity check - don't add an extra button if there's already one
        if (!container || !container.firstElementChild || container.firstElementChild.tagName.toLowerCase() !== "code") {
          return;
        }
        var copyButton = document.createElement("button");
        copyButton.title = "Copy to clipboard";
        copyButton.className = "clipboard-copy-button";
        copyButton.innerHTML = '<span class="sr-only">Copy code</span><i class="far fa-fw fa-copy"></i><i class="fas fa-fw fa-check copied"></i>';
        copyButton.addEventListener("click", copyButtonEventListener);
        container.prepend(copyButton);
      });
    }
  }
});
