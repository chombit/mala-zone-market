# 📄 Document Upload & Verification Flow

## Complete State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER SUBMITS LISTING                          │
│                 (Property/Vehicle for sale)                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  STATUS: pending_admin_review                    │
│                     (Listing enters queue)                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: SUPER ADMIN REVIEW                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                                   │
│  Admin Actions:                                                  │
│  1. Review listing details                                       │
│  2. Upload verification documents with descriptions              │
│  3. Add notes for G2B officer                                    │
│  4. Assign to officer                                            │
│                                                                   │
│  Document Upload Interface:                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Document Type: [Dropdown]                              │   │
│  │  - Carta (Land Registry)                                │   │
│  │  - Ownership Certificate                                │   │
│  │  - Property Tax Receipt                                 │   │
│  │  - Transfer Document                                    │   │
│  │  - ID Copy                                              │   │
│  │  - Vehicle Registration                                 │   │
│  │  - Insurance Document                                   │   │
│  │  - Other                                                │   │
│  │                                                         │   │
│  │  Description for G2B Officer: [Textarea]                │   │
│  │  "Explain what this document proves..."                 │   │
│  │                                                         │   │
│  │  File URL/Path: [Input]                                │   │
│  │  "/uploads/carta/doc.pdf or https://..."               │   │
│  │                                                         │   │
│  │  [+ Add Document]                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Uploaded Documents List:                                        │
│  ✓ Carta (Land Registry) - "Verify plot number 1234 matches"    │
│  ✓ Ownership Certificate - "Owner name must match ID"           │
│  ✓ Tax Receipt - "Check 2023 paid status"                       │
│                                                                   │
│  Officer Assignment: [Dropdown - filtered by city]               │
│  Admin Notes: [Textarea - instructions for officer]              │
│                                                                   │
│  [Approve & Assign (3 docs)] [Reject]                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        APPROVE │                       │ REJECT
                ▼                       ▼
┌─────────────────────────────┐  ┌──────────────────────────────┐
│ STATUS:                      │  │ STATUS:                       │
│ assigned_for_verification    │  │ rejected_by_admin             │
│                              │  │                               │
│ Data Saved:                  │  │ Data Saved:                   │
│ - assigned_officer_id        │  │ - rejection_reason            │
│ - verification_documents[]   │  │ - admin_notes                 │
│ - admin_notes                │  │ - admin_reviewed_at           │
│ - admin_reviewed_at          │  │ - admin_reviewed_by           │
│ - admin_reviewed_by          │  │                               │
│ - sla_deadline (48h)         │  │ ❌ User notified              │
└────────────┬─────────────────┘  │ END FLOW                      │
             │                     └──────────────────────────────┘
             ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: G2B OFFICER VERIFICATION                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                                   │
│  Officer Views:                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📋 Admin Instructions:                                 │   │
│  │  "Please verify Carta matches government records"       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📁 Documents to Verify (3)                             │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │   │
│  │                                                         │   │
│  │  📄 Carta (Land Registry)                [View]        │   │
│  │  Admin notes: "Verify plot number 1234 matches         │   │
│  │  government land registry database"                    │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │   │
│  │                                                         │   │
│  │  📄 Ownership Certificate               [View]         │   │
│  │  Admin notes: "Owner name must match ID. Check         │   │
│  │  signature authenticity"                               │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │   │
│  │                                                         │   │
│  │  📄 Property Tax Receipt                [View]         │   │
│  │  Admin notes: "Check 2023 paid status in municipal     │   │
│  │  system. No arrears."                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Officer Actions:                                                │
│  1. Click [View] to open each document                           │
│  2. Verify against government records                            │
│  3. Check Carta in land registry system                          │
│  4. Confirm ownership with municipal database                    │
│  5. Add verification notes                                       │
│                                                                   │
│  Verification Notes: [Textarea]                                  │
│  "Carta verified in system. Plot 1234 matches..."                │
│                                                                   │
│  [Approve & Publish] [Reject]                                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        APPROVE │                       │ REJECT
                ▼                       ▼
┌─────────────────────────────┐  ┌──────────────────────────────┐
│ STATUS: verified             │  │ STATUS: rejected_by_officer   │
│                              │  │                               │
│ Data Saved:                  │  │ Data Saved:                   │
│ - officer_notes              │  │ - officer_notes               │
│ - officer_reviewed_at        │  │ - rejection_reason            │
│                              │  │ - officer_reviewed_at         │
│ ✅ PUBLISHED TO SITE         │  │                               │
│ ✅ User notified             │  │ ❌ User notified              │
│ ✅ Searchable                │  │ END FLOW                      │
│ END FLOW                     │  └──────────────────────────────┘
└─────────────────────────────┘
```

---

## 🔑 Key Features

### 1. **Admin Document Upload**
- **Multiple document types** supported
- **Essential description** for each document
- **Clear instructions** to G2B officer
- **File URL/path** tracking

### 2. **Document Types Available**
```javascript
[
  "Carta (Land Registry)",
  "Ownership Certificate",
  "Property Tax Receipt",
  "Transfer Document",
  "ID Copy",
  "Vehicle Registration",
  "Insurance Document",
  "Other"
]
```

### 3. **JSON Storage Format**
```json
{
  "verification_documents": [
    {
      "type": "Carta (Land Registry)",
      "description": "Verify plot number 1234 matches government land registry. Check for liens.",
      "url": "/uploads/listings/123/carta.pdf",
      "filename": "carta.pdf"
    },
    {
      "type": "Ownership Certificate",
      "description": "Owner name must match ID copy. Check signature authenticity with registrar.",
      "url": "/uploads/listings/123/ownership.pdf",
      "filename": "ownership.pdf"
    }
  ]
}
```

---

## 📊 Database Schema

### Listings Table Columns
```sql
verification_documents JSON NULL
  -- Stores array of document objects

admin_notes TEXT NULL
  -- General instructions from admin to officer

officer_notes TEXT NULL
  -- Verification findings from officer
```

---

## 🔄 API Endpoints Used

### 1. **Upload Documents**
```
POST /api/verification/upload-documents/:listingId
Body: { documents: [{type, description, url, filename}] }
```

### 2. **Admin Review**
```
POST /api/verification/admin-review/:listingId
Body: { 
  action: "approve",
  assigned_officer_id: 5,
  admin_notes: "Please verify Carta..."
}
```
*Note: Documents uploaded separately before approval*

### 3. **Officer Review**
```
POST /api/verification/officer-review/:listingId
Body: {
  action: "approve",
  officer_notes: "Carta verified. All documents valid."
}
```

---

## 💡 Workflow Benefits

### For Admins:
1. **Upload once, verify everywhere** - Documents attached to listing permanently
2. **Clear communication** - Description tells officer exactly what to check
3. **Audit trail** - All documents tracked with upload timestamp
4. **Bulk upload** - Add multiple documents before assigning

### For Officers:
1. **Clear instructions** - Admin descriptions guide verification
2. **Quick access** - [View] button opens document instantly
3. **Context preserved** - All documents in one place
4. **Structured verification** - Know exactly what to check

### For Users (Property Owners):
1. **Transparency** - Know what's being verified
2. **Faster processing** - Officer has all info upfront
3. **No back-and-forth** - Documents uploaded once
4. **Clear rejections** - Specific reasons if rejected

---

## 🎯 Real-World Example

### Scenario: Property in Hawassa

**User submits:** 3-bedroom house in Tabor, Hawassa

**Admin uploads:**
1. **Carta** - "Verify plot 1234-A in Tabor sub-city land registry"
2. **Tax Receipt** - "Check 2023 tax paid, no arrears"
3. **ID Copy** - "Match owner name with Carta"

**Admin assigns:** → Muni Officer (Hawassa)

**Officer verifies:**
1. Opens Carta → Checks land registry system → Plot 1234-A exists ✓
2. Opens Tax Receipt → Checks municipal tax database → 2023 paid ✓
3. Opens ID Copy → Name matches Carta ✓

**Officer approves:** "All documents verified against government records"

**Result:** Property published to site 🎉

---

## 🚨 Validation Rules

### Admin Upload:
- ✅ At least 1 document recommended (warning if 0)
- ✅ Type + Description + URL required
- ✅ Description must be helpful for officer

### Officer Review:
- ✅ Must view all documents before approving
- ✅ Verification notes required
- ✅ Cannot approve without notes

---

## 🔐 Security & Audit

### Document Tracking:
```javascript
{
  uploaded_by: admin.id,
  uploaded_at: "2026-09-28T10:30:00Z",
  document_count: 3,
  admin_notes: "Verify all against land registry",
  officer_assigned: 5,
  verification_deadline: "2026-09-30T10:30:00Z"
}
```

### Audit Log Captures:
- Document upload timestamp
- Admin who uploaded
- Officer assigned
- Verification completion time
- All notes and decisions

---

## 📈 SLA Tracking

### Timeline:
```
User submits → Admin reviews (24h SLA) → Officer verifies (48h SLA)
                     ↓                              ↓
              Documents uploaded              Documents verified
              Officer assigned                Listing published
```

### Auto-escalation:
- If admin > 24h → Escalated to super admin
- If officer > 48h → Escalated to department head
- Red badge in UI for overdue items

---

## ✅ Testing Checklist

- [ ] Admin can upload 1+ documents
- [ ] Admin can add descriptions
- [ ] Documents saved to database as JSON
- [ ] Officer sees documents with descriptions
- [ ] [View] button opens document
- [ ] Officer can approve after viewing
- [ ] Verification notes required
- [ ] Status changes to "verified" on approval
- [ ] Document count shown in UI
- [ ] Warning if 0 documents uploaded

---

## 🎨 UI Components

### Admin Upload Form:
```
┌────────────────────────────────────┐
│ Document Type: [Carta (Land...)▼]  │
│ Description: [Text area...]        │
│ File URL: [/uploads/...]           │
│ [+ Add Document]                   │
└────────────────────────────────────┘

Uploaded Documents (3):
✓ Carta - "Verify plot 1234..."
✓ Tax Receipt - "Check 2023 paid..."
✓ ID Copy - "Match owner name..."
```

### Officer View:
```
┌────────────────────────────────────┐
│ 📁 Documents to Verify (3)         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 📄 Carta (Land Registry)   [View]  │
│    Admin notes: "Verify plot..."   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 📄 Tax Receipt            [View]   │
│    Admin notes: "Check 2023..."    │
└────────────────────────────────────┘
```

---

## 🔗 Related Files

- `src/components/VerificationWorkflowHub.tsx` - Main UI
- `routes/verification.js` - Backend API
- `database/migrations/add_verification_workflow.js` - DB schema
- `VERIFICATION_WORKFLOW_COMPLETE.md` - Full documentation
- `QUICK_START_VERIFICATION.md` - Quick guide

---

**Status:** ✅ **Implemented & Ready for Testing**

**Last Updated:** September 28, 2026
