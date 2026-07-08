// ========================================================================
// LOGIN PAGE LOGIC - SIMULASI LOGIN PAKAI LOCALSTORAGE (TANPA BACKEND)
// ========================================================================
// PERHATIAN:
// Ini BUKAN auth yang aman. Email & password TIDAK divalidasi ke server
// manapun. Siapapun bisa buka DevTools > Application > Local Storage dan
// mengubah "kasir_logged_in" jadi true tanpa login sama sekali.
// Cocok untuk demo/prototype/local-only, JANGAN dipakai untuk data nyata.
//
// File ini HANYA berisi logic khusus halaman login (validasi form, UI,
// animasi). Fungsi cookie (setCookie/getCookie/deleteCookie) ada di
// js/cookieUtils.js, dan fungsi status login (isLoggedIn/setLoggedIn/
// clearLoggedIn) ada di js/auth.js. Pastikan kedua file itu di-load
// SEBELUM file ini di login.html.
// ========================================================================

const VALID_EMAIL = "zhaenx@yeswehack.ninja";
const VALID_PASSWORD = "zh43nx";

// Kalau sudah "login" sebelumnya, langsung lempar ke index
document.addEventListener("DOMContentLoaded", () => {
  if (isLoggedIn()) {
    window.location.href = "index.html";
  }
});

// ===================================== FORM LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showLoginError("Email dan password harus diisi");
      return;
    }

    if (email.toLowerCase() !== VALID_EMAIL.toLowerCase() || password !== VALID_PASSWORD) {
      showLoginError("Email atau password salah");
      return;
    }

    // Login berhasil -> kasih loading state sebentar di tombol, lalu redirect.
    // (catatan keamanan ada di komentar paling atas file ini)
    const btn = document.getElementById("zx__SubmitLogin");
    if (btn) {
      btn.innerHTML = '<span class="spinner-border spinner-border-md"></span>';
      btn.disabled = true;
    }

    setLoggedIn(email);

    setTimeout(() => {
      window.location.href = "index.html";
    }, 800);
  });
}

function showLoginError(message) {
  const alertBox = document.getElementById("alertlogin");
  const alertText = document.getElementById("loginErrorText");
  if (!alertBox || !alertText) return;

  alertText.textContent = message;
  alertBox.classList.remove("d-none");

  setTimeout(() => {
    alertBox.classList.add("d-none");
  }, 3000);
}

// ===================================== TOGGLE LOGIN <-> SIGNUP PANEL
const Section = document.getElementById("zx__container");
const LinkDaftar = document.getElementById("LinkToRegis");
const LinkLogin = document.getElementById("LinkToLogin");

LinkDaftar.onclick = () => {
  Section.classList.add("zx__Animate");
};

LinkLogin.onclick = () => {
  Section.classList.remove("zx__Animate");
};

document.addEventListener("DOMContentLoaded", () => {
  const quotes = [
    "Hidup ini seperti sepeda, untuk tetap seimbang, kita harus terus bergerak.",
    "Pergi ke tempat yang belum pernah Anda kunjungi setidaknya sekali dalam hidup Anda.",
    "Hidup bukanlah tentang menunggu badai berlalu, tetapi tentang belajar bagaimana berdansa di hujan.",
    "Jangan hanya menjadi pengikut jejak orang lain; buatlah jejak Anda sendiri.",
    "Jangan takut gagal. Takutlah untuk tidak mencoba.",
    "Hidup adalah tentang membuat keputusan. Berani mengambil risiko dan tidak pernah menyesalinya.",
    "Ketika Anda berhenti bermimpi, Anda berhenti hidup.",
    "Ketika semuanya tampak gelap, ingatlah bahwa itu adalah hanya malam sebelum fajar.",
  ];

  let index = 0;
  const quoteText = document.querySelectorAll(".quoteText");

  function updateQuotes() {
    quoteText.forEach((el) => {
      el.innerText = quotes[index];
    });
    index = (index + 1) % quotes.length;
  }

  updateQuotes();
  setInterval(updateQuotes, 4000);
});

window.addEventListener("DOMContentLoaded", () => {
  function toggleMobileAlert() {
    const alertEl = document.getElementById("mobileAlert");
    const parent = document.getElementById("parentMobileAlert");
    if (!alertEl || !parent) return; // antisipasi DOM belum ada

    const box = alertEl.querySelector(".alertBox");

    if (window.innerWidth < 992) {
      alertEl.classList.remove("d-none");
      parent.classList.remove("d-none");
      box.classList.add("show");
    } else {
      alertEl.classList.add("d-none");
      parent.classList.add("d-none");
      box.classList.remove("show");
    }
  }

  // run sekali setelah DOM siap
  toggleMobileAlert();

  // realtime tanpa refresh
  window.addEventListener("resize", toggleMobileAlert);
});

// 1. Munculin alert langsung
const alertLogin = document.getElementById("alertlogin");
if (alertLogin) {
  alertLogin.classList.remove("d-none");
}

// 2. Sembunyikan setelah 4 detik
setTimeout(() => {
  if (alertLogin) {
    alertLogin.classList.add("d-none");
  }
}, 3000);

// BUTTON SINGUP
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("zx__SubmitSingUp");
  const ContainerAlertSingup = document.getElementById("ContainerAlertSingup");
  const btnAlertconfirm = document.getElementById("btnAlertconfirm");

  ContainerAlertSingup.addEventListener("mousedown", (e) => {
    e.preventDefault();
  });

  btn.addEventListener("click", (e) => {
    e.preventDefault(); // cegah form submit dulu
    ContainerAlertSingup.classList.remove("d-none");
  });

  btnAlertconfirm.addEventListener("click", () => {
    ContainerAlertSingup.classList.add("d-none");
  });
});