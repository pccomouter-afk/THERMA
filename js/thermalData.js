(function () {
  window.THERMA = window.THERMA || {};

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

  window.THERMA.initThermalData = function () {
    var store = window.THERMA.store;
    var category = "all";
    var cache = {};

    document.querySelectorAll("[data-data-cat]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        category = btn.getAttribute("data-data-cat");
        document.querySelectorAll("[data-data-cat]").forEach(function (b) {
          b.classList.toggle("is-on", b === btn);
        });
        render();
      });
    });

    function rowFor(area) {
      var entry = cache[area.id];
      var w = entry ? entry.weather : null;
      var aq = entry ? entry.aq : null;
      var failed = entry && entry.failed;
      var temp = w ? num(w.temperature, 1, "°C") : (failed ? "Tidak tersedia" : "Memuat…");
      var feels = w && w.feelsLike !== null ? num(w.feelsLike, 1, "°C") : (failed ? "Tidak tersedia" : "Memuat…");
      var hum = w && w.humidity !== null ? w.humidity + "%" : (failed ? "Tidak tersedia" : "Memuat…");
      var pm = aq && aq.pm25 !== null ? num(aq.pm25, 1, "") : (failed ? "Tidak tersedia" : "Memuat…");
      var aqi = aq && aq.aqi !== null ? String(aq.aqi) : (failed ? "Tidak tersedia" : "Memuat…");
      var wind = w && w.windSpeed !== null ? num(w.windSpeed, 1, "") : (failed ? "Tidak tersedia" : "Memuat…");
      var time = w && w.time ? formatTime(w.time) : "—";
      if (category === "temperature") return "<tr><td>" + area.name + '</td><td class="num">' + temp + '</td><td class="num">' + feels + '</td><td colspan="5" style="color:var(--text-2)">Fokus: temperatur dan suhu terasa.</td></tr>';
      if (category === "humidity") return "<tr><td>" + area.name + '</td><td class="num">' + hum + '</td><td colspan="6" style="color:var(--text-2)">Fokus: kelembapan relatif.</td></tr>';
      if (category === "airquality") return "<tr><td>" + area.name + '</td><td class="num">' + pm + ' µg/m³</td><td class="num">AQI ' + aqi + '</td><td colspan="5" style="color:var(--text-2)">Fokus: PM2.5 dan indeks Eropa.</td></tr>';
      if (category === "weather") return "<tr><td>" + area.name + '</td><td class="num">' + wind + ' km/jam</td><td class="num">' + (w && w.cloudCover !== null ? w.cloudCover + "%" : (failed ? "Tidak tersedia" : "Memuat…")) + '</td><td colspan="5" style="color:var(--text-2)">Fokus: angin dan tutupan awan.</td></tr>';
      return "<tr><td>" + area.name + '</td><td class="num">' + temp + '</td><td class="num">' + feels + '</td><td class="num">' + hum + '</td><td class="num">' + pm + '</td><td class="num">' + aqi + '</td><td class="num">' + wind + "</td><td>" + time + "</td></tr>";
    }

    function render() {
      var tbody = document.querySelector("[data-data-rows]");
      if (!tbody) return;
      tbody.innerHTML = store.BALI_AREAS.map(rowFor).join("");
    }

    function load() {
      var meta = document.querySelector("[data-data-meta]");
      if (meta) meta.textContent = "Memuat data dari Open-Meteo…";
      render();
      var jobs = store.BALI_AREAS.map(function (area) {
        return window.THERMA.weatherService.getCurrentWeather(area.lat, area.lon)
          .then(function (r) {
            cache[area.id] = cache[area.id] || {};
            cache[area.id].weather = r.data;
            render();
            return window.THERMA.airQualityService.getCurrentAirQuality(area.lat, area.lon)
              .then(function (ra) {
                cache[area.id].aq = ra.data;
                render();
              })
              .catch(function () {
                cache[area.id].aq = null;
                render();
              });
          })
          .catch(function () {
            cache[area.id] = { weather: null, aq: null, failed: true };
            render();
          });
      });
      Promise.all(jobs).then(function () {
        var ok = store.BALI_AREAS.filter(function (a) { return cache[a.id] && cache[a.id].weather; }).length;
        if (meta) {
          meta.textContent = ok === 0
            ? "Sumber: Open-Meteo. Data sementara tidak tersedia."
            : "Sumber: Open-Meteo dan Open-Meteo Air Quality. " + ok + " dari " + store.BALI_AREAS.length + " wilayah berhasil dimuat.";
        }
      });
    }

    var retry = document.querySelector("[data-data-retry]");
    if (retry) retry.addEventListener("click", load);
    load();
  };
})();
