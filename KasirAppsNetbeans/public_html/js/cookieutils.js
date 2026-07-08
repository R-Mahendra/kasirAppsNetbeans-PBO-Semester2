// ========================================================================
// COOKIE UTILS - dipakai bersama oleh login.html & index.html
// Harus di-load PERTAMA (sebelum auth.js, loginStyle.js, main.js)
// ========================================================================

function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + date.toUTCString() + "; path=/";
}

function getCookie(name) {
  const cookieName = name + "=";
  const cookies = document.cookie.split(";");

  for (let c of cookies) {
    c = c.trim();
    if (c.indexOf(cookieName) === 0) {
      return decodeURIComponent(c.substring(cookieName.length));
    }
  }

  return null;
}

function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}