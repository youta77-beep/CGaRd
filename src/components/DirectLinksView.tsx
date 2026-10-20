import React, { useState } from 'react';
import { ProductRecord } from '../types/schema';
import { getProductPhoto } from '../data/productImages';
import {
  Globe2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Search,
  Filter,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface DirectLinksViewProps {
  products: ProductRecord[];
  onSelectProductClaim?: (claimId: string) => void;
}

export const DirectLinksView: React.FC<DirectLinksViewProps> = ({
  products,
  onSelectProductClaim,
}) => {
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const inCompany = p.company.toLowerCase().includes(q);
    const inBrand = (p.brand_positioning || '').toLowerCase().includes(q);
    const inClaims = p.claims.some((c) => (c.source_url || '').toLowerCase().includes(q));
    return inCompany || inBrand || inClaims;
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-[#3D2817]/60 border border-[#A87B4E]/30 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-[#A87B4E] font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <Globe2 className="w-4 h-4" />
            <span>Direct Product URLs &amp; Statutory Dossier Directory</span>
          </span>
          <h2 className="text-xl font-extrabold text-[#FFFFFF] mt-1">
            Verified Primary Source &amp; Live Packaging Links
          </h2>
          <p className="text-xs text-[#F5F2EB]/70 mt-1 max-w-2xl">
            Audit register linking each cosmetic and functional formulation to its direct official product
            page, statutory notification database, and peer-reviewed PubMed clinical trials.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#A87B4E] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by brand or URL..."
            className="w-full bg-[#2C3E50] text-xs text-[#F5F2EB] pl-9 pr-3 py-2 rounded-xl border border-[#A87B4E]/30 focus:border-[#A87B4E] focus:outline-none placeholder-[#F5F2EB]/40"
          />
        </div>
      </div>

      {/* Products Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((prod) => {
          const photo = getProductPhoto(prod.slug, prod.company);
          const firstClaim = prod.claims[0];
          const substantiationsWithLinks = prod.substantiation.filter((s) => s.data_source_url);

          return (
            <div
              key={prod.slug}
              className="bg-[#3D2817]/50 border border-[#A87B4E]/30 rounded-2xl p-5 shadow-xl space-y-4 hover:border-[#A87B4E]/60 transition"
            >
              {/* Product Header with Photo */}
              <div className="flex items-start space-x-3.5">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-b from-[#FFFFFF] to-[#F5F2EB] border border-[#A87B4E]/30 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
                  <img
                    src={photo.image_url}
                    alt={photo.product_name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#A87B4E]">
                    {photo.brand}
                  </span>
                  <h3 className="text-sm font-bold text-[#FFFFFF] leading-snug line-clamp-1">
                    {photo.product_name}
                  </h3>
                  <p className="text-xs text-[#F5F2EB]/70 mt-0.5">
                    {prod.market.split('(')[0].trim()} · {photo.volume}
                  </p>
                </div>
              </div>

              {/* Primary Live Product Page Link */}
              <div className="bg-[#2C3E50] p-3 rounded-xl border border-[#A87B4E]/25 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5F2EB]/70 block">
                  Official Live Product Page:
                </span>
                {firstClaim?.source_url ? (
                  <a
                    href={firstClaim.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-xs text-[#F5F2EB] hover:text-[#FFFFFF] bg-[#3D2817] hover:bg-[#A87B4E]/30 border border-[#A87B4E]/40 rounded-xl p-2.5 transition group"
                  >
                    <span className="truncate max-w-[85%] font-mono text-[11px]">
                      {firstClaim.source_url}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-[#A87B4E] flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                ) : (
                  <span className="text-xs text-[#A87B4E] italic">No public URL on file</span>
                )}
              </div>

              {/* Substantiation Evidence Links */}
              {substantiationsWithLinks.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5F2EB]/70 block">
                    Verified Statutory &amp; Clinical Sources ({substantiationsWithLinks.length}):
                  </span>
                  <div className="space-y-1">
                    {substantiationsWithLinks.slice(0, 3).map((sub) => (
                      <a
                        key={sub.registry_entry_id}
                        href={sub.data_source_url!}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between text-[11px] text-[#F5F2EB] hover:text-[#FFFFFF] bg-[#2C3E50]/70 hover:bg-[#3D2817] p-2 rounded-xl border border-[#A87B4E]/20 transition"
                      >
                        <span className="truncate max-w-[85%]">
                          {sub.registry_name || sub.substantiation_type}
                        </span>
                        <ExternalLink className="w-3 h-3 text-[#A87B4E] flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
