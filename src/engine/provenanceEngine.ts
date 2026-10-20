import {
  AuditCard,
  EvidenceRowItem,
  NotifiedActiveItem,
  ProvenanceObject,
  ProvenanceSourceType,
  ReviewQueueItem,
} from '../types/schema';
import {
  RAW_CLAIMS,
  RAW_SUBSTANTIATION,
  PRODUCT_ID_TO_SLUG,
} from '../data/registryProducts';

/**
 * Validates whether a provenance object fulfills the strict provenance rules.
 * Rule: Fields with empty provenance_id render as 'Not on file'.
 */
export function validateProvenance(prov?: ProvenanceObject<any> | null): {
  isValid: boolean;
  missingField?: string;
  errorReason?: string;
} {
  if (!prov) {
    return { isValid: false, missingField: 'provenance_object', errorReason: 'Provenance object missing entirely' };
  }

  // If registry_ref or provenance_id is explicitly missing on curated tables
  if (prov.source_type === 'curated_evidence_table' && (!prov.registry_ref || prov.registry_ref.trim() === '')) {
    return { isValid: false, missingField: 'registry_ref', errorReason: 'Empty provenance_id renders as Not on file' };
  }

  // 1. Required for all
  if (prov.field_value === undefined || prov.field_value === null || prov.field_value === '' || prov.field_value === 'Not on file') {
    return { isValid: false, missingField: 'field_value', errorReason: 'field_value is Not on file or empty' };
  }
  if (!prov.source_type) {
    return { isValid: false, missingField: 'source_type', errorReason: 'source_type is required' };
  }
  if (!prov.captured_date) {
    return { isValid: false, missingField: 'captured_date', errorReason: 'captured_date is required' };
  }

  // 2. Conditional requirements
  switch (prov.source_type) {
    case 'public_registry':
      if (!prov.source_url && !prov.registry_ref) {
        return { isValid: false, missingField: 'source_url', errorReason: 'public_registry requires source_url or registry_ref' };
      }
      break;

    case 'brand_stated':
      if (!prov.source_url && !prov.source_quote) {
        return { isValid: false, missingField: 'source_quote', errorReason: 'brand_stated requires source_quote' };
      }
      break;

    case 'curated_evidence_table':
      if (!prov.registry_ref) {
        return { isValid: false, missingField: 'registry_ref', errorReason: 'curated_evidence_table requires registry_ref (provenance_id)' };
      }
      break;

    case 'unavailable':
      return { isValid: false, missingField: 'unavailable', errorReason: 'Marked unavailable / empty provenance_id' };

    default:
      break;
  }

  return { isValid: true };
}

/**
 * Creates a standard ReviewQueueItem for missing provenance.
 */
export function createMissingProvenanceQueueItem(
  claimId: string,
  claimText: string,
  fieldKey: string,
  fieldLabel: string,
  reason: string,
  currentValue?: any
): ReviewQueueItem {
  return {
    id: `rev_prov_${fieldKey}_${claimId}`,
    stage: 'provenance',
    event_name: 'MISSING_PROVENANCE',
    severity: 'block',
    claim_text: claimText,
    reason: `MISSING_PROVENANCE: Field "${fieldLabel}" (${fieldKey}) lacks valid provenance ID. Reason: ${reason}`,
    confidence: 0.0,
    payload: {
      claim_id: claimId,
      field_key: fieldKey,
      field_label: fieldLabel,
      reason,
      current_value: currentValue,
      detected_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
  };
}

/**
 * Creates a ReviewQueueItem for cross-claim contamination render violation.
 */
export function createCrossClaimQueueItem(
  claimId: string,
  targetClaimId: string,
  claimText: string,
  fieldKey: string,
  fieldLabel: string,
  reason: string
): ReviewQueueItem {
  return {
    id: `rev_crossclaim_${fieldKey}_${claimId}_to_${targetClaimId}`,
    stage: 'template_failure',
    event_name: 'CROSS_CLAIM_RENDER',
    severity: 'block',
    claim_text: claimText,
    reason: `CROSS_CLAIM_RENDER: Field "${fieldLabel}" (${fieldKey}) is bound to claim "${targetClaimId}" but attempted render on card "${claimId}". Violation blocks card. Reason: ${reason}`,
    confidence: 0.0,
    payload: {
      claim_id: claimId,
      target_claim_id: targetClaimId,
      field_key: fieldKey,
      field_label: fieldLabel,
      detected_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
  };
}

/**
 * Creates a ReviewQueueItem for identical-content suspicion warning.
 */
export function createIdenticalCardContentQueueItem(
  claimId1: string,
  claimId2: string,
  claimText: string,
  identicalFields: string[]
): ReviewQueueItem {
  const sortedIds = [claimId1, claimId2].sort();
  return {
    id: `rev_ident_${sortedIds[0]}_${sortedIds[1]}`,
    stage: 'template_failure',
    event_name: 'IDENTICAL_CARD_CONTENT',
    severity: 'warning',
    claim_text: claimText,
    reason: `IDENTICAL_CARD_CONTENT [WARNING]: Claim "${claimId1}" and Claim "${claimId2}" render byte-identical values across substantive fields (${identicalFields.join(', ')}). Human confirmation required.`,
    confidence: 0.5,
    payload: {
      claim_id: claimId1,
      target_claim_id: claimId2,
      identical_fields: identicalFields,
      detected_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
  };
}

/**
 * Derives formula active profiles with exact provenance from Registry v2.
 * Rule: Fields with empty provenance_id render as 'Not on file'.
 */
export function getProductActivesWithProvenance(
  slugOrProdId: string,
  claimId: string
): NotifiedActiveItem[] {
  const claim = RAW_CLAIMS.find((c) => c.claim_id === claimId);
  if (!claim || !claim.implicated_actives || claim.implicated_actives.length === 0) {
    return [];
  }

  const hasProvId = Boolean(claim.provenance_id && claim.provenance_id.trim().length > 0);

  return claim.implicated_actives.map((activeName, idx) => {
    if (!hasProvId) {
      return {
        active_name: activeName,
        concentration: null,
        display_text: 'Not on file',
        is_valid: false,
        provenance: null,
      };
    }

    return {
      active_name: activeName,
      concentration: null,
      display_text: `${activeName} (notified active)`,
      is_valid: true,
      provenance: {
        field_value: activeName,
        source_type: 'curated_evidence_table',
        captured_date: claim.capture_date,
        registry_ref: claim.provenance_id || undefined,
        source_quote: `${activeName} notified active ingredient for claim ${claim.claim_id}.`,
      },
    };
  });
}

/**
 * Derives evidentiary rows directly from RAW_SUBSTANTIATION.
 * Rule: Fields with empty provenance_id render as 'Not on file'.
 * Evidence counts are computed from substantiation rows — never stored or typed.
 */
export function getProductEvidenceRows(slugOrProdId: string, claimId?: string): EvidenceRowItem[] {
  let matchingSubs = RAW_SUBSTANTIATION;

  if (claimId) {
    matchingSubs = matchingSubs.filter((s) => s.claim_id === claimId);
  } else {
    // Match by product
    const prodClaims = RAW_CLAIMS.filter(
      (c) => c.product_id === slugOrProdId || PRODUCT_ID_TO_SLUG[c.product_id] === slugOrProdId
    );
    const claimIds = new Set(prodClaims.map((c) => c.claim_id));
    matchingSubs = matchingSubs.filter((s) => claimIds.has(s.claim_id));
  }

  return matchingSubs.map((sub) => {
    const hasProv = Boolean(sub.provenance_id && sub.provenance_id.trim().length > 0);

    if (!hasProv) {
      return {
        active_name: sub.evidence_type.replace(/_/g, ' '),
        evidence_status: sub.status === 'ESTABLISHED' ? 'ESTABLISHED' : 'INSUFFICIENT',
        registry_ref: sub.substantiation_id,
        citation: 'Not on file',
        notes: sub.source,
        provenance: {
          field_value: 'Not on file',
          source_type: 'unavailable',
          captured_date: '2026-10-12',
          registry_ref: undefined,
          source_quote: 'Empty provenance_id — unverified public clinical trial',
        },
      };
    }

    return {
      active_name: sub.evidence_type.replace(/_/g, ' '),
      evidence_status: sub.status === 'ESTABLISHED' ? 'ESTABLISHED' : 'INSUFFICIENT',
      registry_ref: sub.provenance_id || sub.substantiation_id,
      citation: sub.source,
      notes: sub.source,
      provenance: {
        field_value: sub.source,
        source_type: 'curated_evidence_table',
        captured_date: '2026-10-12',
        registry_ref: sub.provenance_id || sub.substantiation_id,
        source_quote: sub.source,
      },
    };
  });
}
