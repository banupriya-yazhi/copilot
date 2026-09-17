// Demo session, shared by the login page and the dashboard.
//
// This is NOT authentication — it is a client-side marker that says "the
// sign-in form was completed in this browser." Anyone can set it from the
// console. It exists so the pages hang together; replace it with a real
// server-issued session when there is a backend.
window.Session = (function () {
  'use strict';

  var KEY = 'demo-session';

  // "Remember me" picks the store: localStorage survives closing the browser,
  // sessionStorage lasts only for the tab.
  function stores() {
    var found = [];
    try { found.push(window.localStorage); } catch (e) { /* blocked */ }
    try { found.push(window.sessionStorage); } catch (e) { /* blocked */ }
    return found;
  }

  function start(email, remember) {
    var value = JSON.stringify({ email: email, at: Date.now() });
    try {
      (remember ? window.localStorage : window.sessionStorage).setItem(KEY, value);
      return true;
    } catch (e) {
      return false; // private mode, or storage is full
    }
  }

  function current() {
    var found = stores();
    for (var i = 0; i < found.length; i++) {
      var raw = null;
      try { raw = found[i].getItem(KEY); } catch (e) { continue; }
      if (!raw) continue;
      try {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.email) return parsed;
      } catch (e) {
        try { found[i].removeItem(KEY); } catch (e2) { /* ignore */ }
      }
    }
    return null;
  }

  // Clear both stores — the session could be in either one.
  function end() {
    stores().forEach(function (store) {
      try { store.removeItem(KEY); } catch (e) { /* ignore */ }
    });
  }

  return { start: start, current: current, end: end };
})();
