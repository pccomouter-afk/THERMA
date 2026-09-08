(function () {
  window.THERMA = window.THERMA || {};

  function initReveal() {
    var targets = document.querySelectorAll(".reveal, .reveal-stagger");
    if (!("IntersectionObserver" in window) || targets.length === 0) {
      targets.forEach(function (t) { t.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -60px 0px" });
    targets.forEach(function (t) { observer.observe(t); });
  }

  function initHeroEntrance() {
    if (typeof gsap === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var items = document.querySelectorAll(".hero-content h1, .hero-content .lede, .hero-content .hero-cta, .hero-live");
    if (!items.length) return;
    gsap.set(items, { opacity: 0, y: 26 });
    gsap.to(items, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out", delay: 0.15 });
  }

  function initPreloader() {
    var pre = document.getElementById("preloader");
    if (!pre) return;
    window.addEventListener("load", function () {
      setTimeout(function () { pre.classList.add("is-hidden"); }, 380);
    });
    setTimeout(function () { pre.classList.add("is-hidden"); }, 1800);
  }

  window.THERMA.initAnimations = function () {
    initReveal();
    initHeroEntrance();
  };

  initPreloader();
})();
