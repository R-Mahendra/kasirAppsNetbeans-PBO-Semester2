// ========================================================================
// AUTH STATE - dipakai bersama oleh login.html & index.html
// Hanya berisi status login (localStorage + cookie), TIDAK ada validasi
// email/password di sini — itu ada di js/loginStyle.js (khusus halaman login).
// Harus di-load SETELAH js/cookieUtils.js (butuh setCookie/getCookie/deleteCookie).
// ========================================================================

const AUTH_KEY = "kasir_logged_in";
const AUTH_EMAIL_KEY = "kasir_user_email";

function isLoggedIn() {
  // Valid hanya kalau localStorage DAN cookie sama-sama menandakan login.
  // Konsisten dengan authGuard di main.js, supaya tidak ada celah
  // (misal localStorage ke-clear tapi cookie masih ada, atau sebaliknya).
  return localStorage.getItem(AUTH_KEY) === "true" && getCookie("kasir_auth") === "true";
}

function setLoggedIn(email) {
  localStorage.setItem(AUTH_KEY, "true");
  localStorage.setItem(AUTH_EMAIL_KEY, email);
  localStorage.setItem("kasir_login_time", Date.now().toString());

  setCookie("kasir_auth", "true", 1);
  setCookie("kasir_email", email, 1);
}

function clearLoggedIn() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_EMAIL_KEY);
  localStorage.removeItem("kasir_login_time");

  deleteCookie("kasir_auth");
  deleteCookie("kasir_email");
}