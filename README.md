# Legal & Regulatory Claims Audit Engine

## App Page: [Google AI Studio](https://aistudio.google.com/apps/28b6982d-1874-4413-86af-c6fe15a8aa11)

## Data: Google Sheets

Public pages (Products & Claims, Sources) read the CGaRd Google Sheet at runtime; product data is not stored in the code.

- Sheet: `1QKGBJxDB_GngxSDz7-VjxHwX3Cf0W47khLTrsWepFow` (default in `src/data/publicSheets.ts`; override with `VITE_CGARD_SPREADSHEET_ID`). Sharing must be "Anyone with the link: Viewer". Everything in the sheet is public, including notes.
- Flow: `publicSheets.ts` (fetch + validate 13 tabs) → `sheetCards.ts` (products, five-section cards) → `SheetShowcase` / `SheetClaimCard` / `SheetSourcesView`.
- Card sections (fixed order): Regulatory basis · Clinical data for this product · Notified actives with established androgenetic alopecia evidence · Permissible claim language · Claim history. The sheet's README tab maps each section to its tabs.
- A section shows as Verified only when CardReview marks it PUBLISHED and all its sources (and claim links) are VERIFIED. Draft sections are shown with a "Draft · under review" label. `notes` columns are for editors and are not rendered.
- After editing the sheet, press Refresh in the app. No redeploy is needed for data changes.
- If the sheet cannot be read or fails validation (missing tab or header, duplicate ID, broken reference), the app shows the error instead of old data.
- Product images: `Products.image_url`, either `/images/products/<file>.jpg` (files in `public/images/products/`) or an https URL.
- Developer mode (workbench, pipeline, review queue) still uses the built-in legacy dataset in `src/data/registryProducts.ts`.

## Issue 3 Implementation: Status Badge Single Source of Truth

### Decision on ACTIVE (Requirement 3.2)
- **Decision Implemented**: **(a) 'ACTIVE' is not a regulatory status.**
- **Rationale & Architecture**:
  - In the 2026-10-11 recording, Eucerin claim `c_20261005_eur_dca_002` showed badge `RESTRICTED` in the dossier list and badge `ACTIVE` in the 'claims on this bottle' strip. One claim, two statuses, on one screen.
  - `ACTIVE` was mistakenly used to represent channel presence / active on-pack selection rather than regulatory status.
  - Under regulatory governance, a claim's status is strictly defined under Layer 2, with the closed enum:
    `[BANNED, RESTRICTED, PERMITTED, PERMITTED_WITH_CRITERIA, UNKNOWN]`
  - `ACTIVE` is **deleted** from all regulatory status badge definitions. Any attempt to render `ACTIVE` as a regulatory badge value is caught by the enum validator and rejected as unrenderable (`UNRENDERABLE: ACTIVE`).
  - Channel presence ("claim currently displayed on live channel / bottle") belongs exclusively to **Layer 5 (Claim History & Lifecycle)** as a lifecycle attribute (`channel_display_status: 'ON_PACK' | 'IN_COMMERCE'`), never as a regulatory status badge.
  - All surfaces (dossier list, product strip, card header, exports) now call the single authoritative renderer `RegulatoryStatusBadge` reading directly from `claimRecordStore.lookup(claim_id, 'banned_status')`.
