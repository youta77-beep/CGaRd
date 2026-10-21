export const DEFAULT_SPREADSHEET_ID =
  import.meta.env?.VITE_CGARD_SPREADSHEET_ID || '1QKGBJxDB_GngxSDz7-VjxHwX3Cf0W47khLTrsWepFow';

export const SHEET_NAMES = [
  'Products', 'Claims', 'CardSections', 'ActiveEvidence', 'ClaimHistory',
  'Sources', 'Regulatory', 'Substantiation', 'Enforcement', 'Corrections', 'ClaimSources',
] as const;

export type SheetName = (typeof SHEET_NAMES)[number];
export type SheetRow = Record<string, string>;
export type SheetsTables = Record<SheetName, SheetRow[]>;

export interface SheetsSnapshot {
  tables: SheetsTables;
  productsById: Map<string, SheetRow>;
  claimsById: Map<string, SheetRow>;
  sourcesById: Map<string, SheetRow>;
  sectionsByClaim: Map<string, SheetRow[]>;
  activeEvidenceByClaim: Map<string, SheetRow[]>;
  historyByClaim: Map<string, SheetRow[]>;
  regulatoryByClaim: Map<string, SheetRow>;
  substantiationByClaim: Map<string, SheetRow[]>;
  enforcementByClaim: Map<string, SheetRow[]>;
  correctionsByClaim: Map<string, SheetRow[]>;
  claimSourcesByClaim: Map<string, SheetRow[]>;
  loadedAt: string;
}

export interface LoadOptions {
  spreadsheetId?: string;
  fetchFn?: typeof fetch;
  signal?: AbortSignal;
}

const REQUIRED_HEADERS: Record<SheetName, string[]> = {
  Products: ['product_id', 'brand', 'product_name'],
  Claims: ['claim_id', 'product_id', 'claim_text'],
  CardSections: ['section_id', 'claim_id', 'section_key', 'display_order', 'data_status', 'publication_status'],
  ActiveEvidence: ['active_evidence_id', 'product_id', 'claim_id', 'active_name'],
  ClaimHistory: ['history_id', 'claim_id', 'version_number', 'version_text'],
  Sources: ['source_id', 'source_url', 'verification_status'],
  Regulatory: ['regulatory_id', 'claim_id', 'banned_status'],
  Substantiation: ['substantiation_id', 'claim_id', 'evidence_type'],
  Enforcement: ['enforcement_id', 'product_id', 'claim_id'],
  Corrections: ['correction_id', 'claim_id', 'flag_type'],
  ClaimSources: ['claim_source_id', 'claim_id', 'source_id', 'section_key', 'association_status'],
};

export function parseCsv(text: string): SheetRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;
  const input = text.replace(/^\uFEFF/, '');

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
    Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']))
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

function indexUnique(rows: SheetRow[], key: string, table: SheetName): Map<string, SheetRow> {
  const index = new Map<string, SheetRow>();
  for (const row of rows) {
    const value = row[key]?.trim();
    if (!value) throw new Error(`${table}.${key} is required`);
    if (index.has(value)) throw new Error(`duplicate ${table}.${key}: ${value}`);
    index.set(value, row);
  }
  return index;
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

function requireReferences(rows: SheetRow[], key: string, target: Map<string, SheetRow>, label: string): void {
  for (const row of rows) {
    const value = row[key]?.trim();
    if (value && !target.has(value)) throw new Error(`${label} references unknown ${key} ${value}`);
  }
}

export function buildSheetsSnapshot(tables: SheetsTables): SheetsSnapshot {
  for (const sheetName of SHEET_NAMES) {
    if (!Array.isArray(tables[sheetName])) throw new Error(`missing sheet: ${sheetName}`);
    const first = tables[sheetName][0];
    if (first) {
      for (const header of REQUIRED_HEADERS[sheetName]) {
        if (!(header in first)) throw new Error(`${sheetName} missing required header: ${header}`);
      }
    }
  }

  const productsById = indexUnique(tables.Products, 'product_id', 'Products');
  const claimsById = indexUnique(tables.Claims, 'claim_id', 'Claims');
  const sourcesById = indexUnique(tables.Sources, 'source_id', 'Sources');
  indexUnique(tables.CardSections, 'section_id', 'CardSections');
  indexUnique(tables.ActiveEvidence, 'active_evidence_id', 'ActiveEvidence');
  indexUnique(tables.ClaimHistory, 'history_id', 'ClaimHistory');
  indexUnique(tables.Regulatory, 'regulatory_id', 'Regulatory');
  indexUnique(tables.Substantiation, 'substantiation_id', 'Substantiation');
  indexUnique(tables.Enforcement, 'enforcement_id', 'Enforcement');
  indexUnique(tables.Corrections, 'correction_id', 'Corrections');
  indexUnique(tables.ClaimSources, 'claim_source_id', 'ClaimSources');

  requireReferences(tables.Claims, 'product_id', productsById, 'Claims');
  for (const name of ['CardSections', 'ActiveEvidence', 'ClaimHistory', 'Regulatory', 'Substantiation', 'Corrections', 'ClaimSources'] as SheetName[]) {
    requireReferences(tables[name], 'claim_id', claimsById, name);
  }
  requireReferences(tables.ActiveEvidence, 'product_id', productsById, 'ActiveEvidence');
  requireReferences(tables.Enforcement, 'product_id', productsById, 'Enforcement');
  requireReferences(tables.ClaimSources, 'source_id', sourcesById, 'ClaimSources');

  return {
    tables, productsById, claimsById, sourcesById,
    sectionsByClaim: groupBy(tables.CardSections, 'claim_id'),
    activeEvidenceByClaim: groupBy(tables.ActiveEvidence, 'claim_id'),
    historyByClaim: groupBy(tables.ClaimHistory, 'claim_id'),
    regulatoryByClaim: new Map(tables.Regulatory.map((row) => [row.claim_id, row])),
    substantiationByClaim: groupBy(tables.Substantiation, 'claim_id'),
    enforcementByClaim: groupBy(tables.Enforcement, 'claim_id'),
    correctionsByClaim: groupBy(tables.Corrections, 'claim_id'),
    claimSourcesByClaim: groupBy(tables.ClaimSources, 'claim_id'),
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
