// Get table number from URL
const urlParams = new URLSearchParams(window.location.search);
const tableNumber = urlParams.get('table');
let currentCategory = 'all';

// Initialize language
function initLanguage() {
  const lang = getCurrentLanguage();
  document.getElementById('headerTitle').textContent = t('title').substring(4); // Remove emoji
  document.getElementById('navMenu').textContent = t('menu');
  document.getElementById('navCart').textContent = t('cart');
  document.getElementById('confirmTableBtn').textContent = t('confirmTable');
  document.getElementById('tableNumber').placeholder = t('enterTableNumber');
  document.getElementById('loadingText').textContent = t('loading');
  
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
  
  // Update category buttons
  updateCategoryButtons();
}

function updateCategoryButtons() {
  const categories = ['all', 'appetizer', 'noodles', 'rice', 'curry', 'soup', 'beverage'];
  document.querySelectorAll('.category-btn').forEach(btn => {
    const key = btn.dataset.key;
    if (categories.includes(key)) {
      btn.textContent = t(key);
    }
  });
}

// Update table info
function updateTableInfo() {
  if (tableNumber) {
    document.getElementById('tableInfo').textContent = `${t('table')}: ${tableNumber}`;
    localStorage.setItem('tableNumber', tableNumber);
  } else {
    const savedTable = localStorage.getItem('tableNumber');
    if (savedTable) {
      document.getElementById('tableInfo').textContent = `${t('table')}: ${savedTable}`;
    } else {
      document.getElementById('tableSelection').style.display = 'block';
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  updateTableInfo();
  loadMenu();
});

function setTableNumber() {
  const table = document.getElementById('tableNumber').value;
  if (table && table > 0 && table <= 99) {
    localStorage.setItem('tableNumber', table);
    document.getElementById('tableInfo').textContent = `${t('table')}: ${table}`;
    document.getElementById('tableSelection').style.display = 'none';
  } else {
    alert(t('invalidTable'));
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
    document.getElementById('loading').innerHTML = `<p>${t('loadError')}</p>`;
  }
}

function displayMenu(menu) {
  const menuGrid = document.getElementById('menuGrid');
  
  if (menu.length === 0) {
    menuGrid.innerHTML = `<div class="empty-state"><p>${t('noItems')}</p></div>`;
    return;
  }

  menuGrid.innerHTML = menu.map(item => {
    const isImageUrl = item.image && (item.image.startsWith('/') || item.image.startsWith('http'));
    const imageSrc = isImageUrl ? item.image : undefined;
    const emoji = !isImageUrl ? item.image : '🍽️';
    
    // Properly escape strings for HTML attributes
    const escapedName = (item.name || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const escapedDesc = (item.description || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    let imageStyle = '';
    if (imageSrc) {
      imageStyle = `style="background-image: url('${imageSrc}'); background-size: cover; background-position: center; font-size: 0;"`;
    }

    return `
    <div class="menu-card" onclick="addToCart(${item.id}, '${escapedName}', ${item.price})">
      <div class="menu-card-image" ${imageStyle}>${imageSrc ? '' : emoji}</div>
      <div class="menu-card-content">
        <div class="menu-card-name">${item.name}</div>
        <div class="menu-card-description">${item.description}</div>
        <div class="menu-card-price">${t('price')}${item.price}</div>
        <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${item.id}, '${escapedName}', ${item.price})">
          ${t('addToCart')}
        </button>
      </div>
    </div>
  `;
  }).join('');
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
