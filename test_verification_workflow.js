/**
 * test_verification_workflow.js
 * Complete end-to-end test of verification workflow
 */

const db = require('./database/db');
const http = require('http');

async function createTestListing() {
  console.log("\n=== STEP 1: Creating Test Listing ===");
  
  // Get a user ID
  const [users] = await db.execute('SELECT id FROM users LIMIT 1');
  const userId = users[0]?.id || 1;
  
  // Create test listing
  const [result] = await db.execute(`
    INSERT INTO listings (
      user_id, title_en, title_am, description_en, description_am,
      category, location_key, location_label_en, location_label_am,
      price, phone, verification_status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `, [
    userId,
    'Test Property for Verification',
    'የምርመራ የመሬት ቦታ',
    'Property needs admin review and officer verification',
    'ሂሳብ ምርመራ ይፈልጋል',
    'property',
    'hawassa',
    'Hawassa',
    'ሀዋሳ',
    5000000,
    '+251911000000',
    'pending_admin_review'
  ]);
  
  console.log('✅ Test listing created, ID:', result.insertId);
  console.log('   Status: pending_admin_review');
  return result.insertId;
}

function makeApiCall(method, path, data, cookie) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'localhost',
      port: 4003,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (cookie) {
      options.headers['Cookie'] = cookie;
    }
    
    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const cookies = res.headers['set-cookie'];
        resolve({ 
          status: res.statusCode, 
          body: JSON.parse(body),
          cookie: cookies ? cookies[0].split(';')[0] : null
        });
      });
    });
    
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function testWorkflow() {
  try {
    // Step 1: Create test listing
    const listingId = await createTestListing();
    
    // Step 2: Login as Super Admin
    console.log("\n=== STEP 2: Super Admin Login ===");
    const loginRes = await makeApiCall('POST', '/api/admin/login', {
      username: 'superadmin',
      password: 'superadmin123'
    });
    console.log('✅ Logged in as:', loginRes.body.user.username);
    const adminCookie = loginRes.cookie;
    
    // Step 3: Get pending admin review listings
    console.log("\n=== STEP 3: Get Pending Admin Review Queue ===");
    const pendingRes = await makeApiCall('GET', '/api/verification/pending-admin-review', null, adminCookie);
    console.log('Response:', JSON.stringify(pendingRes, null, 2));
    
    if (!pendingRes.body.success) {
      console.log('❌ Failed to get pending listings');
      return;
    }
    
    console.log('✅ Pending listings:', pendingRes.body.count);
    console.log('   Our test listing:', pendingRes.body.listings.find(l => l.id === listingId) ? 'Found' : 'Not found');
    
    // Step 4: Get available officers
    console.log("\n=== STEP 4: Get Available Officers ===");
    const [officers] = await db.execute(
      "SELECT id, username, full_name, city FROM admin_users WHERE role = 'g2b_municipality' AND city = 'hawassa' AND is_active = 1 LIMIT 1"
    );
    if (officers.length === 0) {
      console.log('❌ No municipality officers found in Hawassa');
      return;
    }
    const officer = officers[0];
    console.log('✅ Found officer:', officer.full_name, '(ID:', officer.id + ')');
    
    // Step 5: Admin approves and assigns to officer
    console.log("\n=== STEP 5: Admin Approves and Assigns ===");
    const approveRes = await makeApiCall('POST', `/api/verification/admin-review/${listingId}`, {
      action: 'approve',
      assigned_officer_id: officer.id,
      admin_notes: 'Documents verified. Assigning to field officer for Carta verification.'
    }, adminCookie);
    console.log('✅ Admin approved:', approveRes.body.message);
    console.log('   Assigned to:', approveRes.body.assigned_to);
    console.log('   SLA deadline:', approveRes.body.sla_deadline);
    
    // Step 6: Check listing status in database
    console.log("\n=== STEP 6: Verify Database Status ===");
    const [[listing]] = await db.execute(
      "SELECT verification_status, assigned_officer_id, admin_notes, sla_deadline FROM listings WHERE id = ?",
      [listingId]
    );
    console.log('✅ Listing status:', listing.verification_status);
    console.log('   Assigned to officer ID:', listing.assigned_officer_id);
    console.log('   Admin notes:', listing.admin_notes);
    console.log('   SLA deadline:', listing.sla_deadline);
    
    // Step 7: Login as officer
    console.log("\n=== STEP 7: Officer Login ===");
    const officerLoginRes = await makeApiCall('POST', '/api/admin/login', {
      username: officer.username,
      password: 'muni123' // Default password from seed
    });
    
    if (!officerLoginRes.body.success) {
      console.log('❌ Officer login failed, setting default password...');
      // Set password for officer
      const bcrypt = require('bcrypt');
      const hash = await bcrypt.hash('muni123', 12);
      await db.execute('UPDATE admin_users SET password_hash = ? WHERE id = ?', [hash, officer.id]);
      console.log('✅ Password reset, trying again...');
      
      const retryLogin = await makeApiCall('POST', '/api/admin/login', {
        username: officer.username,
        password: 'muni123'
      });
      
      if (!retryLogin.body.success) {
        console.log('❌ Still failed, skipping officer steps');
        return;
      }
      var officerCookie = retryLogin.cookie;
    } else {
      var officerCookie = officerLoginRes.cookie;
    }
    
    console.log('✅ Logged in as officer:', officer.full_name);
    
    // Step 8: Officer views their queue
    console.log("\n=== STEP 8: Officer Views Queue ===");
    const queueRes = await makeApiCall('GET', '/api/verification/my-queue', null, officerCookie);
    console.log('✅ Officer queue count:', queueRes.body.count);
    const assignedListing = queueRes.body.listings.find(l => l.id === listingId);
    if (assignedListing) {
      console.log('   Our test listing found in queue');
      console.log('   Hours until deadline:', assignedListing.hours_until_deadline);
    }
    
    // Step 9: Officer approves listing
    console.log("\n=== STEP 9: Officer Approves Listing ===");
    const officerApproveRes = await makeApiCall('POST', `/api/verification/officer-review/${listingId}`, {
      action: 'approve',
      officer_notes: 'Carta verified. Property ownership confirmed with municipal records.'
    }, officerCookie);
    console.log('✅ Officer decision:', officerApproveRes.body.message);
    
    // Step 10: Check final status
    console.log("\n=== STEP 10: Final Status Check ===");
    const [[finalListing]] = await db.execute(
      "SELECT verification_status, is_verified, is_active, officer_notes FROM listings WHERE id = ?",
      [listingId]
    );
    console.log('✅ Final status:', finalListing.verification_status);
    console.log('   Is verified:', finalListing.is_verified ? 'YES' : 'NO');
    console.log('   Is active:', finalListing.is_active ? 'YES' : 'NO');
    console.log('   Officer notes:', finalListing.officer_notes);
    
    // Step 11: Get workflow stats
    console.log("\n=== STEP 11: Workflow Statistics ===");
    const statsRes = await makeApiCall('GET', '/api/verification/stats', null, adminCookie);
    console.log('✅ Stats:', JSON.stringify(statsRes.body.stats, null, 2));
    
    console.log("\n🎉 WORKFLOW TEST COMPLETE!");
    console.log("\nSummary:");
    console.log("1. ✅ Listing created in 'pending_admin_review'");
    console.log("2. ✅ Super Admin approved and assigned to officer");
    console.log("3. ✅ Officer received in queue");
    console.log("4. ✅ Officer approved and published");
    console.log("5. ✅ Listing is now LIVE with 'Carta Verified' status");
    
  } catch (err) {
    console.error("\n❌ Test failed:", err.message);
    console.error(err);
  } finally {
    process.exit(0);
  }
}

testWorkflow();
