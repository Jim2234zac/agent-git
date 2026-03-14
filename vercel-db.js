// Simple persistent storage for Vercel using JSON files in public directory
const fs = require('fs');
const path = require('path');

const ordersFile = path.join(__dirname, 'public', 'orders.json');
const menuFile = path.join(__dirname, 'public', 'menu.json');
const categoriesFile = path.join(__dirname, 'public', 'categories.json');

// Initialize files if they don't exist
const initFile = (filePath, defaultData = []) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

initFile(ordersFile);
initFile(menuFile, [
  { id: 1, name: 'กระเพราไก่', description: 'กระเพราไก่รสเด็ด', price: 89, category: 'rice', image: '🍗' },
  { id: 2, name: 'ผัดไทย', description: 'ผัดไทยกุ้งสด', price: 120, category: 'noodles', image: '🍜' },
  { id: 3, name: 'ต้มยำกุ้ง', description: 'ต้มยำกุ้งแม่น้ำ', price: 150, category: 'soup', image: '🍲' }
]);
initFile(categoriesFile, [
  { id: 'appetizer', name: '🥘 อาหารจานเล็ก', name_en: 'Appetizers' },
  { id: 'noodles', name: '🍝 เส้นก๊วยเตี๋ยว', name_en: 'Noodles' },
  { id: 'rice', name: '🍚 ข้าว', name_en: 'Rice' },
  { id: 'curry', name: '🍛 แกง', name_en: 'Curry' },
  { id: 'soup', name: '🍜 น้ำซุป', name_en: 'Soup' },
  { id: 'beverage', name: '🥤 เครื่องดื่ม', name_en: 'Beverages' }
]);

module.exports = {
  readOrders: () => JSON.parse(fs.readFileSync(ordersFile, 'utf-8')),
  writeOrders: (orders) => fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2)),
  readMenu: () => JSON.parse(fs.readFileSync(menuFile, 'utf-8')),
  writeMenu: (menu) => fs.writeFileSync(menuFile, JSON.stringify(menu, null, 2)),
  readCategories: () => JSON.parse(fs.readFileSync(categoriesFile, 'utf-8')),
  writeCategories: (categories) => fs.writeFileSync(categoriesFile, JSON.stringify(categories, null, 2))
};
