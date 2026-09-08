(function () {
  window.THERMA = window.THERMA || {};

  function clearErrors(root) {
    root.querySelectorAll("[data-err]").forEach(function (el) { el.textContent = ""; });
    root.querySelectorAll(".is-invalid").forEach(function (el) { el.classList.remove("is-invalid"); });
  }

  function setFieldError(root, field, message, inputId) {
    var err = root.querySelector('[data-err="' + field + '"]');
    if (err) err.textContent = message || "";
    if (inputId) {
      var input = root.querySelector("#" + inputId);
      if (input) input.classList.add("is-invalid");
    }
  }

  function setStatus(root, message, isSuccess) {
    var el = root.querySelector("[data-form-status]");
    if (!el) return;
    el.textContent = message || "";
    el.classList.toggle("is-success", !!isSuccess);
    el.classList.toggle("is-error", !!message && !isSuccess);
  }

  function setLoading(btn, loading) {
    if (!btn) return;
    btn.classList.toggle("is-loading", loading);
    if (loading) btn.setAttribute("disabled", "disabled");
    else btn.removeAttribute("disabled");
  }

  window.THERMA.initLogin = function () {
    if (window.THERMA.auth.currentUser()) {
      window.location.href = "/pages/profile.html";
      return;
    }
    var form = document.querySelector("[data-login-form]");
    if (!form) return;
    var submitBtn = form.querySelector("[data-submit]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors(form);
      var email = form.querySelector("#login-email").value;
      var password = form.querySelector("#login-password").value;
      setLoading(submitBtn, true);
      setStatus(form, "Memeriksa akun…");
      window.THERMA.auth.login(email, password).then(function (res) {
        setLoading(submitBtn, false);
        if (!res.ok) {
          setFieldError(form, res.field || "email", res.message, res.field === "password" ? "login-password" : "login-email");
          setStatus(form, res.message);
          return;
        }
        setStatus(form, "Berhasil masuk. Mengalihkan…", true);
        setTimeout(function () { window.location.href = "/pages/profile.html"; }, 600);
      });
    });
  };

  window.THERMA.initRegister = function () {
    if (window.THERMA.auth.currentUser()) {
      window.location.href = "/pages/profile.html";
      return;
    }
    var form = document.querySelector("[data-register-form]");
    if (!form) return;
    var submitBtn = form.querySelector("[data-submit]");
    var inputIds = { name: "reg-name", email: "reg-email", password: "reg-password", confirm: "reg-confirm" };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors(form);
      var payload = {
        name: form.querySelector("#reg-name").value,
        email: form.querySelector("#reg-email").value,
        password: form.querySelector("#reg-password").value,
        confirm: form.querySelector("#reg-confirm").value
      };
      setLoading(submitBtn, true);
      setStatus(form, "Menyimpan akun…");
      window.THERMA.auth.register(payload).then(function (res) {
        setLoading(submitBtn, false);
        if (!res.ok) {
          setFieldError(form, res.field || "name", res.message, inputIds[res.field] || "reg-name");
          setStatus(form, res.message);
          return;
        }
        setStatus(form, "Akun berhasil dibuat. Mengalihkan…", true);
        setTimeout(function () { window.location.href = "/pages/profile.html"; }, 600);
      });
    });
  };
})();
