(function () {
  window.SEJUKA = window.SEJUKA || {};

  function initPreloader() {
    var pre = document.getElementById('preloader');
    if (!pre) return;
    window.addEventListener('load', function () {
      setTimeout(function () { pre.classList.add('is-hidden'); }, 380);
    });
    setTimeout(function () { pre.classList.add('is-hidden'); }, 1800);
  }

  function initReveal() {
    var targets = document.querySelectorAll('.reveal, .reveal-stagger');
    if (!('IntersectionObserver' in window) || targets.length === 0) {
      targets.forEach(function (t) { t.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -60px 0px' });
    targets.forEach(function (t) { observer.observe(t); });
  }

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals'), 10) : 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.textContent = (decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString('en-US')) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;
    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { observer.observe(c); });
  }

  function initHeroEntrance() {
    if (typeof gsap === 'undefined') return;
    gsap.set('.hero-content .eyebrow, .hero-content h1, .hero-content .lede, .hero-content .hero-cta, .hero-metrics', { opacity: 0, y: 26 });
    gsap.to('.hero-content .eyebrow', { opacity: 1, y: 0, duration: 0.7, delay: 0.15, ease: 'power3.out' });
    gsap.to('.hero-content h1', { opacity: 1, y: 0, duration: 0.9, delay: 0.28, ease: 'power3.out' });
    gsap.to('.hero-content .lede', { opacity: 1, y: 0, duration: 0.8, delay: 0.44, ease: 'power3.out' });
    gsap.to('.hero-content .hero-cta', { opacity: 1, y: 0, duration: 0.8, delay: 0.56, ease: 'power3.out' });
    gsap.to('.hero-metrics', { opacity: 1, y: 0, duration: 0.8, delay: 0.68, ease: 'power3.out' });
  }

  window.SEJUKA.initAnimations = function () {
    initReveal();
    initCounters();
    initHeroEntrance();
  };

  initPreloader();
})();
