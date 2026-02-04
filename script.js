let cart = JSON.parse(localStorage.getItem("cart")) || [];

// 1. UPDATE NAV CART COUNT
function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (el) el.innerText = cart.length;
}

// 2. ADD TO CART (Used in Order Page)
function addCombo(name, price) {
  const item = {
    id: Date.now(), // Unique ID for removal
    bundle: name,
    price: price
  };
  
  cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert(name + " added to cart! 💖");
}

// 3. LOAD CART (Used in Cart Page)
function loadCart() {
  const container = document.getElementById("cartItems");
  const subtotalEl = document.getElementById("subtotal");
  if (!container) return;

  container.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty 😢</p>";
  } else {
    cart.forEach((item, index) => {
      total += item.price;
      container.innerHTML += `
        <div class="cart-item">
          <span>${item.bundle}</span>
          <span>RM${item.price} 
            <button onclick="removeItem(${index})" style="padding:5px 10px; font-size:12px; margin-left:10px; background:#ddd; color:#333; border-radius:50%;">x</button>
          </span>
        </div>
      `;
    });
  }

  if (subtotalEl) subtotalEl.innerText = "RM" + total;
}

// 4. REMOVE ITEM
function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartCount();
}

// 5. CHECKOUT LOGIC (Used in Checkout Page)
function prepareCheckout() {
  const mmuCheckbox = document.getElementById("mmuCheck");
  const priceBox = document.getElementById("priceBox");
  
  function calculateTotal() {
    let subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    let isMMU = mmuCheckbox ? mmuCheckbox.checked : false;
    let discount = isMMU ? subtotal * 0.10 : 0;
    let finalTotal = subtotal - discount;

    // Display logic
    priceBox.innerHTML = `
      <p>Subtotal: RM${subtotal.toFixed(2)}</p>
      ${isMMU ? `<p style="color:var(--pink); font-weight:bold;">MMU Discount (10%): -RM${discount.toFixed(2)}</p>` : ""}
      <hr style="border:0.5px solid #eee">
      <h3>Total to Pay: RM${finalTotal.toFixed(2)}</h3>
    `;

    // Populate Hidden Netlify Fields
    const itemsString = cart.map(i => i.bundle).join(", ");
    document.getElementById("orderData").value = itemsString;
    document.getElementById("finalPrice").value = finalTotal.toFixed(2);
    document.getElementById("mmuStatus").value = isMMU ? "Yes" : "No";
    
    // Generate Stable Order ID
    let orderID = localStorage.getItem("orderID");
    if (!orderID) {
      orderID = "MB-" + Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem("orderID", orderID);
    }
    document.getElementById("orderID").value = orderID;

    // Save for Thank You page
    localStorage.setItem("lastOrderTotal", finalTotal.toFixed(2));
  }

  if (mmuCheckbox) {
    mmuCheckbox.addEventListener("change", calculateTotal);
  }
  
  calculateTotal(); // Run once on load
}

// 6. THANK YOU PAGE
function showThankYou() {
  const orderID = localStorage.getItem("orderID");
  const total = localStorage.getItem("lastOrderTotal");
  const waLink = document.getElementById("waLink");

  if (document.getElementById("dispOrderID")) {
    document.getElementById("dispOrderID").innerText = orderID;
    document.getElementById("dispTotal").innerText = "RM" + total;
  }

  if (waLink) {
    // This is your business number
    const phone = "60166113563"; 
    const text = `Hi! I placed an order (ID: ${orderID}). Total: RM${total}. Sending payment proof now!`;
    waLink.href = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }
}

// Auto-run on every page load
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
});