(function () {
  window.SEJUKA = window.SEJUKA || {};

  var ROUTES = {
    fastest: {
      name: 'Rute Tercepat', time: 12, exposure: 'Tinggi', shade: '18%',
      distance: '1.4 km', temp: 34.7,
      path: 'M60,420 L220,420 L220,260 L420,260 L420,120 L620,120',
      color: '#E29143'
    },
    coolest: {
      name: 'Rute Tersejuk', time: 15, exposure: 'Rendah', shade: '64%',
      distance: '1.7 km', temp: 31.9,
      path: 'M60,420 L60,300 L180,300 L180,180 L340,180 L340,80 L620,80 L620,120',
      color: '#B7DE8E'
    }
  };

  var currentFromLabel = 'Sekolah';
  var currentToLabel = 'Taman Kota';

  function sejukaEscapeXML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildSVG(fromLabel, toLabel) {
    var fromText = sejukaEscapeXML(fromLabel || currentFromLabel);
    var toText = sejukaEscapeXML(toLabel || currentToLabel);
    return '<svg viewBox="0 0 680 500" xmlns="http://www.w3.org/2000/svg" aria-label="Peta rute sejuk simulasi">' +
      '<rect x="0" y="0" width="680" height="500" fill="#111613"/>' +
      gridLines() +
      '<circle cx="60" cy="420" r="7" fill="#B7DE8E"/><text x="74" y="424" fill="#F3F1EA" font-size="13" font-family="IBM Plex Mono">' + fromText + '</text>' +
      '<circle cx="620" cy="120" r="7" fill="#E8C25B"/><text x="606" y="104" text-anchor="end" fill="#F3F1EA" font-size="13" font-family="IBM Plex Mono">' + toText + '</text>' +
      '<path id="path-fastest" class="route-path" d="' + ROUTES.fastest.path + '" stroke="' + ROUTES.fastest.color + '"/>' +
      '<path id="path-coolest" class="route-path" d="' + ROUTES.coolest.path + '" stroke="' + ROUTES.coolest.color + '"/>' +
      '</svg>';
  }

  function renderSejukaRouteMap(root, fromVal, toVal) {
    currentFromLabel = fromVal || currentFromLabel;
    currentToLabel = toVal || currentToLabel;
    var stage = root.querySelector('.route-stage');
    if (stage) stage.innerHTML = buildSVG(currentFromLabel, currentToLabel);
  }

  function gridLines() {
    var out = '';
    for (var x = 40; x < 680; x += 60) out += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="500" stroke="rgba(255,255,255,0.04)"/>';
    for (var y = 40; y < 500; y += 60) out += '<line x1="0" y1="' + y + '" x2="680" y2="' + y + '" stroke="rgba(255,255,255,0.04)"/>';
    return out;
  }

  function selectRoute(root, key) {
    root.querySelectorAll('.route-option').forEach(function (opt) {
      opt.classList.toggle('is-selected', opt.getAttribute('data-route') === key);
    });
    var r = ROUTES[key];

    var fastestPath = root.querySelector('#path-fastest');
    var coolestPath = root.querySelector('#path-coolest');
    [fastestPath, coolestPath].forEach(function (p) { if (p) p.classList.remove('is-active', 'is-inactive'); });
    var activePath = root.querySelector('#path-' + key);
    var inactivePath = key === 'fastest' ? coolestPath : fastestPath;

    if (typeof gsap !== 'undefined' && activePath) {
      gsap.set(activePath, { opacity: 1 });
      gsap.fromTo(activePath, { strokeDashoffset: 1400 }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.out' });
      if (inactivePath) gsap.to(inactivePath, { opacity: 0.15, duration: 0.4 });
    } else {
      if (activePath) activePath.classList.add('is-active');
      if (inactivePath) inactivePath.classList.add('is-inactive');
    }

    var timeEl = root.querySelector('[data-route-time]');
    var expEl = root.querySelector('[data-route-exposure]');
    var shadeEl = root.querySelector('[data-route-shade]');
    var distEl = root.querySelector('[data-route-distance]');
    if (timeEl) timeEl.textContent = r.time + ' menit';
    if (expEl) expEl.textContent = r.exposure;
    if (shadeEl) shadeEl.textContent = r.shade;
    if (distEl) distEl.textContent = r.distance;
  }

  function updateSejukaTempLabels(root) {
    var f = root.querySelector('[data-sejuka-route-temp="fastest"]');
    var c = root.querySelector('[data-sejuka-route-temp="coolest"]');
    if (f) f.textContent = ROUTES.fastest.temp.toFixed(1) + '\u00B0C';
    if (c) c.textContent = ROUTES.coolest.temp.toFixed(1) + '\u00B0C';
  }

  function updateSejukaReduction(root) {
    var fastest = ROUTES.fastest.temp;
    var coolest = ROUTES.coolest.temp;
    var pct = ((fastest - coolest) / fastest) * 100;
    if (pct < 0) pct = 0;
    var valueEl = root.querySelector('[data-sejuka-route-reduction]');
    var fillEl = root.querySelector('[data-sejuka-route-reduction-fill]');
    if (valueEl) valueEl.textContent = '-' + pct.toFixed(1) + '%';
    if (fillEl) {
      var fillWidth = Math.min(100, Math.max(6, pct * 4));
      setTimeout(function () { fillEl.style.width = fillWidth + '%'; }, 120);
    }
  }

  function sejukaHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 997;
    return h;
  }

  function sejukaSimulateRoute(root, fromVal, toVal) {
    var seed = sejukaHash((fromVal || '') + '|' + (toVal || ''));
    var baseFastest = 33.5 + (seed % 40) / 10;
    var baseCoolest = baseFastest - (2.0 + (seed % 17) / 10);
    ROUTES.fastest.temp = Math.round(baseFastest * 10) / 10;
    ROUTES.coolest.temp = Math.round(baseCoolest * 10) / 10;

    var distFastest = 1.2 + (seed % 13) / 10;
    var distCoolest = distFastest + 0.2 + (seed % 9) / 10;
    ROUTES.fastest.distance = distFastest.toFixed(1) + ' km';
    ROUTES.coolest.distance = distCoolest.toFixed(1) + ' km';
    ROUTES.fastest.time = Math.round(distFastest * 14);
    ROUTES.coolest.time = Math.round(distCoolest * 14) + 2;

    [['fastest', ROUTES.fastest], ['coolest', ROUTES.coolest]].forEach(function (pair) {
      var el = root.querySelector('.route-option[data-route="' + pair[0] + '"]');
      if (!el) return;
      var timeEl = el.querySelector('.r-time');
      if (timeEl) timeEl.textContent = pair[1].time + ' menit';
      var rows = el.querySelectorAll('.stat-row span:last-child');
      if (rows[2]) rows[2].textContent = pair[1].distance;
    });

    updateSejukaTempLabels(root);
    updateSejukaReduction(root);
  }

  function initSejukaRouteFinder(root) {
    var form = root.querySelector('[data-sejuka-route-form]');
    updateSejukaTempLabels(root);
    updateSejukaReduction(root);
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fromInput = root.querySelector('[data-sejuka-route-from]');
      var toInput = root.querySelector('[data-sejuka-route-to]');
      var fromVal = fromInput ? fromInput.value.trim() : '';
      var toVal = toInput ? toInput.value.trim() : '';
      if (!fromVal || !toVal) return;
      var riValues = root.querySelectorAll('.ri-value');
      if (riValues[0]) riValues[0].textContent = fromVal;
      if (riValues[1]) riValues[1].textContent = toVal;
      sejukaSimulateRoute(root, fromVal, toVal);
      renderSejukaRouteMap(root, fromVal, toVal);
      var current = root.querySelector('.route-option.is-selected');
      selectRoute(root, current ? current.getAttribute('data-route') : 'coolest');
    });
  }

  window.SEJUKA.initCoolRoute = function () {
    var roots = document.querySelectorAll('[data-route-root]');
    if (roots.length === 0) return;
    roots.forEach(function (root) {
      var stage = root.querySelector('.route-stage');
      if (stage) stage.insertAdjacentHTML('afterbegin', buildSVG());

      root.querySelectorAll('.route-option').forEach(function (opt) {
        opt.addEventListener('click', function () {
          selectRoute(root, opt.getAttribute('data-route'));
        });
      });

      var swap = root.querySelector('[data-route-swap]');
      if (swap) {
        swap.addEventListener('click', function () {
          swap.style.transform = swap.style.transform === 'translateY(-50%) rotate(180deg)' ? 'translateY(-50%)' : 'translateY(-50%) rotate(180deg)';
        });
      }

      setTimeout(function () { selectRoute(root, 'coolest'); }, 500);
      initSejukaRouteFinder(root);
    });
  };
})();
