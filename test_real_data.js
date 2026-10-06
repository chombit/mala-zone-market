/**
 * Test Real Data from Database
 * Verifies verification workflow is using real database data
 */

const db = require('./database/db');

async function testRealData() {
  console.log('🧪 Testing Real Data from Database\n');
  
  try {
    // Test 1: Count listings by status
    console.log('📊 Test 1: Verification Status Counts');
    const [[counts]] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN verification_status = 'pending_admin_review' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN verification_status = 'assigned_for_verification' THEN 1 ELSE 0 END) as assigned,
        SUM(CASE WHEN verification_status = 'officer_approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN verification_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN verification_status IS NULL THEN 1 ELSE 0 END) as null_status
      FROM listings
    `);
    
    console.log(`   Total listings: ${counts.total}`);
    console.log(`   Pending admin review: ${counts.pending}`);
    console.log(`   Assigned to officers: ${counts.assigned}`);
    console.log(`   Approved: ${counts.approved}`);
    console.log(`   Rejected: ${counts.rejected}`);
    console.log(`   NULL status: ${counts.null_status}`);
    
    if (counts.null_status > 0) {
      console.log('   ⚠️  Warning: Some listings have NULL status');
    } else {
      console.log('   ✅ All listings have verification_status set');
    }
    
    // Test 2: Sample listings
    console.log('\n📋 Test 2: Sample Pending Listings');
    const [pending] = await db.execute(`
      SELECT id, title_en, category, verification_status, created_at
      FROM listings
      WHERE verification_status = 'pending_admin_review'
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    if (pending.length > 0) {
      pending.forEach(l => {
        console.log(`   #${l.id}: ${l.title_en.substring(0, 40)} | ${l.category} | ${l.verification_status}`);
      });
      console.log(`   ✅ Found ${pending.length} pending listings`);
    } else {
      console.log('   ℹ️  No pending listings found');
    }
    
    // Test 3: G2B Officers
    console.log('\n👮 Test 3: G2B Officers');
    const [officers] = await db.execute(`
      SELECT id, username, full_name, role, city, is_active
      FROM admin_users
      WHERE role IN ('muni_officer', 'trans_officer', 'g2b_municipality', 'g2b_transport')
      ORDER BY role, city
    `);
    
    if (officers.length > 0) {
      officers.forEach(o => {
        console.log(`   ${o.username} (${o.full_name}) - ${o.role} - ${o.city || 'Any'} - ${o.is_active ? 'Active' : 'Inactive'}`);
      });
      console.log(`   ✅ Found ${officers.length} G2B officers`);
    } else {
      console.log('   ⚠️  No G2B officers found - create some first!');
    }
    
    // Test 4: Stats API simulation
    console.log('\n📈 Test 4: Stats API Response Simulation');
    const [[stats]] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN verification_status = 'pending_admin_review' THEN 1 ELSE 0 END) as pending_admin,
        SUM(CASE WHEN verification_status = 'assigned_for_verification' THEN 1 ELSE 0 END) as assigned_to_officers,
        SUM(CASE WHEN verification_status = 'officer_approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN verification_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN verification_status = 'officer_rejected' THEN 1 ELSE 0 END) as escalated,
        SUM(CASE WHEN sla_deadline < NOW() AND verification_status = 'assigned_for_verification' THEN 1 ELSE 0 END) as overdue
      FROM listings
      WHERE verification_status IS NOT NULL
    `);
    
    console.log('   API would return:');
    console.log('   {');
    console.log(`     "total": ${stats.total},`);
    console.log(`     "pending_admin": ${stats.pending_admin},`);
    console.log(`     "assigned_to_officers": ${stats.assigned_to_officers},`);
    console.log(`     "approved": ${stats.approved},`);
    console.log(`     "rejected": ${stats.rejected},`);
    console.log(`     "escalated": ${stats.escalated},`);
    console.log(`     "overdue": ${stats.overdue}`);
    console.log('   }');
    
    // Test 5: Verification workflow columns
    console.log('\n🔍 Test 5: Verification Columns Exist');
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'listings' 
        AND COLUMN_NAME IN (
          'verification_status', 
          'assigned_officer_id', 
          'verification_documents',
          'admin_notes',
          'officer_notes',
          'admin_reviewed_at',
          'officer_reviewed_at',
          'sla_deadline',
          'is_escalated'
        )
      ORDER BY COLUMN_NAME
    `);
    
    columns.forEach(col => {
      console.log(`   ✅ ${col.COLUMN_NAME} (${col.COLUMN_TYPE}) - ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    if (columns.length === 9) {
      console.log('   ✅ All verification columns exist');
    } else {
      console.log(`   ⚠️  Only ${columns.length}/9 columns found`);
    }
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(60));
    
    const allGood = 
      counts.null_status === 0 &&
      columns.length === 9 &&
      (counts.pending > 0 || counts.assigned > 0 || counts.approved > 0);
    
    if (allGood) {
      console.log('✅ All tests passed!');
      console.log('✅ Database is returning real data');
      console.log('✅ Verification workflow is ready');
      console.log('\n🚀 Next step: Start server with "npm run dev"');
    } else {
      console.log('⚠️  Some issues found:');
      if (counts.null_status > 0) {
        console.log(`   - ${counts.null_status} listings have NULL verification_status`);
        console.log('   Run: node database/migrations/update_existing_listings_verification.js');
      }
      if (columns.length < 9) {
        console.log('   - Missing verification columns');
        console.log('   Run: node database/migrations/add_verification_workflow.js');
      }
      if (officers.length === 0) {
        console.log('   - No G2B officers found');
        console.log('   Create officers in Admin Panel → Admin Users');
      }
    }
    
    console.log('='.repeat(60));
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    throw err;
  }
}

// Run tests
if (require.main === module) {
  testRealData()
    .then(() => {
      console.log('\n✅ Test complete!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Test failed:', err);
      process.exit(1);
    });
}

module.exports = testRealData;
