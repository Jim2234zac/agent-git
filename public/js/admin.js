// Category Management Functions
async function loadCategories() {
  try {
    const response = await fetch('/api/categories');
    const categories = await response.json();
    displayCategories(categories);
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

function displayCategories(categories) {
  const tbody = document.getElementById('categoriesTableBody');
  
  if (categories.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">ไม่มีหมวดหมู่</td></tr>';
    return;
  }

  tbody.innerHTML = categories.map(cat => `
    <tr>
      <td style="font-weight: 600; color: var(--primary-color);">${cat.id}</td>
      <td>${cat.name}</td>
      <td>${cat.name_en}</td>
      <td style="text-align: center;"><span style="background: var(--light-color); padding: 5px 10px; border-radius: 4px;" id="count_${cat.id}">-</span></td>
      <td>
        <button class="action-btn complete" onclick="editCategory('${cat.id}', '${cat.name}', '${cat.name_en}')" style="background-color: var(--secondary-color);">✏️ แก้ไข</button>
        <button class="action-btn delete" onclick="deleteCategory('${cat.id}')">🗑️ ลบ</button>
      </td>
    </tr>
  `).join('');
  
  // Count items in each category
  countItemsPerCategory(categories);
}

async function countItemsPerCategory(categories) {
  try {
    const response = await fetch('/api/menu');
    const menu = await response.json();
    
    categories.forEach(cat => {
      const count = menu.filter(item => item.category === cat.id).length;
      const countElement = document.getElementById(`count_${cat.id}`);
      if (countElement) {
        countElement.textContent = count;
      }
    });
  } catch (error) {
    console.error('Error counting items:', error);
  }
}

async function addCategory() {
  const id = document.getElementById('categoryId').value.trim().toLowerCase();
  const name = document.getElementById('categoryNameTh').value.trim();
  const name_en = document.getElementById('categoryNameEn').value.trim();

  if (!id || !name || !name_en) {
    alert('กรุณากอกข้อมูลที่จำเป็น (ID, ชื่อไทย, ชื่ออังกฤษ)');
    return;
  }

  // Validate ID format (alphanumeric and hyphens only)
  if (!/^[a-z0-9-]+$/.test(id)) {
    alert('ID ต้องเป็นตัวอักษรเล็ก ตัวเลข หรือขีดกลาง เท่านั้น');
    return;
  }

  try {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, name_en })
    });

    const result = await response.json();

    if (result.success) {
      alert('✓ เพิ่มหมวดหมู่สำเร็จ!');
      document.getElementById('categoryId').value = '';
      document.getElementById('categoryNameTh').value = '';
      document.getElementById('categoryNameEn').value = '';
      loadCategories();
      
      // Also update menu category select
      updateCategorySelect();
    } else {
      alert('❌ เกิดข้อผิดพลาด: ' + result.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('ไม่สามารถเพิ่มหมวดหมู่ได้');
  }
}

async function editCategory(id, name, name_en) {
  const newName = prompt('ชื่อไทย:', name);
  if (newName === null) return;

  const newNameEn = prompt('ชื่ออังกฤษ:', name_en);
  if (newNameEn === null) return;

  try {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, name_en: newNameEn })
    });

    const result = await response.json();

    if (result.success) {
      alert('✓ แก้ไขสำเร็จ!');
      loadCategories();
    } else {
      alert('❌ เกิดข้อผิดพลาด');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('ไม่สามารถแก้ไขได้');
  }
}

async function deleteCategory(id) {
  if (!confirm('ยืนยันการลบหมวดหมู่นี้?')) return;

  try {
    const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    const result = await response.json();

    if (result.success) {
      alert('✓ ลบสำเร็จ!');
      loadCategories();
      updateCategorySelect();
    } else {
      alert('❌ เกิดข้อผิดพลาด: ' + result.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('ไม่สามารถลบได้');
  }
}

function updateCategorySelect() {
  const categorySelect = document.getElementById('menuCategory');
  if (!categorySelect) return;
  
  fetch('/api/categories')
    .then(res => res.json())
    .then(categories => {
      const currentValue = categorySelect.value;
      categorySelect.innerHTML = '<option value="">-- เลือกหมวดหมู่ --</option>';
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
      });
      categorySelect.value = currentValue;
    })
    .catch(error => console.error('Error updating category select:', error));
}

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
    let imageSrc = undefined;
    let emoji = item.image || '🍽️';
    
    // Check if image is a data URL (base64)
    if (item.image && item.image.startsWith('data:')) {
      imageSrc = item.image;
      emoji = ''; // Don't show emoji if we have real image
    } else if (item.image && (item.image.startsWith('/') || item.image.startsWith('http'))) {
      imageSrc = item.image;
      emoji = ''; // Don't show emoji if we have real image
    }
    
    // Properly escape for onclick handler
    const escapedName = (item.name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const escapedImage = (item.image || '🍽️').substring(0, 50).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const escapedDesc = (item.description || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    
    let emojiStyle = '';
    if (imageSrc) {
      emojiStyle = ` style="background-image: url('${imageSrc}'); background-size: cover; background-position: center; font-size: 0; width: 60px; height: 60px; border-radius: 8px;"`;
    }

    return `
    <div class="menu-management-card">
      <div class="menu-card-header">
        <div class="menu-emoji"${emojiStyle}>
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
        <button class="menu-edit-btn" onclick="editMenuForm(${item.id}, '${escapedName}', ${item.price}, '${item.category}', '${escapedImage}', '${escapedDesc}')">✏️ แก้ไข</button>
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
    try {
      image = await uploadImage(imageFile);
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

// Upload image (convert to base64 for Vercel)
async function uploadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const base64Data = e.target.result.split(',')[1]; // Remove data URL prefix
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ image: base64Data })
        });
        
        if (response.ok) {
          const result = await response.json();
          resolve(result.imageUrl);
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Notification system
let lastOrderCount = 0;
let notificationSound = null;

// Initialize notification sound
function initNotificationSound() {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // 800Hz
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log('Audio not supported:', error);
  }
}

// Play notification sound
function playNotificationSound() {
  try {
    initNotificationSound();
  } catch (error) {
    console.log('Could not play sound:', error);
  }
}

// Show browser notification
function showBrowserNotification(order) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('🍽️ คำสั่งซื้อใหม่!', {
      body: `โต๊ะ ${order.table_number} - ราคา ฿${order.total_price}`,
      icon: '/favicon.ico',
      tag: 'new-order'
    });
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
}

// Show new order notification
function showNewOrderNotification(newOrders) {
  if (newOrders.length === 0) return;
  
  const latestOrder = newOrders[0];
  
  // Show notification alert
  const alert = document.getElementById('newOrderAlert');
  const details = document.getElementById('newOrderDetails');
  
  details.innerHTML = `โต๊ะ ${latestOrder.table_number} - ฿${latestOrder.total_price} - เมื่อ ${new Date(latestOrder.created_at).toLocaleTimeString('th-TH')}`;
  alert.style.display = 'block';
  
  // Show notification bell
  const bell = document.getElementById('notificationBell');
  const badge = document.getElementById('notificationBadge');
  
  bell.style.display = 'block';
  badge.textContent = newOrders.length;
  badge.classList.add('notification-badge-animate');
  
  // Play sound
  playNotificationSound();
  
  // Show browser notification
  showBrowserNotification(latestOrder);
  
  // Clear notification after 10 seconds
  setTimeout(() => {
    if (alert.style.display === 'block') {
      clearNotification();
    }
  }, 10000);
}

// Clear notification
function clearNotification() {
  const alert = document.getElementById('newOrderAlert');
  const bell = document.getElementById('notificationBell');
  const badge = document.getElementById('notificationBadge');
  
  alert.style.display = 'none';
  bell.style.display = 'none';
  badge.textContent = '0';
  badge.classList.remove('notification-badge-animate');
  
  // Reset last order count
  lastOrderCount = document.querySelectorAll('#ordersBody tr').length;
}

// Load orders
async function loadOrders() {
  try {
    const response = await fetch('/api/orders');
    const orders = await response.json();
    
    // Check for new orders
    if (orders.length > lastOrderCount && lastOrderCount > 0) {
      const newOrders = orders.slice(0, orders.length - lastOrderCount);
      showNewOrderNotification(newOrders);
    }
    
    // Update last order count
    if (lastOrderCount === 0) {
      lastOrderCount = orders.length;
    }
    
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
  
  const currentTime = new Date();
  ordersBody.innerHTML = orders.map((order, index) => {
    const createdTime = new Date(order.createdAt || order.created_at).toLocaleString('th-TH');
    const orderAge = currentTime - new Date(order.createdAt || order.created_at);
    const isNewOrder = orderAge < 60000; // Less than 1 minute = new order
    
    // Parse items - handle both array and JSON string from database
    let items = order.items;
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        items = [];
      }
    }
    
    const itemsText = items.map(item => {
      let itemStr = `${item.name} x${item.quantity}`;
      if (item.notes) {
        itemStr += ` (📝 ${item.notes})`;
      }
      return itemStr;
    }).join('; ');
    
    const statusColor = 
      order.status === 'pending' ? 'status-pending' :
      order.status === 'preparing' ? 'status-preparing' :
      'status-completed';
    const statusText = 
      order.status === 'pending' ? '⏳ รอรับ' :
      order.status === 'preparing' ? '👨‍🍳 กำลังเตรียม' :
      '✓ เสร็จแล้ว';

    const rowClass = isNewOrder ? 'new-order-row' : '';
    const newBadge = isNewOrder ? '<span style="background: #ff6b6b; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 5px;">NEW</span>' : '';

    return `
      <tr class="${rowClass}">
        <td><strong>โต๊ะ ${order.table_number || order.tableNumber}</strong>${newBadge}</td>
        <td>${itemsText}</td>
        <td>฿${order.total_price || order.totalPrice}</td>
        <td><span class="status-badge ${statusColor}">${statusText}</span></td>
        <td>${createdTime}</td>
        <td>
          ${order.status !== 'completed' ? `
            <button class="action-btn complete" onclick="updateOrderStatus(${order.id}, '${order.status === 'pending' ? 'preparing' : 'completed'}')">
              ${order.status === 'pending' ? '👨‍🍳' : '✓'}
            </button>
          ` : ''}
          <button class="action-btn delete delete-btn" onclick="deleteOrder(${order.id})">🗑️</button>
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
  const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total_price) || parseFloat(o.totalPrice) || 0), 0);

  document.getElementById('totalOrders').textContent = totalOrders;
  document.getElementById('pendingOrders').textContent = pendingOrders;
  document.getElementById('preparingOrders').textContent = preparingOrders;
  document.getElementById('completedOrders').textContent = completedOrders;
  document.getElementById('totalRevenue').textContent = `฿${totalRevenue.toFixed(2)}`;
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
  if (confirm('❌ ยืนยันการลบคำสั่งนี้?\n\nคำสั่งซื้อจะถูกลบทันทีและไม่สามารถกู้คืนได้!')) {
    try {
      // Show loading state
      const deleteBtn = event.target;
      const originalText = deleteBtn.innerHTML;
      deleteBtn.innerHTML = '⏳ กำลังลบ...';
      deleteBtn.disabled = true;

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove row immediately with animation
        const row = deleteBtn.closest('tr');
        row.style.transition = 'all 0.3s ease';
        row.style.opacity = '0';
        row.style.transform = 'translateX(-100%)';
        
        // Remove from DOM after animation
        setTimeout(() => {
          row.remove();
          // Update statistics
          updateStatisticsAfterDelete();
        }, 300);
        
        // Show success notification
        showDeleteSuccessNotification();
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('❌ ไม่สามารถลบคำสั่งได้ กรุณาลองใหม่');
      
      // Reset button
      const deleteBtn = event.target;
      deleteBtn.innerHTML = '🗑️';
      deleteBtn.disabled = false;
    }
  }
}

// Show delete success notification
function showDeleteSuccessNotification() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    z-index: 1000;
    animation: slideInRight 0.3s ease-out;
    display: flex;
    align-items: center;
    gap: 10px;
  `;
  notification.innerHTML = `
    <span style="font-size: 20px;">✅</span>
    <div>
      <div style="font-weight: bold;">ลบคำสั่งซื้อสำเร็จ!</div>
      <div style="font-size: 12px; opacity: 0.9;">รายการถูกลบจากระบบแล้ว</div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Update statistics after delete
function updateStatisticsAfterDelete() {
  const rows = document.querySelectorAll('#ordersBody tr');
  const orders = Array.from(rows).map(row => {
    const cells = row.cells;
    return {
      status: cells[3].textContent.includes('รอรับ') ? 'pending' : 
             cells[3].textContent.includes('กำลังเตรียม') ? 'preparing' : 'completed',
      total_price: parseFloat(cells[2].textContent.replace('฿', ''))
    };
  });
  
  updateStatistics(orders);
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
  loadCategories();
  updateCategorySelect();
  
  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
});

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('qrModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
}
