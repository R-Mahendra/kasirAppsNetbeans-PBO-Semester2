// ========================================================================
// KASIR WEB APPS - VERSI STATIS (HTML + Vanilla JS, TANPA BACKEND PYTHON)
// ========================================================================
// Semua logic yang dulu ada di app.py (Flask) dipindah ke sini:
// - Cart disimpan di localStorage (bukan session server)
// - Auth dicek dari localStorage (lihat js/loginStyle.js)
// - Perhitungan diskon/PPN/total dilakukan di browser
// - Struk PDF di-generate di browser pakai jsPDF (bukan reportlab)
// - Form pembayaran kini menyertakan Nomor Meja & Nomor Antrian
//
// Catatan: setCookie/getCookie/deleteCookie ada di js/cookieUtils.js, dan
// isLoggedIn/setLoggedIn/clearLoggedIn ada di js/auth.js. Kedua file itu
// harus di-load SEBELUM main.js di index.html.
// ========================================================================

const CART_KEY = "kasir_cart"; // key localStorage untuk cart
const PEMBELI_KEY = "kasir_pembeli"; // key localStorage untuk data transaksi terakhir
const PAJAK = 0.1; // PPN 10%
const DISKON_RATE = 0.1; // Diskon 10%

let cart = {}; // representasi cart di memory: { id: {id, nama, price, qty, subtotal, img} }
let menuData = {}; // hasil fetch menu.json
let isProcessing = false; // mencegah double click

// ========================================================================
// AUTH GUARD - cek localStorage + cookie (lihat js/auth.js), bukan session Flask
// ========================================================================
(function authGuard() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  }
})();

function confirmLogout() {
  showConfirm("Apakah Anda yakin ingin logout?\nSemua data keranjang akan dihapus.", (yes) => {
    if (yes) {
      const btn = document.querySelector('[onclick*="confirmLogout"]');
      if (btn) {
        btn.innerHTML = `
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Logging out...</span>
        </div> `;
        btn.style.pointerEvents = "none";
      }
      setTimeout(() => {
        // Hapus status login & cart, lalu kembali ke halaman login
        clearLoggedIn();

        localStorage.removeItem(CART_KEY);
        localStorage.removeItem(PEMBELI_KEY);

        window.location.href = "login.html";
      }, 1000);
    }
  });
}

// ========================================================================
// HELPER FUNCTIONS - FORMAT & VALIDASI
// ========================================================================

function formatRupiah(angka) {
  return Number(angka || 0).toLocaleString("id-ID");
}

function validateNama(nama) {
  if (!nama || nama.trim() === "") {
    showWarning("Nama pembeli tidak boleh kosong!");
    return false;
  }
  if (nama.trim().length < 3) {
    showWarning("Nama pembeli minimal 3 karakter!");
    return false;
  }
  return true;
}

function validateNomorMeja(nomorMeja) {
  if (!nomorMeja || nomorMeja.trim() === "") {
    showWarning("Nomor meja tidak boleh kosong!");
    return false;
  }
  return true;
}

function validateNomorAntrian(nomorAntrian) {
  if (!nomorAntrian || nomorAntrian.trim() === "") {
    showWarning("Nomor antrian tidak boleh kosong!");
    return false;
  }
  return true;
}

function validateCash(cash) {
  if (!cash || isNaN(cash) || cash <= 0) {
    showWarning("Jumlah uang tidak valid!");
    return false;
  }
  return true;
}

function disableButtons(disable) {
  const buttons = document.querySelectorAll(".btn-cart, .btn-plus, .btn-minus, .btn-remove, .btn-proses, .btn-clear, .btn-struk");
  buttons.forEach((btn) => {
    btn.disabled = disable;
  });
}

// ========================================================================
// PERHITUNGAN FINANSIAL (pengganti hitung_total() & calculate_totals() di app.py)
// ========================================================================

function hitungTotal(subtotal) {
  const diskon = Math.round(subtotal * DISKON_RATE);
  const dpp = subtotal - diskon;
  const ppn = Math.round(dpp * PAJAK);
  const total = dpp + ppn;
  return { diskon, ppn, total };
}

function calculateTotals(cartArray) {
  const subtotal = cartArray.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  const { diskon, ppn, total } = hitungTotal(subtotal);
  return { subtotal, diskon, ppn, total };
}

// ========================================================================
// PERSISTENSI CART - localStorage (pengganti Flask session)
// ========================================================================

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    cart = {};
    arr.forEach((item) => {
      cart[item.id] = item;
    });
  } catch (e) {
    console.error("Gagal load cart dari localStorage:", e);
    cart = {};
  }
}

function saveCartToStorage() {
  const arr = Object.values(cart);
  localStorage.setItem(CART_KEY, JSON.stringify(arr));
}

function getCartArray() {
  return Object.values(cart);
}

function getCartCount() {
  return getCartArray().reduce((sum, item) => sum + Number(item.qty), 0);
}

// ========================================================================
// LOAD MENU - fetch dari data/menu.json (pengganti load_menu() Flask)
// ========================================================================
function mergeCustomProducts() {
  try {
    const raw = localStorage.getItem("kasir_custom_products");
    const customProducts = raw ? JSON.parse(raw) : [];
    if (customProducts.length === 0) return;

    customProducts.forEach((p) => {
      const kategori = p.category;
      if (!menuData[kategori]) {
        menuData[kategori] = [];
      }
      // Hindari duplikat berdasarkan id
      const alreadyExists = menuData[kategori].some((m) => String(m.id) === String(p.id));
      if (!alreadyExists) {
        menuData[kategori].push({
          id: p.id,
          nama: p.nama,
          price: p.price,
          img: p.img || "/static/default.jpg",
        });
      }
    });
  } catch (e) {
    console.error("Gagal merge custom products:", e);
  }
}

async function loadMenu() {
  try {
    const res = await fetch("data/menu.json");
    if (!res.ok) throw new Error("Gagal memuat menu.json");
    menuData = await res.json();
    mergeCustomProducts();
    renderMenu();
  } catch (e) {
    console.error("Error loading menu:", e);
    const container = document.getElementById("menuContainer");
    if (container) {
      container.innerHTML = `<div class="col-12 text-center py-5 text-danger">Gagal memuat menu. Pastikan file data/menu.json ada.</div>`;
    }
  }
}

const ICONS = {
  Makanan: "bi-egg-fried",
  Minuman: "bi-cup-straw",
  "Makanan ringan": "bi-cake2-fill",
};

function renderMenu() {
  const container = document.getElementById("menuContainer");
  if (!container) return;

  let html = "";

  Object.keys(menuData).forEach((kategori) => {
    const items = menuData[kategori];
    const icon = ICONS[kategori] || "bi-box";

    html += `
      <div class="col-lg-12">
        <h1 class="text-center">
          <i class="bi ${icon}"></i> ${kategori}
          <span class="grs"></span>
        </h1>
      </div>`;

    items.forEach((item) => {
      const imgSrc = item.img ? item.img : "/static/default.jpg";
      html += `
        <div class="col-lg-2 mb-4 d-flex justify-content-center align-items-center">
          <div class="card d-flex justify-content-center align-items-center">
            <img src="${imgSrc}" class="img-thumbnail" alt="${item.nama}" />
            <div class="card-body p-2 text-center">
              <h6 class="card-title" style="max-width: 200px">${item.nama}</h6>
              <h6 class="card-text mb-2" id="hargaMenu">Rp ${formatRupiah(item.price)}</h6>
              <a href="#" class="btn btn-cart" data-id="${item.id}" data-nama="${item.nama}" data-price="${item.price}" data-img="${imgSrc}"> Add to cart </a>
            </div>
          </div>
        </div>`;
    });
  });

  container.innerHTML = html;
}

function findMenuItem(itemId) {
  for (const kategori of Object.keys(menuData)) {
    const found = menuData[kategori].find((m) => String(m.id) === String(itemId));
    if (found) return found;
  }
  return null;
}

// ========================================================================
// RENDER CART (di offcanvas struk)
// ========================================================================

function renderCart() {
  const wrapper = document.getElementById("wrapper");
  if (!wrapper) {
    console.error("Element wrapper tidak ditemukan");
    return;
  }

  const items = getCartArray();

  if (items.length === 0) {
    wrapper.innerHTML = '<div class="text-center py-5"><p class="text-muted">Keranjang kosong nih...😭😭</p></div>';
    return;
  }

  wrapper.innerHTML = "";

  items.forEach((item) => {
    wrapper.innerHTML += `
      <div class="row d-flex justify-content-between align-items-center wrapper-row">
        <div class="col-lg-2 p-0">
          <div class="cards d-flex justify-content-between align-items-center">
            <img src="${item.img}" class="img-thumbnail" alt="${item.nama}" />
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card d-flex justify-content-center align-items-center card-item">
            <h6 class="mb-1 itemName text-truncate" style="max-width: 120px;">${item.nama}</h6>
            <h6>Rp ${formatRupiah(item.subtotal)}</h6>
          </div>
        </div>

        <div class="col-lg-3">
          <div class="card card-btngrup border-0">
            <div class="btn-group border-0 d-flex justify-content-between align-items-center">
              <button class="btn btn-plus" data-id="${item.id}">+</button>
              <h6 class="mx-2">${item.qty}</h6>
              <button class="btn btn-minus" data-id="${item.id}">-</button>
            </div>
          </div>
        </div>

        <div class="col-lg-2">
          <button class="btn btn-danger btn-sm btn-remove" data-id="${item.id}">
            <i class="fas fa-trash"></i> Hapus
          </button>
        </div>
      </div>`;
  });
}

function refreshCartUI() {
  renderCart();

  const count = getCartCount();
  const cartBadge = document.getElementById("jumlahcart");
  if (cartBadge) {
    cartBadge.innerHTML = `<span>${count}</span>`;
  }

  const { subtotal } = calculateTotals(getCartArray());
  const testTotal = document.getElementById("testTotal");
  if (testTotal) {
    testTotal.innerText = count > 0 ? `Rp ${formatRupiah(subtotal)}` : "-";
  }

  if (count === 0) {
    resetPaymentForm();
  }
}

// ========================================================================
// UPDATE CART (pengganti endpoint POST /cart/update)
// ========================================================================

function updateCart(action, id) {
  if (isProcessing) return;

  isProcessing = true;
  disableButtons(true);

  try {
    const target = cart[id];

    if (action === "add") {
      if (!target) {
        const menuItem = findMenuItem(id);
        if (!menuItem) {
          showWarning("Item tidak ditemukan di menu");
          return;
        }
        cart[id] = {
          id: menuItem.id,
          nama: menuItem.nama,
          price: menuItem.price,
          img: menuItem.img,
          qty: 1,
          subtotal: menuItem.price,
        };
      } else {
        target.qty += 1;
        target.subtotal = target.qty * target.price;
      }
    } else if (action === "plus") {
      if (!target) {
        showWarning("Item tidak ada di keranjang");
        return;
      }
      target.qty += 1;
      target.subtotal = target.qty * target.price;
    } else if (action === "minus") {
      if (!target) {
        showWarning("Item tidak ada di keranjang");
        return;
      }
      target.qty -= 1;
      if (target.qty <= 0) {
        delete cart[id];
      } else {
        target.subtotal = target.qty * target.price;
      }
    } else if (action === "remove") {
      if (!target) {
        showWarning("Item tidak ada di keranjang");
        return;
      }
      delete cart[id];
    } else {
      showWarning("Aksi tidak dikenali");
      return;
    }

    saveCartToStorage();
    refreshCartUI();
  } catch (error) {
    console.error("Error updating cart:", error);
    showWarning("Gagal mengupdate keranjang");
  } finally {
    isProcessing = false;
    disableButtons(false);
  }
}

// ========================================================================
// ALERT / CONFIRM HELPERS
// ========================================================================

function showSuccess(message) {
  const alertBox = document.getElementById("alertcontainer");
  const alertText = document.getElementById("alertMessageSuccess");
  const alertBoxSuccess = document.getElementById("alertBox-Success");
  if (!alertBox || !alertText || !alertBoxSuccess) return;

  alertText.textContent = message;
  alertBox.classList.remove("d-none");
  alertBoxSuccess.classList.remove("d-none");

  setTimeout(() => {
    alertBox.classList.add("d-none");
    alertBoxSuccess.classList.add("d-none");
  }, 3000);
}

function showWarning(message) {
  const alertBox = document.getElementById("alertcontainer");
  const alertText = document.getElementById("alertMessageWarning");
  const alertBoxWarning = document.getElementById("alertBox-Warning");
  if (!alertBox || !alertText || !alertBoxWarning) return;

  alertText.textContent = message;
  alertBox.classList.remove("d-none");
  alertBoxWarning.classList.remove("d-none");

  setTimeout(() => {
    alertBox.classList.add("d-none");
    alertBoxWarning.classList.add("d-none");
  }, 3000);
}

function showConfirm(message, callback) {
  const modal = document.getElementById("confirmModal");
  const alertBox = document.getElementById("alertcontainer");
  const msg = modal.querySelector(".confirm-message");
  const yesBtn = document.getElementById("confirmYes");
  const noBtn = document.getElementById("confirmNo");

  msg.innerText = message;
  modal.classList.remove("d-none");
  alertBox.classList.remove("d-none");

  yesBtn.onclick = () => {
    modal.classList.add("d-none");
    alertBox.classList.add("d-none");
    callback(true);
  };

  noBtn.onclick = () => {
    modal.classList.add("d-none");
    alertBox.classList.add("d-none");
    callback(false);
  };
}

// ========================================================================
// EVENT LISTENERS - CART BUTTONS
// ========================================================================

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-cart")) {
    e.preventDefault();
    const id = e.target.dataset.id;
    if (id) {
      updateCart("add", id);
      showSuccess("Menu masuk ke keranjang!");
    }
  }
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-plus")) {
    const id = e.target.dataset.id;
    if (id) updateCart("plus", id);
  }

  if (e.target.classList.contains("btn-minus")) {
    const id = e.target.dataset.id;
    if (!id) return;

    const qtyElement = e.target.parentElement.querySelector("h6.mx-2");
    const qty = parseInt(qtyElement.innerText);

    if (qty <= 1) {
      showWarning("Item terakhir tidak bisa dikurangi lagi. Gunakan tombol hapus!");
      return;
    }

    updateCart("minus", id);
  }

  if (e.target.classList.contains("btn-remove")) {
    const id = e.target.dataset.id;

    showConfirm("Hapus item ini dari keranjang?", function (yes) {
      if (yes) {
        updateCart("remove", id);
        showSuccess("Item dihapus!");
      }
    });
  }
});

// ========================================================================
// PROSES PEMBAYARAN (pengganti endpoint POST /checkout)
// ========================================================================

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-proses")) {
    e.preventDefault();
    prosesPembayaran();
  }
});

function prosesPembayaran() {
  if (isProcessing) return;

  const nama = document.getElementById("inputNamaPembeli")?.value.trim();
  const nomorMeja = document.getElementById("inputNomorMeja")?.value.trim();
  const nomorAntrian = document.getElementById("inputNomorAntrian")?.value.trim();
  const cashInput = document.getElementById("inputCash")?.value;
  const cash = parseInt(cashInput);

  if (!validateNama(nama)) return;
  if (!validateNomorMeja(nomorMeja)) return;
  if (!validateNomorAntrian(nomorAntrian)) return;
  if (!validateCash(cash)) return;

  const items = getCartArray();
  if (items.length === 0) {
    showWarning("Keranjang masih kosong!");
    return;
  }

  isProcessing = true;
  disableButtons(true);

  try {
    const { subtotal, diskon, ppn, total } = calculateTotals(items);

    if (cash < total) {
      showWarning(`Uang tidak cukup. Total: Rp ${formatRupiah(total)}, Uang: Rp ${formatRupiah(cash)}`);
      return;
    }

    const kembalian = cash - total;

    const pembeli = { nama, nomorMeja, nomorAntrian, cash, subtotal, ppn, diskon, total, kembalian };
    localStorage.setItem(PEMBELI_KEY, JSON.stringify(pembeli));

    updateElement("Subtotal", `Rp ${formatRupiah(subtotal)}`);
    updateElement("ppn", `Rp ${formatRupiah(ppn)}`);
    updateElement("diskon", `Rp ${formatRupiah(diskon)}`);
    updateElement("total", `Rp ${formatRupiah(total)}`);
    updateElement("uangBayar", `Rp ${formatRupiah(cash)}`);
    updateElement("kembalian", `Rp ${formatRupiah(kembalian)}`);

    showSuccess("Pembayaran berhasil diproses!");
  } catch (error) {
    console.error("Error processing payment:", error);
    showWarning("Gagal memproses pembayaran");
  } finally {
    isProcessing = false;
    disableButtons(false);
  }
}

function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.innerText = value;
  }
}

// ========================================================================
// CLEAR CART (pengganti endpoint POST /cart/clear)
// ========================================================================

function initClearButton() {
  const btn = document.getElementById("btn-clear");
  if (!btn) return;
  btn.addEventListener("click", () => {
    showConfirm("Yakin.? Hapus semua menu di keranjang.?", (ya) => {
      if (ya) {
        clearCart();
      }
    });
  });
}

function clearCart() {
  if (isProcessing) return;

  isProcessing = true;
  disableButtons(true);

  try {
    cart = {};
    saveCartToStorage();
    localStorage.removeItem(PEMBELI_KEY);

    const wrapper = document.getElementById("wrapper");
    if (wrapper) {
      wrapper.innerHTML = '<div class="text-center py-5"><p class="text-muted">Keranjang kosong nih...😭😭</p></div>';
    }

    const cartBadge = document.getElementById("jumlahcart");
    if (cartBadge) {
      cartBadge.innerHTML = "<span>0</span>";
    }

    updateElement("testTotal", "-");
    resetPaymentForm();

    showSuccess("Keranjang berhasil dikosongkan!");
  } catch (error) {
    console.error("Error clearing cart:", error);
    showWarning("Gagal menghapus keranjang");
  } finally {
    isProcessing = false;
    disableButtons(false);
  }
}

function resetPaymentForm() {
  updateElement("Subtotal", "-");
  updateElement("ppn", "-");
  updateElement("diskon", "-");
  updateElement("total", "-");
  updateElement("uangBayar", "-");
  updateElement("kembalian", "-");

  const namaInput = document.getElementById("inputNamaPembeli");
  const nomorMejaInput = document.getElementById("inputNomorMeja");
  const nomorAntrianInput = document.getElementById("inputNomorAntrian");
  const cashInput = document.getElementById("inputCash");

  if (namaInput) namaInput.value = "";
  if (nomorMejaInput) nomorMejaInput.value = "";
  if (nomorAntrianInput) nomorAntrianInput.value = "";
  if (cashInput) cashInput.value = "";
}

// ========================================================================
// DOWNLOAD STRUK - jsPDF (pengganti endpoint POST /generate_struk + reportlab)
// ========================================================================

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-struk")) {
    e.preventDefault();
    downloadStruk();
  }
});

function downloadStruk() {
  if (isProcessing) return;

  const nama = document.getElementById("inputNamaPembeli")?.value.trim();
  const nomorMeja = document.getElementById("inputNomorMeja")?.value.trim();
  const nomorAntrian = document.getElementById("inputNomorAntrian")?.value.trim();
  const cashInput = document.getElementById("inputCash")?.value;
  const cash = parseInt(cashInput);

  if (!validateNama(nama)) return;
  if (!validateNomorMeja(nomorMeja)) return;
  if (!validateNomorAntrian(nomorAntrian)) return;
  if (!validateCash(cash)) return;

  const totalElement = document.getElementById("total");
  if (!totalElement || totalElement.innerText === "-") {
    showWarning("Silakan proses pembayaran terlebih dahulu!");
    return;
  }

  const items = getCartArray();
  if (items.length === 0) {
    showWarning("Keranjang kosong");
    return;
  }

  isProcessing = true;
  disableButtons(true);

  try {
    const { subtotal, diskon, ppn, total } = calculateTotals(items);
    const kembalian = cash - total;

    if (cash < total) {
      showWarning("Uang tidak cukup");
      return;
    }

    generateStrukPDF({ nama, nomorMeja, nomorAntrian, cash, items, subtotal, diskon, ppn, total, kembalian });
    showSuccess("Struk berhasil diunduh!");
  } catch (error) {
    console.error("Error generating struk:", error);
    showWarning("Gagal membuat struk");
  } finally {
    isProcessing = false;
    disableButtons(false);
  }
}

function generateStrukPDF({ nama, nomorMeja, nomorAntrian, cash, items, subtotal, diskon, ppn, total, kembalian }) {
  const { jsPDF } = window.jspdf;

  const widthMM = 90;
  const baseHeightMM = 120;
  const perItemMM = 15;
  const heightMM = baseHeightMM + items.length * perItemMM;

  const doc = new jsPDF({
    unit: "mm",
    format: [widthMM, heightMM],
  });

  const centerX = widthMM / 2;
  let y = 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("RESTORAN KELOMPOK 5", centerX, y, { align: "center" });
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const addressLines = ["Cikarang Square", "Jl. Cibarusah Raya No.168", "Pasirsari, Cikarang Sel", "Kab.Bekasi, Jawa Barat 17550"];
  addressLines.forEach((line) => {
    doc.text(line, centerX, y, { align: "center" });
    y += 3.5;
  });

  const now = new Date();
  const tanggalStr = now.toLocaleDateString("id-ID") + " " + now.toLocaleTimeString("id-ID");
  doc.text(tanggalStr, centerX, y, { align: "center" });
  y += 4;

  doc.setLineWidth(0.2);
  doc.line(5, y, widthMM - 5, y);
  y += 5;

  doc.setFontSize(8);
  doc.text(`Customer : ${nama}`, 5, y);
  y += 4;

  doc.text(`No. Meja : ${nomorMeja}`, 5, y);
  doc.text(`No. Antrian : ${nomorAntrian}`, widthMM - 5, y, { align: "right" });
  y += 4;

  doc.line(5, y, widthMM - 5, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.text("PESANAN", 5, y);
  doc.text("TOTAL", widthMM - 5, y, { align: "right" });
  y += 3;

  doc.setLineWidth(0.1);
  doc.line(5, y, widthMM - 5, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  items.forEach((item) => {
    doc.text(item.nama, 5, y);
    y += 3.5;

    const qtyPriceText = `  ${item.qty} x Rp ${formatRupiah(item.price)}`;
    const itemTotal = item.price * item.qty;

    doc.text(qtyPriceText, 5, y);
    doc.text(`Rp ${formatRupiah(itemTotal)}`, widthMM - 5, y, { align: "right" });
    y += 5;
  });

  doc.setLineWidth(0.2);
  doc.line(5, y, widthMM - 5, y);
  y += 5;

  doc.text("Subtotal", 5, y);
  doc.text(`Rp ${formatRupiah(subtotal)}`, widthMM - 5, y, { align: "right" });
  y += 4;

  doc.text("Diskon (10%)", 5, y);
  doc.text(`Rp ${formatRupiah(diskon)}`, widthMM - 5, y, { align: "right" });
  y += 4;

  doc.text("PPN (10%)", 5, y);
  doc.text(`Rp ${formatRupiah(ppn)}`, widthMM - 5, y, { align: "right" });
  y += 5;

  doc.setLineWidth(0.3);
  doc.line(5, y, widthMM - 5, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TOTAL", 5, y);
  doc.text(`Rp ${formatRupiah(total)}`, widthMM - 5, y, { align: "right" });
  y += 5;

  doc.setLineWidth(0.2);
  doc.line(5, y, widthMM - 5, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Bayar", 5, y);
  doc.text(`Rp ${formatRupiah(cash)}`, widthMM - 5, y, { align: "right" });
  y += 4;

  doc.text("Kembali", 5, y);
  doc.text(`Rp ${formatRupiah(kembalian)}`, widthMM - 5, y, { align: "right" });
  y += 7;

  doc.setLineWidth(0.2);
  doc.line(5, y, widthMM - 5, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("TERIMA KASIH", centerX, y, { align: "center" });
  y += 3.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Atas Kunjungan Anda", centerX, y, { align: "center" });
  y += 5;

  doc.setFontSize(6);
  doc.text("Powered by Kelompok 3", centerX, y, { align: "center" });
  y += 3.5;

  const strukId = now
    .toISOString()
    .replace(/[-:T.Z]/g, "")
    .slice(0, 14);
  doc.text(`Struk: ${strukId}`, centerX, y, { align: "center" });

  const dateStr = now.toLocaleDateString("id-ID").split("/").reverse().join("-");
  doc.save(`struk-${dateStr}.pdf`);
}

// ========================================================================
// INITIALIZE
// ========================================================================

document.addEventListener("DOMContentLoaded", () => {
  loadMenu();
  loadCartFromStorage();
  refreshCartUI();
  initClearButton();
  console.log("Kasir Apps (static version) initialized");
});

// ========================================================================
// NAVBAR SCROLL ACTIVE LINK
// ========================================================================

const navbar = document.querySelector(".navbar");
const navLinks = navbar.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;

  navLinks.forEach((link) => {
    const target = link.getAttribute("href");
    if (!target || target === "#") return;

    const section = document.querySelector(target);
    if (!section) return;

    const sectionTop = section.offsetTop - navbar.offsetHeight;
    const sectionHeight = section.offsetHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
});

function scrollToSection(event, sectionId) {
  event.preventDefault();

  const section = document.querySelector(sectionId);
  const offsetTop = section.offsetTop - navbar.offsetHeight;

  window.scrollTo({
    top: offsetTop,
    behavior: "smooth",
  });

  navLinks.forEach((link) => {
    if (link.getAttribute("href") === sectionId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  function toggleMobileAlert() {
    const alertEl = document.getElementById("mobileAlert");
    const parent = document.getElementById("parentMobileAlert");
    if (!alertEl || !parent) return;

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

  toggleMobileAlert();
  window.addEventListener("resize", toggleMobileAlert);
});

document.querySelectorAll(".zx__Root").forEach((el) => {
  el.addEventListener("mousedown", (e) => {
    e.preventDefault();
  });
});

// ========================================================================
// SCROLL REVEAL
// ========================================================================

ScrollReveal({
  reset: true,
  distance: "80px",
  duration: 2000,
  delay: 200,
});

ScrollReveal().reveal(".zhx", { origin: "bottom" });
ScrollReveal().reveal(".ftr", { origin: "bottom" });
ScrollReveal().reveal(".h1team", { origin: "top" });
ScrollReveal().reveal(".rfk", { origin: "left" });
ScrollReveal().reveal(".ndi", { origin: "bottom" });
ScrollReveal().reveal(".cia", { origin: "right" });

const start = 2025;
const now = new Date().getFullYear();

const copyEl = document.getElementById("copy");
if (copyEl) {
  copyEl.innerHTML = "copyright &copy; " + (start === now ? start : start + " - " + now) + " All rights reserved.";
}
