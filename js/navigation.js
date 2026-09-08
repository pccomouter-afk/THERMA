(function () {
  window.SEJUKA = window.SEJUKA || {};

  window.SEJUKA.initNavigation = function () {
    var navBar = document.querySelector('.nav-bar');
    var burger = document.querySelector('.nav-burger');
    var mobileMenu = document.querySelector('.mobile-menu');

    if (navBar) {
      var onScroll = function () {
        if (window.scrollY > 24) {
          navBar.classList.add('is-scrolled');
        } else {
          navBar.classList.remove('is-scrolled');
        }
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (burger && mobileMenu) {
      burger.addEventListener('click', function () {
        var isOpen = mobileMenu.classList.toggle('is-open');
        burger.querySelector('i').setAttribute('class', isOpen ? 'bx bx-x' : 'bx bx-menu');
        burger.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('no-scroll', isOpen);
      });

      mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          mobileMenu.classList.remove('is-open');
          burger.querySelector('i').setAttribute('class', 'bx bx-menu');
          document.body.classList.remove('no-scroll');
        });
      });
    }
  };
})();
