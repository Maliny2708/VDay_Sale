/* script.js */
console.log("Script loaded!"); 

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// --- GLOBAL VARIABLES ---
let currentProduct = {};
// We track every design separately
let counts = { 
  apple: 0, cheese: 0, 
  earring1: 0, earring2: 0, earring3: 0, earring4: 0, earring5: 0,
  bracelet: 0, charm: 0 
};

// 1. UPDATE NAV CART COUNT
function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (el) el.innerText = cart.length;
}

// 2. OPEN THE POPUP
function openSmartModal(name, price, cakeLimit, accLimit) {
  currentProduct = { name, price, cakeLimit, accLimit };
  
  // Reset all counts
  counts = { 
    apple: 0, cheese: 0, 
    earring1: 0, earring2: 0, earring3: 0, earring4: 0, earring5: 0,
    bracelet: 0, charm: 0 
  };
  
  // Reset UI Display
  document.getElementById("qtyApple").innerText = "0";
  document.getElementById("qtyCheese").innerText = "0";
  document.getElementById("qtyEarring1").innerText = "0";
  document.getElementById("qtyEarring2").innerText = "0";
  document.getElementById("qtyEarring3").innerText = "0";
  document.getElementById("qtyEarring4").innerText = "0";
  document.getElementById("qtyEarring5").innerText = "0";
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

  // Show or Hide sections depending on what we are buying
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
  
  const currentCakeTotal = counts.apple + counts.cheese;
  
  // Accessories Total = All designs + bracelet + charm
  const currentAccTotal = 
    counts.earring1 + counts.earring2 + counts.earring3 + counts.earring4 + counts.earring5 + 
    counts.bracelet + counts.charm;

  const currentTotal = isCake ? currentCakeTotal : currentAccTotal;

  // Allow add if under limit, Allow subtract if above 0
  if (change > 0 && currentTotal < limit) {
    counts[type]++;
  } else if (change < 0 && counts[type] > 0) {
    counts[type]--;
  }
  updateModalUI();
}

// 5. TOGGLE CARD
function toggleCard() {
  const checkbox = document.getElementById("cardCheck");
  const textarea = document.getElementById("cardMessage");
  textarea.style.display = checkbox.checked ? "block" : "none";
}

// 6. UPDATE UI & BUTTON STATE
function updateModalUI() {
  document.getElementById("qtyApple").innerText = counts.apple;
  document.getElementById("qtyCheese").innerText = counts.cheese;
  document.getElementById("qtyEarring1").innerText = counts.earring1;
  document.getElementById("qtyEarring2").innerText = counts.earring2;
  document.getElementById("qtyEarring3").innerText = counts.earring3;
  document.getElementById("qtyEarring4").innerText = counts.earring4;
  document.getElementById("qtyEarring5").innerText = counts.earring5;
  document.getElementById("qtyBracelet").innerText = counts.bracelet;
  document.getElementById("qtyCharm").innerText = counts.charm;

  const totalCakes = counts.apple + counts.cheese;
  const totalAcc = 
    counts.earring1 + counts.earring2 + counts.earring3 + counts.earring4 + counts.earring5 + 
    counts.bracelet + counts.charm;

  const btn = document.getElementById("confirmBtn");
  
  let cakesOk = (currentProduct.cakeLimit === 0) || (totalCakes === currentProduct.cakeLimit);
  
  let accOk = false;
  if (currentProduct.name === "Earrings") {
      // Ala Carte: Just need at least 1 item
      accOk = totalAcc > 0;
  } else {
      // Bundle: Must match limit exactly
      accOk = (currentProduct.accLimit === 0) || (totalAcc === currentProduct.accLimit);
  }

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
  
  if (counts.apple > 0) details.push(`${counts.apple} Apple`);
  if (counts.cheese > 0) details.push(`${counts.cheese} Cheese`);
  
  // Add specific designs to details
  if (counts.earring1 > 0) details.push(`${counts.earring1}x Earring(Design 1)`);
  if (counts.earring2 > 0) details.push(`${counts.earring2}x Earring(Design 2)`);
  if (counts.earring3 > 0) details.push(`${counts.earring3}x Earring(Design 3)`);
  if (counts.earring4 > 0) details.push(`${counts.earring4}x Earring(Design 4)`);
  if (counts.earring5 > 0) details.push(`${counts.earring5}x Earring(Design 5)`);
  
  if (counts.bracelet > 0) details.push(`${counts.bracelet} Bracelet`);
  if (counts.charm > 0) details.push(`${counts.charm} Charm`);

  const cardCheck = document.getElementById("cardCheck");
  const cardText = document.getElementById("cardMessage");
  if (cardCheck && cardCheck.checked && cardText.value.trim() !== "") {
    let cleanMsg = cardText.value.replace(/(\r\n|\n|\r)/gm, " "); 
    details.push(`[Card: "${cleanMsg}"]`);
  }
  
  // CALCULATE PRICE
  let finalPrice = currentProduct.price;
  
  // If we are buying Ala Carte Earrings, price is RM10 * Quantity
  if (currentProduct.name === "Earrings") {
      let qty = counts.earring1 + counts.earring2 + counts.earring3 + counts.earring4 + counts.earring5;
      finalPrice = qty * 10;
  }

  cart.push({
    id: Date.now(),
    bundle: currentProduct.name,
    price: finalPrice,
    details: details.join(", ") || "Standard"
  });

  localStorage.setItem("cart", JSON.stringify(cart));
  closeModal();
  updateCartCount();
  alert("Added to cart! 🛒");
}

// 8. ADD ACCESSORY DIRECTLY (For Bracelet/Charm Ala Carte)
function addAccessory(name, price) {
  cart.push({ id: Date.now(), bundle: name, price: price, details: "Standard" });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert("Added to cart!");
}

// 9. LOAD CART
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

// 10. CHECKOUT
function prepareCheckout() {
  const mmuCheckbox = document.getElementById("mmuCheck");
  const priceBox = document.getElementById("priceBox");
  const dateSelect = document.getElementById("dateSelect");
  const timeSelect = document.getElementById("timeSelect");
  
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
    document.getElementById("subtotalField").value = subtotal.toFixed(2);
    document.getElementById("finalPrice").value = finalTotal.toFixed(2);
    document.getElementById("mmuStatus").value = isMMU ? "Yes" : "No";
    
    localStorage.setItem("isMMU", isMMU ? "true" : "false"); 
    localStorage.setItem("lastOrderTotal", finalTotal.toFixed(2));

    let orderID = localStorage.getItem("orderID");
    if (!orderID) {
      orderID = "MB-" + Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem("orderID", orderID);
    }
    document.getElementById("orderID").value = orderID;
  }

  function updateDeliveryInfo() {
    if(dateSelect) document.getElementById("dateField").value = dateSelect.value;
    if(timeSelect) document.getElementById("timeField").value = timeSelect.value;
  }

  if (mmuCheckbox) mmuCheckbox.addEventListener("change", calculateTotal);
  if (dateSelect) dateSelect.addEventListener("change", updateDeliveryInfo);
  if (timeSelect) timeSelect.addEventListener("change", updateDeliveryInfo);

  calculateTotal();
}

// 11. SHOW THANK YOU & RESET LOGIC
function showThankYou() {
  const orderID = localStorage.getItem("orderID");
  const total = localStorage.getItem("lastOrderTotal");
  const isMMU = localStorage.getItem("isMMU") === "true"; 
  const waLink = document.getElementById("waLink");

  if (document.getElementById("dispOrderID")) {
    document.getElementById("dispOrderID").innerText = orderID || "Error";
    document.getElementById("dispTotal").innerText = "RM" + (total || "0.00");
    if (isMMU) document.getElementById("dispMMU").style.display = "flex";
  }

  if (waLink) {
    const text = `Attached is the order details for payment and confirmation.

                  Order ID: ${orderID}
                  Delivery/Pickup: ${method}
                  Address: ${address}
                  Total: ${total}`;
    
    waLink.setAttribute("href", `https://wa.me/60166113563?text=${encodeURIComponent(text)}`);
    
    waLink.addEventListener("click", function() {
       finishOrder();
    });
  }
}

// 12. FINISH ORDER (Reset everything)
function finishOrder() {
  localStorage.removeItem("cart");
  localStorage.removeItem("orderID");
  localStorage.removeItem("lastOrderTotal");
  
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
}

document.addEventListener("DOMContentLoaded", updateCartCount);




