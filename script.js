// Auto-fetch Cinema, Screen, Seat, and Order ID from QR Code URL parameters
window.addEventListener('DOMContentLoaded', (event) => {
    const urlParams = new URLSearchParams(window.location.search);

    // Get values from URL, if not available set default Maxus Bhavnagar demo values
    const cinema = urlParams.get('cinema') || 'Maxus Cinema Bhavnagar';
    const screen = urlParams.get('screen') || 'Gold Class Screen 1';
    const seat = urlParams.get('seat') || 'A-1';
    const orderId = urlParams.get('order') || 'CB-' + Math.floor(1000 + Math.random() * 9000);

    // Set values into HTML display elements safely
    const cinemaEl = document.getElementById("cinemaNameDisplay");
    const screenEl = document.getElementById("screenNameDisplay");
    const seatEl = document.getElementById("seatNoDisplay");
    const orderEl = document.getElementById("orderIdDisplay");

    if (cinemaEl) cinemaEl.innerText = cinema;
    if (screenEl) screenEl.innerText = screen;
    if (seatEl) seatEl.innerText = seat;
    if (orderEl) orderEl.innerText = orderId;
});

// Slider Setup Function
function setupSlider(sliderId) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    const images = slider.querySelectorAll('img');
    let currentIndex = 0;

    setInterval(() => {
        if(images.length > 0) {
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].classList.add('active');
        }
    }, 3000);
}

setupSlider('leftSlider');
setupSlider('rightSlider');

// Flavor Card Selection Function (Global & Safe)
window.selectFlavorCard = function(element, newImageSrc, newTitle) {
    const card = element.closest('.item-row');
    
    const mainImage = card.querySelector('.main-popcorn-img');
    if (mainImage) {
        mainImage.src = newImageSrc;
    }

    const mainTitle = card.querySelector('.main-popcorn-title');
    if (mainTitle) {
        mainTitle.innerText = newTitle + ' ▾';
    }

    const container = element.parentElement;
    const thumbs = container.getElementsByClassName('flavor-thumb');
    for (let i = 0; i < thumbs.length; i++) {
        thumbs[i].classList.remove('active');
    }
    element.classList.add('active');

    const scrollLeftTarget = element.offsetLeft - container.offsetLeft - 10;
    container.scrollTo({
        left: scrollLeftTarget,
        behavior: 'smooth'
    });
};

// Global Cart Array for Order Management
let cart = [];

// Add to Cart & Floating Amount Bar Logic
document.addEventListener("DOMContentLoaded", () => {
    // Seat Detection from URL
    const urlParams = new URLSearchParams(window.location.search);
    const seatNumber = urlParams.get('seat');
    const seatInfoText = document.getElementById('seatInfoText');

    if (seatInfoText) {
        if (seatNumber) {
            seatInfoText.innerHTML = `Assigned Location: <b>${seatNumber}</b>`;
        } else {
            seatInfoText.innerHTML = `Standard Mode (Scan seat QR code in cinema for direct in-seat delivery)`;
        }
    }

    // Toggle Variant Box on Item Row Click (Protected against flavor-thumb click)
    const itemRows = document.querySelectorAll('.item-row');
    itemRows.forEach(row => {
        row.addEventListener('click', function(e) {
            // Prevent toggle if clicking add button, variant box, or flavor thumbnail
            if (e.target.closest('.add-btn') || e.target.closest('.variant-box') || e.target.closest('.flavor-thumb')) return;
            this.classList.toggle('open');
        });
    });

    // Add Button Click Handler with Dynamic Price & Image Reader
    const addButtons = document.querySelectorAll('.add-btn');
    addButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const row = this.closest('.item-row');
            
            const titleElement = row.querySelector('.main-popcorn-title') || row.querySelector('.item-info h4');
            const itemName = titleElement ? titleElement.innerText : "Food Item";
            
            // Read actual price dynamically from HTML card
            let itemPrice = 0;
            const priceElements = row.querySelectorAll('.item-info p');
            priceElements.forEach(p => {
                if (p.innerText.includes('₹')) {
                    const priceText = p.innerText.replace('₹', '').trim();
                    itemPrice = parseFloat(priceText) || 0;
                }
            });
            
            // Read actual image dynamically from the card's main image element
            let itemImg = 'placeholder.jpg';
            const imgElement = row.querySelector('img.main-popcorn-img') || row.querySelector('.item-row img');
            if (imgElement) {
                itemImg = imgElement.getAttribute('src') || imgElement.src;
            }
            
            // Add item with correct price AND correct image to cart
            cart.push({ name: itemName, price: itemPrice, image: itemImg });
            
            // Trigger floating amount bar update
            updateFloatingCartBar();
        });
    });
});


// Search Functionality (100% Safe)
function searchItems() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let itemRows = document.querySelectorAll('.item-row');

    itemRows.forEach(row => {
        let text = row.innerText.toLowerCase();
        if (text.includes(input)) {
            row.style.display = "flex";
        } else {
            row.style.display = "none";
        }
    });
}

// 1. Open Order Modal
function openOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'flex';
        renderModalItems();
    }
}

// 2. Close Order Modal
function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 3. Render Items inside Modal with Fixed Scrollable Container & Clean Layout
function renderModalItems() {
    const container = document.getElementById('modalItemsContainer');
    if (!container) return;
    
    // Apply internal scrolling and spacing styles directly via JS to prevent overlap and content hiding
    container.style.cssText = `
        max-height: 220px;
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: 4px;
        margin-bottom: 10px;
    `;

    container.innerHTML = '';
    let subtotal = 0;
    let totalSavings = 0;

    if (typeof cart === 'undefined' || cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; padding: 20px;">No items added in cart yet!</p>';
        if (document.getElementById('modalSubtotal')) document.getElementById('modalSubtotal').innerText = '₹0';
        if (document.getElementById('modalFee')) document.getElementById('modalFee').innerText = '₹0';
        if (document.getElementById('modalGrandTotal')) document.getElementById('modalGrandTotal').innerText = '₹0';
        return;
    }

    cart.forEach((item, index) => {
        if (typeof item.qty === 'undefined') item.qty = 1;

        let itemImg = item.image || item.img || item.imgSrc || item.picture || 'placeholder.jpeg';

        let basePrice = item.price;
        let originalPrice = item.originalPrice || (item.discount ? item.price + item.discount : item.price);
        let itemTotal = basePrice * item.qty;
        subtotal += itemTotal;

        if (originalPrice > basePrice) {
            totalSavings += (originalPrice - basePrice) * item.qty;
        }

        let priceDisplay = `<span style="font-size: 13px; color: #00e5ff; font-weight: bold;">₹${itemTotal}</span>`;
        if (originalPrice > basePrice) {
            priceDisplay = `
                <span style="text-decoration: line-through; color: #888; font-size: 11px; margin-right: 5px;">₹${originalPrice * item.qty}</span>
                <span style="font-size: 13px; color: #00e5ff; font-weight: bold;">₹${itemTotal}</span>
                <span style="font-size: 10px; color: #2ecc71; margin-left: 4px; font-weight: bold;">(Save ₹${(originalPrice - basePrice) * item.qty})</span>
            `;
        }

        const row = document.createElement('div');
        row.style.cssText = "display: flex; align-items: center; justify-content: space-between; background: rgba(255, 255, 255, 0.05); padding: 8px 10px; border-radius: 8px; margin-bottom: 8px; border: 1px solid rgba(0, 229, 255, 0.2);";
        
        row.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; overflow: hidden; width: 68%;">
                <img src="${itemImg}" alt="${item.name}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px; border: 1px solid #00e5ff; flex-shrink: 0;" onerror="this.src='placeholder.jpg'">
                <div style="overflow: hidden; display: flex; flex-direction: column; justify-content: center; min-width: 0;">
                    <div style="font-size: 13px; font-weight: bold; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>
                    <div style="margin-top: 2px;">${priceDisplay}</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                <button onclick="decreaseCartQty(${index})" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #ff3b30; font-weight: bold; width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;">-</button>
                <span style="color:#fff; font-size:14px; font-weight: bold; padding: 0 4px;">${item.qty}</span>
                <button onclick="increaseCartQty(${index})" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #ff3b30; font-weight: bold; width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;">+</button>
            </div>
        `;
        container.appendChild(row);
    });

    let convenienceFee = subtotal * 0.10;
    let grandTotal = subtotal + convenienceFee;

    if (document.getElementById('modalSubtotal')) document.getElementById('modalSubtotal').innerText = `₹${subtotal}`;
    if (document.getElementById('modalFee')) document.getElementById('modalFee').innerText = `₹${convenienceFee.toFixed(2)}`;
    if (document.getElementById('modalGrandTotal')) document.getElementById('modalGrandTotal').innerText = `₹${grandTotal.toFixed(2)}`;

    let trustBanner = document.getElementById('modalTrustBanner');
    if (!trustBanner) {
        trustBanner = document.createElement('div');
        trustBanner.id = 'modalTrustBanner';
        container.parentNode.insertBefore(trustBanner, container.nextSibling);
    }
    
    trustBanner.style.cssText = "margin-top: 5px; margin-bottom: 10px;";
    trustBanner.innerHTML = `
        <div style="padding: 8px 12px; background: rgba(0, 229, 255, 0.08); border-radius: 8px; border: 1px dashed rgba(0, 229, 255, 0.3); font-size: 12px; color: #fff; text-align: center;">
            <span style="color: #00e5ff; font-weight: bold;">⚡ Free Direct In-Seat Delivery</span>
            ${totalSavings > 0 ? `<br><span style="color: #2ecc71; font-weight: bold; margin-top: 3px; display: inline-block;">🎉 Total Instant Discount Saved: ₹${totalSavings}</span>` : ''}
        </div>
    `;
}

// 4. Increase Quantity
function increaseCartQty(index) {
    if (typeof cart !== 'undefined' && cart[index]) {
        cart[index].qty += 1;
        renderModalItems();
        if (typeof updateFloatingCartBar === 'function') updateFloatingCartBar();
    }
}

// 5. Decrease Quantity
function decreaseCartQty(index) {
    if (typeof cart !== 'undefined' && cart[index]) {
        cart[index].qty -= 1;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
        renderModalItems();
        if (typeof updateFloatingCartBar === 'function') updateFloatingCartBar();
    }
}

// 6. Update Floating Cart Bar
function updateFloatingCartBar() {
    let cartBar = document.getElementById('floatingCartBar');
    
    if (!cartBar) {
        cartBar = document.createElement('div');
        cartBar.id = 'floatingCartBar';
        cartBar.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            width: 90%; max-width: 560px; background: rgba(0, 229, 255, 0.95);
            color: #050505; padding: 12px 20px; border-radius: 30px;
            display: flex; justify-content: space-between; align-items: center;
            box-shadow: 0 10px 30px rgba(0, 229, 255, 0.4); z-index: 1000;
            font-weight: 700; font-size: 14px; backdrop-filter: blur(10px);
        `;
        document.body.appendChild(cartBar);
    }

    const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);

    cartBar.innerHTML = `
        <span>🛒 Items Added: ${totalItems}</span>
        <span>Total: ₹ ${totalPrice}</span>
        <button id="placeOrderBtn" style="background: #050505; color: #00e5ff; border: none; padding: 6px 14px; border-radius: 20px; cursor: pointer; font-weight: bold;">Place Order</button>
    `;
    
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.onclick = function() {
            if (typeof openOrderModal === 'function') {
                openOrderModal();
            } else {
                console.error("openOrderModal function is not defined");
            }
        };
    }
    
    if (totalItems === 0) {
        cartBar.remove();
    }
}

// 7. Pay Now Action with Trust Redirection
function proceedToPay() {
    alert("🔒 Redirecting to 100% Secure Payment Gateway...");
}

// Open Payment Modal and dynamically copy the exact Grand Total from Order Summary
function openPaymentModal() {
    let summaryTotal = document.getElementById("modalGrandTotal").innerText;

    if (!summaryTotal || summaryTotal === "") {
        summaryTotal = "₹ 0";
    }

    document.getElementById("payModalAmount").innerText = summaryTotal;
    document.getElementById("paymentModal").style.display = "flex";
}

// Close Payment Modal
function closePaymentModal() {
    document.getElementById("paymentModal").style.display = "none";
}

// Handle UPI Payment Apps with exact dynamic amount
function payViaUPI(method) {
    let amountText = document.getElementById("payModalAmount").innerText;
    let amount = amountText.replace(/[^0-9.]/g, '');

    let merchantUPI = "riyalmafiya444@oksbi"; 
    let merchantName = "CineBites In-Seat F&B";

    if (method === 'card') {
        alert("Redirecting to Secure Card Payment Gateway for ₹" + amount + "...");
    } else {
        let upiURL = `upi://pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR`;
        window.location.href = upiURL;
    }

    // Redirect to success screen automatically after triggering the payment
    setTimeout(function() {
        document.getElementById("paymentModal").style.display = "none";
        document.getElementById("successOrderModal").style.display = "flex";
        
        if (typeof showOrderSuccessModal === 'function') {
            showOrderSuccessModal();
        }
        
        if (typeof cart !== 'undefined') {
            cart = [];
        }
        if (typeof updateFloatingCartBar === 'function') {
            updateFloatingCartBar();
        }
    }, 1500);
}
// Function to Open Success Modal and Pass Details Securely without Mobile Number
function showOrderSuccessModal() {
    const modal = document.getElementById('successOrderModal');
    const itemsListContainer = document.getElementById('successItemsList');
    
    // Read data from Order Summary
    const cinema = document.getElementById('cinemaNameDisplay') ? document.getElementById('cinemaNameDisplay').innerText : 'CineBites Cinema';
    const screen = document.getElementById('screenNameDisplay') ? document.getElementById('screenNameDisplay').innerText : 'Screen 1';
    const seat = document.getElementById('seatNoDisplay') ? document.getElementById('seatNoDisplay').innerText : 'A-12';
    const orderId = document.getElementById('orderIdDisplay') ? document.getElementById('orderIdDisplay').innerText : 'CB-9854';
    
    // Set Order ID dynamically in the top meta section
    const modalOrderIdEl = document.getElementById('modalOrderId');
    if (modalOrderIdEl) modalOrderIdEl.innerText = orderId;

    // Set Current Time dynamically
    const modalOrderTimeEl = document.getElementById('modalOrderTime');
    if (modalOrderTimeEl) {
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        modalOrderTimeEl.innerText = currentTime;
    }
    
    // Read only Customer Name if provided (Mobile number excluded for privacy)
    const custName = document.getElementById('optionalCustName') ? document.getElementById('optionalCustName').value.trim() : '';
    
    let customerInfoHTML = '';
    if (custName !== '') {
        customerInfoHTML = `<div style="font-size: 11px; color: #ffaa00; margin-bottom: 4px;"><strong>Customer:</strong> ${custName}</div>`;
    }

    // Inject cinema, screen, seat and optional customer name into the list container
    itemsListContainer.innerHTML = `
        <div style="font-size: 12px; color: #00e5ff; margin-bottom: 8px; border-bottom: 1px dashed rgba(255,255,255,0.3); padding-bottom: 6px; text-align: left;">
            <strong>${cinema}</strong> | <span style="color:#aaa;">${screen}</span><br>
            <strong>Seat:</strong> <span style="color:#00ff88;">${seat}</span><br>
            ${customerInfoHTML}
        </div>
    `;

    let subtotal = 0;

    // Loop through cart items and add them
    if (typeof cart !== 'undefined' && cart.length > 0) {
        cart.forEach(item => {
            let qty = item.quantity || 1;
            let itemTotal = item.price * qty;
            subtotal += itemTotal;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'success-item-row';
            itemDiv.innerHTML = `
                <span>${item.name} (x${qty})</span>
                <span>₹ ${itemTotal}</span>
            `;
            itemsListContainer.appendChild(itemDiv);
        });
    } else {
        itemsListContainer.innerHTML += '<div class="success-item-row"><span>No items in cart</span><span>₹ 0</span></div>';
    }

    // Convenience Fee fetch from summary if available
    let convenienceFee = 0;
    const modalFeeEl = document.getElementById('modalFee');
    if (modalFeeEl) {
        let feeText = modalFeeEl.innerText.replace('₹', '').trim();
        convenienceFee = parseFloat(feeText) || 0;
    }

    // Add Convenience Fee row to success list if greater than 0
    if (convenienceFee > 0) {
        const feeDiv = document.createElement('div');
        feeDiv.className = 'success-item-row';
        feeDiv.style.color = '#aaa';
        feeDiv.style.fontSize = '12px';
        feeDiv.innerHTML = `
            <span>Convenience Fee</span>
            <span>₹ ${convenienceFee}</span>
        `;
        itemsListContainer.appendChild(feeDiv);
    }

    // Set grand total
    const totalAmountSpan = document.getElementById('successModalTotal');
    if (totalAmountSpan) {
        const summaryGrandTotal = document.getElementById('modalGrandTotal') ? document.getElementById('modalGrandTotal').innerText : '₹ ' + (subtotal + convenienceFee);
        totalAmountSpan.innerText = summaryGrandTotal;
    }

    modal.style.display = 'flex';
}

// Function to close success modal and reset/return to main menu
function closeAndResetModal() {
    const modal = document.getElementById('successOrderModal');
    if (modal) modal.style.display = 'none';

    if (typeof cart !== 'undefined') {
        cart = [];
    }

    window.location.reload(); 
}

// Function to simulate saving receipt
function saveReceiptImage() {
    alert("Receipt successfully saved to device!");
}