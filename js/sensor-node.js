(function () {
  var section = document.querySelector('.sejuka-sensor-section');
  if (!section) return;

  if (!('IntersectionObserver' in window)) {
    section.classList.add('sejuka-sensor-visible');
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        section.classList.add('sejuka-sensor-visible');
        observer.unobserve(section);
      }
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -60px 0px' });

  observer.observe(section);
})();