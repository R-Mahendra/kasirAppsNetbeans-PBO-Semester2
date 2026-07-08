document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".btn-cart").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();

      const data = {
        id: btn.dataset.id,
        nama: btn.dataset.nama,
        price: Number(btn.dataset.price),
        // img: btn.dataset.img,
      };

      console.log(data);

      await fetch("/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      loadCart();
    });
  });
});

async function loadCart() {
  const response = await fetch("/cart");

  const data = await response.json();

  let html = "";

  data.cart.forEach((item) => {
    html += `
        <div class="row wrapper-row">

            <div class="col-3 cards">

                <img
                    src="${item.img}"
                    alt="${item.nama}">

            </div>

            <div class="col-4 card-item">

                <h6>${item.nama}</h6>

                <h6>
                    Rp ${item.price.toLocaleString()}
                </h6>

            </div>

            <div class="col-5 card-btngrup d-flex justify-content-center align-items-center gap-2">

                <button
                    onclick="minus('${item.id}')">
                    -
                </button>

                <h6>${item.qty}</h6>

                <button
                    onclick="plus('${item.id}')">
                    +
                </button>

                <button
                    class="btn-remove"
                    onclick="removeItem('${item.id}')">

                    Hapus

                </button>

            </div>

        </div>
        `;
  });

  document.getElementById("wrapper").innerHTML = html;

  document.getElementById("Subtotal").innerText = "Rp " + data.summary.subtotal.toLocaleString();

  document.getElementById("ppn").innerText = "Rp " + data.summary.ppn.toLocaleString();

  document.getElementById("diskon").innerText = "Rp " + data.summary.diskon.toLocaleString();

  document.getElementById("testTotal").innerText = "Rp " + data.summary.total.toLocaleString();

  document.getElementById("jumlahcart").innerHTML = `<span>${data.cart.length}</span>`;
}

async function plus(id) {
  await fetch("/cart/plus/" + id, {
    method: "POST",
  });

  loadCart();
}

// Function Minus
async function minus(id) {
  await fetch("/cart/minus/" + id, {
    method: "POST",
  });
  loadCart();
}

// Function Remove Item
async function removeItem(id) {
  await fetch("/cart/remove/" + id, {
    method: "POST",
  });
  loadCart();
}

// Function Clear Cart
async function clearCart() {
  await fetch("/cart/clear", {
    method: "POST",
  });
  loadCart();
}

// Function Download PDF
function downloadPdf() {
  window.location = "/pdf";
}
window.onload = () => {
  loadCart();
};
