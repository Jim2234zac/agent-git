// Load cart items
function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const tableNumber = localStorage.getItem('tableNumber');
  const cartItemsList = document.getElementById('cartItemsList');
  
  // Display table number
  if (tableNumber) {
    document.getElementById('displayTableNumber').textContent = tableNumber;
  }
  
  if (cart.length === 0) {
    cartItemsList.innerHTML = `
      <div class="empty-state">
        <p>${t('emptyCart')}</p>
        <a href="/menu" style="color: var(--primary-color); text-decoration: none; font-weight: 600;"><span>${t('backToMenu')}</span></a>
      </div>
    `;
    document.getElementById('checkoutBtn').disabled = true;
    updateSummary();
    return;
  }

  cartItemsList.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        ${item.notes ? `<div style="font-size: 12px; color: #666; margin-top: 3px;">📝 ${item.notes}</div>` : ''}
        <div class="cart-item-price">${t('price')}${item.price}</div>
      </div>
      <div class="cart-item-quantity">
        <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">−</button>
        <span style="width: 30px; text-align: center; font-weight: 600;">${item.quantity}</span>
        <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
      </div>
      <span style="font-weight: 700; color: var(--primary-color); margin: 0 10px;">${t('price')}${item.price * item.quantity}</span>
      <button class="remove-btn" onclick="removeItem(${index})">${t('remove')}</button>
    </div>
  `).join('');

  document.getElementById('checkoutBtn').disabled = false;
  updateSummary();
}

function updateQuantity(index, change) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (cart[index]) {
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
  }
}

function removeItem(index) {
  if (confirm(t('removeConfirm') || 'ยืนยันการลบรายการ?')) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
  }
}

function updateSummary() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = subtotal > 0 ? 0 : 0; // Free delivery
  const total = subtotal + delivery;
  const priceSymbol = t('price');

  document.getElementById('totalItems').textContent = totalItems;
  document.getElementById('subtotal').textContent = `${priceSymbol}${subtotal}`;
  document.getElementById('delivery').textContent = `${priceSymbol}${delivery}`;
  document.getElementById('totalPrice').textContent = `${priceSymbol}${total}`;
}

async function checkout() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const tableNumber = localStorage.getItem('tableNumber');
  const notes = document.getElementById('notes').value;

  if (!tableNumber) {
    alert(t('scanQRFirst'));
    return;
  }

  if (cart.length === 0) {
    alert(t('emptyCartError'));
    return;
  }

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tableNumber: parseInt(tableNumber),
        items: cart,
        totalPrice: totalPrice,
        notes: notes
      })
    });

    const result = await response.json();

    if (result.success) {
      // Clear cart
      localStorage.removeItem('cart');
      localStorage.setItem('tableNumber', tableNumber);

      // Show success message
      document.getElementById('cartItemsList').innerHTML = '';
      document.getElementById('checkoutBtn').style.display = 'none';
      document.getElementById('successAlert').style.display = 'block';
      const priceSymbol = t('price');
      const orderTime = new Date().toLocaleString(getCurrentLanguage() === 'th' ? 'th-TH' : 'en-US');
      document.getElementById('successMessage').textContent = t('successOrder');
      document.getElementById('successOrderNum').textContent = `${t('orderNumber')}: ${result.orderId}`;
      document.getElementById('successEstimate').textContent = `${t('yourTable')}: ${tableNumber} | ${orderTime}`;

      // Scroll to top
      window.scrollTo(0, 0);

      // Reset form
      setTimeout(() => {
        location.href = '/menu';
      }, 5000);
    } else {
      alert(t('orderError') + ': ' + result.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert(t('orderFailed'));
  }
}

// Initialize language
function initLanguage() {
  const lang = getCurrentLanguage();
  document.getElementById('headerTitle').textContent = t('title').substring(4); // Remove emoji
  document.getElementById('navMenu').textContent = t('menu');
  document.getElementById('navCart').textContent = t('cart');
  document.getElementById('cartSubtitle').textContent = t('cartSubtitle');
  document.getElementById('cartItemsTitle').textContent = t('cartItems');
  document.getElementById('orderSummaryTitle').textContent = t('orderSummary');
  document.getElementById('totalItemsLabel').textContent = t('totalItems') + ':';
  document.getElementById('subtotalLabel').textContent = t('subtotal') + ':';
  document.getElementById('deliveryLabel').textContent = t('delivery') + ':';
  document.getElementById('totalLabel').textContent = t('total') + ':';
  document.getElementById('yourTableLabel').textContent = t('yourTable');
  document.getElementById('notesLabel').textContent = t('notes') + ':';
  document.getElementById('notes').placeholder = t('notesPlaceholder');
  document.getElementById('checkoutBtn').textContent = t('confirmOrder');
  document.getElementById('addMoreLink').textContent = t('addMore');
  document.getElementById('emptyCartText').textContent = t('emptyCart');
  document.getElementById('backToMenuText').textContent = t('backToMenu');
  
  // Update language buttons
  const langTh = document.getElementById('langTh');
  const langEn = document.getElementById('langEn');
  if (lang === 'th') {
    langTh.classList.add('active');
    langEn.classList.remove('active');
  } else {
    langTh.classList.remove('active');
    langEn.classList.add('active');
  }
  
  updateSummaryLabels();
}

function updateSummaryLabels() {
  // Update price currency
  const priceSymbol = t('price');
  // This will be handled in the display functions
}

// Load cart on page load
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  loadCart();
});
