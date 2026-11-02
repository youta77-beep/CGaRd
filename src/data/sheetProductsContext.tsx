import React, { createContext, useContext, useMemo } from 'react';
import type { SheetsSnapshot } from './publicSheets';
import { productsFromSheets, type ProductSummary } from './sheetCards';

/** product_id -> product, read from the Sheets DB. */
export type SheetProductsById = ReadonlyMap<string, ProductSummary>;

const EMPTY: SheetProductsById = new Map();
const SheetProductsContext = createContext<SheetProductsById>(EMPTY);

export function sheetProductsById(snapshot: SheetsSnapshot | null): SheetProductsById {
  if (!snapshot) return EMPTY;
  return new Map(productsFromSheets(snapshot).map((product) => [product.productId, product]));
}

export const SheetProductsProvider: React.FC<{ snapshot: SheetsSnapshot | null; children: React.ReactNode }> = ({
  snapshot,
  children,
}) => {
  const products = useMemo(() => sheetProductsById(snapshot), [snapshot]);
  return <SheetProductsContext.Provider value={products}>{children}</SheetProductsContext.Provider>;
};

/** Products from the Sheets DB; empty until the sheet has loaded. */
export function useSheetProducts(): SheetProductsById {
  return useContext(SheetProductsContext);
}
