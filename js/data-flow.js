(function () {
  window.SEJUKA = window.SEJUKA || {};

  var STEPS = [
    { name: 'Sensor Node', desc: 'Membaca suhu, kelembapan, dan cahaya di lapangan', icon: 'bx bxs-chip' },
    { name: 'ESP32', desc: 'Mengolah pembacaan sensor secara lokal', icon: 'bx bx-cog' },
    { name: 'LoRa', desc: 'Mengirim data jarak jauh dengan daya rendah', icon: 'bx bx-broadcast' },
    { name: 'LoRa Gateway', desc: 'Mengumpulkan sinyal dari banyak node', icon: 'bx bx-map' },
    { name: 'Internet', desc: 'Meneruskan data terkumpul ke server', icon: 'bx bx-globe' },
    { name: 'Cloud Server', desc: 'Menyimpan data lingkungan secara terpusat', icon: 'bx bx-cloud' },
    { name: 'Analisis Data', desc: 'Mengolah data menjadi indeks panas', icon: 'bx bx-line-chart' },
    { name: 'Heat Map SEJUKA', desc: 'Menyajikan hasil sebagai peta panas', icon: 'bx bxs-map-alt' }
  ];

  function buildTrack() {
    var out = '';
    STEPS.forEach(function (step, i) {
      out += '<div class="sejuka-dataflow-step">' +
        '<div class="sejuka-dataflow-step-icon"><i class="' + step.icon + '"></i></div>' +
        '<div class="sejuka-dataflow-step-name">' + step.name + '</div>' +
        '<div class="sejuka-dataflow-step-desc">' + step.desc + '</div>' +
        '</div>';
      if (i < STEPS.length - 1) {
        out += '<div class="sejuka-dataflow-connector"><i class="bx bx-right-arrow-alt"></i></div>';
      }
    });
    return out;
  }

  function initReveal(root) {
    var targets = root.querySelectorAll('.sejuka-dataflow-step, .sejuka-dataflow-connector');
    if (!('IntersectionObserver' in window) || targets.length === 0) {
      targets.forEach(function (t) { t.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var index = Array.prototype.indexOf.call(targets, el);
          setTimeout(function () { el.classList.add('is-visible'); }, index * 90);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (t) { observer.observe(t); });
  }

  window.SEJUKA.initDataFlow = function () {
    var roots = document.querySelectorAll('[data-sejuka-dataflow-root]');
    if (roots.length === 0) return;
    roots.forEach(function (root) {
      var track = root.querySelector('[data-sejuka-dataflow-track]');
      if (!track) return;
      track.innerHTML = buildTrack();
      initReveal(root);
    });
  };
})();
