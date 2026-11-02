import React, { useMemo, useState } from 'react';
import { ExternalLink, Globe2, Search } from 'lucide-react';
import type { SheetsSnapshot } from '../data/publicSheets';
import { sourcesDirectory } from '../data/sheetCards';

interface SheetSourcesViewProps {
  snapshot: SheetsSnapshot;
  onOpenClaim: (productId: string, claimId: string) => void;
}

/** Every source in the Sheet, its verification status, and the claims that cite it. */
export const SheetSourcesView: React.FC<SheetSourcesViewProps> = ({ snapshot, onOpenClaim }) => {
  const [query, setQuery] = useState('');
  const directory = useMemo(() => sourcesDirectory(snapshot), [snapshot]);

  const q = query.trim().toLowerCase();
  const rows = directory.filter((d) => {
    if (!q) return true;
    const products = d.productIds.map((id) => snapshot.productsById.get(id)?.brand || '').join(' ');
    return `${d.source.title} ${d.source.url || ''} ${d.sourceType} ${products}`.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#A87B4E]/30 bg-[#3D2817]/60 p-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-[#A87B4E]">
            <Globe2 className="w-4 h-4" /> Sources
          </span>
          <h2 className="text-xl font-extrabold text-white mt-1">Source directory</h2>
          <p className="text-xs text-[#F5F2EB]/70 mt-1 max-w-2xl">
            {directory.length} sources · Including the official product pages, regulations, and publications.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-[#A87B4E] absolute left-3 top-2.5" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by title, URL or brand…"
              aria-label="Filter sources"
              className="w-full bg-[#2C3E50] text-xs text-[#F5F2EB] pl-9 pr-3 py-2 rounded-xl border border-[#A87B4E]/30 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map((d) => (
          <li key={d.source.sourceId} className="rounded-2xl border border-[#A87B4E]/30 bg-[#3D2817]/50 p-4 space-y-2 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <span className="font-mono text-[10px] uppercase text-[#A87B4E]">{d.sourceType.replace(/_/g, ' ')}</span>
            </div>
            {d.source.url ? (
              <a
                href={d.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-1.5 text-sm font-bold text-white hover:text-[#A87B4E] break-words"
              >
                <span>{d.source.title}</span>
                <ExternalLink className="w-3.5 h-3.5 mt-1 flex-shrink-0" />
              </a>
            ) : (
              <p className="text-sm font-bold text-white">{d.source.title}</p>
            )}
            {d.source.url && <p className="font-mono text-[10px] text-[#F5F2EB]/50 break-all">{d.source.url}</p>}
            {(d.claimIds.length > 0 || d.productIds.length > 0) && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {d.claimIds.map((claimId) => {
                  const claim = snapshot.claimsById.get(claimId);
                  const product = claim ? snapshot.productsById.get(claim.product_id) : undefined;
                  if (!claim || !product) return null;
                  return (
                    <button
                      key={claimId}
                      type="button"
                      onClick={() => onOpenClaim(product.product_id, claimId)}
                      className="max-w-full truncate rounded-lg border border-[#A87B4E]/40 bg-[#2C3E50] px-2 py-0.5 text-[11px] text-[#F5F2EB] hover:border-[#A87B4E]"
                      title={claim.claim_text}
                    >
                      {product.brand}: {claim.claim_text}
                    </button>
                  );
                })}
                {d.claimIds.length === 0 &&
                  d.productIds.map((productId) => {
                    const product = snapshot.productsById.get(productId);
                    const firstClaim = snapshot.claimsByProduct.get(productId)?.[0];
                    if (!product || !firstClaim) return null;
                    return (
                      <button
                        key={productId}
                        type="button"
                        onClick={() => onOpenClaim(productId, firstClaim.claim_id)}
                        className="rounded-lg border border-[#A87B4E]/40 bg-[#2C3E50] px-2 py-0.5 text-[11px] text-[#F5F2EB] hover:border-[#A87B4E]"
                      >
                        {product.brand}
                      </button>
                    );
                  })}
              </div>
            )}
          </li>
        ))}
      </ul>
      {rows.length === 0 && <p className="text-center text-sm text-[#F5F2EB]/60">No sources match.</p>}
    </div>
  );
};
