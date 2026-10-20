# Legal & Regulatory Claims Audit Engine

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
