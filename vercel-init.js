// Vercel Database Initialization Script
const { Pool } = require('pg');

async function initVercelDB() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Initializing Vercel Postgres...');
    
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        table_number INTEGER NOT NULL,
        items JSONB NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_number);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    `);

    console.log('✅ Vercel Postgres initialized successfully!');
    
    // Insert default menu if empty
    const menuCount = await pool.query('SELECT COUNT(*) as count FROM menu_items');
    if (menuCount.rows[0].count === 0) {
      await pool.query(`
        INSERT INTO menu_items (name, description, price, category, image) VALUES
        ('กระเพราไก่', 'กระเพราไก่รสเด็ด', 89, 'rice', '🍗'),
        ('ผัดไทย', 'ผัดไทยกุ้งสด', 120, 'noodles', '🍜'),
        ('ต้มยำกุ้ง', 'ต้มยำกุ้งแม่น้ำ', 150, 'soup', '🍲'),
        ('ข้าวผัด', 'ข้าวผัดหมู', 60, 'rice', '🍚'),
        ('น้ำเปล่า', 'น้ำแข็งเปล่า', 10, 'beverage', '💧')
      `);
      console.log('✅ Default menu items added!');
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Vercel Postgres:', error);
    return false;
  } finally {
    await pool.end();
  }
}

module.exports = { initVercelDB };
