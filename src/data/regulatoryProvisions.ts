import { RegistryProvision } from '../types/schema';

export const REGULATORY_PROVISIONS: RegistryProvision[] = [
  {
    provision_id: 'ECGT_2024_825_Annex_I_recyclable',
    text: '100% recyclable',
    source: 'EU Directive 2024/825 (Empowering Consumers for the Green Transition / ECGT), Annex I #4',
    banned: true,
    exception_criteria:
      'Third-party certification proving all packaging components are sorted and collected by municipal recycling infrastructure in >90% of targeted EU member states.',
    jurisdiction: 'EU-27',
    scope: 'Green claims & recyclability claims',
    statutory_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024L0825',
  },
  {
    provision_id: 'ECGT_2024_825_Annex_I_carbon_neutral',
    text: 'carbon neutral',
    source: 'EU Directive 2024/825 (ECGT) Annex I #4a',
    banned: true,
    exception_criteria:
      'Total prohibition on generic claims of carbon neutral/positive based on greenhouse gas compensation/offset credits.',
    jurisdiction: 'EU-27',
    scope: 'Carbon offsetting & climate claims',
    statutory_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024L0825',
  },
  {
    provision_id: 'ECGT_2024_825_Annex_I_climate_neutral',
    text: 'climate neutral product',
    source: 'EU Directive 2024/825 (ECGT) Annex I #4a',
    banned: true,
    exception_criteria:
      'Prohibited if relying on external compensation credits instead of absolute value-chain reductions.',
    jurisdiction: 'EU-27',
    scope: 'Climate & environmental claims',
    statutory_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024L0825',
  },
  {
    provision_id: 'ECGT_2024_825_Annex_I_natural_exaggeration',
    text: 'natural power / 100% natural',
    source: 'EU Directive 2024/825 (ECGT) & Reg. 655/2013 Criterion 1',
    banned: true,
    exception_criteria:
      'Must define exact ISO 16128 natural origin index; botanical actives cannot imply chemical biocide efficacy without evidence.',
    jurisdiction: 'EU-27 & UK CMA',
    scope: 'Botanical & natural ingredient claims',
    statutory_url: 'https://www.gov.uk/government/publications/green-claims-code-making-environmental-claims',
  },
  {
    provision_id: 'REG_655_2013_CRIT_3_substantiation',
    text: 'anti-dandruff / flake removal efficacy',
    source: 'Commission Regulation (EU) No 655/2013, Criterion 3 (Evidential Support)',
    banned: false,
    exception_criteria:
      'Requires either verified clinical/instrumental trial on finished cosmetic formula OR formula notification matching an approved compliance monograph.',
    jurisdiction: 'EU-27 & UK',
    scope: 'Functional cosmetic claims',
    statutory_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32013R0655',
  },
  {
    provision_id: 'REG_655_2013_CRIT_2_truthfulness',
    text: 'dermatological formula / clinically proven',
    source: 'Commission Regulation (EU) No 655/2013, Criterion 2 (Truthfulness)',
    banned: false,
    exception_criteria:
      'Evidence must substantiate that dermatologists were actively engaged or that clinical protocols adhered to GCP/ethical standards.',
    jurisdiction: 'EU-27',
    scope: 'Professional & scientific claims',
    statutory_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32013R0655',
  },
  {
    provision_id: 'REG_1223_2009_ANNEX_III_28_salicylic',
    text: 'salicylic acid anti-dandruff',
    source: 'Cosmetics Regulation (EC) No 1223/2009, Annex III entry 28',
    banned: false,
    exception_criteria:
      'Maximum permitted concentration 3.0% for rinse-off hair products (2.0% general rinse-off). Warning label required: Not to be used for children under 3 years of age.',
    jurisdiction: 'EU-27',
    scope: 'Restricted chemical substances',
    statutory_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32009R1223',
  },
  {
    provision_id: 'REG_1223_2009_ANNEX_III_27_ses2',
    text: 'selenium disulfide',
    source: 'Cosmetics Regulation (EC) No 1223/2009, Annex III entry 27',
    banned: false,
    exception_criteria:
      'Maximum permitted concentration 1.0% in anti-dandruff shampoos. Mandatory labeling: Contains selenium disulphide. Avoid contact with eyes or damaged skin.',
    jurisdiction: 'EU-27',
    scope: 'Restricted anti-dandruff actives',
    statutory_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32009R1223',
  },
  {
    provision_id: 'BIOCIDE_528_2012_ZPT_ban',
    text: 'zinc pyrithione (ZPT)',
    source: 'EU Biocidal Products Regulation (EU) No 528/2012 & Omnibus Act 2022',
    banned: true,
    exception_criteria:
      'Prohibited in EU cosmetics since March 1, 2022 (CMR 1B classification). Allowed in US (21 CFR 358.710) and non-EU jurisdictions.',
    jurisdiction: 'EU-27 (Banned) / USA (Permitted OTC)',
    scope: 'Biocides & CMR 1B ingredients',
    statutory_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32021R1902',
  },
  {
    provision_id: 'GERMAN_UWG_SEC_5_misleading',
    text: 'normalizes scalp condition / medical alleviation',
    source: 'German UWG §5 (Gesetz gegen den unlauteren Wettbewerb)',
    banned: false,
    exception_criteria:
      'Strict ban on misleading commercial practices. "Normalization" language scrutinized by BKartA/Verbraucherzentralen if implying therapeutic disease cure.',
    jurisdiction: 'Germany (DE)',
    scope: 'Deceptive advertising & border with pharmaceuticals',
    statutory_url: 'https://www.gesetze-im-internet.de/uwg_2004/__5.html',
  },
  {
    provision_id: 'FRENCH_UWG_L120_1_balancing',
    text: 'microbiome balancing / active complex',
    source: 'French Consumer Code Art. L.120-1 & DGCCRF Guidances',
    banned: false,
    exception_criteria:
      'Proprietary cosmetic complex claims must have full safety dossier and in vitro / ex vivo assay substantiation accessible upon regulator audit.',
    jurisdiction: 'France (FR)',
    scope: 'Proprietary complexes and claims',
    statutory_url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032226874/',
  },
];

export interface KeyDirectiveRecord {
  id: string;
  badge: string;
  statusDate: string;
  title: string;
  summary: string;
  fineCeiling?: string;
}

export interface LandmarkPrecedentRecord {
  id: string;
  authority: string;
  yearDate: string;
  statusBadge: string;
  target: string;
  description: string;
}

export interface JurisdictionComparisonRecord {
  id: string;
  title: string;
  description: string;
}

export const KEY_DIRECTIVE_RECORDS: KeyDirectiveRecord[] = [
  {
    id: 'dir_ecgt_2024_825',
    badge: 'Directive 2024/825 (ECGT)',
    statusDate: 'Live: 2026-09-27',
    title: 'Empowering Consumers for Green Transition',
    summary: 'Strict statutory ban on generic claims like “100% recyclable”, “carbon neutral”, or “climate positive” based on emissions offsetting.',
    fineCeiling: '10% annual turnover',
  },
  {
    id: 'reg_655_2013',
    badge: 'EU Reg. 655/2013',
    statusDate: 'Live: 2013-07-11',
    title: 'Common Criteria for Cosmetic Claims',
    summary: 'Six fundamental principles: Legal Compliance, Truthfulness, Evidential Support (Criterion 3), Honesty, Fairness, and Informed Decision-Making. Anti-dandruff claims strictly require clinical trials or monograph compliance recipe.',
  },
  {
    id: 'biocide_528_2012',
    badge: 'Biocide Reg 528/2012',
    statusDate: 'Banned: 2022-03-01',
    title: 'Zinc Pyrithione (ZPT) Ban in EU',
    summary: 'ZPT classified as CMR 1B (toxic to reproduction) and completely prohibited in cosmetic formulations within the EU. Creates the classic bifurcated status between US (FDA 21 CFR) and EU compliance recipes.',
  },
];

export const LANDMARK_PRECEDENT_RECORDS: LandmarkPrecedentRecord[] = [
  {
    id: 'prec_lg_duesseldorf_2018',
    authority: 'LG Düsseldorf / BKartA (2018)',
    yearDate: '2018',
    statusBadge: 'Settled Enforcement',
    target: 'Schwarzkopf Anti-Dandruff Efficacy Claims',
    description: 'German federal competition authority and consumer associations challenged anti-flake claims due to reliance on category active literature without double-blind finished-product trials. Led to strict substantiation orders across German pharmaceutical retail channels.',
  },
  {
    id: 'prec_cpc_sweep_2024',
    authority: 'EU CPC Network Greenwashing Sweep (2024)',
    yearDate: '2024',
    statusBadge: '42% Non-Compliance Rate',
    target: 'Cosmetics & Personal Care Sector',
    description: 'Sweep by DGCCRF, AGCM, and CMA revealed 42% of environmental claims on cosmetics were either exaggerated, misleading, or unfounded. Directly expedited the enforcement of Directive 2024/825 (ECGT).',
  },
];

export const JURISDICTION_COMPARISON_RECORDS: JurisdictionComparisonRecord[] = [
  {
    id: 'comp_de_fr',
    title: 'Germany (BKartA) vs France (DGCCRF):',
    description: 'Germany has historically enforced stricter standards on anti-dandruff and flake-removal efficacy claims under UWG §5 than France. The 2018 Schwarzkopf ruling established that category ingredient evidence does not substitute for finished-product substantiation.',
  },
  {
    id: 'comp_green_claims',
    title: 'The Green Claims Directive (ECGT 2024/825):',
    description: 'Enforcement began on September 27, 2026. Claims referencing botanical “natural power”, “100% recyclable”, or “cruelty-free” require separate third-party proof. Natural origin does not exempt formulas from efficacy standards.',
  },
];

