(function () {
  window.THERMA = window.THERMA || {};
  var store = window.THERMA.store;
  var TIMEOUT_MS = 10000;

  function fetchWithTimeout(url, options) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);
    var fetchOptions = { signal: controller.signal };
    if (options) {
      Object.keys(options).forEach(function (k) { fetchOptions[k] = options[k]; });
    }
    return fetch(url, fetchOptions).finally(function () { clearTimeout(timer); });
  }

  function buildAirQualityURL(lat, lon) {
    var base = "https://air-quality-api.open-meteo.com/v1/air-quality";
    var params = [
      "latitude=" + encodeURIComponent(lat),
      "longitude=" + encodeURIComponent(lon),
      "current=pm2_5,pm10,european_aqi",
      "timezone=auto"
    ].join("&");
    return base + "?" + params;
  }

  function normalizeAirQualityPayload(payload) {
    if (!payload || !payload.current) return null;
    var c = payload.current;
    if (typeof c.pm2_5 !== "number" && typeof c.european_aqi !== "number") return null;
    return {
      pm25: typeof c.pm2_5 === "number" ? c.pm2_5 : null,
      pm10: typeof c.pm10 === "number" ? c.pm10 : null,
      aqi: typeof c.european_aqi === "number" ? c.european_aqi : null,
      time: c.time || null
    };
  }

  function europeanAqiLabel(aqi) {
    if (aqi === null || aqi === undefined) return "Tidak tersedia";
    if (aqi <= 20) return "Baik";
    if (aqi <= 40) return "Cukup";
    if (aqi <= 60) return "Sedang";
    if (aqi <= 80) return "Buruk";
    if (aqi <= 100) return "Sangat buruk";
    return "Berbahaya";
  }

  function getCurrentAirQuality(lat, lon) {
    var cacheKey = "aq:" + Number(lat).toFixed(4) + "," + Number(lon).toFixed(4);
    var cached = store.getCachedWeather(cacheKey);
    if (cached) return Promise.resolve({ data: cached, cached: true });
    return fetchWithTimeout(buildAirQualityURL(lat, lon), { headers: { Accept: "application/json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("aq_unavailable");
        return res.json();
      })
      .then(function (payload) {
        var normalized = normalizeAirQualityPayload(payload);
        if (!normalized) throw new Error("aq_unavailable");
        store.setCachedWeather(cacheKey, normalized);
        return { data: normalized, cached: false };
      });
  }

  window.THERMA.airQualityService = {
    getCurrentAirQuality: getCurrentAirQuality,
    europeanAqiLabel: europeanAqiLabel
  };
})();
