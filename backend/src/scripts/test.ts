console.log('🚀 Test script starting...');
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());
console.log('Environment variables check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- DATABASE_URI:', process.env.DATABASE_URI ? 'Set (hidden)' : 'Not set');

try {
  require('../config/index');
  console.log('✅ Config loaded successfully');
} catch (error) {
  console.error('❌ Config loading error:', error);
}

console.log('🏁 Test script completed');
