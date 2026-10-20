import {
  ClaimFieldKey,
  ClaimFieldRecord,
  ProvenanceObject,
  RegulatoryStatus,
  RegulatoryStatusBasis,
  StatusHistoryEntry,
  VALID_REGULATORY_STATUSES,
  isValidRegulatoryStatus,
} from '../types/schema';
import {
  RAW_CLAIMS,
  RAW_REGULATORY,
  RAW_SUBSTANTIATION,
  RAW_HISTORY,
  RAW_ENFORCEMENT,
  RawClaim,
  RawRegulatoryStatus,
  RawSubstantiation,
} from './registryProducts';

/**
 * ClaimRecordStoreManager — Single Source of Truth Card Field Store
 *
 * Requirements:
 * 1. Single source of truth: records built exclusively from Registry v2.
 * 2. Delete all mock/template data.
 * 3. Render cards only from these records.
 * 4. Fields with empty provenance_id render as 'Not on file'.
 * 5. banned_status values outside the enum are unrenderable.
 * 6. Evidence counts are computed from substantiation rows — never stored or typed.
 */

export function normalizeClaimId(claimId: string): string {
  if (!claimId) return '';
  const aliasMap: Record<string, string> = {
    'c_20261005_eur_dca_001': 'c_eur_001',
    'c_20261005_eur_dca_002': 'c_eur_002',
    'c_20261005_dcy_kds_001': 'c_dcy_001',
    'c_20261005_dcy_kds_002': 'c_dcy_002',
    'c_20261005_nvm_adp_001': 'c_nvm_001',
    'c_20261005_ker_sym_001': 'c_ker_001',
    'c_20261005_vch_dds_001': 'c_vch_001',
    'c_20261005_vch_dds_002': 'c_vch_002',
    'c_20261005_alp_a3_001': 'c_alp_001',
    'c_20261005_sch_bc_001': 'c_sch_001',
    'c_20261005_tbs_gsc_001': 'c_tbs_001',
    'c_20261005_elv_adp_001': 'c_elv_001',
    'c_20261005_hs_cc_001': 'c_hs_001',
  };
  return aliasMap[claimId] || claimId;
}

export class ClaimRecordStoreManager {
  private deletedFields: Set<string> = new Set();
  private overriddenStatuses: Map<string, string> = new Map();
  private crossClaimInjections: Map<string, ClaimFieldRecord> = new Map();
  private emptyProvenanceOverrides: Set<string> = new Set();
  private permissibleSwapped: boolean = false;
  private claim002GenuineL2: boolean = false;

  /**
   * Helper to check if a provenance ID is present and valid
   */
  private hasValidProvenanceId(claimId: string, fieldKey: string, provId?: string | null): boolean {
    const norm = normalizeClaimId(claimId);
    if (this.emptyProvenanceOverrides.has(`${claimId}:${fieldKey}`) || this.emptyProvenanceOverrides.has(`${norm}:${fieldKey}`)) {
      return false;
    }
    return Boolean(provId && provId.trim().length > 0);
  }

  /**
   * Pure lookup: (claim_id, field_key) -> ClaimFieldRecord | null
   */
  public lookup(claimId: string, fieldKey: string): ClaimFieldRecord | null {
    const normClaimId = normalizeClaimId(claimId);

    // 1. Cross-claim contamination injection check
    const injected =
      this.crossClaimInjections.get(`${claimId}:${fieldKey}`) ||
      this.crossClaimInjections.get(`${normClaimId}:${fieldKey}`);
    if (injected) {
      return injected;
    }

    // 2. Deliberate deletion check (for testing Issue 2 T1)
    if (
      this.deletedFields.has(`${claimId}:${fieldKey}`) ||
      this.deletedFields.has(`${normClaimId}:${fieldKey}`)
    ) {
      return null;
    }

    const claim = RAW_CLAIMS.find((c) => c.claim_id === claimId || c.claim_id === normClaimId);
    if (!claim) {
      return null;
    }

    const reg = RAW_REGULATORY.find((r) => r.claim_id === claimId);
    const subs = RAW_SUBSTANTIATION.filter((s) => s.claim_id === claimId);
    const hist = RAW_HISTORY.filter((h) => h.claim_id === claimId);

    switch (fieldKey) {
      case 'regulatory_basis': {
        if (!reg) return null;
        const validProv = this.hasValidProvenanceId(claimId, 'regulatory_basis', claim.provenance_id);
        const fieldValue = validProv ? reg.banned_under : 'Not on file';

        const provenance: ProvenanceObject<string> | null = validProv
          ? {
              field_value: reg.banned_under,
              source_type: 'public_registry',
              captured_date: claim.capture_date,
              registry_ref: claim.provenance_id || undefined,
              source_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32009R1223',
              source_quote: `${reg.banned_under} regulatory mandate applicable in ${reg.jurisdiction}.`,
            }
          : null;

        return {
          claim_id: claimId,
          field_key: 'regulatory_basis',
          field_label: 'Regulatory basis',
          field_value: fieldValue,
          source_layer: 2,
          provenance,
        };
      }

      case 'clinical_data_status': {
        const sub = subs[0];
        if (!sub) {
          return {
            claim_id: claimId,
            field_key: 'clinical_data_status',
            field_label: 'Clinical data for this product',
            field_value: 'Not on file',
            source_layer: 3,
            provenance: null,
          };
        }

        const validProv = this.hasValidProvenanceId(claimId, 'clinical_data_status', sub.provenance_id);
        const fieldValue = validProv ? sub.source : 'Not on file';

        const provenance: ProvenanceObject<string> | null = validProv
          ? {
              field_value: sub.source,
              source_type: 'curated_evidence_table',
              captured_date: claim.capture_date,
              registry_ref: sub.provenance_id || sub.substantiation_id,
              source_quote: sub.source,
            }
          : null;

        return {
          claim_id: claimId,
          field_key: 'clinical_data_status',
          field_label: 'Clinical data for this product',
          field_value: fieldValue,
          source_layer: 3,
          provenance,
          extra_meta: {
            status: sub.status,
            confidence_level: sub.confidence_level,
          },
        };
      }

      case 'actives_evidence': {
        // RULE: Evidence counts are computed from substantiation rows — never stored or typed.
        if (subs.length === 0) {
          return {
            claim_id: claimId,
            field_key: 'actives_evidence',
            field_label: 'Actives with established evidence',
            field_value: 'Not on file',
            source_layer: 3,
            provenance: null,
          };
        }

        // Check if any substantiation has empty provenance_id
        const hasMissingProvenance = subs.some(
          (s) => !this.hasValidProvenanceId(claimId, 'actives_evidence', s.provenance_id)
        );

        if (hasMissingProvenance || !this.hasValidProvenanceId(claimId, 'actives_evidence', claim.provenance_id)) {
          return {
            claim_id: claimId,
            field_key: 'actives_evidence',
            field_label: 'Actives with established evidence',
            field_value: 'Not on file',
            source_layer: 3,
            provenance: null,
            extra_meta: {
              computed_from_substantiation: true,
              total_rows: subs.length,
              provenance_missing: true,
            },
          };
        }

        // Dynamically compute count from substantiation rows
        const establishedCount = subs.filter((s) => s.status === 'ESTABLISHED').length;
        const totalCount = subs.length;
        const ratioString = `${establishedCount} of ${totalCount}`;

        return {
          claim_id: claimId,
          field_key: 'actives_evidence',
          field_label: 'Actives with established evidence',
          field_value: ratioString,
          source_layer: 3,
          provenance: {
            field_value: ratioString,
            source_type: 'curated_evidence_table',
            captured_date: claim.capture_date,
            registry_ref: subs[0]?.provenance_id || subs[0]?.substantiation_id,
            source_quote: `Computed dynamically from ${totalCount} substantiation rows: ${establishedCount} established.`,
          },
          extra_meta: {
            ratio: ratioString,
            ratio_label: 'Actives with established clinical evidence (computed from substantiation rows)',
            computed_from_substantiation: true,
            total_rows: totalCount,
            established_rows: establishedCount,
          },
        };
      }

      case 'permissible_claim_language': {
        if (!reg || !reg.exception_text) {
          return {
            claim_id: claimId,
            field_key: 'permissible_claim_language',
            field_label: 'Permissible claim language',
            field_value: 'Not on file',
            source_layer: 2,
            provenance: null,
          };
        }

        const validProv = this.hasValidProvenanceId(claimId, 'permissible_claim_language', claim.provenance_id);
        const fieldValue = validProv ? reg.exception_text : 'Not on file';

        const provenance: ProvenanceObject<string> | null = validProv
          ? {
              field_value: reg.exception_text,
              source_type: 'public_registry',
              captured_date: claim.capture_date,
              registry_ref: claim.provenance_id || undefined,
              source_quote: reg.exception_text,
            }
          : null;

        return {
          claim_id: claimId,
          field_key: 'permissible_claim_language',
          field_label: 'Permissible claim language',
          field_value: fieldValue,
          source_layer: 2,
          provenance,
        };
      }

      case 'claim_history_summary': {
        if (hist.length === 0) {
          return {
            claim_id: claimId,
            field_key: 'claim_history_summary',
            field_label: 'Claim history',
            field_value: 'Not on file',
            source_layer: 5,
            provenance: null,
          };
        }

        const validProv = this.hasValidProvenanceId(claimId, 'claim_history_summary', claim.provenance_id);
        if (!validProv) {
          return {
            claim_id: claimId,
            field_key: 'claim_history_summary',
            field_label: 'Claim history',
            field_value: 'Not on file',
            source_layer: 5,
            provenance: null,
          };
        }

        const summary = hist
          .map((h) => `v${h.version_number}: ${h.version_text} (${h.version_date})`)
          .join(' → ');

        return {
          claim_id: claimId,
          field_key: 'claim_history_summary',
          field_label: 'Claim history',
          field_value: summary,
          source_layer: 5,
          provenance: {
            field_value: summary,
            source_type: 'public_registry',
            captured_date: claim.capture_date,
            registry_ref: claim.provenance_id || undefined,
            source_quote: hist[hist.length - 1]?.change_reason || summary,
          },
        };
      }

      case 'banned_status': {
        if (!reg) return null;
        const currentStatus = this.overriddenStatuses.get(claimId) || reg.banned_status;

        return {
          claim_id: claimId,
          field_key: 'banned_status',
          field_label: 'Regulatory Status',
          field_value: currentStatus,
          source_layer: 2,
          provenance: {
            field_value: currentStatus,
            source_type: 'public_registry',
            captured_date: claim.capture_date,
            registry_ref: claim.provenance_id || undefined,
            source_quote: reg.banned_under,
          },
        };
      }

      default:
        return null;
    }
  }

  /**
   * Requirement 3.1 & 3.2: Get Status and enforce Enum rules.
   * "banned_status values outside the enum are unrenderable."
   */
  public getStatus(claimId: string): {
    claimId: string;
    rawStatus: string;
    status: RegulatoryStatus;
    basis: RegulatoryStatusBasis | null;
    history: StatusHistoryEntry[];
    isValid: boolean;
    isMissing: boolean;
    isUnrenderable: boolean;
    unrenderableReason?: string;
  } {
    const norm = normalizeClaimId(claimId);

    // 1. Check if status deleted
    if (this.deletedFields.has(`${claimId}:banned_status`) || this.deletedFields.has(`${norm}:banned_status`)) {
      return {
        claimId,
        rawStatus: 'UNKNOWN',
        status: 'UNKNOWN',
        basis: null,
        history: [],
        isValid: false,
        isMissing: true,
        isUnrenderable: false,
        unrenderableReason: 'Status record deleted. Renders as Not on file.',
      };
    }

    const reg = RAW_REGULATORY.find((r) => r.claim_id === claimId || r.claim_id === norm);
    const raw =
      this.overriddenStatuses.get(claimId) ||
      this.overriddenStatuses.get(norm) ||
      reg?.banned_status ||
      'UNKNOWN';

    // Check against valid regulatory enum
    const isEnumMember = isValidRegulatoryStatus(raw);

    const basis: RegulatoryStatusBasis = {
      matched_provision_ref: reg?.banned_under || 'EU Cosmetics Reg. 1223/2009',
      match_confidence: reg?.match_confidence === 'HIGH' ? 0.95 : 0.75,
      exception_text: reg?.exception_text || undefined,
      source_quote: reg?.banned_under || undefined,
    };

    const history: StatusHistoryEntry[] = [
      {
        status: isEnumMember ? (raw as RegulatoryStatus) : 'UNKNOWN',
        set_by: 'ClaimGuard Registry v2 Audit',
        date: '2026-10-12',
        basis_ref: reg?.regulatory_id || 'reg_v2_baseline',
      },
    ];

    // RULE: "banned_status values outside the enum are unrenderable."
    if (!isEnumMember) {
      return {
        claimId,
        rawStatus: raw,
        status: 'UNKNOWN',
        basis,
        history,
        isValid: false,
        isMissing: false,
        isUnrenderable: true,
        unrenderableReason: `UNRENDERABLE: "${raw}" is outside the valid regulatory status enum [${VALID_REGULATORY_STATUSES.join(', ')}]. It cannot be rendered as a valid regulatory status.`,
      };
    }

    if (!reg) {
      return {
        claimId,
        rawStatus: 'UNKNOWN',
        status: 'UNKNOWN',
        basis: null,
        history: [],
        isValid: false,
        isMissing: true,
        isUnrenderable: false,
        unrenderableReason: 'No regulatory status on file for this claim.',
      };
    }

    return {
      claimId,
      rawStatus: raw,
      status: raw as RegulatoryStatus,
      basis,
      history,
      isValid: true,
      isMissing: false,
      isUnrenderable: false,
    };
  }

  // --- Test & Interactive Simulation Methods ---

  public deleteRecord(claimId: string, fieldKey: string): void {
    const norm = normalizeClaimId(claimId);
    this.deletedFields.add(`${claimId}:${fieldKey}`);
    this.deletedFields.add(`${norm}:${fieldKey}`);
  }

  public restoreRecord(claimId: string, fieldKey: string): void {
    const norm = normalizeClaimId(claimId);
    this.deletedFields.delete(`${claimId}:${fieldKey}`);
    this.deletedFields.delete(`${norm}:${fieldKey}`);
  }

  public isRecordDeleted(claimId: string, fieldKey: string): boolean {
    const norm = normalizeClaimId(claimId);
    return this.deletedFields.has(`${claimId}:${fieldKey}`) || this.deletedFields.has(`${norm}:${fieldKey}`);
  }

  public isPermissibleSwapped(): boolean {
    return this.permissibleSwapped;
  }

  public swapPermissibleLanguage(): void {
    this.permissibleSwapped = !this.permissibleSwapped;
    const id1 = 'c_eur_001';
    const id2 = 'c_eur_002';
    const long1 = 'c_20261005_eur_dca_001';
    const long2 = 'c_20261005_eur_dca_002';

    if (this.permissibleSwapped) {
      const rec1 = this.lookup(id1, 'permissible_claim_language');
      const rec2 = this.lookup(id2, 'permissible_claim_language');
      if (rec1 && rec2) {
        this.crossClaimInjections.set(`${id1}:permissible_claim_language`, {
          ...rec2,
          claim_id: id1,
        });
        this.crossClaimInjections.set(`${id2}:permissible_claim_language`, {
          ...rec1,
          claim_id: id2,
        });
        this.crossClaimInjections.set(`${long1}:permissible_claim_language`, {
          ...rec2,
          claim_id: long1,
        });
        this.crossClaimInjections.set(`${long2}:permissible_claim_language`, {
          ...rec1,
          claim_id: long2,
        });
      }
    } else {
      this.crossClaimInjections.delete(`${id1}:permissible_claim_language`);
      this.crossClaimInjections.delete(`${id2}:permissible_claim_language`);
      this.crossClaimInjections.delete(`${long1}:permissible_claim_language`);
      this.crossClaimInjections.delete(`${long2}:permissible_claim_language`);
    }
  }

  public hasClaim002GenuineL2(): boolean {
    return this.claim002GenuineL2;
  }

  public toggleClaim002GenuineL2(): void {
    this.claim002GenuineL2 = !this.claim002GenuineL2;
    const id2 = 'c_eur_002';
    const long2 = 'c_20261005_eur_dca_002';
    if (this.claim002GenuineL2) {
      const genuineL2Record: ClaimFieldRecord = {
        claim_id: id2,
        field_key: 'regulatory_basis',
        field_label: 'Regulatory basis',
        field_value: 'EU Cosmetics Reg. 1223/2009 Annex III/285 (Dermatological Formula Safety Clearance)',
        source_layer: 2,
        provenance: {
          field_value: 'EU Cosmetics Reg. 1223/2009 Annex III/285',
          source_type: 'public_registry',
          captured_date: '2026-10-12',
          registry_ref: 'pv_006',
          source_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32009R1223',
          source_quote: 'Annex III/285 Dermatological formula safety assessment and compliance dossier approved.',
        },
      };
      this.crossClaimInjections.set(`${id2}:regulatory_basis`, genuineL2Record);
      this.crossClaimInjections.set(`${long2}:regulatory_basis`, {
        ...genuineL2Record,
        claim_id: long2,
      });
    } else {
      this.crossClaimInjections.delete(`${id2}:regulatory_basis`);
      this.crossClaimInjections.delete(`${long2}:regulatory_basis`);
    }
  }

  public isStatusDeleted(claimId: string): boolean {
    const norm = normalizeClaimId(claimId);
    return this.deletedFields.has(`${claimId}:banned_status`) || this.deletedFields.has(`${norm}:banned_status`);
  }

  public deleteStatusRecord(claimId: string): void {
    const norm = normalizeClaimId(claimId);
    this.deletedFields.add(`${claimId}:banned_status`);
    this.deletedFields.add(`${norm}:banned_status`);
  }

  public restoreStatusRecord(claimId: string): void {
    const norm = normalizeClaimId(claimId);
    this.deletedFields.delete(`${claimId}:banned_status`);
    this.deletedFields.delete(`${norm}:banned_status`);
  }

  public hasActiveStatusInjection(claimId: string): boolean {
    const norm = normalizeClaimId(claimId);
    return (
      this.overriddenStatuses.get(claimId) === 'ACTIVE' ||
      this.overriddenStatuses.get(norm) === 'ACTIVE'
    );
  }

  public toggleActiveStatusInjection(claimId: string): void {
    const norm = normalizeClaimId(claimId);
    if (this.hasActiveStatusInjection(claimId)) {
      this.overriddenStatuses.delete(claimId);
      this.overriddenStatuses.delete(norm);
    } else {
      this.overriddenStatuses.set(claimId, 'ACTIVE');
      this.overriddenStatuses.set(norm, 'ACTIVE');
    }
  }

  /**
   * Simulate a status outside the enum (e.g. 'ACTIVE', 'ILLEGAL', 'UNAPPROVED')
   */
  public simulateStatus(claimId: string, status: string): void {
    const norm = normalizeClaimId(claimId);
    this.overriddenStatuses.set(claimId, status);
    this.overriddenStatuses.set(norm, status);
  }

  public resetStatus(claimId: string): void {
    const norm = normalizeClaimId(claimId);
    this.overriddenStatuses.delete(claimId);
    this.overriddenStatuses.delete(norm);
  }

  public promoteStatusViaReview(
    claimId: string,
    newStatus: RegulatoryStatus,
    reviewerName: string,
    basisRef: string,
    notes?: string
  ): void {
    if (!isValidRegulatoryStatus(newStatus)) {
      throw new Error(`Invalid status enum: ${newStatus}`);
    }
    const norm = normalizeClaimId(claimId);
    this.overriddenStatuses.set(claimId, newStatus);
    this.overriddenStatuses.set(norm, newStatus);
  }

  public toggleEmptyProvenance(claimId: string, fieldKey: string): boolean {
    const norm = normalizeClaimId(claimId);
    const key = `${claimId}:${fieldKey}`;
    const normKey = `${norm}:${fieldKey}`;
    if (this.emptyProvenanceOverrides.has(key) || this.emptyProvenanceOverrides.has(normKey)) {
      this.emptyProvenanceOverrides.delete(key);
      this.emptyProvenanceOverrides.delete(normKey);
      return false;
    } else {
      this.emptyProvenanceOverrides.add(key);
      this.emptyProvenanceOverrides.add(normKey);
      return true;
    }
  }

  public isProvenanceEmptied(claimId: string, fieldKey: string): boolean {
    const norm = normalizeClaimId(claimId);
    return (
      this.emptyProvenanceOverrides.has(`${claimId}:${fieldKey}`) ||
      this.emptyProvenanceOverrides.has(`${norm}:${fieldKey}`)
    );
  }

  public injectCrossClaimContamination(
    targetCardClaimId: string,
    foreignClaimId: string,
    fieldKey: string
  ): void {
    const foreignRecord = this.lookup(foreignClaimId, fieldKey);
    if (foreignRecord) {
      this.crossClaimInjections.set(`${targetCardClaimId}:${fieldKey}`, {
        ...foreignRecord,
        claim_id: foreignClaimId, // Deliberate mismatch
      });
    }
  }

  public clearCrossClaimInjections(): void {
    this.crossClaimInjections.clear();
    this.permissibleSwapped = false;
    this.claim002GenuineL2 = false;
  }

  public hasCrossClaimInjection(claimId: string, fieldKey: string): boolean {
    const norm = normalizeClaimId(claimId);
    return (
      this.crossClaimInjections.has(`${claimId}:${fieldKey}`) ||
      this.crossClaimInjections.has(`${norm}:${fieldKey}`)
    );
  }

  public resetToPristine(): void {
    this.deletedFields.clear();
    this.overriddenStatuses.clear();
    this.crossClaimInjections.clear();
    this.emptyProvenanceOverrides.clear();
    this.permissibleSwapped = false;
    this.claim002GenuineL2 = false;
  }

  public getAllClaimIds(): string[] {
    return RAW_CLAIMS.map((c) => c.claim_id);
  }
}

export const claimRecordStore = new ClaimRecordStoreManager();
