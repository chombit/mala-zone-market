# 🧪 Testing Guide: Document Upload & Verification

## 🎯 Complete Test Plan

---

## 📋 Pre-Test Setup

### 1. **Start Backend Server**
```bash
cd d:\Lan\malazone (2)\malazone (3)\malazone
npm run dev
```

### 2. **Verify Database Connection**
```bash
# MySQL should be running on port 3306
# Check connection
mysql -u root -p
USE malazone;
SHOW TABLES;
```

### 3. **Create Test Users**

**Super Admin:**
```sql
-- Already exists
Username: superadmin
Password: (your password)
```

**Muni Officer:**
```sql
INSERT INTO admin_users 
(username, password_hash, full_name, role, city, sub_cities, is_active)
VALUES
('muni_hawassa', '$2a$10$...', 'Demeke Tadesse', 'muni_officer', 'hawassa', '["Tabor", "Lakefront"]', 1);
```

**Trans Officer:**
```sql
INSERT INTO admin_users 
(username, password_hash, full_name, role, city, sub_cities, is_active)
VALUES
('trans_addis', '$2a$10$...', 'Sara Girma', 'trans_officer', 'addis ababa', '["Bole", "Kirkos"]', 1);
```

### 4. **Create Test Listing**
```sql
INSERT INTO listings 
(title, category, subcategory, price, location_label_en, user_id, verification_status)
VALUES
('Test House in Tabor', 'property', 'house', 2500000, 'Hawassa', 1, 'pending_admin_review');
```

---

## ✅ Test Case 1: Admin Upload Single Document

### Steps:
1. Login as superadmin
2. Navigate to "Verification Workflow"
3. Click "Pending Admin Review" tab
4. Click on test listing
5. Scroll to document upload section
6. Fill form:
   - Type: `Carta (Land Registry)`
   - Description: `Verify plot 1234-A in Tabor land registry`
   - URL: `/uploads/test/carta.pdf`
7. Click "Add Document"

### Expected Result:
- ✅ Document appears in list above form
- ✅ Form clears automatically
- ✅ Document shows with description
- ✅ [×] button appears next to document
- ✅ Button shows "Approve & Assign (1 doc)"

### Verify in Database:
```sql
-- Should NOT be saved yet (only after "Approve & Assign")
SELECT verification_documents FROM listings WHERE id = ?;
-- Result: NULL (documents only in UI state)
```

---

## ✅ Test Case 2: Admin Upload Multiple Documents

### Steps:
1. Add second document:
   - Type: `Property Tax Receipt`
   - Description: `Check 2023 tax paid in municipal system`
   - URL: `/uploads/test/tax.pdf`
2. Click "Add Document"
3. Add third document:
   - Type: `ID Copy`
   - Description: `Verify owner name matches Carta`
   - URL: `/uploads/test/id.pdf`
4. Click "Add Document"

### Expected Result:
- ✅ All 3 documents appear in list
- ✅ Each shows type and description
- ✅ Button shows "Approve & Assign (3 docs)"
- ✅ No database changes yet

---

## ✅ Test Case 3: Admin Remove Document

### Steps:
1. Click [×] button next to second document (Tax Receipt)

### Expected Result:
- ✅ Document removed from list
- ✅ Only 2 documents remain (Carta and ID)
- ✅ Button shows "Approve & Assign (2 docs)"
- ✅ No database changes

---

## ✅ Test Case 4: Admin Validation - Empty Fields

### Steps:
1. Click "Add Document" without filling any fields

### Expected Result:
- ✅ Alert: "Please fill all document fields"
- ✅ Form stays open
- ✅ No document added to list

---

## ✅ Test Case 5: Admin Assign to Officer

### Steps:
1. Select officer: `Demeke Tadesse - Hawassa (muni_officer)`
2. Add admin notes: `Priority verification - near lake front`
3. Click "Approve & Assign (2 docs)"

### Expected Result:
- ✅ Success message appears
- ✅ Listing moves to "In Verification" tab
- ✅ Status badge changes to blue "In Verification"
- ✅ Deadline shows (48 hours from now)

### Verify in Database:
```sql
SELECT 
  verification_status,
  assigned_officer_id,
  verification_documents,
  admin_notes,
  admin_reviewed_at,
  admin_reviewed_by,
  sla_deadline
FROM listings 
WHERE id = ?;

-- Expected:
-- verification_status: "assigned_for_verification"
-- assigned_officer_id: (officer ID)
-- verification_documents: JSON array with 2 documents
-- admin_notes: "Priority verification - near lake front"
-- admin_reviewed_at: Current timestamp
-- admin_reviewed_by: (superadmin ID)
-- sla_deadline: Current timestamp + 48 hours
```

### Verify JSON Structure:
```sql
SELECT JSON_PRETTY(verification_documents) FROM listings WHERE id = ?;

-- Expected output:
[
  {
    "type": "Carta (Land Registry)",
    "description": "Verify plot 1234-A in Tabor land registry",
    "url": "/uploads/test/carta.pdf",
    "filename": "carta.pdf"
  },
  {
    "type": "ID Copy",
    "description": "Verify owner name matches Carta",
    "url": "/uploads/test/id.pdf",
    "filename": "id.pdf"
  }
]
```

---

## ✅ Test Case 6: Officer Views Assignment

### Steps:
1. Logout from superadmin
2. Login as `muni_hawassa`
3. Navigate to "Verification Workflow"
4. Click "My Queue" tab

### Expected Result:
- ✅ Test listing appears in queue
- ✅ Shows "2 documents to verify"
- ✅ Shows deadline countdown
- ✅ Shows admin notes
- ✅ [Review Documents →] button visible

---

## ✅ Test Case 7: Officer Views Documents

### Steps:
1. Click on listing to open details
2. Scroll to documents section

### Expected Result:
- ✅ Section shows "📁 Documents to Verify (2)"
- ✅ Admin instructions visible: "Priority verification - near lake front"
- ✅ First document shows:
   - Type: "Carta (Land Registry)"
   - Description: "Verify plot 1234-A in Tabor land registry"
   - [View] button
- ✅ Second document shows:
   - Type: "ID Copy"
   - Description: "Verify owner name matches Carta"
   - [View] button

---

## ✅ Test Case 8: Officer Verifies Documents

### Steps:
1. Click [View] for Carta document
2. Verify URL opens (even if 404, button should work)
3. Add verification notes:
   ```
   VERIFICATION COMPLETE
   ✓ Carta verified in land registry
   ✓ Plot 1234-A confirmed
   ✓ Owner name matches ID
   ```
4. Click "Approve & Publish"

### Expected Result:
- ✅ Success message appears
- ✅ Listing moves to "Verified" section
- ✅ Status badge changes to green "Verified"
- ✅ Verification notes saved

### Verify in Database:
```sql
SELECT 
  verification_status,
  officer_notes,
  officer_reviewed_at
FROM listings 
WHERE id = ?;

-- Expected:
-- verification_status: "verified"
-- officer_notes: "VERIFICATION COMPLETE..."
-- officer_reviewed_at: Current timestamp
```

---

## ✅ Test Case 9: Zero Documents Warning

### Steps:
1. Login as superadmin
2. Create new listing or find pending one
3. Don't upload any documents
4. Select officer
5. Click "Approve & Assign (0 docs)"

### Expected Result:
- ✅ Confirmation dialog: "No documents uploaded. Continue anyway?"
- ✅ If "Cancel": Stay on form
- ✅ If "OK": Assign without documents
- ✅ Officer sees "No documents uploaded" message

---

## ✅ Test Case 10: Officer Rejects Listing

### Steps:
1. Create another test listing
2. Admin uploads documents and assigns
3. Officer opens listing
4. Adds notes: "Carta not found in land registry"
5. Clicks "Reject"

### Expected Result:
- ✅ Listing status changes to "rejected_by_officer"
- ✅ Officer notes saved
- ✅ User notified (when notification system active)
- ✅ Listing not published

### Verify in Database:
```sql
SELECT 
  verification_status,
  officer_notes,
  rejection_reason,
  officer_reviewed_at
FROM listings 
WHERE id = ?;

-- Expected:
-- verification_status: "rejected_by_officer"
-- officer_notes: "Carta not found in land registry"
-- officer_reviewed_at: Current timestamp
```

---

## ✅ Test Case 11: SLA Countdown

### Steps:
1. Assign listing to officer
2. Note the deadline time
3. Wait 1 hour
4. Refresh officer queue

### Expected Result:
- ✅ Deadline shows "47h remaining"
- ✅ Progress bar updates
- ✅ Color stays green (< 75% of deadline)

### Manual Test (Skip in automated testing):
1. Manually set `sla_deadline` to 1 hour from now
2. Wait 1 hour
3. Check if escalation triggers
4. Should show red "ESCALATED" badge

---

## ✅ Test Case 12: Stats Dashboard

### Steps:
1. Login as superadmin
2. Navigate to "Verification Workflow"
3. Check stats cards at top

### Expected Result:
- ✅ "Pending Admin Review" count updates
- ✅ "In Verification" count updates
- ✅ "Verified Today" shows count
- ✅ "Average Time" calculates correctly
- ✅ All numbers accurate

---

## 🔍 Edge Case Tests

### Edge Case 1: Very Long Description
```
Description: (500+ characters)
Expected: Textarea scrolls, saves full text
```

### Edge Case 2: Special Characters in URL
```
URL: /uploads/test/file%20with%20spaces.pdf
Expected: URL saves correctly, [View] button works
```

### Edge Case 3: Multiple Officers Same City
```
Assign to: Officer A (Hawassa)
Expected: Only shows Hawassa officers in dropdown
```

### Edge Case 4: Listing Without City
```
Listing location: NULL
Expected: Shows all officers in dropdown
```

---

## 📊 Database Integrity Tests

### Test 1: JSON Validation
```sql
-- Should NOT throw error
SELECT JSON_VALID(verification_documents) 
FROM listings 
WHERE verification_documents IS NOT NULL;

-- Expected: All rows return 1 (valid)
```

### Test 2: Foreign Key Integrity
```sql
-- Should return rows only if officers exist
SELECT l.id, l.assigned_officer_id, a.username
FROM listings l
LEFT JOIN admin_users a ON l.assigned_officer_id = a.id
WHERE l.verification_status = 'assigned_for_verification';

-- Expected: No NULL in a.username
```

### Test 3: Timestamp Consistency
```sql
-- admin_reviewed_at should be before officer_reviewed_at
SELECT id, 
  admin_reviewed_at, 
  officer_reviewed_at,
  TIMESTAMPDIFF(HOUR, admin_reviewed_at, officer_reviewed_at) as hours_diff
FROM listings
WHERE verification_status = 'verified';

-- Expected: hours_diff >= 0 (officer review after admin)
```

---

## 🎯 Performance Tests

### Test 1: Document Upload Speed
```
Upload 5 documents
Expected: < 1 second per document
Total: < 5 seconds for all
```

### Test 2: Officer Queue Load
```
Create 100 listings in verification
Open officer queue
Expected: Loads in < 2 seconds
```

### Test 3: JSON Query Performance
```sql
-- Test JSON query speed
SELECT * FROM listings
WHERE JSON_CONTAINS(
  verification_documents,
  '{"type": "Carta (Land Registry)"}',
  '$'
);

-- Expected: < 100ms for 1000 listings
```

---

## 🔐 Security Tests

### Test 1: Officer Can't View Other Cities
```
Login as: muni_hawassa (Hawassa officer)
Try to view: Listing in Addis Ababa
Expected: Not visible in queue
```

### Test 2: Admin Can View All Cities
```
Login as: superadmin
Expected: Can view all listings regardless of city
```

### Test 3: URL Injection Prevention
```
Upload document with URL: '); DROP TABLE listings; --
Expected: URL saves as-is, no SQL injection
```

---

## 📱 Mobile Testing

### Test on Mobile:
1. Open admin panel on mobile browser
2. Navigate to verification workflow
3. Upload document
4. Verify responsive layout
5. Test [View] button opens PDF

### Expected:
- ✅ Forms are mobile-friendly
- ✅ Buttons are touch-friendly (44px min)
- ✅ Text is readable without zoom
- ✅ PDF opens in mobile browser

---

## 🚀 Automated Test Script

### Run Complete Test Suite:
```bash
# Test backend API
node test_verification_workflow.js

# Expected output:
✓ Can upload documents
✓ Can assign officer
✓ Documents saved to database
✓ Officer can view documents
✓ Officer can approve
✓ Status changes correctly
✓ Timestamps updated
✓ SLA deadline set

All tests passed!
```

---

## 📋 Final Checklist

### Before Marking as Complete:
- [ ] All test cases pass
- [ ] Edge cases handled
- [ ] Database integrity verified
- [ ] Performance acceptable
- [ ] Security checks pass
- [ ] Mobile responsive
- [ ] Documentation complete
- [ ] No console errors
- [ ] No 404s on document URLs
- [ ] SLA tracking works
- [ ] Escalation triggers correctly
- [ ] Notifications sent (when active)
- [ ] Audit log updated

---

## 🐛 Known Issues

### Issue 1: PDF Viewer
```
Problem: [View] button opens URL but no PDF viewer
Solution: Ensure file exists at URL or use mock PDFs for testing
Status: Expected (file system dependent)
```

### Issue 2: Real-time Updates
```
Problem: Stats don't update without refresh
Solution: Manual refresh for now, websocket in future
Status: Expected behavior
```

---

## 📞 If Tests Fail

### Common Failures:

**1. Database Connection Failed**
```bash
# Check MySQL running
mysql -u root -p
# Restart MySQL if needed
```

**2. Documents Not Saving**
```sql
-- Check column exists
DESCRIBE listings;
-- Look for: verification_documents JSON NULL
```

**3. Officer Can't See Documents**
```javascript
// Check frontend console for errors
// Verify API endpoint returns JSON
fetch('/api/verification/my-queue')
```

**4. Upload Button Disabled**
```javascript
// Check validation logic
// Ensure all fields filled
// Check console for errors
```

---

## 🎉 Success Criteria

### All Green:
- ✅ Admin can upload 1-10 documents
- ✅ Documents save to database as JSON
- ✅ Officer sees documents with descriptions
- ✅ [View] button works
- ✅ Approve/Reject changes status
- ✅ Timestamps update correctly
- ✅ SLA tracking works
- ✅ Stats dashboard accurate
- ✅ No console errors
- ✅ Mobile responsive

---

**Test Status:** ⏳ **Ready to Test**

**Tester:** ___________________

**Date:** ___________________

**Result:** [ ] PASS  [ ] FAIL  [ ] NEEDS WORK

**Notes:**
_________________________________________________
_________________________________________________
_________________________________________________

---

**Last Updated:** September 28, 2026
