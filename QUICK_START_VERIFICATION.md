# 🚀 QUICK START - Verification Workflow

## ⚡ 3-Minute Setup

### Step 1: Start MySQL
Make sure MySQL is running on port 3306

### Step 2: Start Backend
```bash
cd "d:\Lan\malazone (2)\malazone (3)\malazone"
npm run dev
```

Wait for:
```
✓ Server running on http://localhost:4003
```

### Step 3: Run Test (Optional)
```bash
node test_verification_workflow.js
```

Should see: `🎉 WORKFLOW TEST COMPLETE!`

### Step 4: Open Admin Panel
1. Go to: `http://localhost:4003/admin`
2. Login: `superadmin` / `superadmin123`
3. Click: **"Verification Workflow"** (first item in sidebar with shield icon)

---

## 📸 What You'll See

### **Super Admin View:**
```
┌─────────────────────────────────────────────────┐
│ Verification Workflow                    [Search]│
│ Two-phase listing verification system           │
├─────────────────────────────────────────────────┤
│ [Total: 234] [Pending: 12] [Assigned: 5] ...   │
├─────────────────────────────────────────────────┤
│ [Pending Admin Review] [Escalated] [Overdue]   │
├─────────────────────────────────────────────────┤
│ #234 Property in Hawassa    5,000,000 ETB      │
│ [pending_admin_review]  📍 Hawassa  📅 Today   │
│ → Click to review                               │
│                                                  │
│ #235 House in Yirgalem      3,500,000 ETB      │
│ [pending_admin_review]  📍 Yirgalem  📅 Today  │
│ → Click to review                               │
└─────────────────────────────────────────────────┘
```

### **Click any listing:**
```
┌──────────────────────────────────────────┐
│ Property in Hawassa               [X]    │
├──────────────────────────────────────────┤
│ Category: property                       │
│ Location: Hawassa                        │
│ Price: 5,000,000 ETB                    │
│ Contact: +251911000000                   │
├──────────────────────────────────────────┤
│ PHASE 1: ADMIN REVIEW                    │
│                                          │
│ Assign to Officer:                       │
│ [▼ Select Officer...]                    │
│   → Municipality Clerk Seat 02 - Hawassa│
│   → Transit Officer Seat 09 - Hawassa   │
│                                          │
│ Admin Notes:                             │
│ [____________________________________]   │
│                                          │
│ [Approve & Assign]  [Reject]            │
└──────────────────────────────────────────┘
```

### **Officer View:**
Login as: `muni_officer` / `muni123`

```
┌─────────────────────────────────────────────────┐
│ Verification Workflow                    [Search]│
│ Two-phase listing verification system           │
├─────────────────────────────────────────────────┤
│ [Total: 234] [My Queue: 5] ...                  │
├─────────────────────────────────────────────────┤
│ [My Queue] ← Active Tab                         │
├─────────────────────────────────────────────────┤
│ #234 Property in Hawassa    5,000,000 ETB      │
│ [assigned_for_verification] ⏰ 47h left         │
│ → Click to verify                               │
└─────────────────────────────────────────────────┘
```

### **Click to verify:**
```
┌──────────────────────────────────────────┐
│ Property in Hawassa               [X]    │
├──────────────────────────────────────────┤
│ PHASE 2: OFFICER VERIFICATION            │
│                                          │
│ Admin Notes:                             │
│ 📝 Documents verified. Please check     │
│    Carta registry.                      │
│                                          │
│ Verification Notes:                      │
│ [____________________________________]   │
│ [____________________________________]   │
│ [____________________________________]   │
│                                          │
│ [Approve & Publish]  [Reject]           │
└──────────────────────────────────────────┘
```

---

## 🎯 Test Workflow

### **As Super Admin:**
1. Click "Verification Workflow"
2. See pending listings
3. Click a listing
4. Select officer: "Municipality Clerk Seat 02"
5. Add note: "Please verify Carta"
6. Click "Approve & Assign"
7. ✅ Listing assigned to officer

### **As Officer:**
1. Logout (top right)
2. Login as `muni_officer` / `muni123`
3. Click "Verification Workflow"
4. See "My Queue" tab (should have 1 item)
5. Click the listing
6. Add note: "Carta verified. Ownership confirmed."
7. Click "Approve & Publish"
8. ✅ Listing is now LIVE!

---

## 📊 Dashboard Stats Explained

| Stat | Meaning |
|------|---------|
| **Total** | All listings in verification system |
| **Pending** | Waiting for admin review (Phase 1) |
| **Assigned** | With officers for verification (Phase 2) |
| **Approved** | Verified and published |
| **Rejected** | Rejected by admin |
| **Escalated** | Officer rejected, needs super admin |
| **Overdue** | Missed 48-hour SLA deadline |

---

## 🔑 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Super Admin | `superadmin` | `superadmin123` |
| Admin | `admin` | `admin123` |
| Municipality | `muni_officer` | `muni123` |
| Transport | `trans_officer` | `trans123` |

---

## ✅ Success Checklist

After starting:
- [ ] MySQL is running
- [ ] Backend shows "Server running on http://localhost:4003"
- [ ] Can login to admin panel
- [ ] "Verification Workflow" appears in sidebar
- [ ] Can see stats dashboard
- [ ] Can click listings
- [ ] Can review and assign (as admin)
- [ ] Can verify and approve (as officer)

---

## 🆘 Quick Fixes

### Server won't start:
```bash
# Kill any process using port 4003
netstat -ano | findstr "4003"
taskkill /PID <PID> /F

# Restart
npm run dev
```

### No officers in dropdown:
```bash
# Create officers
node database/seed.js
```

### No listings to review:
```bash
# Create test listing
node test_verification_workflow.js
```

---

**Ready! Open http://localhost:4003/admin and start verifying! 🚀**
