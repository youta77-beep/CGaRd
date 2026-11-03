import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSheetsSnapshot, CARD_SECTIONS, type SheetsTables } from './publicSheets.ts';
import { buildClaimCard, productsFromSheets, safeImageUrl, sourcesDirectory } from './sheetCards.ts';

const tables = (): SheetsTables => ({
  Products: [
    { product_id: 'p1', brand: 'Brand', product_name: 'Shampoo', image_url: '/images/products/p1.jpg', category: 'anti_dandruff_shampoo' },
    { product_id: 'p2', brand: 'Other', product_name: 'Other', image_url: 'javascript:alert(1)' },
  ],
  Claims: [
    { claim_id: 'c1', product_id: 'p1', claim_text: 'Reduces hair loss', evidence_condition: 'androgenetic_alopecia' },
    { claim_id: 'c2', product_id: 'p1', claim_text: 'Second claim', evidence_condition: '' },
    { claim_id: 'c3', product_id: 'p2', claim_text: 'Other claim' },
  ],
  Regulatory: [
    { regulatory_id: 'r1', claim_id: 'c1', jurisdiction: 'EU', regulatory_status: 'PERMITTED_WITH_CRITERIA', legal_basis: 'Reg 1223/2009', permissible_claim_language: 'Only with substantiation' },
    { regulatory_id: 'r3', claim_id: 'c3', jurisdiction: 'EU', regulatory_status: 'RESTRICTED_WITH_CRITERIA', legal_basis: 'Other basis', permissible_claim_language: '' },
  ],
  ClinicalData: [],
  Ingredients: [
    { ingredient_id: 'caffeine', display_name: 'Caffeine' },
    { ingredient_id: 'zinc', display_name: 'Zinc' },
  ],
  ProductIngredients: [
    { product_id: 'p1', ingredient_id: 'caffeine', concentration: '1%', notification_status: 'VERIFIED', source_id: 's_ok' },
    { product_id: 'p1', ingredient_id: 'zinc', concentration: '', notification_status: 'VERIFIED', source_id: 's_ok' },
  ],
  IngredientEvidence: [
    { ingredient_id: 'caffeine', condition: 'androgenetic_alopecia', evidence_status: 'ESTABLISHED', source_id: 's_ok' },
    { ingredient_id: 'zinc', condition: 'dandruff', evidence_status: 'ESTABLISHED', source_id: 's_ok' },
  ],
  ClaimHistory: [
    { history_id: 'h2', claim_id: 'c1', version_number: '2', version_text: 'New', version_date: '2022-07', source_id: '' },
    { history_id: 'h1', claim_id: 'c1', version_number: '1', version_text: 'Old', version_date: '2000-2022', source_id: '' },
  ],
  Enforcement: [],
  ClaimSources: [
    { claim_id: 'c1', section: 'regulatory_basis', source_id: 's_ok', association_status: 'NEEDS_REVIEW' },
    { claim_id: 'c1', section: 'claim_text', source_id: 's_raw', association_status: 'NEEDS_REVIEW' },
  ],
  Sources: [
    { source_id: 's_ok', title: 'Verified source', url: 'https://example.com/ok', verification_status: 'VERIFIED' },
    { source_id: 's_raw', title: 'Raw source', url: 'https://example.com/raw', verification_status: 'UNVERIFIED' },
  ],
  CardReview: [
    { claim_id: 'c1', regulatory_basis: 'PUBLISHED', clinical_data: 'DRAFT', actives_evidence: 'PUBLISHED', permissible_claim_language: 'DRAFT', claim_history: 'DRAFT' },
  ],
  Corrections: [],
  Conditions: [
    { condition: 'androgenetic_alopecia', display_name: 'Androgenetic alopecia', default_for_category: '' },
    { condition: 'dandruff', display_name: 'Anti-dandruff', default_for_category: 'anti_dandruff_shampoo' },
    { condition: 'none', display_name: 'Not an ingredient-efficacy claim', default_for_category: '' },
  ],
});

test('every card has the five fixed sections in order', () => {
  const snapshot = buildSheetsSnapshot(tables());
  for (const claimId of ['c1', 'c2', 'c3']) {
    const card = buildClaimCard(snapshot, claimId);
    assert.deepEqual(card.sections.map((s) => s.key), CARD_SECTIONS.map((s) => s.key));
  }
});

test('unknown claim throws instead of falling back to another claim', () => {
  const snapshot = buildSheetsSnapshot(tables());
  assert.throws(() => buildClaimCard(snapshot, 'missing'), /Unknown claim: missing/);
});

test('a published section with a link that needs review is not shown as verified', () => {
  const card = buildClaimCard(buildSheetsSnapshot(tables()), 'c1');
  const reg = card.sections[0];
  assert.equal(reg.publication, 'PUBLISHED');
  assert.equal(reg.state, 'published_unverified');
  assert.equal(reg.sources[0].statusLabel, 'Link needs review');
});

test('draft and empty sections are labelled as such', () => {
  const card = buildClaimCard(buildSheetsSnapshot(tables()), 'c1');
  assert.equal(card.sections[1].state, 'not_on_file'); // clinical: no rows
  assert.equal(card.sections[3].state, 'draft'); // language: data but DRAFT
  const other = buildClaimCard(buildSheetsSnapshot(tables()), 'c3');
  assert.ok(other.sections.every((s) => s.publication === 'DRAFT')); // no CardReview row
});

test('actives count uses only verified notification and evidence for the claim condition', () => {
  const card = buildClaimCard(buildSheetsSnapshot(tables()), 'c1');
  const actives = card.sections[2];
  assert.equal(actives.key, 'actives_evidence');
  if (actives.key !== 'actives_evidence') return;
  assert.equal(actives.summary.label, '1 of 2'); // zinc has dandruff evidence only
  assert.equal(actives.state, 'verified');
  assert.equal(actives.label, 'Notified actives with established androgenetic alopecia evidence');
  assert.equal(actives.condition.origin, 'claim');
});

test('a blank evidence_condition falls back to the product category default', () => {
  const actives = buildClaimCard(buildSheetsSnapshot(tables()), 'c2').sections[2];
  if (actives.key !== 'actives_evidence') throw new Error('wrong section');
  assert.deepEqual(actives.condition, { id: 'dandruff', label: 'Anti-dandruff', origin: 'category' });
  assert.equal(actives.summary.label, '1 of 2'); // zinc counts for dandruff, caffeine does not
  assert.equal(actives.label, 'Notified actives with established anti-dandruff evidence');
});

test('a claim marked "none" is not applicable and counts no evidence', () => {
  const t = tables();
  t.Claims[1].evidence_condition = 'none';
  const actives = buildClaimCard(buildSheetsSnapshot(t), 'c2').sections[2];
  if (actives.key !== 'actives_evidence') throw new Error('wrong section');
  assert.equal(actives.summary.label, 'Not applicable');
  assert.ok(actives.actives.every((a) => a.evidence === ''));
  assert.equal(actives.label, CARD_SECTIONS[2].label);
});

test('no claim condition and no category default is "Not assessed"', () => {
  const t = tables();
  t.Products[0].category = 'unmapped_category';
  const actives = buildClaimCard(buildSheetsSnapshot(t), 'c2').sections[2];
  if (actives.key !== 'actives_evidence') throw new Error('wrong section');
  assert.equal(actives.condition.origin, 'unset');
  assert.equal(actives.summary.label, 'Not assessed');
});

test('actives are "Not assessed" when no notification is verified', () => {
  const t = tables();
  t.ProductIngredients.forEach((row) => (row.notification_status = 'UNVERIFIED'));
  const actives = buildClaimCard(buildSheetsSnapshot(t), 'c1').sections[2];
  if (actives.key !== 'actives_evidence') throw new Error('wrong section');
  assert.equal(actives.summary.label, 'Not assessed');
});

test('history is ordered by version number and unknown statuses become UNKNOWN', () => {
  const snapshot = buildSheetsSnapshot(tables());
  const history = buildClaimCard(snapshot, 'c1').sections[4];
  if (history.key !== 'claim_history') throw new Error('wrong section');
  assert.deepEqual(history.versions.map((v) => v.text), ['Old', 'New']);
  assert.equal(buildClaimCard(snapshot, 'c3').claim.regulatoryStatus, 'UNKNOWN');
});

test('product images allow app paths and http(s) only', () => {
  const products = productsFromSheets(buildSheetsSnapshot(tables()));
  assert.equal(products[0].imageUrl, '/images/products/p1.jpg');
  assert.equal(products[1].imageUrl, null);
  assert.equal(safeImageUrl('//evil.example/x.jpg'), null);
});

test('sources directory lists which claims cite each source', () => {
  const dir = sourcesDirectory(buildSheetsSnapshot(tables()));
  const raw = dir.find((d) => d.source.sourceId === 's_raw')!;
  assert.deepEqual(raw.claimIds, ['c1']);
  assert.equal(raw.source.verified, false);
});
