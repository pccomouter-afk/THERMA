(function () {
  document.addEventListener('DOMContentLoaded', function () {
    window.SEJUKA.loadComponents().then(function () {
      if (window.SEJUKA.initAnimations) window.SEJUKA.initAnimations();
      if (window.SEJUKA.initHeatmap) window.SEJUKA.initHeatmap();
      if (window.SEJUKA.initDataFlow) window.SEJUKA.initDataFlow();
      if (window.SEJUKA.initCoolRoute) window.SEJUKA.initCoolRoute();
      if (window.SEJUKA.initSimulator) window.SEJUKA.initSimulator();
      if (window.SEJUKA.initCommunity) window.SEJUKA.initCommunity();
      if (window.SEJUKA.initForum) window.SEJUKA.initForum();
      if (window.SEJUKA.initPortfolio) window.SEJUKA.initPortfolio();
    });

    document.querySelectorAll('[data-modal-close]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var layer = btn.closest('.modal-layer');
        if (layer) {
          layer.classList.remove('is-open');
          document.body.classList.remove('no-scroll');
        }
      });
    });

    document.querySelectorAll('.modal-backdrop').forEach(function (bg) {
      bg.addEventListener('click', function () {
        var layer = bg.closest('.modal-layer');
        if (layer) {
          layer.classList.remove('is-open');
          document.body.classList.remove('no-scroll');
        }
      });
    });
  });
})();
