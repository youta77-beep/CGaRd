import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, FlaskConical, ImageOff, Search } from 'lucide-react';
import type { SheetsSnapshot } from '../data/publicSheets';
import { buildClaimCard, type ProductSummary } from '../data/sheetCards';
import { RegulatoryStatusPill, SheetClaimCard } from './SheetClaimCard';

interface SheetShowcaseProps {
  snapshot: SheetsSnapshot;
  products: ProductSummary[];
  focusedProductId: string | null;
  selectedClaimId: string | null;
  onFocusProduct: (productId: string | null) => void;
  onSelectClaim: (claimId: string) => void;
}

const ProductImage: React.FC<{ product: ProductSummary; className?: string }> = ({ product, className }) => {
  const [failed, setFailed] = useState(false);
  if (!product.imageUrl || failed) {
    return (
      <div className={`flex flex-col items-center justify-center text-[#3D2817]/40 ${className || ''}`}>
        <ImageOff className="w-10 h-10" />
        <span className="text-[11px] mt-1">No image</span>
      </div>
    );
  }
  return (
    <img
      src={product.imageUrl}
      alt={`${product.brand} ${product.name}`}
      onError={() => setFailed(true)}
      className={`object-contain drop-shadow-2xl select-none ${className || ''}`}
    />
  );
};

const ActiveChips: React.FC<{ product: ProductSummary }> = ({ product }) =>
  product.actives.length === 0 ? (
    <span className="text-[11px] italic text-[#F5F2EB]/50">Actives not on file</span>
  ) : (
    <div className="flex flex-wrap gap-1.5">
      {product.actives.map((a) => (
        <span key={a.name} className="px-2 py-0.5 rounded bg-[#2C3E50] text-[#F5F2EB] text-[11px] font-medium border border-[#A87B4E]/30">
          {a.name}
          {a.concentration && ` ${a.concentration}`}
        </span>
      ))}
    </div>
  );

/** Product detail: product panel on the left, claim tabs and the five-section card on the right. */
const ProductSpace: React.FC<SheetShowcaseProps & { product: ProductSummary }> = ({
  snapshot,
  products,
  product,
  selectedClaimId,
  onFocusProduct,
  onSelectClaim,
}) => {
  const claimId =
    selectedClaimId && product.claims.some((c) => c.claimId === selectedClaimId) ? selectedClaimId : product.claims[0]?.claimId;
  const card = useMemo(() => (claimId ? buildClaimCard(snapshot, claimId) : null), [snapshot, claimId]);
  const index = products.findIndex((p) => p.productId === product.productId);
  const go = (delta: number) => {
    const next = products[(index + delta + products.length) % products.length];
    onFocusProduct(next.productId);
    if (next.claims[0]) onSelectClaim(next.claims[0].claimId);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#A87B4E]/30 bg-[#3D2817]/60 p-4">
        <button
          type="button"
          onClick={() => onFocusProduct(null)}
          className="flex items-center gap-2 text-xs font-bold text-[#F5F2EB] hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> All products
        </button>
        <span className="text-xs font-mono text-[#F5F2EB]/70">
          {index + 1} / {products.length}
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={() => go(-1)} aria-label="Previous product" className="rounded-lg border border-[#A87B4E]/40 p-1.5 hover:bg-[#A87B4E]/30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next product" className="rounded-lg border border-[#A87B4E]/40 p-1.5 hover:bg-[#A87B4E]/30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-4 space-y-4 rounded-2xl border border-[#A87B4E]/30 bg-[#3D2817]/50 p-5">
          <div className="rounded-xl bg-gradient-to-b from-white to-[#F5F2EB] p-6 flex items-center justify-center h-72">
            <ProductImage product={product} className="h-full w-auto max-w-full" />
          </div>
          <div className="space-y-1">
            <p className="font-mono text-[10px] uppercase font-bold text-[#A87B4E]">{product.brand}</p>
            <h2 className="text-lg font-black text-white leading-snug">{product.name}</h2>
            <p className="text-[11px] text-[#F5F2EB]/60">
              {[product.markets, product.channel, product.volumeMl && `${product.volumeMl} ml`].filter(Boolean).join(' · ')}
            </p>
          </div>
          {product.positioning && <p className="text-xs text-[#F5F2EB]/80">{product.positioning}</p>}
          <div className="space-y-1.5 border-t border-[#A87B4E]/25 pt-3">
            <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-[#A87B4E]">
              <FlaskConical className="w-3 h-3" /> Formula actives
            </span>
            <ActiveChips product={product} />
          </div>
          {product.keyFinding && (
            <div className="border-t border-[#A87B4E]/25 pt-3 text-xs text-[#F5F2EB]/80">
              <span className="block text-[10px] font-mono font-bold uppercase text-[#A87B4E] mb-1">Audit note</span>
              {product.keyFinding}
            </div>
          )}
        </aside>

        <div className="lg:col-span-8 space-y-4">
          {product.claims.length > 1 && (
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Claims for this product">
              {product.claims.map((c, i) => (
                <button
                  key={c.claimId}
                  type="button"
                  role="tab"
                  aria-selected={c.claimId === claimId}
                  onClick={() => onSelectClaim(c.claimId)}
                  className={`max-w-full rounded-xl border px-3 py-2 text-left text-xs transition ${
                    c.claimId === claimId
                      ? 'border-[#A87B4E] bg-[#A87B4E] text-white'
                      : 'border-[#A87B4E]/30 bg-[#3D2817]/50 text-[#F5F2EB]/80 hover:border-[#A87B4E]'
                  }`}
                >
                  <span className="font-mono text-[10px] font-bold block">Claim {i + 1}</span>
                  <span className="line-clamp-1">{c.text}</span>
                </button>
              ))}
            </div>
          )}
          {card ? (
            <SheetClaimCard card={card} />
          ) : (
            <div className="rounded-2xl border border-[#A87B4E]/30 bg-[#3D2817]/40 p-10 text-center text-[#F5F2EB]/60">
              No claims on file for this product.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  anti_dandruff_shampoo: 'Shampoo (Anti-dandruff)',
  strengthening_repair_shampoo: 'Shampoo (Strengthening / Repair)',
};

/** Display label for a Products.category value; values without a label show as written in the sheet. */
function categoryLabel(category: string): string {
  return PRODUCT_CATEGORY_LABELS[category] ?? category;
}

/** Public product gallery and product detail, driven only by the Google Sheet. */
export const SheetShowcase: React.FC<SheetShowcaseProps> = (props) => {
  const { products, focusedProductId, onFocusProduct, onSelectClaim } = props;
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('all');
  const [market, setMarket] = useState('all');
  const [category, setCategory] = useState('all');

  const brands = useMemo(() => [...new Set(products.map((p) => p.brand))].sort(), [products]);
  const markets = useMemo(
    () => [...new Set(products.flatMap((p) => p.markets.split(/[;,]/).map((m) => m.trim()).filter(Boolean)))].sort(),
    [products]
  );
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category.trim()).filter(Boolean))].sort(),
    [products]
  );

  const focused = focusedProductId ? products.find((p) => p.productId === focusedProductId) : null;
  if (focused) return <ProductSpace {...props} product={focused} />;

  const q = query.trim().toLowerCase();
  const filtered = products.filter((p) => {
    if (brand !== 'all' && p.brand !== brand) return false;
    if (market !== 'all' && !p.markets.includes(market)) return false;
    if (category !== 'all' && p.category.trim() !== category) return false;
    if (!q) return true;
    return [p.brand, p.name, p.positioning, ...p.actives.map((a) => a.name), ...p.claims.map((c) => c.text)]
      .join(' ')
      .toLowerCase()
      .includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#A87B4E]/30 bg-[#3D2817]/60 p-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-[#A87B4E] absolute left-3 top-2.5" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product, active ingredient, brand, claim…"
            aria-label="Search products"
            className="w-full bg-[#2C3E50] text-xs text-[#F5F2EB] pl-9 pr-3 py-2 rounded-xl border border-[#A87B4E]/30 focus:border-[#A87B4E] focus:outline-none placeholder-[#F5F2EB]/50"
          />
        </div>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          aria-label="Filter by brand"
          className="bg-[#2C3E50] text-[#F5F2EB] border border-[#A87B4E]/30 text-xs rounded-xl px-3 py-2"
        >
          <option value="all">All brands ({brands.length})</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select
          value={market}
          onChange={(e) => setMarket(e.target.value)}
          aria-label="Filter by market"
          className="bg-[#2C3E50] text-[#F5F2EB] border border-[#A87B4E]/30 text-xs rounded-xl px-3 py-2"
        >
          <option value="all">All markets</option>
          {markets.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Product category"
          className="bg-[#2C3E50] text-[#F5F2EB] border border-[#A87B4E]/30 text-xs rounded-xl px-3 py-2"
        >
          <option value="all">Product category</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {categoryLabel(c)}
            </option>
          ))}
        </select>
        <span className="text-xs font-mono text-[#F5F2EB]/60 ml-auto">
          {filtered.length} of {products.length} products
        </span>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-[#A87B4E]/30 bg-[#3D2817]/40 p-12 text-center text-[#F5F2EB]/60">
          The Google Sheet has no products yet. Add rows to the Products tab and press Refresh.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#A87B4E]/30 bg-[#3D2817]/40 p-12 text-center text-[#F5F2EB]/60">
          No products match these filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filtered.map((product, idx) => {
            const first = product.claims[0];
            return (
              <motion.button
                type="button"
                key={product.productId}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(idx, 8) * 0.06 }}
                onClick={() => {
                  onFocusProduct(product.productId);
                  if (first) onSelectClaim(first.claimId);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group text-left rounded-3xl border border-[#A87B4E]/30 hover:border-[#A87B4E] bg-[#3D2817]/50 hover:bg-[#3D2817]/75 transition shadow-2xl flex flex-col"
              >
                <div className="px-6 py-3 bg-[#3D2817] border-b border-[#A87B4E]/25 rounded-t-3xl flex items-center justify-between gap-3 w-full">
                  <span className="text-xs font-mono font-bold text-white truncate">{product.brand}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#A87B4E]/20 text-[#F5F2EB] border border-[#A87B4E]/40 font-bold flex-shrink-0">
                    {product.claims.length} {product.claims.length === 1 ? 'claim' : 'claims'}
                  </span>
                </div>
                <div className="p-6 space-y-4 flex-1 flex flex-col w-full">
                  <div className="rounded-2xl bg-gradient-to-b from-white to-[#F5F2EB] border border-[#A87B4E]/30 flex items-center justify-center h-72 p-6">
                    <ProductImage product={product} className="h-full w-auto max-w-full group-hover:scale-[1.02] transition-transform" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#A87B4E] transition-colors">{product.name}</h3>
                  {product.positioning && <p className="text-xs text-[#F5F2EB]/80 line-clamp-2">{product.positioning}</p>}
                  <ActiveChips product={product} />
                  {first && (
                    <div className="p-3 rounded-xl bg-[#2C3E50]/60 border border-[#A87B4E]/30 text-xs space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-[#A87B4E]">Claim</span>
                        <RegulatoryStatusPill status={first.regulatoryStatus} />
                      </div>
                      <p className="italic text-[#F5F2EB] line-clamp-2 whitespace-pre-line">&ldquo;{first.text}&rdquo;</p>
                    </div>
                  )}
                  <div className="mt-auto pt-3 border-t border-[#A87B4E]/25 flex items-center justify-end gap-1.5 text-xs font-bold text-[#A87B4E] group-hover:text-white">
                    Open claim cards <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
};
