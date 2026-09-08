(function () {
  window.SEJUKA = window.SEJUKA || {};

  window.SEJUKA.initForum = function () {
    var list = document.querySelector('[data-forum-list]');
    if (!list) return;
    var searchInput = document.querySelector('[data-forum-search]');
    var filterTags = document.querySelectorAll('[data-forum-filter]');
    var activeCategory = 'all';

    function applyFilters() {
      var query = (searchInput ? searchInput.value : '').trim().toLowerCase();
      list.querySelectorAll('.thread-card').forEach(function (card) {
        var category = card.getAttribute('data-category');
        var title = card.getAttribute('data-title') || '';
        var matchesCategory = activeCategory === 'all' || category === activeCategory;
        var matchesQuery = title.toLowerCase().indexOf(query) !== -1;
        card.style.display = (matchesCategory && matchesQuery) ? '' : 'none';
      });
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);

    filterTags.forEach(function (tag) {
      tag.addEventListener('click', function () {
        filterTags.forEach(function (t) { t.classList.remove('is-active'); });
        tag.classList.add('is-active');
        activeCategory = tag.getAttribute('data-forum-filter');
        applyFilters();
      });
    });
  };
})();
