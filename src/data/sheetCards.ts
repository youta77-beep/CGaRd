/**
 * Turns a validated Sheets snapshot into what the public screens render:
 * product summaries and five-section claim cards.
 *
 * Rules:
 * - Every card has the same five sections in the same order (CARD_SECTIONS).
 * - A section is "verified" only when CardReview marks it PUBLISHED and every
 *   source it cites (and every claim link) is VERIFIED.
 * - Missing data is shown as "not on file"; it never falls back to another claim.
 */
import {
  CARD_SECTIONS,
  NO_EVIDENCE_CONDITION,
  isSafeSourceUrl,
  type CardSectionKey,
  type SheetRow,
  type SheetsSnapshot,
} from './publicSheets';

export type SectionState = 'verified' | 'published_unverified' | 'draft' | 'not_on_file';

export interface SourceRef {
  sourceId: string;
  title: string;
  /** Safe http(s) URL, or null when missing or unsafe. */
  url: string | null;
  verified: boolean;
  /** Short label for the link, e.g. "Verified" or "Unverified source". */
  statusLabel: string;
  note?: string;
}

export interface RegulatoryEntry {
  jurisdiction: string;
  status: string;
  legalBasis: string;
  notes: string;
}

export interface ClinicalEntry {
  studyType: string;
  summary: string;
  status: string;
  notes: string;
}

export interface ActiveEntry {
  ingredientId: string;
  name: string;
  concentration: string;
  notificationStatus: string;
  notifiedVerified: boolean;
  /** Best evidence status on file for the claim's evidence condition, or '' when none. */
  evidence: string;
  establishedVerified: boolean;
  evidenceSummary: string;
  notes: string;
}

export interface ActivesSummary {
  listed: number;
  notifiedVerified: number;
  establishedVerified: number;
  /** "2 of 3" when assessable, "Not applicable" for a claim with no ingredient effect, otherwise "Not assessed". */
  label: string;
}

/** Which benefit section 3 counts evidence for, and where that choice came from. */
export interface EvidenceCondition {
  /** Conditions.condition, e.g. "dandruff"; '' when none could be resolved. */
  id: string;
  /** Conditions.display_name, e.g. "Anti-dandruff"; '' when unresolved. */
  label: string;
  /** "claim" = Claims.evidence_condition, "category" = product category default, "unset" = neither. */
  origin: 'claim' | 'category' | 'unset';
}

export interface HistoryVersion {
  versionNumber: string;
  text: string;
  date: string;
  reason: string;
}

export interface HistoryEvent {
  date: string;
  authority: string;
  actionType: string;
  basis: string;
  outcome: string;
}

interface SectionBase {
  key: CardSectionKey;
  label: string;
  state: SectionState;
  publication: 'DRAFT' | 'PUBLISHED';
  sources: SourceRef[];
}

export type CardSection =
  | (SectionBase & { key: 'regulatory_basis'; entries: RegulatoryEntry[] })
  | (SectionBase & { key: 'clinical_data'; entries: ClinicalEntry[] })
  | (SectionBase & { key: 'actives_evidence'; actives: ActiveEntry[]; summary: ActivesSummary; condition: EvidenceCondition })
  | (SectionBase & { key: 'permissible_claim_language'; entries: Array<{ jurisdiction: string; text: string }> })
  | (SectionBase & { key: 'claim_history'; versions: HistoryVersion[]; events: HistoryEvent[] });

export interface ClaimSummary {
  claimId: string;
  productId: string;
  text: string;
  context: string;
  category: string;
  captureDate: string;
  notes: string;
  /** Regulatory status of the first jurisdiction on file, or UNKNOWN. */
  regulatoryStatus: string;
  jurisdictions: string[];
  /** Raw Claims.evidence_condition ('' when blank; the card resolves a category default). */
  evidenceCondition: string;
}

export interface ProductSummary {
  productId: string;
  brand: string;
  name: string;
  imageUrl: string | null;
  category: string;
  countryOrigin: string;
  markets: string;
  channel: string;
  volumeMl: string;
  positioning: string;
  riskProfile: string;
  keyFinding: string;
  actives: Array<{ name: string; concentration: string }>;
  claims: ClaimSummary[];
}

export interface ClaimCard {
  claim: ClaimSummary;
  product: ProductSummary;
  sections: CardSection[];
  /** Claim-text origin links (where the claim was captured). */
  claimSources: SourceRef[];
}

export const REGULATORY_STATUSES = ['BANNED', 'RESTRICTED', 'PERMITTED', 'PERMITTED_WITH_CRITERIA', 'UNKNOWN'] as const;

const EVIDENCE_RANK: Record<string, number> = { ESTABLISHED: 4, WEAK: 3, NONE: 2, UNKNOWN: 1 };

/** Image URLs may be app-relative ("/images/...") or http(s). */
export function safeImageUrl(value: string | undefined): string | null {
  const url = (value || '').trim();
  if (!url) return null;
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  return isSafeSourceUrl(url) ? url : null;
}

export function normalizeRegulatoryStatus(value: string | undefined): string {
  const status = (value || '').trim().toUpperCase();
  return (REGULATORY_STATUSES as readonly string[]).includes(status) ? status : 'UNKNOWN';
}

function sourceRef(snapshot: SheetsSnapshot, sourceId: string, linkStatus?: string, note?: string): SourceRef | null {
  if (!sourceId) return null;
  const row = snapshot.sourcesById.get(sourceId);
  if (!row) return null;
  const sourceVerified = row.verification_status === 'VERIFIED';
  const linkVerified = linkStatus === undefined || linkStatus === 'VERIFIED';
  const verified = sourceVerified && linkVerified;
  let statusLabel = 'Verified';
  if (row.verification_status === 'BROKEN') statusLabel = 'Broken link';
  else if (!sourceVerified) statusLabel = 'Unverified source';
  else if (!linkVerified) statusLabel = 'Link needs review';
  return {
    sourceId,
    title: row.title || sourceId,
    url: isSafeSourceUrl(row.url) ? row.url : null,
    verified,
    statusLabel,
    note: note || undefined,
  };
}

function uniqueSources(refs: Array<SourceRef | null>): SourceRef[] {
  const seen = new Set<string>();
  const out: SourceRef[] = [];
  for (const ref of refs) {
    if (!ref || seen.has(ref.sourceId)) continue;
    seen.add(ref.sourceId);
    out.push(ref);
  }
  return out;
}

function sectionState(hasData: boolean, publication: 'DRAFT' | 'PUBLISHED', sources: SourceRef[]): SectionState {
  if (!hasData) return 'not_on_file';
  if (publication !== 'PUBLISHED') return 'draft';
  return sources.length > 0 && sources.every((s) => s.verified) ? 'verified' : 'published_unverified';
}

function claimLinks(snapshot: SheetsSnapshot, claimId: string, section: string): SourceRef[] {
  return uniqueSources(
    (snapshot.claimSourcesByClaim.get(claimId) || [])
      .filter((link) => link.section === section)
      .map((link) => sourceRef(snapshot, link.source_id, link.association_status, link.notes))
  );
}

function productActives(snapshot: SheetsSnapshot, productId: string): Array<{ name: string; concentration: string }> {
  return (snapshot.ingredientsByProduct.get(productId) || []).map((row) => ({
    name: snapshot.ingredientsById.get(row.ingredient_id)?.display_name || row.ingredient_id,
    concentration: row.concentration || '',
  }));
}

function claimSummary(snapshot: SheetsSnapshot, claim: SheetRow): ClaimSummary {
  const regulatory = snapshot.regulatoryByClaim.get(claim.claim_id) || [];
  return {
    claimId: claim.claim_id,
    productId: claim.product_id,
    text: claim.claim_text,
    context: claim.claim_context || '',
    category: claim.claim_category || '',
    captureDate: claim.capture_date || '',
    notes: claim.notes || '',
    regulatoryStatus: normalizeRegulatoryStatus(regulatory[0]?.regulatory_status),
    jurisdictions: regulatory.map((row) => row.jurisdiction).filter(Boolean),
    evidenceCondition: claim.evidence_condition || '',
  };
}

export function productsFromSheets(snapshot: SheetsSnapshot): ProductSummary[] {
  return snapshot.tables.Products.map((row) => ({
    productId: row.product_id,
    brand: row.brand,
    name: row.product_name,
    imageUrl: safeImageUrl(row.image_url),
    category: row.category || '',
    countryOrigin: row.country_origin || '',
    markets: row.markets || '',
    channel: row.channel || '',
    volumeMl: row.volume_ml || '',
    positioning: row.positioning || '',
    riskProfile: row.risk_profile || '',
    keyFinding: row.key_finding || '',
    actives: productActives(snapshot, row.product_id),
    claims: (snapshot.claimsByProduct.get(row.product_id) || []).map((claim) => claimSummary(snapshot, claim)),
  }));
}

/** Claims.evidence_condition wins; otherwise the default condition for the product's category. */
export function resolveEvidenceCondition(snapshot: SheetsSnapshot, claim: SheetRow, product: SheetRow): EvidenceCondition {
  const explicit = claim.evidence_condition?.trim();
  const fromCategory = snapshot.defaultConditionByCategory.get(product.category?.trim() || '');
  const id = explicit || fromCategory || '';
  if (!id) return { id: '', label: '', origin: 'unset' };
  return {
    id,
    label: snapshot.conditionsById.get(id)?.display_name || id,
    origin: explicit ? 'claim' : 'category',
  };
}

/** "Notified actives with established anti-dandruff evidence", or the generic title. */
function activesSectionLabel(condition: EvidenceCondition): string {
  if (!condition.id || condition.id === NO_EVIDENCE_CONDITION) {
    return CARD_SECTIONS.find((section) => section.key === 'actives_evidence')!.label;
  }
  return `Notified actives with established ${condition.label.toLowerCase()} evidence`;
}

function publicationOf(review: SheetRow | undefined, key: CardSectionKey): 'DRAFT' | 'PUBLISHED' {
  return review?.[key] === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
}

/** Builds the card for exactly this claim. Throws for an unknown claim id (no fallback). */
export function buildClaimCard(snapshot: SheetsSnapshot, claimId: string): ClaimCard {
  const claimRow = snapshot.claimsById.get(claimId);
  if (!claimRow) throw new Error(`Unknown claim: ${claimId}`);
  const productRow = snapshot.productsById.get(claimRow.product_id);
  if (!productRow) throw new Error(`Claim ${claimId} has no product`);

  const product = productsFromSheets({ ...snapshot, tables: { ...snapshot.tables, Products: [productRow] } })[0];
  const claim = claimSummary(snapshot, claimRow);
  const review = snapshot.reviewByClaim.get(claimId);
  const regulatory = snapshot.regulatoryByClaim.get(claimId) || [];
  const label = (key: CardSectionKey) => CARD_SECTIONS.find((section) => section.key === key)!.label;

  // 1. Regulatory basis
  const regEntries: RegulatoryEntry[] = regulatory.map((row) => ({
    jurisdiction: row.jurisdiction,
    status: normalizeRegulatoryStatus(row.regulatory_status),
    legalBasis: row.legal_basis || '',
    notes: row.notes || '',
  }));
  const regSources = claimLinks(snapshot, claimId, 'regulatory_basis');
  const regHasData = regEntries.some((entry) => entry.legalBasis || entry.status !== 'UNKNOWN');

  // 2. Clinical data for this product
  const clinicalRows = snapshot.clinicalByProduct.get(product.productId) || [];
  const clinicalEntries: ClinicalEntry[] = clinicalRows.map((row) => ({
    studyType: row.study_type || '',
    summary: row.summary || '',
    status: row.status || '',
    notes: row.notes || '',
  }));
  const clinicalSources = uniqueSources(clinicalRows.map((row) => sourceRef(snapshot, row.source_id)));

  // 3. Notified actives with established evidence for the claim's condition
  const condition = resolveEvidenceCondition(snapshot, claimRow, productRow);
  const countsEvidence = !!condition.id && condition.id !== NO_EVIDENCE_CONDITION;
  const activeRows = snapshot.ingredientsByProduct.get(product.productId) || [];
  const activeSources: Array<SourceRef | null> = [];
  const actives: ActiveEntry[] = activeRows.map((row) => {
    const notificationSource = sourceRef(snapshot, row.source_id);
    activeSources.push(notificationSource);
    const notifiedVerified = row.notification_status === 'VERIFIED' && !!notificationSource?.verified;
    const conditionRows = countsEvidence
      ? (snapshot.evidenceByIngredient.get(row.ingredient_id) || []).filter((evidence) => evidence.condition === condition.id)
      : [];
    let best = '';
    let summary = '';
    let establishedVerified = false;
    for (const evidence of conditionRows) {
      const ref = sourceRef(snapshot, evidence.source_id);
      activeSources.push(ref);
      const status = evidence.evidence_status || 'UNKNOWN';
      if (!best || (EVIDENCE_RANK[status] || 0) > (EVIDENCE_RANK[best] || 0)) {
        best = status;
        summary = evidence.summary || '';
      }
      if (status === 'ESTABLISHED' && ref?.verified) establishedVerified = true;
    }
    return {
      ingredientId: row.ingredient_id,
      name: snapshot.ingredientsById.get(row.ingredient_id)?.display_name || row.ingredient_id,
      concentration: row.concentration || '',
      notificationStatus: row.notification_status || 'UNVERIFIED',
      notifiedVerified,
      evidence: best,
      establishedVerified,
      evidenceSummary: summary,
      notes: row.notes || '',
    };
  });
  const notifiedVerified = actives.filter((active) => active.notifiedVerified);
  const establishedVerified = notifiedVerified.filter((active) => active.establishedVerified);
  let activesLabel = 'Not assessed';
  if (condition.id === NO_EVIDENCE_CONDITION) activesLabel = 'Not applicable';
  else if (countsEvidence && notifiedVerified.length > 0) activesLabel = `${establishedVerified.length} of ${notifiedVerified.length}`;
  const activesSummary: ActivesSummary = {
    listed: actives.length,
    notifiedVerified: notifiedVerified.length,
    establishedVerified: establishedVerified.length,
    label: activesLabel,
  };

  // 4. Permissible claim language
  const languageEntries = regulatory
    .filter((row) => row.permissible_claim_language)
    .map((row) => ({ jurisdiction: row.jurisdiction, text: row.permissible_claim_language }));
  const languageSources = claimLinks(snapshot, claimId, 'permissible_claim_language');

  // 5. Claim history
  const historyRows = snapshot.historyByClaim.get(claimId) || [];
  const versions: HistoryVersion[] = historyRows.map((row) => ({
    versionNumber: row.version_number,
    text: row.version_text,
    date: row.version_date || '',
    reason: row.change_reason || '',
  }));
  const eventRows = [...(snapshot.enforcementByClaim.get(claimId) || [])].sort((a, b) =>
    (a.action_date || '').localeCompare(b.action_date || '')
  );
  const events: HistoryEvent[] = eventRows.map((row) => ({
    date: row.action_date || '',
    authority: row.authority || '',
    actionType: row.action_type || '',
    basis: row.basis || '',
    outcome: row.outcome || '',
  }));
  const historySources = uniqueSources([
    ...historyRows.map((row) => sourceRef(snapshot, row.source_id)),
    ...eventRows.map((row) => sourceRef(snapshot, row.source_id)),
    ...claimLinks(snapshot, claimId, 'claim_history'),
  ]);

  const make = <K extends CardSectionKey>(key: K, hasData: boolean, sources: SourceRef[]) => {
    const publication = publicationOf(review, key);
    return { key, label: label(key), publication, sources, state: sectionState(hasData, publication, sources) };
  };

  const sections: CardSection[] = [
    { ...make('regulatory_basis', regHasData, regSources), entries: regEntries },
    { ...make('clinical_data', clinicalEntries.length > 0, clinicalSources), entries: clinicalEntries },
    {
      ...make('actives_evidence', actives.length > 0, uniqueSources(activeSources)),
      label: activesSectionLabel(condition),
      actives,
      summary: activesSummary,
      condition,
    },
    { ...make('permissible_claim_language', languageEntries.length > 0, languageSources), entries: languageEntries },
    { ...make('claim_history', versions.length + events.length > 0, historySources), versions, events },
  ];

  return { claim, product, sections, claimSources: claimLinks(snapshot, claimId, 'claim_text') };
}

/** Every source with the products and claims that cite it (for the Sources page). */
export interface SourceUsage {
  source: SourceRef;
  sourceType: string;
  claimIds: string[];
  productIds: string[];
}

export function sourcesDirectory(snapshot: SheetsSnapshot): SourceUsage[] {
  const usage = new Map<string, { claims: Set<string>; products: Set<string> }>();
  const add = (sourceId: string, claimId?: string, productId?: string) => {
    if (!sourceId) return;
    const entry = usage.get(sourceId) || { claims: new Set<string>(), products: new Set<string>() };
    if (claimId) entry.claims.add(claimId);
    if (productId) entry.products.add(productId);
    usage.set(sourceId, entry);
  };
  const productOf = (claimId: string) => snapshot.claimsById.get(claimId)?.product_id;
  for (const row of snapshot.tables.ClaimSources) add(row.source_id, row.claim_id, productOf(row.claim_id));
  for (const row of snapshot.tables.ClaimHistory) add(row.source_id, row.claim_id, productOf(row.claim_id));
  for (const row of snapshot.tables.Enforcement) add(row.source_id, row.claim_id || undefined, row.product_id);
  for (const row of snapshot.tables.ClinicalData) add(row.source_id, undefined, row.product_id);
  for (const row of snapshot.tables.ProductIngredients) add(row.source_id, undefined, row.product_id);
  for (const row of snapshot.tables.IngredientEvidence) {
    for (const pi of snapshot.tables.ProductIngredients.filter((p) => p.ingredient_id === row.ingredient_id)) {
      add(row.source_id, undefined, pi.product_id);
    }
    add(row.source_id);
  }
  return snapshot.tables.Sources.map((row) => {
    const entry = usage.get(row.source_id);
    return {
      source: sourceRef(snapshot, row.source_id)!,
      sourceType: row.source_type || '',
      claimIds: entry ? [...entry.claims] : [],
      productIds: entry ? [...entry.products] : [],
    };
  });
}
