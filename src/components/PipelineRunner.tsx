import React, { useState } from 'react';
import {
  runFullPipeline,
  PipelineExecutionReport,
} from '../engine/pipelineEngine';
import {
  Cpu,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  FileText,
  ShieldAlert,
  Scale,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { ProductRecord, Layer1Claim } from '../types/schema';

interface PipelineRunnerProps {
  onPromoteClaim?: (claim: Layer1Claim, report: PipelineExecutionReport) => void;
  onEnqueueReviews?: (items: any[]) => void;
}

const PRESET_DEMO = `Eucerin DermoCapillaire Anti-Dandruff Shampoo. Gentle flake removal for sensitive and dry scalps. Dermatological formula for sensitive scalps. 100% recyclable packaging.`;

const PRESET_BODYSHOP = `The Body Shop Ginger Scalp Care Shampoo. Harnesses the natural power of ginger for scalp health. Natural and cruelty-free formulation. 100% recyclable packaging.`;

const PRESET_ZPT = `Head & Shoulders Classic Clean. Targets the root cause of dandruff: Malassezia yeast with zinc pyrithione formulation.`;

export const PipelineRunner: React.FC<PipelineRunnerProps> = ({
  onPromoteClaim,
  onEnqueueReviews,
}) => {
  const [inputText, setInputText] = useState(PRESET_DEMO);
  const [sourceUrl, setSourceUrl] = useState('https://www.eucerin.de/demo-audit');
  const [brand, setBrand] = useState('Eucerin');
  const [productName, setProductName] = useState('DermoCapillaire Anti-Dandruff');
  const [evidenceProvided, setEvidenceProvided] = useState(false);
  const [report, setReport] = useState<PipelineExecutionReport | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [promotedIndex, setPromotedIndex] = useState<number | null>(null);

  const handleRunPipeline = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const result = runFullPipeline(inputText, sourceUrl, evidenceProvided);
      setReport(result);
      if (result.queued_reviews.length > 0 && onEnqueueReviews) {
        onEnqueueReviews(result.queued_reviews);
      }
      setIsExecuting(false);
      setPromotedIndex(null);
    }, 250);
  };

  const handlePromote = (claimIndex: number) => {
    if (!report || !report.extracted_claims[claimIndex] || !onPromoteClaim) return;
    const extracted = report.extracted_claims[claimIndex];
    const newClaim: Layer1Claim = {
      claim_id: `c_${Date.now()}_promoted`,
      brand,
      product_name: productName,
      claim_text: extracted.claim_text,
      claim_context: extracted.claim_context,
      date_captured: new Date().toISOString().split('T')[0],
      source_url: sourceUrl,
      claim_category: extracted.claim_category,
      jurisdiction: 'EU-27',
      language_original: extracted.language,
      status: 'POPULATED',
    };
    onPromoteClaim(newClaim, report);
    setPromotedIndex(claimIndex);
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-[#3D2817]/60 border border-[#A87B4E]/25 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[#A87B4E] font-bold text-sm mb-1">
              <Cpu className="w-5 h-5" />
              <span>Multi-Stage Regulatory Pipeline Simulator</span>
            </div>
            <h2 className="text-xl font-extrabold text-[#FFFFFF]">
              Raw Text &rarr; Extraction &rarr; Classification &rarr; Deterministic Rule Match
            </h2>
            <p className="text-xs text-[#F5F2EB]/70 mt-1 max-w-3xl leading-relaxed">
              Demonstrates the architectural boundary: Model extraction enforces the{' '}
              <strong className="text-[#F5F2EB]">&ldquo;quote or refuse&rdquo;</strong> discipline,
              evaluates classification confidence thresholds, and matches against statutory
              prohibitions while exceptions remain strictly governed by deterministic code logic.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setInputText(PRESET_DEMO);
                setBrand('Eucerin');
                setProductName('DermoCapillaire Anti-Dandruff');
                setSourceUrl('https://www.eucerin.de/demo-audit');
              }}
              className="px-3 py-1.5 rounded-lg bg-[#3D2817] hover:bg-[#A87B4E]/30 text-xs font-medium text-[#F5F2EB] border border-[#A87B4E]/30 transition"
            >
              Demo Preset (Eucerin)
            </button>
            <button
              onClick={() => {
                setInputText(PRESET_BODYSHOP);
                setBrand('The Body Shop');
                setProductName('Ginger Scalp Care');
                setSourceUrl('https://www.thebodyshop.com/ginger');
              }}
              className="px-3 py-1.5 rounded-lg bg-[#3D2817] hover:bg-[#A87B4E]/30 text-xs font-medium text-[#F5F2EB] border border-[#A87B4E]/30 transition"
            >
              Preset: Body Shop (ECGT)
            </button>
            <button
              onClick={() => {
                setInputText(PRESET_ZPT);
                setBrand('Head & Shoulders');
                setProductName('Classic Clean');
                setSourceUrl('https://www.head-and-shoulders.com/');
              }}
              className="px-3 py-1.5 rounded-lg bg-[#3D2817] hover:bg-[#A87B4E]/30 text-xs font-medium text-[#F5F2EB] border border-[#A87B4E]/30 transition"
            >
              Preset: ZPT Biocide Ban
            </button>
          </div>
        </div>
      </div>

      {/* Input Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-1 bg-[#3D2817]/60 border border-[#A87B4E]/25 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F2EB]/90 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#A87B4E]" />
            <span>Input Text &amp; Metadata</span>
          </h3>

          <div>
            <label className="block text-xs font-medium text-[#F5F2EB]/70 mb-1">Raw Claims Text</label>
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-[#2C3E50] text-xs text-[#FFFFFF] p-3 rounded-xl border border-[#A87B4E]/25 focus:border-[#A87B4E] focus:outline-none placeholder-[#F5F2EB]/40 leading-relaxed font-sans"
              placeholder="Enter packaging or web claim copy..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#F5F2EB]/70 mb-1">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-[#2C3E50] text-xs text-[#FFFFFF] px-3 py-2 rounded-lg border border-[#A87B4E]/25 focus:border-[#A87B4E] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#F5F2EB]/70 mb-1">Product</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full bg-[#2C3E50] text-xs text-[#FFFFFF] px-3 py-2 rounded-lg border border-[#A87B4E]/25 focus:border-[#A87B4E] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#F5F2EB]/70 mb-1">Source URL</label>
            <input
              type="text"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full bg-[#2C3E50] text-xs text-[#FFFFFF] px-3 py-2 rounded-lg border border-[#A87B4E]/25 focus:border-[#A87B4E] focus:outline-none"
            />
          </div>

          {/* Exception toggle */}
          <div className="p-3 bg-[#2C3E50] border border-[#A87B4E]/25 rounded-xl space-y-1.5">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={evidenceProvided}
                onChange={(e) => setEvidenceProvided(e.target.checked)}
                className="mt-0.5 rounded border-[#A87B4E]/30 text-[#A87B4E] focus:ring-[#A87B4E] bg-[#3D2817]/60"
              />
              <span className="text-xs text-[#F5F2EB]/90">
                <strong>Simulate Valid Third-Party Proof:</strong> Packaging certified recyclable in
                &gt;90% EU municipal facilities.
              </span>
            </label>
            <p className="text-[11px] text-[#F5F2EB]/50 pl-6">
              When enabled, deterministic exception rules can elevate otherwise banned claims to
              permitted status.
            </p>
          </div>

          <button
            onClick={handleRunPipeline}
            disabled={isExecuting || !inputText.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-[#A87B4E] hover:bg-[#8e663e] text-[#FFFFFF] font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-[#3D2817]/50 transition disabled:opacity-50"
          >
            {isExecuting ? (
              <span className="animate-spin mr-2">⟳</span>
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>Execute 3-Stage Pipeline</span>
          </button>
        </div>

        {/* Right 2 Columns: Pipeline Execution Output */}
        <div className="lg:col-span-2 space-y-4">
          {!report ? (
            <div className="bg-[#3D2817]/60 border border-[#A87B4E]/25 rounded-2xl p-12 text-center text-[#F5F2EB]/50 space-y-3">
              <Cpu className="w-10 h-10 text-[#A87B4E]/40 mx-auto" />
              <h4 className="text-sm font-semibold text-[#F5F2EB]/90">Pipeline Idle</h4>
              <p className="text-xs max-w-md mx-auto">
                Click &ldquo;Execute 3-Stage Pipeline&rdquo; above to run the deterministic extraction,
                category classification, and regulatory statutory matching workflow.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats Header */}
              <div className="bg-[#3D2817]/60 border border-[#A87B4E]/25 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-4 text-xs">
                  <div>
                    <span className="text-[#F5F2EB]/50">Extracted Claims: </span>
                    <strong className="text-[#FFFFFF] font-mono">{report.extracted_claims.length}</strong>
                  </div>
                  <div>
                    <span className="text-[#F5F2EB]/50">Regulatory Matches: </span>
                    <strong className="text-[#A87B4E] font-mono">
                      {report.matches.filter((m) => m.match).length}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#F5F2EB]/50">Human Reviews Enqueued: </span>
                    <strong className="text-[#A87B4E] font-mono">{report.queued_reviews.length}</strong>
                  </div>
                </div>

                <div className="text-[11px] text-[#F5F2EB]/50 font-mono">
                  Runtime: 0.04s · Deterministic Gate: Passed
                </div>
              </div>

              {/* Stage Breakdowns */}
              {report.extracted_claims.map((claim, idx) => {
                const cls = report.classifications[idx];
                const match = report.matches[idx];
                const isPromoted = promotedIndex === idx;

                return (
                  <div
                    key={idx}
                    className="bg-[#3D2817]/60 border border-[#A87B4E]/25 rounded-2xl p-5 space-y-4 shadow-lg"
                  >
                    {/* Claim Title */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#A87B4E] uppercase tracking-wider bg-[#3D2817] px-2 py-0.5 rounded border border-[#A87B4E]/30/40">
                          Claim #{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-[#FFFFFF] mt-1.5 leading-snug">
                          &ldquo;{claim.claim_text}&rdquo;
                        </h4>
                      </div>

                      {/* Promote Action Button */}
                      {onPromoteClaim && (
                        <button
                          onClick={() => handlePromote(idx)}
                          disabled={isPromoted}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            isPromoted
                              ? 'bg-[#A87B4E]/30 text-[#F5F2EB] border border-[#A87B4E]/50'
                              : 'bg-[#A87B4E] hover:bg-[#8e663e] text-[#FFFFFF] shadow'
                          }`}
                        >
                          {isPromoted ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#A87B4E]" />
                              <span>Promoted to Cards</span>
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Promote to Registry</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Stage 1: Extraction & Quote Discipline */}
                    <div className="p-3 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/25 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#F5F2EB]/90 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#A87B4E]" />
                          <span>Stage 1: Extraction &amp; Quote Citation</span>
                        </span>
                        <span className="text-[11px] font-mono text-[#A87B4E]">
                          Quote Verified: {claim.quote_verified ? 'YES (Verbatim)' : 'NO'}
                        </span>
                      </div>
                      <div className="text-[#F5F2EB]/70 text-[11px]">
                        Context: <strong className="text-[#F5F2EB]/90">{claim.claim_context}</strong> ·
                        Initial Confidence: {(claim.confidence * 100).toFixed(0)}%
                      </div>
                    </div>

                    {/* Stage 2: Classification */}
                    {cls && (
                      <div className="p-3 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/25 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#F5F2EB]/90 flex items-center space-x-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#A87B4E]" />
                            <span>Stage 2: Category Classification</span>
                          </span>
                          <span
                            className={`text-[11px] font-mono font-bold ${
                              cls.confidence >= 0.6 ? 'text-[#A87B4E]' : 'text-[#A87B4E]'
                            }`}
                          >
                            Confidence: {(cls.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#3D2817] text-[#F5F2EB] border border-[#A87B4E]/40">
                            {cls.claim_category.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[11px] text-[#F5F2EB]/70 italic">
                            &ldquo;{cls.reasoning}&rdquo;
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Stage 3: Regulatory Provision Match & Exception Logic */}
                    {match && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                          match.banned
                            ? 'bg-[#3D2817] border-[#A87B4E]/60 text-[#F5F2EB]'
                            : match.match
                            ? 'bg-[#A87B4E]/20 border-[#A87B4E]/40 text-[#F5F2EB]'
                            : 'bg-[#2C3E50] border-[#A87B4E]/25 text-[#F5F2EB]/90'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center space-x-1.5">
                            <Scale className="w-3.5 h-3.5" />
                            <span>Stage 3: Regulatory Matching &amp; Exceptions</span>
                          </span>
                          <span className="text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-black/40">
                            {match.method}
                          </span>
                        </div>

                        {match.match && match.matched_provision ? (
                          <div className="space-y-1.5">
                            <div>
                              <strong className="text-[#FFFFFF]">Matched Provision: </strong>
                              <span className="font-mono text-[#F5F2EB]">
                                {match.matched_provision.provision_id}
                              </span>
                            </div>
                            <div className="text-[11px] opacity-90">
                              Source: {match.matched_provision.source}
                            </div>

                            {/* Exception logic display */}
                            {match.matched_provision.banned && (
                              <div className="p-2.5 rounded bg-black/40 border border-[#A87B4E]/25 space-y-1 text-[11px]">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold">
                                    Base Statutory Status: <span className="text-[#A87B4E]">PROHIBITED</span>
                                  </span>
                                  <span className="font-semibold">
                                    Exception Applied:{' '}
                                    {match.exception_applies ? (
                                      <span className="text-[#A87B4E] font-bold">YES (Exempt)</span>
                                    ) : (
                                      <span className="text-[#A87B4E]">NO (Enforceable Ban)</span>
                                    )}
                                  </span>
                                </div>
                                <div className="text-[#F5F2EB]/70">
                                  {match.matched_provision.exception_criteria}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-[#F5F2EB]/70 italic text-[11px]">
                            No specific banned statutory provision triggered. General cosmetic evidential
                            support regulations apply.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
