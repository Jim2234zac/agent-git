// Get table number from URL
const urlParams = new URLSearchParams(window.location.search);
const tableNumber = urlParams.get('table');
let currentCategory = 'all';

// Update table info
if (tableNumber) {
  document.getElementById('tableInfo').textContent = `โต๊ะ: ${tableNumber}`;
  localStorage.setItem('tableNumber', tableNumber);
} else {
  const savedTable = localStorage.getItem('tableNumber');
  if (savedTable) {
    document.getElementById('tableInfo').textContent = `โต๊ะ: ${savedTable}`;
  } else {
    document.getElementById('tableSelection').style.display = 'block';
  }
}

function setTableNumber() {
  const table = document.getElementById('tableNumber').value;
  if (table && table > 0 && table <= 99) {
    localStorage.setItem('tableNumber', table);
    document.getElementById('tableInfo').textContent = `โต๊ะ: ${table}`;
    document.getElementById('tableSelection').style.display = 'none';
  } else {
    alert('กรุณากรอกหมายเลขโต๊ะที่ถูกต้อง (1-99)');
  }
}

// Load menu
async function loadMenu() {
  try {
    const response = await fetch('/api/menu');
    const menu = await response.json();
    displayMenu(menu);
    document.getElementById('loading').style.display = 'none';
  } catch (error) {
    console.error('Error loading menu:', error);
    document.getElementById('loading').innerHTML = '<p>❌ ไม่สามารถโหลดเมนู</p>';
  }
}

function displayMenu(menu) {
  const menuGrid = document.getElementById('menuGrid');
  
  if (menu.length === 0) {
    menuGrid.innerHTML = '<div class="empty-state"><p>😢 ไม่มีรายการอาหาร</p></div>';
    return;
  }

  menuGrid.innerHTML = menu.map(item => {
    const isImageUrl = item.image && (item.image.startsWith('/') || item.image.startsWith('http'));
    const imageSrc = isImageUrl ? item.image : undefined;
    const emoji = !isImageUrl ? item.image : '🍽️';

    return `
    <div class="menu-card" onclick="addToCart(${item.id}, '${item.name}', ${item.price})">
      <div class="menu-card-image" style="${imageSrc ? `background-image: url('${imageSrc}'); background-size: cover; background-position: center; font-size: 0;` : ''}">${imageSrc ? '' : emoji}</div>
      <div class="menu-card-content">
        <div class="menu-card-name">${item.name}</div>
        <div class="menu-card-description">${item.description}</div>
        <div class="menu-card-price">฿${item.price}</div>
        <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${item.id}, '${item.name}', ${item.price})">
          🛒 เพิ่มลงตะกร้า
        </button>
      </div>
    </div>
  `;
  }).join('');
}
      </div>
    </div>
  `).join('');
}

function filterMenu(category) {
  currentCategory = category;
  
  // Update active button
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  if (category === 'all') {
    loadMenu();
  } else {
    fetch(`/api/menu/category/${category}`)
      .then(res => res.json())
      .then(menu => displayMenu(menu))
      .catch(error => console.error('Error:', error));
  }
}

function addToCart(id, name, price) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Check if item already exists
  const existingItem = cart.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Show notification
  alert(`✓ เพิ่ม ${name} ลงตะกร้าแล้ว`);
}

// Load menu on page load
document.addEventListener('DOMContentLoaded', loadMenu);
