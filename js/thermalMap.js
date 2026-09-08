(function () {
  window.THERMA = window.THERMA || {};

  var LEGENDS = {
    temperature: ["Sangat Sejuk", "Sejuk", "Sedang", "Hangat", "Panas", "Sangat Panas"],
    humidity: ["Kering", "Nyaman", "Lembap", "Sangat lembap"],
    airquality: ["Baik", "Cukup", "Sedang", "Buruk", "Sangat buruk"]
  };

  function debounce(fn, wait) {
    var t = null;
    return function () {
      var args = arguments;
      var ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  function formatTime(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "—";
    }
  }

  function num(v, digits, suffix) {
    if (v === null || v === undefined || !isFinite(v)) return "Tidak tersedia";
    return v.toFixed(digits === undefined ? 1 : digits).replace(".", ",") + (suffix || "");
  }

  function scoreColor(score) {
    var c = window.THERMA.thermalService.valueToColor(score === null ? 0.5 : score);
    return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
  }

  function renderLegend(layer) {
    var el = document.querySelector("[data-legend]");
    if (!el) return;
    var items = LEGENDS[layer] || LEGENDS.temperature;
    el.innerHTML = "<span>" + items[0] + '</span><span class="grad-bar"></span><span>' + items[items.length - 1] + "</span>";
  }

  function emptyDetail() {
    var el = document.querySelector("[data-detail]");
    if (!el) return;
    el.classList.add("is-empty");
    el.innerHTML = "<h3>Belum ada area dipilih</h3><p>Pilih salah satu wilayah di atas atau klik penanda di peta untuk membaca kondisi aktualnya.</p>";
  }

  function loadingDetail(name) {
    var el = document.querySelector("[data-detail]");
    if (!el) return;
    el.classList.remove("is-empty");
    el.innerHTML = '<h3>' + name + '</h3><div class="state-box"><p>Memuat data lingkungan…</p></div>';
  }

  function errorDetail(name, onRetry) {
    var el = document.querySelector("[data-detail]");
    if (!el) return;
    el.classList.remove("is-empty");
    el.innerHTML = "<h3>" + name + '</h3><div class="state-box"><p>Data sementara tidak tersedia.</p><button class="btn btn-outline btn-sm" data-retry>Coba lagi</button></div>';
    var btn = el.querySelector("[data-retry]");
    if (btn && onRetry) btn.addEventListener("click", onRetry);
  }

  function renderDetail(area, weather, aq) {
    var el = document.querySelector("[data-detail]");
    if (!el) return;
    el.classList.remove("is-empty");
    var thermal = weather ? window.THERMA.thermalService.thermalVisualizationIndex(weather) : null;
    var status = thermal ? thermal.label : "Tidak tersedia";
    var aqLabel = aq && aq.aqi !== null ? window.THERMA.airQualityService.europeanAqiLabel(aq.aqi) : "Tidak tersedia";
    el.innerHTML = "<h3>" + area.name + "</h3>"
      + '<span class="detail-status"><span class="hero-live-dot"></span>' + status + "</span>"
      + '<div class="detail-temp">' + (weather ? num(weather.temperature, 1, "°C") : "Tidak tersedia") + "</div>"
      + '<div class="stat-row"><span>Terasa seperti</span><span>' + (weather && weather.feelsLike !== null ? num(weather.feelsLike, 1, "°C") : "Tidak tersedia") + "</span></div>"
      + '<div class="stat-row"><span>Kelembapan</span><span>' + (weather && weather.humidity !== null ? weather.humidity + "% · " + window.THERMA.thermalService.humidityLabel(weather.humidity) : "Tidak tersedia") + "</span></div>"
      + '<div class="stat-row"><span>PM2.5</span><span>' + (aq && aq.pm25 !== null ? num(aq.pm25, 1, " µg/m³") : "Tidak tersedia") + "</span></div>"
      + '<div class="stat-row"><span>Kualitas udara</span><span>' + aqLabel + "</span></div>"
      + '<div class="stat-row"><span>Angin</span><span>' + (weather && weather.windSpeed !== null ? num(weather.windSpeed, 1, " km/jam") : "Tidak tersedia") + "</span></div>"
      + '<p class="caption">Estimasi kondisi termal berbasis data cuaca aktual.' + (weather && weather.time ? " Diperbarui " + formatTime(weather.time) + "." : "") + "</p>"
      + '<a class="btn btn-outline btn-sm" style="justify-content:center" href="/pages/cool-route.html?to=' + encodeURIComponent(area.name + ", Bali") + '">Buat rute ke sini</a>';
  }

  function renderChips(areas, selectedId, onPick) {
    var wrap = document.querySelector("[data-area-chips]");
    if (!wrap) return;
    wrap.innerHTML = "";
    areas.forEach(function (a) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "area-chip" + (a.id === selectedId ? " is-on" : "");
      b.textContent = a.name;
      b.addEventListener("click", function () { onPick(a.id); });
      wrap.appendChild(b);
    });
  }

  window.THERMA.initThermalMap = function () {
    var store = window.THERMA.store;
    var prefs = store.getPreferences();
    var state = {
      layer: prefs.layer || "temperature",
      selectedId: null,
      weatherById: {},
      aqById: {},
      map: null,
      markers: {},
      overlay: null,
      points: []
    };

    document.querySelectorAll("[data-layer]").forEach(function (btn) {
      btn.classList.toggle("is-on", btn.getAttribute("data-layer") === state.layer);
      btn.addEventListener("click", function () {
        state.layer = btn.getAttribute("data-layer");
        document.querySelectorAll("[data-layer]").forEach(function (b) {
          b.classList.toggle("is-on", b === btn);
        });
        store.setPreferences({ layer: state.layer });
        renderLegend(state.layer);
        rebuildSurface();
        restyleMarkers();
      });
    });
    renderLegend(state.layer);

    var canvasEl = document.querySelector("[data-thermal-canvas]");
    if (canvasEl) canvasEl.style.display = "none";

    try {
      if (typeof L === "undefined") throw new Error("map_unavailable");
      state.map = L.map("therma-map", { zoomControl: true }).setView([store.BALI_CENTER.lat, store.BALI_CENTER.lon], 10);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors"
      }).addTo(state.map);
      store.BALI_AREAS.forEach(function (a) {
        var m = L.circleMarker([a.lat, a.lon], {
          radius: 9,
          color: "#0b0f0d",
          weight: 2,
          fillColor: "#b7de8e",
          fillOpacity: 0.9
        }).addTo(state.map);
        m.bindTooltip(a.name, { direction: "top", offset: [0, -10] });
        m.on("click", function () { selectArea(a.id, true); });
        state.markers[a.id] = m;
      });
      state.map.on("resize", debounce(function () { state.map.invalidateSize(); }, 200));
      window.addEventListener("resize", debounce(function () { state.map.invalidateSize(); }, 250));
    } catch (e) {
      var frame = document.querySelector(".therma-map-frame");
      if (frame) frame.innerHTML = '<div class="state-box" style="margin:24px"><p>Peta tidak dapat dimuat saat ini.</p><button class="btn btn-outline btn-sm" onclick="window.location.reload()">Muat ulang</button></div>';
      return;
    }

    function layerValue(areaId) {
      var w = state.weatherById[areaId];
      var aq = state.aqById[areaId];
      if (state.layer === "humidity") {
        if (!w || w.humidity === null) return null;
        return Math.max(0, Math.min(1, w.humidity / 100));
      }
      if (state.layer === "airquality") {
        if (!aq || aq.pm25 === null) return null;
        return Math.max(0, Math.min(1, aq.pm25 / 75));
      }
      if (!w) return null;
      var t = window.THERMA.thermalService.thermalVisualizationIndex(w);
      return t ? t.score : null;
    }

    function rebuildSurface() {
      var bounds = window.THERMA.thermalService.BALI_BOUNDS;
      var pts = [];
      store.BALI_AREAS.forEach(function (a) {
        var v = layerValue(a.id);
        if (v !== null && v !== undefined) pts.push({ lat: a.lat, lon: a.lon, value: v });
      });
      state.points = pts;
      try {
        if (state.overlay) {
          state.map.removeLayer(state.overlay);
          state.overlay = null;
        }
        if (pts.length >= 3) {
          var grid = window.THERMA.thermalService.buildGrid(pts, bounds, 100, 70);
          var canvas = document.createElement("canvas");
          window.THERMA.thermalService.renderGridToCanvas(canvas, grid);
          var url = canvas.toDataURL();
          state.overlay = L.imageOverlay(url, [[bounds.maxLat, bounds.minLon], [bounds.minLat, bounds.maxLon]], { opacity: 0.62, interactive: false });
          state.overlay.addTo(state.map);
          state.overlay.bringToBack();
        }
      } catch (e) {}
      window.THERMA._thermalPoints = pts;
    }

    function restyleMarkers() {
      Object.keys(state.markers).forEach(function (id) {
        var v = layerValue(id);
        state.markers[id].setStyle({ fillColor: v === null ? "#5a665e" : scoreColor(v) });
      });
    }

    function setMeta(okCount, total) {
      var meta = document.querySelector("[data-map-meta]");
      if (!meta) return;
      if (okCount === 0) meta.textContent = "Sumber: Open-Meteo. Data sementara tidak tersedia.";
      else meta.textContent = "Sumber: Open-Meteo dan Open-Meteo Air Quality. " + okCount + " dari " + total + " wilayah berhasil dimuat. Estimasi kondisi termal berbasis data cuaca aktual.";
    }

    function loadAllData() {
      var meta = document.querySelector("[data-map-meta]");
      if (meta) meta.textContent = "Memuat data lingkungan dari Open-Meteo…";
      var weatherPromises = store.BALI_AREAS.map(function (a) {
        return window.THERMA.weatherService.getCurrentWeather(a.lat, a.lon)
          .then(function (r) { state.weatherById[a.id] = r.data; })
          .catch(function () { state.weatherById[a.id] = null; });
      });
      Promise.all(weatherPromises).then(function () {
        var aqPromises = store.BALI_AREAS.map(function (a) {
          return window.THERMA.airQualityService.getCurrentAirQuality(a.lat, a.lon)
            .then(function (r) { state.aqById[a.id] = r.data; })
            .catch(function () { state.aqById[a.id] = null; });
        });
        return Promise.all(aqPromises);
      }).then(function () {
        var ok = store.BALI_AREAS.filter(function (a) { return !!state.weatherById[a.id]; }).length;
        setMeta(ok, store.BALI_AREAS.length);
        rebuildSurface();
        restyleMarkers();
        store.environmentState = { status: ok ? "ready" : "error", areas: state.weatherById, updatedAt: new Date().toISOString(), error: ok ? null : "unavailable" };
        if (state.selectedId) selectArea(state.selectedId, false);
      });
    }

    function selectArea(id, fly) {
      var area = store.findAreaById(id);
      if (!area) return;
      state.selectedId = id;
      store.mapState.selectedAreaId = id;
      renderChips(store.BALI_AREAS, id, function (nid) { selectArea(nid, true); });
      Object.keys(state.markers).forEach(function (mid) {
        state.markers[mid].setRadius(mid === id ? 13 : 9);
      });
      if (fly && state.map) state.map.flyTo([area.lat, area.lon], Math.max(state.map.getZoom(), 11), { duration: 0.8 });
      var w = state.weatherById[id];
      var aq = state.aqById[id];
      if (w) {
        renderDetail(area, w, aq || null);
      } else {
        loadingDetail(area.name);
        window.THERMA.weatherService.getCurrentWeather(area.lat, area.lon).then(function (r) {
          state.weatherById[id] = r.data;
          return window.THERMA.airQualityService.getCurrentAirQuality(area.lat, area.lon)
            .then(function (ra) { state.aqById[id] = ra.data; })
            .catch(function () { state.aqById[id] = null; })
            .then(function () {
              renderDetail(area, state.weatherById[id], state.aqById[id] || null);
              rebuildSurface();
              restyleMarkers();
            });
        }).catch(function () {
          errorDetail(area.name, function () { selectArea(id, false); });
        });
      }
    }

    renderChips(store.BALI_AREAS, null, function (nid) { selectArea(nid, true); });
    emptyDetail();
    loadAllData();

    var params = new URLSearchParams(window.location.search);
    var initialArea = params.get("area");
    if (initialArea && store.findAreaById(initialArea)) {
      var waitForData = setInterval(function () {
        if (state.weatherById[initialArea] !== undefined) {
          clearInterval(waitForData);
          selectArea(initialArea, true);
        }
      }, 400);
      setTimeout(function () { clearInterval(waitForData); }, 15000);
    }

    var searchForm = document.querySelector("[data-search-form]");
    if (searchForm) {
      searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = document.querySelector("[data-search-input]");
        var q = input ? input.value.trim() : "";
        if (!q) return;
        var btn = searchForm.querySelector('button[type="submit"]');
        if (btn) btn.classList.add("is-loading");
        window.THERMA.routeService.searchPlace(q + ", Bali", 1).then(function (results) {
          if (btn) btn.classList.remove("is-loading");
          if (!results.length) {
            setMeta(0, 0);
            var meta = document.querySelector("[data-map-meta]");
            if (meta) meta.textContent = "Lokasi tidak ditemukan. Coba nama wilayah lain di Bali.";
            return;
          }
          var r = results[0];
          state.map.flyTo([r.lat, r.lon], 12, { duration: 0.8 });
          var pseudo = { id: "search", name: r.name.split(",").slice(0, 2).join(",") };
          loadingDetail(pseudo.name);
          window.THERMA.weatherService.getCurrentWeather(r.lat, r.lon).then(function (wr) {
            return window.THERMA.airQualityService.getCurrentAirQuality(r.lat, r.lon)
              .then(function (ar) { renderDetail({ name: pseudo.name }, wr.data, ar.data); })
              .catch(function () { renderDetail({ name: pseudo.name }, wr.data, null); });
          }).catch(function () {
            errorDetail(pseudo.name, function () {});
          });
        }).catch(function () {
          if (btn) btn.classList.remove("is-loading");
          var meta = document.querySelector("[data-map-meta]");
          if (meta) meta.textContent = "Pencarian sementara tidak tersedia. Coba lagi nanti.";
        });
      });
    }

    var locateBtn = document.querySelector("[data-locate]");
    if (locateBtn) {
      locateBtn.addEventListener("click", function () {
        if (!navigator.geolocation) return;
        locateBtn.classList.add("is-loading");
        navigator.geolocation.getCurrentPosition(function (pos) {
          locateBtn.classList.remove("is-loading");
          var lat = pos.coords.latitude;
          var lon = pos.coords.longitude;
          state.map.flyTo([lat, lon], 12, { duration: 0.8 });
          loadingDetail("Lokasiku");
          window.THERMA.weatherService.getCurrentWeather(lat, lon).then(function (wr) {
            return window.THERMA.airQualityService.getCurrentAirQuality(lat, lon)
              .then(function (ar) { renderDetail({ name: "Lokasiku" }, wr.data, ar.data); })
              .catch(function () { renderDetail({ name: "Lokasiku" }, wr.data, null); });
          }).catch(function () {
            errorDetail("Lokasiku", function () {});
          });
        }, function () {
          locateBtn.classList.remove("is-loading");
          var meta = document.querySelector("[data-map-meta]");
          if (meta) meta.textContent = "Izin lokasi ditolak atau tidak tersedia.";
        }, { timeout: 10000 });
      });
    }

    var resetBtn = document.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        state.map.flyTo([store.BALI_CENTER.lat, store.BALI_CENTER.lon], 10, { duration: 0.8 });
      });
    }
  };
})();
