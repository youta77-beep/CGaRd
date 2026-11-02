import test from 'node:test';
import assert from 'node:assert/strict';
import { getProductPhoto } from './productLookup.ts';
import type { ProductSummary } from './sheetCards.ts';

const product = (overrides: Partial<ProductSummary>): ProductSummary => ({
  productId: 'prd_alp_a3',
  brand: 'Alpecin (Dr. Kurt Wolff)',
  name: 'A3 Anti-Schuppen Shampoo',
  imageUrl: 'https://cdn.example.com/a3.png',
  category: '',
  countryOrigin: '',
  markets: '',
  channel: '',
  volumeMl: '250',
  positioning: '',
  riskProfile: '',
  keyFinding: '',
  actives: [{ name: 'Piroctone olamine', concentration: '' }, { name: 'Caffeine', concentration: '' }],
  claims: [],
  ...overrides,
});

const products = new Map([['prd_alp_a3', product({})]]);

test('getProductPhoto reads brand, name, volume, actives and image from the Sheets DB', () => {
  assert.deepEqual(getProductPhoto('alpecin_a3', undefined, products), {
    slug: 'alpecin_a3',
    brand: 'Alpecin (Dr. Kurt Wolff)',
    product_name: 'A3 Anti-Schuppen Shampoo',
    image_url: 'https://cdn.example.com/a3.png',
    volume: '250 ml',
    key_actives: ['Piroctone olamine', 'Caffeine'],
  });
});

test('getProductPhoto resolves a Sheets product_id or a brand name', () => {
  assert.equal(getProductPhoto('prd_alp_a3', undefined, products).product_name, 'A3 Anti-Schuppen Shampoo');
  assert.equal(getProductPhoto(undefined, 'Alpecin', products).product_name, 'A3 Anti-Schuppen Shampoo');
});

test('getProductPhoto returns empty fields until the DB has the product (no hardcoded fallback)', () => {
  const empty = getProductPhoto('alpecin_a3');
  assert.equal(empty.image_url, '');
  assert.equal(empty.product_name, '');
  assert.deepEqual(empty.key_actives, []);
  assert.equal(getProductPhoto('vichy_dercos', undefined, products).product_name, '');
});

test('getProductPhoto leaves image_url empty when the DB row has no image', () => {
  const noImage = new Map([['prd_alp_a3', product({ imageUrl: null })]]);
  assert.equal(getProductPhoto('alpecin_a3', undefined, noImage).image_url, '');
});
