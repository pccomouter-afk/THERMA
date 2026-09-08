(function () {
  document.addEventListener("DOMContentLoaded", function () {
    function boot() {
      if (window.THERMA.initAnimations) window.THERMA.initAnimations();
      var page = document.body.getAttribute("data-page") || "home";
      if (page === "home" && window.THERMA.initHome) window.THERMA.initHome();
      if (page === "map" && window.THERMA.initThermalMap) window.THERMA.initThermalMap();
      if (page === "cool-route" && window.THERMA.initCoolRoutePage) window.THERMA.initCoolRoutePage();
      if (page === "action" && window.THERMA.initCoolingAction) window.THERMA.initCoolingAction();
      if (page === "data" && window.THERMA.initThermalData) window.THERMA.initThermalData();
      if (page === "login" && window.THERMA.initLogin) window.THERMA.initLogin();
      if (page === "register" && window.THERMA.initRegister) window.THERMA.initRegister();
      if (page === "profile" && window.THERMA.initProfile) window.THERMA.initProfile();
      if (page === "about" && window.THERMA.initAbout) window.THERMA.initAbout();
    }

    if (window.THERMA.loadComponents) {
      window.THERMA.loadComponents().then(boot).catch(boot);
    } else {
      boot();
    }

    document.querySelectorAll("[data-modal-close]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var layer = btn.closest(".modal-layer");
        if (layer) {
          layer.classList.remove("is-open");
          document.body.classList.remove("no-scroll");
        }
      });
    });

    document.querySelectorAll(".modal-backdrop").forEach(function (bg) {
      bg.addEventListener("click", function () {
        var layer = bg.closest(".modal-layer");
        if (layer) {
          layer.classList.remove("is-open");
          document.body.classList.remove("no-scroll");
        }
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-layer.is-open").forEach(function (layer) {
          layer.classList.remove("is-open");
        });
        document.body.classList.remove("no-scroll");
      }
    });
  });
})();
