let cart = JSON.parse(localStorage.getItem("cart")) || [];

// --- GLOBAL VARIABLES ---
let currentProduct = {};
let counts = {
  apple: 0,
  cheese: 0,
  earring: 0,
  bracelet: 0,
  charm: 0
};

// 1. UPDATE NAV CART COUNT
function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (el) el.innerText = cart.length;
}

// 2. DIRECT ADD (For Ala Carte Accessories)
function addAccessory(name, price) {
  addToCartFinal(name, price, "No customization");
}

// 3. OPEN SMART MODAL
// arguments: Name, Price, How many Cakes?, How many Accessories?
function openSmartModal(name, price, cakeLimit, accLimit) {
  // Reset state
  currentProduct = { name, price, cakeLimit, accLimit };
  counts = { apple: 0, cheese: 0, earring: 0, bracelet: 0, charm: 0 };

  // Show/Hide Sections based on limits
  document.getElementById("cakeSection").style.display = cakeLimit > 0 ? "block" : "none";
  document.getElementById("accSection").style.display = accLimit > 0 ? "block" : "none";

  // Update Text
  document.getElementById("modalTitle").innerText = `Customize: ${name}`;
  
  // Show Modal
  document.getElementById("flavorModal").style.display = "flex";
  updateModalUI();
}

// 4. CHANGE QUANTITY
function changeQty(type, change) {
  // Determine if this is a CAKE or an ACCESSORY
  const isCake = (type === 'apple' || type === 'cheese');
  const limit = isCake ? currentProduct.cakeLimit : currentProduct.accLimit;
  
  // Calculate current totals
  const currentTotal = isCake 
    ? (counts.apple + counts.cheese)
    : (counts.earring + counts.bracelet + counts.charm);

  // Logic: Allow add if under limit, allow subtract if above 0
  if (change > 0 && currentTotal < limit) {
    counts[type]++;
  } else if (change < 0 && counts[type] > 0) {
    counts[type]--;
  }

  updateModalUI();
}

// 5. UPDATE UI & VALIDATE
function updateModalUI() {
  // Update numbers
  document.getElementById("qtyApple").innerText = counts.apple;
  document.getElementById("qtyCheese").innerText = counts.cheese;
  document.getElementById("qtyEarring").innerText = counts.earring;
  document.getElementById("qtyBracelet").innerText = counts.bracelet;
  document.getElementById("qtyCharm").innerText = counts.charm;

  // Calculate Totals
  const totalCakes = counts.apple + counts.cheese;
  const totalAcc = counts.earring + counts.bracelet + counts.charm;
  
  // Messages
  const cakeMsg = document.getElementById("cakeMsg");
  const accMsg = document.getElementById("accMsg");
  const btn = document.getElementById("confirmBtn");

  // Status Logic
  let cakesOk = true;
  let accOk = true;

  if (currentProduct.cakeLimit > 0) {
    if (totalCakes === currentProduct.cakeLimit) {
      cakeMsg.innerText = "Cakes Selected ✅";
      cakeMsg.style.color = "green";
    } else {
      cakeMsg.innerText = `Pick ${currentProduct.cakeLimit - totalCakes} more cakes`;
      cakeMsg.style.color = "var(--pink)";
      cakesOk = false;
    }
  }

  if (currentProduct.accLimit > 0) {
    if (totalAcc === currentProduct.accLimit) {
      accMsg.innerText = "Accessories Selected ✅";
      accMsg.style.color = "green";
    } else {
      accMsg.innerText = `Pick ${currentProduct.accLimit - totalAcc} more accessories`;
      accMsg.style.color = "var(--pink)";
      accOk = false;
    }
  }

  // Enable Button if both are OK
  if (cakesOk && accOk) {
    btn.disabled = false;
    btn.style.background = "var(--pink)";
    btn.innerText = "Add to Cart 💖";
  } else {
    btn.disabled = true;
    btn.style.background = "#ccc";
    btn.innerText = "Incomplete Selection";
  }
}

// 6. CONFIRM SELECTION
function confirmSelection() {
  let details = [];
  
  if (counts.apple > 0) details.push(`${counts.apple} Apple`);
  if (counts.cheese > 0) details.push(`${counts.cheese} Cheese`);
  if (counts.earring > 0) details.push(`${counts.earring} Earring`);
  if (counts.bracelet > 0) details.push(`${counts.bracelet} Bracelet`);
  if (counts.charm > 0) details.push(`${counts.charm} Charm`);

  addToCartFinal(currentProduct.name, currentProduct.price, details.join(", "));
  closeModal();
}

function closeModal() {
  document.getElementById("flavorModal").style.display = "none";
}

// 7. INTERNAL ADD TO CART
function addToCartFinal(name, price, details) {
  cart.push({
    id: Date.now(),
    bundle: name,
    price: price,
    details: details
  });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// 8. LOAD CART
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
          <div>
            <strong>${item.bundle}</strong>
            <div style="font-size:0.85rem; color:#666;">${item.details}</div>
          </div>
          <span>RM${item.price} 
            <button onclick="removeItem(${index})" style="padding:2px 8px; margin-left:10px; border-radius:50%; border:none; background:#eee; cursor:pointer;">x</button>
          </span>
        </div>
      `;
    });
  }

  if (subtotalEl) subtotalEl.innerText = "RM" + total;
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartCount();
}

// 9. CHECKOUT LOGIC
function prepareCheckout() {
  const mmuCheckbox = document.getElementById("mmuCheck");
  const priceBox = document.getElementById("priceBox");
  
  function calculateTotal() {
    let subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    let isMMU = mmuCheckbox ? mmuCheckbox.checked : false;
    let discount = isMMU ? subtotal * 0.10 : 0;
    let finalTotal = subtotal - discount;

    priceBox.innerHTML = `
      <p>Subtotal: RM${subtotal.toFixed(2)}</p>
      ${isMMU ? `<p style="color:#ff6f91; font-weight:bold;">MMU Discount: -RM${discount.toFixed(2)}</p>` : ""}
      <hr style="border:0.5px solid #eee">
      <h3>Total: RM${finalTotal.toFixed(2)}</h3>
    `;

    const itemsString = cart.map(i => `${i.bundle} (${i.details})`).join("\n");
    document.getElementById("orderData").value = itemsString;
    document.getElementById("finalPrice").value = finalTotal.toFixed(2);
    document.getElementById("mmuStatus").value = isMMU ? "Yes" : "No";
    
    let orderID = localStorage.getItem("orderID");
    if (!orderID) {
      orderID = "MB-" + Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem("orderID", orderID);
    }
    document.getElementById("orderID").value = orderID;
    localStorage.setItem("lastOrderTotal", finalTotal.toFixed(2));
  }

  if (mmuCheckbox) mmuCheckbox.addEventListener("change", calculateTotal);
  calculateTotal();
}

function showThankYou() {
  const orderID = localStorage.getItem("orderID");
  const total = localStorage.getItem("lastOrderTotal");
  const waLink = document.getElementById("waLink");

  if (document.getElementById("dispOrderID")) {
    document.getElementById("dispOrderID").innerText = orderID;
    document.getElementById("dispTotal").innerText = "RM" + total;
  }

  if (waLink) {
    const phone = "60166113563"; 
    const text = `Hi! I placed an order (ID: ${orderID}). Total: RM${total}. Sending payment proof now!`;
    waLink.href = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
});
