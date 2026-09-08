(function () {
  window.THERMA = window.THERMA || {};

  function formatDate(iso) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) {
      return "";
    }
  }

  function initialLetter(name) {
    var t = String(name || "?").trim();
    return t ? t.charAt(0).toUpperCase() : "?";
  }

  window.THERMA.initProfile = function () {
    var user = window.THERMA.auth.currentUser();
    if (!user) {
      window.location.href = "/pages/login.html";
      return;
    }
    var store = window.THERMA.store;

    function paintHeader(u) {
      var nameEl = document.querySelector("[data-profile-name]");
      var emailEl = document.querySelector("[data-profile-email]");
      var joinedEl = document.querySelector("[data-profile-joined]");
      var avatarBox = document.querySelector("[data-profile-avatar]");
      if (nameEl) nameEl.textContent = u.name;
      if (emailEl) emailEl.textContent = u.email;
      if (joinedEl) joinedEl.textContent = "Bergabung " + formatDate(u.createdAt);
      if (avatarBox) {
        avatarBox.innerHTML = u.avatar
          ? '<img src="' + u.avatar + '" alt="Foto profil ' + u.name.replace(/"/g, "") + '">'
          : '<span class="profile-avatar-fallback">' + initialLetter(u.name) + "</span>";
      }
    }

    paintHeader(user);

    var nameInput = document.querySelector("#profile-name-input");
    var emailInput = document.querySelector("#profile-email-input");
    if (nameInput) nameInput.value = user.name;
    if (emailInput) emailInput.value = user.email;

    var prefLayer = document.querySelector("[data-pref-layer]");
    var prefArea = document.querySelector("[data-pref-area]");
    var prefs = store.getPreferences();
    if (prefArea) {
      prefArea.innerHTML = store.BALI_AREAS.map(function (a) {
        return '<option value="' + a.id + '">' + a.name + "</option>";
      }).join("");
      prefArea.value = (user.preferences && user.preferences.areaId) || prefs.areaId || "denpasar";
    }
    if (prefLayer) {
      prefLayer.value = (user.preferences && user.preferences.layer) || prefs.layer || "temperature";
    }

    function persistPrefs() {
      var patch = {
        preferences: {
          layer: prefLayer ? prefLayer.value : "temperature",
          areaId: prefArea ? prefArea.value : "denpasar"
        }
      };
      var res = window.THERMA.auth.updateProfile(user.id, patch);
      if (res.ok) {
        user = res.user;
        store.setPreferences(patch.preferences);
      }
    }
    if (prefLayer) prefLayer.addEventListener("change", persistPrefs);
    if (prefArea) prefArea.addEventListener("change", persistPrefs);

    var form = document.querySelector("[data-profile-form]");
    if (form) {
      var submitBtn = form.querySelector("[data-submit]");
      var statusEl = form.querySelector("[data-form-status]");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        form.querySelectorAll("[data-err]").forEach(function (el) { el.textContent = ""; });
        if (submitBtn) submitBtn.classList.add("is-loading");
        if (statusEl) statusEl.textContent = "Menyimpan…";
        setTimeout(function () {
          var res = window.THERMA.auth.updateProfile(user.id, {
            name: nameInput.value,
            email: emailInput.value
          });
          if (submitBtn) submitBtn.classList.remove("is-loading");
          if (!res.ok) {
            var errEl = form.querySelector('[data-err="' + (res.field || "name") + '"]');
            if (errEl) errEl.textContent = res.message;
            if (statusEl) {
              statusEl.textContent = res.message;
              statusEl.classList.add("is-error");
              statusEl.classList.remove("is-success");
            }
            return;
          }
          user = res.user;
          paintHeader(user);
          if (statusEl) {
            statusEl.textContent = "Perubahan tersimpan.";
            statusEl.classList.add("is-success");
            statusEl.classList.remove("is-error");
          }
        }, 350);
      });
    }

    var avatarInput = document.querySelector("[data-avatar-input]");
    var avatarStatus = document.querySelector("[data-avatar-status]");
    if (avatarInput) {
      avatarInput.addEventListener("change", function () {
        var file = avatarInput.files && avatarInput.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
          if (avatarStatus) avatarStatus.textContent = "Ukuran foto maksimal 2 MB.";
          return;
        }
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var img = new Image();
            img.onload = function () {
              var maxSide = 256;
              var scale = Math.min(1, maxSide / Math.max(img.width, img.height));
              var canvas = document.createElement("canvas");
              canvas.width = Math.round(img.width * scale);
              canvas.height = Math.round(img.height * scale);
              canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
              var dataUrl = canvas.toDataURL("image/jpeg", 0.82);
              var res = window.THERMA.auth.updateProfile(user.id, { avatar: dataUrl });
              if (res.ok) {
                user = res.user;
                paintHeader(user);
                if (avatarStatus) avatarStatus.textContent = "Foto profil diperbarui.";
              } else if (avatarStatus) {
                avatarStatus.textContent = res.message;
              }
            };
            img.src = reader.result;
          } catch (e) {
            if (avatarStatus) avatarStatus.textContent = "Foto tidak dapat diproses.";
          }
        };
        reader.readAsDataURL(file);
      });
    }

    var removeBtn = document.querySelector("[data-avatar-remove]");
    if (removeBtn) {
      removeBtn.addEventListener("click", function () {
        var res = window.THERMA.auth.updateProfile(user.id, { avatar: null });
        if (res.ok) {
          user = res.user;
          paintHeader(user);
          if (avatarStatus) avatarStatus.textContent = "Foto profil dihapus.";
        }
      });
    }
  };
})();
