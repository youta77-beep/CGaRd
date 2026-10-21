import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSheetsSnapshot,
  isSafeSourceUrl,
  parseCsv,
  type SheetsTables,
} from './publicSheets.ts';

const baseTables = (): SheetsTables => ({
  Products: [{ product_id: 'p1', brand: 'Brand', product_name: 'Product', jurisdiction: 'EU' }],
  Claims: [{ claim_id: 'c1', product_id: 'p1', claim_text: 'Claim', jurisdiction: 'EU' }],
  CardSections: [
    { section_id: 's1', claim_id: 'c1', section_key: 'regulatory_basis', section_label: 'Regulatory basis', display_order: '1', display_text: 'Draft text', data_status: 'IMPORTED_UNVERIFIED', publication_status: 'DRAFT' },
  ],
  ActiveEvidence: [], ClaimHistory: [], Sources: [], Regulatory: [], Substantiation: [], Enforcement: [], Corrections: [], ClaimSources: [],
});

test('parseCsv preserves quoted commas, newlines, escaped quotes and trailing blanks', () => {
  const rows = parseCsv('\uFEFFid,text,blank\r\n1,"a,b\n""quoted""",\r\n');
  assert.deepEqual(rows, [{ id: '1', text: 'a,b\n"quoted"', blank: '' }]);
});

test('buildSheetsSnapshot rejects duplicate claim ids', () => {
  const tables = baseTables();
  tables.Claims.push({ ...tables.Claims[0] });
  assert.throws(() => buildSheetsSnapshot(tables), /duplicate Claims\.claim_id: c1/);
});

test('buildSheetsSnapshot rejects a claim whose product is missing', () => {
  const tables = baseTables();
  tables.Claims[0].product_id = 'missing';
  assert.throws(() => buildSheetsSnapshot(tables), /unknown product_id missing/);
});

test('source links allow only http and https', () => {
  assert.equal(isSafeSourceUrl('https://example.com/a'), true);
  assert.equal(isSafeSourceUrl('http://example.com/a'), true);
  assert.equal(isSafeSourceUrl('javascript:alert(1)'), false);
  assert.equal(isSafeSourceUrl(''), false);
});
