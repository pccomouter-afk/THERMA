(function () {
  window.SEJUKA = window.SEJUKA || {};

  var BASE_HEAT = 84;
  var DEFAULTS = { trees: 14, green: 8, shade: 21, reflective: 0, water: 0 };

  function computeHeat(v) {
    var reduction =
      (v.trees - DEFAULTS.trees) * 0.34 +
      (v.green - DEFAULTS.green) * 0.3 +
      (v.shade - DEFAULTS.shade) * 0.26 +
      v.reflective * 0.22 +
      v.water * 1.15;
    var simulated = BASE_HEAT - reduction;
    if (simulated < 22) simulated = 22;
    if (simulated > BASE_HEAT) simulated = BASE_HEAT;
    return simulated;
  }

  function animateValue(el, from, to, decimals, suffix) {
    var duration = 500;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var val = from + (to - from) * p;
      el.textContent = (decimals ? val.toFixed(decimals) : Math.round(val)) + (suffix || '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  window.SEJUKA.initSimulator = function () {
    var roots = document.querySelectorAll('[data-sim-root]');
    if (roots.length === 0) return;

    roots.forEach(function (root) {
      var sliders = root.querySelectorAll('[data-sim-slider]');
      var values = {
        trees: DEFAULTS.trees, green: DEFAULTS.green, shade: DEFAULTS.shade,
        reflective: DEFAULTS.reflective, water: DEFAULTS.water
      };
      var currentSimHeat = BASE_HEAT;

      var currentEl = root.querySelector('[data-sim-current]');
      var simulatedEl = root.querySelector('[data-sim-simulated]');
      var improvementEl = root.querySelector('[data-sim-improvement]');
      var barFill = root.querySelector('[data-sim-bar]');

      function update() {
        var key = null;
        var newHeat = computeHeat(values);
        var improvement = ((BASE_HEAT - newHeat) / BASE_HEAT) * 100;

        if (simulatedEl) animateValue(simulatedEl, currentSimHeat, newHeat, 0, '');
        if (improvementEl) improvementEl.textContent = '-' + improvement.toFixed(1) + '%';
        if (barFill) barFill.style.width = (100 - improvement) + '%';
        currentSimHeat = newHeat;
      }

      if (currentEl) currentEl.textContent = BASE_HEAT;

      sliders.forEach(function (slider) {
        var key = slider.getAttribute('data-sim-slider');
        var display = root.querySelector('[data-sim-display="' + key + '"]');
        slider.value = values[key];
        if (display) display.textContent = values[key] + (key === 'water' ? '' : '%');

        slider.addEventListener('input', function () {
          values[key] = parseFloat(slider.value);
          if (display) display.textContent = values[key] + (key === 'water' ? '' : '%');
          update();
        });
      });

      var resetBtn = root.querySelector('[data-sim-reset]');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          sliders.forEach(function (slider) {
            var key = slider.getAttribute('data-sim-slider');
            values[key] = DEFAULTS[key];
            slider.value = DEFAULTS[key];
            var display = root.querySelector('[data-sim-display="' + key + '"]');
            if (display) display.textContent = DEFAULTS[key] + (key === 'water' ? '' : '%');
          });
          update();
        });
      }

      update();
    });
  };
})();
