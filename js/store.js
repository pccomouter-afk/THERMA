(function () {
  window.THERMA = window.THERMA || {};
  var store = {};
  var USERS_KEY = "therma_users";
  var SESSION_KEY = "therma_session";
  var PREFS_KEY = "therma_preferences";
  var WEATHER_CACHE_KEY = "therma_cached_weather";
  var CACHE_TTL_MS = 10 * 60 * 1000;

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  store.keys = {
    users: USERS_KEY,
    session: SESSION_KEY,
    preferences: PREFS_KEY,
    weatherCache: WEATHER_CACHE_KEY
  };

  store.BALI_AREAS = [
    { id: "denpasar", name: "Denpasar", lat: -8.6705, lon: 115.2126 },
    { id: "canggu", name: "Canggu", lat: -8.6478, lon: 115.1385 },
    { id: "kuta", name: "Kuta", lat: -8.7184, lon: 115.1686 },
    { id: "ubud", name: "Ubud", lat: -8.5069, lon: 115.2625 },
    { id: "tabanan", name: "Tabanan", lat: -8.5416, lon: 115.1247 },
    { id: "jatiluwih", name: "Jatiluwih", lat: -8.3696, lon: 115.1301 },
    { id: "sanur", name: "Sanur", lat: -8.6931, lon: 115.2668 },
    { id: "badung", name: "Badung", lat: -8.585, lon: 115.185 },
    { id: "gianyar", name: "Gianyar", lat: -8.5411, lon: 115.3239 },
    { id: "bangli", name: "Bangli", lat: -8.4543, lon: 115.3548 },
    { id: "buleleng", name: "Buleleng", lat: -8.112, lon: 115.088 }
  ];

  store.BALI_CENTER = { lat: -8.55, lon: 115.22 };

  store.getUsers = function () {
    var users = readJSON(USERS_KEY, []);
    return Array.isArray(users) ? users : [];
  };

  store.saveUsers = function (users) {
    return writeJSON(USERS_KEY, users);
  };

  store.getSession = function () {
    return readJSON(SESSION_KEY, null);
  };

  store.setSession = function (session) {
    if (!session) {
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch (e) {}
      return;
    }
    writeJSON(SESSION_KEY, session);
  };

  store.getPreferences = function () {
    return readJSON(PREFS_KEY, { layer: "temperature", areaId: "denpasar" });
  };

  store.setPreferences = function (prefs) {
    var current = store.getPreferences();
    var merged = {};
    Object.keys(current).forEach(function (k) { merged[k] = current[k]; });
    Object.keys(prefs || {}).forEach(function (k) { merged[k] = prefs[k]; });
    writeJSON(PREFS_KEY, merged);
    return merged;
  };

  store.getWeatherCache = function () {
    return readJSON(WEATHER_CACHE_KEY, {});
  };

  store.getCachedWeather = function (cacheKey) {
    var cache = store.getWeatherCache();
    var entry = cache[cacheKey];
    if (!entry || !entry.timestamp || !entry.data) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
    return entry.data;
  };

  store.setCachedWeather = function (cacheKey, data) {
    var cache = store.getWeatherCache();
    cache[cacheKey] = { timestamp: Date.now(), data: data };
    var keys = Object.keys(cache);
    if (keys.length > 60) {
      keys.slice(0, keys.length - 60).forEach(function (k) { delete cache[k]; });
    }
    writeJSON(WEATHER_CACHE_KEY, cache);
  };

  store.findAreaById = function (id) {
    var found = null;
    store.BALI_AREAS.forEach(function (a) {
      if (a.id === id) found = a;
    });
    return found;
  };

  store.authState = { user: null };
  store.userState = { profile: null };
  store.mapState = { layer: "temperature", selectedAreaId: null, center: store.BALI_CENTER, zoom: 10 };
  store.environmentState = { status: "idle", areas: {}, updatedAt: null, error: null };
  store.routeState = { status: "idle", origin: null, destination: null, alternatives: [], error: null };

  window.THERMA.store = store;
})();
