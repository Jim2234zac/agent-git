// Language translations
const translations = {
  th: {
    // Header & Navigation
    title: '🍽️ ระบบสั่งอาหารออนไลน์',
    menu: '🍴 เมนู',
    cart: '🛒 ตะกร้า',
    table: 'โต๊ะ',
    
    // Table Selection
    enterTableNumber: 'กรุณากรอกหมายเลขโต๊ะ',
    confirmTable: 'ยืนยันโต๊ะ',
    invalidTable: 'กรุณากรอกหมายเลขโต๊ะที่ถูกต้อง (1-99)',
    
    // Category Filter
    all: 'ทั้งหมด',
    appetizer: 'อาหารจานเล็ก',
    noodles: 'เส้นก๊วยเตี๋ยว',
    rice: 'ข้าว',
    curry: 'แกง',
    soup: 'น้ำซุป',
    beverage: 'เครื่องดื่ม',
    
    // Menu Items
    loading: '⏳ กำลังโหลดเมนู...',
    noItems: '😢 ไม่มีรายการอาหาร',
    loadError: '❌ ไม่สามารถโหลดเมนู',
    addToCart: '🛒 เพิ่มลงตะกร้า',
    price: '฿',
    
    // Cart Page
    cartSubtitle: 'ตะกร้าสินค้า',
    cartItems: 'รายการอาหารของคุณ',
    emptyCart: '😢 ตะกร้าว่าง',
    backToMenu: '← กลับไปเลือกอาหาร',
    orderSummary: '📋 สรุปการสั่งซื้อ',
    totalItems: 'รวมรายการ',
    subtotal: 'ราคารวม',
    delivery: 'ค่าจัดส่ง',
    total: 'รวมทั้งสิ้น',
    yourTable: 'โต๊ะของคุณ',
    notes: 'หมายเหตุเพิ่มเติม',
    notesPlaceholder: 'เช่น ไม่พีก ไม่เผ็ด เป็นต้น...',
    confirmOrder: '✓ ยืนยันการสั่งซื้อ',
    addMore: '← เพิ่มเติมอีกหรือไม่?',
    quantity: 'จำนวน',
    remove: 'ลบ',
    successOrder: '✓ สั่งอาหารสำเร็จ!',
    orderNumber: 'เลขที่สั่งอาหาร',
    estimatedTime: 'เวลาโดยประมาณ',
    removeConfirm: 'ยืนยันการลบรายการ?',
    scanQRFirst: 'กรุณาสแกน QR Code ของโต๊ะก่อน',
    emptyCartError: 'ตะกร้าว่าง',
    orderError: 'เกิดข้อผิดพลาด',
    orderFailed: 'ไม่สามารถส่งคำสั่งได้',
    
    // Language Toggle
    language: 'ภาษา'
  },
  en: {
    // Header & Navigation
    title: '🍽️ Online Food Ordering System',
    menu: '🍴 Menu',
    cart: '🛒 Cart',
    table: 'Table',
    
    // Table Selection
    enterTableNumber: 'Please enter table number',
    confirmTable: 'Confirm Table',
    invalidTable: 'Please enter valid table number (1-99)',
    
    // Category Filter
    all: 'All',
    appetizer: 'Appetizers',
    noodles: 'Noodles & Pasta',
    rice: 'Rice Dishes',
    curry: 'Curry',
    soup: 'Soup',
    beverage: 'Beverages',
    
    // Menu Items
    loading: '⏳ Loading menu...',
    noItems: '😢 No items available',
    loadError: '❌ Failed to load menu',
    addToCart: '🛒 Add to Cart',
    price: '$',
    
    // Cart Page
    cartSubtitle: 'Shopping Cart',
    cartItems: 'Your Items',
    emptyCart: '😢 Empty Cart',
    backToMenu: '← Back to Menu',
    orderSummary: '📋 Order Summary',
    totalItems: 'Total Items',
    subtotal: 'Subtotal',
    delivery: 'Delivery Fee',
    total: 'Total',
    yourTable: 'Your Table',
    notes: 'Additional Notes',
    notesPlaceholder: 'e.g. No spicy, no fish, etc...',
    confirmOrder: '✓ Confirm Order',
    addMore: '← Add More Items?',
    quantity: 'Quantity',
    remove: 'Remove',
    successOrder: '✓ Order Placed Successfully!',
    orderNumber: 'Order Number',
    estimatedTime: 'Estimated Time',
    removeConfirm: 'Confirm remove item?',
    scanQRFirst: 'Please scan table QR code first',
    emptyCartError: 'Cart is empty',
    orderError: 'Error',
    orderFailed: 'Failed to place order',
    
    // Language Toggle
    language: 'Language'
  }
};

// Get current language from localStorage or default to Thai
function getCurrentLanguage() {
  return localStorage.getItem('language') || 'th';
}

// Get translation text
function t(key) {
  const lang = getCurrentLanguage();
  return translations[lang][key] || translations['th'][key] || key;
}

// Set language and reload UI
function setLanguage(lang) {
  localStorage.setItem('language', lang);
  location.reload();
}
