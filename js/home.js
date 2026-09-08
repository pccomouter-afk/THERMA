(function () {
  window.THERMA = window.THERMA || {};

  var SNAPSHOT_IDS = ["denpasar", "ubud", "kuta", "buleleng"];

  function setText(sel, text) {
    document.querySelectorAll(sel).forEach(function (el) { el.textContent = text; });
  }

  function formatTime(iso) {
    if (!iso) return "";
    try {
      var d = new Date(iso);
      return d.toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  }

  function snapshotCard(area, weather, error) {
    var thermal = weather ? window.THERMA.thermalService.thermalVisualizationIndex(weather) : null;
    var temp = weather ? weather.temperature.toFixed(1).replace(".", ",") + "°C" : "Tidak tersedia";
    var sub = thermal ? thermal.label : (error ? "Data sementara tidak tersedia" : "Menunggu data lingkungan");
    var feels = weather && weather.feelsLike !== null ? weather.feelsLike.toFixed(1).replace(".", ",") + "°C" : "—";
    var hum = weather && weather.humidity !== null ? weather.humidity + "%" : "—";
    return '<article class="preview-card">'
      + '<h3>' + area.name + '</h3>'
      + '<div class="detail-temp">' + temp + '</div>'
      + '<p>' + sub + '</p>'
      + '<div class="stat-row"><span>Terasa seperti</span><span>' + feels + '</span></div>'
      + '<div class="stat-row"><span>Kelembapan</span><span>' + hum + '</span></div>'
      + '<a href="/pages/map.html?area=' + area.id + '" class="btn btn-outline btn-sm" style="justify-content:center;margin-top:8px">Lihat di peta</a>'
      + '</article>';
  }

  function initHeroMap(points) {
    try {
      if (typeof L === "undefined") return;
      var el = document.getElementById("hero-map");
      if (!el) return;
      var map = L.map(el, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        dragging: false,
        keyboard: false
      }).setView([-8.55, 115.22], 9);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      if (points && points.length >= 3) {
        var bounds = window.THERMA.thermalService.BALI_BOUNDS;
        var grid = window.THERMA.thermalService.buildGrid(points, bounds, 90, 60);
        var canvas = document.createElement("canvas");
        window.THERMA.thermalService.renderGridToCanvas(canvas, grid);
        var url = canvas.toDataURL();
        L.imageOverlay(url, [[bounds.maxLat, bounds.minLon], [bounds.minLat, bounds.maxLon]], { opacity: 0.6, interactive: false }).addTo(map);
      }
      setTimeout(function () { try { map.invalidateSize(); } catch (e) {} }, 400);
    } catch (e) {}
  }

  function initSnapshot() {
    var grid = document.querySelector("[data-snapshot-grid]");
    var store = window.THERMA.store;
    var areas = store.BALI_AREAS.filter(function (a) { return SNAPSHOT_IDS.indexOf(a.id) !== -1; });
    if (grid) {
      grid.innerHTML = areas.map(function (a) {
        return snapshotCard(a, null, false);
      }).join("");
    }
    window.THERMA.weatherService.getWeatherForAreas(store.BALI_AREAS).then(function (results) {
      var denpasar = results.denpasar;
      if (denpasar && denpasar.weather) {
        var w = denpasar.weather;
        var thermal = window.THERMA.thermalService.thermalVisualizationIndex(w);
        setText("[data-hero-temp]", w.temperature.toFixed(1).replace(".", ",") + "°C");
        setText("[data-hero-feels]", w.feelsLike !== null ? w.feelsLike.toFixed(1).replace(".", ",") + "°C" : "—");
        setText("[data-hero-humidity]", w.humidity !== null ? w.humidity + "%" : "—");
        setText("[data-hero-status]", thermal ? thermal.label : "—");
        var note = "Estimasi kondisi termal berbasis data cuaca aktual.";
        if (w.time) note += " Diperbarui " + formatTime(w.time) + ".";
        setText("[data-hero-note]", note);
        var dot = document.querySelector("[data-hero-dot]");
        if (dot) dot.classList.remove("is-loading");
      } else {
        setText("[data-hero-temp]", "Tidak tersedia");
        setText("[data-hero-note]", "Data sementara tidak tersedia. Coba lagi nanti.");
        var dot2 = document.querySelector("[data-hero-dot]");
        if (dot2) dot2.classList.remove("is-loading");
      }
      if (grid) {
        grid.innerHTML = areas.map(function (a) {
          var r = results[a.id];
          return snapshotCard(a, r ? r.weather : null, r ? !!r.error : true);
        }).join("");
      }
      var meta = document.querySelector("[data-snapshot-meta]");
      if (meta) {
        var okCount = areas.filter(function (a) { return results[a.id] && results[a.id].weather; }).length;
        if (okCount === 0) {
          meta.textContent = "Sumber: Open-Meteo. Data sementara tidak tersedia.";
        } else {
          meta.textContent = "Sumber: Open-Meteo. Estimasi kondisi termal berbasis data cuaca aktual, diperbarui " + formatTime(new Date().toISOString()) + ".";
        }
      }
      var points = [];
      Object.keys(results).forEach(function (id) {
        var r = results[id];
        if (r && r.weather) {
          var t = window.THERMA.thermalService.thermalVisualizationIndex(r.weather);
          if (t) points.push({ lat: r.area.lat, lon: r.area.lon, value: t.score });
        }
      });
      initHeroMap(points);
    }).catch(function () {
      setText("[data-hero-temp]", "Tidak tersedia");
      setText("[data-hero-note]", "Data sementara tidak tersedia. Coba lagi nanti.");
      var meta = document.querySelector("[data-snapshot-meta]");
      if (meta) meta.textContent = "Sumber: Open-Meteo. Data sementara tidak tersedia.";
      initHeroMap([]);
    });
  }

  window.THERMA.initHome = function () {
    initSnapshot();
  };
})();
