(function () {
  window.THERMA = window.THERMA || {};

  var ROUTE_COLORS = ["#b7de8e", "#e8c25b", "#e29143"];

  function setStatus(msg, isError) {
    var el = document.querySelector("[data-route-status]");
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("is-error", !!isError);
  }

  function geocodeOne(query) {
    return window.THERMA.routeService.searchPlace(query, 1).then(function (results) {
      if (!results.length) throw new Error("not_found");
      return results[0];
    });
  }

  function resolvePlace(raw) {
    var q = String(raw || "").trim();
    if (!q) return Promise.reject(new Error("empty"));
    var store = window.THERMA.store;
    var lowered = q.toLowerCase();
    for (var i = 0; i < store.BALI_AREAS.length; i++) {
      if (store.BALI_AREAS[i].name.toLowerCase() === lowered) {
        var a = store.BALI_AREAS[i];
        return Promise.resolve({ name: a.name + ", Bali", lat: a.lat, lon: a.lon });
      }
    }
    return geocodeOne(q + ", Bali").catch(function () {
      return geocodeOne(q);
    });
  }

  function ensureRouteClimate() {
    if (window.THERMA._routeTempPoints && window.THERMA._routeTempPoints.length >= 3) {
      return Promise.resolve(window.THERMA._routeTempPoints);
    }
    var store = window.THERMA.store;
    var jobs = store.BALI_AREAS.map(function (a) {
      return window.THERMA.weatherService.getCurrentWeather(a.lat, a.lon)
        .then(function (r) {
          if (typeof r.data.temperature !== "number") return null;
          return { lat: a.lat, lon: a.lon, value: r.data.temperature };
        })
        .catch(function () { return null; });
    });
    return Promise.all(jobs).then(function (pts) {
      var clean = pts.filter(function (p) { return !!p; });
      window.THERMA._routeTempPoints = clean;
      return clean;
    });
  }

  function averageTempAlongCoords(coords, tempPoints) {
    if (!coords || !coords.length || !tempPoints || tempPoints.length < 3) return null;
    var sum = 0;
    var count = 0;
    var step = Math.max(1, Math.floor(coords.length / 40));
    for (var i = 0; i < coords.length; i += step) {
      var v = window.THERMA.thermalService.idwValue(coords[i][0], coords[i][1], tempPoints);
      if (v !== null && v !== undefined) {
        sum += v;
        count++;
      }
    }
    if (!count) return null;
    return sum / count;
  }

  function formatTemp(temp) {
    if (temp === null || temp === undefined || !isFinite(temp)) return "Tidak tersedia";
    return temp.toFixed(1).replace(".", ",") + "°C";
  }

  window.THERMA.initCoolRoutePage = function () {
    var store = window.THERMA.store;
    var map = null;
    var routeLayers = [];
    var tempPoints = [];

    try {
      if (typeof L === "undefined") throw new Error("map_unavailable");
      map = L.map("route-map", { zoomControl: false }).setView([store.BALI_CENTER.lat, store.BALI_CENTER.lon], 10);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);
    } catch (e) {
      setStatus("Peta tidak dapat dimuat saat ini.", true);
    }

    ensureRouteClimate().then(function (pts) { tempPoints = pts; });

    var params = new URLSearchParams(window.location.search);
    var presetTo = params.get("to");
    var fromInput = document.querySelector("[data-route-from]");
    var toInput = document.querySelector("[data-route-to]");
    if (presetTo && toInput && !toInput.value) toInput.value = presetTo.replace(", Bali", "");

    function clearRoutes() {
      routeLayers.forEach(function (l) { try { map.removeLayer(l); } catch (e) {} });
      routeLayers = [];
    }

    function drawRoutes(origin, dest, routes, selectedIdx) {
      if (!map) return;
      clearRoutes();
      var bounds = [];
      routes.forEach(function (r, i) {
        var latlngs = r.geometry.coordinates.map(function (c) { return [c[1], c[0]]; });
        latlngs.forEach(function (ll) { bounds.push(ll); });
        var line = L.polyline(latlngs, {
          color: ROUTE_COLORS[i % ROUTE_COLORS.length],
          weight: i === selectedIdx ? 6 : 4,
          opacity: i === selectedIdx ? 0.95 : 0.6
        }).addTo(map);
        routeLayers.push(line);
      });
      [[origin.lat, origin.lon], [dest.lat, dest.lon]].forEach(function (ll) { bounds.push(ll); });
      var oM = L.marker([origin.lat, origin.lon]).addTo(map).bindPopup("Awal: " + origin.name);
      var dM = L.marker([dest.lat, dest.lon]).addTo(map).bindPopup("Tujuan: " + dest.name);
      routeLayers.push(oM, dM);
      try { map.fitBounds(bounds, { padding: [40, 40] }); } catch (e) {}
    }

    function renderOptions(origin, dest, routes) {
      var box = document.querySelector("[data-route-options]");
      if (!box) return;
      var shown = routes.slice(0, 2);
      var temps = shown.map(function (r) {
        var coords = r.geometry.coordinates.map(function (c) { return [c[1], c[0]]; });
        return averageTempAlongCoords(coords, tempPoints);
      });
      var coolerIdx = -1;
      var warmerIdx = -1;
      if (temps[0] !== null && temps[0] !== undefined && temps[1] !== null && temps[1] !== undefined) {
        if (temps[0] < temps[1]) {
          coolerIdx = 0;
          warmerIdx = 1;
        } else if (temps[1] < temps[0]) {
          coolerIdx = 1;
          warmerIdx = 0;
        }
      } else if (temps[0] !== null && temps[0] !== undefined && shown.length === 1) {
        coolerIdx = 0;
      }
      var selectedIdx = coolerIdx >= 0 ? coolerIdx : 0;
      box.innerHTML = "";
      shown.forEach(function (r, i) {
        var letter = String.fromCharCode(65 + i);
        var badge = "";
        var status = "Paparan tidak tersedia";
        if (i === coolerIdx && warmerIdx >= 0) {
          badge = '<span class="route-option-badge">Rute Lebih Sejuk</span>';
          status = "Paparan panas lebih rendah";
        } else if (i === warmerIdx) {
          badge = '<span class="route-option-badge route-option-badge-warm">Rute Lebih Panas</span>';
          status = "Paparan panas lebih tinggi";
        } else if (i === coolerIdx && shown.length === 1) {
          badge = '<span class="route-option-badge">Rute Lebih Sejuk</span>';
          status = "Paparan panas " + formatTemp(temps[i]);
        }
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "route-option" + (i === selectedIdx ? " is-selected" : "");
        btn.innerHTML = '<span class="route-option-head"><span class="route-option-name">Rute ' + letter + "</span>"
          + badge
          + "</span>"
          + '<div class="stat-row"><span>Jarak</span><span>' + window.THERMA.routeService.formatDistance(r.distanceKm) + "</span></div>"
          + '<div class="stat-row"><span>Estimasi waktu</span><span>' + window.THERMA.routeService.formatDuration(r.durationMinutes) + "</span></div>"
          + '<div class="stat-row"><span>Suhu paparan</span><span>' + formatTemp(temps[i]) + "</span></div>"
          + '<div class="stat-row"><span>Status rute</span><span>' + status + "</span></div>";
        btn.addEventListener("click", function () {
          box.querySelectorAll(".route-option").forEach(function (o) { o.classList.remove("is-selected"); });
          btn.classList.add("is-selected");
          highlightRoute(i);
        });
        box.appendChild(btn);
      });
      store.routeState = { status: "ready", origin: origin, destination: dest, alternatives: shown, error: null };
      drawRoutes(origin, dest, shown, selectedIdx);
      if (tempPoints.length < 3) {
        setStatus("Rute ditemukan. Estimasi paparan panas sedang tidak tersedia karena data termal belum lengkap.");
      } else if (shown.length < 2) {
        setStatus("Hanya satu rute nyata yang dikembalikan layanan untuk pasangan lokasi ini. Rekomendasi: Rute A — " + formatTemp(temps[0]) + ".");
      } else if (coolerIdx >= 0 && warmerIdx >= 0) {
        setStatus("Rekomendasi: Rute " + String.fromCharCode(65 + coolerIdx) + " — lebih sejuk (" + formatTemp(temps[coolerIdx]) + " berbanding " + formatTemp(temps[warmerIdx]) + ").");
      } else {
        setStatus("Kedua rute mempunyai paparan panas yang setara (" + formatTemp(temps[0]) + ").");
      }
    }

    function highlightRoute(idx) {
      routeLayers.forEach(function (l) {
        try {
          if (l.setStyle) l.setStyle({ weight: 4, opacity: 0.45 });
        } catch (e) {}
      });
      var line = routeLayers[idx];
      try {
        if (line && line.setStyle) line.setStyle({ weight: 6, opacity: 0.95 });
      } catch (e) {}
    }

    var form = document.querySelector("[data-route-form]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var fromRaw = fromInput ? fromInput.value : "";
        var toRaw = toInput ? toInput.value : "";
        if (!fromRaw.trim() || !toRaw.trim()) {
          setStatus("Isi lokasi awal dan tujuan terlebih dahulu.", true);
          return;
        }
        var submitBtn = document.querySelector("[data-route-submit]");
        if (submitBtn) submitBtn.classList.add("is-loading");
        setStatus("Mencari koordinat dan menghitung rute…");
        store.routeState.status = "loading";
        resolvePlace(fromRaw).then(function (origin) {
          return resolvePlace(toRaw).then(function (dest) {
            return { origin: origin, dest: dest };
          });
        }).then(function (pair) {
          return window.THERMA.routeService.fetchRoutes(pair.origin, pair.dest).then(function (routes) {
            return { origin: pair.origin, dest: pair.dest, routes: routes };
          });
        }).then(function (res) {
          if (submitBtn) submitBtn.classList.remove("is-loading");
          renderOptions(res.origin, res.dest, res.routes);
        }).catch(function (err) {
          if (submitBtn) submitBtn.classList.remove("is-loading");
          store.routeState = { status: "error", origin: null, destination: null, alternatives: [], error: String(err && err.message || err) };
          if (err && err.message === "not_found") setStatus("Salah satu lokasi tidak ditemukan. Coba nama wilayah lain di Bali.", true);
          else if (err && err.message === "route_unavailable") setStatus("Rute tidak dapat dihitung saat ini. Coba lagi nanti.", true);
          else if (err && err.message === "geocode_unavailable") setStatus("Layanan pencarian lokasi sedang tidak tersedia.", true);
          else setStatus("Terjadi gangguan. Coba lagi nanti.", true);
        });
      });
    }
  };
})();
