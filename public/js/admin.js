// Menu Management Functions
async function loadMenuItems() {
  try {
    const response = await fetch('/api/menu');
    const menu = await response.json();
    displayMenuItems(menu);
  } catch (error) {
    console.error('Error loading menu:', error);
  }
}

// Image preview
document.addEventListener('DOMContentLoaded', () => {
  const imageFileInput = document.getElementById('menuImageFile');
  if (imageFileInput) {
    imageFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          document.getElementById('previewImg').src = event.target.result;
          document.getElementById('imagePreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        document.getElementById('imagePreview').style.display = 'none';
      }
    });
  }
});

function displayMenuItems(menu) {
  const container = document.getElementById('menuListContainer');
  
  if (menu.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>📭 ไม่มีรายการเมนู</p></div>';
    return;
  }

  container.innerHTML = menu.map(item => {
    const isImageUrl = item.image && (item.image.startsWith('/') || item.image.startsWith('http'));
    const imageSrc = isImageUrl ? item.image : undefined;
    const emoji = !isImageUrl ? item.image : '🍽️';

    return `
    <div class="menu-management-card">
      <div class="menu-card-header">
        <div class="menu-emoji" style=${imageSrc ? `"background-image: url('${imageSrc}'); background-size: cover; background-position: center; font-size: 0;"` : ''}>
          ${imageSrc ? '' : emoji}
        </div>
        <div class="menu-info">
          <div class="menu-name">${item.name}</div>
          <div class="menu-category">${getCategoryName(item.category)}</div>
          <div class="menu-price">฿${item.price}</div>
        </div>
      </div>
      ${item.description ? `<div class="menu-description">${item.description}</div>` : ''}
      <div class="menu-actions">
        <button class="menu-edit-btn" onclick="editMenuForm(${item.id}, '${item.name}', ${item.price}, '${item.category}', '${(item.image || '🍽️').replace(/'/g, "\\'")}', '${(item.description || '').replace(/'/g, "\\'")}')">✏️ แก้ไข</button>
        <button class="menu-delete-btn" onclick="deleteMenuItem(${item.id})">🗑️ ลบ</button>
      </div>
    </div>
  `;
  }).join('');
}

function getCategoryName(category) {
  const categories = {
    appetizer: '🥘 อาหารจานเล็ก',
    noodles: '🍝 เส้นก๊วยเตี๋ยว',
    rice: '🍚 ข้าว',
    curry: '🍛 แกง',
    soup: '🍜 น้ำซุป',
    beverage: '🥤 เครื่องดื่ม'
  };
  return categories[category] || category;
}

async function addMenuItem() {
  const name = document.getElementById('menuName').value.trim();
  const price = parseFloat(document.getElementById('menuPrice').value);
  const category = document.getElementById('menuCategory').value;
  const emoji = document.getElementById('menuImage').value.trim() || '🍽️';
  const description = document.getElementById('menuDescription').value.trim();
  const imageFile = document.getElementById('menuImageFile').files[0];

  if (!name || !price || !category) {
    alert('กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, ราคา, หมวดหมู่)');
    return;
  }

  let image = emoji;

  // If image file is selected, upload it first
  if (imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const uploadResult = await uploadResponse.json();

      if (uploadResult.success) {
        image = uploadResult.imageUrl;
      } else {
        alert('❌ ไม่สามารถอัปโหลดรูปภาพได้');
        return;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
      return;
    }
  }

  try {
    const response = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, category, image, description })
    });

    const result = await response.json();

    if (result.success) {
      alert('✓ เพิ่มอาหารสำเร็จ!');
      document.getElementById('menuName').value = '';
      document.getElementById('menuPrice').value = '';
      document.getElementById('menuCategory').value = '';
      document.getElementById('menuImage').value = '';
      document.getElementById('menuImageFile').value = '';
      document.getElementById('menuDescription').value = '';
      document.getElementById('imagePreview').style.display = 'none';
      loadMenuItems();
    } else {
      alert('❌ เกิดข้อผิดพลาด: ' + result.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('ไม่สามารถเพิ่มอาหารได้');
  }
}

async function editMenuForm(id, name, price, category, image, description) {
  const newName = prompt('ชื่ออาหาร:', name);
  if (newName === null) return;

  const newPrice = prompt('ราคา:', price);
  if (newPrice === null) return;

  const newImage = prompt('Emoji/รูป:', image);
  if (newImage === null) return;

  const newDescription = prompt('รายละเอียด:', description);
  if (newDescription === null) return;

  try {
    const response = await fetch(`/api/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        price: parseFloat(newPrice),
        category,
        image: newImage || '🍽️',
        description: newDescription
      })
    });

    const result = await response.json();

    if (result.success) {
      alert('✓ แก้ไขสำเร็จ!');
      loadMenuItems();
    } else {
      alert('❌ เกิดข้อผิดพลาด');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('ไม่สามารถแก้ไขได้');
  }
}

async function deleteMenuItem(id) {
  if (!confirm('ยืนยันการลบรายการนี้?')) return;

  try {
    const response = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    const result = await response.json();

    if (result.success) {
      alert('✓ ลบสำเร็จ!');
      loadMenuItems();
    } else {
      alert('❌ เกิดข้อผิดพลาด');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('ไม่สามารถลบได้');
  }
}

// Load orders
async function loadOrders() {
  try {
    const response = await fetch('/api/orders');
    const orders = await response.json();
    displayOrders(orders);
    updateStatistics(orders);
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

function displayOrders(orders) {
  const ordersBody = document.getElementById('ordersBody');
  const emptyOrders = document.getElementById('emptyOrders');

  if (orders.length === 0) {
    ordersBody.innerHTML = '';
    emptyOrders.style.display = 'block';
    return;
  }

  emptyOrders.style.display = 'none';
  
  ordersBody.innerHTML = orders.map(order => {
    const createdTime = new Date(order.createdAt).toLocaleString('th-TH');
    const itemsText = order.items.map(item => `${item.name} x${item.quantity}`).join(', ');
    const statusColor = 
      order.status === 'pending' ? 'status-pending' :
      order.status === 'preparing' ? 'status-preparing' :
      'status-completed';
    const statusText = 
      order.status === 'pending' ? '⏳ รอรับ' :
      order.status === 'preparing' ? '👨‍🍳 กำลังเตรียม' :
      '✓ เสร็จแล้ว';

    return `
      <tr>
        <td><strong>โต๊ะ ${order.tableNumber}</strong></td>
        <td>${itemsText}</td>
        <td>฿${order.totalPrice}</td>
        <td><span class="status-badge ${statusColor}">${statusText}</span></td>
        <td>${createdTime}</td>
        <td>
          ${order.status !== 'completed' ? `
            <button class="action-btn complete" onclick="updateOrderStatus(${order.id}, '${order.status === 'pending' ? 'preparing' : 'completed'}')">
              ${order.status === 'pending' ? '👨‍🍳' : '✓'}
            </button>
          ` : ''}
          <button class="action-btn delete" onclick="deleteOrder(${order.id})">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

function updateStatistics(orders) {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const preparingOrders = orders.filter(o => o.status === 'preparing').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  document.getElementById('totalOrders').textContent = totalOrders;
  document.getElementById('pendingOrders').textContent = pendingOrders;
  document.getElementById('preparingOrders').textContent = preparingOrders;
  document.getElementById('completedOrders').textContent = completedOrders;
  document.getElementById('totalRevenue').textContent = `฿${totalRevenue}`;
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (response.ok) {
      loadOrders();
    }
  } catch (error) {
    console.error('Error updating order:', error);
  }
}

async function deleteOrder(orderId) {
  if (confirm('ยืนยันการลบคำสั่งนี้?')) {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadOrders();
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  }
}

async function generateQRCode(tableNumber) {
  if (!tableNumber) {
    tableNumber = prompt('กรุณากรอกหมายเลขโต๊ะ:');
  }

  if (!tableNumber || tableNumber <= 0 || tableNumber > 99) {
    alert('กรุณากรอกหมายเลขโต๊ะที่ถูกต้อง');
    return;
  }

  try {
    const response = await fetch(`/generate-qr/${tableNumber}`);
    const data = await response.json();

    if (data.success) {
      const container = document.getElementById('qrCodeContainer');
      container.innerHTML = `
        <img src="${data.qrCode}" alt="QR Code" style="max-width: 300px; border: 2px solid #333; padding: 10px;">
        <p style="margin-top: 10px; font-size: 18px; font-weight: bold;">โต๊ะที่ ${tableNumber}</p>
        <p style="color: #666; font-size: 14px;">สแกน QR code เพื่อสั่งอาหาร</p>
      `;
      document.getElementById('qrModal').style.display = 'block';
    } else {
      alert('ไม่สามารถสร้าง QR Code ได้');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('เกิดข้อผิดพลาด');
  }
}

async function showQRCode() {
  const tableNumber = document.getElementById('qrTableInput').value;
  
  if (!tableNumber || tableNumber <= 0 || tableNumber > 99) {
    alert('กรุณากรอกหมายเลขโต๊ะที่ถูกต้อง (1-99)');
    return;
  }

  try {
    const response = await fetch(`/generate-qr/${tableNumber}`);
    const data = await response.json();

    if (data.success) {
      const container = document.getElementById('qrImageContainer');
      container.innerHTML = `
        <img src="${data.qrCode}" alt="QR Code" style="max-width: 300px; border: 3px solid #333; padding: 15px; background: white; border-radius: 8px;">
        <p style="margin-top: 15px; font-size: 20px; font-weight: bold; color: var(--primary-color);">โต๊ะที่ ${tableNumber}</p>
        <p style="color: #666; font-size: 13px;">สแกน QR code นี้เพื่อสั่งอาหาร</p>
      `;
      document.getElementById('qrGeneratorResult').style.display = 'block';
      document.getElementById('qrTableInput').value = '';
    } else {
      alert('ไม่สามารถสร้าง QR Code ได้');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('เกิดข้อผิดพลาด');
  }
}

function printQRFromGenerator() {
  const container = document.getElementById('qrImageContainer');
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
    <head>
      <title>QR Code</title>
      <style>
        body { text-align: center; padding: 20px; font-family: Arial, sans-serif; }
        img { max-width: 600px; margin: 20px 0; }
        p { font-size: 24px; font-weight: bold; margin: 10px 0; }
        .label { font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      ${container.innerHTML}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}

function closeQRModal() {
  document.getElementById('qrModal').style.display = 'none';
}

function printQR() {
  const container = document.getElementById('qrCodeContainer');
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
    <head>
      <title>QR Code</title>
      <style>
        body { text-align: center; padding: 20px; font-family: Arial, sans-serif; }
        img { max-width: 600px; margin: 20px 0; }
        p { font-size: 24px; font-weight: bold; margin: 10px 0; }
      </style>
    </head>
    <body>
      ${container.innerHTML}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}

// Auto-refresh orders every 5 seconds
setInterval(loadOrders, 5000);

// Load orders on page load
document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
  loadMenuItems();
});

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('qrModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
}
