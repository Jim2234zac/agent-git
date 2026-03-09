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
        body { text-align: center; padding: 20px; }
        img { max-width: 400px; margin: 20px 0; }
        p { font-size: 24px; font-weight: bold; }
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
document.addEventListener('DOMContentLoaded', loadOrders);

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('qrModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
}
