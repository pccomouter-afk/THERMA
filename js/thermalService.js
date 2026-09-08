(function () {
  window.THERMA = window.THERMA || {};

  var TEMP_MIN = 20;
  var TEMP_MAX = 38;

  function clamp01(v) {
    if (v < 0) return 0;
    if (v > 1) return 1;
    return v;
  }

  function clampRange(v, min, max) {
    if (v < min) return min;
    if (v > max) return max;
    return v;
  }

  function normalizeTemperature(t) {
    return clamp01((t - TEMP_MIN) / (TEMP_MAX - TEMP_MIN));
  }

  function humidityAdjustment(h) {
    if (h === null || h === undefined) return 0;
    return clampRange((h - 55) / 120, -0.05, 0.12);
  }

  function cloudAdjustment(cloud) {
    if (cloud === null || cloud === undefined) return 0;
    return -(cloud / 100) * 0.12;
  }

  function windAdjustment(wind) {
    if (wind === null || wind === undefined) return 0;
    return -(clampRange(wind, 0, 25) / 25) * 0.15;
  }

  function thermalVisualizationIndex(weather) {
    if (!weather || typeof weather.temperature !== "number") return null;
    var baseInput = weather.temperature;
    if (typeof weather.feelsLike === "number") {
      baseInput = weather.temperature * 0.6 + weather.feelsLike * 0.4;
    }
    var score = normalizeTemperature(baseInput)
      + humidityAdjustment(weather.humidity)
      + cloudAdjustment(weather.cloudCover)
      + windAdjustment(weather.windSpeed);
    score = clamp01(score);
    return { score: score, label: thermalLabel(score) };
  }

  function thermalLabel(score) {
    if (score < 0.18) return "Sangat Sejuk";
    if (score < 0.36) return "Sejuk";
    if (score < 0.52) return "Sedang";
    if (score < 0.68) return "Hangat";
    if (score < 0.84) return "Panas";
    return "Sangat Panas";
  }

  function humidityLabel(h) {
    if (h === null || h === undefined) return "Tidak tersedia";
    if (h < 50) return "Kering";
    if (h < 65) return "Nyaman";
    if (h < 80) return "Lembap";
    return "Sangat lembap";
  }

  function idwValue(lat, lon, points) {
    var num = 0;
    var den = 0;
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      var dLat = lat - p.lat;
      var dLon = lon - p.lon;
      var d2 = dLat * dLat + dLon * dLon;
      if (d2 < 1e-10) return p.value;
      var w = 1 / (d2 * d2 + 1e-9);
      num += p.value * w;
      den += w;
    }
    if (den === 0) return null;
    return num / den;
  }

  function buildGrid(points, bounds, cols, rows) {
    var grid = [];
    for (var r = 0; r < rows; r++) {
      var row = [];
      var lat = bounds.maxLat - (r / (rows - 1)) * (bounds.maxLat - bounds.minLat);
      for (var c = 0; c < cols; c++) {
        var lon = bounds.minLon + (c / (cols - 1)) * (bounds.maxLon - bounds.minLon);
        row.push(idwValue(lat, lon, points));
      }
      grid.push(row);
    }
    return grid;
  }

  var RAMP = [
    [79, 123, 92],
    [183, 222, 142],
    [232, 194, 91],
    [226, 145, 67],
    [214, 93, 69]
  ];

  function lerp(a, b, t) {
    return Math.round(a + (b - a) * t);
  }

  function valueToColor(t) {
    var x = clamp01(t) * (RAMP.length - 1);
    var i = Math.floor(x);
    if (i >= RAMP.length - 1) return RAMP[RAMP.length - 1].slice();
    var f = x - i;
    return [
      lerp(RAMP[i][0], RAMP[i + 1][0], f),
      lerp(RAMP[i][1], RAMP[i + 1][1], f),
      lerp(RAMP[i][2], RAMP[i + 1][2], f)
    ];
  }

  function renderGridToCanvas(canvas, grid) {
    var rows = grid.length;
    if (!rows) return;
    var cols = grid[0].length;
    canvas.width = cols;
    canvas.height = rows;
    var ctx = canvas.getContext("2d");
    var img = ctx.createImageData(cols, rows);
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var v = grid[r][c];
        var idx = (r * cols + c) * 4;
        if (v === null || v === undefined) {
          img.data[idx] = 0;
          img.data[idx + 1] = 0;
          img.data[idx + 2] = 0;
          img.data[idx + 3] = 0;
        } else {
          var col = valueToColor(v);
          img.data[idx] = col[0];
          img.data[idx + 1] = col[1];
          img.data[idx + 2] = col[2];
          img.data[idx + 3] = 150;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  function averageExposureAlongCoordinates(coords, points) {
    if (!coords || !coords.length || !points || !points.length) return null;
    var sum = 0;
    var count = 0;
    var step = Math.max(1, Math.floor(coords.length / 40));
    for (var i = 0; i < coords.length; i += step) {
      var pt = coords[i];
      var lat = Array.isArray(pt) ? pt[0] : pt.lat;
      var lon = Array.isArray(pt) ? pt[1] : pt.lng;
      var v = idwValue(lat, lon, points);
      if (v !== null && v !== undefined) {
        sum += v;
        count++;
      }
    }
    if (!count) return null;
    var avg = sum / count;
    return { score: avg, label: thermalLabel(avg) };
  }

  window.THERMA.thermalService = {
    thermalVisualizationIndex: thermalVisualizationIndex,
    thermalLabel: thermalLabel,
    humidityLabel: humidityLabel,
    idwValue: idwValue,
    buildGrid: buildGrid,
    valueToColor: valueToColor,
    renderGridToCanvas: renderGridToCanvas,
    averageExposureAlongCoordinates: averageExposureAlongCoordinates,
    BALI_BOUNDS: { minLat: -8.85, maxLat: -8.05, minLon: 114.35, maxLon: 115.75 }
  };
})();
