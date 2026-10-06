/**
 * Update Existing Listings with Verification Status
 * Sets all existing listings to pending_admin_review
 */

const db = require('../db');

async function updateExistingListings() {
  try {
    console.log('🔄 Updating existing listings with verification status...');
    
    // Check if verification_status column exists
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'listings' 
        AND COLUMN_NAME = 'verification_status'
    `);
    
    if (columns.length === 0) {
      console.log('❌ verification_status column does not exist. Run add_verification_workflow.js first!');
      return;
    }
    
    // Update all NULL verification_status to pending_admin_review
    const [result] = await db.execute(`
      UPDATE listings 
      SET verification_status = 'pending_admin_review'
      WHERE verification_status IS NULL
    `);
    
    console.log(`✅ Updated ${result.affectedRows} listings to pending_admin_review status`);
    
    // Show current counts
    const [[counts]] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN verification_status = 'pending_admin_review' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN verification_status = 'assigned_for_verification' THEN 1 ELSE 0 END) as assigned,
        SUM(CASE WHEN verification_status = 'officer_approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN verification_status IS NULL THEN 1 ELSE 0 END) as null_status
      FROM listings
    `);
    
    console.log('\n📊 Current Verification Status:');
    console.log(`   Total listings: ${counts.total}`);
    console.log(`   Pending admin review: ${counts.pending}`);
    console.log(`   Assigned to officers: ${counts.assigned}`);
    console.log(`   Approved: ${counts.approved}`);
    console.log(`   NULL status: ${counts.null_status}`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    throw err;
  }
}

// Run if called directly
if (require.main === module) {
  updateExistingListings()
    .then(() => {
      console.log('✅ Migration complete!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Migration failed:', err);
      process.exit(1);
    });
}

module.exports = updateExistingListings;
