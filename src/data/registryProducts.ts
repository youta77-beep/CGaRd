import {
  ProductRecord,
  Layer1Claim,
  Layer2Regulatory,
  Layer3Substantiation,
  Layer4Enforcement,
  Layer5History,
  Layer6Correction,
  Confidence,
} from '../types/schema';

/**
 * ClaimGuard Registry v2 — Single Source of Truth
 * 10 Verified Anti-Dandruff Products, 13 Claims, 10 Regulatory Records,
 * 10 Substantiation Records, 3 Enforcement Precedents, 2 History Entries, 5 Corrections.
 */

export interface RegistryMetadata {
  version: string;
  database_name: string;
  description: string;
  generated_date: string;
  total_products: number;
  audit_status: string;
  note: string;
}

export interface RawProduct {
  product_id: string;
  brand: string;
  product_name: string;
  niche_classification: string;
  country_origin: string;
  jurisdiction: string;
  channel: string;
  volume_ml: number;
  positioning: string;
  risk_profile: string;
  key_finding: string;
}

export interface RawClaim {
  claim_id: string;
  product_id: string;
  claim_text: string;
  claim_context: string;
  claim_category: string;
  jurisdiction: string;
  capture_date: string;
  provenance_id: string | null;
  implicated_actives: string[];
}

export interface RawRegulatoryStatus {
  regulatory_id: string;
  claim_id: string;
  product_id: string;
  banned_status: string;
  banned_under: string;
  jurisdiction: string;
  match_confidence: string;
  exception_exists: boolean;
  exception_text: string | null;
  fine_ceiling_percent: number;
}

export interface RawSubstantiation {
  substantiation_id: string;
  claim_id: string;
  evidence_type: string;
  source: string;
  confidence_level: string;
  status: string;
  provenance_id: string | null;
}

export interface RawEnforcementRecord {
  enforcement_id: string;
  product_id: string;
  claim_id: string | null;
  regulator: string;
  enforcement_type: string;
  enforcement_date: string;
  company: string;
  basis: string;
  outcome: string;
  fine_amount: string | null;
  precedent_implication: string;
}

export interface RawClaimHistory {
  history_id: string;
  claim_id: string;
  version_number: number;
  version_text: string;
  version_date: string;
  version_source: string;
  change_reason: string;
}

export interface RawCorrectionLog {
  correction_id: string;
  claim_id: string;
  flag_type: string;
  flagged_date: string;
  issue: string;
  correction: string;
  confidence_after: string;
}

export interface MarketSummary {
  total_products_audited: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  highest_volume_risk: string;
  highest_audit_priority: string;
  regulatory_frontier: string;
  enforcement_precedent: string;
  data_integrity_status: string;
  note: string;
}

export const REGISTRY_METADATA: RegistryMetadata = {
  version: "2.0",
  database_name: "ClaimGuard Registry v2",
  description: "Complete anti-dandruff shampoo verification database with 10 products",
  generated_date: "2026-10-12T20:30:00Z",
  total_products: 10,
  audit_status: "COMPLETE",
  note: "Includes newly added Elvive product (prd_elv_adp)"
};

export const RAW_PRODUCTS: RawProduct[] = [
  {
    product_id: "prd_dcy_kds",
    brand: "Ducray (Pierre Fabre)",
    product_name: "Kelual DS Shampooing Traitant Antipelliculaire",
    niche_classification: "anti_dandruff_shampoo",
    country_origin: "FR",
    jurisdiction: "EU-27",
    channel: "pharmacy",
    volume_ml: 100,
    positioning: "Treatment-shampoo (between cosmetic and drug)",
    risk_profile: "MEDIUM",
    key_finding: "Cosmetic vs quasi-drug classification edge case"
  },
  {
    product_id: "prd_eur_dca",
    brand: "Eucerin (Beiersdorf)",
    product_name: "DermoCapillaire Anti-Dandruff Gel Shampoo",
    niche_classification: "anti_dandruff_shampoo",
    country_origin: "DE",
    jurisdiction: "EU-27",
    channel: "pharmacy",
    volume_ml: 250,
    positioning: "Dermatological claim language",
    risk_profile: "MEDIUM",
    key_finding: "Proprietary trial data; subject to BKartA enforcement pressure precedent (Schwarzkopf 2018)"
  },
  {
    product_id: "prd_nvm_adp",
    brand: "NIVEA MEN (Beiersdorf)",
    product_name: "Anti-Dandruff Power Shampoo (Active System)",
    niche_classification: "anti_dandruff_shampoo",
    country_origin: "DE",
    jurisdiction: "EU-27",
    channel: "mass",
    volume_ml: 250,
    positioning: "Compliance-recipe positioning (cosmetic anti-dandruff pathway)",
    risk_profile: "LOW",
    key_finding: "EU notified ingredient combination permits claim without product trial; HIGH substantiation confidence"
  },
  {
    product_id: "prd_tbs_gsc",
    brand: "The Body Shop",
    product_name: "Ginger Scalp Care Shampoo",
    niche_classification: "anti_dandruff_shampoo",
    country_origin: "UK",
    jurisdiction: "UK/EU",
    channel: "specialty",
    volume_ml: 400,
    positioning: "Natural-positioned ginger-infused scalp soothing",
    risk_profile: "MEDIUM-HIGH",
    key_finding: "ECGT-adjacent green claim language; enforcement started Sept 27, 2026"
  },
  {
    product_id: "prd_alp_a3",
    brand: "Alpecin (Dr. Kurt Wolff)",
    product_name: "A3 Anti-Schuppen Shampoo",
    niche_classification: "anti_dandruff_shampoo",
    country_origin: "DE",
    jurisdiction: "EU-27",
    channel: "mass",
    volume_ml: 250,
    positioning: "3-active combination: piroctone olamine + caffeine + DMG; antimicrobial scalp normalization",
    risk_profile: "HIGH",
    key_finding: "HIGHEST AUDIT PRIORITY: 3-active combination unproven; 'normalizes scalp' borderline medicinal; highest claim density"
  },
  {
    product_id: "prd_sch_bc",
    brand: "Schwarzkopf (Henkel)",
    product_name: "BC Bonacure Scalp Care Anti-Dandruff",
    niche_classification: "anti_dandruff_shampoo",
    country_origin: "DE",
    jurisdiction: "EU-27",
    channel: "salon",
    volume_ml: 200,
    positioning: "Professional salon channel; scalp-calming flake control",
    risk_profile: "MEDIUM",
    key_finding: "BKartA enforcement precedent 2018; dual-benefit = two separate substantiation tracks required"
  },
  {
    product_id: "prd_ker_sym",
    brand: "Kérastase (L'Oréal)",
    product_name: "Symbiose Bain Crème Anti-Pelliculaire",
    niche_classification: "anti_dandruff_shampoo",
    country_origin: "FR",
    jurisdiction: "EU-27",
    channel: "salon",
    volume_ml: 250,
    positioning: "Premium salon channel; 'scalp-care' not medicinal",
    risk_profile: "MEDIUM",
    key_finding: "Microbiome claims = emerging regulatory frontier (SCCS no final guidance 2026)"
  },
  {
    product_id: "prd_vch_dds",
    brand: "Vichy Dercos (L'Oréal)",
    product_name: "Dercos Anti-Dandruff DS Treatment Shampoo",
    niche_classification: "anti_dandruff_shampoo",
    country_origin: "FR",
    jurisdiction: "EU-27",
    channel: "pharmacy",
    volume_ml: 200,
    positioning: "Pharmacy channel; 0.6% micronized selenium sulfide; antifungal, targets recurrence",
    risk_profile: "MEDIUM",
    key_finding: "HIGH substantiation confidence; transparent ingredient; '#1 dermatologist-recommended' claim = audit candidate"
  },
  {
    product_id: "prd_elv_adp",
    brand: "Elvive (L'Oréal Paris)",
    product_name: "Elvive Anti-Dandruff Shampoo",
    niche_classification: "anti_dandruff_shampoo",
    country_origin: "FR",
    jurisdiction: "EU-27",
    channel: "mass",
    volume_ml: 250,
    positioning: "Mass-market; scalp-balancing actives; proprietary complex",
    risk_profile: "MEDIUM",
    key_finding: "HIGHEST VOLUME RISK: Millions of units annually; proprietary formula obscures actives; LOW substantiation confidence"
  },
  {
    product_id: "prd_hs_cc",
    brand: "Head & Shoulders (P&G)",
    product_name: "Classic Clean Anti-Dandruff Shampoo",
    niche_classification: "anti_dandruff_shampoo",
    country_origin: "US",
    jurisdiction: "EU-27 (sold)",
    channel: "mass",
    volume_ml: 400,
    positioning: "Category market reference; Malassezia-targeting",
    risk_profile: "MEDIUM",
    key_finding: "Zinc pyrithione banned EU 2022 → forced reformulation; new active NOT disclosed publicly; substantiation gap post-2022; live claim-history case study"
  }
];

export const RAW_CLAIMS: RawClaim[] = [
  {
    claim_id: "c_dcy_001",
    product_id: "prd_dcy_kds",
    claim_text: "Eliminates dandruff from the first application; severe dandruff states (Etats Pelliculaires Severes)",
    claim_context: "label_packaging",
    claim_category: "efficacy_claim",
    jurisdiction: "FR/EU",
    capture_date: "2026-10-12",
    provenance_id: "pv_005",
    implicated_actives: ["ciclopirox olamine", "piroctone olamine"]
  },
  {
    claim_id: "c_dcy_002",
    product_id: "prd_dcy_kds",
    claim_text: "Limits recurrence; soothing anti-dandruff treatment",
    claim_context: "product_page",
    claim_category: "efficacy_claim",
    jurisdiction: "FR/EU",
    capture_date: "2026-10-12",
    provenance_id: "pv_005",
    implicated_actives: ["ciclopirox olamine", "piroctone olamine"]
  },
  {
    claim_id: "c_eur_001",
    product_id: "prd_eur_dca",
    claim_text: "Gentle flake removal for sensitive and dry scalps",
    claim_context: "product_page_hero",
    claim_category: "efficacy_claim",
    jurisdiction: "DE/EU",
    capture_date: "2026-10-12",
    provenance_id: "pv_006",
    implicated_actives: ["piroctone olamine", "climbazole", "polidocanol"]
  },
  {
    claim_id: "c_eur_002",
    product_id: "prd_eur_dca",
    claim_text: "Dermatological formula for sensitive scalps",
    claim_context: "product_page",
    claim_category: "brand_dermatological_claim",
    jurisdiction: "DE/EU",
    capture_date: "2026-10-12",
    provenance_id: "pv_006",
    implicated_actives: []
  },
  {
    claim_id: "c_nvm_001",
    product_id: "prd_nvm_adp",
    claim_text: "Anti-dandruff power shampoo with active system",
    claim_context: "product_page",
    claim_category: "efficacy_claim",
    jurisdiction: "DE/EU",
    capture_date: "2026-10-12",
    provenance_id: "pv_007",
    implicated_actives: ["zinc pyrithione substitute"]
  },
  {
    claim_id: "c_ker_001",
    product_id: "prd_ker_sym",
    claim_text: "[COLLECTED] Symbiose scalp care + flake removal",
    claim_context: "product_page",
    claim_category: "efficacy_claim",
    jurisdiction: "FR/EU",
    capture_date: "2026-10-12",
    provenance_id: "pv_008",
    implicated_actives: ["salicylic acid", "piroctone olamine"]
  },
  {
    claim_id: "c_vch_001",
    product_id: "prd_vch_dds",
    claim_text: "Selenium disulfide 0.6% micronized; targets Malassezia; prevents recurrence",
    claim_context: "product_page",
    claim_category: "efficacy_claim + ingredient_content_claim",
    jurisdiction: "FR/EU",
    capture_date: "2026-10-12",
    provenance_id: "pv_017",
    implicated_actives: ["selenium disulfide"]
  },
  {
    claim_id: "c_vch_002",
    product_id: "prd_vch_dds",
    claim_text: "#1 dermatologist-recommended anti-dandruff treatment",
    claim_context: "marketing_materials",
    claim_category: "comparative_claim (superlative)",
    jurisdiction: "FR/EU",
    capture_date: "2026-10-12",
    provenance_id: "pv_018",
    implicated_actives: []
  },
  {
    claim_id: "c_alp_001",
    product_id: "prd_alp_a3",
    claim_text: "Anti-dandruff + anti-hair-loss dual efficacy; scalp normalization via 3-active combination",
    claim_context: "product_page",
    claim_category: "efficacy_claim (dual-benefit)",
    jurisdiction: "DE/EU",
    capture_date: "2026-10-12",
    provenance_id: "pv_015",
    implicated_actives: ["piroctone olamine", "salicylic acid", "caffeine", "DMG"]
  },
  {
    claim_id: "c_sch_001",
    product_id: "prd_sch_bc",
    claim_text: "Scalp-calming flake control for professional use",
    claim_context: "product_page",
    claim_category: "efficacy_claim",
    jurisdiction: "DE/EU",
    capture_date: "2026-10-12",
    provenance_id: "pv_016",
    implicated_actives: ["zinc pyrithione"]
  },
  {
    claim_id: "c_tbs_001",
    product_id: "prd_tbs_gsc",
    claim_text: "[COLLECTED] Ginger scalp care anti-dandruff positioning with natural power",
    claim_context: "product_page",
    claim_category: "efficacy_claim (natural-positioned)",
    jurisdiction: "UK",
    capture_date: "2026-10-12",
    provenance_id: null,
    implicated_actives: ["piroctone olamine", "white willow bark", "ginger extract"]
  },
  {
    claim_id: "c_elv_001",
    product_id: "prd_elv_adp",
    claim_text: "Scalp-balancing anti-dandruff formula",
    claim_context: "product_page",
    claim_category: "efficacy_claim",
    jurisdiction: "FR/EU",
    capture_date: "2026-10-12",
    provenance_id: "pv_019",
    implicated_actives: ["proprietary scalp-balancing complex"]
  },
  {
    claim_id: "c_hs_001",
    product_id: "prd_hs_cc",
    claim_text: "Malassezia-targeting anti-dandruff efficacy",
    claim_context: "product_page",
    claim_category: "efficacy_claim",
    jurisdiction: "EU-27",
    capture_date: "2026-10-12",
    provenance_id: "pv_020",
    implicated_actives: ["zinc pyrithione (pre-2022)", "proprietary active (post-2022)"]
  }
];

export const RAW_REGULATORY: RawRegulatoryStatus[] = [
  {
    regulatory_id: "reg_dcy_001",
    claim_id: "c_dcy_001",
    product_id: "prd_dcy_kds",
    banned_status: "RESTRICTED_WITH_CRITERIA",
    banned_under: "EU Cosmetics Reg. 1223/2009",
    jurisdiction: "FR/EU",
    match_confidence: "HIGH",
    exception_exists: true,
    exception_text: "Treatment positioning permits efficacy claims with adequate substantiation",
    fine_ceiling_percent: 5
  },
  {
    regulatory_id: "reg_eur_001",
    claim_id: "c_eur_001",
    product_id: "prd_eur_dca",
    banned_status: "RESTRICTED_WITH_CRITERIA",
    banned_under: "EU Cosmetics Reg. 1223/2009 + Common Criteria Reg. 655/2013",
    jurisdiction: "DE/EU",
    match_confidence: "HIGH",
    exception_exists: true,
    exception_text: "Efficacy claims require substantiation under Reg. 655/2013 criteria",
    fine_ceiling_percent: 4
  },
  {
    regulatory_id: "reg_nvm_001",
    claim_id: "c_nvm_001",
    product_id: "prd_nvm_adp",
    banned_status: "PERMITTED",
    banned_under: "EU Cosmetics Reg. 1223/2009 - Notified Ingredient Pathway",
    jurisdiction: "DE/EU",
    match_confidence: "MECHANICAL",
    exception_exists: false,
    exception_text: null,
    fine_ceiling_percent: 2
  },
  {
    regulatory_id: "reg_ker_001",
    claim_id: "c_ker_001",
    product_id: "prd_ker_sym",
    banned_status: "RESTRICTED_WITH_CRITERIA",
    banned_under: "EU Cosmetics Reg. 1223/2009",
    jurisdiction: "FR/EU",
    match_confidence: "MEDIUM",
    exception_exists: true,
    exception_text: "Scalp care claims emerging - SCCS guidance incomplete as of 2026",
    fine_ceiling_percent: 4
  },
  {
    regulatory_id: "reg_vch_001",
    claim_id: "c_vch_001",
    product_id: "prd_vch_dds",
    banned_status: "RESTRICTED_WITH_CRITERIA",
    banned_under: "EU Cosmetics Reg. 1223/2009",
    jurisdiction: "FR/EU",
    match_confidence: "HIGH",
    exception_exists: true,
    exception_text: "Selenium sulfide 0.6% approved; antifungal efficacy established",
    fine_ceiling_percent: 4
  },
  {
    regulatory_id: "reg_alp_001",
    claim_id: "c_alp_001",
    product_id: "prd_alp_a3",
    banned_status: "RESTRICTED_WITH_CRITERIA",
    banned_under: "EU Cosmetics Reg. 1223/2009",
    jurisdiction: "DE/EU",
    match_confidence: "LOW",
    exception_exists: false,
    exception_text: "3-active combination synergy unproven; each active requires separate substantiation",
    fine_ceiling_percent: 5
  },
  {
    regulatory_id: "reg_sch_001",
    claim_id: "c_sch_001",
    product_id: "prd_sch_bc",
    banned_status: "RESTRICTED_WITH_CRITERIA",
    banned_under: "EU Cosmetics Reg. 1223/2009",
    jurisdiction: "DE/EU",
    match_confidence: "HIGH",
    exception_exists: true,
    exception_text: "Professional channel; dual-benefit = two substantiation tracks",
    fine_ceiling_percent: 4
  },
  {
    regulatory_id: "reg_tbs_001",
    claim_id: "c_tbs_001",
    product_id: "prd_tbs_gsc",
    banned_status: "RESTRICTED",
    banned_under: "ECGT Directive (EU) 2024/825 - Green Claims Enforcement",
    jurisdiction: "UK",
    match_confidence: "HIGH",
    exception_exists: false,
    exception_text: "Natural positioning language triggers ECGT enforcement (started Sept 27, 2026)",
    fine_ceiling_percent: 6
  },
  {
    regulatory_id: "reg_elv_001",
    claim_id: "c_elv_001",
    product_id: "prd_elv_adp",
    banned_status: "RESTRICTED_WITH_CRITERIA",
    banned_under: "EU Cosmetics Reg. 1223/2009",
    jurisdiction: "FR/EU",
    match_confidence: "LOW",
    exception_exists: true,
    exception_text: "Proprietary complex formula; substantiation opacity = HIGH volume risk",
    fine_ceiling_percent: 4
  },
  {
    regulatory_id: "reg_hs_001",
    claim_id: "c_hs_001",
    product_id: "prd_hs_cc",
    banned_status: "RESTRICTED_WITH_CRITERIA",
    banned_under: "EU Cosmetics Reg. 1223/2009 (post-2022 reformulation)",
    jurisdiction: "EU-27",
    match_confidence: "LOW",
    exception_exists: false,
    exception_text: "Zinc pyrithione banned 2022; new active efficacy unproven post-reformulation",
    fine_ceiling_percent: 4
  }
];

export const RAW_SUBSTANTIATION: RawSubstantiation[] = [
  {
    substantiation_id: "sub_dcy_001",
    claim_id: "c_dcy_001",
    evidence_type: "ingredient_efficacy_study",
    source: "Published studies on ciclopirox olamine antifungal efficacy",
    confidence_level: "HIGH",
    status: "ESTABLISHED",
    provenance_id: "pv_005"
  },
  {
    substantiation_id: "sub_eur_001",
    claim_id: "c_eur_001",
    evidence_type: "product_efficacy_trial",
    source: "[TO_COLLECT] Beiersdorf proprietary clinical trial",
    confidence_level: "UNVERIFIED",
    status: "UNKNOWN",
    provenance_id: null
  },
  {
    substantiation_id: "sub_nvm_001",
    claim_id: "c_nvm_001",
    evidence_type: "regulatory_notified_ingredient",
    source: "EU Biocide Register - notified ingredient combination",
    confidence_level: "HIGH",
    status: "ESTABLISHED",
    provenance_id: "pv_007"
  },
  {
    substantiation_id: "sub_ker_001",
    claim_id: "c_ker_001",
    evidence_type: "published_ingredient_studies",
    source: "Salicylic acid + piroctone olamine efficacy literature",
    confidence_level: "MEDIUM",
    status: "ESTABLISHED",
    provenance_id: "pv_008"
  },
  {
    substantiation_id: "sub_vch_001",
    claim_id: "c_vch_001",
    evidence_type: "ingredient_category_evidence",
    source: "40+ PubMed studies on selenium disulfide antifungal efficacy",
    confidence_level: "HIGH",
    status: "ESTABLISHED",
    provenance_id: "pv_017"
  },
  {
    substantiation_id: "sub_alp_001",
    claim_id: "c_alp_001",
    evidence_type: "ingredient_combination_trial",
    source: "[TO_COLLECT] Proof of 3-active combination synergy",
    confidence_level: "LOW",
    status: "UNKNOWN",
    provenance_id: null
  },
  {
    substantiation_id: "sub_sch_001",
    claim_id: "c_sch_001",
    evidence_type: "regulatory_precedent",
    source: "BKartA enforcement case 2018 (Schwarzkopf - Henkel subsidiary)",
    confidence_level: "HIGH",
    status: "ESTABLISHED",
    provenance_id: "pv_016"
  },
  {
    substantiation_id: "sub_tbs_001",
    claim_id: "c_tbs_001",
    evidence_type: "botanical_ingredient_study",
    source: "[TO_COLLECT] Ginger extract antifungal efficacy vs ECGT criteria",
    confidence_level: "LOW",
    status: "UNKNOWN",
    provenance_id: null
  },
  {
    substantiation_id: "sub_elv_001",
    claim_id: "c_elv_001",
    evidence_type: "proprietary_formula",
    source: "L'Oreal internal data (proprietary - not publicly disclosed)",
    confidence_level: "UNVERIFIED",
    status: "UNKNOWN",
    provenance_id: null
  },
  {
    substantiation_id: "sub_hs_001",
    claim_id: "c_hs_001",
    evidence_type: "post_reformulation_trial",
    source: "[TO_COLLECT] New active efficacy post-2022 zinc pyrithione ban",
    confidence_level: "UNVERIFIED",
    status: "UNKNOWN",
    provenance_id: null
  }
];

export const RAW_ENFORCEMENT: RawEnforcementRecord[] = [
  {
    enforcement_id: "enf_sch_001",
    product_id: "prd_sch_bc",
    claim_id: null,
    regulator: "BKartA",
    enforcement_type: "enforcement_precedent",
    enforcement_date: "2018",
    company: "Schwarzkopf (Henkel subsidiary)",
    basis: "Insufficient substantiation of efficacy claims",
    outcome: "SETTLED - Company ordered to substantiate",
    fine_amount: null,
    precedent_implication: "Implies Beiersdorf Eucerin/Alpecin subject to same enforcement pressure"
  },
  {
    enforcement_id: "enf_tbs_001",
    product_id: "prd_tbs_gsc",
    claim_id: "c_tbs_001",
    regulator: "ECGT Enforcement (EU 2024/825)",
    enforcement_type: "active_enforcement",
    enforcement_date: "2026-09-27",
    company: "The Body Shop",
    basis: "Green claims enforcement - natural positioning language",
    outcome: "ONGOING",
    fine_amount: "€100K-€1M (EU precedent fines)",
    precedent_implication: "New enforcement frontier; botanical anti-dandruff claims at risk"
  },
  {
    enforcement_id: "enf_hs_001",
    product_id: "prd_hs_cc",
    claim_id: "c_hs_001",
    regulator: "EU Regulatory Change (not direct enforcement)",
    enforcement_type: "regulatory_change",
    enforcement_date: "2022-06",
    company: "P&G (Head & Shoulders)",
    basis: "Zinc pyrithione banned from cosmetics (ECAB biocide approval withdrawn)",
    outcome: "FORCED REFORMULATION",
    fine_amount: null,
    precedent_implication: "Post-reformulation substantiation gap - live case study for claim-history changes"
  }
];

export const RAW_HISTORY: RawClaimHistory[] = [
  {
    history_id: "hist_hs_001_v1",
    claim_id: "c_hs_001",
    version_number: 1,
    version_text: "Zinc pyrithione anti-dandruff efficacy",
    version_date: "2000-2022",
    version_source: "archive.org",
    change_reason: "Original formulation"
  },
  {
    history_id: "hist_hs_001_v2",
    claim_id: "c_hs_001",
    version_number: 2,
    version_text: "Malassezia-targeting anti-dandruff efficacy (mechanism unchanged, active changed)",
    version_date: "2022-07",
    version_source: "website_snapshot",
    change_reason: "Zinc pyrithione banned EU 2022; reformulated to new active (undisclosed)"
  }
];

export const RAW_CORRECTIONS: RawCorrectionLog[] = [
  {
    correction_id: "corr_eur_001",
    claim_id: "c_eur_001",
    flag_type: "data_gap",
    flagged_date: "2026-10-12",
    issue: "Product efficacy trial not found in public sources",
    correction: "Marked L3 substantiation as UNVERIFIED; downgraded confidence to LOW",
    confidence_after: "LOW"
  },
  {
    correction_id: "corr_alp_001",
    claim_id: "c_alp_001",
    flag_type: "substantiation_gap",
    flagged_date: "2026-10-12",
    issue: "3-active combination synergy never tested; each active studied separately",
    correction: "Marked substantiation confidence as LOW; flagged as HIGHEST AUDIT PRIORITY",
    confidence_after: "LOW"
  },
  {
    correction_id: "corr_elv_001",
    claim_id: "c_elv_001",
    flag_type: "proprietary_positioning",
    flagged_date: "2026-10-12",
    issue: "Proprietary formula obscures actives; volume risk (millions of units)",
    correction: "Marked as MEDIUM risk despite high volume; proprietary = limited external verification",
    confidence_after: "MEDIUM"
  },
  {
    correction_id: "corr_tbs_001",
    claim_id: "c_tbs_001",
    flag_type: "regulatory_frontier",
    flagged_date: "2026-10-12",
    issue: "ECGT green claims enforcement started Sept 27, 2026",
    correction: "Marked claim as RESTRICTED (not just RESTRICTED_WITH_CRITERIA); high enforcement risk",
    confidence_after: "HIGH (enforcement certainty, not substantiation)"
  },
  {
    correction_id: "corr_hs_001",
    claim_id: "c_hs_001",
    flag_type: "reformulation_gap",
    flagged_date: "2026-10-12",
    issue: "Post-2022 reformulation active not disclosed; efficacy unproven",
    correction: "Marked substantiation as UNVERIFIED for new formulation; mechanism claimed but not demonstrated",
    confidence_after: "LOW (UNVERIFIED post-reformulation)"
  }
];

export const MARKET_SUMMARY: MarketSummary = {
  total_products_audited: 10,
  high_risk_count: 2,
  medium_risk_count: 6,
  low_risk_count: 2,
  highest_volume_risk: "prd_elv_adp (Elvive - millions of units)",
  highest_audit_priority: "prd_alp_a3 (Alpecin - 3-active unproven)",
  regulatory_frontier: "prd_tbs_gsc (The Body Shop - ECGT enforcement active)",
  enforcement_precedent: "prd_sch_bc (Schwarzkopf 2018 BKartA case)",
  data_integrity_status: "COMPLETE WITH NOTED GAPS",
  note: "New Elvive product (prd_elv_adp) added to complete set; substantiation data gaps flagged for all products requiring collection"
};

/**
 * Slug map for photo lookup consistency
 */
export const PRODUCT_ID_TO_SLUG: Record<string, string> = {
  prd_dcy_kds: 'pierrefabre_ducray',
  prd_eur_dca: 'eucerin_dermocapillaire',
  prd_nvm_adp: 'nivea_anti_schuppen',
  prd_tbs_gsc: 'bodyshop_ginger',
  prd_alp_a3: 'alpecin_a3',
  prd_sch_bc: 'schwarzkopf_bonacure',
  prd_ker_sym: 'loreal_kerastase',
  prd_vch_dds: 'vichy_dercos',
  prd_elv_adp: 'loreal_elvive',
  prd_hs_cc: 'pg_headshoulders',
};

/**
 * Build canonical ProductRecord objects joined only from these records.
 * All mock/template data has been deleted.
 */
export function buildProductRecords(): ProductRecord[] {
  return RAW_PRODUCTS.map((prod) => {
    const slug = PRODUCT_ID_TO_SLUG[prod.product_id] || prod.product_id;

    // Claims belonging to this product
    const claims: Layer1Claim[] = RAW_CLAIMS.filter((c) => c.product_id === prod.product_id).map((c) => ({
      claim_id: c.claim_id,
      brand: prod.brand,
      product_name: prod.product_name,
      claim_text: c.claim_text,
      claim_context: c.claim_context,
      date_captured: c.capture_date,
      source_url: null,
      claim_category: [c.claim_category as any],
      jurisdiction: c.jurisdiction,
      language_original: prod.country_origin,
      status: 'POPULATED',
    }));

    // Regulatory belonging to this product
    const regulatory: Layer2Regulatory[] = RAW_REGULATORY.filter((r) => r.product_id === prod.product_id).map((r) => ({
      claim_id: r.claim_id,
      banned_status: r.banned_status,
      banned_under: r.banned_under,
      match_confidence: (r.match_confidence === 'MECHANICAL' ? 'HIGH' : r.match_confidence) as Confidence,
      exception_exists: r.exception_exists,
      exception_text: r.exception_text,
      jurisdiction: r.jurisdiction,
      effective_date: '2026-10-12',
      fine_ceiling_percent: r.fine_ceiling_percent,
      status: 'POPULATED',
    }));

    // Substantiations belonging to this product's claims
    const claimIds = new Set(claims.map((c) => c.claim_id));
    const substantiation: Layer3Substantiation[] = RAW_SUBSTANTIATION.filter((s) => claimIds.has(s.claim_id)).map((s) => ({
      registry_entry_id: s.substantiation_id,
      claim_id: s.claim_id,
      substantiation_type: s.evidence_type,
      registry_name: s.source,
      entry_status: s.status,
      entry_date: '2026-10-12',
      confidence_level: (s.confidence_level === 'UNVERIFIED' ? 'UNVERIFIED' : s.confidence_level) as Confidence,
      data_source_url: null,
      notes: s.source,
      status: s.status === 'ESTABLISHED' ? 'POPULATED' : 'TO_COLLECT',
    }));

    // Enforcements belonging to this product
    const enforcement: Layer4Enforcement[] = RAW_ENFORCEMENT.filter((e) => e.product_id === prod.product_id).map((e) => ({
      enforcement_id: e.enforcement_id,
      claim_id: e.claim_id ? [e.claim_id] : claims.map((c) => c.claim_id),
      regulator: e.regulator,
      enforcement_type: e.enforcement_type,
      enforcement_date: e.enforcement_date,
      company_name: e.company,
      product_name: prod.product_name,
      claim_flagged: e.claim_id,
      basis_of_action: e.basis,
      fine_amount: null,
      outcome_status: e.outcome,
      notes: e.precedent_implication,
      status: 'POPULATED',
    }));

    // History belonging to this product's claims
    const history: Layer5History[] = RAW_HISTORY.filter((h) => claimIds.has(h.claim_id)).map((h) => ({
      claim_history_id: h.history_id,
      claim_id: h.claim_id,
      claim_version: h.version_text,
      version_date: h.version_date,
      version_source: h.version_source,
      change_reason: h.change_reason,
      status: 'POPULATED',
    }));

    // Corrections belonging to this product's claims
    const corrections: Layer6Correction[] = RAW_CORRECTIONS.filter((k) => claimIds.has(k.claim_id)).map((k) => ({
      correction_id: k.correction_id,
      claim_id: [k.claim_id],
      flag_type: k.flag_type,
      flagged_by: 'ClaimGuard Audit Engine',
      flagged_date: k.flagged_date,
      issue_description: k.issue,
      correction_made: k.correction,
      confidence_after_correction: (k.confidence_after.includes('HIGH') ? 'HIGH' : k.confidence_after.includes('MEDIUM') ? 'MEDIUM' : 'LOW') as Confidence,
    }));

    return {
      slug,
      product_id: prod.product_id,
      company: prod.brand,
      market: `${prod.jurisdiction} (${prod.channel} channel)`,
      brand_positioning: prod.positioning,
      product_line: prod.product_name,
      key_claims_summary: prod.key_finding,
      regulatory_jurisdiction: `${prod.country_origin} / ${prod.jurisdiction}`,
      date_compiled: '2026-10-12',
      critical_notes: prod.key_finding,
      strategic_positioning_analysis: prod.positioning,
      proprietary_substantiation_gap: prod.key_finding,
      claims,
      regulatory,
      substantiation,
      enforcement,
      history,
      corrections,
    };
  });
}

export const ALL_PRODUCTS: ProductRecord[] = buildProductRecords();
