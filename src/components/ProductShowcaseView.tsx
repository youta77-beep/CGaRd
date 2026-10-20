import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductRecord, Layer1Claim, AuditCard } from '../types/schema';
import { getProductPhoto, ProductPhotoInfo } from '../data/productImages';
import { buildCard } from '../engine/cardBuilder';
import { PuzzleCardSpace } from './PuzzleCardSpace';
import { RegulatoryStatusBadge } from './RegulatoryStatusBadge';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Puzzle,
  ArrowRight,
  FlaskConical,
  Building2,
  Globe2,
} from 'lucide-react';

interface ProductShowcaseViewProps {
  products: ProductRecord[];
  db: any;
  isExternalMode: boolean;
  selectedClaimId: string;
  onSelectClaim: (claimId: string) => void;
  onInspectDossier?: (claimId: string) => void;
  deletedProvenanceFields?: string[];
  onToggleDeleteProvenance?: (fieldKey: string) => void;
  onResetDeletedProvenance?: () => void;
  onStoreMutated?: () => void;
  isDeveloperMode?: boolean;
}

export const ProductShowcaseView: React.FC<ProductShowcaseViewProps> = ({
  products,
  db,
  isExternalMode,
  selectedClaimId,
  onSelectClaim,
  onInspectDossier,
  deletedProvenanceFields = [],
  onToggleDeleteProvenance,
  onResetDeletedProvenance,
  onStoreMutated,
  isDeveloperMode = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('all');

  // Track the currently focused product for its dedicated specialized space.
  // When null, all products are displayed in the showcase gallery.
  // When set to a product slug, ONLY that product is displayed in its specialized space!
  const [focusedProductSlug, setFocusedProductSlug] = useState<string | null>(null);

  // Brands list for dropdown
  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      p.claims.forEach((c) => set.add(c.brand));
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const photoInfo = getProductPhoto(product.slug, product.company);
      if (selectedBrand !== 'all') {
        const matchesBrand = product.claims.some((c) => c.brand === selectedBrand);
        if (!matchesBrand) return false;
      }
      if (selectedJurisdiction !== 'all') {
        if (!product.regulatory_jurisdiction.toLowerCase().includes(selectedJurisdiction.toLowerCase())) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inCompany = product.company.toLowerCase().includes(q);
        const inBrand = (product.brand_positioning || '').toLowerCase().includes(q);
        const inClaims = product.claims.some((c) => c.claim_text.toLowerCase().includes(q));
        const inActives = photoInfo.key_actives.some((a) => a.toLowerCase().includes(q));
        if (!inCompany && !inBrand && !inClaims && !inActives) {
          return false;
        }
      }
      return true;
    });
  }, [products, selectedBrand, selectedJurisdiction, searchQuery]);

  // If a product is currently focused in its specialized space, render PuzzleCardSpace
  const activeProduct = focusedProductSlug
    ? products.find((p) => p.slug === focusedProductSlug)
    : null;

  if (activeProduct) {
    return (
      <AnimatePresence mode="wait">
        <PuzzleCardSpace
          key={activeProduct.slug}
          product={activeProduct}
          allProducts={products}
          db={db}
          isExternalMode={isExternalMode}
          selectedClaimId={selectedClaimId}
          onSelectClaim={onSelectClaim}
          onBackToGallery={() => setFocusedProductSlug(null)}
          onSwitchProduct={(newSlug) => {
            setFocusedProductSlug(newSlug);
            const nextProd = products.find((p) => p.slug === newSlug);
            if (nextProd?.claims[0]) {
              onSelectClaim(nextProd.claims[0].claim_id);
            }
          }}
          deletedProvenanceFields={deletedProvenanceFields}
          onToggleDeleteProvenance={onToggleDeleteProvenance}
          onResetDeletedProvenance={onResetDeletedProvenance}
          onStoreMutated={onStoreMutated}
          isDeveloperMode={isDeveloperMode}
        />
      </AnimatePresence>
    );
  }

  // GALLERY VIEW: All products are displayed. Clicking any product enters its specialized space.
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Top Controls Bar: Search & Filters */}
      <div className="bg-[#3D2817]/60 border border-[#A87B4E]/30 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-[#A87B4E] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product, active ingredient, brand..."
              className="w-full bg-[#2C3E50] text-xs text-[#F5F2EB] pl-9 pr-8 py-2 rounded-xl border border-[#A87B4E]/30 focus:border-[#A87B4E] focus:outline-none placeholder-[#F5F2EB]/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-xs text-[#F5F2EB]/60 hover:text-[#FFFFFF]"
              >
                ×
              </button>
            )}
          </div>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-[#2C3E50] text-[#F5F2EB] border border-[#A87B4E]/30 text-xs rounded-xl px-3 py-2 focus:border-[#A87B4E] focus:outline-none"
          >
            <option value="all">All Brands ({brands.length})</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Market Filter */}
          <select
            value={selectedJurisdiction}
            onChange={(e) => setSelectedJurisdiction(e.target.value)}
            className="bg-[#2C3E50] text-[#F5F2EB] border border-[#A87B4E]/30 text-xs rounded-xl px-3 py-2 focus:border-[#A87B4E] focus:outline-none"
          >
            <option value="all">All Markets</option>
            <option value="DE">Germany (DE)</option>
            <option value="France">France (FR)</option>
            <option value="UK">United Kingdom (UK)</option>
            <option value="USA">United States (USA)</option>
          </select>
        </div>

        {/* Counter and Guide */}
        <div className="flex items-center space-x-2 text-xs font-mono text-[#A87B4E]">
          <Puzzle className="w-4 h-4 text-[#A87B4E]" />
          <span>Click any product to enter its specialized puzzle space</span>
        </div>
      </div>

      {/* BIG SCREEN 2-IN-A-ROW SHOWCASE GALLERY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pt-2">
        {filteredProducts.map((product, idx) => {
          const photoInfo = getProductPhoto(product.slug, product.company);
          const firstClaim = product.claims[0];

          return (
            <motion.div
              key={product.slug}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: idx * 0.07, ease: 'easeOut' }}
              whileHover={{ y: -7, scale: 1.01, transition: { duration: 0.25, ease: 'easeOut' } }}
              onClick={() => {
                setFocusedProductSlug(product.slug);
                if (firstClaim) {
                  onSelectClaim(firstClaim.claim_id);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="rounded-3xl border border-[#A87B4E]/30 hover:border-[#A87B4E] bg-[#3D2817]/50 hover:bg-[#3D2817]/75 transition-all duration-300 shadow-2xl flex flex-col justify-between cursor-pointer group relative overflow-visible"
            >
              {/* Video-style subtle sheen reflection on hover */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-sheen-sweep"></div>
              </div>

              {/* Outer Window Bar */}
              <div className="px-6 py-4 bg-[#3D2817] border-b border-[#A87B4E]/25 rounded-t-3xl flex items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#A87B4E] border border-[#A87B4E] inline-block shadow-sm"></span>
                  <span className="w-3 h-3 rounded-full bg-[#F5F2EB] border border-[#F5F2EB]/80 inline-block shadow-sm"></span>
                  <span className="w-3 h-3 rounded-full bg-[#2C3E50] border border-[#2C3E50] inline-block shadow-sm"></span>
                  <span className="text-xs font-mono font-bold text-[#FFFFFF] ml-2 tracking-wide">
                    {photoInfo.brand}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#2C3E50] text-[#F5F2EB] border border-[#A87B4E]/30 font-semibold">
                    {product.regulatory_jurisdiction.split('(')[0].trim()}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#A87B4E]/20 text-[#F5F2EB] border border-[#A87B4E]/40 font-bold">
                    {product.claims.length} claims
                  </span>
                </div>
              </div>

              {/* CARD BODY: BIG PACKSHOT & INTRO */}
              <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between">
                {/* 1. THE BIG PRODUCT IMAGE (100% Full Uncropped View with Generous Headroom) */}
                <div className="relative rounded-2xl bg-gradient-to-b from-[#FFFFFF] via-[#F5F2EB] to-[#F5F2EB] border border-[#A87B4E]/30 pt-12 pb-8 px-6 sm:pt-14 sm:pb-10 sm:px-8 flex flex-col items-center justify-center transition shadow-lg group-hover:border-[#A87B4E] group-hover:shadow-2xl min-h-[400px] sm:min-h-[440px]">
                  {/* Subtle decorative glow */}
                  <div className="absolute inset-0 bg-[#A87B4E]/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl pointer-events-none"></div>

                  {/* High-Resolution Large Product Packshot with full headroom */}
                  <div className="w-full flex items-center justify-center h-64 sm:h-72 md:h-80 max-h-[340px]">
                    <img
                      src={photoInfo.image_url}
                      alt={photoInfo.product_name}
                      className="h-full w-auto max-h-full max-w-full object-contain drop-shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-300 select-none py-2"
                    />
                  </div>

                  {/* Badge showing click into specialized space */}
                  <div className="mt-4 flex items-center space-x-2 text-xs font-bold px-3.5 py-1.5 rounded-full bg-[#3D2817] border border-[#A87B4E] text-[#F5F2EB] group-hover:bg-[#A87B4E] group-hover:text-[#FFFFFF] transition shadow-md z-10">
                    <Puzzle className="w-3.5 h-3.5 text-[#A87B4E] group-hover:text-white" />
                    <span>Click to Enter CGaRd Specialized Space &amp; Assemble Puzzle</span>
                  </div>
                </div>

                {/* 2. PRODUCT INFO & ACTIVE INGREDIENTS PREVIEW */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-black text-[#FFFFFF] group-hover:text-[#A87B4E] transition-colors">
                      {photoInfo.product_name}
                    </h3>
                  </div>

                  <p className="text-xs text-[#F5F2EB]/80 leading-relaxed line-clamp-2">
                    {product.brand_positioning}
                  </p>

                  {/* Notified Formula Actives Preview Chips */}
                  <div className="space-y-1.5 pt-2 border-t border-[#A87B4E]/25">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#A87B4E] flex items-center space-x-1">
                      <FlaskConical className="w-3 h-3" />
                      <span>Notified Formula Actives:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {photoInfo.key_actives.map((act) => (
                        <span
                          key={act}
                          className="px-2 py-0.5 rounded bg-[#2C3E50] text-[#F5F2EB] text-[11px] font-medium border border-[#A87B4E]/30"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Primary Target Claim Preview */}
                  {firstClaim && (
                    <div className="p-3 rounded-xl bg-[#2C3E50]/60 border border-[#A87B4E]/30 text-xs space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#A87B4E]">
                        Target Claim:
                      </span>
                      <p className="italic text-[#F5F2EB] font-medium truncate">
                        &ldquo;{firstClaim.claim_text}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. ACTION BUTTON AT BOTTOM */}
                <div className="pt-4 border-t border-[#A87B4E]/25 flex items-center justify-between">
                  <span className="text-xs text-[#F5F2EB]/60 font-mono">
                    {product.claims.length} regulatory {product.claims.length === 1 ? 'card' : 'cards'}
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#A87B4E] group-hover:text-[#FFFFFF] transition-colors">
                    <span>Assemble Regulatory Passport</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
