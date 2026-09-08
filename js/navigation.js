(function () {
  window.THERMA = window.THERMA || {};

  function initScrollState() {
    var navBar = document.querySelector(".nav-bar");
    if (!navBar) return;
    var onScroll = function () {
      if (window.scrollY > 24) {
        navBar.classList.add("is-scrolled");
      } else {
        navBar.classList.remove("is-scrolled");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initDrawer() {
    var drawer = document.querySelector("[data-drawer]");
    var backdrop = document.querySelector("[data-drawer-backdrop]");
    var openers = document.querySelectorAll("[data-drawer-open]");
    var closers = document.querySelectorAll("[data-drawer-close]");
    if (!drawer) return;

    function open() {
      drawer.classList.add("is-open");
      if (backdrop) backdrop.classList.add("is-open");
      document.body.classList.add("no-scroll");
      openers.forEach(function (b) { b.setAttribute("aria-expanded", "true"); });
    }

    function close() {
      drawer.classList.remove("is-open");
      if (backdrop) backdrop.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
      openers.forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    }

    openers.forEach(function (b) {
      b.addEventListener("click", function () {
        if (drawer.classList.contains("is-open")) close();
        else open();
      });
    });
    closers.forEach(function (b) { b.addEventListener("click", close); });
    if (backdrop) backdrop.addEventListener("click", close);
    drawer.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) close();
    });
  }

  function initLogoutButtons() {
    document.querySelectorAll("[data-logout]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (window.THERMA.auth) window.THERMA.auth.logout();
        window.location.href = "/index.html";
      });
    });
  }

  function initBottomNavSpacing() {
    if (window.matchMedia("(max-width: 860px)").matches) {
      document.body.classList.add("has-bottom-nav");
    } else {
      document.body.classList.remove("has-bottom-nav");
    }
  }

  window.THERMA.initNavigation = function () {
    initScrollState();
    initDrawer();
    initLogoutButtons();
    initBottomNavSpacing();
    window.addEventListener("resize", initBottomNavSpacing);
  };
})();
