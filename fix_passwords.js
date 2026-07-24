const db = require('./database/db');
const bcrypt = require('bcrypt');

async function fixPasswords() {
  try {
    console.log('Fixing admin user passwords...');
    
    // Generate proper bcrypt hashes
    const municipalityPassword = await bcrypt.hash('g2b', 12);
    const transportPassword = await bcrypt.hash('g2b', 12);
    const superAdminPassword = await bcrypt.hash('superadmin123', 12);
    const adminPassword = await bcrypt.hash('admin', 12);
    
    console.log('Generated password hashes');
    
    // Delete existing users
    await db.execute('DELETE FROM admin_users WHERE username IN (?, ?)', ['muni_officer', 'trans_officer']);
    console.log('Deleted existing users');
    
    // Re-insert users with correct passwords
    await db.execute(`
      INSERT INTO admin_users (username, password_hash, full_name, role, is_active) 
      VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)
    `, [
      'muni_officer', municipalityPassword, 'Municipality Clerk Seat 02', 'g2b_municipality', true,
      'trans_officer', transportPassword, 'Transit Officer Seat 09', 'g2b_transport', true
    ]);
    console.log('✅ Users re-created with correct passwords');
    
    // Verify the users
    const [users] = await db.execute('SELECT id, username, full_name, role, is_active FROM admin_users WHERE username IN (?, ?)', ['muni_officer', 'trans_officer']);
    console.log('Updated users:', JSON.stringify(users, null, 2));
    
    console.log('\n📝 Credentials:');
    console.log('   - Municipality: muni_officer / g2b');
    console.log('   - Transport: trans_officer / g2b');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixPasswords();
