import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSheetsSnapshot,
  CARD_SECTIONS,
  isSafeSourceUrl,
  parseCsv,
  type SheetsTables,
} from './publicSheets.ts';

const baseTables = (): SheetsTables => ({
  Products: [
    { product_id: 'p1', brand: 'Brand', product_name: 'Product', image_url: '/images/products/p1.jpg' },
    { product_id: 'p2', brand: 'Other', product_name: 'Other product', image_url: '' },
  ],
  Claims: [{ claim_id: 'c1', product_id: 'p1', claim_text: 'Claim', evidence_condition: '' }],
  Regulatory: [{ regulatory_id: 'r1', claim_id: 'c1', jurisdiction: 'EU', regulatory_status: 'PERMITTED_WITH_CRITERIA', legal_basis: 'Reg', permissible_claim_language: '' }],
  ClinicalData: [],
  Ingredients: [{ ingredient_id: 'i1', display_name: 'Ingredient' }],
  ProductIngredients: [{ product_id: 'p1', ingredient_id: 'i1', concentration: '1%', notification_status: 'UNVERIFIED', source_id: 's1' }],
  IngredientEvidence: [{ ingredient_id: 'i1', condition: 'dandruff', evidence_status: 'UNKNOWN', source_id: '' }],
  ClaimHistory: [
    { history_id: 'h2', claim_id: 'c1', version_number: '10', version_text: 'Later', version_date: '2022-07', source_id: '' },
    { history_id: 'h1', claim_id: 'c1', version_number: '2', version_text: 'Earlier', version_date: '2000-2022', source_id: '' },
  ],
  Enforcement: [],
  ClaimSources: [{ claim_id: 'c1', section: 'regulatory_basis', source_id: 's1', association_status: 'NEEDS_REVIEW' }],
  Sources: [{ source_id: 's1', title: 'Source', url: 'https://example.com/a', verification_status: 'UNVERIFIED' }],
  CardReview: [{ claim_id: 'c1', regulatory_basis: 'DRAFT', clinical_data: 'DRAFT', actives_evidence: 'DRAFT', permissible_claim_language: 'DRAFT', claim_history: 'DRAFT' }],
  Corrections: [],
  Conditions: [{ condition: 'dandruff', display_name: 'Anti-dandruff', default_for_category: 'anti_dandruff_shampoo' }],
});

test('parseCsv preserves quoted commas, newlines, escaped quotes and trailing blanks', () => {
  const rows = parseCsv('﻿id,text,blank\r\n1,"a,b\n""quoted""",\r\n');
  assert.deepEqual(rows, [{ id: '1', text: 'a,b\n"quoted"', blank: '' }]);
});

test('a valid snapshot indexes every card section source', () => {
  const snapshot = buildSheetsSnapshot(baseTables());
  assert.equal(snapshot.regulatoryByClaim.get('c1')?.length, 1);
  assert.equal(snapshot.ingredientsByProduct.get('p1')?.[0].ingredient_id, 'i1');
  assert.equal(snapshot.evidenceByIngredient.get('i1')?.length, 1);
  assert.equal(snapshot.reviewByClaim.get('c1')?.actives_evidence, 'DRAFT');
});

test('card sections are the five fixed titles in order', () => {
  assert.deepEqual(CARD_SECTIONS.map((section) => section.label), [
    'Regulatory basis',
    'Clinical data for this product',
    'Notified actives with established evidence',
    'Permissible claim language',
    'Claim history',
  ]);
});

test('claim history is sorted by numeric version_number', () => {
  const snapshot = buildSheetsSnapshot(baseTables());
  assert.deepEqual(snapshot.historyByClaim.get('c1')?.map((row) => row.history_id), ['h1', 'h2']);
});

test('rejects duplicate claim ids', () => {
  const tables = baseTables();
  tables.Claims.push({ ...tables.Claims[0] });
  assert.throws(() => buildSheetsSnapshot(tables), /duplicate Claims \(claim_id\): c1/);
});

test('rejects a claim whose product is missing', () => {
  const tables = baseTables();
  tables.Claims[0].product_id = 'missing';
  assert.throws(() => buildSheetsSnapshot(tables), /unknown product_id missing/);
});

test('rejects the same ingredient listed twice for one product', () => {
  const tables = baseTables();
  tables.ProductIngredients.push({ ...tables.ProductIngredients[0] });
  assert.throws(() => buildSheetsSnapshot(tables), /duplicate ProductIngredients \(product_id, ingredient_id\): p1 \+ i1/);
});

test('rejects an unknown ingredient or source reference', () => {
  const tables = baseTables();
  tables.ProductIngredients[0].ingredient_id = 'nope';
  assert.throws(() => buildSheetsSnapshot(tables), /unknown ingredient_id nope/);
  const other = baseTables();
  other.ClaimSources[0].source_id = 'nope';
  assert.throws(() => buildSheetsSnapshot(other), /unknown source_id nope/);
});

test('rejects the same URL stored under two source ids', () => {
  const tables = baseTables();
  tables.Sources.push({ source_id: 's2', title: 'Copy', url: 'https://example.com/a', verification_status: 'UNVERIFIED' });
  assert.throws(() => buildSheetsSnapshot(tables), /duplicate Sources\.url/);
});

test('rejects enforcement whose claim belongs to another product', () => {
  const tables = baseTables();
  tables.Enforcement.push({ enforcement_id: 'e1', product_id: 'p2', claim_id: 'c1', authority: 'X', action_date: '2018', outcome: '', source_id: '' });
  assert.throws(() => buildSheetsSnapshot(tables), /claim c1 belongs to p1, not p2/);
});

test('empty optional tabs are valid', () => {
  const tables = baseTables();
  tables.ClinicalData = [];
  tables.Corrections = [];
  assert.doesNotThrow(() => buildSheetsSnapshot(tables));
});

test('rejects an evidence condition that is not in Conditions', () => {
  const tables = baseTables();
  tables.Claims[0].evidence_condition = 'made_up';
  assert.throws(() => buildSheetsSnapshot(tables), /unknown evidence_condition made_up/);
  const other = baseTables();
  other.IngredientEvidence[0].condition = 'made_up';
  assert.throws(() => buildSheetsSnapshot(other), /unknown condition made_up/);
});

test('a category may have only one default condition', () => {
  const tables = baseTables();
  tables.Conditions.push({ condition: 'scalp_soothing', display_name: 'Scalp soothing', default_for_category: 'anti_dandruff_shampoo' });
  assert.throws(() => buildSheetsSnapshot(tables), /two default conditions/);
});

test('source links allow only http and https', () => {
  assert.equal(isSafeSourceUrl('https://example.com/a'), true);
  assert.equal(isSafeSourceUrl('http://example.com/a'), true);
  assert.equal(isSafeSourceUrl('javascript:alert(1)'), false);
  assert.equal(isSafeSourceUrl(''), false);
});
