const { Pool } = require('pg');
require('dotenv').config();

// ใช้ POSTGRES_URL สำหรับ Vercel Postgres ถ้ามี
const connectionString = process.env.POSTGRES_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'food_ordering_db'}`;

const pool = new Pool({
  connectionString,
  ssl: process.env.POSTGRES_URL ? { rejectUnauthorized: false } : false
});

// Test connection
pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('✗ Unexpected error on idle client', err);
});

// Export the pool
module.exports = pool;
