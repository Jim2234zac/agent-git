// Test database connection
const { initVercelDB } = require('./vercel-init');

async function testConnection() {
  console.log('🧪 Testing database connection...');
  
  const success = await initVercelDB();
  
  if (success) {
    console.log('✅ Database connection successful!');
  } else {
    console.log('❌ Database connection failed!');
    console.log('💡 Make sure POSTGRES_URL is set correctly');
  }
}

testConnection();
