(function () {
  function markActiveLinks(root) {
    var page = document.body.getAttribute("data-page") || "home";
    root.querySelectorAll("[data-nav-link]").forEach(function (link) {
      if (link.getAttribute("data-nav-link") === page) {
        link.classList.add("is-active");
      }
    });
  }

  function loadComponent(target, url, afterInit) {
    var slot = document.querySelector(target);
    if (!slot) return Promise.resolve();
    return fetch(url)
      .then(function (res) {
        return res.text();
      })
      .then(function (html) {
        slot.innerHTML = html;
        markActiveLinks(slot);
        if (typeof afterInit === "function") afterInit(slot);
      })
      .catch(function () {
        slot.innerHTML = "";
      });
  }

  window.SEJUKA = window.SEJUKA || {};
  window.SEJUKA.loadComponents = function () {
    // Cek apakah halaman saat ini ada di dalam folder 'pages'
    var isInPagesFolder = window.location.pathname.includes("/pages/");
    var basePath = isInPagesFolder ? "../components/" : "./components/";

    var navReady = loadComponent(
      "#navbar-slot",
      basePath + "navbar.html",
      function () {
        if (window.SEJUKA.initNavigation) window.SEJUKA.initNavigation();
      },
    );
    var footerReady = loadComponent("#footer-slot", basePath + "footer.html");
    return Promise.all([navReady, footerReady]);
  };
})();
