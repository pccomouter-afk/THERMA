(function () {
  window.SEJUKA = window.SEJUKA || {};

  var RECOMMENDATIONS = {
    'too-hot': {
      priorities: [
        'Tingkatkan kanopi pohon di area pejalan kaki sisi barat.',
        'Buat area tunggu teduh dekat fasilitas publik.',
        'Ganti sebagian permukaan beton dengan material permeabel.'
      ],
      exposure: '-16%', shade: '+28%'
    },
    'low-tree': {
      priorities: [
        'Tanam pohon lokal berkanopi cepat di sepanjang koridor utama.',
        'Bentuk program adopsi pohon komunitas.',
        'Lindungi pohon dewasa yang ada saat pekerjaan konstruksi.'
      ],
      exposure: '-19%', shade: '+34%'
    },
    'lack-shade': {
      priorities: [
        'Pasang struktur peneduh di halte transit dan plaza.',
        'Perpanjang atap bangunan di sepanjang jalur pejalan kaki.',
        'Tambahkan titik istirahat teduh setiap 200 meter.'
      ],
      exposure: '-13%', shade: '+41%'
    },
    'concrete-area': {
      priorities: [
        'Ganti lahan beton yang tak terpakai dengan paving permeabel.',
        'Buat taman kecil di area beraspal yang berlebihan.',
        'Tambahkan lapisan reflektif pada permukaan beraspal luas.'
      ],
      exposure: '-11%', shade: '+9%'
    },
    'public-space': {
      priorities: [
        'Rancang ulang lahan tak terpakai menjadi plaza komunitas yang teduh.',
        'Tambahkan kelompok tempat duduk di bawah pohon yang ada.',
        'Tambahkan fitur air untuk meningkatkan kenyamanan.'
      ],
      exposure: '-9%', shade: '+22%'
    }
  };

  function renderRecommendation(root, key) {
    var data = RECOMMENDATIONS[key];
    var list = root.querySelector('[data-advisor-list]');
    var exposure = root.querySelector('[data-advisor-exposure]');
    var shade = root.querySelector('[data-advisor-shade]');
    if (list) {
      list.innerHTML = data.priorities.map(function (p, i) {
        return '<div class="priority-item"><div class="priority-num">Prioritas 0' + (i + 1) + '</div><div class="priority-text">' + p + '</div></div>';
      }).join('');
    }
    if (exposure) exposure.textContent = data.exposure;
    if (shade) shade.textContent = data.shade;
  }

  window.SEJUKA.initCommunity = function () {
    var roots = document.querySelectorAll('[data-advisor-root]');
    roots.forEach(function (root) {
      var chips = root.querySelectorAll('.issue-chip');
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (c) { c.classList.remove('is-selected'); });
          chip.classList.add('is-selected');
          renderRecommendation(root, chip.getAttribute('data-issue'));
        });
      });
      var first = root.querySelector('.issue-chip');
      if (first) {
        first.classList.add('is-selected');
        renderRecommendation(root, first.getAttribute('data-issue'));
      }
    });

    document.querySelectorAll('[data-modal-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-modal-open');
        var layer = document.getElementById(id);
        if (layer) {
          layer.classList.add('is-open');
          document.body.classList.add('no-scroll');
        }
      });
    });

    var reportForm = document.querySelector('[data-report-form]');
    if (reportForm) {
      reportForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var layer = reportForm.closest('.modal-layer');
        var submitState = reportForm.querySelector('[data-form-status]');
        if (submitState) submitState.textContent = 'Laporan terkirim. Terima kasih telah membantu menyejukkan lingkunganmu.';
        setTimeout(function () {
          if (layer) { layer.classList.remove('is-open'); document.body.classList.remove('no-scroll'); }
          reportForm.reset();
          if (submitState) submitState.textContent = '';
        }, 1600);
      });
    }

    var statusFilters = document.querySelectorAll('[data-status-filter]');
    if (statusFilters.length) {
      statusFilters.forEach(function (btn) {
        btn.addEventListener('click', function () {
          statusFilters.forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
          var status = btn.getAttribute('data-status-filter');
          document.querySelectorAll('[data-report-status]').forEach(function (card) {
            var match = status === 'all' || card.getAttribute('data-report-status') === status;
            card.style.display = match ? '' : 'none';
          });
        });
      });
    }
  };
})();
