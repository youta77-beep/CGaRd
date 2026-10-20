export type Status = 'POPULATED' | 'TO_COLLECT' | 'UNKNOWN' | 'N/A';

export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED' | 'CRITICAL';

export type ClaimCategory =
  | 'carbon_claim'
  | 'recyclability_claim'
  | 'renewable_claim'
  | 'natural_claim'
  | 'certified_claim'
  | 'offset_claim'
  | 'efficacy_claim'
  | 'mechanism_claim'
  | 'ingredient_benefit_claim'
  | 'superlative_claim'
  | 'wellness_claim'
  | 'targeting_claim'
  | 'brand_dermatological_claim'
  | 'safety_positioning_claim'
  | 'other';

export interface Layer1Claim {
  claim_id: string;
  brand: string;
  product_name: string;
  niche_classification?: string | null;
  active_ingredient?: string | null;
  claim_text: string;
  claim_context?: string | null;
  date_captured: string;
  source_url?: string | null;
  image_reference?: string | null;
  claim_category: ClaimCategory[];
  jurisdiction: string;
  language_original?: string | null;
  status: Status;
  notes?: string | null;
}

export interface Layer2Regulatory {
  claim_id: string;
  banned_status: string;
  banned_under?: string | null;
  match_confidence: Confidence;
  exception_exists?: boolean | null;
  exception_text?: string | null;
  jurisdiction: string;
  effective_date?: string | null;
  fine_ceiling_percent?: number | null;
  related_regulations?: string | null;
  notes?: string | null;
  status: Status;
}

export interface Layer3Substantiation {
  registry_entry_id: string;
  claim_id: string;
  substantiation_type: string;
  registry_name?: string | null;
  entry_status?: string | null; // ACTIVE, ESTABLISHED, REVOKED_2022, UNKNOWN, WAIVED, etc.
  entry_date?: string | null;
  expiration_date?: string | null;
  confidence_level: Confidence;
  data_source_url?: string | null;
  notes?: string | null;
  status: Status;
}

export interface Layer4Enforcement {
  enforcement_id: string;
  claim_id: string[];
  regulator: string;
  enforcement_type: string;
  enforcement_date?: string | null;
  company_name?: string | null;
  product_name?: string | null;
  claim_flagged?: string | null;
  basis_of_action?: string | null;
  fine_amount?: number | null;
  enforcement_reference?: string | null;
  outcome_status?: string | null;
  notes?: string | null;
  status: Status;
}

export interface Layer5History {
  claim_history_id: string;
  claim_id: string;
  claim_version: string;
  version_date?: string | null;
  version_source?: string | null;
  change_reason?: string | null;
  next_version_date?: string | null;
  next_claim_version?: string | null;
  notes?: string | null;
  status: Status;
}

export interface Layer6Correction {
  correction_id: string;
  claim_id: string[];
  flag_type: string;
  flagged_by: string;
  flagged_date: string;
  issue_description: string;
  correction_made?: string | null;
  correction_date?: string | null;
  confidence_after_correction: Confidence;
  notes?: string | null;
}

export interface ProductRecord {
  slug: string;
  company: string;
  market: string;
  brand_positioning?: string | null;
  product_line?: string | null;
  key_claims_summary?: string | null;
  regulatory_jurisdiction: string;
  date_compiled: string;
  critical_notes?: string | null;
  strategic_positioning_analysis?: string | null;
  proprietary_substantiation_gap?: string | null;
  data_collection_checklist?: string[];
  claims: Layer1Claim[];
  regulatory: Layer2Regulatory[];
  substantiation: Layer3Substantiation[];
  enforcement: Layer4Enforcement[];
  history: Layer5History[];
  corrections: Layer6Correction[];
}

export type RoutingDecision = 'AUTO_PASS' | 'RENDER_WITH_CAVEAT' | 'HUMAN_REVIEW';

export interface RegulatoryAuditBlock {
  banned_status: string;
  banned_under?: string | null;
  match_confidence: number;
  route: RoutingDecision;
  exception_exists?: boolean | null;
  exception_text?: string | null;
  jurisdiction: string;
  effective_date?: string | null;
  fine_ceiling_percent?: number | null;
  notes?: string | null;
  source: {
    layer: number;
    captured: string;
  };
}

export interface SubstantiationEntryBlock {
  registry_entry_id: string;
  substantiation_type: string;
  registry_name?: string | null;
  entry_status?: string | null;
  confidence_level: Confidence;
  route: RoutingDecision;
  data_source_url?: string | null;
  notes?: string | null;
}

export interface AuditCard {
  claim_id: string;
  brand: string;
  product_name: string;
  claim_text: string;
  claim_context?: string | null;
  claim_category: ClaimCategory[];
  jurisdiction: string;
  language_original?: string | null;
  date_captured: string;
  source_url?: string | null;

  regulatory_audit: RegulatoryAuditBlock[];
  substantiation: {
    verified_count: number;
    total_count: number;
    completeness: number;
    entries: SubstantiationEntryBlock[];
  };
  enforcement_history: Array<{
    enforcement_id: string;
    regulator: string;
    enforcement_type: string;
    enforcement_date?: string | null;
    company_name?: string | null;
    product_name?: string | null;
    claim_flagged?: string | null;
    basis_of_action?: string | null;
    outcome_status?: string | null;
    notes?: string | null;
  }>;
  claim_history: Array<{
    claim_history_id: string;
    claim_version: string;
    version_date?: string | null;
    version_source?: string | null;
    change_reason?: string | null;
    next_version_date?: string | null;
    next_claim_version?: string | null;
  }>;
  corrections: Array<{
    correction_id: string;
    flag_type: string;
    flagged_by: string;
    flagged_date: string;
    issue_description: string;
    correction_made?: string | null;
    confidence_after_correction: Confidence;
  }>;
  executive_summary: {
    title: string;
    regulatory_basis: string;
    regulatory_basis_prov?: ProvenanceObject<string> | null;
    regulatory_basis_layer?: number;
    regulatory_basis_gap?: boolean;
    clinical_data_status: string;
    clinical_data_waived: boolean;
    clinical_data_prov?: ProvenanceObject<string> | null;
    clinical_data_layer?: number;
    actives_evidence_ratio: string;
    actives_evidence_label: string;
    actives_evidence_prov?: ProvenanceObject<string> | null;
    actives_evidence_layer?: number;
    permissible_claim_language: string;
    permissible_claim_prov?: ProvenanceObject<string> | null;
    permissible_claim_layer?: number;
    claim_history_summary: string;
    claim_history_prov?: ProvenanceObject<string> | null;
    claim_history_layer?: number;
    illustrative_note: string;
    notified_actives_items?: NotifiedActiveItem[];
    evidence_rows?: EvidenceRowItem[];
    missing_provenance_events?: Array<{
      field_key: string;
      field_label: string;
      claim_id: string;
      reason: string;
    }>;
    validation_events?: CardValidationEvent[];
    regulatory_status?: RegulatoryStatus;
    status_basis?: RegulatoryStatusBasis | null;
    status_history?: StatusHistoryEntry[];
    card_blocked?: boolean;
    block_reason?: string;
    cross_claim_violation?: {
      field_key: string;
      field_claim_id: string;
      card_claim_id: string;
    };
  };
  regulatory_status?: RegulatoryStatus;
  status_basis?: RegulatoryStatusBasis | null;
  status_history?: StatusHistoryEntry[];
  card_blocked?: boolean;
  block_reason?: string;
  cross_claim_violation?: {
    field_key: string;
    field_claim_id: string;
    card_claim_id: string;
  };
  validation_events?: CardValidationEvent[];
  product_metadata?: {
    slug?: string;
    product_line?: string | null;
    key_claims_summary?: string | null;
    critical_notes?: string | null;
    strategic_positioning_analysis?: string | null;
    proprietary_substantiation_gap?: string | null;
    data_collection_checklist?: string[];
  };
  field_status_breakdown: {
    populated: number;
    to_collect: number;
    unknown: number;
    total: number;
    completeness_percent: number;
  };
  data_quality: {
    last_verified: string;
    corrections_count: number;
    render_mode: 'external' | 'internal';
  };
  provenance_map?: Record<string, ProvenanceObject<any>>;
}

export type ProvenanceSourceType =
  | 'public_registry'
  | 'brand_stated'
  | 'curated_evidence_table'
  | 'company_filed_study'
  | 'search_negative'
  | 'unavailable';

export interface StudyDesignFields {
  study_type?: string;
  sample_size?: number;
  duration?: string;
  blinding?: string;
  endpoints?: string;
}

export interface ProvenanceObject<T = any> {
  field_value: T;
  source_type: ProvenanceSourceType;
  captured_date: string;
  source_url?: string;
  source_quote?: string;
  registry_ref?: string;
  study_design_fields?: StudyDesignFields | string;
  search_scope?: string;
  search_date?: string;
}

export interface NotifiedActiveItem {
  active_name: string;
  concentration?: string | null;
  inci_position?: number | null;
  display_text: string;
  provenance?: ProvenanceObject<string> | null;
  is_valid: boolean;
}

export type EvidenceTableStatus =
  | 'ESTABLISHED'
  | 'WEAK'
  | 'NONE'
  | 'SUBMITTED_UNVERIFIED'
  | 'UNKNOWN'
  | 'WAIVED'
  | 'INSUFFICIENT'
  | 'NEGATIVE';

export type EvidenceScope = 'CATEGORY_LEVEL' | 'PRODUCT_LEVEL';

export interface ImplicatedActive {
  active_name: string;
  role: 'primary' | 'mechanism' | 'supporting';
  table_entry_id?: string;
  [key: string]: any;
}

export interface CuratedEvidenceEntry {
  entry_id: string;
  ingredient: string;
  condition_or_function: string;
  status: EvidenceTableStatus;
  scope_default?: EvidenceScope;
  scope?: EvidenceScope;
  citations: any[];
  curator: string;
  last_reviewed: string;
  review_interval_months?: number;
  notes?: string;
  history?: Array<{
    date: string;
    curator: string;
    change_note?: string;
    reason?: string;
    status?: EvidenceTableStatus;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export interface LiveEvidenceCountQuery {
  claim_id?: string;
  total_implicated: number;
  established_count: number;
  unresolved_count?: number;
  unknown_count?: number;
  ratio_string: string;
  display_count_line?: string;
  unresolved_denominator_note?: string;
  plain_language_summary: string;
  rows: EvidenceRowItem[];
  events?: CardValidationEvent[];
  [key: string]: any;
}

export interface EvidenceRowItem {
  active_name: string;
  evidence_status: EvidenceTableStatus;
  registry_ref: string;
  citation: string;
  citation_url?: string;
  notes?: string;
  provenance: ProvenanceObject<string>;
  evidence_scope?: EvidenceScope | string;
  role?: string;
  entry_id?: string;
  curator?: string;
  last_reviewed?: string;
  is_product_level?: boolean;
  is_unknown?: boolean;
  [key: string]: any;
}

export type ReviewQueueEventName =
  | 'MISSING_PROVENANCE'
  | 'MISSING_RECORD'
  | 'CROSS_CLAIM_RENDER'
  | 'IDENTICAL_CARD_CONTENT'
  | 'COUNT_DENOMINATOR_UNRESOLVED'
  | 'EVIDENCE_TABLE_STALE';

export type EventSeverity = 'block' | 'warning';

export interface CardValidationEvent {
  event_name: ReviewQueueEventName;
  severity: EventSeverity;
  field_key: string;
  field_label: string;
  claim_id: string;
  target_claim_id?: string;
  reason: string;
}

export interface ReviewQueueItem {
  id: string;
  stage: 'extraction' | 'classification' | 'matching' | 'substantiation' | 'provenance' | 'template_failure';
  event_name?: ReviewQueueEventName;
  severity?: EventSeverity;
  claim_text: string;
  reason: string;
  confidence: number;
  payload: any;
  created_at: string;
  resolved_at?: string | null;
  resolution?: string | null;
}

export interface RegistryProvision {
  provision_id: string;
  text: string;
  source: string;
  banned: boolean;
  exception_criteria?: string | null;
  jurisdiction: string;
  scope: string;
  statutory_url?: string;
}

export type RegulatoryStatus =
  | 'BANNED'
  | 'RESTRICTED'
  | 'RESTRICTED_WITH_CRITERIA'
  | 'PERMITTED'
  | 'PERMITTED_WITH_CRITERIA'
  | 'UNKNOWN';

export const VALID_REGULATORY_STATUSES: readonly RegulatoryStatus[] = [
  'BANNED' as const,
  'RESTRICTED' as const,
  'RESTRICTED_WITH_CRITERIA' as const,
  'PERMITTED' as const,
  'PERMITTED_WITH_CRITERIA' as const,
  'UNKNOWN' as const,
] as const;

export function isValidRegulatoryStatus(val: string): val is RegulatoryStatus {
  return (VALID_REGULATORY_STATUSES as readonly string[]).includes(val);
}

export interface RegulatoryStatusBasis {
  matched_provision_ref: string;
  match_confidence: number;
  reviewer?: string;
  source_quote?: string;
  exception_text?: string;
  criteria_ref?: string;
  evidence_satisfaction_note?: string;
}

export interface StatusHistoryEntry {
  status: RegulatoryStatus;
  set_by: string;
  date: string;
  basis_ref: string;
}

export type ClaimFieldKey =
  | 'regulatory_basis'
  | 'clinical_data_status'
  | 'actives_evidence'
  | 'permissible_claim_language'
  | 'claim_history_summary'
  | 'banned_status';

export interface ClaimFieldRecord<T = string> {
  claim_id: string;
  field_key: ClaimFieldKey | string;
  field_label: string;
  field_value: T;
  source_layer: number;
  provenance: ProvenanceObject<T> | null;
  extra_meta?: {
    waived?: boolean;
    ratio?: string;
    ratio_label?: string;
    study_design?: StudyDesignFields | string;
    search_scope?: string;
    search_date?: string;
    is_data_gap?: boolean;
    [key: string]: any;
  };
}

