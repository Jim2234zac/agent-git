const pool = require('./config');
const fs = require('fs');
const path = require('path');

// Initialize database with schema
async function initializeDatabase() {
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Execute the schema
    const client = await pool.connect();
    try {
      await client.query(schema);
      console.log('✓ Database schema initialized successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('✗ Error initializing database:', error);
    throw error;
  }
}

// Migrate menu items from JSON to database (one-time operation)
async function migrateMenuData() {
  try {
    const menuPath = path.join(__dirname, '..', 'data', 'menu.json');
    
    // Check if file exists
    if (!fs.existsSync(menuPath)) {
      console.log('ℹ No menu.json file to migrate');
      return;
    }

    const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));

    const client = await pool.connect();
    try {
      // Check if menu is already migrated
      const result = await client.query('SELECT COUNT(*) as count FROM menu_items');
      if (result.rows[0].count > 0) {
        console.log('ℹ Menu items already imported, skipping migration');
        return;
      }

      // Insert menu items
      for (const item of menuData) {
        await client.query(
          'INSERT INTO menu_items (name, description, price, category, image) VALUES ($1, $2, $3, $4, $5)',
          [item.name, item.description, item.price, item.category, item.image]
        );
      }

      console.log(`✓ Successfully migrated ${menuData.length} menu items to database`);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('✗ Error migrating menu data:', error);
    // Don't throw, continue server startup
  }
}

// Migrate orders data from JSON to database (one-time operation)
async function migrateOrdersData() {
  try {
    const ordersPath = path.join(__dirname, '..', 'data', 'orders.json');
    
    // Check if file exists
    if (!fs.existsSync(ordersPath)) {
      console.log('ℹ No orders.json file to migrate');
      return;
    }

    const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf-8'));

    if (ordersData.length === 0) {
      console.log('ℹ No orders to migrate');
      return;
    }

    const client = await pool.connect();
    try {
      // Check if orders are already migrated
      const result = await client.query('SELECT COUNT(*) as count FROM orders');
      if (result.rows[0].count > 0) {
        console.log('ℹ Orders already imported, skipping migration');
        return;
      }

      // Insert orders
      for (const order of ordersData) {
        await client.query(
          'INSERT INTO orders (table_number, items, total_price, status, notes, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            order.tableNumber,
            JSON.stringify(order.items),
            order.totalPrice,
            order.status || 'pending',
            order.notes || '',
            order.createdAt || new Date()
          ]
        );
      }

      console.log(`✓ Successfully migrated ${ordersData.length} orders to database`);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('✗ Error migrating orders data:', error);
    // Don't throw, continue server startup
  }
}

// Run initialization
async function runInit() {
  try {
    await initializeDatabase();
    await migrateMenuData();
    await migrateOrdersData();
    console.log('✓ Database initialization complete!');
  } catch (error) {
    console.error('✗ Database initialization failed:', error);
    process.exit(1);
  }
}

module.exports = { runInit };
