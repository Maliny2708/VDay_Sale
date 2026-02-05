/* script.js */
console.log("Script loaded!"); 

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// --- GLOBAL VARIABLES ---
let currentProduct = {};
let counts = { apple: 0, cheese: 0, earring: 0, bracelet: 0, charm: 0 };

// 1. UPDATE NAV CART COUNT
function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (el) el.innerText = cart.length;
}

// 2. OPEN THE POPUP
function openSmartModal(name, price, cakeLimit, accLimit) {
  currentProduct = { name, price, cakeLimit, accLimit };
  
  // Reset counts
  counts = { apple: 0, cheese: 0, earring: 0, bracelet: 0, charm: 0 };
  document.getElementById("qtyApple").innerText = "0";
  document.getElementById("qtyCheese").innerText = "0";
  document.getElementById("qtyEarring").innerText = "0";
  document.getElementById("qtyBracelet").innerText = "0";
  document.getElementById("qtyCharm").innerText = "0";

  // Reset Card Section
  const cardCheck = document.getElementById("cardCheck");
  const cardText = document.getElementById("cardMessage");
  if (cardCheck) {
    cardCheck.checked = false;
    cardText.value = "";
    cardText.style.display = "none";
  }

  // Show/Hide Sections
  document.getElementById("cakeSection").style.display = cakeLimit > 0 ? "block" : "none";
  document.getElementById("accSection").style.display = accLimit > 0 ? "block" : "none";

  document.getElementById("modalTitle").innerText = `Customize: ${name}`;
  document.getElementById("flavorModal").style.display = "flex";
  
  updateModalUI();
}

// 3. CLOSE THE POPUP
function closeModal() {
  document.getElementById("flavorModal").style.display = "none";
}

// 4. CHANGE QUANTITY
function changeQty(type, change) {
  const isCake = (type === 'apple' || type === 'cheese');
  const limit = isCake ? currentProduct.cakeLimit : currentProduct.accLimit;
  const currentTotal = isCake 
    ? (counts.apple + counts.cheese)
    : (counts.earring + counts.bracelet + counts.charm);

  if (change > 0 && currentTotal < limit) {
    counts[type]++;
  } else if (change < 0 && counts[type] > 0) {
    counts[type]--;
  }
  updateModalUI();
}

// 5. TOGGLE CARD MESSAGE BOX
function toggleCard() {
  const checkbox = document.getElementById("cardCheck");
  const textarea = document.getElementById("cardMessage");
  textarea.style.display = checkbox.checked ? "block" : "none";
}

// 6. UPDATE POPUP UI
function updateModalUI() {
  document.getElementById("qtyApple").innerText = counts.apple;
  document.getElementById("qtyCheese").innerText = counts.cheese;
  document.getElementById("qtyEarring").innerText = counts.earring;
  document.getElementById("qtyBracelet").innerText = counts.bracelet;
  document.getElementById("qtyCharm").innerText = counts.charm;

  const totalCakes = counts.apple + counts.cheese;
  const totalAcc = counts.earring + counts.bracelet + counts.charm;
  const btn = document.getElementById("confirmBtn");
  
  let cakesOk = (currentProduct.cakeLimit === 0) || (totalCakes === currentProduct.cakeLimit);
  let accOk = (currentProduct.accLimit === 0) || (totalAcc === currentProduct.accLimit);

  if (!cakesOk) btn.innerText = `Pick more cakes`;
  else if (!accOk) btn.innerText = `Pick more accessories`;

  if (cakesOk && accOk) {
    btn.disabled = false;
    btn.style.background = "#ff6f91";
    btn.innerText = "Add to Cart 💖";
  } else {
    btn.disabled = true;
    btn.style.background = "#ccc";
  }
}

// 7. CONFIRM SELECTION
function confirmSelection() {
  let details = [];
  
  // Collect Flavors
  if (counts.apple > 0) details.push(`${counts.apple} Apple`);
  if (counts.cheese > 0) details.push(`${counts.cheese} Cheese`);
  if (counts.earring > 0) details.push(`${counts.earring} Earring`);
  if (counts.bracelet > 0) details.push(`${counts.bracelet} Bracelet`);
  if (counts.charm > 0) details.push(`${counts.charm} Charm`);

  // Collect Card Message
  const cardCheck = document.getElementById("cardCheck");
  const cardText = document.getElementById("cardMessage");
  if (cardCheck && cardCheck.checked && cardText.value.trim() !== "") {
    let cleanMsg = cardText.value.replace(/(\r\n|\n|\r)/gm, " "); 
    details.push(`[Card: "${cleanMsg}"]`);
  }

  const item = {
    id: Date.now(),
    bundle: currentProduct.name,
    price: currentProduct.price,
    details: details.join(", ") || "Standard"
  };

  cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));
  closeModal();
  updateCartCount();
  alert("Added to cart! 🛒");
}

// 8. ADD ACCESSORY DIRECTLY
function addAccessory(name, price) {
  cart.push({ id: Date.now(), bundle: name, price: price, details: "Standard" });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert("Added to cart!");
}

// 9. LOAD CART PAGE
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

// 10. CHECKOUT LOGIC
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
    
    // Save MMU status and Order ID for the Thank You page
    localStorage.setItem("isMMU", isMMU ? "true" : "false"); 
    
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

// 11. THANK YOU PAGE LOGIC (UPDATED)
function showThankYou() {
  const orderID = localStorage.getItem("orderID");
  const total = localStorage.getItem("lastOrderTotal");
  const isMMU = localStorage.getItem("isMMU") === "true"; // Retrieve MMU status
  const waLink = document.getElementById("waLink");

  if (document.getElementById("dispOrderID")) {
    document.getElementById("dispOrderID").innerText = orderID || "Error";
    document.getElementById("dispTotal").innerText = "RM" + (total || "0.00");
    
    // If they are an MMU student, show the extra line
    if (isMMU) {
       document.getElementById("dispMMU").style.display = "flex";
    } else {
       document.getElementById("dispMMU").style.display = "none";
    }
  }

  // Updated WhatsApp Message
  if (waLink) {
    const text = `Attached is the order details for payment and confirmation. Order ID: ${orderID}`;
    waLink.href = `https://wa.me/60166113563?text=${encodeURIComponent(text)}`;
  }
}

document.addEventListener("DOMContentLoaded", updateCartCount);
