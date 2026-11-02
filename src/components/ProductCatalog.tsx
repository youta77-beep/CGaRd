import React, { useState, useMemo, useEffect } from 'react';
import { ProductRecord, Layer1Claim } from '../types/schema';
import { getProductPhoto, ProductPhotoInfo } from '../data/productLookup';
import { useSheetProducts } from '../data/sheetProductsContext';
import { ProductImage } from './ProductImage';
import { RegulatoryStatusBadge } from './RegulatoryStatusBadge';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Globe2,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Tag,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Eye,
} from 'lucide-react';

interface ProductCatalogProps {
  products: ProductRecord[];
  selectedClaimId: string;
  onSelectClaim: (claimId: string) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  selectedClaimId,
  onSelectClaim,
}) => {
  const sheetProducts = useSheetProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'photos' | 'list'>('photos');

  // Find the product slug corresponding to the currently selected claim
  const currentProductSlug = useMemo(() => {
    const found = products.find((p) => p.claims.some((c) => c.claim_id === selectedClaimId));
    return found ? found.slug : products[0]?.slug;
  }, [products, selectedClaimId]);

  // Set of expanded product slugs
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set([currentProductSlug]));

  // Keep the active product expanded when selectedClaimId changes
  useEffect(() => {
    if (currentProductSlug) {
      setExpandedSlugs((prev) => {
        const next = new Set(prev);
        next.add(currentProductSlug);
        return next;
      });
    }
  }, [currentProductSlug]);

  const toggleExpand = (slug: string) => {
    setExpandedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  // Extract unique brands
  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      p.claims.forEach((c) => set.add(c.brand));
    });
    return Array.from(set).sort();
  }, [products]);

  // Filter products and their claims
  const filteredProducts = useMemo(() => {
    return products
      .map((product) => {
        const photoInfo = getProductPhoto(product.slug, product.company, sheetProducts);
        const matchingClaims = product.claims.filter((claim) => {
          const reg = product.regulatory.find((r) => r.claim_id === claim.claim_id);
          if (selectedBrand !== 'all' && claim.brand !== selectedBrand) {
            return false;
          }
          if (
            selectedJurisdiction !== 'all' &&
            !claim.jurisdiction.toLowerCase().includes(selectedJurisdiction.toLowerCase())
          ) {
            return false;
          }
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const inClaim = claim.claim_text.toLowerCase().includes(q);
            const inProd = claim.product_name.toLowerCase().includes(q);
            const inBrand = claim.brand.toLowerCase().includes(q);
            const inCompany = product.company.toLowerCase().includes(q);
            const inBanned = reg?.banned_status.toLowerCase().includes(q) ?? false;
            const inActives = photoInfo.key_actives.some((a) => a.toLowerCase().includes(q));
            if (!inClaim && !inProd && !inBrand && !inCompany && !inBanned && !inActives) {
              return false;
            }
          }
          return true;
        });

        return {
          product,
          photoInfo,
          claims: matchingClaims,
        };
      })
      .filter((item) => item.claims.length > 0);
  }, [products, selectedBrand, selectedJurisdiction, searchQuery, sheetProducts]);

  // Flattened claims count
  const totalMatchingClaims = useMemo(() => {
    return filteredProducts.reduce((acc, p) => acc + p.claims.length, 0);
  }, [filteredProducts]);

  return (
    <div className="bg-[#3D2817]/50 border border-[#A87B4E]/30 rounded-2xl p-4 flex flex-col h-full shadow-lg">
      {/* Header with Title and Layout Toggle */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#A87B4E]/25">
        <div>
          <h3 className="font-bold text-sm text-[#FFFFFF] flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-[#A87B4E]" />
            <span>Product &amp; Claim Registry</span>
          </h3>
          <p className="text-xs text-[#F5F2EB]/70">
            {filteredProducts.length} Products · {totalMatchingClaims} Claims Indexed
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-[#2C3E50] p-0.5 rounded-xl border border-[#A87B4E]/30">
          <button
            onClick={() => setViewLayout('photos')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center space-x-1 ${
              viewLayout === 'photos'
                ? 'bg-[#A87B4E] text-[#FFFFFF] shadow-sm'
                : 'text-[#F5F2EB]/70 hover:text-[#FFFFFF]'
            }`}
            title="Browse by product photos (click photo to reveal claims)"
          >
            <ImageIcon className="w-3 h-3" />
            <span>Photos</span>
          </button>
          <button
            onClick={() => setViewLayout('list')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center space-x-1 ${
              viewLayout === 'list'
                ? 'bg-[#A87B4E] text-[#FFFFFF] shadow-sm'
                : 'text-[#F5F2EB]/70 hover:text-[#FFFFFF]'
            }`}
            title="Browse all claims as a flat list"
          >
            <List className="w-3 h-3" />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-2 mb-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#A87B4E] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search claim, brand, active..."
            className="w-full bg-[#2C3E50] text-[#F5F2EB] text-xs pl-8 pr-3 py-1.5 rounded-xl border border-[#A87B4E]/30 focus:border-[#A87B4E] focus:outline-none placeholder-[#F5F2EB]/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-[#2C3E50] text-[#F5F2EB] border border-[#A87B4E]/30 text-[11px] rounded-xl px-2 py-1.5 focus:border-[#A87B4E] focus:outline-none"
          >
            <option value="all">All Brands ({brands.length})</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={selectedJurisdiction}
            onChange={(e) => setSelectedJurisdiction(e.target.value)}
            className="bg-[#2C3E50] text-[#F5F2EB] border border-[#A87B4E]/30 text-[11px] rounded-xl px-2 py-1.5 focus:border-[#A87B4E] focus:outline-none"
          >
            <option value="all">All Markets</option>
            <option value="DE">Germany (DE)</option>
            <option value="FR">France (FR)</option>
            <option value="UK">United Kingdom (UK)</option>
            <option value="USA">United States (USA)</option>
            <option value="EU">European Union (EU-27)</option>
          </select>
        </div>
      </div>

      {/* Product & Claims Container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[300px] max-h-[700px]">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-[#F5F2EB]/60 text-xs">
            No products or claims matching your filter criteria.
          </div>
        ) : viewLayout === 'photos' ? (
          /* PRODUCT PHOTO ACCORDION VIEW: Click photo -> reveals claim cards under it */
          filteredProducts.map(({ product, photoInfo, claims }) => {
            const isExpanded = expandedSlugs.has(product.slug);
            const containsSelectedClaim = claims.some((c) => c.claim_id === selectedClaimId);

            return (
              <div
                key={product.slug}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  containsSelectedClaim
                    ? 'border-[#A87B4E] bg-[#3D2817]/70 shadow-md ring-1 ring-[#A87B4E]/60'
                    : 'border-[#A87B4E]/25 bg-[#2C3E50]/70 hover:border-[#A87B4E]/60'
                }`}
              >
                {/* Product Header / Photo Card */}
                <div
                  onClick={() => toggleExpand(product.slug)}
                  className="p-3 cursor-pointer flex items-center justify-between gap-3 select-none hover:bg-[#3D2817]/40 transition group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {/* Product Photo with hover zoom */}
                    <div className="relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gradient-to-b from-[#FFFFFF] to-[#F5F2EB] border border-[#A87B4E]/30 shadow group-hover:border-[#A87B4E] transition">
                      <ProductImage
                        src={photoInfo.image_url}
                        alt={product.brand_positioning || photoInfo.brand}
                        className="w-full h-full object-contain p-1.5 transform group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute bottom-0 right-0 bg-[#3D2817] text-[8px] font-mono text-[#F5F2EB] px-1 rounded-tl border-t border-l border-[#A87B4E]/30">
                        {claims.length}
                      </span>
                    </div>

                    {/* Product Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5 mb-0.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#A87B4E] truncate">
                          {photoInfo.brand}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#3D2817] text-[#F5F2EB] font-mono border border-[#A87B4E]/20">
                          {product.market.split('(')[0].trim()}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-[#FFFFFF] line-clamp-1 group-hover:text-[#F5F2EB] transition">
                        {photoInfo.product_name}
                      </h4>
                      <p className="text-[11px] text-[#F5F2EB]/70 line-clamp-1 mt-0.5">
                        {photoInfo.volume} · {photoInfo.key_actives.slice(0, 2).join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Arrow and Claims Indicator */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="hidden sm:inline-block text-[10px] font-semibold text-[#F5F2EB]/70 group-hover:text-[#FFFFFF]">
                      {claims.length} {claims.length === 1 ? 'claim' : 'claims'}
                    </span>
                    <div
                      className={`p-1 rounded-lg bg-[#3D2817] border border-[#A87B4E]/30 transition-transform ${
                        isExpanded ? 'rotate-180 text-[#A87B4E]' : 'text-[#F5F2EB]/70'
                      }`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* EXPANDED CLAIMS CONTAINER UNDER PRODUCT PHOTO */}
                {isExpanded && (
                  <div className="border-t border-[#A87B4E]/25 bg-[#3D2817]/40 p-2.5 space-y-2">
                    <div className="flex items-center justify-between px-1 mb-1 text-[10px] text-[#A87B4E] font-semibold uppercase tracking-wider">
                      <span className="flex items-center space-x-1">
                        <Layers className="w-3 h-3 text-[#A87B4E]" />
                        <span>Claims under this product</span>
                      </span>
                      <span className="text-[#F5F2EB]/60">Click to inspect</span>
                    </div>

                    {claims.map((claim) => {
                      const isSelected = claim.claim_id === selectedClaimId;

                      return (
                        <div
                          key={claim.claim_id}
                          onClick={() => onSelectClaim(claim.claim_id)}
                          className={`p-2.5 rounded-xl cursor-pointer transition-all border text-left relative ${
                            isSelected
                              ? 'bg-[#3D2817] border-[#A87B4E] text-[#FFFFFF] shadow ring-1 ring-[#A87B4E]'
                              : 'bg-[#2C3E50]/80 border-[#A87B4E]/20 text-[#F5F2EB] hover:bg-[#3D2817]/60 hover:border-[#A87B4E]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-[#A87B4E] font-bold">
                              {claim.claim_id}
                            </span>
                            <RegulatoryStatusBadge
                              claimId={claim.claim_id}
                              surfaceName="dossier_list"
                              size="xs"
                            />
                          </div>

                          <p className="text-[11px] font-medium leading-relaxed line-clamp-2">
                            &ldquo;{claim.claim_text}&rdquo;
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-[#F5F2EB]/60 pt-1.5 mt-1 border-t border-[#A87B4E]/20">
                            <span className="text-[9px] text-[#F5F2EB]/70 truncate max-w-[170px]">
                              {claim.claim_category.join(' · ')}
                            </span>
                            <div className="flex items-center space-x-1 text-[#A87B4E] font-semibold text-[10px]">
                              <span>Inspect Card</span>
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* FLAT LIST VIEW */
          filteredProducts.flatMap(({ product, photoInfo, claims }) =>
            claims.map((claim) => {
              const isSelected = claim.claim_id === selectedClaimId;

              return (
                <div
                  key={claim.claim_id}
                  onClick={() => onSelectClaim(claim.claim_id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border text-left relative flex items-start gap-3 ${
                    isSelected
                      ? 'bg-[#3D2817] border-[#A87B4E] shadow-md ring-1 ring-[#A87B4E]'
                      : 'bg-[#2C3E50]/70 border-[#A87B4E]/25 hover:bg-[#3D2817]/50 hover:border-[#A87B4E]/50'
                  }`}
                >
                  {/* Thumbnail Photo */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#FFFFFF] to-[#F5F2EB] border border-[#A87B4E]/30 overflow-hidden flex-shrink-0">
                    <ProductImage
                      src={photoInfo.image_url}
                      alt={claim.brand}
                      className="w-full h-full object-contain p-0.5"
                      loading="lazy"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#A87B4E] truncate max-w-[170px]">
                        {claim.brand}
                      </span>
                      <RegulatoryStatusBadge
                        claimId={claim.claim_id}
                        surfaceName="dossier_list"
                        size="xs"
                      />
                    </div>

                    <h4 className="text-xs font-semibold text-[#FFFFFF] line-clamp-1 mb-0.5">
                      {claim.product_name}
                    </h4>

                    <p className="text-[11px] text-[#F5F2EB] line-clamp-2 leading-relaxed mb-1.5">
                      &ldquo;{claim.claim_text}&rdquo;
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-[#F5F2EB]/60 pt-1 border-t border-[#A87B4E]/20">
                      <span className="font-mono text-[#F5F2EB]/70">{claim.jurisdiction}</span>
                      <div className="flex items-center space-x-1 text-[#A87B4E] font-medium">
                        <span>Audit File</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
};
