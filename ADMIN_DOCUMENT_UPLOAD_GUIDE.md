# 📋 Admin Document Upload Guide

## How Admin Adds Verification Documents with Descriptions to G2B

---

## 🎯 Quick Answer

**Admin uploads documents during Phase 1 review:**
1. Reviews pending listing
2. Adds documents with type + description for G2B officer
3. Assigns to officer
4. Officer sees documents with admin descriptions
5. Officer verifies and approves/rejects

---

## 📸 Step-by-Step Flow with Screenshots

### **STEP 1: Admin Opens Pending Listing**

```
Admin Dashboard → Verification Workflow → Pending Admin Review Tab

┌────────────────────────────────────────────────────────┐
│ 📋 Pending Admin Review (5 items)                      │
├────────────────────────────────────────────────────────┤
│ 🏠 3-Bedroom House in Tabor, Hawassa                   │
│ 💰 ETB 2,500,000 • Submitted 2 hours ago               │
│ [Review Listing →]                                     │
└────────────────────────────────────────────────────────┘
```

**Admin clicks "Review Listing"**

---

### **STEP 2: Admin Reviews Listing Details**

```
┌────────────────────────────────────────────────────────┐
│ Listing Details                                        │
├────────────────────────────────────────────────────────┤
│ Title: 3-Bedroom House with Garden                     │
│ Price: ETB 2,500,000                                   │
│ Location: Tabor, Hawassa                               │
│ Owner: Abebe Kebede                                    │
│ Contact: +251911234567                                 │
│                                                        │
│ Description:                                           │
│ Modern house near Hawassa Lake. 3 bedrooms,           │
│ 2 bathrooms, large garden, secure parking.            │
└────────────────────────────────────────────────────────┘
```

**Admin scrolls down to upload section**

---

### **STEP 3: Admin Uploads Documents**

```
┌────────────────────────────────────────────────────────┐
│ 📁 Verification Documents                              │
├────────────────────────────────────────────────────────┤
│ Upload essential documents for G2B officer             │
│ verification (Carta, ownership papers, etc.)           │
│                                                        │
│ No documents uploaded yet                              │
│                                                        │
│ ┌────────────────────────────────────────────────┐   │
│ │ Document Type: [Select type... ▼]              │   │
│ │                                                │   │
│ │ Description for G2B Officer:                   │   │
│ │ [Textarea...]                                  │   │
│ │                                                │   │
│ │ File URL/Path:                                 │   │
│ │ [/uploads/carta/document.pdf...]               │   │
│ │                                                │   │
│ │ [+ Add Document]                               │   │
│ └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

---

### **STEP 4: Admin Adds First Document (Carta)**

**Admin fills form:**

```
Document Type: [Carta (Land Registry) ▼]

Description for G2B Officer:
┌──────────────────────────────────────────────────────┐
│ Please verify plot number 1234-A in Tabor sub-city  │
│ land registry. Check that:                           │
│ 1. Plot exists in government system                  │
│ 2. Owner name matches: Abebe Kebede                  │
│ 3. No liens or disputes recorded                     │
│ 4. Boundaries match satellite coordinates            │
└──────────────────────────────────────────────────────┘

File URL/Path:
[/uploads/listings/789/carta_tabor_1234a.pdf]

[+ Add Document] ← Click
```

**After clicking "Add Document":**

```
┌────────────────────────────────────────────────────────┐
│ Uploaded Documents (1):                                │
├────────────────────────────────────────────────────────┤
│ ✓ 📄 Carta (Land Registry)                      [×]    │
│    Please verify plot number 1234-A in Tabor...       │
└────────────────────────────────────────────────────────┘
```

---

### **STEP 5: Admin Adds Second Document (Tax Receipt)**

```
Document Type: [Property Tax Receipt ▼]

Description for G2B Officer:
┌──────────────────────────────────────────────────────┐
│ Check 2023 property tax paid status in municipal     │
│ system. Verify:                                      │
│ 1. Tax year 2023 fully paid                         │
│ 2. No arrears from previous years                   │
│ 3. Receipt number matches municipal database        │
└──────────────────────────────────────────────────────┘

File URL/Path:
[/uploads/listings/789/tax_receipt_2023.pdf]

[+ Add Document]
```

---

### **STEP 6: Admin Adds Third Document (ID Copy)**

```
Document Type: [ID Copy ▼]

Description for G2B Officer:
┌──────────────────────────────────────────────────────┐
│ Verify owner identity matches Carta. Check:          │
│ 1. Full name: Abebe Kebede                          │
│ 2. ID number on Carta matches this ID               │
│ 3. Photo and signature appear authentic             │
└──────────────────────────────────────────────────────┘

File URL/Path:
[/uploads/listings/789/id_copy_abebe.pdf]

[+ Add Document]
```

**Result - All documents uploaded:**

```
┌────────────────────────────────────────────────────────┐
│ Uploaded Documents (3):                                │
├────────────────────────────────────────────────────────┤
│ ✓ 📄 Carta (Land Registry)                      [×]    │
│    Please verify plot number 1234-A in Tabor...       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━     │
│ ✓ 📄 Property Tax Receipt                       [×]    │
│    Check 2023 property tax paid status...             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━     │
│ ✓ 📄 ID Copy                                    [×]    │
│    Verify owner identity matches Carta...             │
└────────────────────────────────────────────────────────┘
```

---

### **STEP 7: Admin Assigns to Officer**

```
┌────────────────────────────────────────────────────────┐
│ Assign to Officer:                                     │
│ [Demeke Tadesse - Hawassa (muni_officer) ▼]           │
│                                                        │
│ Admin Notes for Officer:                               │
│ ┌────────────────────────────────────────────────┐   │
│ │ Priority verification needed. Property is near  │   │
│ │ lake front. Please verify all documents against │   │
│ │ land registry by end of day tomorrow.          │   │
│ └────────────────────────────────────────────────┘   │
│                                                        │
│ [Approve & Assign (3 docs)]  [Reject]                 │
└────────────────────────────────────────────────────────┘
```

**Admin clicks "Approve & Assign (3 docs)"**

---

### **STEP 8: Officer Receives Assignment**

**Officer Dashboard shows:**

```
┌────────────────────────────────────────────────────────┐
│ 🔔 New Assignment!                                     │
│ 3-Bedroom House in Tabor - 3 documents to verify      │
│ Deadline: Sep 30, 2026 10:30 AM                       │
└────────────────────────────────────────────────────────┘
```

**Officer opens listing:**

```
┌────────────────────────────────────────────────────────┐
│ Phase 2: Officer Verification                          │
├────────────────────────────────────────────────────────┤
│ 📋 Admin Instructions:                                 │
│ "Priority verification needed. Property is near lake   │
│ front. Please verify all documents against land        │
│ registry by end of day tomorrow."                      │
│                                                        │
│ ┌────────────────────────────────────────────────┐   │
│ │ 📁 Documents to Verify (3)                      │   │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│ │                                                │   │
│ │ 📄 Carta (Land Registry)          [View] →    │   │
│ │ Admin notes: Please verify plot number 1234-A  │   │
│ │ in Tabor sub-city land registry. Check that:   │   │
│ │ 1. Plot exists in government system            │   │
│ │ 2. Owner name matches: Abebe Kebede            │   │
│ │ 3. No liens or disputes recorded               │   │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│ │                                                │   │
│ │ 📄 Property Tax Receipt           [View] →    │   │
│ │ Admin notes: Check 2023 property tax paid      │   │
│ │ status in municipal system. Verify:            │   │
│ │ 1. Tax year 2023 fully paid                   │   │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│ │                                                │   │
│ │ 📄 ID Copy                        [View] →    │   │
│ │ Admin notes: Verify owner identity matches     │   │
│ │ Carta. Check full name and ID number.         │   │
│ └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

---

### **STEP 9: Officer Verifies Each Document**

**Officer clicks [View] for Carta:**
- PDF opens in new tab
- Officer checks government land registry system
- Confirms plot 1234-A exists
- Verifies owner name matches

**Officer clicks [View] for Tax Receipt:**
- PDF opens
- Officer checks municipal tax database
- Confirms 2023 paid, no arrears

**Officer clicks [View] for ID Copy:**
- PDF opens
- Officer confirms name matches Carta
- Verifies ID authenticity

---

### **STEP 10: Officer Adds Verification Notes**

```
┌────────────────────────────────────────────────────────┐
│ Verification Notes:                                    │
│ ┌────────────────────────────────────────────────┐   │
│ │ VERIFICATION COMPLETE - ALL DOCUMENTS VALID     │   │
│ │                                                │   │
│ │ ✓ Carta verified in land registry system       │   │
│ │   Plot 1234-A confirmed in Tabor sub-city      │   │
│ │   Owner: Abebe Kebede (matches)                │   │
│ │   No liens or disputes found                   │   │
│ │                                                │   │
│ │ ✓ Property tax 2023 paid (Receipt #789456)     │   │
│ │   Confirmed in municipal system                │   │
│ │   No arrears                                   │   │
│ │                                                │   │
│ │ ✓ ID copy authentic                           │   │
│ │   Name and ID number match Carta               │   │
│ │                                                │   │
│ │ Recommendation: APPROVE FOR PUBLICATION        │   │
│ │ Verified by: Officer Demeke Tadesse            │   │
│ │ Date: Sep 28, 2026 3:45 PM                    │   │
│ └────────────────────────────────────────────────┘   │
│                                                        │
│ [Approve & Publish]  [Reject]                         │
└────────────────────────────────────────────────────────┘
```

**Officer clicks "Approve & Publish"**

---

### **STEP 11: Listing Published!**

```
┌────────────────────────────────────────────────────────┐
│ ✅ Listing Approved & Published!                       │
├────────────────────────────────────────────────────────┤
│ Status: Verified                                       │
│ Published: Sep 28, 2026 3:45 PM                       │
│ Verified by: Officer Demeke Tadesse                    │
│                                                        │
│ The property is now live on Malazone and searchable   │
│ by users. Owner has been notified.                    │
└────────────────────────────────────────────────────────┘
```

---

## 📊 Data Stored in Database

### After Admin Uploads Documents:

```json
{
  "listing_id": 789,
  "verification_status": "assigned_for_verification",
  "verification_documents": [
    {
      "type": "Carta (Land Registry)",
      "description": "Please verify plot number 1234-A in Tabor sub-city land registry. Check that: 1. Plot exists...",
      "url": "/uploads/listings/789/carta_tabor_1234a.pdf",
      "filename": "carta_tabor_1234a.pdf"
    },
    {
      "type": "Property Tax Receipt",
      "description": "Check 2023 property tax paid status in municipal system...",
      "url": "/uploads/listings/789/tax_receipt_2023.pdf",
      "filename": "tax_receipt_2023.pdf"
    },
    {
      "type": "ID Copy",
      "description": "Verify owner identity matches Carta...",
      "url": "/uploads/listings/789/id_copy_abebe.pdf",
      "filename": "id_copy_abebe.pdf"
    }
  ],
  "assigned_officer_id": 5,
  "admin_notes": "Priority verification needed. Property is near lake front...",
  "admin_reviewed_at": "2026-09-28T10:30:00Z",
  "admin_reviewed_by": 1,
  "sla_deadline": "2026-09-30T10:30:00Z"
}
```

### After Officer Verifies:

```json
{
  "verification_status": "verified",
  "officer_notes": "VERIFICATION COMPLETE - ALL DOCUMENTS VALID. Carta verified...",
  "officer_reviewed_at": "2026-09-28T15:45:00Z"
}
```

---

## 🎯 Best Practices for Document Descriptions

### ✅ Good Description Examples:

```
Carta:
"Verify plot 1234-A in Tabor land registry. Confirm owner name, 
no liens, boundaries match satellite data."

Tax Receipt:
"Check 2023 paid in municipal system. Receipt #789456. 
No arrears from 2020-2022."

Ownership Certificate:
"Verify signature authenticity with registrar. Owner name must 
match: Abebe Kebede. Check transfer date: Jan 2023."
```

### ❌ Bad Description Examples:

```
"Check this document"  ❌ Too vague
"Carta"  ❌ No instructions
"Verify"  ❌ What to verify?
""  ❌ Empty description
```

---

## 📱 Mobile Workflow

Same flow works on mobile:
1. Admin uploads from phone
2. Officer verifies on tablet/phone
3. [View] opens PDF in mobile browser
4. Officer adds notes from phone

---

## 🔐 Security Features

- **Admin only** can upload documents
- **Officer only** assigned to that city can view
- **Audit trail** tracks who uploaded what when
- **Document URLs** can be S3/Azure Blob/local paths
- **JSON storage** prevents SQL injection

---

## 📈 Reporting

### Admin Dashboard Shows:
- Total documents uploaded per listing
- Average documents per listing type
- Officer verification rate by document type

### Officer Dashboard Shows:
- Documents verified today/week/month
- Average verification time per document type
- Most common rejection reasons

---

## ✅ Testing Checklist

- [ ] Admin can upload multiple documents
- [ ] Descriptions are required
- [ ] Document types dropdown works
- [ ] [×] button removes documents
- [ ] Upload count shows in button: "(3 docs)"
- [ ] Warning if 0 documents uploaded
- [ ] Officer sees all documents with descriptions
- [ ] [View] button opens document
- [ ] Officer can't approve without notes
- [ ] Status changes correctly
- [ ] JSON saves to database
- [ ] Audit log captures everything

---

## 🚀 Next Steps

1. **Test the flow end-to-end**
2. **Upload sample documents**
3. **Verify with real officers**
4. **Monitor SLA compliance**
5. **Gather feedback from users**

---

## 📞 Support

If officers need help verifying documents:
- Contact Super Admin
- Check audit log for previous examples
- Reference this guide

---

**Status:** ✅ Ready for Production

**Last Updated:** September 28, 2026
