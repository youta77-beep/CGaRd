import React, { useState } from 'react';
import {
  AuditCard,
  RegulatoryAuditBlock,
  SubstantiationEntryBlock,
  ProductRecord,
} from '../types/schema';
import { getProductPhoto } from '../data/productImages';
import { JURISDICTION_COMPARISON_RECORDS } from '../data/regulatoryProvisions';
import { toJson, toMarkdown } from '../engine/cardBuilder';
import { ClaimCardStandard } from './ClaimCardStandard';
import { RegulatoryStatusBadge } from './RegulatoryStatusBadge';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Scale,
  FileText,
  ExternalLink,
  History,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Code2,
  FileCode,
  Sparkles,
  Sun,
  Moon,
  Layers,
  FileSpreadsheet,
  ListTodo,
  Lightbulb,
  AlertOctagon,
  HelpCircle,
  Compass,
  ZoomIn,
  Eye,
  X,
  ChevronRight,
} from 'lucide-react';

interface AuditCardViewProps {
  card: AuditCard;
  isExternalMode: boolean;
  onSelectClaim?: (claimId: string) => void;
  allProducts?: ProductRecord[];
  deletedProvenanceFields?: string[];
  onToggleDeleteProvenance?: (fieldKey: string) => void;
  onResetDeletedProvenance?: () => void;
  onStoreMutated?: () => void;
  isDeveloperMode?: boolean;
}

export const AuditCardView: React.FC<AuditCardViewProps> = ({
  card,
  isExternalMode,
  onSelectClaim,
  allProducts,
  deletedProvenanceFields = [],
  onToggleDeleteProvenance,
  onResetDeletedProvenance,
  onStoreMutated,
  isDeveloperMode = false,
}) => {
  const [viewMode, setViewMode] = useState<
    'executive' | 'gaps' | 'strategic' | 'dossier' | 'markdown' | 'json'
  >('executive');
  const [paperTheme, setPaperTheme] = useState<'paper' | 'dark'>('paper');
  const [copied, setCopied] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);

  const photoInfo = getProductPhoto(card.product_metadata?.slug, card.brand);
  const currentProduct = allProducts?.find(
    (p) => p.slug === card.product_metadata?.slug || p.claims.some((c) => c.claim_id === card.claim_id)
  );
  const siblingClaims = currentProduct?.claims || [];

  const toggleTask = (index: number) => {
    const key = `${card.claim_id}_task_${index}`;
    setCheckedTasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRouteBadge = (route: string) => {
    switch (route) {
      case 'AUTO_PASS':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#A87B4E]/15 text-[#A87B4E] border border-[#A87B4E]/30">
            <CheckCircle2 className="w-3 h-3 mr-1 text-[#A87B4E]" />
            AUTO_PASS (≥0.85)
          </span>
        );
      case 'RENDER_WITH_CAVEAT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#A87B4E]/15 text-[#A87B4E] border border-[#A87B4E]/40">
            <AlertTriangle className="w-3 h-3 mr-1 text-[#A87B4E]" />
            RENDER_WITH_CAVEAT (≥0.60)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#3D2817] text-[#A87B4E] border border-[#A87B4E]">
            <XCircle className="w-3 h-3 mr-1 text-[#A87B4E]" />
            HUMAN_REVIEW (&lt;0.60)
          </span>
        );
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'HIGH':
        return <span className="text-[11px] font-bold text-[#A87B4E]">HIGH</span>;
      case 'MEDIUM':
        return <span className="text-[11px] font-bold text-[#A87B4E]">MEDIUM</span>;
      case 'LOW':
        return <span className="text-[11px] font-bold text-orange-400">LOW</span>;
      case 'CRITICAL':
        return <span className="text-[11px] font-bold text-[#A87B4E] animate-pulse">CRITICAL</span>;
      default:
        return <span className="text-[11px] font-bold text-[#F5F2EB]/70">UNVERIFIED</span>;
    }
  };

  const exec = card.executive_summary;
  const meta = card.product_metadata;
  const breakdown = card.field_status_breakdown;

  return (
    <div className="bg-[#3D2817]/60 border border-[#A87B4E]/25 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      {/* Top Toolbar: View Switchers & Copy */}
      <div className="bg-[#3D2817] px-6 py-3.5 border-b border-[#A87B4E]/25 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div
            onClick={() => setIsPhotoZoomed(true)}
            className="w-8 h-8 rounded-lg bg-white/10 border border-[#A87B4E]/30 overflow-hidden flex-shrink-0 cursor-pointer hover:border-[#A87B4E] hover:scale-105 transition shadow-sm"
            title="Click to view full packaging photo"
          >
            <img
              src={photoInfo.image_url}
              alt={card.brand}
              className="w-full h-full object-contain p-0.5"
            />
          </div>
          <span className="text-xs font-mono text-[#A87B4E] font-semibold bg-[#3D2817] px-2 py-0.5 rounded border border-[#A87B4E]/30">
            {card.claim_id}
          </span>
          <span className="text-xs text-[#F5F2EB]/70">
            Market: <strong className="text-[#F5F2EB]">{card.jurisdiction}</strong>
          </span>
          {meta?.product_line && (
            <span className="hidden sm:inline-block text-xs text-[#F5F2EB]/70">
              · Line: <span className="text-[#F5F2EB]/90">{meta.product_line.split(' - ')[0]}</span>
            </span>
          )}
        </div>

        {/* View Switchers */}
        <div className="flex items-center space-x-2">
          {/* Card View Mode Tabs */}
          <div className="bg-[#3D2817]/60 rounded-lg p-0.5 border border-[#A87B4E]/25 flex flex-wrap">
            <button
              onClick={() => setViewMode('executive')}
              className={`px-3 py-1 rounded text-xs font-semibold transition flex items-center space-x-1.5 ${
                viewMode === 'executive'
                  ? 'bg-[#A87B4E] text-white shadow'
                  : 'text-[#F5F2EB]/70 hover:text-[#F5F2EB]'
              }`}
              title="Official 5-row output card format matching reference specification"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Output Card</span>
            </button>
            <button
              onClick={() => setViewMode('gaps')}
              className={`px-3 py-1 rounded text-xs font-semibold transition flex items-center space-x-1.5 ${
                viewMode === 'gaps'
                  ? 'bg-[#A87B4E] text-white shadow'
                  : 'text-[#F5F2EB]/70 hover:text-[#F5F2EB]'
              }`}
              title="Audit of TO_COLLECT vs POPULATED fields and collection checklist"
            >
              <ListTodo className="w-3.5 h-3.5 text-[#A87B4E]" />
              <span>Field Audit &amp; Gaps</span>
              {breakdown.to_collect > 0 && (
                <span className="ml-1 text-[10px] px-1 py-0.1 bg-[#A87B4E]/25 text-[#F5F2EB] rounded font-mono">
                  {breakdown.to_collect}
                </span>
              )}
            </button>
            <button
              onClick={() => setViewMode('strategic')}
              className={`px-3 py-1 rounded text-xs font-semibold transition flex items-center space-x-1.5 ${
                viewMode === 'strategic'
                  ? 'bg-[#A87B4E] text-white shadow'
                  : 'text-[#F5F2EB]/70 hover:text-[#F5F2EB]'
              }`}
              title="Strategic positioning and regulatory arbitrage analysis from PDF registry"
            >
              <Lightbulb className="w-3.5 h-3.5 text-[#A87B4E]" />
              <span>Strategic Analysis</span>
            </button>
            <button
              onClick={() => setViewMode('dossier')}
              className={`px-3 py-1 rounded text-xs font-semibold transition flex items-center space-x-1.5 ${
                viewMode === 'dossier'
                  ? 'bg-[#A87B4E] text-white shadow'
                  : 'text-[#F5F2EB]/70 hover:text-[#F5F2EB]'
              }`}
              title="Full 6-layer legal dossier with all raw evidence records"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Full 6-Layer Dossier</span>
            </button>
            <button
              onClick={() => setViewMode('markdown')}
              className={`px-2 py-1 rounded text-xs font-medium transition flex items-center space-x-1 ${
                viewMode === 'markdown'
                  ? 'bg-[#A87B4E] text-white shadow'
                  : 'text-[#F5F2EB]/70 hover:text-[#F5F2EB]'
              }`}
            >
              <FileCode className="w-3 h-3" />
              <span>MD</span>
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-2 py-1 rounded text-xs font-medium transition flex items-center space-x-1 ${
                viewMode === 'json'
                  ? 'bg-[#A87B4E] text-white shadow'
                  : 'text-[#F5F2EB]/70 hover:text-[#F5F2EB]'
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>JSON</span>
            </button>
          </div>

          {/* Theme Switcher for Paper Card */}
          {viewMode === 'executive' && (
            <button
              onClick={() => setPaperTheme((prev) => (prev === 'paper' ? 'dark' : 'paper'))}
              className="p-1.5 rounded-lg bg-[#3D2817] hover:bg-[#3D2817]/80 text-[#F5F2EB]/90 border border-[#A87B4E]/30 text-xs transition"
              title="Toggle White Paper vs Dark mode for card presentation"
            >
              {paperTheme === 'paper' ? (
                <Moon className="w-3.5 h-3.5 text-[#F5F2EB]" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-[#F5F2EB]" />
              )}
            </button>
          )}

          <button
            onClick={() =>
              handleCopy(
                viewMode === 'json'
                  ? toJson(card)
                  : toMarkdown(card)
              )
            }
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#3D2817] hover:bg-[#3D2817]/80 text-[#F5F2EB]/90 border border-[#A87B4E]/30 text-xs transition"
            title="Copy card content"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#A87B4E]" />
                <span className="text-[#A87B4E]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* VIEW 1: THE EXACT OUTPUT CARD WITH PRODUCT PHOTO DISPLAYED NEXT TO IT */}
      {viewMode === 'executive' && (
        <div className="p-4 md:p-6 lg:p-8 bg-[#2C3E50] flex flex-col items-center w-full">
          <div className="w-full max-w-6xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#F5F2EB]/90 uppercase tracking-wider flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-[#A87B4E]" />
                <span>What the output looks like</span>
              </span>
              <span className="text-xs text-[#F5F2EB]/50 font-mono">
                Product Packaging &amp; Regulatory Reference Card
              </span>
            </div>

            {/* SPLIT LAYOUT: PRODUCT PHOTO NEXT TO CLAIM CARD */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: PRODUCT PHOTO & PACKAGING PROFILE CARD (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-[#3D2817]/60 border border-[#A87B4E]/25 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded bg-[#3D2817] border border-[#A87B4E]/40 text-[#F5F2EB]">
                      {photoInfo.brand}
                    </span>
                    <span className="text-[10px] font-mono text-[#F5F2EB]/70 font-semibold">
                      {photoInfo.volume}
                    </span>
                  </div>

                  {/* High-Resolution Studio Product Photo (Full Uncropped View) */}
                  <div
                    onClick={() => setIsPhotoZoomed(true)}
                    className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-[#FFFFFF] via-[#F5F2EB] to-[#F5F2EB] border border-[#A87B4E]/30 cursor-pointer shadow-inner flex items-center justify-center group/img"
                    title="Click to view full packaging photo"
                  >
                    <img
                      src={photoInfo.image_url}
                      alt={photoInfo.product_name}
                      className="w-full h-full object-contain p-6 sm:p-8 transform group-hover/img:scale-[1.02] transition-transform duration-300 select-none drop-shadow-xl"
                    />
                    <div className="absolute inset-0 bg-[#2C3E50] opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-full bg-[#3D2817]/60/95 border border-[#A87B4E]/60 text-[#F5F2EB] text-xs font-semibold flex items-center space-x-1.5 shadow-lg backdrop-blur-sm">
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>Enlarge Packaging</span>
                      </span>
                    </div>
                  </div>

                  {/* Bottle specifications and notified actives */}
                  <div className="mt-4 space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {photoInfo.product_name}
                      </h4>
                      <p className="text-xs text-[#F5F2EB]/70 mt-0.5">
                        {photoInfo.packaging_type}
                      </p>
                    </div>

                    {/* Notified Active Ingredients Pills */}
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#F5F2EB]/70 block mb-1.5">
                        Notified Active Ingredients:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {photoInfo.key_actives.map((act) => (
                          <span
                            key={act}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#3D2817] text-[#F5F2EB] border border-[#A87B4E]/30"
                          >
                            {act}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Live Official Product Link */}
                    {card.source_url && (
                      <a
                        href={card.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-[#3D2817] hover:bg-[#A87B4E]/30 border border-[#A87B4E]/30 text-[#F5F2EB] hover:text-[#F5F2EB] text-xs font-semibold transition group shadow-sm"
                      >
                        <span>Open Live Product Page</span>
                        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    )}

                    {/* ALL CLAIMS UNDER THIS PRODUCT (Click photo / claims under it) */}
                    {siblingClaims.length > 0 && (
                      <div className="pt-3 border-t border-[#A87B4E]/25">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#F5F2EB]/70">
                            Claims on this bottle ({siblingClaims.length}):
                          </span>
                          <span className="text-[10px] text-[#A87B4E] font-medium">Click to switch</span>
                        </div>
                        <div className="space-y-1.5">
                          {siblingClaims.map((c) => {
                            const isCurrent = c.claim_id === card.claim_id;
                            return (
                              <button
                                key={c.claim_id}
                                onClick={() => onSelectClaim?.(c.claim_id)}
                                className={`w-full text-left p-2.5 rounded-xl text-xs transition border flex items-center justify-between gap-2 ${
                                  isCurrent
                                    ? 'bg-[#3D2817] border-[#A87B4E] text-white shadow ring-1 ring-[#A87B4E]/50'
                                    : 'bg-[#2C3E50] border-[#A87B4E]/25 text-[#F5F2EB]/70 hover:bg-[#3D2817]/60 hover:text-[#F5F2EB]'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between mb-1 gap-2">
                                    <span className="font-mono text-[10px] text-[#A87B4E] font-semibold">
                                      {c.claim_id}
                                    </span>
                                    <RegulatoryStatusBadge
                                      claimId={c.claim_id}
                                      surfaceName="product_strip"
                                      size="xs"
                                      onStoreMutated={onStoreMutated}
                                    />
                                  </div>
                                  <p className="line-clamp-2 text-[11px] leading-relaxed">
                                    &ldquo;{c.claim_text}&rdquo;
                                  </p>
                                </div>
                                <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isCurrent ? 'text-[#A87B4E]' : 'text-[#A87B4E]/40'}`} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: THE EXACT 5-ROW REFERENCE CARD (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* THE CARD ITSELF (Issue 1 Standard with Complete Provenance Dossier) */}
                <ClaimCardStandard
                  card={card}
                  paperTheme={paperTheme}
                  onSelectClaim={onSelectClaim}
                  deletedProvenanceFields={deletedProvenanceFields}
                  onToggleDeleteProvenance={onToggleDeleteProvenance}
                  onResetDeletedProvenance={onResetDeletedProvenance}
                  onStoreMutated={onStoreMutated}
                  showTestToolbar={isDeveloperMode}
                />

                {/* Quick Actions to explore related tabs */}
                <div className="pt-4 flex flex-wrap items-center justify-between border-t border-[#A87B4E]/25 text-xs gap-2">
                  <button
                    onClick={() => setViewMode('gaps')}
                    className="text-[#A87B4E] hover:text-[#F5F2EB] font-semibold inline-flex items-center space-x-1"
                  >
                    <span>Inspect Field Status &amp; Missing Data Checklist</span>
                    <span>&rarr;</span>
                  </button>
                  <button
                    onClick={() => setViewMode('strategic')}
                    className="text-[#A87B4E] hover:text-[#F5F2EB] font-semibold inline-flex items-center space-x-1"
                  >
                    <span>Read Strategic Regulatory Positioning Analysis</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MISSING DATA & CHECKLIST AUDIT (Addresses user's note about missing information) */}
      {viewMode === 'gaps' && (
        <div className="p-6 space-y-6 overflow-y-auto max-h-[750px] bg-[#2C3E50]">
          <div className="bg-[#3D2817]/60 border border-[#A87B4E]/25 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#A87B4E] flex items-center space-x-1.5">
                  <ListTodo className="w-4 h-4" />
                  <span>Field Audit &amp; Data Completeness Tracker</span>
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Missing &amp; Uncollected Registry Information
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-xl bg-[#2C3E50] border border-[#A87B4E]/25 text-xs font-mono font-bold text-[#F5F2EB]">
                  {breakdown.completeness_percent}% Field Completeness
                </span>
              </div>
            </div>

            {/* Explanation of the status legend from PDF */}
            <div className="p-4 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/25 text-xs space-y-2">
              <span className="font-semibold text-[#F5F2EB]/90">Status Legend from Registry Specification:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                <div className="p-2 rounded bg-[#A87B4E]/25 border border-[#A87B4E]/40 text-[#F5F2EB]">
                  <span className="font-bold">POPULATED ({breakdown.populated})</span>
                  <p className="text-[11px] text-[#F5F2EB]/70 mt-0.5">Verified from primary statutory/dossier source.</p>
                </div>
                <div className="p-2 rounded bg-[#3D2817] border border-[#A87B4E]/40 text-[#F5F2EB]">
                  <span className="font-bold">TO_COLLECT ({breakdown.to_collect})</span>
                  <p className="text-[11px] text-[#F5F2EB]/70 mt-0.5">Requires automated crawl, CPNP, or direct inquiry.</p>
                </div>
                <div className="p-2 rounded bg-[#3D2817] border border-[#A87B4E]/60 text-[#F5F2EB]">
                  <span className="font-bold">UNKNOWN ({breakdown.unknown})</span>
                  <p className="text-[11px] text-[#F5F2EB]/70 mt-0.5">Lookup completed; data withheld or non-public.</p>
                </div>
                <div className="p-2 rounded bg-[#2C3E50] border border-[#A87B4E]/30 text-[#F5F2EB]/90">
                  <span className="font-bold">WAIVED / N/A</span>
                  <p className="text-[11px] text-[#F5F2EB]/70 mt-0.5">Waived by compliance monograph recipe.</p>
                </div>
              </div>
            </div>

            {/* The Compliance Rule on Missing Data */}
            <div className="p-3 bg-[#3D2817]/60 border border-[#A87B4E]/40 rounded-xl text-xs text-[#F5F2EB] flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#A87B4E] flex-shrink-0 mt-0.5" />
              <div>
                <strong>Strict External Card Suppression Rule:</strong> In production, any field marked{' '}
                <code className="font-mono bg-[#2C3E50] border border-[#A87B4E]/30 px-1 py-0.5 rounded text-[#F5F2EB]">TO_COLLECT</code> or{' '}
                <code className="font-mono bg-[#2C3E50] border border-[#A87B4E]/30 px-1 py-0.5 rounded text-[#F5F2EB]">UNKNOWN</code> is
                prohibited from rendering on public consumer cards until authenticated by primary source evidence.
              </div>
            </div>

            {/* Proprietary Gap Analysis */}
            {meta?.proprietary_substantiation_gap && (
              <div className="p-4 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/25 space-y-1.5 text-xs">
                <span className="font-bold text-[#A87B4E] uppercase tracking-wider text-[11px]">
                  Proprietary Substantiation Gap Analysis:
                </span>
                <p className="text-[#F5F2EB]/90 leading-relaxed">{meta.proprietary_substantiation_gap}</p>
              </div>
            )}

            {/* Interactive Data Collection Checklist */}
            {meta?.data_collection_checklist && meta.data_collection_checklist.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F2EB]/90 flex items-center space-x-2">
                  <ListTodo className="w-4 h-4 text-[#A87B4E]" />
                  <span>Next Steps for Data Population Checklist ({meta.data_collection_checklist.length} Tasks)</span>
                </h4>

                <div className="space-y-2">
                  {meta.data_collection_checklist.map((task, idx) => {
                    const isChecked = !!checkedTasks[`${card.claim_id}_task_${idx}`];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleTask(idx)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start space-x-3 ${
                          isChecked
                            ? 'bg-[#3D2817] border-[#A87B4E]/40 text-[#F5F2EB] line-through opacity-70'
                            : 'bg-[#2C3E50] border-[#A87B4E]/25 text-[#F5F2EB] hover:border-[#A87B4E]/30'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded border-[#A87B4E]/30 text-[#A87B4E] focus:ring-[#A87B4E] bg-[#3D2817]/60 cursor-pointer"
                        />
                        <span className="flex-1 leading-relaxed">{task}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: STRATEGIC ANALYSIS & REGULATORY COMPLEXITY */}
      {viewMode === 'strategic' && (
        <div className="p-6 space-y-6 overflow-y-auto max-h-[750px] bg-[#2C3E50]">
          <div className="bg-[#3D2817]/60 border border-[#A87B4E]/25 rounded-2xl p-6 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#A87B4E] flex items-center space-x-1.5">
                <Compass className="w-4 h-4" />
                <span>Multi-Claim Structure &amp; Regulatory Complexity Analysis</span>
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                Strategic Regulatory Analysis for {card.brand}
              </h3>
            </div>

            {meta?.critical_notes && (
              <div className="p-4 bg-[#3D2817] border border-[#A87B4E]/40 rounded-xl text-xs text-[#F5F2EB] space-y-1">
                <strong className="text-[#F5F2EB] font-bold uppercase text-[11px] block">
                  Critical Registry Note:
                </strong>
                <p className="leading-relaxed">{meta.critical_notes}</p>
              </div>
            )}

            {meta?.strategic_positioning_analysis && (
              <div className="p-4 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/25 space-y-2 text-xs">
                <strong className="text-[#A87B4E] font-bold uppercase text-[11px] block">
                  Strategic Positioning &amp; Regulatory Arbitrage:
                </strong>
                <p className="text-[#F5F2EB]/90 leading-relaxed">{meta.strategic_positioning_analysis}</p>
              </div>
            )}

            {/* Jurisdiction Comparison Breakdown - Dynamically rendered from data records */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {JURISDICTION_COMPARISON_RECORDS.map((comp) => (
                <div key={comp.id} className="p-4 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/25 text-xs space-y-2">
                  <span className="font-bold text-white block">{comp.title}</span>
                  <p className="text-[#F5F2EB]/70 leading-relaxed">
                    {comp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: THE FULL 6-LAYER LEGAL DOSSIER */}
      {viewMode === 'dossier' && (
        <div className="p-6 space-y-6 overflow-y-auto max-h-[750px]">
          {/* Header Block: Claim Statement & Product Identity */}
          <div className="bg-[#2C3E50] p-5 rounded-xl border border-[#A87B4E]/25">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#A87B4E]">
                {card.brand}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {card.claim_category.map((cat) => (
                  <span
                    key={cat}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#3D2817] text-[#F5F2EB]/90 border border-[#A87B4E]/30"
                  >
                    {cat.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            <h2 className="text-lg font-bold text-white mb-2">{card.product_name}</h2>

            <div className="p-3.5 bg-[#3D2817]/60 rounded-lg border border-[#A87B4E]/25/90 text-[#FFFFFF] font-medium text-sm leading-relaxed mb-3">
              &ldquo;{card.claim_text}&rdquo;
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#F5F2EB]/70">
              <div>
                <span className="text-[#F5F2EB]/50 font-medium">Context: </span>
                <span className="text-[#F5F2EB]/90">{card.claim_context || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#F5F2EB]/50 font-medium">Source Evidence: </span>
                {card.source_url ? (
                  <a
                    href={card.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#A87B4E] hover:underline inline-flex items-center space-x-1 truncate max-w-[260px]"
                  >
                    <span className="truncate">{card.source_url}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                ) : (
                  <span className="text-[#F5F2EB]/50 italic">None provided</span>
                )}
              </div>
            </div>
          </div>

          {/* LAYER 2: Regulatory Status Audit */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F2EB]/70 flex items-center space-x-2">
                <Scale className="w-4 h-4 text-[#A87B4E]" />
                <span>Layer 2 · Regulatory Audit &amp; Legal Compliance</span>
              </h3>
              <span className="text-[11px] text-[#F5F2EB]/50">Statutory Enforcement Rules</span>
            </div>

            {card.regulatory_audit.length === 0 ? (
              <div className="p-4 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/20 text-xs text-[#F5F2EB]/70 italic">
                No active regulatory restrictions recorded for this specific claim.
              </div>
            ) : (
              <div className="space-y-3">
                {card.regulatory_audit.map((reg, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/25 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <RegulatoryStatusBadge
                          claimId={card.claim_id}
                          surfaceName="regulatory_audit"
                          size="sm"
                          onStoreMutated={onStoreMutated}
                        />
                        <span className="text-xs font-medium text-[#F5F2EB]/90">
                          under <strong className="text-white">{reg.banned_under || 'General Consumer Law'}</strong>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getRouteBadge(reg.route)}
                        <span className="text-xs font-mono text-[#F5F2EB]/70">
                          Match: {(reg.match_confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {reg.exception_text && (
                      <div className="p-3 bg-[#3D2817] border border-[#A87B4E]/40 rounded-lg text-xs text-[#F5F2EB]/90 leading-relaxed">
                        <strong className="text-[#F5F2EB] font-semibold">Regulatory Exception / Condition: </strong>
                        {reg.exception_text}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between text-xs text-[#F5F2EB]/70 pt-1 border-t border-[#A87B4E]/20">
                      <span>
                        Jurisdiction: <strong className="text-[#F5F2EB]/90">{reg.jurisdiction}</strong>
                      </span>
                      {reg.fine_ceiling_percent && (
                        <span className="text-[#A87B4E] font-semibold">
                          Max Fine Ceiling: {reg.fine_ceiling_percent}% of global turnover
                        </span>
                      )}
                      {reg.effective_date && (
                        <span>
                          Effective Date: <strong className="text-[#F5F2EB]/90 font-mono">{reg.effective_date}</strong>
                        </span>
                      )}
                    </div>

                    {reg.notes && (
                      <p className="text-xs text-[#F5F2EB]/70 italic bg-[#3D2817]/60 p-2 rounded border border-[#A87B4E]/15">
                        {reg.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* LAYER 3: Substantiation Matrix */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F2EB]/70 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#A87B4E]" />
                <span>Layer 3 · Evidential Substantiation Matrix</span>
              </h3>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-[#F5F2EB]/70 font-medium">Arithmetic Verification:</span>
                <span className="px-2 py-0.5 rounded font-mono font-bold bg-[#A87B4E]/15 text-[#F5F2EB] border border-[#A87B4E]/30">
                  {card.substantiation.verified_count} of {card.substantiation.total_count} Verified (
                  {Math.round(card.substantiation.completeness * 100)}%)
                </span>
              </div>
            </div>

            {/* Completeness progress bar */}
            <div className="w-full bg-[#2C3E50] rounded-full h-2 overflow-hidden border border-[#A87B4E]/25">
              <div
                className="h-full bg-[#A87B4E] transition-all duration-500"
                style={{ width: `${Math.round(card.substantiation.completeness * 100)}%` }}
              />
            </div>

            {card.substantiation.entries.length === 0 ? (
              <div className="p-4 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/20 text-xs text-[#F5F2EB]/70 italic">
                {isExternalMode
                  ? 'All pending substantiation entries are hidden under external rendering rules.'
                  : 'No substantiation files recorded.'}
              </div>
            ) : (
              <div className="space-y-2">
                {card.substantiation.entries.map((entry) => (
                  <div
                    key={entry.registry_entry_id}
                    className="p-3 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/25 hover:border-[#A87B4E]/30 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center space-x-2">
                        <code className="text-[11px] font-mono text-[#F5F2EB] bg-[#3D2817] px-1.5 py-0.5 rounded border border-[#A87B4E]/30">
                          {entry.registry_entry_id}
                        </code>
                        <span className="text-xs font-semibold text-white">
                          {entry.substantiation_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getRouteBadge(entry.route)}
                        <span className="text-xs">
                          Conf: {getConfidenceBadge(entry.confidence_level)}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-[#F5F2EB]/90 mb-1">
                      {entry.registry_name && (
                        <span>
                          <strong>Registry/Active: </strong> {entry.registry_name}
                        </span>
                      )}
                      {entry.entry_status && (
                        <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] uppercase font-mono bg-[#3D2817] text-[#F5F2EB]/90 border border-[#A87B4E]/30">
                          Status: {entry.entry_status}
                        </span>
                      )}
                    </div>

                    {entry.notes && (
                      <p className="text-xs text-[#F5F2EB]/70 italic mb-1">{entry.notes}</p>
                    )}

                    {entry.data_source_url && (
                      <a
                        href={entry.data_source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#A87B4E] hover:underline inline-flex items-center space-x-1"
                      >
                        <span>Evidence Dossier Link</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* LAYER 4: Regulatory Enforcement History */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F2EB]/70 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-[#A87B4E]" />
                <span>Layer 4 · Regulatory Authority Enforcement Precedents</span>
              </h3>
              <span className="text-[11px] text-[#F5F2EB]/50">
                {card.enforcement_history.length} Scan Logs
              </span>
            </div>

            {card.enforcement_history.length === 0 ? (
              <div className="p-4 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/20 text-xs text-[#F5F2EB]/70 italic">
                No adverse enforcement or precedents logged.
              </div>
            ) : (
              <div className="space-y-2">
                {card.enforcement_history.map((enf) => (
                  <div
                    key={enf.enforcement_id}
                    className="p-3 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/25 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-[#F5F2EB]">{enf.regulator}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          enf.enforcement_type === 'enforcement_precedent'
                            ? 'bg-[#A87B4E]/25 text-[#F5F2EB] border border-[#A87B4E]/40'
                            : enf.enforcement_type === 'regulatory_change'
                            ? 'bg-[#3D2817] text-[#F5F2EB] border border-[#A87B4E]'
                            : 'bg-[#3D2817] text-[#F5F2EB]/90'
                        }`}
                      >
                        {enf.enforcement_type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {enf.claim_flagged && (
                      <div className="text-[#F5F2EB]/90 mb-1">
                        <strong className="text-[#F5F2EB]/70">Target Claim: </strong>
                        &ldquo;{enf.claim_flagged}&rdquo;
                      </div>
                    )}

                    {enf.notes && <p className="text-[#F5F2EB]/70 italic mb-1">{enf.notes}</p>}

                    <div className="flex items-center justify-between text-[11px] text-[#F5F2EB]/50 pt-1 border-t border-[#A87B4E]/20">
                      <span>Date: {enf.enforcement_date || 'Ongoing'}</span>
                      <span className="font-medium text-[#F5F2EB]/70">
                        Outcome: {enf.outcome_status || 'Under Review'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* LAYER 5: Claim Evolution History */}
          {card.claim_history.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F2EB]/70 flex items-center space-x-2">
                <History className="w-4 h-4 text-[#A87B4E]" />
                <span>Layer 5 · Version History &amp; Formulation Shifts</span>
              </h3>

              <div className="space-y-2">
                {card.claim_history.map((hist) => (
                  <div
                    key={hist.claim_history_id}
                    className="p-3 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/25 text-xs flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-[#F5F2EB] font-medium">
                        &ldquo;{hist.claim_version}&rdquo;
                      </div>
                      {hist.change_reason && (
                        <div className="text-[11px] text-[#A87B4E] mt-0.5">
                          Trigger: {hist.change_reason}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-[11px] text-[#F5F2EB]/50">
                      <div>{hist.version_date || 'Earliest snapshot'}</div>
                      <span className="font-mono text-[#F5F2EB]/70">{hist.version_source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* LAYER 6: Transparent Corrections Log (DISPLAYED ASSET) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F2EB] flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#A87B4E]" />
                <span>Layer 6 · Transparent Correction Log (Public Display Asset)</span>
              </h3>
              <span className="text-[11px] text-[#A87B4E] font-mono">
                {card.corrections.length} Audit Revisions
              </span>
            </div>

            {card.corrections.length === 0 ? (
              <div className="p-3 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/20 text-xs text-[#F5F2EB]/70 italic">
                No manual revisions or audit flags logged.
              </div>
            ) : (
              <div className="space-y-2">
                {card.corrections.map((corr) => (
                  <div
                    key={corr.correction_id}
                    className="p-3 bg-[#3D2817]/15 rounded-xl border border-[#A87B4E]/30 text-xs space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#3D2817] text-[#F5F2EB] border border-[#A87B4E]/40">
                        {corr.flag_type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-[#F5F2EB]/70">
                        Auditor: <strong className="text-[#F5F2EB]">{corr.flagged_by}</strong> on{' '}
                        {corr.flagged_date}
                      </span>
                    </div>

                    <div className="text-[#F5F2EB]/90">
                      <span className="text-[#F5F2EB]/70 font-medium">Issue Noted: </span>
                      {corr.issue_description}
                    </div>

                    {corr.correction_made && (
                      <div className="p-2 bg-[#2C3E50] rounded border border-[#A87B4E]/25 text-[#F5F2EB] text-[11px]">
                        <strong>Audit Resolution: </strong> {corr.correction_made}
                      </div>
                    )}

                    <div className="text-right text-[11px] text-[#F5F2EB]/70">
                      Confidence Post-Correction:{' '}
                      {getConfidenceBadge(corr.confidence_after_correction)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* VIEW 5: RAW JSON */}
      {viewMode === 'json' && (
        <div className="p-6 overflow-auto max-h-[750px] bg-[#2C3E50] font-mono text-xs text-[#F5F2EB]">
          <pre>{toJson(card)}</pre>
        </div>
      )}

      {/* VIEW 6: RAW MARKDOWN */}
      {viewMode === 'markdown' && (
        <div className="p-6 overflow-auto max-h-[750px] bg-[#2C3E50] font-mono text-xs text-[#F5F2EB] whitespace-pre-wrap leading-relaxed">
          {toMarkdown(card)}
        </div>
      )}

      {/* Footer Audit Metadata */}
      <div className="bg-[#2C3E50] px-6 py-3 border-t border-[#A87B4E]/25 flex flex-wrap items-center justify-between gap-2 text-xs text-[#F5F2EB]/50">
        <div>
          Last Verified: <strong className="text-[#F5F2EB]/90 font-mono">{card.data_quality.last_verified}</strong>
        </div>
        <div>
          Active Render Mode:{' '}
          <span className="font-mono uppercase text-[#A87B4E] font-bold">
            {card.data_quality.render_mode}
          </span>
        </div>
        <div>
          Field Status:{' '}
          <span className="text-[#A87B4E] font-bold font-mono">{breakdown.populated} Populated</span>
          {breakdown.to_collect > 0 && (
            <span className="text-[#A87B4E] font-bold font-mono ml-1.5">
              · {breakdown.to_collect} To Collect
            </span>
          )}
        </div>
      </div>

      {/* FULLSCREEN PACKAGING PHOTO LIGHTBOX MODAL */}
      {isPhotoZoomed && (
        <div
          onClick={() => setIsPhotoZoomed(false)}
          className="fixed inset-0 z-50 bg-[#2C3E50]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#3D2817]/60 border border-[#A87B4E]/30 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#A87B4E]/25">
              <div>
                <span className="text-xs font-mono text-[#A87B4E] font-bold uppercase tracking-wider">
                  {photoInfo.brand}
                </span>
                <h3 className="text-base font-bold text-white">
                  {photoInfo.product_name}
                </h3>
              </div>
              <button
                onClick={() => setIsPhotoZoomed(false)}
                className="p-1.5 rounded-xl bg-[#3D2817] hover:bg-[#3D2817]/80 text-[#F5F2EB]/90 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full aspect-square rounded-2xl bg-white/5 border border-[#A87B4E]/25 p-4 flex items-center justify-center overflow-hidden">
              <img
                src={photoInfo.image_url}
                alt={photoInfo.product_name}
                className="max-h-full max-w-full object-contain drop-shadow-2xl"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#F5F2EB]/70 pt-2 border-t border-[#A87B4E]/25">
              <span>{photoInfo.packaging_type}</span>
              <span className="font-mono text-[#F5F2EB] font-bold">{photoInfo.volume}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
