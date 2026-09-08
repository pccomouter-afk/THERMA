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

  function buildWeatherURL(lat, lon) {
    var base = "https://api.open-meteo.com/v1/forecast";
    var params = [
      "latitude=" + encodeURIComponent(lat),
      "longitude=" + encodeURIComponent(lon),
      "current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,cloud_cover,precipitation",
      "timezone=auto"
    ].join("&");
    return base + "?" + params;
  }

  function normalizeWeatherPayload(payload) {
    if (!payload || !payload.current) return null;
    var c = payload.current;
    if (typeof c.temperature_2m !== "number") return null;
    return {
      temperature: c.temperature_2m,
      humidity: typeof c.relative_humidity_2m === "number" ? c.relative_humidity_2m : null,
      feelsLike: typeof c.apparent_temperature === "number" ? c.apparent_temperature : null,
      windSpeed: typeof c.wind_speed_10m === "number" ? c.wind_speed_10m : null,
      cloudCover: typeof c.cloud_cover === "number" ? c.cloud_cover : null,
      precipitation: typeof c.precipitation === "number" ? c.precipitation : null,
      time: c.time || null,
      timezone: payload.timezone || null
    };
  }

  function getCurrentWeather(lat, lon) {
    var cacheKey = "weather:" + Number(lat).toFixed(4) + "," + Number(lon).toFixed(4);
    var cached = store.getCachedWeather(cacheKey);
    if (cached) return Promise.resolve({ data: cached, cached: true });
    return fetchWithTimeout(buildWeatherURL(lat, lon), { headers: { Accept: "application/json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("weather_unavailable");
        return res.json();
      })
      .then(function (payload) {
        var normalized = normalizeWeatherPayload(payload);
        if (!normalized) throw new Error("weather_unavailable");
        store.setCachedWeather(cacheKey, normalized);
        return { data: normalized, cached: false };
      });
  }

  function getWeatherForAreas(areas) {
    var results = {};
    var chain = Promise.resolve();
    areas.forEach(function (area) {
      chain = chain.then(function () {
        return getCurrentWeather(area.lat, area.lon)
          .then(function (r) { results[area.id] = { area: area, weather: r.data, error: null }; })
          .catch(function () { results[area.id] = { area: area, weather: null, error: "unavailable" }; });
      });
    });
    return chain.then(function () { return results; });
  }

  window.THERMA.weatherService = {
    getCurrentWeather: getCurrentWeather,
    getWeatherForAreas: getWeatherForAreas
  };
})();
