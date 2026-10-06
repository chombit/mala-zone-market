# 📋 Quick Reference: Admin Document Upload

## 🎯 One-Minute Guide

### How to Upload Documents for G2B Verification

```
1. Open listing → 2. Add documents → 3. Assign officer → Done!
```

---

## 📝 Upload Form Fields

### 1. **Document Type** (Required)
```
Dropdown options:
├─ Carta (Land Registry)        ← Most common for property
├─ Ownership Certificate
├─ Property Tax Receipt
├─ Transfer Document
├─ ID Copy                      ← Required for verification
├─ Vehicle Registration         ← For transport listings
├─ Insurance Document
└─ Other
```

### 2. **Description for G2B Officer** (Required)
```
What to write:
✅ What to verify: "Check plot 1234-A in land registry"
✅ Expected result: "Owner name should match: Abebe Kebede"
✅ Specific checks: "Verify no liens or disputes recorded"

❌ Don't write:
"Check this" ← Too vague
"Carta" ← No instructions
"" ← Empty
```

### 3. **File URL/Path** (Required)
```
Accepted formats:
✅ /uploads/listings/123/carta.pdf
✅ /uploads/documents/ownership.pdf
✅ https://yourdomain.com/docs/file.pdf
✅ https://s3.amazonaws.com/bucket/file.pdf

❌ Not accepted:
C:\local\path.pdf ← Local paths won't work for officer
file.pdf ← Needs full path
```

---

## 🔢 Quick Examples

### Example 1: Property in Hawassa
```
Document 1:
Type: Carta (Land Registry)
Description: "Verify plot 1234-A in Tabor sub-city. Owner: Abebe Kebede.
              Check for liens in government system."
URL: /uploads/listings/789/carta_tabor.pdf

Document 2:
Type: Property Tax Receipt
Description: "Check 2023 tax paid. Receipt #789456. No arrears."
URL: /uploads/listings/789/tax_2023.pdf

Document 3:
Type: ID Copy
Description: "Verify ID matches Carta owner name. ID: ET-123-456-789."
URL: /uploads/listings/789/id_abebe.pdf
```

### Example 2: Vehicle in Addis Ababa
```
Document 1:
Type: Vehicle Registration
Description: "Verify plate AA-12345 in transport authority system.
              Owner must match seller name."
URL: /uploads/listings/790/vehicle_reg.pdf

Document 2:
Type: Insurance Document
Description: "Check insurance valid for 2026. No claims history."
URL: /uploads/listings/790/insurance.pdf

Document 3:
Type: ID Copy
Description: "Seller ID verification. Name on registration."
URL: /uploads/listings/790/seller_id.pdf
```

---

## ⚡ Quick Actions

### Upload Multiple Documents Fast:
```
1. Fill form → Click [+ Add Document]
2. Form clears automatically
3. Repeat for next document
4. All documents appear in list above
```

### Remove Wrong Document:
```
Click [×] button next to document
```

### Upload Zero Documents:
```
⚠️ Warning appears: "No documents uploaded. Continue?"
✅ You can continue (not recommended)
❌ Better to upload at least 1 document
```

---

## 🎨 What Officer Sees

### Your Upload:
```
Admin uploads:
Type: "Carta (Land Registry)"
Description: "Verify plot 1234-A in Tabor. Owner: Abebe Kebede."
URL: /uploads/carta.pdf
```

### Officer Views:
```
┌────────────────────────────────────────────┐
│ 📄 Carta (Land Registry)      [View] →    │
│ Admin notes: Verify plot 1234-A in Tabor. │
│ Owner: Abebe Kebede.                       │
└────────────────────────────────────────────┘
```

Officer clicks [View] → PDF opens → Officer verifies → Approves/Rejects

---

## ✅ Validation Rules

### Before Submitting:
- ✅ At least 1 document recommended
- ✅ All fields filled (Type + Description + URL)
- ✅ Description explains what to verify
- ✅ URL is valid and accessible
- ✅ Officer selected from dropdown
- ✅ Admin notes added (optional but helpful)

### Button Shows:
```
[Approve & Assign (0 docs)]  ← Warning if 0
[Approve & Assign (3 docs)]  ← Good! 3 documents
```

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Vague Description
```
Bad: "Check this document"
Good: "Verify plot 1234-A in land registry. Owner: Abebe Kebede."
```

### ❌ Mistake 2: Wrong URL Format
```
Bad: C:\Documents\carta.pdf
Good: /uploads/listings/123/carta.pdf
```

### ❌ Mistake 3: No Context
```
Bad: Description: "Carta"
Good: Description: "Verify plot exists in government system. Check for liens."
```

### ❌ Mistake 4: Uploading Zero Documents
```
Bad: Approve without documents
Good: Upload 2-4 documents before approving
```

---

## 📊 Best Practices

### Minimum Documents:
- **Property:** 2-3 documents (Carta + Tax + ID)
- **Vehicle:** 2 documents (Registration + Insurance)
- **Land:** 2-3 documents (Carta + Survey + ID)

### Description Length:
- **Minimum:** 1 sentence
- **Ideal:** 2-3 sentences
- **Maximum:** 1 paragraph

### Document Order:
1. Primary proof (Carta/Registration)
2. Supporting docs (Tax/Insurance)
3. Identity verification (ID Copy)

---

## 🔄 Workflow Reminder

```
┌─────────────────────────────────────────────┐
│ PHASE 1: ADMIN (You are here)               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 1. Review listing                           │
│ 2. Upload documents ← Current step          │
│ 3. Add descriptions                          │
│ 4. Assign to officer                         │
│ 5. Click "Approve & Assign"                 │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ PHASE 2: G2B OFFICER                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 1. Receives assignment                       │
│ 2. Views documents & your descriptions       │
│ 3. Verifies against government records       │
│ 4. Approves or rejects                       │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ RESULT                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ ✅ Approved → Listing published              │
│ ❌ Rejected → User notified with reason      │
└─────────────────────────────────────────────┘
```

---

## 💡 Pro Tips

### Tip 1: Use Specific Plot Numbers
```
✅ "Verify plot 1234-A in Tabor sub-city"
❌ "Verify plot in system"
```

### Tip 2: Include Receipt Numbers
```
✅ "Tax receipt #789456 - Check in municipal database"
❌ "Check tax receipt"
```

### Tip 3: Name Matching Instructions
```
✅ "Owner name must match: Abebe Kebede (on Carta and ID)"
❌ "Check owner name"
```

### Tip 4: Add Deadlines in Notes
```
✅ Admin Notes: "Urgent - needs approval by tomorrow for client meeting"
❌ Admin Notes: "Please verify"
```

---

## 📱 Mobile Quick Reference

### On Mobile/Tablet:
1. Scroll to document section
2. Tap document type dropdown
3. Type description (voice input works)
4. Paste/type URL
5. Tap "Add Document"
6. Repeat
7. Assign officer
8. Tap "Approve & Assign"

---

## 🎯 Success Checklist

Before clicking "Approve & Assign":
- [ ] At least 1 document uploaded (2-3 recommended)
- [ ] Each document has clear description
- [ ] URLs are valid and accessible
- [ ] Officer selected (matches city)
- [ ] Admin notes added (optional)
- [ ] Listing details reviewed
- [ ] Ready to assign

---

## 📞 Need Help?

### Common Questions:

**Q: Can I edit documents after assigning?**  
A: No. Upload all documents before clicking "Approve & Assign".

**Q: What if I uploaded wrong document?**  
A: Click [×] to remove, then add correct one.

**Q: How many documents should I upload?**  
A: 2-3 is ideal. At least 1 required.

**Q: Can officer see my description?**  
A: Yes! Officer sees exactly what you write.

**Q: What if URL is wrong?**  
A: Officer won't be able to view. Upload again with correct URL.

---

## 🔗 More Info

- **Full Guide:** ADMIN_DOCUMENT_UPLOAD_GUIDE.md
- **Workflow:** DOCUMENT_UPLOAD_FLOW.md
- **Technical:** VERIFICATION_WORKFLOW_COMPLETE.md

---

**Print this page and keep it at your desk!**

**Last Updated:** September 28, 2026
