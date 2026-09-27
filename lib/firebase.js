/**
 * hdbongo — Firebase bootstrap (compat SDK).
 * Loaded after the firebase compat scripts and config.js, before app.js.
 */
(function () {
  window.HD = window.HD || {};

  var cfg = window.FIREBASE_CONFIG || {};
  var hasConfig = !!(cfg.apiKey && cfg.projectId);
  var app = null, auth = null, db = null, ready = false;

  if (hasConfig && window.firebase) {
    try {
      app = (firebase.apps && firebase.apps.length) ? firebase.app() : firebase.initializeApp(cfg);
      auth = firebase.auth();
      db = firebase.firestore();

      // Stay signed in across browser restarts and keep tabs in sync.
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function (e) {
        console.warn('Could not enable local session persistence:', e && e.message);
      });

      if (db.enablePersistence) {
        db.enablePersistence({ synchronizeTabs: true }).catch(function () { /* multi-tab or unsupported */ });
      }

      ready = true;
    } catch (e) {
      console.error('Firebase failed to initialise:', e);
    }
  } else if (!hasConfig) {
    console.warn('Firebase config is missing in config.js — accounts will not persist.');
  }

  window.HD.fb = { ready: ready, app: app, auth: auth, db: db };
})();
