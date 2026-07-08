// ========================================================================
// ADD PRODUCT - KASIR WEB APPS (Static Version)
// ========================================================================
// Menyimpan produk baru ke localStorage dengan key "kasir_custom_products".
// Produk custom ini akan digabung dengan menu.json saat loadMenu() di main.js.
//
// Catatan: Karena aplikasi ini static (tanpa backend), produk yang ditambah
// disimpan di localStorage — bukan ke file menu.json secara langsung.
// Produk akan tetap ada selama localStorage tidak di-clear.
//
// Auth guard: halaman ini hanya bisa diakses kalau sudah login.
// Butuh js/cookieUtils.js & js/auth.js di-load sebelum file ini.
// ========================================================================

const CUSTOM_PRODUCTS_KEY = "kasir_custom_products";
let deleteProductId = null;
function openDeleteModal(id) {
  deleteProductId = id;

  const modal = new bootstrap.Modal(document.getElementById("deleteProductModal"));

  modal.show();
}
// ========================================================================
// AUTH GUARD
// ========================================================================
(function authGuard() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  }
})();

// ========================================================================
// HELPERS
// ========================================================================

function generateId() {
  // Buat ID unik berbasis timestamp + random supaya tidak bentrok dengan
  // ID produk default di menu.json (yang biasanya integer kecil).
  return "custom_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
}

function loadCustomProducts() {
  try {
    const raw = localStorage.getItem(CUSTOM_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Gagal load custom products:", e);
    return [];
  }
}

function saveCustomProducts(products) {
  localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(products));
}

// ========================================================================
// RENDER TABEL PRODUK YANG SUDAH DITAMBAHKAN
// ========================================================================

function renderProductTable() {
  const container = document.getElementById("productContainer");
  const emptyState = document.getElementById("emptyState");

  if (!container) return;

  const products = loadCustomProducts();

  if (products.length === 0) {
    container.innerHTML = "";
    if (emptyState) emptyState.classList.remove("d-none");
    return;
  }

  if (emptyState) emptyState.classList.add("d-none");

  container.innerHTML = products
    .map(
      (key, index) => `
      <div class="row d-flex justify-content-center align-items-center my-4">

        <div class="col-lg-1 zxproductTableBody">
          ${index + 1}
        </div>

        <div class="col-lg-3 d-flex justify-content-center align-items-center">
          <img
            src="${key.img || "/static/default.jpg"}"
            alt="${key.nama}"
            class="img-fluid"
            id="productImage"
            onerror="this.src='/static/default.jpg'"
          />
        </div>

        <div class="col-lg-2 zxproductTableBody">
          ${key.nama}
        </div>

        <div class="col-lg-2 zxproductTableBody">
          Rp ${Number(key.price).toLocaleString("id-ID")}
        </div>

        <div class="col-lg-2 zxproductTableBody">
          <span class="badge ${key.category}">${key.category}</span>
        </div>

        <div class="col-lg-2 zxproductTableBody">
          <button
            class="btn btn-sm btn-warning"
            onclick="openEditModal('${key.id}')">
            Edit <i class="bi bi-pencil"></i>
          </button>
          <button
            class="btn btn-sm btn-danger"
            onclick="openDeleteModal('${key.id}')">
            Delete <i class="bi bi-trash"></i>
          </button>
        </div>
        <hr class="garisHR" />
      </div>
    `,
    )
    .join("");
}

// ========================================================================
// HAPUS PRODUK
// ========================================================================

function deleteProduct(id) {
  if (!confirm("Yakin ingin menghapus produk ini?")) {
    return;
  }

  let products = loadCustomProducts();
  products = products.filter((p) => p.id !== id);

  saveCustomProducts(products);
  renderProductTable();

  showToast("Produk berhasil dihapus!", "danger");
}
// ========================================================================
// TOAST NOTIFICATION (ringan, tanpa library tambahan)
// ========================================================================

function showToast(message, type = "success") {
  // Hapus toast sebelumnya kalau masih ada
  const existing = document.getElementById("addProductToast");
  if (existing) existing.remove();

  const colorMap = {
    success: "bg-success",
    danger: "bg-danger",
    warning: "bg-warning text-dark",
  };

  const toast = document.createElement("div");
  toast.id = "addProductToast";
  toast.className = `toast align-items-center text-white border-0 show position-fixed top-0 end-0 m-5 ${colorMap[type] || "bg-success"}`;
  toast.style.zIndex = "9999";
  toast.setAttribute("role", "alert");
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.closest('.toast').remove()"></button>
    </div>`;

  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 4000);
}

// ========================================================================
// PREVIEW GAMBAR SAAT URL DIKETIK
// ========================================================================

function initImagePreview() {
  const imgInput = document.getElementById("img");
  const preview = document.getElementById("imgPreview");
  const placeholder = document.getElementById("imgPlaceholder");
  if (!imgInput || !preview) return;

  imgInput.addEventListener("input", () => {
    const url = imgInput.value.trim();
    if (url) {
      preview.src = url;
      preview.classList.remove("d-none");
      if (placeholder) placeholder.classList.add("d-none");
      preview.onerror = () => {
        preview.src = "/static/default.jpg";
      };
    } else {
      preview.classList.add("d-none");
      if (placeholder) placeholder.classList.remove("d-none");
    }
  });
}

// ========================================================================
// VALIDASI FORM
// ========================================================================

function validateForm(nama, price, category) {
  if (!nama || nama.trim() === "") {
    showToast("Nama produk tidak boleh kosong!", "warning");
    return false;
  }
  if (nama.trim().length < 2) {
    showToast("Nama produk minimal 2 karakter!", "warning");
    return false;
  }
  if (!price || isNaN(price) || Number(price) <= 0) {
    showToast("Harga harus berupa angka lebih dari 0!", "warning");
    return false;
  }
  if (!category) {
    showToast("Pilih kategori terlebih dahulu!", "warning");
    return false;
  }
  return true;
}

const start = 2025;
const now = new Date().getFullYear();

const copyEl = document.getElementById("copy");
if (copyEl) {
  copyEl.innerHTML = "copyright &copy; " + (start === now ? start : start + " - " + now) + " All rights reserved.";
}

// EDIT MODAL
function openEditModal(id) {
  const products = loadCustomProducts();
  const product = products.find((p) => p.id === id);

  if (!product) return;

  document.getElementById("editId").value = product.id;
  document.getElementById("editNama").value = product.nama;
  document.getElementById("editPrice").value = product.price;
  document.getElementById("editImg").value = product.img;
  document.getElementById("editCategory").value = product.category;

  const preview = document.getElementById("editImgPreview");
  const placeholder = document.getElementById("editImgPlaceholder");

  if (product.img) {
    preview.src = product.img;
    preview.classList.remove("d-none");
    placeholder.classList.add("d-none");

    preview.onerror = () => {
      preview.src = "/static/default.jpg";
    };
  } else {
    preview.classList.add("d-none");
    placeholder.classList.remove("d-none");
  }

  new bootstrap.Modal(document.getElementById("editProductModal")).show();
  console.log(product);
  console.log(document.getElementById("editId").value);
}

function initEditImagePreview() {
  const input = document.getElementById("editImg");
  const preview = document.getElementById("editImgPreview");
  const placeholder = document.getElementById("editImgPlaceholder");

  if (!input) return;

  input.addEventListener("input", () => {
    const url = input.value.trim();

    if (url) {
      preview.src = url;
      preview.classList.remove("d-none");
      placeholder.classList.add("d-none");

      preview.onerror = () => {
        preview.src = "/static/default.jpg";
      };
    } else {
      preview.classList.add("d-none");
      placeholder.classList.remove("d-none");
    }
  });
}

// Update product
// ==============================
// UPDATE PRODUCT
// ==============================
const editForm = document.getElementById("editProductForm");

// ========================================================================
// SUBMIT FORM — TAMBAH PRODUK BARU
// ========================================================================

document.addEventListener("DOMContentLoaded", () => {
  initImagePreview();
  initEditImagePreview();
  renderProductTable();

  const form = document.getElementById("addProductForm");
  if (!form) return;

  // Reset preview saat form di-reset
  form.addEventListener("reset", () => {
    const preview = document.getElementById("imgPreview");
    const placeholder = document.getElementById("imgPlaceholder");
    if (preview) preview.classList.add("d-none");
    if (placeholder) placeholder.classList.remove("d-none");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nama = document.getElementById("nama").value.trim();
    const price = document.getElementById("price").value;
    const img = document.getElementById("img").value.trim();
    const category = document.getElementById("category").value;

    if (!validateForm(nama, price, category)) return;

    const newProduct = {
      id: generateId(),
      nama,
      price: Number(price),
      img: img || "/static/default.jpg",
      category,
    };

    const products = loadCustomProducts();

    // Cek duplikat nama di kategori yang sama
    const isDuplicate = products.some((p) => p.nama.toLowerCase() === nama.toLowerCase() && p.category === category);
    if (isDuplicate) {
      showToast(`Produk "${nama}" sudah ada di kategori ${category}!`, "warning");
      return;
    }

    products.push(newProduct);
    saveCustomProducts(products);

    // Reset form
    form.reset();
    const preview = document.getElementById("imgPreview");
    if (preview) preview.classList.add("d-none");

    renderProductTable();
    showToast(`Produk "${nama}" berhasil ditambahkan!`, "success");
  });

  if (editForm) {
    editForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const id = document.getElementById("editId").value;
      const nama = document.getElementById("editNama").value.trim();
      const price = Number(document.getElementById("editPrice").value);
      const img = document.getElementById("editImg").value.trim();
      const category = document.getElementById("editCategory").value;

      if (!validateForm(nama, price, category)) return;

      const products = loadCustomProducts();
      // ==============================
      // Cek duplikat (kecuali produk yang sedang diedit)
      // ==============================
      const isDuplicate = products.some((p) => p.id !== id && p.nama.toLowerCase() === nama.toLowerCase() && p.category === category);

      if (isDuplicate) {
        showToast(`Produk "${nama}" sudah ada di kategori ${category}!`, "warning");
        return;
      }

      const index = products.findIndex((p) => p.id === id);

      if (index === -1) {
        showToast("Produk tidak ditemukan!", "danger");
        return;
      }

      products[index] = {
        ...products[index],
        nama,
        price,
        img: img || "/static/default.jpg",
        category,
      };

      saveCustomProducts(products);

      renderProductTable();

      const modal = bootstrap.Modal.getInstance(document.getElementById("editProductModal"));

      if (modal) modal.hide();

      showToast("Produk berhasil diperbarui!", "success");
    });
  }

  // Delete product from modal
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
      let products = loadCustomProducts();

      products = products.filter((p) => p.id !== deleteProductId);

      saveCustomProducts(products);

      renderProductTable();

      bootstrap.Modal.getInstance(document.getElementById("deleteProductModal")).hide();

      showToast("Produk berhasil dihapus!", "danger");
    });
  }
});
