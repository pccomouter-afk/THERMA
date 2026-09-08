(function () {
  window.THERMA = window.THERMA || {};

  var INTERVENTIONS = [
    { id: "canopy", name: "Kanopi pohon", desc: "Pohon peneduh di koridor utama", icon: "fa-solid fa-tree", relief: 0.16 },
    { id: "walkway", name: "Jalur teduh", desc: "Struktur peneduh di titik tunggu", icon: "fa-solid fa-person-walking", relief: 0.11 },
    { id: "green", name: "Ruang hijau", desc: "Alih fungsi permukaan keras", icon: "fa-solid fa-seedling", relief: 0.13 },
    { id: "cool", name: "Permukaan sejuk", desc: "Material reflektif terang", icon: "fa-solid fa-sun", relief: 0.08 },
    { id: "open", name: "Ruang terbuka", desc: "Plaza teduh dengan sirkulasi udara", icon: "fa-solid fa-arrows-up-down-left-right", relief: 0.06 }
  ];

  function setCondition(html) {
    var el = document.querySelector("[data-action-condition]");
    if (el) el.innerHTML = html;
  }

  function setOutput(html) {
    var el = document.querySelector("[data-action-output]");
    if (el) el.innerHTML = html;
  }

  function renderInterventions(active, onToggle) {
    var wrap = document.querySelector("[data-interventions]");
    if (!wrap) return;
    wrap.innerHTML = "";
    INTERVENTIONS.forEach(function (iv) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "intervention-card" + (active[iv.id] ? " is-on" : "");
      b.setAttribute("aria-pressed", active[iv.id] ? "true" : "false");
      b.innerHTML = '<i class="' + iv.icon + '" aria-hidden="true"></i><strong>' + iv.name + "</strong><span>" + iv.desc + "</span>";
      b.addEventListener("click", function () { onToggle(iv.id); });
      wrap.appendChild(b);
    });
  }

  window.THERMA.initCoolingAction = function () {
    var store = window.THERMA.store;
    var select = document.querySelector("[data-action-area]");
    var active = {};
    var currentScore = null;
    var currentLabel = "";
    var currentTemp = null;

    if (select) {
      select.innerHTML = store.BALI_AREAS.map(function (a) {
        return '<option value="' + a.id + '">' + a.name + "</option>";
      }).join("");
      var prefs = store.getPreferences();
      if (prefs.areaId && store.findAreaById(prefs.areaId)) select.value = prefs.areaId;
    }

    function compute() {
      if (currentScore === null) {
        setOutput('<div class="state-box"><p>Data kondisi area belum tersedia.</p></div>');
        return;
      }
      var relief = 0;
      INTERVENTIONS.forEach(function (iv) {
        if (active[iv.id]) relief += iv.relief;
      });
      if (relief > 0.45) relief = 0.45;
      var simScore = Math.max(0, currentScore - relief);
      var simLabel = window.THERMA.thermalService.thermalLabel(simScore);
      var pct = currentScore > 0 ? Math.round((relief / currentScore) * 100) : 0;
      var chosen = INTERVENTIONS.filter(function (iv) { return active[iv.id]; });
      setOutput(
        '<div class="sim-compare" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
        + '<div class="hero-live-cell"><div class="k">Indeks visual saat ini</div><div class="v">' + currentScore.toFixed(2).replace(".", ",") + " · " + currentLabel + "</div></div>"
        + '<div class="hero-live-cell"><div class="k">Estimasi simulasi</div><div class="v">' + simScore.toFixed(2).replace(".", ",") + " · " + simLabel + "</div></div>"
        + "</div>"
        + '<div class="stat-row"><span>Intervensi aktif</span><span>' + (chosen.length ? chosen.map(function (c) { return c.name; }).join(", ") : "Belum ada") + "</span></div>"
        + '<div class="stat-row"><span>Potensi perubahan indeks</span><span>-'
        + pct
        + '% (estimasi)</span></div>'
        + '<p class="caption">Estimasi simulasi untuk ' + currentLabel.toLowerCase() + " menjadi " + simLabel.toLowerCase() + " bila intervensi diterapkan. Bukan janji penurunan suhu lapangan.</p>"
      );
    }

    function toggle(id) {
      active[id] = !active[id];
      renderInterventions(active, toggle);
      compute();
    }

    function loadArea(id) {
      var area = store.findAreaById(id);
      if (!area) return;
      store.setPreferences({ areaId: id });
      currentScore = null;
      setCondition('<div class="state-box"><p>Memuat kondisi ' + area.name + '…</p></div>');
      setOutput('<div class="state-box"><p>Menyiapkan simulasi…</p></div>');
      window.THERMA.weatherService.getCurrentWeather(area.lat, area.lon).then(function (r) {
        var w = r.data;
        var t = window.THERMA.thermalService.thermalVisualizationIndex(w);
        currentScore = t ? t.score : null;
        currentLabel = t ? t.label : "Tidak tersedia";
        currentTemp = w.temperature;
        setCondition(
          "<h3 class=\"h-card\">" + area.name + "</h3>"
          + '<div class="detail-temp">' + w.temperature.toFixed(1).replace(".", ",") + "°C</div>"
          + '<div class="stat-row"><span>Status termal</span><span>' + currentLabel + "</span></div>"
          + '<div class="stat-row"><span>Terasa seperti</span><span>' + (w.feelsLike !== null ? w.feelsLike.toFixed(1).replace(".", ",") + "°C" : "Tidak tersedia") + "</span></div>"
          + '<div class="stat-row"><span>Kelembapan</span><span>' + (w.humidity !== null ? w.humidity + "%" : "Tidak tersedia") + "</span></div>"
          + '<p class="caption">Estimasi kondisi termal berbasis data cuaca aktual.</p>'
        );
        compute();
      }).catch(function () {
        setCondition('<div class="state-box"><p>Data sementara tidak tersedia untuk ' + area.name + ".</p></div>");
        setOutput('<div class="state-box"><p>Simulasi menunggu data aktual.</p></div>');
      });
    }

    renderInterventions(active, toggle);
    if (select) {
      select.addEventListener("change", function () { loadArea(select.value); });
      loadArea(select.value);
    }
  };
})();
