// Load cart items
function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartItemsList = document.getElementById('cartItemsList');
  
  if (cart.length === 0) {
    cartItemsList.innerHTML = `
      <div class="empty-state">
        <p>😢 ตะกร้าว่าง</p>
        <a href="/menu" style="color: var(--primary-color); text-decoration: none; font-weight: 600;">← กลับไปเลือกอาหาร</a>
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
        <div class="cart-item-price">฿${item.price}</div>
      </div>
      <div class="cart-item-quantity">
        <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">−</button>
        <span style="width: 30px; text-align: center; font-weight: 600;">${item.quantity}</span>
        <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
      </div>
      <span style="font-weight: 700; color: var(--primary-color); margin: 0 10px;">฿${item.price * item.quantity}</span>
      <button class="remove-btn" onclick="removeItem(${index})">ลบ</button>
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
  if (confirm('ยืนยันการลบรายการ?')) {
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

  document.getElementById('totalItems').textContent = totalItems;
  document.getElementById('subtotal').textContent = `฿${subtotal}`;
  document.getElementById('delivery').textContent = `฿${delivery}`;
  document.getElementById('totalPrice').textContent = `฿${total}`;
}

async function checkout() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const tableNumber = document.getElementById('tableNumber').value;
  const notes = document.getElementById('notes').value;

  if (!tableNumber) {
    alert('กรุณากรอกหมายเลขโต๊ะ');
    return;
  }

  if (cart.length === 0) {
    alert('ตะกร้าว่าง');
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
      document.getElementById('successTable').textContent = tableNumber;
      document.getElementById('successMessage').textContent = 
        `เวลาที่สั่ง: ${new Date().toLocaleString('th-TH')}\nราคารวม: ฿${totalPrice}`;

      // Scroll to top
      window.scrollTo(0, 0);

      // Reset form
      setTimeout(() => {
        location.href = '/menu';
      }, 5000);
    } else {
      alert('เกิดข้อผิดพลาด: ' + result.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('ไม่สามารถส่งคำสั่งได้');
  }
}

// Load cart on page load
document.addEventListener('DOMContentLoaded', loadCart);
