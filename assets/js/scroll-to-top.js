/* ==========================================================================
   Scroll to Top Button
   ========================================================================== */

(function() {
  'use strict';

  var scrollToTopButton = document.getElementById('scroll-to-top');
  if (!scrollToTopButton) return;

  // Show/hide button based on scroll position
  function toggleScrollButton() {
    if (window.pageYOffset > 300) {
      scrollToTopButton.classList.add('is-visible');
    } else {
      scrollToTopButton.classList.remove('is-visible');
    }
  }

  // Scroll to top function
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Event listeners
  window.addEventListener('scroll', toggleScrollButton, { passive: true });
  scrollToTopButton.addEventListener('click', scrollToTop);

  // Initial check
  toggleScrollButton();
})();

