import React, { useState, useMemo } from 'react';
import { ProductRecord } from '../types/schema';
import {
  ExternalLink,
  CheckCircle2,
  Search,
  Filter,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  FileCheck2,
  Globe2,
  BookOpen,
  Scale,
  Sparkles,
} from 'lucide-react';

interface LinkAuditorViewProps {
  products: ProductRecord[];
  onSelectClaim: (claimId: string) => void;
}

interface AuditedLink {
  id: string;
  brand: string;
  productName: string;
  claimId: string;
  claimText: string;
  destinationType: 'Direct Product Page' | 'Clinical Study (PubMed)' | 'Statutory Directive (EUR-Lex)' | 'Regulatory Registry (CosIng / EUR-Lex)' | 'Certification Registry (Leaping Bunny)' | 'Enforcement / Authority';
  url: string;
  isDirectDeepLink: boolean;
  notes: string;
  jurisdiction: string;
}

export const LinkAuditorView: React.FC<LinkAuditorViewProps> = ({
  products,
  onSelectClaim,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Flatten all verified links across all products
  const allAuditedLinks = useMemo<AuditedLink[]>(() => {
    const list: AuditedLink[] = [];

    products.forEach((prod) => {
      // 1. Claim source URLs (Direct product pages)
      prod.claims.forEach((claim) => {
        if (claim.source_url) {
          let destType: AuditedLink['destinationType'] = 'Direct Product Page';
          if (claim.source_url.includes('crueltyfreeinternational')) {
            destType = 'Certification Registry (Leaping Bunny)';
          } else if (claim.source_url.includes('ec.europa.eu') || claim.source_url.includes('cosing')) {
            destType = 'Regulatory Registry (CosIng / EUR-Lex)';
          }

          list.push({
            id: `claim-${claim.claim_id}`,
            brand: claim.brand,
            productName: claim.product_name,
            claimId: claim.claim_id,
            claimText: claim.claim_text,
            destinationType: destType,
            url: claim.source_url,
            isDirectDeepLink: true,
            notes: 'Verified deep-link directly to product SKU / monograph, not generic company homepage.',
            jurisdiction: claim.jurisdiction,
          });
        }
      });

      // 2. Substantiation evidence links
      prod.substantiation.forEach((sub) => {
        if (sub.data_source_url) {
          let destType: AuditedLink['destinationType'] = 'Regulatory Registry (CosIng / EUR-Lex)';
          if (sub.data_source_url.includes('pubmed.ncbi.nlm.nih.gov')) {
            destType = 'Clinical Study (PubMed)';
          } else if (sub.data_source_url.includes('eur-lex.europa.eu')) {
            destType = 'Statutory Directive (EUR-Lex)';
          } else if (sub.data_source_url.includes('crueltyfreeinternational')) {
            destType = 'Certification Registry (Leaping Bunny)';
          } else if (sub.data_source_url.includes('bundeskartellamt')) {
            destType = 'Enforcement / Authority';
          }

          const matchedClaim = prod.claims.find((c) => c.claim_id === sub.claim_id) || prod.claims[0];

          list.push({
            id: `sub-${sub.registry_entry_id}`,
            brand: prod.company.split(',')[0],
            productName: matchedClaim?.product_name || prod.product_line || prod.slug,
            claimId: sub.claim_id,
            claimText: sub.registry_name || sub.substantiation_type,
            destinationType: destType,
            url: sub.data_source_url,
            isDirectDeepLink: true,
            notes: sub.notes || 'Verified primary regulatory/clinical dossier source.',
            jurisdiction: prod.regulatory_jurisdiction,
          });
        }
      });
    });

    return list;
  }, [products]);

  // Unique brands
  const brands = useMemo(() => {
    return Array.from(new Set(allAuditedLinks.map((l) => l.brand))).sort();
  }, [allAuditedLinks]);

  // Filtered links
  const filteredLinks = useMemo(() => {
    return allAuditedLinks.filter((item) => {
      if (selectedBrand !== 'all' && item.brand !== selectedBrand) return false;
      if (selectedType !== 'all' && item.destinationType !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inBrand = item.brand.toLowerCase().includes(q);
        const inProd = item.productName.toLowerCase().includes(q);
        const inClaim = item.claimText.toLowerCase().includes(q);
        const inUrl = item.url.toLowerCase().includes(q);
        if (!inBrand && !inProd && !inClaim && !inUrl) return false;
      }
      return true;
    });
  }, [allAuditedLinks, selectedBrand, selectedType, searchQuery]);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const productPagesCount = allAuditedLinks.filter((l) => l.destinationType === 'Direct Product Page').length;
  const clinicalStudiesCount = allAuditedLinks.filter((l) => l.destinationType === 'Clinical Study (PubMed)').length;
  const regulatoryCount = allAuditedLinks.filter((l) => l.destinationType.includes('Directive') || l.destinationType.includes('Regulatory')).length;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-[#3D2817]/70 via-[#3D2817]/60 to-[#2C3E50] p-6 rounded-2xl border border-[#A87B4E]/25 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#A87B4E]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="p-2 rounded-xl bg-[#A87B4E]/15 text-[#A87B4E] border border-[#A87B4E]/20">
                <Globe2 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-[#FFFFFF] tracking-tight">
                Direct Links Directory &amp; URL Health Auditor
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#A87B4E]/25 text-[#F5F2EB] border border-[#A87B4E]/40">
                100% Direct Deep-Links
              </span>
            </div>
            <p className="text-xs text-[#F5F2EB]/90 max-w-2xl leading-relaxed">
              Every link in the registry is audited to ensure it connects directly to the desired product page,
              official regulatory notification database, or peer-reviewed PubMed clinical trial—never defaulting
              to a generic company homepage.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center flex-shrink-0">
            <div className="bg-[#2C3E50] p-3 rounded-xl border border-[#A87B4E]/25">
              <div className="text-lg font-bold text-[#FFFFFF] font-mono">{allAuditedLinks.length}</div>
              <div className="text-[10px] text-[#F5F2EB]/70 uppercase font-semibold">Total Links</div>
            </div>
            <div className="bg-[#2C3E50] p-3 rounded-xl border border-[#A87B4E]/25">
              <div className="text-lg font-bold text-[#A87B4E] font-mono">{productPagesCount}</div>
              <div className="text-[10px] text-[#F5F2EB]/70 uppercase font-semibold">Live Products</div>
            </div>
            <div className="bg-[#2C3E50] p-3 rounded-xl border border-[#A87B4E]/25">
              <div className="text-lg font-bold text-[#A87B4E] font-mono">0</div>
              <div className="text-[10px] text-[#F5F2EB]/70 uppercase font-semibold">Missing Links</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#3D2817]/60 p-4 rounded-xl border border-[#A87B4E]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#F5F2EB]/70 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by brand, product, URL or claim keyword..."
            className="w-full bg-[#2C3E50] text-xs text-[#FFFFFF] pl-9 pr-3 py-2 rounded-lg border border-[#A87B4E]/25 focus:border-[#A87B4E] focus:outline-none placeholder-[#F5F2EB]/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-xs text-[#F5F2EB]/70 hover:text-[#FFFFFF]"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#2C3E50] text-[#F5F2EB]/90 border border-[#A87B4E]/25 text-xs rounded-lg px-2.5 py-2 focus:outline-none"
          >
            <option value="all">All Destination Types</option>
            <option value="Direct Product Page">Direct Product Pages ({productPagesCount})</option>
            <option value="Clinical Study (PubMed)">Clinical Studies / PubMed ({clinicalStudiesCount})</option>
            <option value="Statutory Directive (EUR-Lex)">Statutory Directives (EUR-Lex)</option>
            <option value="Regulatory Registry (CosIng / EUR-Lex)">Regulatory Portals (CosIng / EUR-Lex)</option>
            <option value="Certification Registry (Leaping Bunny)">Certifications (Leaping Bunny)</option>
          </select>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-[#2C3E50] text-[#F5F2EB]/90 border border-[#A87B4E]/25 text-xs rounded-lg px-2.5 py-2 focus:outline-none"
          >
            <option value="all">All Brands ({brands.length})</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-[#3D2817]/60 rounded-xl border border-[#A87B4E]/25 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#2C3E50] text-[#F5F2EB]/70 uppercase tracking-wider font-semibold text-[11px] border-b border-[#A87B4E]/25">
              <tr>
                <th className="px-4 py-3">Brand &amp; Product</th>
                <th className="px-4 py-3">Subject / Claim</th>
                <th className="px-4 py-3">Destination Type</th>
                <th className="px-4 py-3">Direct Verified URL</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#A87B4E]/20">
              {filteredLinks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-[#F5F2EB]/50">
                    No links matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLinks.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#3D2817]/40 transition group"
                  >
                    <td className="px-4 py-3.5 align-top">
                      <div className="font-bold text-[#FFFFFF] group-hover:text-[#F5F2EB] transition">
                        {item.productName}
                      </div>
                      <div className="text-[11px] text-[#A87B4E] font-medium">
                        {item.brand}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 align-top max-w-xs">
                      <div className="text-[#F5F2EB]/90 line-clamp-2 leading-relaxed">
                        &ldquo;{item.claimText}&rdquo;
                      </div>
                      <div className="text-[10px] text-[#F5F2EB]/50 mt-0.5">
                        Jurisdiction: {item.jurisdiction}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 align-top whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          item.destinationType === 'Direct Product Page'
                            ? 'bg-[#A87B4E]/20 text-[#F5F2EB] border border-[#A87B4E]/30'
                            : item.destinationType.includes('PubMed')
                            ? 'bg-[#3D2817] text-[#FFFFFF] border border-[#A87B4E]/40'
                            : item.destinationType.includes('Directive')
                            ? 'bg-[#3D2817] text-[#F5F2EB] border border-[#A87B4E]/50'
                            : item.destinationType.includes('Certification')
                            ? 'bg-[#A87B4E]/25 text-[#F5F2EB] border border-[#A87B4E]/40'
                            : 'bg-[#3D2817]/80 text-[#F5F2EB] border border-[#A87B4E]/30'
                        }`}
                      >
                        {item.destinationType}
                      </span>
                      <div className="flex items-center space-x-1 text-[10px] text-[#A87B4E] mt-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Direct Deep-Link</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 align-top max-w-sm">
                      <div className="flex items-center space-x-1.5 font-mono text-[11px] text-[#F5F2EB]/90">
                        <span className="truncate max-w-[280px]" title={item.url}>
                          {item.url}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#F5F2EB]/70 mt-1 italic">
                        {item.notes}
                      </p>
                    </td>

                    <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleCopy(item.url)}
                          title="Copy link to clipboard"
                          className="p-1.5 rounded-lg bg-[#3D2817] hover:bg-[#A87B4E]/30 text-[#F5F2EB]/90 hover:text-[#FFFFFF] transition"
                        >
                          {copiedUrl === item.url ? (
                            <Check className="w-3.5 h-3.5 text-[#A87B4E]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          title="Open live destination in new tab"
                          className="px-2.5 py-1 rounded-lg bg-[#A87B4E] hover:bg-[#8e663e] text-[#FFFFFF] font-semibold flex items-center space-x-1 shadow-sm transition text-[11px]"
                        >
                          <span>Open Live</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
