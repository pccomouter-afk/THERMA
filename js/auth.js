(function () {
  window.THERMA = window.THERMA || {};
  var store = window.THERMA.store;

  function simpleHash(text) {
    var h1 = 0xdeadbeef;
    var h2 = 0x41c6ce57;
    for (var i = 0; i < text.length; i++) {
      var ch = text.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(16) + (h1 >>> 0).toString(16);
  }

  function hashPassword(password) {
    var salted = "therma$" + password;
    if (window.crypto && window.crypto.subtle && window.isSecureContext !== false) {
      try {
        var bytes = new TextEncoder().encode(salted);
        return window.crypto.subtle.digest("SHA-256", bytes).then(function (buf) {
          var arr = Array.from(new Uint8Array(buf));
          return arr.map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
        }).catch(function () {
          return Promise.resolve("s2$" + simpleHash(salted));
        });
      } catch (e) {
        return Promise.resolve("s2$" + simpleHash(salted));
      }
    }
    return Promise.resolve("s2$" + simpleHash(salted));
  }

  function makeId() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function findByEmail(email) {
    var lowered = String(email || "").trim().toLowerCase();
    var users = store.getUsers();
    for (var i = 0; i < users.length; i++) {
      if (String(users[i].email || "").toLowerCase() === lowered) return users[i];
    }
    return null;
  }

  function publicUser(user) {
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      createdAt: user.createdAt,
      preferences: user.preferences || {}
    };
  }

  function currentUser() {
    var session = store.getSession();
    if (!session || !session.userId) return null;
    var users = store.getUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === session.userId) return publicUser(users[i]);
    }
    return null;
  }

  function register(input) {
    var name = String(input.name || "").trim();
    var email = String(input.email || "").trim();
    var password = String(input.password || "");
    var confirm = String(input.confirm || "");
    if (!name) return Promise.resolve({ ok: false, field: "name", message: "Nama wajib diisi." });
    if (!validEmail(email)) return Promise.resolve({ ok: false, field: "email", message: "Masukkan alamat email yang valid." });
    if (password.length < 8) return Promise.resolve({ ok: false, field: "password", message: "Kata sandi minimal 8 karakter." });
    if (password !== confirm) return Promise.resolve({ ok: false, field: "confirm", message: "Konfirmasi kata sandi tidak cocok." });
    if (findByEmail(email)) return Promise.resolve({ ok: false, field: "email", message: "Email ini sudah terdaftar. Silakan masuk." });
    return hashPassword(password).then(function (hash) {
      var user = {
        id: makeId(),
        name: name,
        email: email,
        passwordHash: hash,
        avatar: null,
        createdAt: new Date().toISOString(),
        preferences: { layer: "temperature", areaId: "denpasar" }
      };
      var users = store.getUsers();
      users.push(user);
      store.saveUsers(users);
      store.setSession({ userId: user.id, createdAt: new Date().toISOString() });
      store.authState.user = publicUser(user);
      store.userState.profile = publicUser(user);
      syncNavbar();
      return { ok: true, user: publicUser(user) };
    });
  }

  function login(email, password) {
    var cleanEmail = String(email || "").trim();
    if (!validEmail(cleanEmail)) return Promise.resolve({ ok: false, field: "email", message: "Masukkan alamat email yang valid." });
    if (!password) return Promise.resolve({ ok: false, field: "password", message: "Masukkan kata sandi." });
    var user = findByEmail(cleanEmail);
    if (!user) return Promise.resolve({ ok: false, field: "email", message: "Akun tidak ditemukan. Silakan daftar dulu." });
    return hashPassword(password).then(function (hash) {
      if (hash !== user.passwordHash) {
        return { ok: false, field: "password", message: "Kata sandi salah." };
      }
      store.setSession({ userId: user.id, createdAt: new Date().toISOString() });
      store.authState.user = publicUser(user);
      store.userState.profile = publicUser(user);
      syncNavbar();
      return { ok: true, user: publicUser(user) };
    });
  }

  function logout() {
    store.setSession(null);
    store.authState.user = null;
    store.userState.profile = null;
    syncNavbar();
  }

  function updateProfile(userId, patch) {
    var users = store.getUsers();
    var idx = -1;
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === userId) idx = i;
    }
    if (idx < 0) return { ok: false, message: "Pengguna tidak ditemukan." };
    var name = patch.name !== undefined ? String(patch.name).trim() : users[idx].name;
    var email = patch.email !== undefined ? String(patch.email).trim() : users[idx].email;
    if (!name) return { ok: false, field: "name", message: "Nama wajib diisi." };
    if (!validEmail(email)) return { ok: false, field: "email", message: "Masukkan alamat email yang valid." };
    var lowered = email.toLowerCase();
    for (var j = 0; j < users.length; j++) {
      if (j !== idx && String(users[j].email || "").toLowerCase() === lowered) {
        return { ok: false, field: "email", message: "Email ini sudah dipakai akun lain." };
      }
    }
    users[idx].name = name;
    users[idx].email = email;
    if (patch.avatar !== undefined) users[idx].avatar = patch.avatar;
    if (patch.preferences !== undefined) users[idx].preferences = patch.preferences;
    store.saveUsers(users);
    var pub = publicUser(users[idx]);
    store.authState.user = pub;
    store.userState.profile = pub;
    syncNavbar();
    return { ok: true, user: pub };
  }

  function initialLetter(name) {
    var t = String(name || "?").trim();
    return t ? t.charAt(0).toUpperCase() : "?";
  }

  function syncNavbar() {
    var user = currentUser();
    store.authState.user = user;
    document.querySelectorAll("[data-auth-guest]").forEach(function (el) {
      el.style.display = user ? "none" : "";
    });
    document.querySelectorAll("[data-auth-user]").forEach(function (el) {
      el.style.display = user ? "" : "none";
    });
    if (user) {
      document.querySelectorAll("[data-auth-name]").forEach(function (el) {
        el.textContent = user.name;
      });
      document.querySelectorAll("[data-auth-display]").forEach(function (el) {
        el.textContent = user.name;
      });
      document.querySelectorAll("[data-auth-sub]").forEach(function (el) {
        el.textContent = user.email;
      });
      document.querySelectorAll("[data-auth-avatar-fallback]").forEach(function (el) {
        el.textContent = initialLetter(user.name);
        el.style.display = user.avatar ? "none" : "";
      });
      document.querySelectorAll("[data-auth-avatar-img]").forEach(function (el) {
        if (user.avatar) {
          el.src = user.avatar;
          el.style.display = "";
        } else {
          el.removeAttribute("src");
          el.style.display = "none";
        }
      });
    }
  }

  window.THERMA.auth = {
    register: register,
    login: login,
    logout: logout,
    currentUser: currentUser,
    updateProfile: updateProfile,
    syncNavbar: syncNavbar,
    validEmail: validEmail
  };
})();
