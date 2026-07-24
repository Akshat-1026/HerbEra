# Packaging Compliance Audit — Herb-Era

## Mandatory Fields (as per AYUSH / Legal Metrology)

| # | Field | ProductCard | ProductDetails | Model/Schema | Seed Data | Status |
|---|-------|:-----------:|:--------------:|:------------:|:---------:|:------:|
| 1 | Logo | ✗ | ✗ | ✗ | ✗ | **Missing** |
| 2 | Product name | ✓ | ✓ | ✓ | ✓ | **OK** |
| 3 | Net quantity | ✗ | ✗ | ✗ | ✗ | **Missing** |
| 4 | Ingredient list | ✗ | ✓ | ✓ | ✓ | **OK** |
| 5 | Usage directions | ✗ | ✓ | ✓ | ✓ | **OK** |
| 6 | Storage instructions | ✗ | ✗ | ✗ | ✗ | **Missing** |
| 7 | Batch number | ✗ | ✗ | ✗ | ✗ | **Missing** |
| 8 | Manufacturing date | ✗ | ✗ | ✗ | ✗ | **Missing** |
| 9 | Expiry date | ✗ | ⚠️ (in UI, not in schema/seed) | ✗ | ✗ | **Broken** |
| 10 | MRP | ⚠️ (no dedicated field) | ⚠️ (no dedicated field) | ✗ | ✗ | **Broken** |
| 11 | Manufacturer name/address | ✗ | ✗ | ✗ | ✗ | **Missing** |
| 12 | Mfg. License number | ✗ | ✗ | ✗ | ✗ | **Missing** |
| 13 | Customer care contact | ✗ | ✗ | ✗ | ✗ | **Missing** |
| 14 | Country of origin | ✗ | ✗ | ✗ | ✗ | **Missing** |

## Prohibited Claims to Remove (AYUSH non-compliant)
- "No side effects" / "Guaranteed cure" / "100% cures" — check translations and product descriptions

## Files to Modify
- `backend/models/Product.js` — add fields
- `backend/data/products.js` — populate seed data
- `frontend/src/pages/ProductDetails.jsx` — display all fields
- `frontend/src/components/ProductCard.jsx` — show MRP, net qty, logo
- `frontend/src/i18n/locales/en.json` / `hi.json` — add translations
