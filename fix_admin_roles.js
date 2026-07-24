const db = require('./database/db');

async function fixAdminRoles() {
  try {
    console.log('Updating admin_users schema...');
    await db.execute('ALTER TABLE admin_users MODIFY COLUMN role ENUM("super_admin", "admin", "g2b_municipality", "g2b_transport") DEFAULT "admin"');
    console.log('✅ Schema updated successfully');
    
    console.log('Updating user roles...');
    await db.execute('UPDATE admin_users SET role = "g2b_municipality" WHERE username = "muni_officer"');
    await db.execute('UPDATE admin_users SET role = "g2b_transport" WHERE username = "trans_officer"');
    console.log('✅ Roles updated successfully');
    
    const [users] = await db.execute('SELECT id, username, full_name, role, is_active FROM admin_users WHERE username IN (?, ?)', ['muni_officer', 'trans_officer']);
    console.log('Updated users:', JSON.stringify(users, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAdminRoles();
