(function () {
  var canvas = document.getElementById('net');
  if (!canvas) return;

  var container = canvas.parentElement;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, DPR = 1;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var NODE_COUNT = 26;
  var MAX_DIST = 140;
  var MOUSE_RADIUS = 130;

  var nodes = [];
  var mouse = { x: -9999, y: -9999, active: false };
  var rafId = null;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resize() {
    var rect = container.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width;
    H = rect.height;
    canvas.width = Math.max(1, Math.round(W * DPR));
    canvas.height = Math.max(1, Math.round(H * DPR));
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function createNodes() {
    nodes.length = 0;
    for (var i = 0; i < NODE_COUNT; i++) {
      var isHot = Math.random() < 0.16;
      nodes.push({
        x: rand(0, W),
        y: rand(0, H),
        vx: rand(-0.12, 0.12),
        vy: rand(-0.12, 0.12),
        r: isHot ? rand(2.2, 3.2) : rand(1.4, 2.4),
        pulse: rand(0, Math.PI * 2),
        pulseSpeed: rand(0.008, 0.02),
        hot: isHot
      });
    }
  }

  function colorGreen(alpha) {
    return 'rgba(183, 222, 142, ' + alpha + ')';
  }

  function colorOrange(alpha) {
    return 'rgba(226, 145, 67, ' + alpha + ')';
  }

  container.addEventListener('mousemove', function (e) {
    var rect = container.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });

  container.addEventListener('mouseleave', function () {
    mouse.active = false;
  });

  function step() {
    if (W === 0 || H === 0) {
      rafId = requestAnimationFrame(step);
      return;
    }

    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += n.pulseSpeed;

      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;

      if (mouse.active) {
        var dx = mouse.x - n.x;
        var dy = mouse.y - n.y;
        var dist = Math.hypot(dx, dy);
        if (dist < MOUSE_RADIUS) {
          var force = (1 - dist / MOUSE_RADIUS) * 0.015;
          n.x -= dx * force;
          n.y -= dy * force;
        }
      }
    }

    for (var a = 0; a < nodes.length; a++) {
      for (var b = a + 1; b < nodes.length; b++) {
        var na = nodes[a], nb = nodes[b];
        var ddx = na.x - nb.x, ddy = na.y - nb.y;
        var d = Math.hypot(ddx, ddy);
        if (d < MAX_DIST) {
          var alpha = (1 - d / MAX_DIST) * 0.3;
          ctx.strokeStyle = colorGreen(alpha);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(nb.x, nb.y);
          ctx.stroke();
        }
      }

      if (mouse.active) {
        var na2 = nodes[a];
        var mdx = na2.x - mouse.x, mdy = na2.y - mouse.y;
        var mdist = Math.hypot(mdx, mdy);
        if (mdist < MOUSE_RADIUS) {
          var malpha = (1 - mdist / MOUSE_RADIUS) * 0.45;
          ctx.strokeStyle = colorGreen(malpha);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(na2.x, na2.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    for (var k = 0; k < nodes.length; k++) {
      var nd = nodes[k];
      var pulseFactor = (Math.sin(nd.pulse) + 1) / 2;
      var baseColor = nd.hot ? colorOrange : colorGreen;
      var glowR = nd.r * (2.2 + pulseFactor * 1.4);

      var grad = ctx.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, glowR);
      grad.addColorStop(0, baseColor(0.5 + pulseFactor * 0.2));
      grad.addColorStop(1, baseColor(0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(nd.x, nd.y, glowR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = nd.hot ? '#e29143' : '#b7de8e';
      ctx.beginPath();
      ctx.arc(nd.x, nd.y, nd.r, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(step);
  }

  function init() {
    resize();
    createNodes();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(step);
  }

  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function () {
      resize();
    });
    ro.observe(container);
  } else {
    window.addEventListener('resize', resize);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
