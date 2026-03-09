const express = require('express');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database
let useDatabase = true;
const pool = require('./db/config');
const { runInit } = require('./db/init');

// Data files (fallback for JSON mode)
const menuFile = path.join(__dirname, 'data', 'menu.json');
const ordersFile = path.join(__dirname, 'data', 'orders.json');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Helper functions for JSON fallback
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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

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
app.get('/api/menu', async (req, res) => {
  try {
    if (useDatabase) {
      const result = await pool.query('SELECT * FROM menu_items ORDER BY id');
      res.json(result.rows);
    } else {
      // JSON fallback
      const menu = readJSON(menuFile);
      res.json(menu);
    }
  } catch (error) {
    console.error('Error fetching menu:', error);
    // Fallback to JSON if database fails
    const menu = readJSON(menuFile);
    res.json(menu);
  }
});

// API: Get menu by category
app.get('/api/menu/category/:category', async (req, res) => {
  try {
    if (useDatabase) {
      const result = await pool.query(
        'SELECT * FROM menu_items WHERE category = $1 ORDER BY id',
        [req.params.category]
      );
      res.json(result.rows);
    } else {
      // JSON fallback
      const menu = readJSON(menuFile);
      const filtered = menu.filter(item => item.category === req.params.category);
      res.json(filtered);
    }
  } catch (error) {
    console.error('Error fetching menu by category:', error);
    // Fallback to JSON
    const menu = readJSON(menuFile);
    const filtered = menu.filter(item => item.category === req.params.category);
    res.json(filtered);
  }
});

// API: Upload image
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, imageUrl });
});

// API: Add order
app.post('/api/orders', async (req, res) => {
  const { tableNumber, items, totalPrice, notes } = req.body;
  try {
    if (useDatabase) {
      const result = await pool.query(
        'INSERT INTO orders (table_number, items, total_price, notes, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [tableNumber, JSON.stringify(items), totalPrice, notes || '', 'pending']
      );
      res.json({ success: true, orderId: result.rows[0].id, order: result.rows[0] });
    } else {
      // JSON fallback
      const orders = readJSON(ordersFile);
      const order = {
        id: Date.now(),
        tableNumber,
        items,
        totalPrice,
        status: 'pending',
        notes: notes || '',
        createdAt: new Date().toISOString()
      };
      orders.push(order);
      writeJSON(ordersFile, orders);
      res.json({ success: true, orderId: order.id, order });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    // Fallback to JSON
    const orders = readJSON(ordersFile);
    const order = {
      id: Date.now(),
      tableNumber,
      items,
      totalPrice,
      status: 'pending',
      notes: notes || '',
      createdAt: new Date().toISOString()
    };
    orders.push(order);
    writeJSON(ordersFile, orders);
    res.json({ success: true, orderId: order.id, order });
  }
});

// API: Get all orders (for admin)
app.get('/api/orders', async (req, res) => {
  try {
    if (useDatabase) {
      const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
      res.json(result.rows);
    } else {
      // JSON fallback
      const orders = readJSON(ordersFile);
      res.json(orders);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    // Fallback to JSON
    const orders = readJSON(ordersFile);
    res.json(orders);
  }
});

// API: Update order status
app.put('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (useDatabase) {
      const result = await pool.query(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
      
      res.json({ success: true, order: result.rows[0] });
    } else {
      // JSON fallback
      let orders = readJSON(ordersFile);
      const order = orders.find(o => o.id == id);
      
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
      
      order.status = status;
      writeJSON(ordersFile, orders);
      res.json({ success: true, order });
    }
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Delete order
app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (useDatabase) {
      await pool.query('DELETE FROM orders WHERE id = $1', [id]);
      res.json({ success: true });
    } else {
      // JSON fallback
      let orders = readJSON(ordersFile);
      orders = orders.filter(o => o.id != id);
      writeJSON(ordersFile, orders);
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Add new menu item
app.post('/api/menu', async (req, res) => {
  const { name, description, price, category, image } = req.body;
  
  // Validation
  if (!name || !price || !category) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  
  try {
    if (useDatabase) {
      const result = await pool.query(
        'INSERT INTO menu_items (name, description, price, category, image) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, description || '', parseFloat(price), category, image || '🍽️']
      );
      res.json({ success: true, item: result.rows[0] });
    } else {
      // JSON fallback
      const menu = readJSON(menuFile);
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
    }
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Update menu item
app.put('/api/menu/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, image } = req.body;
  
  try {
    if (useDatabase) {
      const result = await pool.query(
        'UPDATE menu_items SET name = COALESCE($1, name), description = COALESCE($2, description), price = COALESCE($3, price), category = COALESCE($4, category), image = COALESCE($5, image), updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
        [name, description, price ? parseFloat(price) : null, category, image, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Menu item not found' });
      }
      
      res.json({ success: true, item: result.rows[0] });
    } else {
      // JSON fallback
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
    }
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Delete menu item
app.delete('/api/menu/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (useDatabase) {
      await pool.query('DELETE FROM menu_items WHERE id = $1', [id]);
      res.json({ success: true });
    } else {
      // JSON fallback
      let menu = readJSON(menuFile);
      menu = menu.filter(m => m.id != id);
      writeJSON(menuFile, menu);
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
async function startServer() {
  try {
    // Initialize database
    const dbSuccess = await runInit();
    useDatabase = dbSuccess;
    
    if (useDatabase) {
      console.log('✓ Using PostgreSQL database');
    } else {
      console.log('⚠️  Using JSON files (PostgreSQL connection failed)');
    }
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`✓ Server is running on http://localhost:${PORT}`);
      console.log(`✓ Menu: http://localhost:${PORT}/menu`);
      console.log(`✓ Cart: http://localhost:${PORT}/cart`);
      console.log(`✓ Admin: http://localhost:${PORT}/admin`);
      console.log(`✓ QR Code: http://localhost:${PORT}/generate-qr/:tableNumber`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
