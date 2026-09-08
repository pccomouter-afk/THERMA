(function () {
  window.THERMA = window.THERMA || {};
  var TIMEOUT_MS = 12000;

  function fetchWithTimeout(url, options) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);
    var fetchOptions = { signal: controller.signal };
    if (options) {
      Object.keys(options).forEach(function (k) { fetchOptions[k] = options[k]; });
    }
    return fetch(url, fetchOptions).finally(function () { clearTimeout(timer); });
  }

  function searchPlace(query, limit) {
    var url = "https://nominatim.openstreetmap.org/search?format=json&limit=" + (limit || 5) + "&countrycodes=id&viewbox=114.35,-8.05,115.75,-8.85&bounded=0&q=" + encodeURIComponent(query);
    return fetchWithTimeout(url, { headers: { Accept: "application/json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("geocode_unavailable");
        return res.json();
      })
      .then(function (items) {
        if (!Array.isArray(items)) return [];
        return items
          .map(function (it) {
            return {
              name: it.display_name,
              lat: parseFloat(it.lat),
              lon: parseFloat(it.lon)
            };
          })
          .filter(function (it) { return isFinite(it.lat) && isFinite(it.lon); });
      });
  }

  function fetchRoutes(from, to) {
    var coords = from.lon + "," + from.lat + ";" + to.lon + "," + to.lat;
    var url = "https://router.project-osrm.org/route/v1/foot/" + coords + "?overview=full&geometries=geojson&alternatives=true&steps=false";
    return fetchWithTimeout(url, { headers: { Accept: "application/json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("route_unavailable");
        return res.json();
      })
      .then(function (payload) {
        if (!payload || payload.code !== "Ok" || !payload.routes || !payload.routes.length) {
          throw new Error("route_unavailable");
        }
        return payload.routes.slice(0, 2).map(function (r, i) {
          return {
            id: i,
            distanceMeters: r.distance,
            durationSeconds: r.duration,
            geometry: r.geometry,
            distanceKm: r.distance / 1000,
            durationMinutes: Math.round(r.duration / 60)
          };
        });
      });
  }

  function formatDistance(km) {
    if (km < 1) return Math.round(km * 1000) + " m";
    return km.toFixed(1).replace(".", ",") + " km";
  }

  function formatDuration(minutes) {
    if (minutes < 60) return minutes + " menit";
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    if (m === 0) return h + " jam";
    return h + " jam " + m + " menit";
  }

  window.THERMA.routeService = {
    searchPlace: searchPlace,
    fetchRoutes: fetchRoutes,
    formatDistance: formatDistance,
    formatDuration: formatDuration
  };
})();
