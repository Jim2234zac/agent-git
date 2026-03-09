const express = require('express');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Data files
const menuFile = path.join(__dirname, 'data', 'menu.json');
const ordersFile = path.join(__dirname, 'data', 'orders.json');

// Helper functions
const readJSON = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return [];
  }
};

const writeJSON = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Routes
app.get('/', (req, res) => {
  res.redirect('/menu');
});

// Generate QR Code for table
app.get('/generate-qr/:tableNumber', async (req, res) => {
  const { tableNumber } = req.params;
  const qrUrl = `${req.protocol}://${req.get('host')}/menu?table=${tableNumber}`;
  
  try {
    const qrCode = await QRCode.toDataURL(qrUrl);
    res.json({ success: true, qrCode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Menu page
app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'menu.html'));
});

// Cart page
app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

// Admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API: Get all menu items
app.get('/api/menu', (req, res) => {
  const menu = readJSON(menuFile);
  res.json(menu);
});

// API: Get menu by category
app.get('/api/menu/category/:category', (req, res) => {
  const menu = readJSON(menuFile);
  const filtered = menu.filter(item => item.category === req.params.category);
  res.json(filtered);
});

// API: Add order
app.post('/api/orders', (req, res) => {
  const { tableNumber, items, totalPrice } = req.body;
  const orders = readJSON(ordersFile);
  const order = {
    id: Date.now(),
    tableNumber,
    items,
    totalPrice,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  writeJSON(ordersFile, orders);
  res.json({ success: true, order });
});

// API: Get all orders (for admin)
app.get('/api/orders', (req, res) => {
  const orders = readJSON(ordersFile);
  res.json(orders);
});

// API: Update order status
app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const orders = readJSON(ordersFile);
  const order = orders.find(o => o.id == id);
  
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  
  order.status = status;
  writeJSON(ordersFile, orders);
  res.json({ success: true, order });
});

// API: Delete order
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  let orders = readJSON(ordersFile);
  orders = orders.filter(o => o.id != id);
  writeJSON(ordersFile, orders);
  res.json({ success: true });
});

// API: Add new menu item
app.post('/api/menu', (req, res) => {
  const { name, description, price, category, image } = req.body;
  const menu = readJSON(menuFile);
  
  if (!name || !price || !category) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  
  const newItem = {
    id: menu.length > 0 ? Math.max(...menu.map(m => m.id)) + 1 : 1,
    name,
    description: description || '',
    price: parseFloat(price),
    category,
    image: image || '🍽️'
  };
  
  menu.push(newItem);
  writeJSON(menuFile, menu);
  res.json({ success: true, item: newItem });
});

// API: Update menu item
app.put('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, image } = req.body;
  const menu = readJSON(menuFile);
  const item = menu.find(m => m.id == id);
  
  if (!item) {
    return res.status(404).json({ success: false, error: 'Menu item not found' });
  }
  
  if (name) item.name = name;
  if (description) item.description = description;
  if (price) item.price = parseFloat(price);
  if (category) item.category = category;
  if (image) item.image = image;
  
  writeJSON(menuFile, menu);
  res.json({ success: true, item });
});

// API: Delete menu item
app.delete('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  let menu = readJSON(menuFile);
  menu = menu.filter(m => m.id != id);
  writeJSON(menuFile, menu);
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`QR Code Generator: http://localhost:${PORT}/generate-qr/:tableNumber`);
});
