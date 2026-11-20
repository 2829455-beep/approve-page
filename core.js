// Ядро страницы подтверждения. Те же правила, что signing/faceid/verify.py (Python — источник правды).
(function (root) {
  const enc = new TextEncoder();
  function b64u(buf) {
    let s = ""; new Uint8Array(buf).forEach(b => s += String.fromCharCode(b));
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function unb64u(s) {
    s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "=";
    return Uint8Array.from(atob(s), c => c.charCodeAt(0));
  }
  // Каноничный JSON: ключи по алфавиту, без пробелов, значения — только строки (как требует Python-сторона).
  function canonical(a) {
    const keys = Object.keys(a).sort(); const o = {};
    for (const k of keys) { if (typeof a[k] !== "string") throw new Error("значение «" + k + "» не строка"); o[k] = a[k]; }
    return JSON.stringify(o);
  }
  async function challenge(action, nonceB64u, expires) {
    const parts = [enc.encode(canonical(action)), new Uint8Array([0]), unb64u(nonceB64u), new Uint8Array([0]), enc.encode(String(expires))];
    const all = new Uint8Array(parts.reduce((n, p) => n + p.length, 0)); let i = 0;
    for (const p of parts) { all.set(p, i); i += p.length; }
    return new Uint8Array(await crypto.subtle.digest("SHA-256", all));
  }
  root.FaceId = { b64u, unb64u, canonical, challenge };
  if (typeof module !== "undefined") module.exports = root.FaceId;
})(typeof globalThis !== "undefined" ? globalThis : this);
