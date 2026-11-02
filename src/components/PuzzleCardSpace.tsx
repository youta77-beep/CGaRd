import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductRecord, AuditCard, Layer1Claim } from '../types/schema';
import { getProductPhoto } from '../data/productLookup';
import { useSheetProducts } from '../data/sheetProductsContext';
import { ProductImage } from './ProductImage';
import { buildCard } from '../engine/cardBuilder';
import { RegulatoryStatusBadge } from './RegulatoryStatusBadge';
import { ProvenanceChip } from './ProvenanceChip';
import { ClaimCardStandard } from './ClaimCardStandard';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  FlaskConical,
  BookOpen,
  Layers,
  Scale,
  History,
  RotateCcw,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Puzzle,
  CheckCheck,
  Building2,
  FileText,
  ShieldAlert,
  Info,
  Calendar,
  Sun,
  Moon,
} from 'lucide-react';

interface PuzzleCardSpaceProps {
  product: ProductRecord;
  allProducts: ProductRecord[];
  db: any;
  isExternalMode: boolean;
  selectedClaimId: string;
  onSelectClaim: (claimId: string) => void;
  onBackToGallery: () => void;
  onSwitchProduct: (slug: string) => void;
  deletedProvenanceFields?: string[];
  onToggleDeleteProvenance?: (fieldKey: string) => void;
  onResetDeletedProvenance?: () => void;
  onStoreMutated?: () => void;
  isDeveloperMode?: boolean;
}

export const PuzzleCardSpace: React.FC<PuzzleCardSpaceProps> = ({
  product,
  allProducts,
  db,
  isExternalMode,
  selectedClaimId,
  onSelectClaim,
  onBackToGallery,
  onSwitchProduct,
  deletedProvenanceFields = [],
  onToggleDeleteProvenance,
  onResetDeletedProvenance,
  onStoreMutated,
  isDeveloperMode = false,
}) => {
  const sheetProducts = useSheetProducts();
  const photoInfo = getProductPhoto(product.slug, product.company, sheetProducts);

  // Active claim under this product
  const activeClaim =
    product.claims.find((c) => c.claim_id === selectedClaimId) || product.claims[0];

  const currentClaimId = activeClaim?.claim_id || product.claims[0]?.claim_id;

  // Build the active card
  const card: AuditCard = buildCard(
    db,
    currentClaimId,
    isExternalMode,
    deletedProvenanceFields
  );

  const exec = card.executive_summary;
  const notifiedActives = exec.notified_actives_items || [];
  const evidenceRows = exec.evidence_rows || [];

  // Theme state
  const [paperTheme, setPaperTheme] = useState<'paper' | 'dark'>('paper');
  const [copied, setCopied] = useState(false);

  // Puzzle Assembly State: key used to trigger the assembly animation
  const [assemblyKey, setAssemblyKey] = useState<number>(0);
  const [isAssemblyComplete, setIsAssemblyComplete] = useState<boolean>(false);
  const [activeHighlightPiece, setActiveHighlightPiece] = useState<number | null>(null);

  // Auto-scroll smoothly to top whenever entering specialized space or switching claim
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.slug, currentClaimId]);

  // Subtle audio synthesis for tactile puzzle piece snapping
  const playSnap = (step: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const freqs = [280, 320, 380, 440, 520, 620];
      const f = freqs[step % freqs.length] || 440;
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // AudioContext unavailable or autoplay blocked
    }
  };

  // Trigger assembly completion timer & tactile piece snap sound
  useEffect(() => {
    setIsAssemblyComplete(false);
    const delays = [120, 320, 520, 720, 920, 1120];
    const timers = delays.map((d, idx) =>
      setTimeout(() => {
        playSnap(idx);
      }, d)
    );
    const timer = setTimeout(() => {
      setIsAssemblyComplete(true);
      playSnap(5);
    }, 1500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(timer);
    };
  }, [assemblyKey, currentClaimId]);

  const handleReplayAssembly = () => {
    setAssemblyKey((k) => k + 1);
  };

  const handleCopyClaim = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find previous and next product for quick switching
  const currentIndex = allProducts.findIndex((p) => p.slug === product.slug);
  const prevProduct =
    allProducts[(currentIndex - 1 + allProducts.length) % allProducts.length];
  const nextProduct = allProducts[(currentIndex + 1) % allProducts.length];

  const isDark = paperTheme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* 1. TOP SPECIALIZED SPACE CONTROL BAR */}
      <div className="bg-[#3D2817]/70 border border-[#A87B4E]/30 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        {/* Back Button & Product Breadcrumb */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToGallery}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#2C3E50] hover:bg-[#A87B4E] text-[#F5F2EB] hover:text-[#FFFFFF] text-xs font-bold transition border border-[#A87B4E]/40 shadow-md group cursor-pointer"
            title="Return to the multi-product showcase gallery"
          >
            <ArrowLeft className="w-4 h-4 text-[#A87B4E] group-hover:text-[#FFFFFF] group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Products</span>
          </button>

          <div className="h-6 w-px bg-[#A87B4E]/30 hidden sm:block"></div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#A87B4E] uppercase tracking-wider font-mono">
                {product.company}
              </span>
              <span className="text-xs text-[#F5F2EB]/50 hidden sm:inline">•</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#2C3E50] text-[#F5F2EB] border border-[#A87B4E]/30 font-semibold hidden sm:inline-block">
                {product.regulatory_jurisdiction.split('(')[0].trim()}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-[#FFFFFF] truncate max-w-md">
              {(product.product_line || product.company).split(' - ')[0]}
            </h1>
          </div>
        </div>

        {/* Puzzle Assembly Status & Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Puzzle Replay & Status Pill */}
          <button
            onClick={handleReplayAssembly}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border shadow-sm cursor-pointer ${
              isAssemblyComplete
                ? 'bg-[#3D2817] text-[#FFFFFF] border-[#A87B4E] hover:bg-[#3D2817]/90'
                : 'bg-[#A87B4E] text-[#FFFFFF] border-[#FFFFFF]/30 animate-pulse'
            }`}
            title="Click to replay the puzzle assembly animation"
          >
            <Puzzle className="w-3.5 h-3.5" />
            <span>
              {isAssemblyComplete ? '🧩 6/6 Puzzle Pieces Locked' : 'Assembling Puzzle...'}
            </span>
            <RotateCcw className="w-3 h-3 ml-1 opacity-75" />
          </button>

          {/* Paper / Dark theme switch */}
          <button
            onClick={() => setPaperTheme((t) => (t === 'paper' ? 'dark' : 'paper'))}
            className="p-2 rounded-xl bg-[#2C3E50] hover:bg-[#3D2817] text-[#F5F2EB] border border-[#A87B4E]/30 text-xs transition"
            title="Toggle card appearance theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#A87B4E]" />
            ) : (
              <Moon className="w-4 h-4 text-[#A87B4E]" />
            )}
          </button>

          {/* Prev / Next Product Switcher */}
          <div className="flex items-center bg-[#2C3E50] rounded-xl border border-[#A87B4E]/30 p-0.5">
            <button
              onClick={() => onSwitchProduct(prevProduct.slug)}
              className="p-1.5 rounded-lg hover:bg-[#3D2817] text-[#F5F2EB]/80 hover:text-[#FFFFFF] transition"
              title={`Previous: ${prevProduct.company}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono px-2 text-[#F5F2EB]/60">
              {currentIndex + 1} / {allProducts.length}
            </span>
            <button
              onClick={() => onSwitchProduct(nextProduct.slug)}
              className="p-1.5 rounded-lg hover:bg-[#3D2817] text-[#F5F2EB]/80 hover:text-[#FFFFFF] transition"
              title={`Next: ${nextProduct.company}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MULTI-CLAIM SELECTION TABS (If product has multiple claims) */}
      {product.claims.length > 1 && (
        <div className="bg-[#3D2817]/50 border border-[#A87B4E]/25 rounded-2xl p-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase text-[#A87B4E] px-2 flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Claims on this formulation ({product.claims.length}):</span>
          </span>

          <div className="flex flex-wrap gap-2 flex-1">
            {product.claims.map((c, idx) => {
              const isSelected = c.claim_id === currentClaimId;
              return (
                <button
                  key={c.claim_id}
                  onClick={() => {
                    onSelectClaim(c.claim_id);
                    setAssemblyKey((k) => k + 1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 border cursor-pointer ${
                    isSelected
                      ? 'bg-[#A87B4E] text-[#FFFFFF] border-[#FFFFFF]/40 shadow-md ring-1 ring-[#A87B4E]'
                      : 'bg-[#2C3E50] hover:bg-[#3D2817] text-[#F5F2EB]/80 hover:text-[#FFFFFF] border-[#A87B4E]/30'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-black/30 text-[10px] flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span className="truncate max-w-[220px]">{c.claim_text}</span>
                  {isSelected && <CheckCheck className="w-3.5 h-3.5 text-[#FFFFFF]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MAIN SPECIALIZED WORKSPACE: PACKAGING POD (LEFT) + PUZZLE CARD (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: PRODUCT PACKSHOT & FORMULATION INTEL (4 cols) */}
        <motion.div
          key={`left_pod_${product.slug}`}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="lg:col-span-4 space-y-4"
        >
          {/* Packaging Card - Full View with no upper crop */}
          <div className="rounded-3xl bg-[#3D2817]/60 border border-[#A87B4E]/30 p-6 space-y-5 shadow-2xl backdrop-blur-md relative overflow-visible">
            {/* Ambient gold glow */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#A87B4E]/15 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-[#A87B4E]/25 pb-3">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#A87B4E] flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Primary Packaging Dossier</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2C3E50] text-[#F5F2EB] border border-[#A87B4E]/30 font-bold">
                {product.claims.length} claims verified
              </span>
            </div>

            {/* High Resolution Product Packshot (100% Full Uncropped View with Generous Headroom) */}
            <div className="rounded-2xl bg-gradient-to-b from-[#FFFFFF] via-[#F5F2EB] to-[#F5F2EB] pt-12 pb-8 px-6 sm:pt-14 sm:pb-10 sm:px-8 border border-[#A87B4E]/25 flex items-center justify-center shadow-lg relative group min-h-[420px] sm:min-h-[460px]">
              <ProductImage
                src={photoInfo.image_url}
                alt={photoInfo.product_name}
                className="h-64 sm:h-72 md:h-80 w-auto max-h-[340px] max-w-full object-contain drop-shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-300 select-none py-2"
              />

            </div>

            {/* Product Metadata & Positioning */}
            <div className="space-y-2">
              <h2 className="text-lg font-black text-[#FFFFFF]">{photoInfo.product_name}</h2>
              <p className="text-xs text-[#F5F2EB]/80 leading-relaxed">
                {product.brand_positioning}
              </p>
            </div>

            {/* Active Ingredients in Formula */}
            <div className="space-y-2 pt-2 border-t border-[#A87B4E]/25">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-bold text-[#A87B4E] flex items-center space-x-1">
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Notified Key Actives:</span>
                </span>
                <span className="text-[10px] text-[#F5F2EB]/60">
                  {photoInfo.key_actives.length} declared
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {photoInfo.key_actives.map((act) => (
                  <span
                    key={act}
                    className="px-2.5 py-1 rounded-lg bg-[#2C3E50] text-[#F5F2EB] text-xs font-semibold border border-[#A87B4E]/30 flex items-center space-x-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A87B4E]"></span>
                    <span>{act}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Official Primary Source Link */}
            {card.source_url && (
              <a
                href={card.source_url}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#2C3E50] hover:bg-[#A87B4E] text-[#F5F2EB] hover:text-[#FFFFFF] text-xs font-bold transition border border-[#A87B4E]/40 shadow-sm group"
              >
                <span>Open Live Product Page</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}
          </div>

        </motion.div>

        {/* RIGHT COLUMN: THE PUZZLE ASSEMBLY EXPERIENCE (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Puzzle Assembly Container with Interlocking Visual Tiles */}
          <div
            key={`assembly_root_${currentClaimId}_${assemblyKey}`}
            className="relative space-y-3"
          >
            {/* COMPLETED PUZZLE GLOW WRAPPER */}
            <div
              className={`rounded-3xl transition-all duration-700 p-1.5 sm:p-2 relative ${
                isAssemblyComplete
                  ? 'bg-gradient-to-r from-[#A87B4E]/40 via-[#F5F2EB]/15 to-[#A87B4E]/40 ring-2 ring-[#A87B4E]/60 shadow-[0_0_40px_rgba(168,123,78,0.25)]'
                  : 'bg-transparent'
              }`}
            >
              {/* Video-Style Dynamic Light Sweep on Assembly Complete */}
              {isAssemblyComplete && (
                <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden z-20">
                  <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent animate-sheen-sweep"></div>
                </div>
              )}

              {/* THE PUZZLE CONTAINER (Uncropped, Full View) */}
              <div
                className={`rounded-2xl border transition-colors duration-200 shadow-2xl overflow-visible ${
                  isDark
                    ? 'bg-[#3D2817] border-[#A87B4E]/40 text-[#F5F2EB]'
                    : 'bg-[#FFFFFF] border-[#3D2817]/25 text-[#3D2817]'
                }`}
                style={{
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                }}
              >
                {/* 🧩 PUZZLE PIECE 1: PASSPORT MASTER HEADER & REGULATORY CLASSIFICATION */}
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.1,
                    type: 'spring',
                    stiffness: 150,
                    damping: 16,
                  }}
                  onClick={() => setActiveHighlightPiece(1)}
                  className={`pt-8 pb-6 px-6 sm:px-8 rounded-t-2xl border-b flex flex-col gap-3.5 relative transition-all cursor-pointer ${
                    activeHighlightPiece === 1 ? 'ring-2 ring-[#A87B4E] z-10 shadow-lg' : ''
                  } ${
                    isDark ? 'border-[#A87B4E]/30 bg-[#2C3E50]' : 'border-[#3D2817]/15 bg-[#F5F2EB]'
                  }`}
                >
                  {/* Clean in-flow Piece 1 header badge with directives */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#A87B4E] text-[#FFFFFF] text-xs font-mono font-bold shadow-sm">
                      <Puzzle className="w-3.5 h-3.5" />
                      <span>Piece 1 · Official CGaRd Passport &amp; Regulatory Status</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <RegulatoryStatusBadge
                        claimId={card.claim_id}
                        surfaceName="card_header"
                        size="sm"
                        onStoreMutated={onStoreMutated}
                      />
                      <span className="font-mono text-xs uppercase font-bold px-2.5 py-1 rounded-lg bg-[#3D2817] text-[#A87B4E] border border-[#A87B4E]/30">
                        {card.jurisdiction}
                      </span>
                    </div>
                  </div>

                  {/* Full Product Title with uncropped full view */}
                  <div className="flex items-start space-x-3 pt-1">
                    <div className="flex items-center space-x-1.5 flex-shrink-0 text-[#A87B4E] mt-1">
                      <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current"></span>
                      <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current"></span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2
                        className={`text-base sm:text-lg font-black tracking-tight leading-snug break-words ${
                          isDark ? 'text-[#FFFFFF]' : 'text-[#3D2817]'
                        }`}
                      >
                        {card.product_name}
                      </h2>
                      <p className="text-xs font-mono text-[#A87B4E] font-semibold mt-0.5">
                        Dossier ID: {card.claim_id} · Market: {card.jurisdiction}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Interlocking Puzzle Joint 1-2 */}
                <div className="flex justify-center -my-2.5 z-10 relative pointer-events-none">
                  <div className="px-3 py-0.5 rounded-full bg-[#A87B4E] text-[9px] font-mono font-bold text-white shadow-sm flex items-center space-x-1 border border-white/30">
                    <Puzzle className="w-2.5 h-2.5" />
                    <span>interlock 1·2</span>
                  </div>
                </div>

                {/* 🧩 PUZZLE PIECE 2: TARGET CLAIM STATEMENT */}
                <motion.div
                  initial={{ opacity: 0, x: 28, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.3,
                    type: 'spring',
                    stiffness: 140,
                    damping: 14,
                  }}
                  onClick={() => setActiveHighlightPiece(2)}
                  className={`p-5 sm:p-6 border-b relative transition-all cursor-pointer ${
                    activeHighlightPiece === 2 ? 'ring-2 ring-[#A87B4E] z-10 shadow-lg' : ''
                  } ${
                    isDark
                      ? 'bg-[#3D2817]/90 border-[#A87B4E]/25 text-[#FFFFFF]'
                      : 'bg-[#FDFBF7] border-[#3D2817]/15 text-[#3D2817]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#A87B4E]/20">
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#A87B4E]/20 text-[#A87B4E] border border-[#A87B4E]/40 text-[10px] font-mono font-bold">
                      <Puzzle className="w-3 h-3" />
                      <span>Piece 2 · Target Claim Statement</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#A87B4E]/80">
                      Claim Ref: {card.claim_id}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#A87B4E]">
                      Official Target Claim:
                    </span>
                    <div className="flex items-start justify-between gap-4">
                      <blockquote className="text-sm sm:text-base font-bold italic leading-relaxed text-[#A87B4E]">
                        &ldquo;{card.claim_text}&rdquo;
                      </blockquote>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyClaim(card.claim_text);
                        }}
                        className="p-1.5 rounded-lg bg-[#2C3E50]/80 hover:bg-[#A87B4E] text-[#F5F2EB] hover:text-white border border-[#A87B4E]/30 text-xs transition flex-shrink-0 cursor-pointer"
                        title="Copy claim statement"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-[#A87B4E]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Interlocking Puzzle Joint 2-3 */}
                <div className="flex justify-center -my-2.5 z-10 relative pointer-events-none">
                  <div className="px-3 py-0.5 rounded-full bg-[#A87B4E] text-[9px] font-mono font-bold text-white shadow-sm flex items-center space-x-1 border border-white/30">
                    <Puzzle className="w-2.5 h-2.5" />
                    <span>interlock 2·3</span>
                  </div>
                </div>

                {/* 🧩 PUZZLE PIECE 3: NOTIFIED FORMULA ACTIVES */}
                <motion.div
                  initial={{ opacity: 0, x: -30, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.5,
                    type: 'spring',
                    stiffness: 140,
                    damping: 15,
                  }}
                  onClick={() => setActiveHighlightPiece(3)}
                  className={`p-5 sm:p-6 border-b relative transition-all cursor-pointer ${
                    activeHighlightPiece === 3 ? 'ring-2 ring-[#A87B4E] z-10 shadow-lg' : ''
                  } ${
                    isDark ? 'border-[#A87B4E]/25 bg-[#2C3E50]/30' : 'border-[#3D2817]/15 bg-[#F9F7F2]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#A87B4E]/20">
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#A87B4E] text-[#FFFFFF] text-[10px] font-mono font-bold shadow-sm">
                      <Puzzle className="w-3 h-3" />
                      <span>Piece 3 · NOTIFIED FORMULA ACTIVES</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#A87B4E] font-bold">
                      {notifiedActives.length} Actives Declared
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-start">
                    <div className="sm:col-span-4">
                      <div className="flex items-center space-x-2 font-bold text-xs sm:text-sm">
                        <FlaskConical className="w-4 h-4 text-[#A87B4E]" />
                        <span>Formula Actives</span>
                      </div>
                      <span className="text-[10px] text-[#A87B4E] block mt-0.5">
                        (Active concentrations &amp; compliance)
                      </span>
                    </div>

                    <div className="sm:col-span-8 space-y-2">
                      {notifiedActives.length === 0 ? (
                        <span className="text-[#A87B4E] italic text-xs font-semibold">
                          Not on file
                        </span>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {notifiedActives.map((act, actIdx) => (
                            <motion.div
                              key={`${act.active_name}_${actIdx}`}
                              initial={{ opacity: 0, scale: 0.88, y: 12 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{
                                delay: 0.55 + actIdx * 0.1,
                                duration: 0.35,
                                type: 'spring',
                                stiffness: 180,
                              }}
                              className={`flex flex-wrap items-center justify-between p-2.5 rounded-xl border text-xs gap-2 shadow-sm ${
                                isDark
                                  ? 'bg-[#2C3E50]/90 border-[#A87B4E]/40 text-[#F5F2EB]'
                                  : 'bg-[#FFFFFF] border-[#A87B4E]/30 text-[#3D2817]'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-[#A87B4E]"></span>
                                <strong className="font-bold">{act.active_name}</strong>
                                <span className="font-mono text-[#A87B4E] font-extrabold bg-[#3D2817]/20 px-2 py-0.5 rounded border border-[#A87B4E]/30 text-[11px]">
                                  {act.concentration}
                                </span>
                              </div>

                              <ProvenanceChip
                                provenance={act.provenance}
                                fieldLabel={act.active_name}
                                inline
                              />
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Interlocking Puzzle Joint 3-4 */}
                <div className="flex justify-center -my-2.5 z-10 relative pointer-events-none">
                  <div className="px-3 py-0.5 rounded-full bg-[#A87B4E] text-[9px] font-mono font-bold text-white shadow-sm flex items-center space-x-1 border border-white/30">
                    <Puzzle className="w-2.5 h-2.5" />
                    <span>interlock 3·4</span>
                  </div>
                </div>

                {/* 🧩 PUZZLE PIECE 4: EVIDENTIARY SUBSTANTIATION & CLINICAL PROOF */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.7,
                    type: 'spring',
                    stiffness: 130,
                    damping: 14,
                  }}
                  onClick={() => setActiveHighlightPiece(4)}
                  className={`p-5 sm:p-6 border-b relative transition-all cursor-pointer ${
                    activeHighlightPiece === 4 ? 'ring-2 ring-[#A87B4E] z-10 shadow-lg' : ''
                  } ${
                    isDark ? 'border-[#A87B4E]/25 bg-[#3D2817]/60' : 'border-[#3D2817]/15 bg-[#FFFFFF]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#A87B4E]/20">
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#A87B4E]/20 text-[#A87B4E] border border-[#A87B4E]/40 text-[10px] font-mono font-bold">
                      <Puzzle className="w-3 h-3" />
                      <span>Piece 4 · Evidentiary Substantiation</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#A87B4E] font-bold">
                      {evidenceRows.length} Evidentiary Rows
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-start">
                    <div className="sm:col-span-4">
                      <div className="flex items-center space-x-2 font-bold text-xs sm:text-sm">
                        <BookOpen className="w-4 h-4 text-[#A87B4E]" />
                        <span>Clinical Substantiation</span>
                      </div>
                      <span className="text-[10px] text-[#A87B4E] block mt-0.5">
                        ({evidenceRows.length} peer-reviewed evidence rows)
                      </span>
                    </div>

                    <div className="sm:col-span-8 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-[#A87B4E]">
                          {exec.clinical_data_status}
                        </span>
                        <ProvenanceChip
                          provenance={exec.clinical_data_prov}
                          fieldLabel="Clinical Data"
                          inline
                        />
                      </div>

                      {/* Evidence Rows Preview */}
                      <div className="space-y-1.5 pt-1">
                        {evidenceRows.slice(0, 3).map((row, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg text-xs border flex items-center justify-between gap-2 ${
                              isDark
                                ? 'bg-[#2C3E50]/70 border-[#A87B4E]/30'
                                : 'bg-[#F5F2EB]/80 border-[#3D2817]/15'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-[11px] block truncate">
                                {row.active_name}
                              </span>
                              <span className="text-[10px] text-[#F5F2EB]/60 block truncate">
                                {row.evidence_status} · {row.registry_ref}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#A87B4E]/20 text-[#A87B4E] border border-[#A87B4E]/30 flex-shrink-0">
                              {row.evidence_status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Interlocking Puzzle Joint 4-5 */}
                <div className="flex justify-center -my-2.5 z-10 relative pointer-events-none">
                  <div className="px-3 py-0.5 rounded-full bg-[#A87B4E] text-[9px] font-mono font-bold text-white shadow-sm flex items-center space-x-1 border border-white/30">
                    <Puzzle className="w-2.5 h-2.5" />
                    <span>interlock 4·5</span>
                  </div>
                </div>

                {/* 🧩 PUZZLE PIECE 5: REGULATORY BASIS & STATUTORY DIRECTIVES */}
                <motion.div
                  initial={{ opacity: 0, x: 28, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.9,
                    type: 'spring',
                    stiffness: 140,
                    damping: 15,
                  }}
                  onClick={() => setActiveHighlightPiece(5)}
                  className={`p-5 sm:p-6 border-b relative transition-all cursor-pointer ${
                    activeHighlightPiece === 5 ? 'ring-2 ring-[#A87B4E] z-10 shadow-lg' : ''
                  } ${
                    isDark ? 'border-[#A87B4E]/25 bg-[#2C3E50]/40' : 'border-[#3D2817]/15 bg-[#FDFBF7]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#A87B4E]/20">
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#A87B4E]/20 text-[#A87B4E] border border-[#A87B4E]/40 text-[10px] font-mono font-bold">
                      <Puzzle className="w-3 h-3" />
                      <span>Piece 5 · Statutory Directives &amp; Criteria</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#A87B4E]">
                      EU Reg. 655/2013 &amp; Common Criteria
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-baseline">
                    <div className="sm:col-span-4">
                      <div className="flex items-center space-x-2 font-bold text-xs sm:text-sm">
                        <Scale className="w-4 h-4 text-[#A87B4E]" />
                        <span>Regulatory Basis</span>
                      </div>
                      <span className="text-[10px] text-[#A87B4E] block mt-0.5">
                        Statutory Directive &amp; Common Criteria
                      </span>
                    </div>

                    <div className="sm:col-span-8 flex flex-wrap items-baseline gap-2">
                      <span
                        className={`font-medium text-xs sm:text-sm ${
                          isDark ? 'text-[#FFFFFF]' : 'text-[#3D2817]'
                        }`}
                      >
                        {exec.regulatory_basis}
                      </span>
                      <ProvenanceChip
                        provenance={exec.regulatory_basis_prov}
                        fieldLabel="Regulatory Basis"
                        inline
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Interlocking Puzzle Joint 5-6 */}
                <div className="flex justify-center -my-2.5 z-10 relative pointer-events-none">
                  <div className="px-3 py-0.5 rounded-full bg-[#A87B4E] text-[9px] font-mono font-bold text-white shadow-sm flex items-center space-x-1 border border-white/30">
                    <Puzzle className="w-2.5 h-2.5" />
                    <span>interlock 5·6</span>
                  </div>
                </div>

                {/* 🧩 PUZZLE PIECE 6: CLAIM HISTORY & PROVENANCE INTEGRITY */}
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.45,
                    delay: 1.1,
                    type: 'spring',
                    stiffness: 140,
                    damping: 14,
                  }}
                  onClick={() => setActiveHighlightPiece(6)}
                  className={`p-5 sm:p-6 rounded-b-2xl relative transition-all cursor-pointer ${
                    activeHighlightPiece === 6 ? 'ring-2 ring-[#A87B4E] z-10 shadow-lg' : ''
                  } ${
                    isDark ? 'bg-[#3D2817]' : 'bg-[#FFFFFF]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#A87B4E]/20">
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#A87B4E]/20 text-[#A87B4E] border border-[#A87B4E]/40 text-[10px] font-mono font-bold">
                      <Puzzle className="w-3 h-3" />
                      <span>Piece 6 · Claim History &amp; Provenance Seal</span>
                    </span>
                    <span className="text-[10px] text-[#A87B4E] font-mono font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Primary Packaging Verified</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-baseline">
                    <div className="sm:col-span-4">
                      <div className="flex items-center space-x-2 font-bold text-xs sm:text-sm">
                        <History className="w-4 h-4 text-[#A87B4E]" />
                        <span>Claim History &amp; Evolution</span>
                      </div>
                      <span className="text-[10px] text-[#A87B4E] block mt-0.5">
                        Primary Packaging Dossier
                      </span>
                    </div>

                    <div className="sm:col-span-8 flex flex-wrap items-baseline gap-2">
                      <span
                        className={`text-xs ${
                          isDark ? 'text-[#FFFFFF]' : 'text-[#3D2817]'
                        }`}
                      >
                        {exec.claim_history_summary}
                      </span>
                      <ProvenanceChip
                        provenance={exec.claim_history_prov}
                        fieldLabel="Claim History"
                        inline
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>


            {/* If in developer mode, show the full test toolbars and mutation triggers */}
            {isDeveloperMode && (
              <div className="pt-4">
                <ClaimCardStandard
                  card={card}
                  paperTheme={paperTheme}
                  onSelectClaim={onSelectClaim}
                  deletedProvenanceFields={deletedProvenanceFields}
                  onToggleDeleteProvenance={onToggleDeleteProvenance}
                  onResetDeletedProvenance={onResetDeletedProvenance}
                  onStoreMutated={onStoreMutated}
                  showTestToolbar={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
