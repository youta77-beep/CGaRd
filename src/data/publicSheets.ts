export const DEFAULT_SPREADSHEET_ID =
  import.meta.env?.VITE_CGARD_SPREADSHEET_ID || '1QKGBJxDB_GngxSDz7-VjxHwX3Cf0W47khLTrsWepFow';

/** Fixed card display: every claim card shows these five sections in this order. */
export const CARD_SECTIONS = [
  { key: 'regulatory_basis', label: 'Regulatory basis' },
  { key: 'clinical_data', label: 'Clinical data for this product' },
  { key: 'actives_evidence', label: 'Notified actives with established evidence' },
  { key: 'permissible_claim_language', label: 'Permissible claim language' },
  { key: 'claim_history', label: 'Claim history' },
] as const;

export type CardSectionKey = (typeof CARD_SECTIONS)[number]['key'];

/**
 * Section 3 counts ingredient evidence for one condition per claim.
 * The condition comes from Claims.evidence_condition, or else from the
 * Conditions row whose default_for_category matches the product's category.
 * NO_EVIDENCE_CONDITION marks a claim that is not about an ingredient effect.
 */
export const NO_EVIDENCE_CONDITION = 'none';

export const SHEET_NAMES = [
  'Products', 'Claims', 'Regulatory', 'ClinicalData', 'Ingredients', 'ProductIngredients',
  'IngredientEvidence', 'ClaimHistory', 'Enforcement', 'ClaimSources', 'Sources', 'CardReview', 'Corrections',
  'Conditions',
] as const;

export type SheetName = (typeof SHEET_NAMES)[number];
export type SheetRow = Record<string, string>;
export type SheetsTables = Record<SheetName, SheetRow[]>;

export interface SheetsSnapshot {
  tables: SheetsTables;
  productsById: Map<string, SheetRow>;
  claimsById: Map<string, SheetRow>;
  sourcesById: Map<string, SheetRow>;
  ingredientsById: Map<string, SheetRow>;
  conditionsById: Map<string, SheetRow>;
  /** Product category -> default evidence condition (from Conditions.default_for_category). */
  defaultConditionByCategory: Map<string, string>;
  claimsByProduct: Map<string, SheetRow[]>;
  /** Section 1 and 4: one row per claim and jurisdiction. */
  regulatoryByClaim: Map<string, SheetRow[]>;
  /** Section 2: product-level clinical data. */
  clinicalByProduct: Map<string, SheetRow[]>;
  /** Section 3: the product's actives (ProductIngredients rows). */
  ingredientsByProduct: Map<string, SheetRow[]>;
  /** Section 3: evidence rows per ingredient (all conditions). */
  evidenceByIngredient: Map<string, SheetRow[]>;
  /** Section 5: history rows sorted by version_number. */
  historyByClaim: Map<string, SheetRow[]>;
  enforcementByClaim: Map<string, SheetRow[]>;
  enforcementByProduct: Map<string, SheetRow[]>;
  claimSourcesByClaim: Map<string, SheetRow[]>;
  reviewByClaim: Map<string, SheetRow>;
  correctionsByClaim: Map<string, SheetRow[]>;
  loadedAt: string;
}

export interface LoadOptions {
  spreadsheetId?: string;
  fetchFn?: typeof fetch;
  signal?: AbortSignal;
}

interface TableSpec {
  /** Headers that must exist. */
  headers: string[];
  /** Columns whose combined value must be unique and non-empty. */
  key: string[];
  /** Optional reference columns: a non-empty value must exist in the target table. */
  refs: Array<[column: string, target: 'Products' | 'Claims' | 'Sources' | 'Ingredients' | 'Conditions']>;
}

const TABLES: Record<SheetName, TableSpec> = {
  Products: { headers: ['product_id', 'brand', 'product_name', 'image_url'], key: ['product_id'], refs: [] },
  Claims: {
    headers: ['claim_id', 'product_id', 'claim_text'],
    key: ['claim_id'],
    refs: [['product_id', 'Products'], ['evidence_condition', 'Conditions']],
  },
  Regulatory: {
    headers: ['regulatory_id', 'claim_id', 'jurisdiction', 'regulatory_status', 'legal_basis', 'permissible_claim_language'],
    key: ['regulatory_id'], refs: [['claim_id', 'Claims']],
  },
  ClinicalData: {
    headers: ['clinical_id', 'product_id', 'summary', 'status', 'source_id'],
    key: ['clinical_id'], refs: [['product_id', 'Products'], ['source_id', 'Sources']],
  },
  Ingredients: { headers: ['ingredient_id', 'display_name'], key: ['ingredient_id'], refs: [] },
  ProductIngredients: {
    headers: ['product_id', 'ingredient_id', 'concentration', 'notification_status', 'source_id'],
    key: ['product_id', 'ingredient_id'],
    refs: [['product_id', 'Products'], ['ingredient_id', 'Ingredients'], ['source_id', 'Sources']],
  },
  IngredientEvidence: {
    headers: ['ingredient_id', 'condition', 'evidence_status', 'source_id'],
    key: ['ingredient_id', 'condition', 'source_id'],
    refs: [['ingredient_id', 'Ingredients'], ['condition', 'Conditions'], ['source_id', 'Sources']],
  },
  ClaimHistory: {
    headers: ['history_id', 'claim_id', 'version_number', 'version_text', 'version_date', 'source_id'],
    key: ['history_id'], refs: [['claim_id', 'Claims'], ['source_id', 'Sources']],
  },
  Enforcement: {
    headers: ['enforcement_id', 'product_id', 'claim_id', 'authority', 'action_date', 'outcome', 'source_id'],
    key: ['enforcement_id'], refs: [['product_id', 'Products'], ['claim_id', 'Claims'], ['source_id', 'Sources']],
  },
  ClaimSources: {
    headers: ['claim_id', 'section', 'source_id', 'association_status'],
    key: ['claim_id', 'section', 'source_id'], refs: [['claim_id', 'Claims'], ['source_id', 'Sources']],
  },
  Sources: { headers: ['source_id', 'title', 'url', 'verification_status'], key: ['source_id'], refs: [] },
  CardReview: {
    headers: ['claim_id', ...CARD_SECTIONS.map((section) => section.key)],
    key: ['claim_id'], refs: [['claim_id', 'Claims']],
  },
  Corrections: { headers: ['correction_id', 'claim_id', 'flag_type'], key: ['correction_id'], refs: [['claim_id', 'Claims']] },
  Conditions: { headers: ['condition', 'display_name'], key: ['condition'], refs: [] },
};

export function parseCsv(text: string): SheetRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;
  const input = text.replace(/^﻿/, '');

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"' && value === '') {
      quoted = true;
    } else if (char === ',') {
      row.push(value);
      value = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i += 1;
      row.push(value);
      if (row.some((cell) => cell !== '')) rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }
  if (quoted) throw new Error('CSV parse error: unclosed quoted field');
  if (value !== '' || row.length > 0) {
    row.push(value);
    if (row.some((cell) => cell !== '')) rows.push(row);
  }
  if (rows.length === 0) return [];
  const headers = rows[0].map((header) => header.trim());
  if (headers.some((header) => !header)) throw new Error('CSV parse error: empty header');
  return rows.slice(1).map((cells) =>
    Object.fromEntries(headers.map((header, index) => [header, (cells[index] ?? '').trim()]))
  );
}

export function isSafeSourceUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function checkKeys(rows: SheetRow[], table: SheetName, key: string[]): void {
  const seen = new Set<string>();
  for (const row of rows) {
    const parts = key.map((column) => row[column]?.trim() || '');
    // Only the first key column is mandatory; later ones (e.g. an optional source_id) may be blank.
    if (!parts[0]) throw new Error(`${table}.${key[0]} is required`);
    const value = parts.join(' + ');
    if (seen.has(value)) throw new Error(`duplicate ${table} (${key.join(', ')}): ${value}`);
    seen.add(value);
  }
}

function indexBy(rows: SheetRow[], key: string): Map<string, SheetRow> {
  return new Map(rows.map((row) => [row[key], row]));
}

function groupBy(rows: SheetRow[], key: string): Map<string, SheetRow[]> {
  const grouped = new Map<string, SheetRow[]>();
  for (const row of rows) {
    const value = row[key]?.trim();
    if (!value) continue;
    grouped.set(value, [...(grouped.get(value) || []), row]);
  }
  return grouped;
}

export function buildSheetsSnapshot(tables: SheetsTables): SheetsSnapshot {
  for (const sheetName of SHEET_NAMES) {
    if (!Array.isArray(tables[sheetName])) throw new Error(`missing sheet: ${sheetName}`);
    const first = tables[sheetName][0];
    if (first) {
      for (const header of TABLES[sheetName].headers) {
        if (!(header in first)) throw new Error(`${sheetName} missing required header: ${header}`);
      }
    }
  }
  for (const sheetName of SHEET_NAMES) checkKeys(tables[sheetName], sheetName, TABLES[sheetName].key);

  const targets = {
    Products: indexBy(tables.Products, 'product_id'),
    Claims: indexBy(tables.Claims, 'claim_id'),
    Sources: indexBy(tables.Sources, 'source_id'),
    Ingredients: indexBy(tables.Ingredients, 'ingredient_id'),
    Conditions: indexBy(tables.Conditions, 'condition'),
  };
  for (const sheetName of SHEET_NAMES) {
    for (const [column, target] of TABLES[sheetName].refs) {
      for (const row of tables[sheetName]) {
        const value = row[column]?.trim();
        if (value && !targets[target].has(value)) {
          throw new Error(`${sheetName} references unknown ${column} ${value}`);
        }
      }
    }
  }

  // One URL lives in exactly one Sources row.
  const urls = new Map<string, string>();
  for (const source of tables.Sources) {
    const url = source.url?.trim();
    if (!url) continue;
    const previous = urls.get(url);
    if (previous) throw new Error(`duplicate Sources.url ${url} (${previous}, ${source.source_id})`);
    urls.set(url, source.source_id);
  }

  // An enforcement row tied to a claim must name that claim's product.
  for (const row of tables.Enforcement) {
    const claim = row.claim_id ? targets.Claims.get(row.claim_id) : undefined;
    if (claim && claim.product_id !== row.product_id) {
      throw new Error(`Enforcement ${row.enforcement_id}: claim ${row.claim_id} belongs to ${claim.product_id}, not ${row.product_id}`);
    }
  }

  // Each product category has at most one default evidence condition.
  const defaultConditionByCategory = new Map<string, string>();
  for (const row of tables.Conditions) {
    for (const category of (row.default_for_category || '').split(',').map((value) => value.trim()).filter(Boolean)) {
      const previous = defaultConditionByCategory.get(category);
      if (previous && previous !== row.condition) {
        throw new Error(`category ${category} has two default conditions (${previous}, ${row.condition})`);
      }
      defaultConditionByCategory.set(category, row.condition);
    }
  }

  const historyByClaim = groupBy(tables.ClaimHistory, 'claim_id');
  for (const rows of historyByClaim.values()) {
    rows.sort((a, b) => Number(a.version_number) - Number(b.version_number));
  }

  return {
    tables,
    productsById: targets.Products,
    claimsById: targets.Claims,
    sourcesById: targets.Sources,
    ingredientsById: targets.Ingredients,
    conditionsById: targets.Conditions,
    defaultConditionByCategory,
    claimsByProduct: groupBy(tables.Claims, 'product_id'),
    regulatoryByClaim: groupBy(tables.Regulatory, 'claim_id'),
    clinicalByProduct: groupBy(tables.ClinicalData, 'product_id'),
    ingredientsByProduct: groupBy(tables.ProductIngredients, 'product_id'),
    evidenceByIngredient: groupBy(tables.IngredientEvidence, 'ingredient_id'),
    historyByClaim,
    enforcementByClaim: groupBy(tables.Enforcement, 'claim_id'),
    enforcementByProduct: groupBy(tables.Enforcement, 'product_id'),
    claimSourcesByClaim: groupBy(tables.ClaimSources, 'claim_id'),
    reviewByClaim: indexBy(tables.CardReview, 'claim_id'),
    correctionsByClaim: groupBy(tables.Corrections, 'claim_id'),
    loadedAt: new Date().toISOString(),
  };
}

export function sheetCsvUrl(sheet: SheetName, spreadsheetId = DEFAULT_SPREADSHEET_ID): string {
  return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(sheet)}`;
}

export async function loadPublicSheets(options: LoadOptions = {}): Promise<SheetsSnapshot> {
  const fetchFn = options.fetchFn || fetch;
  const entries = await Promise.all(SHEET_NAMES.map(async (sheetName) => {
    const response = await fetchFn(sheetCsvUrl(sheetName, options.spreadsheetId), {
      signal: options.signal,
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`${sheetName} sheet request failed (${response.status})`);
    const text = await response.text();
    const rows = parseCsv(text);
    if (rows.length === 0 && !text.trim()) throw new Error(`${sheetName} sheet is empty`);
    return [sheetName, rows] as const;
  }));
  return buildSheetsSnapshot(Object.fromEntries(entries) as SheetsTables);
}
