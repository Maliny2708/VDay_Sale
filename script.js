let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart() {
  const bundle = document.getElementById("bundle").value;
  if (!bundle) return alert("Select a bundle");

  const prices = {
    combo1: 30,
    combo2: 50,
    duo: 35,
    bo2: 20,
    bo4: 36
  };

  cart.push({
    bundle,
    price: prices[bundle]
  });

  localStorage.setItem("cart", JSON.stringify(cart));
  showCartPreview();
}

function showCartPreview() {
  const div = document.getElementById("cartPreview");
  if (!div) return;

  div.innerHTML = "";
  cart.forEach(item => {
    div.innerHTML += `<p>${item.bundle} – RM${item.price}</p>`;
  });
}

function loadCart() {
  const div = document.getElementById("cartItems");
  if (!div) return;

  let total = 0;
  cart.forEach(item => {
    total += item.price;
    div.innerHTML += `<p>${item.bundle} – RM${item.price}</p>`;
  });

  document.getElementById("totalDisplay").innerText =
    "Subtotal: RM" + total;
}

function goCheckout() {
  if (!document.getElementById("confirm").checked)
    return alert("Please confirm your order");

  localStorage.setItem("delivery", document.getElementById("delivery").value);
  window.location.href = "checkout.html";
}

function submitOrder() {
  let total = cart.reduce((sum, i) => sum + i.price, 0);
  total += Number(localStorage.getItem("delivery") || 0);

  if (document.getElementById("mmu").checked) {
    total *= 0.9;
  }

  document.getElementById("orderData").value = JSON.stringify(cart);
  document.getElementById("finalTotal").value = total.toFixed(2);
  localStorage.setItem("finalTotal", total.toFixed(2));
}

function showThankYou() {
  const div = document.getElementById("summary");
  if (!div) return;

  const total = localStorage.getItem("finalTotal");
  const orderID = "MB-VDAY-" + Math.floor(Math.random() * 1000);

  div.innerHTML = `
    <p>Order ID: ${orderID}</p>
    <p>Total: RM${total}</p>
  `;

  document.getElementById("waLink").href =
    `https://wa.me/60166113563?text=Hi! I’d like to confirm my Valentine’s order. Order ID: ${orderID}. Total: RM${total}`;
}

showCartPreview();
loadCart();
showThankYou();
