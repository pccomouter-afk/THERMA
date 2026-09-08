(function () {
  window.THERMA = window.THERMA || {};

  function markActiveLinks(root) {
    var page = document.body.getAttribute("data-page") || "home";
    root.querySelectorAll("[data-nav-link]").forEach(function (link) {
      if (link.getAttribute("data-nav-link") === page) {
        link.classList.add("is-active");
      } else {
        link.classList.remove("is-active");
      }
    });
  }

  function loadComponent(target, url, afterInit) {
    var slot = document.querySelector(target);
    if (!slot) return Promise.resolve();
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("component_failed");
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

  window.THERMA.loadComponents = function () {
    var path = window.location.pathname;
    var normalized = path.replace(/\\/g, "/");
    var isInPagesFolder = normalized.indexOf("/pages/") !== -1;
    var basePath = isInPagesFolder ? "../components/" : "./components/";
    var navReady = loadComponent("#navbar-slot", basePath + "navbar.html", function () {
      if (window.THERMA.initNavigation) window.THERMA.initNavigation();
      if (window.THERMA.auth) window.THERMA.auth.syncNavbar();
    });
    var footerReady = loadComponent("#footer-slot", basePath + "footer.html");
    return Promise.all([navReady, footerReady]);
  };
})();
