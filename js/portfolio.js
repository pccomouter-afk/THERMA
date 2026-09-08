(function () {
  window.SEJUKA = window.SEJUKA || {};

  window.SEJUKA.initPortfolio = function () {
    var grid = document.querySelector('[data-portfolio-grid]');
    if (!grid) return;
    var filters = document.querySelectorAll('[data-portfolio-filter]');
    if (!filters.length) return;

    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filters.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var cat = btn.getAttribute('data-portfolio-filter');
        grid.querySelectorAll('.project-card').forEach(function (card) {
          var match = cat === 'all' || card.getAttribute('data-category') === cat;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  };
})();
