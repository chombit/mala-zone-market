# 🔄 Verification Workflow - Complete State Flow Diagram

## Visual State Machine

```
┌───────────────────────────────────────────────────────────────────────┐
│                          INITIAL STATE                                 │
│                     pending_admin_review                              │
│                                                                       │
│  Listing created by user/agent/admin                                  │
│  Automatically enters review queue                                    │
│  SLA Timer: 24 hours for admin review                                 │
└───────────────────────────┬───────────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────────────┐
│                      ADMIN REVIEW PHASE                                │
│                                                                       │
│  Admin Actions Available:                                             │
│  1. Upload Documents (0 to N documents)                               │
│     ├─ Document Type (dropdown)                                       │
│     ├─ Description (textarea - required)                              │
│     └─ File URL (text input - required)                               │
│                                                                       │
│  2. Add Admin Notes (textarea)                                        │
│  3. Assign Officer (dropdown - filtered by city)                      │
│  4. Approve OR Reject                                                 │
│                                                                       │
│  Database Updates:                                                    │
│  - verification_documents (JSON array)                                │
│  - admin_notes (TEXT)                                                 │
│  - admin_reviewed_at (DATETIME)                                       │
│  - admin_reviewed_by (INT - admin user ID)                            │
└───────────────┬───────────────────────────────────┬───────────────────┘
                │                                   │
        APPROVE │                           REJECT │
                │                                   │
                ▼                                   ▼
┌─────────────────────────────────────┐  ┌──────────────────────────────┐
│   STATE: assigned_for_verification   │  │  STATE: rejected_by_admin    │
│                                      │  │                              │
│  Triggered by: Admin approval        │  │  Triggered by: Admin reject  │
│                                      │  │                              │
│  Database Updates:                   │  │  Database Updates:           │
│  ✓ assigned_officer_id = X           │  │  ✓ rejection_reason (TEXT)   │
│  ✓ verification_status changed       │  │  ✓ admin_notes (TEXT)        │
│  ✓ sla_deadline = NOW + 48h          │  │  ✓ Status = rejected         │
│  ✓ is_escalated = 0                  │  │                              │
│                                      │  │  User Notification:          │
│  Officer Notification:               │  │  ✉ Email: "Listing rejected" │
│  ✉ Email: "New listing assigned"    │  │  ✉ Reason included           │
│  ✉ Document count included           │  │                              │
│  ✉ SLA deadline shown                │  │  UI Display:                 │
│                                      │  │  🔴 Red badge "Rejected"     │
│  UI Display:                         │  │  📝 Rejection reason shown   │
│  🔵 Blue badge "In Verification"     │  │  ❌ Not searchable           │
│  📊 Shows: Officer name, deadline    │  │                              │
│                                      │  │  END STATE                   │
└───────────────┬─────────────────────┘  │  (User can edit & resubmit)  │
                │                         └──────────────────────────────┘
                ▼
┌───────────────────────────────────────────────────────────────────────┐
│                    OFFICER VERIFICATION PHASE                          │
│                                                                       │
│  Officer Views:                                                       │
│  1. Admin Instructions (admin_notes)                                  │
│  2. All Documents with Descriptions                                   │
│     ├─ Document Type                                                  │
│     ├─ Admin Description (what to verify)                             │
│     └─ [View] button (opens PDF/file)                                 │
│  3. Listing Details (price, location, etc.)                           │
│                                                                       │
│  Officer Actions:                                                     │
│  1. Click [View] for each document                                    │
│  2. Verify against government systems:                                │
│     ├─ Land Registry (for Carta)                                      │
│     ├─ Municipal Tax Database                                         │
│     ├─ Vehicle Registration (for transport)                           │
│     └─ Identity Verification                                          │
│  3. Add Verification Notes (required)                                 │
│  4. Approve OR Reject OR Request Info                                 │
│                                                                       │
│  SLA Monitoring:                                                      │
│  - Deadline countdown shown in UI                                     │
│  - Warning at 75% of deadline (36h)                                   │
│  - Red alert at 90% of deadline (43.2h)                               │
│  - Auto-escalation at 100% (48h)                                      │
└───────┬───────────────────────────────┬───────────────┬───────────────┘
        │                               │               │
APPROVE │                       REJECT  │               │ REQUEST INFO
        │                               │               │
        ▼                               ▼               ▼
┌────────────────────────┐  ┌────────────────────────┐  ┌──────────────┐
│  STATE: verified        │  │ STATE:                 │  │ STATE:       │
│                        │  │ rejected_by_officer    │  │ info_        │
│ Triggered by:          │  │                        │  │ requested    │
│ Officer approval       │  │ Triggered by:          │  │              │
│                        │  │ Officer rejection      │  │ Loops back   │
│ Database Updates:      │  │                        │  │ to admin     │
│ ✓ Status = verified    │  │ Database Updates:      │  │ for more     │
│ ✓ officer_notes (TEXT) │  │ ✓ Status = rejected    │  │ documents    │
│ ✓ officer_reviewed_at  │  │ ✓ officer_notes (TEXT) │  │              │
│   = NOW                │  │ ✓ rejection_reason     │  │ Not yet      │
│                        │  │ ✓ officer_reviewed_at  │  │ implemented  │
│ User Notification:     │  │                        │  │              │
│ ✉ "Listing approved!"  │  │ User Notification:     │  └──────────────┘
│ ✉ "Now live on site"   │  │ ✉ "Listing rejected"   │
│                        │  │ ✉ Officer notes sent   │
│ Site Actions:          │  │                        │
│ ✓ Published to feed    │  │ Site Actions:          │
│ ✓ Searchable           │  │ ❌ Not published       │
│ ✓ Appears in listings  │  │ ❌ Not searchable      │
│ ✓ SEO indexed          │  │ ❌ Hidden from public  │
│ ✓ Analytics tracked    │  │                        │
│                        │  │ UI Display:            │
│ UI Display:            │  │ 🔴 "Rejected"          │
│ ✅ Green "Verified"    │  │ 📝 Rejection reason    │
│ 📋 Officer notes shown │  │ 📋 Officer feedback    │
│ ⏱ Verification time    │  │                        │
│                        │  │ END STATE              │
│ END STATE              │  │ (User can appeal/edit) │
│ (Success!)             │  └────────────────────────┘
└────────────────────────┘
```

---

## 🔄 Parallel Escalation Flow

```
┌───────────────────────────────────────────────────────────────┐
│                     SLA MONITORING (Parallel)                  │
│                                                               │
│  Runs continuously for all listings in verification           │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────────┐
              │ Check sla_deadline vs NOW   │
              └─────────────┬───────────────┘
                            │
              ┌─────────────┴───────────────┐
              │                             │
    BEFORE    │                     AFTER   │
    DEADLINE  │                     DEADLINE│
              ▼                             ▼
    ┌──────────────────┐       ┌──────────────────────────┐
    │ Normal Processing│       │  Auto-Escalation         │
    │ Green/Yellow UI  │       │  ━━━━━━━━━━━━━━━━━━━━    │
    └──────────────────┘       │                          │
                               │  Database Update:        │
                               │  ✓ is_escalated = 1      │
                               │                          │
                               │  Notifications:          │
                               │  ✉ Super Admin alerted   │
                               │  ✉ Department head CC'd  │
                               │  ✉ Officer reminded      │
                               │                          │
                               │  UI Display:             │
                               │  🚨 Red "ESCALATED"      │
                               │  🔔 Alert badge          │
                               │  📊 Added to dashboard   │
                               └──────────────────────────┘
```

---

## 📊 Document Upload State Machine

```
┌───────────────────────────────────────────────────────────────┐
│                   DOCUMENT UPLOAD FLOW                         │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────────┐
              │ Admin clicks [+ Add Document]│
              └─────────────┬───────────────┘
                            │
                            ▼
              ┌─────────────────────────────┐
              │ Form appears with 3 fields: │
              │ 1. Type (dropdown)          │
              │ 2. Description (textarea)   │
              │ 3. URL (text input)         │
              └─────────────┬───────────────┘
                            │
              ┌─────────────┴───────────────┐
              │                             │
      VALID   │                   INVALID   │
      (all    │                   (missing  │
      filled) │                    fields)  │
              ▼                             ▼
    ┌──────────────────┐       ┌──────────────────────┐
    │ Add to Array     │       │ Show Alert           │
    │ ✓ Validate URL   │       │ "Fill all fields"    │
    │ ✓ Extract        │       │                      │
    │   filename       │       │ Stay on form         │
    │ ✓ Push to        │       └──────────────────────┘
    │   uploadedDocs[] │
    │ ✓ Clear form     │
    │ ✓ Show in list   │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────────────────────────┐
    │ Document appears in uploaded list:    │
    │ ┌──────────────────────────────────┐ │
    │ │ ✓ 📄 Carta (Land Registry)  [×] │ │
    │ │    Verify plot 1234-A...        │ │
    │ └──────────────────────────────────┘ │
    └──────────────────────────────────────┘
             │
             │ Admin can add more
             │ or click [×] to remove
             │
             ▼
    ┌──────────────────────────────────────┐
    │ Admin clicks "Approve & Assign"       │
    └──────────────┬───────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │ POST /api/verification/               │
    │      upload-documents/:listingId      │
    │                                       │
    │ Body: {                               │
    │   documents: [                        │
    │     {type, description, url, filename}│
    │   ]                                   │
    │ }                                     │
    └──────────────┬───────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │ Backend validates & saves to DB:      │
    │ UPDATE listings                       │
    │ SET verification_documents = JSON     │
    │ WHERE id = ?                          │
    └──────────────┬───────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │ Then: Admin approval continues        │
    │ (assign officer, change status)       │
    └───────────────────────────────────────┘
```

---

## 🎭 User Journey Map

### Journey 1: Property Owner (Success Path)

```
User                Admin               Officer              System
 │                   │                    │                    │
 │ Submit listing    │                    │                    │
 ├──────────────────►│                    │                    │
 │                   │ Review + Upload    │                    │
 │                   │ 3 documents        │                    │
 │                   ├───────────────────►│                    │
 │                   │                    │ Verify documents   │
 │                   │                    │ against govt DB    │
 │                   │                    ├───────────────────►│
 │                   │                    │◄───────────────────┤
 │                   │                    │ All valid ✓        │
 │                   │                    │ Approve            │
 │◄──────────────────┼────────────────────┤                    │
 │ Notification:     │                    │                    │
 │ "Listing Live!"   │                    │                    │
 │                   │                    │                    │
 │ Property appears on site ──────────────►│
 │ Users can search & book ────────────────►│
```

### Journey 2: Property Owner (Rejection Path)

```
User                Admin               Officer              System
 │                   │                    │                    │
 │ Submit listing    │                    │                    │
 ├──────────────────►│                    │                    │
 │                   │ Review + Upload    │                    │
 │                   │ 2 documents        │                    │
 │                   ├───────────────────►│                    │
 │                   │                    │ Verify Carta       │
 │                   │                    │ ❌ Plot not found  │
 │◄──────────────────┼────────────────────┤                    │
 │ Notification:     │                    │ Reject with notes  │
 │ "Rejected -       │                    │                    │
 │ Plot not in       │                    │                    │
 │ land registry"    │                    │                    │
 │                   │                    │                    │
 │ User edits listing & resubmits         │                    │
 ├──────────────────►│ (back to start)    │                    │
```

---

## 📱 State in Different Views

### Admin Dashboard View States:

```
┌──────────────────────────────────────────────┐
│ Pending Admin Review (5 items)               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 🟡 House in Tabor • 2h ago • No documents    │
│ 🟡 Car in Addis • 5h ago • No documents      │
│ 🟡 Land in Bahir Dar • 8h ago • No documents │
└──────────────────────────────────────────────┘

After Admin Review:
┌──────────────────────────────────────────────┐
│ In Verification (3 items)                    │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 🔵 House in Tabor • Officer: Demeke • 3 docs │
│    Deadline: 40h remaining                    │
│ 🔵 Car in Addis • Officer: Sara • 2 docs     │
│    Deadline: 35h remaining                    │
└──────────────────────────────────────────────┘
```

### Officer Dashboard View States:

```
┌──────────────────────────────────────────────┐
│ My Queue (2 items)                           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 🔵 House in Tabor                            │
│    📄 3 documents to verify                   │
│    ⏱ Deadline: 40h                           │
│    📋 Admin: "Priority - lake front"          │
│    [Review Documents →]                       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 🔴 Land in Hawassa (ESCALATED)               │
│    📄 2 documents to verify                   │
│    ⏱ OVERDUE by 5h                           │
│    📋 Admin: "Urgent verification needed"     │
│    [Review Now →]                             │
└──────────────────────────────────────────────┘
```

---

## 🔢 State Counts & Metrics

### Real-time Dashboard Stats:

```
┌──────────────────────────────────────────────┐
│ Verification Pipeline Overview                │
├──────────────────────────────────────────────┤
│ Pending Admin Review:        12 listings     │
│ In Verification:             8 listings      │
│ Verified Today:              15 listings     │
│ Rejected:                    3 listings      │
│ Escalated:                   2 listings      │
│                                              │
│ Average Time:                                │
│ • Admin review:              4.5 hours       │
│ • Officer verification:      18 hours        │
│ • Total pipeline:            22.5 hours      │
│                                              │
│ SLA Compliance:              94.2%           │
└──────────────────────────────────────────────┘
```

---

## 🔐 Access Control by State

```
State                      Admin    Officer   User
─────────────────────────────────────────────────
pending_admin_review       R/W      -         R
assigned_for_verification  R        R/W       R
verified                   R        R         R (public)
rejected_by_admin          R/W      -         R/W (edit)
rejected_by_officer        R        R         R/W (edit)
escalated                  R/W      R/W       R

Legend:
R = Read access
W = Write/modify access
- = No access
```

---

## 📊 State Transition Matrix

```
From ↓ \ To →     | pending | assigned | verified | rejected_admin | rejected_officer
─────────────────────────────────────────────────────────────────────────────────────
pending           |    -    |    ✓     |    ✗     |       ✓        |        ✗
assigned          |    ✗    |    -     |    ✓     |       ✗        |        ✓
verified          |    ✗    |    ✗     |    -     |       ✗        |        ✗
rejected_admin    |    ✓    |    ✗     |    ✗     |       -        |        ✗
rejected_officer  |    ✓    |    ✗     |    ✗     |       ✗        |        -

✓ = Valid transition
✗ = Invalid transition
- = Same state
```

---

**Status:** ✅ Complete State Machine Documented

**Last Updated:** September 28, 2026
