/**
 * hdbongo — the single account store.
 *
 * Every screen reads and writes the signed-in user's account through this file, so
 * plan / points / purchases / watch list / bonus downloads live on the account
 * (Firestore users/{uid}) instead of in this browser.
 *
 * While signed out, the watch list and unlocked titles are kept in a small guest
 * record and merged into the account on sign-in.
 *
 * Security: the browser may only change the fields in CLIENT_FIELDS, and
 * firestore.rules additionally forbids raising points, changing the package, or
 * re-setting the bonus downloads. Those are written by the server only.
 */
(function () {
  var GUEST_KEY = 'hdmoviezclub_guest';

  var DEFAULT_DATA = {
    plan: 'free', planExpiresAt: null, points: 0,
    purchased: [], cart: [], freeDownloadsRemaining: 0, payments: []
  };

  var CLIENT_FIELDS = ['name', 'email', 'cart', 'purchased', 'freeDownloadsRemaining', 'points', 'plan', 'planExpiresAt'];
  var WRITTEN_FIELDS = ['name', 'email', 'cart', 'purchased', 'freeDownloadsRemaining', 'points'];

  var listeners = [];
  var state = { user: null, uid: null, data: clone(DEFAULT_DATA), loaded: false };
  var unsubscribeDoc = null, pendingTimer = null, pendingWrite = null, planDirty = false;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function union(a, b) {
    var out = (a || []).slice();
    (b || []).forEach(function (v) { if (out.indexOf(v) === -1) out.push(v); });
    return out;
  }

  // ---------- guest record ----------
  function readGuest() {
    try { return JSON.parse(localStorage.getItem(GUEST_KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function writeGuest() {
    if (state.uid) return;
    try {
      localStorage.setItem(GUEST_KEY, JSON.stringify({ cart: state.data.cart || [], purchased: state.data.purchased || [] }));
    } catch (e) { /* storage disabled */ }
  }
  function clearGuest() { try { localStorage.removeItem(GUEST_KEY); } catch (e) { /* ignore */ } }

  // ---------- firebase handles ----------
  function auth() { return window.HD && window.HD.fb ? window.HD.fb.auth : null; }
  function db() { return window.HD && window.HD.fb ? window.HD.fb.db : null; }
  function docRef(uid) { return db().collection('users').doc(uid); }
  function serverTimestamp() { return firebase.firestore.FieldValue.serverTimestamp(); }

  // ---------- helpers ----------
  function mergeDefaults(data) {
    var d = clone(DEFAULT_DATA);
    Object.keys(data || {}).forEach(function (k) {
      if (data[k] !== undefined && data[k] !== null) d[k] = data[k];
    });
    if (!Array.isArray(d.purchased)) d.purchased = [];
    if (!Array.isArray(d.cart)) d.cart = [];
    if (!Array.isArray(d.payments)) d.payments = [];
    d.points = Number(d.points) || 0;
    d.freeDownloadsRemaining = Number(d.freeDownloadsRemaining) || 0;
    return d;
  }
  function snapshot() { return { user: state.user, uid: state.uid, data: state.data }; }
  function emit() {
    var s = snapshot();
    listeners.forEach(function (fn) {
      try { fn(s); } catch (e) { console.error('Account listener failed:', e); }
    });
  }
  function waitFor(check, timeoutMs) {
    return new Promise(function (resolve) {
      var started = Date.now();
      (function tick() {
        if (check() || Date.now() - started > timeoutMs) { resolve(); return; }
        setTimeout(tick, 120);
      })();
    });
  }

  // ---------- auth ----------
  function attachUser(user) {
    if (unsubscribeDoc) { unsubscribeDoc(); unsubscribeDoc = null; }
    planDirty = false;

    if (!user) {
      state.user = null; state.uid = null; state.loaded = false;
      var g = readGuest();
      state.data = mergeDefaults({ cart: g.cart || [], purchased: g.purchased || [] });
      emit();
      return Promise.resolve(snapshot());
    }

    state.user = user;
    state.uid = user.uid;
    return ensureAccount(user)
      .then(function () { attachDocListener(user.uid); })
      .catch(function (e) { console.error('Could not load the account:', e); emit(); });
  }

  function ensureAccount(user) {
    var ref = docRef(user.uid);
    return ref.get().then(function (snap) {
      if (snap.exists) return null;
      // First sign-in: create the account with safe defaults + the sign-up bonus.
      var fresh = clone(DEFAULT_DATA);
      fresh.name = user.displayName || (user.email || '').split('@')[0];
      fresh.email = user.email || '';
      fresh.freeDownloadsRemaining = 1;
      fresh.createdAt = serverTimestamp();
      fresh.updatedAt = serverTimestamp();
      return ref.set(fresh);
    }).then(function () { return mergeGuestIntoAccount(user.uid); });
  }

  function mergeGuestIntoAccount(uid) {
    var g = readGuest();
    var cart = g.cart || [], purchased = g.purchased || [];
    if (!cart.length && !purchased.length) return Promise.resolve();
    var ref = docRef(uid);
    return ref.get().then(function (snap) {
      var d = snap.exists ? snap.data() : {};
      return ref.set({
        cart: union(d.cart, cart),
        purchased: union(d.purchased, purchased),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }).then(function () {
      clearGuest();
      console.log('Watch list saved while signed out was merged into the account');
    });
  }

  function attachDocListener(uid) {
    unsubscribeDoc = docRef(uid).onSnapshot(function (snap) {
      if (!snap.exists) return;
      var first = !state.loaded;
      state.data = mergeDefaults(snap.data());
      state.loaded = true;
      if (first) console.log('Account loaded from Firestore');
      emit();
    }, function (err) { console.warn('Account live-sync error:', err && err.message); });
  }

  // ---------- writes ----------
  function payload() {
    var d = state.data, out = {};
    WRITTEN_FIELDS.forEach(function (k) { if (d[k] !== undefined) out[k] = d[k]; });
    // The package is server-owned; the browser only sends it for a self-downgrade to Bure.
    if (planDirty) { out.plan = d.plan; out.planExpiresAt = d.planExpiresAt || null; }
    out.updatedAt = serverTimestamp();
    return out;
  }
  function writeNow() {
    pendingTimer = null;
    if (!state.uid) return Promise.resolve(snapshot());
    pendingWrite = docRef(state.uid).set(payload(), { merge: true })
      .catch(function (err) { console.warn('Account save rejected:', err && err.message); })
      .then(function () { pendingWrite = null; return snapshot(); });
    return pendingWrite;
  }
  function scheduleWrite() {
    if (pendingTimer) clearTimeout(pendingTimer);
    pendingTimer = setTimeout(writeNow, 400);
  }

  // ---------- public API ----------
  var api = {
    ready: null,
    init: function () {
      if (api.ready) return api.ready;
      api.ready = new Promise(function (resolve) {
        var a = auth();
        if (!a) {
          var g = readGuest();
          state.data = mergeDefaults({ cart: g.cart || [], purchased: g.purchased || [] });
          emit(); resolve(snapshot()); return;
        }
        var settled = false;
        a.onAuthStateChanged(function (user) {
          attachUser(user).then(function () { if (!settled) { settled = true; resolve(snapshot()); } });
        }, function (err) {
          console.error('Auth state error:', err);
          if (!settled) { settled = true; resolve(snapshot()); }
        });
        setTimeout(function () { if (!settled) { settled = true; resolve(snapshot()); } }, 8000);
      });
      return api.ready;
    },
    onChange: function (fn) {
      if (typeof fn === 'function') listeners.push(fn);
      return function () { listeners = listeners.filter(function (l) { return l !== fn; }); };
    },
    /** Change account fields. plan/planExpiresAt are only honoured for a downgrade to 'free'. */
    update: function (patch) {
      Object.keys(patch || {}).forEach(function (k) {
        if (CLIENT_FIELDS.indexOf(k) === -1) return;
        if (k === 'plan' || k === 'planExpiresAt') {
          if (patch.plan !== undefined && patch.plan !== 'free') return;
          planDirty = true;
        }
        state.data[k] = patch[k];
      });
      emit();
      if (!state.uid) { writeGuest(); return Promise.resolve(snapshot()); }
      scheduleWrite();
      return api.flush();
    },
    /** Finish any pending save (before sign-out and when the tab closes). */
    flush: function () {
      if (!state.uid) { writeGuest(); return Promise.resolve(snapshot()); }
      if (pendingTimer) { clearTimeout(pendingTimer); return writeNow(); }
      return pendingWrite || Promise.resolve(snapshot());
    },
    /** Wait for a fresh sign-in to attach, so the first write cannot race the account load. */
    signInReady: function () {
      return api.ready.then(function () {
        return waitFor(function () { return !!state.uid && state.loaded; }, 5000).then(function () { return snapshot(); });
      });
    },
    /** Re-read the account (used after the server confirms a payment). */
    refresh: function () {
      if (!state.uid) return Promise.resolve(snapshot());
      return docRef(state.uid).get().then(function (snap) {
        if (snap.exists) { state.data = mergeDefaults(snap.data()); emit(); }
        return snapshot();
      });
    },
    signOut: function () {
      return api.flush()
        .then(function () { return auth() ? auth().signOut() : null; })
        .then(function () { console.log('Signed out — account saved'); })
        .catch(function (e) { console.warn('Sign-out problem:', e && e.message); });
    },
    guestData: function () {
      var g = readGuest();
      return { cart: g.cart || [], purchased: g.purchased || [] };
    },
    snapshot: snapshot,
    isSignedIn: function () { return !!state.uid; }
  };

  window.HDStore = api;

  // Belt and braces: save before the tab goes away.
  window.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') api.flush(); });
  window.addEventListener('pagehide', function () { api.flush(); });
})();
