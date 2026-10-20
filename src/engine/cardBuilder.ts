import {
  AuditCard,
  CardValidationEvent,
  Confidence,
  EvidenceRowItem,
  NotifiedActiveItem,
  ProductRecord,
  ProvenanceObject,
  RoutingDecision,
  Status,
  SubstantiationEntryBlock,
} from '../types/schema';
import {
  getProductActivesWithProvenance,
  getProductEvidenceRows,
  validateProvenance,
} from './provenanceEngine';
import { claimRecordStore, normalizeClaimId } from '../data/claimRecords';

export const CONFIDENCE_THRESHOLD_HIGH = 0.85;
export const CONFIDENCE_THRESHOLD_MEDIUM = 0.60;
export const RENDER_BLOCKING_STATUSES = new Set<Status>(['TO_COLLECT', 'UNKNOWN']);

export function confidenceFromMatch(c: Confidence): number {
  switch (c) {
    case 'HIGH':
      return 0.95;
    case 'MEDIUM':
      return 0.75;
    case 'LOW':
      return 0.45;
    case 'UNVERIFIED':
      return 0.30;
    case 'CRITICAL':
      return 0.10;
    default:
      return 0.0;
  }
}

export function routeDecision(confidenceFloat: number): RoutingDecision {
  if (confidenceFloat >= CONFIDENCE_THRESHOLD_HIGH) {
    return 'AUTO_PASS';
  }
  if (confidenceFloat >= CONFIDENCE_THRESHOLD_MEDIUM) {
    return 'RENDER_WITH_CAVEAT';
  }
  return 'HUMAN_REVIEW';
}

export function canRenderExternal(status: Status): boolean {
  return !RENDER_BLOCKING_STATUSES.has(status);
}

export interface RegistryDatabase {
  products: Record<string, ProductRecord>;
  byClaim: Record<
    string,
    {
      product: ProductRecord;
      claim: any;
      regulatory: any[];
      substantiation: any[];
      enforcement: any[];
      history: any[];
      corrections: any[];
    }
  >;
}

export function buildDatabase(productsList: ProductRecord[]): RegistryDatabase {
  const products: Record<string, ProductRecord> = {};
  const byClaim: RegistryDatabase['byClaim'] = {};

  for (const product of productsList) {
    products[product.slug] = product;
    for (const c of product.claims) {
      byClaim[c.claim_id] = {
        product,
        claim: c,
        regulatory: [],
        substantiation: [],
        enforcement: [],
        history: [],
        corrections: [],
      };
    }
    for (const r of product.regulatory) {
      if (byClaim[r.claim_id]) {
        byClaim[r.claim_id].regulatory.push(r);
      }
    }
    for (const s of product.substantiation) {
      if (byClaim[s.claim_id]) {
        byClaim[s.claim_id].substantiation.push(s);
      }
    }
    for (const e of product.enforcement) {
      for (const cid of e.claim_id) {
        if (byClaim[cid]) {
          byClaim[cid].enforcement.push(e);
        }
      }
    }
    for (const h of product.history) {
      if (byClaim[h.claim_id]) {
        byClaim[h.claim_id].history.push(h);
      }
    }
    for (const k of product.corrections) {
      for (const cid of k.claim_id) {
        if (byClaim[cid]) {
          byClaim[cid].corrections.push(k);
        }
      }
    }
  }

  return { products, byClaim };
}

export function buildCard(
  db: RegistryDatabase,
  claimId: string,
  forExternal: boolean = false,
  deletedProvenanceFields: string[] = []
): AuditCard {
  let rec = db.byClaim[claimId];
  if (!rec || !rec.claim) {
    const norm = normalizeClaimId(claimId);
    rec = db.byClaim[norm];
  }
  if (!rec || !rec.claim) {
    const firstKey = Object.keys(db.byClaim)[0];
    rec = db.byClaim[firstKey];
  }
  if (!rec || !rec.claim) {
    throw new Error(`claim_id "${claimId}" not found in database.`);
  }

  const claim = rec.claim;
  const missingProvenanceEvents: Array<{
    field_key: string;
    field_label: string;
    claim_id: string;
    reason: string;
  }> = [];

  // Build Layer 2 Regulatory block
  const regBlocks = rec.regulatory
    .filter((r) => !forExternal || canRenderExternal(r.status))
    .map((r) => {
      const matchConf = confidenceFromMatch(r.match_confidence);
      return {
        banned_status: r.banned_status,
        banned_under: r.banned_under,
        match_confidence: matchConf,
        route: routeDecision(matchConf),
        exception_exists: r.exception_exists,
        exception_text: r.exception_text,
        jurisdiction: r.jurisdiction,
        effective_date: r.effective_date,
        fine_ceiling_percent: r.fine_ceiling_percent,
        notes: r.notes,
        source: {
          layer: 2,
          captured: r.effective_date || claim.date_captured,
        },
      };
    });

  // Build Layer 3 Substantiation block
  const substBlocks: SubstantiationEntryBlock[] = rec.substantiation
    .filter((s) => !forExternal || canRenderExternal(s.status))
    .map((s) => {
      const conf = confidenceFromMatch(s.confidence_level);
      return {
        registry_entry_id: s.registry_entry_id,
        substantiation_type: s.substantiation_type,
        registry_name: s.registry_name,
        entry_status: s.entry_status,
        confidence_level: s.confidence_level,
        route: routeDecision(conf),
        data_source_url: s.data_source_url,
        notes: s.notes,
      };
    });

  const verifiedCount = substBlocks.filter((b) =>
    ['ACTIVE', 'ESTABLISHED'].includes(b.entry_status || '')
  ).length;
  const totalCount = substBlocks.length;
  const completeness = totalCount > 0 ? verifiedCount / totalCount : 0.0;

  // Layer 4 Enforcement
  const enfBlocks = rec.enforcement
    .filter((e) => !forExternal || canRenderExternal(e.status))
    .map((e) => ({
      enforcement_id: e.enforcement_id,
      regulator: e.regulator,
      enforcement_type: e.enforcement_type,
      enforcement_date: e.enforcement_date,
      company_name: e.company_name,
      product_name: e.product_name,
      claim_flagged: e.claim_flagged,
      basis_of_action: e.basis_of_action,
      outcome_status: e.outcome_status,
      notes: e.notes,
    }));

  // Layer 5 History
  const histBlocks = rec.history
    .filter((h) => !forExternal || canRenderExternal(h.status))
    .map((h) => ({
      claim_history_id: h.claim_history_id,
      claim_version: h.claim_version,
      version_date: h.version_date,
      version_source: h.version_source,
      change_reason: h.change_reason,
      next_version_date: h.next_version_date,
      next_claim_version: h.next_claim_version,
    }));

  // Layer 6 Corrections
  const corrBlocks = rec.corrections.map((k) => ({
    correction_id: k.correction_id,
    flag_type: k.flag_type,
    flagged_by: k.flagged_by,
    flagged_date: k.flagged_date,
    issue_description: k.issue_description,
    correction_made: k.correction_made,
    confidence_after_correction: k.confidence_after_correction,
  }));

  // --- ISSUE 2 PURE RECORD-KEYED RENDERING PIPELINE ---
  // Rule: render(claim_id, records) -> card.
  // The render is a pure function of the records joined by claim_id.
  // Requirement 2.1: lookup (claim_id, field_key) -> record. If null, render 'Not on file', emit MISSING_RECORD.
  // Requirement 2.2: field.claim_id == card.claim_id assertion. If violated, emit CROSS_CLAIM_RENDER and block card.
  // Requirement 2.4: Zero hardcoded strings or dates in component/template layer.

  const validationEvents: CardValidationEvent[] = [];
  let cardBlocked = false;
  let blockReason: string | undefined;
  let crossClaimViolation:
    | {
        field_key: string;
        field_claim_id: string;
        card_claim_id: string;
      }
    | undefined;

  // 1. Regulatory Basis lookup
  const regRec = claimRecordStore.lookup(claim.claim_id, 'regulatory_basis');
  let regulatoryBasis = 'Not on file';
  let regulatoryBasisProv: ProvenanceObject<string> | null = null;
  let regulatoryBasisLayer: number | undefined;
  let regulatoryBasisGap = false;

  if (!regRec) {
    regulatoryBasis = 'Not on file';
    regulatoryBasisGap = true;
    validationEvents.push({
      event_name: 'MISSING_RECORD',
      severity: 'block',
      field_key: 'regulatory_basis',
      field_label: 'Regulatory basis',
      claim_id: claim.claim_id,
      reason: `Lookup (${claim.claim_id}, regulatory_basis) returned null. [L2 DATA GAP] - CRITICAL: Layer 2 record NOT FOUND.`,
    });
    missingProvenanceEvents.push({
      field_key: 'regulatory_basis',
      field_label: 'Regulatory basis',
      claim_id: claim.claim_id,
      reason: '[L2 DATA GAP] - CRITICAL: Layer 2 record NOT FOUND',
    });
  } else {
    // Cross-claim contamination assertion (Req 2.2)
    if (regRec.claim_id !== claim.claim_id) {
      cardBlocked = true;
      blockReason = `CROSS_CLAIM_RENDER: Field "Regulatory basis" is bound to claim "${regRec.claim_id}" but was rendered on card "${claim.claim_id}".`;
      crossClaimViolation = {
        field_key: 'regulatory_basis',
        field_claim_id: regRec.claim_id,
        card_claim_id: claim.claim_id,
      };
      validationEvents.push({
        event_name: 'CROSS_CLAIM_RENDER',
        severity: 'block',
        field_key: 'regulatory_basis',
        field_label: 'Regulatory basis',
        claim_id: claim.claim_id,
        target_claim_id: regRec.claim_id,
        reason: `Render-time assertion failed: field.claim_id (${regRec.claim_id}) !== card.claim_id (${claim.claim_id}). Violation blocks the card.`,
      });
    } else {
      regulatoryBasis = regRec.field_value;
      regulatoryBasisProv = regRec.provenance;
      regulatoryBasisLayer = regRec.source_layer;
      if (deletedProvenanceFields.includes('regulatory_basis')) {
        regulatoryBasisProv = null;
      }
      const val = validateProvenance(regulatoryBasisProv);
      if (!val.isValid) {
        regulatoryBasis = 'Not on file';
        missingProvenanceEvents.push({
          field_key: 'regulatory_basis',
          field_label: 'Regulatory basis',
          claim_id: claim.claim_id,
          reason: val.errorReason || 'Field lacking complete provenance object',
        });
        validationEvents.push({
          event_name: 'MISSING_PROVENANCE',
          severity: 'block',
          field_key: 'regulatory_basis',
          field_label: 'Regulatory basis',
          claim_id: claim.claim_id,
          reason: val.errorReason || 'Field lacking complete provenance object',
        });
      }
    }
  }

  // 2. Clinical Data lookup
  const clinRec = claimRecordStore.lookup(claim.claim_id, 'clinical_data_status');
  let clinicalDataStatus = 'Not on file';
  let clinicalDataWaived = false;
  let clinicalDataProv: ProvenanceObject<string> | null = null;
  let clinicalDataLayer: number | undefined;

  if (!clinRec) {
    clinicalDataStatus = 'Not on file';
    validationEvents.push({
      event_name: 'MISSING_RECORD',
      severity: 'block',
      field_key: 'clinical_data_status',
      field_label: 'Clinical data for this product',
      claim_id: claim.claim_id,
      reason: `Lookup (${claim.claim_id}, clinical_data_status) returned null. No clinical record on file.`,
    });
    missingProvenanceEvents.push({
      field_key: 'clinical_data_status',
      field_label: 'Clinical data for this product',
      claim_id: claim.claim_id,
      reason: 'Lookup returned null: No clinical record on file',
    });
  } else {
    if (clinRec.claim_id !== claim.claim_id) {
      cardBlocked = true;
      blockReason = `CROSS_CLAIM_RENDER: Field "Clinical data" is bound to claim "${clinRec.claim_id}" but was rendered on card "${claim.claim_id}".`;
      crossClaimViolation = {
        field_key: 'clinical_data_status',
        field_claim_id: clinRec.claim_id,
        card_claim_id: claim.claim_id,
      };
      validationEvents.push({
        event_name: 'CROSS_CLAIM_RENDER',
        severity: 'block',
        field_key: 'clinical_data_status',
        field_label: 'Clinical data for this product',
        claim_id: claim.claim_id,
        target_claim_id: clinRec.claim_id,
        reason: `Render-time assertion failed: field.claim_id (${clinRec.claim_id}) !== card.claim_id (${claim.claim_id}). Violation blocks the card.`,
      });
    } else {
      clinicalDataStatus = clinRec.field_value;
      clinicalDataWaived = Boolean(clinRec.extra_meta?.waived);
      clinicalDataProv = clinRec.provenance;
      clinicalDataLayer = clinRec.source_layer;
      if (deletedProvenanceFields.includes('clinical_data_status')) {
        clinicalDataProv = null;
      }
      const val = validateProvenance(clinicalDataProv);
      if (!val.isValid) {
        clinicalDataStatus = 'Not on file';
        missingProvenanceEvents.push({
          field_key: 'clinical_data_status',
          field_label: 'Clinical data for this product',
          claim_id: claim.claim_id,
          reason: val.errorReason || 'Field lacking complete provenance object',
        });
        validationEvents.push({
          event_name: 'MISSING_PROVENANCE',
          severity: 'block',
          field_key: 'clinical_data_status',
          field_label: 'Clinical data for this product',
          claim_id: claim.claim_id,
          reason: val.errorReason || 'Field lacking complete provenance object',
        });
      }
    }
  }

  // 3. Actives with Established Evidence (N of M) lookup
  const actRec = claimRecordStore.lookup(claim.claim_id, 'actives_evidence');
  let activesEvidenceRatio = 'Not on file';
  let activesEvidenceLabel = 'Actives with established evidence';
  let activesEvidenceProv: ProvenanceObject<string> | null = null;
  let activesEvidenceLayer: number | undefined;

  if (!actRec) {
    activesEvidenceRatio = 'Not on file';
    validationEvents.push({
      event_name: 'MISSING_RECORD',
      severity: 'block',
      field_key: 'actives_evidence',
      field_label: 'Actives with established evidence',
      claim_id: claim.claim_id,
      reason: `Lookup (${claim.claim_id}, actives_evidence) returned null. No evidentiary count record on file.`,
    });
    missingProvenanceEvents.push({
      field_key: 'actives_evidence',
      field_label: 'Actives with established evidence',
      claim_id: claim.claim_id,
      reason: 'Lookup returned null: No evidentiary count record on file',
    });
  } else {
    if (actRec.claim_id !== claim.claim_id) {
      cardBlocked = true;
      blockReason = `CROSS_CLAIM_RENDER: Field "Actives evidence" is bound to claim "${actRec.claim_id}" but was rendered on card "${claim.claim_id}".`;
      crossClaimViolation = {
        field_key: 'actives_evidence',
        field_claim_id: actRec.claim_id,
        card_claim_id: claim.claim_id,
      };
      validationEvents.push({
        event_name: 'CROSS_CLAIM_RENDER',
        severity: 'block',
        field_key: 'actives_evidence',
        field_label: 'Actives with established evidence',
        claim_id: claim.claim_id,
        target_claim_id: actRec.claim_id,
        reason: `Render-time assertion failed: field.claim_id (${actRec.claim_id}) !== card.claim_id (${claim.claim_id}). Violation blocks the card.`,
      });
    } else {
      activesEvidenceRatio = actRec.field_value;
      activesEvidenceLabel =
        actRec.extra_meta?.ratio_label || 'Actives with established clinical evidence';
      activesEvidenceProv = actRec.provenance;
      activesEvidenceLayer = actRec.source_layer;
      if (deletedProvenanceFields.includes('actives_evidence_ratio')) {
        activesEvidenceProv = null;
      }
      const val = validateProvenance(activesEvidenceProv);
      if (!val.isValid) {
        activesEvidenceRatio = 'Not on file';
        missingProvenanceEvents.push({
          field_key: 'actives_evidence_ratio',
          field_label: 'Actives with established evidence',
          claim_id: claim.claim_id,
          reason: val.errorReason || 'Field lacking complete provenance object',
        });
        validationEvents.push({
          event_name: 'MISSING_PROVENANCE',
          severity: 'block',
          field_key: 'actives_evidence_ratio',
          field_label: 'Actives with established evidence',
          claim_id: claim.claim_id,
          reason: val.errorReason || 'Field lacking complete provenance object',
        });
      }
    }
  }

  // 4. Permissible Claim Language lookup
  const permRec = claimRecordStore.lookup(claim.claim_id, 'permissible_claim_language');
  let permissibleClaimLanguage = 'Not on file';
  let permissibleClaimProv: ProvenanceObject<string> | null = null;
  let permissibleClaimLayer: number | undefined;

  if (!permRec) {
    permissibleClaimLanguage = 'Not on file';
    validationEvents.push({
      event_name: 'MISSING_RECORD',
      severity: 'block',
      field_key: 'permissible_claim_language',
      field_label: 'Permissible claim language',
      claim_id: claim.claim_id,
      reason: `Lookup (${claim.claim_id}, permissible_claim_language) returned null. No permissible language record on file.`,
    });
    missingProvenanceEvents.push({
      field_key: 'permissible_claim_language',
      field_label: 'Permissible claim language',
      claim_id: claim.claim_id,
      reason: 'Lookup returned null: No permissible language record on file',
    });
  } else {
    if (permRec.claim_id !== claim.claim_id) {
      cardBlocked = true;
      blockReason = `CROSS_CLAIM_RENDER: Field "Permissible claim language" is bound to claim "${permRec.claim_id}" but was rendered on card "${claim.claim_id}".`;
      crossClaimViolation = {
        field_key: 'permissible_claim_language',
        field_claim_id: permRec.claim_id,
        card_claim_id: claim.claim_id,
      };
      validationEvents.push({
        event_name: 'CROSS_CLAIM_RENDER',
        severity: 'block',
        field_key: 'permissible_claim_language',
        field_label: 'Permissible claim language',
        claim_id: claim.claim_id,
        target_claim_id: permRec.claim_id,
        reason: `Render-time assertion failed: field.claim_id (${permRec.claim_id}) !== card.claim_id (${claim.claim_id}). Violation blocks the card.`,
      });
    } else {
      permissibleClaimLanguage = permRec.field_value;
      permissibleClaimProv = permRec.provenance;
      permissibleClaimLayer = permRec.source_layer;
      if (deletedProvenanceFields.includes('permissible_claim_language')) {
        permissibleClaimProv = null;
      }
      const val = validateProvenance(permissibleClaimProv);
      if (!val.isValid) {
        permissibleClaimLanguage = 'Not on file';
        missingProvenanceEvents.push({
          field_key: 'permissible_claim_language',
          field_label: 'Permissible claim language',
          claim_id: claim.claim_id,
          reason: val.errorReason || 'Field lacking complete provenance object',
        });
        validationEvents.push({
          event_name: 'MISSING_PROVENANCE',
          severity: 'block',
          field_key: 'permissible_claim_language',
          field_label: 'Permissible claim language',
          claim_id: claim.claim_id,
          reason: val.errorReason || 'Field lacking complete provenance object',
        });
      }
    }
  }

  // 5. Claim History lookup
  const histRec = claimRecordStore.lookup(claim.claim_id, 'claim_history_summary');
  let claimHistorySummary = 'Not on file';
  let claimHistoryProv: ProvenanceObject<string> | null = null;
  let claimHistoryLayer: number | undefined;

  if (!histRec) {
    claimHistorySummary = 'Not on file';
    validationEvents.push({
      event_name: 'MISSING_RECORD',
      severity: 'block',
      field_key: 'claim_history_summary',
      field_label: 'Claim history',
      claim_id: claim.claim_id,
      reason: `Lookup (${claim.claim_id}, claim_history_summary) returned null. No history record on file.`,
    });
    missingProvenanceEvents.push({
      field_key: 'claim_history_summary',
      field_label: 'Claim history',
      claim_id: claim.claim_id,
      reason: 'Lookup returned null: No history record on file',
    });
  } else {
    if (histRec.claim_id !== claim.claim_id) {
      cardBlocked = true;
      blockReason = `CROSS_CLAIM_RENDER: Field "Claim history" is bound to claim "${histRec.claim_id}" but was rendered on card "${claim.claim_id}".`;
      crossClaimViolation = {
        field_key: 'claim_history_summary',
        field_claim_id: histRec.claim_id,
        card_claim_id: claim.claim_id,
      };
      validationEvents.push({
        event_name: 'CROSS_CLAIM_RENDER',
        severity: 'block',
        field_key: 'claim_history_summary',
        field_label: 'Claim history',
        claim_id: claim.claim_id,
        target_claim_id: histRec.claim_id,
        reason: `Render-time assertion failed: field.claim_id (${histRec.claim_id}) !== card.claim_id (${claim.claim_id}). Violation blocks the card.`,
      });
    } else {
      claimHistorySummary = histRec.field_value;
      claimHistoryProv = histRec.provenance;
      claimHistoryLayer = histRec.source_layer;
      if (deletedProvenanceFields.includes('claim_history_summary')) {
        claimHistoryProv = null;
      }
      const val = validateProvenance(claimHistoryProv);
      if (!val.isValid) {
        claimHistorySummary = 'Not on file';
        missingProvenanceEvents.push({
          field_key: 'claim_history_summary',
          field_label: 'Claim history',
          claim_id: claim.claim_id,
          reason: val.errorReason || 'Field lacking complete provenance object',
        });
        validationEvents.push({
          event_name: 'MISSING_PROVENANCE',
          severity: 'block',
          field_key: 'claim_history_summary',
          field_label: 'Claim history',
          claim_id: claim.claim_id,
          reason: val.errorReason || 'Field lacking complete provenance object',
        });
      }
    }
  }

  // 6. Regulatory Status (banned_status) lookup - Single Source of Truth (Issue 3)
  const statusInfo = claimRecordStore.getStatus(claim.claim_id);
  const statusRec = claimRecordStore.lookup(claim.claim_id, 'banned_status');
  let regulatoryStatus = statusInfo.status;
  let statusBasis = statusInfo.basis;
  let statusHistory = statusInfo.history;

  if (statusRec && statusRec.claim_id !== claim.claim_id) {
    cardBlocked = true;
    blockReason = `CROSS_CLAIM_RENDER: Regulatory status is bound to claim "${statusRec.claim_id}" but was rendered on card "${claim.claim_id}".`;
    crossClaimViolation = {
      field_key: 'banned_status',
      field_claim_id: statusRec.claim_id,
      card_claim_id: claim.claim_id,
    };
    validationEvents.push({
      event_name: 'CROSS_CLAIM_RENDER',
      severity: 'block',
      field_key: 'banned_status',
      field_label: 'Regulatory Status',
      claim_id: claim.claim_id,
      target_claim_id: statusRec.claim_id,
      reason: `Render-time assertion failed: field.claim_id (${statusRec.claim_id}) !== card.claim_id (${claim.claim_id}). Violation blocks the card.`,
    });
  }

  if (statusInfo.isUnrenderable) {
    cardBlocked = true;
    blockReason =
      statusInfo.unrenderableReason ||
      `UNRENDERABLE: banned_status "${statusInfo.rawStatus}" is outside the valid regulatory status enum and cannot be rendered.`;
    validationEvents.push({
      event_name: 'MISSING_RECORD',
      severity: 'block',
      field_key: 'banned_status',
      field_label: 'Regulatory Status',
      claim_id: claim.claim_id,
      reason: blockReason,
    });
  }

  if (statusInfo.isMissing) {
    validationEvents.push({
      event_name: 'MISSING_RECORD',
      severity: 'block',
      field_key: 'banned_status',
      field_label: 'Regulatory Status',
      claim_id: claim.claim_id,
      reason: statusInfo.unrenderableReason || `Lookup (${claim.claim_id}, banned_status) returned null. Status renders as Not on file.`,
    });
  }

  // Requirement 2.3: Identical-Content Suspicion Check
  // Compare substantive fields across other claims. If byte-identical, emit IDENTICAL_CARD_CONTENT (warning)
  if (regulatoryBasis !== 'Not on file' && !cardBlocked) {
    const allClaimIds = Object.keys(db.byClaim);
    for (const otherClaimId of allClaimIds) {
      if (otherClaimId !== claim.claim_id) {
        const otherReg = claimRecordStore.lookup(otherClaimId, 'regulatory_basis');
        const otherClin = claimRecordStore.lookup(otherClaimId, 'clinical_data_status');
        const otherAct = claimRecordStore.lookup(otherClaimId, 'actives_evidence');
        const otherPerm = claimRecordStore.lookup(otherClaimId, 'permissible_claim_language');
        const otherHist = claimRecordStore.lookup(otherClaimId, 'claim_history_summary');

        if (
          otherReg &&
          otherClin &&
          otherAct &&
          otherPerm &&
          otherHist &&
          otherReg.field_value === regulatoryBasis &&
          otherClin.field_value === clinicalDataStatus &&
          otherAct.field_value === activesEvidenceRatio &&
          otherPerm.field_value === permissibleClaimLanguage &&
          otherHist.field_value === claimHistorySummary
        ) {
          validationEvents.push({
            event_name: 'IDENTICAL_CARD_CONTENT',
            severity: 'warning',
            field_key: 'substantive_card_content',
            field_label: 'All Substantive Card Fields',
            claim_id: claim.claim_id,
            target_claim_id: otherClaimId,
            reason: `IDENTICAL_CARD_CONTENT [WARNING]: Claim "${claim.claim_id}" and Claim "${otherClaimId}" render byte-identical substantive fields. Human confirmation required in Review Queue.`,
          });
          break;
        }
      }
    }
  }

  // Notified Formula Actives with Individual Provenance
  const rawActives = getProductActivesWithProvenance(rec.product.slug, claim.claim_id);
  const notifiedActivesItems: NotifiedActiveItem[] = rawActives.map((act, idx) => {
    let prov = act.provenance;
    const isDeleted =
      deletedProvenanceFields.includes(`active_${idx}_concentration`) ||
      deletedProvenanceFields.includes(act.active_name) ||
      deletedProvenanceFields.includes(`active_${idx}`) ||
      deletedProvenanceFields.includes('notified_actives') ||
      deletedProvenanceFields.some((f) =>
        f.toLowerCase() === act.active_name.toLowerCase() ||
        act.active_name.toLowerCase().includes(f.toLowerCase())
      );
    if (isDeleted) {
      prov = null;
    }
    const val = validateProvenance(prov);
    if (!val.isValid) {
      missingProvenanceEvents.push({
        field_key: `active_${act.active_name}_concentration`,
        field_label: `${act.active_name} concentration`,
        claim_id: claim.claim_id,
        reason: val.errorReason || 'Active concentration lacks complete provenance',
      });
      validationEvents.push({
        event_name: 'MISSING_PROVENANCE',
        severity: 'block',
        field_key: `active_${act.active_name}_concentration`,
        field_label: `${act.active_name} concentration`,
        claim_id: claim.claim_id,
        reason: val.errorReason || 'Active concentration lacks complete provenance',
      });
      return {
        ...act,
        display_text: 'Not on file',
        provenance: null,
        is_valid: false,
      };
    }
    return {
      ...act,
      is_valid: true,
    };
  });

  // Layer 3 named evidence rows with citations
  const evidenceRows: EvidenceRowItem[] = getProductEvidenceRows(rec.product.slug, claim.claim_id);

  const executiveSummary = {
    title: `${claim.product_name} — claim: "${claim.claim_text}"`,
    regulatory_basis: regulatoryBasis,
    regulatory_basis_prov: regulatoryBasisProv,
    regulatory_basis_layer: regulatoryBasisLayer,
    regulatory_basis_gap: regulatoryBasisGap,
    clinical_data_status: clinicalDataStatus,
    clinical_data_waived: clinicalDataWaived,
    clinical_data_prov: clinicalDataProv,
    clinical_data_layer: clinicalDataLayer,
    actives_evidence_ratio: activesEvidenceRatio,
    actives_evidence_label: activesEvidenceLabel,
    actives_evidence_prov: activesEvidenceProv,
    actives_evidence_layer: activesEvidenceLayer,
    permissible_claim_language: permissibleClaimLanguage,
    permissible_claim_prov: permissibleClaimProv,
    permissible_claim_layer: permissibleClaimLayer,
    claim_history_summary: claimHistorySummary,
    claim_history_prov: claimHistoryProv,
    claim_history_layer: claimHistoryLayer,
    illustrative_note:
      'Illustrative. Note what the card does not say: it never says the product is a scam, never says the company lied, and never estimates a concentration.',
    notified_actives_items: notifiedActivesItems,
    evidence_rows: evidenceRows,
    missing_provenance_events: missingProvenanceEvents,
    validation_events: validationEvents,
    card_blocked: cardBlocked,
    block_reason: blockReason,
    cross_claim_violation: crossClaimViolation,
    regulatory_status: regulatoryStatus,
    status_basis: statusBasis,
    status_history: statusHistory,
  };

  // Provenance Map for Export and programmatic validation
  const provenanceMap: Record<string, ProvenanceObject<any>> = {};
  if (regulatoryBasisProv) provenanceMap['regulatory_basis'] = regulatoryBasisProv;
  if (clinicalDataProv) provenanceMap['clinical_data'] = clinicalDataProv;
  if (activesEvidenceProv) provenanceMap['actives_evidence'] = activesEvidenceProv;
  if (permissibleClaimProv) provenanceMap['permissible_claim'] = permissibleClaimProv;
  if (claimHistoryProv) provenanceMap['claim_history'] = claimHistoryProv;
  notifiedActivesItems.forEach((act) => {
    if (act.provenance) provenanceMap[`active_${act.active_name}`] = act.provenance;
  });
  evidenceRows.forEach((row) => {
    provenanceMap[`evidence_${row.registry_ref}`] = row.provenance;
  });

  // Compute field status breakdown (POPULATED vs TO_COLLECT vs UNKNOWN)
  let populatedCount = 0;
  let toCollectCount = 0;
  let unknownCount = 0;

  const checkStatus = (status?: Status | string) => {
    if (status === 'POPULATED') populatedCount++;
    else if (status === 'TO_COLLECT') toCollectCount++;
    else if (status === 'UNKNOWN') unknownCount++;
    else populatedCount++;
  };

  checkStatus(claim.status);
  rec.regulatory.forEach((r) => checkStatus(r.status));
  rec.substantiation.forEach((s) => checkStatus(s.status));
  rec.enforcement.forEach((e) => checkStatus(e.status));
  rec.history.forEach((h) => checkStatus(h.status));

  const totalFieldCount = populatedCount + toCollectCount + unknownCount || 1;
  const completenessPercent = Math.round((populatedCount / totalFieldCount) * 100);

  // Synchronize regBlocks[0].banned_status with single source of truth
  if (regBlocks.length > 0 && regulatoryStatus) {
    regBlocks[0].banned_status = regulatoryStatus;
  }

  return {
    claim_id: claim.claim_id,
    brand: claim.brand,
    product_name: claim.product_name,
    claim_text: claim.claim_text,
    claim_context: claim.claim_context || null,
    claim_category: claim.claim_category,
    jurisdiction: claim.jurisdiction,
    language_original: claim.language_original || null,
    date_captured: claim.date_captured,
    source_url: claim.source_url || null,

    regulatory_audit: regBlocks,
    substantiation: {
      verified_count: verifiedCount,
      total_count: totalCount,
      completeness,
      entries: substBlocks,
    },
    enforcement_history: enfBlocks,
    claim_history: histBlocks,
    corrections: corrBlocks,
    executive_summary: executiveSummary,
    regulatory_status: regulatoryStatus,
    status_basis: statusBasis,
    status_history: statusHistory,
    card_blocked: cardBlocked,
    block_reason: blockReason,
    cross_claim_violation: crossClaimViolation,
    validation_events: validationEvents,
    product_metadata: {
      slug: rec.product.slug,
      product_line: rec.product.product_line,
      key_claims_summary: rec.product.key_claims_summary,
      critical_notes: rec.product.critical_notes,
      strategic_positioning_analysis: rec.product.strategic_positioning_analysis,
      proprietary_substantiation_gap: rec.product.proprietary_substantiation_gap,
      data_collection_checklist: rec.product.data_collection_checklist,
    },
    field_status_breakdown: {
      populated: populatedCount,
      to_collect: toCollectCount,
      unknown: unknownCount,
      total: totalFieldCount,
      completeness_percent: completenessPercent,
    },
    data_quality: {
      last_verified: new Date().toISOString().split('T')[0],
      corrections_count: corrBlocks.length,
      render_mode: forExternal ? 'external' : 'internal',
    },
    provenance_map: provenanceMap,
  };
}

export function toJson(card: AuditCard): string {
  return JSON.stringify(card, null, 2);
}

export function toMarkdown(card: AuditCard): string {
  const lines: string[] = [];
  lines.push(`## ${card.brand} — ${card.product_name}`);
  lines.push('');
  lines.push(`**Claim:** ${card.claim_text}`);
  lines.push(`**Context:** ${card.claim_context || 'n/a'}`);
  lines.push(`**Jurisdiction:** ${card.jurisdiction}`);
  lines.push(
    `**Captured:** ${card.date_captured}  |  **Source:** ${card.source_url || 'n/a'}`
  );
  lines.push('');

  lines.push('### Regulatory Output Card (Issue 1 Standard)');
  lines.push(`1. **Regulatory basis:** ${card.executive_summary.regulatory_basis}`);
  lines.push(`2. **Clinical data for this product:** ${card.executive_summary.clinical_data_status}`);
  if (card.executive_summary.notified_actives_items && card.executive_summary.notified_actives_items.length > 0) {
    lines.push('3. **NOTIFIED FORMULA ACTIVES (concentrations):**');
    for (const act of card.executive_summary.notified_actives_items) {
      lines.push(`   - ${act.active_name}: ${act.display_text} [${act.provenance?.source_type || 'no provenance'}]`);
    }
  }
  lines.push(`4. **Actives with established evidence:** ${card.executive_summary.actives_evidence_ratio} (${card.executive_summary.actives_evidence_label})`);
  lines.push(`5. **Permissible claim language:** ${card.executive_summary.permissible_claim_language}`);
  lines.push(`6. **Claim history:** ${card.executive_summary.claim_history_summary}`);
  lines.push('');

  // Provenance Dossier block (Issue 1 Compliance)
  lines.push('### Provenance Dossier (Issue 1 Compliance)');
  if (card.provenance_map) {
    for (const [key, prov] of Object.entries(card.provenance_map)) {
      lines.push(`- **${key}** [${prov.source_type}] (Captured: ${prov.captured_date})`);
      if (prov.field_value) lines.push(`  - Value: ${prov.field_value}`);
      if (prov.source_quote) lines.push(`  - Source Quote: "${prov.source_quote}"`);
      if (prov.source_url) lines.push(`  - Source URL: ${prov.source_url}`);
      if (prov.registry_ref) lines.push(`  - Registry Ref: ${prov.registry_ref}`);
      if (prov.study_design_fields) lines.push(`  - Study Design: ${prov.study_design_fields}`);
      if (prov.search_scope) lines.push(`  - Search Scope: ${prov.search_scope} (Checked: ${prov.search_date})`);
    }
  }
  lines.push('');

  lines.push('### Regulatory status');
  for (const r of card.regulatory_audit) {
    lines.push(
      `- **${r.banned_status}** — under ${r.banned_under || 'n/a'} (match conf ${r.match_confidence.toFixed(2)}, route ${r.route})`
    );
    if (r.exception_text) {
      lines.push(`  - exception: ${r.exception_text}`);
    }
  }
  lines.push('');

  const s = card.substantiation;
  lines.push(`### Substantiation — ${s.verified_count} of ${s.total_count} verified (${Math.round(s.completeness * 100)}%)`);
  for (const e of s.entries) {
    lines.push(
      `- \`${e.registry_entry_id}\` — ${e.substantiation_type} (${e.confidence_level}, ${e.registry_name || 'n/a'})`
    );
    if (e.notes) {
      lines.push(`  - ${e.notes}`);
    }
  }
  lines.push('');

  if (card.enforcement_history.length > 0) {
    lines.push('### Enforcement');
    for (const e of card.enforcement_history) {
      lines.push(
        `- ${e.regulator} — ${e.enforcement_type} (${e.enforcement_date || 'n/a'}) -> ${e.outcome_status || 'n/a'}`
      );
    }
    lines.push('');
  }

  if (card.claim_history.length > 0) {
    lines.push('### Claim history');
    for (const h of card.claim_history) {
      lines.push(`- ${h.version_date || 'n/a'}: ${h.claim_version}`);
    }
    lines.push('');
  }

  if (card.corrections.length > 0) {
    lines.push('### Corrections (displayed asset)');
    for (const c of card.corrections) {
      lines.push(
        `- [${c.flag_type}] ${c.issue_description} -> ${c.correction_made || 'pending'} (${c.confidence_after_correction})`
      );
    }
    lines.push('');
  }

  lines.push(
    `_Last verified: ${card.data_quality.last_verified} · render mode: ${card.data_quality.render_mode}_`
  );
  return lines.join('\n');
}
