(function () {
  window.SEJUKA = window.SEJUKA || {};

  var LEVEL_COLOR = {
    cool: '#4F7B5C',
    moderate: '#B7DE8E',
    warm: '#E8C25B',
    hot: '#E29143',
    critical: '#D65D45'
  };

  var ZONES = [
    {
      id: 'central', name: 'Central District', level: 'critical', cx: 400, cy: 250, r: 78,
      heatIndex: 84, surfaceTemp: 39.4, tree: 14, shade: 21, cooling: 3, reports: 18,
      humidity: 41, pm25: 34, light: 6200,
      causes: ['Tutupan pohon rendah di sepanjang jalan utama', 'Kepadatan permukaan beton tinggi', 'Ketersediaan keteduhan sangat terbatas'],
      actions: ['Tingkatkan kanopi pohon di koridor pejalan kaki', 'Tambahkan area tunggu teduh dekat halte transit', 'Terapkan material perkerasan reflektif']
    },
    {
      id: 'north', name: 'North Avenue', level: 'hot', cx: 232, cy: 148, r: 62,
      heatIndex: 71, surfaceTemp: 36.8, tree: 19, shade: 28, cooling: 2, reports: 11,
      humidity: 46, pm25: 27, light: 5400,
      causes: ['Jalan lebar tanpa keteduhan', 'Bangunan lama dengan atap gelap', 'Penghijauan tepi jalan minim'],
      actions: ['Tanam pohon berkanopi cepat tumbuh', 'Cat ulang atap dengan lapisan reflektif', 'Tambahkan jalur pejalan kaki teduh memanjang']
    },
    {
      id: 'riverside', name: 'Riverside Community', level: 'moderate', cx: 566, cy: 172, r: 56,
      heatIndex: 52, surfaceTemp: 33.1, tree: 34, shade: 44, cooling: 4, reports: 6,
      humidity: 54, pm25: 18, light: 4100,
      causes: ['Keteduhan tepi sungai berkurang musiman', 'Ruang publik beraspal cukup luas'],
      actions: ['Perluas deretan pohon di tepi sungai', 'Tambahkan tempat duduk teduh dekat air']
    },
    {
      id: 'green-park', name: 'Green Park', level: 'cool', cx: 176, cy: 404, r: 66,
      heatIndex: 29, surfaceTemp: 29.2, tree: 62, shade: 71, cooling: 5, reports: 2,
      humidity: 63, pm25: 9, light: 2800,
      causes: ['Pohon dewasa tersebar merata', 'Perkerasan keras minim'],
      actions: ['Jaga kesehatan kanopi pohon', 'Jadikan contoh untuk distrik sekitarnya']
    },
    {
      id: 'east-industrial', name: 'East Industrial Belt', level: 'critical', cx: 606, cy: 418, r: 74,
      heatIndex: 88, surfaceTemp: 40.6, tree: 8, shade: 12, cooling: 1, reports: 24,
      humidity: 37, pm25: 42, light: 6700,
      causes: ['Area beton dan aspal yang luas', 'Hampir tidak ada tutupan vegetasi', 'Atap industri yang menyimpan panas'],
      actions: ['Terapkan zona penyangga hijau di sekitar fasilitas', 'Pasang titik istirahat teduh untuk pekerja', 'Wajibkan atap reflektif untuk bangunan baru']
    }
  ];

  var STATUS_LABEL = {
    cool: 'Nyaman',
    moderate: 'Sedang',
    warm: 'Sedang',
    hot: 'Panas',
    critical: 'Panas'
  };

  var LEVEL_LABEL = {
    cool: 'Sejuk',
    moderate: 'Sedang',
    warm: 'Hangat',
    hot: 'Panas',
    critical: 'Kritis'
  };

  var HEAT_INTERPRETATION = {
    cool: 'Kondisi nyaman. Tutupan pohon dan keteduhan di area ini bekerja baik menjaga suhu tetap rendah sepanjang hari.',
    moderate: 'Suhu masih terkendali, tapi paparan panas bisa naik cukup terasa saat siang tanpa keteduhan tambahan.',
    warm: 'Area ini mulai terasa panas pada jam-jam tertentu. Menambah keteduhan dapat menjaga kenyamanan lebih lama.',
    hot: 'Area ini secara konsisten panas pada jam sibuk. Tutupan pohon yang rendah dan permukaan beton mempercepat penyerapan panas.',
    critical: 'Ini adalah hotspot. Kombinasi tutupan pohon rendah dan permukaan keras yang luas membuat area ini jauh lebih panas dari rata-rata kota.'
  };

  var currentPeriod = '24h';
  var currentSelectedZone = null;

  var PERIOD_CONFIG = {
    '24h': { points: 24 },
    '7d': { points: 7 },
    '30d': { points: 30 }
  };

  function seededRandom(seedStr) {
    var seed = 0;
    for (var i = 0; i < seedStr.length; i++) { seed = (seed * 31 + seedStr.charCodeAt(i)) | 0; }
    return function () {
      seed = (seed * 1664525 + 1013904223) | 0;
      return ((seed >>> 0) / 4294967296);
    };
  }

  function buildSeries(zone, period) {
    var cfg = PERIOD_CONFIG[period];
    var rand = seededRandom(zone.id + '-' + period);
    var base = zone.surfaceTemp;
    var values = [];
    var labels = [];
    var i, v;
    if (period === '24h') {
      for (i = 0; i < cfg.points; i++) {
        var peakOffset = Math.cos(((i - 14) / 24) * Math.PI * 2);
        v = base - 4.2 + peakOffset * 4.2 + (rand() - 0.5) * 1.1;
        values.push(Math.max(20, Math.round(v * 10) / 10));
        labels.push((i < 10 ? '0' : '') + i + ':00');
      }
    } else {
      var dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
      for (i = 0; i < cfg.points; i++) {
        var dayVar = Math.sin((i / cfg.points) * Math.PI * 2) * 1.4;
        v = base - 1.6 + dayVar + (rand() - 0.5) * 2.2;
        values.push(Math.max(20, Math.round(v * 10) / 10));
        labels.push(period === '7d' ? dayNames[i % 7] : 'H-' + (cfg.points - i));
      }
    }
    var sum = 0;
    for (i = 0; i < values.length; i++) sum += values[i];
    var avg = sum / values.length;
    var peak = Math.max.apply(null, values);
    var peakIdx = values.indexOf(peak);
    return { values: values, labels: labels, avg: avg, peak: peak, peakLabel: labels[peakIdx] };
  }

  function buildTrendSVG(series) {
    var w = 640, h = 180, padL = 8, padR = 8, padT = 16, padB = 24;
    var values = series.values;
    var min = Math.min.apply(null, values) - 1;
    var max = Math.max.apply(null, values) + 1;
    var stepX = (w - padL - padR) / (values.length - 1);
    function xAt(i) { return padL + i * stepX; }
    function yAt(v) { return padT + (1 - (v - min) / (max - min)) * (h - padT - padB); }
    var pts = values.map(function (v, i) { return xAt(i).toFixed(1) + ',' + yAt(v).toFixed(1); }).join(' ');
    var areaPts = pts + ' ' + xAt(values.length - 1).toFixed(1) + ',' + (h - padB) + ' ' + xAt(0).toFixed(1) + ',' + (h - padB);
    var labelStep = Math.ceil(values.length / 6);
    var labelEls = series.labels.map(function (l, i) {
      if (i % labelStep !== 0) return '';
      return '<text x="' + xAt(i).toFixed(1) + '" y="' + (h - 6) + '" font-size="9" fill="var(--text-2)" text-anchor="middle">' + l + '</text>';
    }).join('');
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" class="trend-svg" aria-label="Grafik tren suhu">' +
      '<defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#B7DE8E" stop-opacity="0.5"/><stop offset="100%" stop-color="#B7DE8E" stop-opacity="0"/></linearGradient></defs>' +
      '<polygon points="' + areaPts + '" fill="url(#trendFill)"/>' +
      '<polyline points="' + pts + '" fill="none" stroke="#B7DE8E" stroke-width="2"/>' +
      labelEls +
      '</svg>';
  }

  function renderHeatAnalysis(zone) {
    var root = document.querySelector('[data-heat-analysis]');
    if (!root) return;
    var zoneEls = root.querySelectorAll('[data-ha-zone]');
    zoneEls.forEach(function (el) { el.textContent = zone.name; });
    var tempEl = root.querySelector('[data-ha-temp]');
    if (tempEl) tempEl.innerHTML = zone.surfaceTemp.toFixed(1) + '&deg;C';
    var statusEl = root.querySelector('[data-ha-status]');
    if (statusEl) statusEl.textContent = STATUS_LABEL[zone.level] || 'Sedang';
    var levelEl = root.querySelector('[data-ha-level]');
    if (levelEl) levelEl.textContent = LEVEL_LABEL[zone.level] || 'Sedang';
    var humEl = root.querySelector('[data-ha-humidity]');
    if (humEl) humEl.textContent = zone.humidity + '%';
    var pmEl = root.querySelector('[data-ha-pm25]');
    if (pmEl) pmEl.innerHTML = zone.pm25 + ' &micro;g/m&sup3;';
    var lightEl = root.querySelector('[data-ha-light]');
    if (lightEl) lightEl.textContent = zone.light.toLocaleString('id-ID') + ' lux';
    var noteEl = root.querySelector('[data-ha-note]');
    if (noteEl) noteEl.textContent = HEAT_INTERPRETATION[zone.level] || '';
  }

  function renderHistoricalTrend(zone, period) {
    var root = document.querySelector('[data-trend-root]');
    if (!root) return;
    var series = buildSeries(zone, period);
    var chartWrap = root.querySelector('[data-trend-chart]');
    if (chartWrap) chartWrap.innerHTML = buildTrendSVG(series);
    var zoneEls = root.querySelectorAll('[data-trend-zone]');
    zoneEls.forEach(function (el) { el.textContent = zone.name; });
    var avgEl = root.querySelector('[data-trend-avg]');
    if (avgEl) avgEl.innerHTML = series.avg.toFixed(1) + '&deg;C';
    var peakEl = root.querySelector('[data-trend-peak]');
    if (peakEl) peakEl.innerHTML = series.peak.toFixed(1) + '&deg;C';
    var peakTimeEl = root.querySelector('[data-trend-peak-time]');
    if (peakTimeEl) peakTimeEl.textContent = series.peakLabel;
  }

  function renderCoolingRecommendation(zone) {
    var root = document.querySelector('[data-heatmap-recommend]');
    if (!root) return;
    var zoneEls = root.querySelectorAll('[data-recommend-zone]');
    zoneEls.forEach(function (el) { el.textContent = zone.name; });
    var list = root.querySelector('[data-recommend-list]');
    if (list) {
      list.innerHTML = zone.actions.map(function (a, i) {
        return '<div class="priority-item"><div class="priority-num">Prioritas 0' + (i + 1) + '</div><div class="priority-text">' + a + '</div></div>';
      }).join('');
    }
  }

  function updateHeatmapExtras(zone) {
    currentSelectedZone = zone;
    renderHeatAnalysis(zone);
    renderHistoricalTrend(zone, currentPeriod);
    renderCoolingRecommendation(zone);
  }

  function initTrendPeriodToggle() {
    var root = document.querySelector('[data-trend-root]');
    if (!root) return;
    var buttons = root.querySelectorAll('[data-trend-period]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('is-on'); });
        btn.classList.add('is-on');
        currentPeriod = btn.getAttribute('data-trend-period');
        renderHistoricalTrend(currentSelectedZone || ZONES[0], currentPeriod);
      });
    });
  }

  var SENSORS = [
    { name: 'Sensor #01', loc: 'Central District', temp: 32.8, status: 'is-warn' },
    { name: 'Sensor #02', loc: 'North Avenue', temp: 34.1, status: 'is-warn' },
    { name: 'Sensor #03', loc: 'Green Park', temp: 29.2, status: '' },
    { name: 'Sensor #04', loc: 'Riverside Community', temp: 31.4, status: '' },
    { name: 'Sensor #05', loc: 'East Industrial Belt', temp: 35.9, status: 'is-critical' },
    { name: 'Sensor #06', loc: 'South Terrace', temp: 33.0, status: 'is-warn' }
  ];

  function buildDefs() {
    var stops = ZONES.map(function (z) {
      var c = LEVEL_COLOR[z.level];
      return '<radialGradient id="grad-' + z.id + '" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="' + c + '" stop-opacity="0.85"/>' +
        '<stop offset="100%" stop-color="' + c + '" stop-opacity="0"/>' +
        '</radialGradient>';
    }).join('');
    return '<defs>' + stops + '</defs>';
  }

  function buildCityBase() {
    var blocks = '';
    var bx = [40, 150, 260, 370, 480, 590, 700];
    var by = [40, 140, 240, 340, 440, 520];
    for (var i = 0; i < bx.length - 1; i++) {
      for (var j = 0; j < by.length - 1; j++) {
        if (Math.random() > 0.32) {
          var w = (bx[i + 1] - bx[i]) - 14;
          var h = (by[j + 1] - by[j]) - 14;
          blocks += '<rect x="' + (bx[i] + 7) + '" y="' + (by[j] + 7) + '" width="' + w + '" height="' + h + '" rx="3" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.05)"/>';
        }
      }
    }
    var roadsV = bx.map(function (x) { return '<line x1="' + x + '" y1="20" x2="' + x + '" y2="560" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>'; }).join('');
    var roadsH = by.map(function (y) { return '<line x1="20" y1="' + y + '" x2="760" y2="' + y + '" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>'; }).join('');
    var river = '<path d="M20,60 C160,90 180,180 120,260 C60,340 220,380 300,460 C360,520 420,540 500,560" stroke="#33546B" stroke-width="16" fill="none" opacity="0.5" stroke-linecap="round"/>';
    return blocks + roadsV + roadsH + river;
  }

  function buildParks() {
    return '<g id="tree-layer">' +
      '<circle cx="176" cy="404" r="46" fill="#213C29" opacity="0.7"/>' +
      '<circle cx="150" cy="380" r="16" fill="#2D5238" opacity="0.8"/>' +
      '<circle cx="205" cy="420" r="14" fill="#2D5238" opacity="0.8"/>' +
      '<circle cx="176" cy="440" r="12" fill="#2D5238" opacity="0.8"/>' +
      '<circle cx="566" cy="172" r="30" fill="#213C29" opacity="0.55"/>' +
      '<circle cx="232" cy="148" r="18" fill="#213C29" opacity="0.4"/>' +
      '</g>';
  }

  function buildCoolingPoints() {
    var pts = [
      { x: 210, y: 250 }, { x: 470, y: 300 }, { x: 340, y: 120 }, { x: 620, y: 220 }, { x: 300, y: 460 }
    ];
    var out = pts.map(function (p) {
      return '<g transform="translate(' + p.x + ',' + p.y + ')"><circle r="7" fill="#0B0F0D" stroke="#B7DE8E" stroke-width="2"/><circle r="2.4" fill="#B7DE8E"/></g>';
    }).join('');
    return '<g id="cooling-layer">' + out + '</g>';
  }

  function buildReports() {
    var pts = [
      { x: 420, y: 210 }, { x: 380, y: 290 }, { x: 620, y: 400 }, { x: 640, y: 460 }, { x: 260, y: 130 }
    ];
    var out = pts.map(function (p) {
      return '<circle cx="' + p.x + '" cy="' + p.y + '" r="4" fill="#D65D45" opacity="0.85"><animate attributeName="opacity" values="0.85;0.25;0.85" dur="2.2s" repeatCount="indefinite"/></circle>';
    }).join('');
    return '<g id="reports-layer">' + out + '</g>';
  }

  function buildHeatZones() {
    var out = ZONES.map(function (z) {
      return '<g class="map-zone" data-zone="' + z.id + '" tabindex="0" role="button" aria-label="' + z.name + '">' +
        '<circle cx="' + z.cx + '" cy="' + z.cy + '" r="' + z.r + '" fill="url(#grad-' + z.id + ')"/>' +
        '<circle cx="' + z.cx + '" cy="' + z.cy + '" r="5" fill="' + LEVEL_COLOR[z.level] + '" stroke="#0B0F0D" stroke-width="2"/>' +
        '</g>';
    }).join('');
    return '<g id="heat-layer">' + out + '</g>';
  }

  function buildSVG() {
    return '<svg viewBox="0 0 780 580" xmlns="http://www.w3.org/2000/svg" aria-label="Peta panas perkotaan simulasi">' +
      buildDefs() +
      buildCityBase() +
      buildParks() +
      buildHeatZones() +
      buildCoolingPoints() +
      buildReports() +
      '</svg>';
  }

  function renderSensors(root) {
    var list = root.querySelector('[data-sensor-list]');
    if (!list) return;
    list.innerHTML = SENSORS.map(function (s) {
      return '<div class="sensor-item">' +
        '<div><div class="s-name">' + s.name + '</div><div class="s-loc">' + s.loc + '</div></div>' +
        '<div style="text-align:right"><div class="s-temp">' + s.temp.toFixed(1) + '&deg;C</div>' +
        '<span class="status ' + s.status + '"></span></div>' +
        '</div>';
    }).join('');
  }

  function showInfoCard(root, zone, zoneEl) {
    var card = root.querySelector('[data-info-card]');
    if (!card) return;
    var body = card.querySelector('[data-info-body]') || card;
    var statusLabel = STATUS_LABEL[zone.level] || 'Sedang';
    body.innerHTML =
      '<div class="pill sejuka-hotspot-badge"><span class="pill-dot dot-' + zone.level + '"></span>ZONA PANAS ' + zone.level.toUpperCase() + '</div>' +
      '<div class="card-title">' + zone.name + '</div>' +
      '<span class="tag" style="margin-bottom:12px;display:inline-block">DATA SIMULASI</span>' +
      '<div class="sejuka-hotspot-temp"><span class="sejuka-hotspot-temp-value">' + zone.surfaceTemp.toFixed(1) + '&deg;C</span><span class="sejuka-hotspot-temp-status">' + statusLabel + '</span></div>' +
      '<div class="sejuka-hotspot-metrics">' +
        '<div class="sejuka-hotspot-metric"><span class="m-label">Kelembapan</span><span class="m-value">' + zone.humidity + '%</span></div>' +
        '<div class="sejuka-hotspot-metric"><span class="m-label">PM2.5</span><span class="m-value">' + zone.pm25 + ' &micro;g/m&sup3;</span></div>' +
        '<div class="sejuka-hotspot-metric"><span class="m-label">Cahaya</span><span class="m-value">' + zone.light.toLocaleString('id-ID') + ' lux</span></div>' +
        '<div class="sejuka-hotspot-metric"><span class="m-label">Indeks Panas</span><span class="m-value">' + zone.heatIndex + ' / 100</span></div>' +
      '</div>' +
      '<div class="mini-label">Penyebab Utama</div>' +
      '<ul class="cause-list">' + zone.causes.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul>' +
      '<div class="mini-label">Tindakan yang Disarankan</div>' +
      '<ul class="action-list">' + zone.actions.map(function (a) { return '<li>' + a + '</li>'; }).join('') + '</ul>' +
      '<button class="btn btn-primary btn-sm" type="button">Lihat Analisis Area</button>';

    var stage = root.querySelector('.map-stage');
    var stageRect = stage.getBoundingClientRect();
    var zoneRect = zoneEl.getBoundingClientRect();
    var cardWidth = card.offsetWidth;
    var cardHeight = card.offsetHeight;
    var left = zoneRect.left - stageRect.left + zoneRect.width / 2 + 30;
    var top = zoneRect.top - stageRect.top - 20;
    if (left + cardWidth > stageRect.width - 10) left = zoneRect.left - stageRect.left - cardWidth - 30;
    if (left < 10) left = 10;
    if (left + cardWidth > stageRect.width - 10) left = Math.max(10, stageRect.width - cardWidth - 10);
    if (top < 10) top = 10;
    if (top + cardHeight > stageRect.height - 10) top = Math.max(10, stageRect.height - cardHeight - 10);
    card.style.left = left + 'px';
    card.style.top = top + 'px';
    card.classList.add('is-visible');

    var panelZone = root.querySelector('[data-panel-zone]');
    if (panelZone) {
      panelZone.innerHTML =
        '<div class="stat-row"><span>Area Terpilih</span><span>' + zone.name + '</span></div>' +
        '<div class="stat-row"><span>Indeks Panas</span><span>' + zone.heatIndex + ' / 100</span></div>' +
        '<div class="stat-row"><span>Suhu Permukaan</span><span>' + zone.surfaceTemp.toFixed(1) + '&deg;C</span></div>' +
        '<div class="stat-row"><span>Kelembapan</span><span>' + zone.humidity + '%</span></div>' +
        '<div class="stat-row"><span>PM2.5</span><span>' + zone.pm25 + ' &micro;g/m&sup3;</span></div>' +
        '<div class="stat-row"><span>Intensitas Cahaya</span><span>' + zone.light.toLocaleString('id-ID') + ' lux</span></div>' +
        '<div class="stat-row"><span>Tutupan Pohon</span><span>' + zone.tree + '%</span></div>' +
        '<div class="stat-row"><span>Ketersediaan Keteduhan</span><span>' + zone.shade + '%</span></div>' +
        '<div class="stat-row"><span>Titik Pendinginan</span><span>' + zone.cooling + '</span></div>' +
        '<div class="stat-row"><span>Laporan Komunitas</span><span>' + zone.reports + '</span></div>';
    }
  }

  function initZoom(root) {
    var svg = root.querySelector('.map-stage svg');
    if (!svg) return;
    var scale = 1;
    svg.style.transition = 'transform 0.35s cubic-bezier(0.16,1,0.3,1)';
    svg.style.transformOrigin = 'center center';
    function apply() { svg.style.transform = 'scale(' + scale + ')'; }
    var zin = root.querySelector('[data-zoom-in]');
    var zout = root.querySelector('[data-zoom-out]');
    var zreset = root.querySelector('[data-zoom-reset]');
    if (zin) zin.addEventListener('click', function () { scale = Math.min(scale + 0.2, 2); apply(); });
    if (zout) zout.addEventListener('click', function () { scale = Math.max(scale - 0.2, 0.7); apply(); });
    if (zreset) zreset.addEventListener('click', function () { scale = 1; apply(); });
  }

  function initToggles(root) {
    root.querySelectorAll('[data-toggle-layer]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var layer = btn.getAttribute('data-toggle-layer');
        var el = root.querySelector('#' + layer);
        var isOn = btn.classList.toggle('is-on');
        if (el) el.style.display = isOn ? '' : 'none';
      });
    });
  }

  function initZoneInteraction(root) {
    var selectedId = null;
    var card = root.querySelector('[data-info-card]');

    function hideCard() {
      if (card) card.classList.remove('is-visible');
      root.querySelectorAll('.map-zone').forEach(function (o) { o.classList.remove('is-selected'); });
      selectedId = null;
    }

    root.querySelectorAll('.map-zone').forEach(function (el) {
      var zone = ZONES.filter(function (z) { return z.id === el.getAttribute('data-zone'); })[0];
      function toggle() {
        if (selectedId === zone.id) {
          hideCard();
          return;
        }
        root.querySelectorAll('.map-zone').forEach(function (o) { o.classList.remove('is-selected'); });
        el.classList.add('is-selected');
        selectedId = zone.id;
        showInfoCard(root, zone, el);
        updateHeatmapExtras(zone);
      }
      el.addEventListener('click', toggle);
      el.addEventListener('keypress', function (e) { if (e.key === 'Enter') toggle(); });
    });

    var closeBtn = root.querySelector('[data-info-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', hideCard);
    }
  }

  window.SEJUKA.initHeatmap = function () {
    var stages = document.querySelectorAll('[data-heatmap-root]');
    if (stages.length === 0) return;
    stages.forEach(function (root) {
      var mapStage = root.querySelector('.map-stage');
      if (mapStage) mapStage.insertAdjacentHTML('afterbegin', buildSVG());
      renderSensors(root);
      initZoneInteraction(root);
      initToggles(root);
      initZoom(root);
    });
    initTrendPeriodToggle();
    updateHeatmapExtras(ZONES[0]);
  };
})();
