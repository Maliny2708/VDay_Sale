/* script.js */
console.log("Script loaded!"); // Debug check

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// --- GLOBAL VARIABLES ---
let currentProduct = {};
let counts = { apple: 0, cheese: 0, earring: 0, bracelet: 0, charm: 0 };

// 1. UPDATE NAV CART COUNT
function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (el) el.innerText = cart.length;
}

// 2. OPEN THE POPUP (The "Smart Modal")
function openSmartModal(name, price, cakeLimit, accLimit) {
  // Save current product details
  currentProduct = { name, price, cakeLimit, accLimit };
  
  // Reset counts to 0
  counts = { apple: 0, cheese: 0, earring: 0, bracelet: 0, charm: 0 };
  document.getElementById("qtyApple").innerText = "0";
  document.getElementById("qtyCheese").innerText = "0";
  document.getElementById("qtyEarring").innerText = "0";
  document.getElementById("qtyBracelet").innerText = "0";
  document.getElementById("qtyCharm").innerText = "0";

  // Show/Hide Sections based on what the product allows
  // If cakeLimit is 0, hide the cake section
  document.getElementById("cakeSection").style.display = cakeLimit > 0 ? "block" : "none";
  // If accLimit is 0, hide the accessory section
  document.getElementById("accSection").style.display = accLimit > 0 ? "block" : "none";

  // Update Title
  document.getElementById("modalTitle").innerText = `Customize: ${name}`;
  
  // Show the Modal
  document.getElementById("flavorModal").style.display = "flex";
  
  updateModalUI();
}

// 3. CLOSE THE POPUP
function closeModal() {
  document.getElementById("flavorModal").style.display = "none";
}

// 4. CHANGE QUANTITY (+/- Buttons)
function changeQty(type, change) {
  // Check if we are changing a Cake or an Accessory
  const isCake = (type === 'apple' || type === 'cheese');
  const limit = isCake ? currentProduct.cakeLimit : currentProduct.accLimit;
  
  // Calculate how many we have selected so far
  const currentTotal = isCake 
    ? (counts.apple + counts.cheese)
    : (counts.earring + counts.bracelet + counts.charm);

  // Logic: Add if under limit, Subtract if above 0
  if (change > 0 && currentTotal < limit) {
    counts[type]++;
  } else if (change < 0 && counts[type] > 0) {
    counts[type]--;
  }

  updateModalUI();
}

// 5. UPDATE POPUP TEXT (Validation)
function updateModalUI() {
  // Update the numbers on screen
  document.getElementById("qtyApple").innerText = counts.apple;
  document.getElementById("qtyCheese").innerText = counts.cheese;
  document.getElementById("qtyEarring").innerText = counts.earring;
  document.getElementById("qtyBracelet").innerText = counts.bracelet;
  document.getElementById("qtyCharm").innerText = counts.charm;

  // Check totals
  const totalCakes = counts.apple + counts.cheese;
  const totalAcc = counts.earring + counts.bracelet + counts.charm;
  
  const btn = document.getElementById("confirmBtn");
  let cakesOk = true;
  let accOk = true;

  // Validate Cakes
  if (currentProduct.cakeLimit > 0) {
    if (totalCakes === currentProduct.cakeLimit) {
      cakesOk = true;
    } else {
      cakesOk = false;
      btn.innerText = `Pick ${currentProduct.cakeLimit - totalCakes} more cakes`;
    }
  }

  // Validate Accessories
  if (currentProduct.accLimit > 0) {
    if (totalAcc === currentProduct.accLimit) {
      accOk = true;
    } else {
      accOk = false;
      btn.innerText = `Pick ${currentProduct.accLimit - totalAcc} more accessories`;
    }
  }

  // If everything is valid, enable the button
  if (cakesOk && accOk) {
    btn.disabled = false;
    btn.style.background = "#ff6f91"; // Pink
    btn.innerText = "Add to Cart 💖";
  } else {
    btn.disabled = true;
    btn.style.background = "#ccc"; // Grey
  }
}

// 6. CONFIRM & ADD TO CART
function confirmSelection() {
  let details = [];
  
  if (counts.apple > 0) details.push(`${counts.apple} Apple`);
  if (counts.cheese > 0) details.push(`${counts.cheese} Cheese`);
  if (counts.earring > 0) details.push(`${counts.earring} Earring`);
  if (counts.bracelet > 0) details.push(`${counts.bracelet} Bracelet`);
  if (counts.charm > 0) details.push(`${counts.charm} Charm`);

  // Create the cart item
  const item = {
    id: Date.now(),
    bundle: currentProduct.name,
    price: currentProduct.price,
    details: details.join(", ") || "No Selection"
  };

  cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));
  
  closeModal();
  updateCartCount();
  alert("Added to cart! 🛒");
}

// 7. SIMPLE ADD (For items without options, if needed)
function addAccessory(name, price) {
  cart.push({ id: Date.now(), bundle: name, price: price, details: "Standard" });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert("Added to cart!");
}

// 8. LOAD CART PAGE
function loadCart() {
  const container = document.getElementById("cartItems");
  const subtotalEl = document.getElementById("subtotal");
  if (!container) return;

  container.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = "<p>Cart is empty</p>";
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
            <button onclick="removeItem(${index})" style="background:#eee; border:none; border-radius:50%; padding:5px 10px; margin-left:10px;">x</button>
          </span>
        </div>`;
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

// 9. CHECKOUT PAGE
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

    document.getElementById("orderData").value = cart.map(i => `${i.bundle} (${i.details})`).join(" | ");
    document.getElementById("finalPrice").value = finalTotal.toFixed(2);
    document.getElementById("mmuStatus").value = isMMU ? "Yes" : "No";
    
    // Order ID
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

// 10. THANK YOU PAGE
function showThankYou() {
  const orderID = localStorage.getItem("orderID");
  const total = localStorage.getItem("lastOrderTotal");
  const waLink = document.getElementById("waLink");

  if (document.getElementById("dispOrderID")) {
    document.getElementById("dispOrderID").innerText = orderID;
    document.getElementById("dispTotal").innerText = "RM" + total;
  }
  if (waLink) {
    const text = `Hi! Order ID: ${orderID}. Total: RM${total}. Sending payment proof!`;
    waLink.href = `https://wa.me/60166113563?text=${encodeURIComponent(text)}`;
  }
}

document.addEventListener("DOMContentLoaded", updateCartCount);
