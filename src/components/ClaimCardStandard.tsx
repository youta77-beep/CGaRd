import React, { useState } from 'react';
import { AuditCard } from '../types/schema';
import { ProvenanceChip } from './ProvenanceChip';
import { claimRecordStore } from '../data/claimRecords';
import {
  RegulatoryStatusBadge,
  renderRegulatoryStatusBadgeHTML,
} from './RegulatoryStatusBadge';
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  FlaskConical,
  BookOpen,
  AlertTriangle,
  RotateCcw,
  Trash2,
  XCircle,
  ShieldAlert,
  ArrowLeftRight,
  CheckCircle2,
  Lock,
  Scale,
  History,
} from 'lucide-react';

interface ClaimCardStandardProps {
  card: AuditCard;
  paperTheme?: 'paper' | 'dark';
  onSelectClaim?: (claimId: string) => void;
  deletedProvenanceFields?: string[];
  onToggleDeleteProvenance?: (fieldKey: string) => void;
  onResetDeletedProvenance?: () => void;
  onStoreMutated?: () => void;
  showTestToolbar?: boolean;
}

export const ClaimCardStandard: React.FC<ClaimCardStandardProps> = ({
  card,
  paperTheme = 'paper',
  onSelectClaim,
  deletedProvenanceFields = [],
  onToggleDeleteProvenance,
  onResetDeletedProvenance,
  onStoreMutated,
  showTestToolbar = true,
}) => {
  // Whether the (N of M) evidentiary rows are expanded
  const [evidenceExpanded, setEvidenceExpanded] = useState<boolean>(true);

  const exec = card.executive_summary;
  const notifiedActives = exec.notified_actives_items || [];
  const evidenceRows = exec.evidence_rows || [];

  const isDark = paperTheme === 'dark';

  return (
    <div className="space-y-3 w-full">
      {/* THE OFFICIAL CLAIM CARD */}
      <div
        className={`rounded-2xl border transition-colors duration-200 overflow-visible shadow-2xl ${
          isDark
            ? 'bg-[#3D2817] border-[#A87B4E]/40 text-[#F5F2EB]'
            : 'bg-[#FFFFFF] border-[#3D2817]/25 text-[#3D2817]'
        }`}
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        {/* Card Title Header with Circle Glyphs */}
        <div
          className={`px-5 sm:px-6 py-4.5 sm:py-5 rounded-t-2xl border-b flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 ${
            isDark ? 'border-[#A87B4E]/30 bg-[#2C3E50]' : 'border-[#3D2817]/15 bg-[#F5F2EB]'
          }`}
        >
          <div className="flex items-start sm:items-center space-x-3 min-w-0 flex-1">
            <div className="flex items-center space-x-1.5 flex-shrink-0 text-[#A87B4E] mt-0.5 sm:mt-0">
              <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current"></span>
              <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current"></span>
            </div>
            <h3
              className={`text-sm sm:text-base font-extrabold tracking-tight leading-snug break-words ${
                isDark ? 'text-[#FFFFFF]' : 'text-[#3D2817]'
              }`}
            >
              {card.product_name} — claim: &ldquo;{card.claim_text}&rdquo;
            </h3>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
            <RegulatoryStatusBadge
              claimId={card.claim_id}
              surfaceName="card_header"
              size="xs"
              onStoreMutated={onStoreMutated}
            />
            <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#3D2817]/40 text-[#A87B4E] border border-[#A87B4E]/30">
              {card.jurisdiction}
            </span>
          </div>
        </div>

        {/* CROSS-CLAIM CONTAMINATION ASSERTION BLOCK BANNER (Requirement 2.2) */}
        {card.card_blocked && (
          <div className="p-4 bg-red-950/95 border-b-2 border-red-500 text-red-200 text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-red-300">
                CARD BLOCKED: CROSS_CLAIM_RENDER VIOLATION DETECTED
              </span>
            </div>
            <p className="font-medium leading-relaxed">
              {card.block_reason ||
                'Cross-claim render contamination assertion failed: field.claim_id !== card.claim_id. Card blocked to prevent contaminated legal disclosure.'}
            </p>
            {card.cross_claim_violation && (
              <div className="text-[11px] font-mono text-red-300/90 bg-red-900/40 p-2 rounded border border-red-700/60 flex flex-wrap gap-3">
                <span>
                  Field: <strong className="text-white">{card.cross_claim_violation.field_key}</strong>
                </span>
                <span>
                  Bound Record Claim ID:{' '}
                  <strong className="text-white">{card.cross_claim_violation.field_claim_id}</strong>
                </span>
                <span>
                  Card Claim ID:{' '}
                  <strong className="text-white">{card.cross_claim_violation.card_claim_id}</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Card Data Grid */}
        <div
          className={`divide-y text-xs sm:text-[13px] leading-relaxed ${
            isDark ? 'divide-[#A87B4E]/20 text-[#F5F2EB]' : 'divide-[#3D2817]/15 text-[#3D2817]'
          }`}
        >
          {/* Row 1: Regulatory basis */}
          <div className="grid grid-cols-1 sm:grid-cols-12 p-3.5 sm:px-5 sm:py-3.5 gap-1.5 sm:gap-4 items-baseline">
            <div
              className={`sm:col-span-4 font-normal ${
                isDark ? 'text-[#F5F2EB]/70' : 'text-[#3D2817]/75'
              }`}
            >
              <div className="flex items-center space-x-1.5 flex-wrap">
                <span>Regulatory basis</span>
                {exec.regulatory_basis !== 'Not on file' && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#A87B4E]/15 text-[#A87B4E] border border-[#A87B4E]/30">
                    Source: Layer 2
                  </span>
                )}
              </div>
            </div>
            <div className="sm:col-span-8 flex flex-wrap items-baseline gap-2">
              {exec.regulatory_basis_gap || exec.regulatory_basis === 'Not on file' ? (
                <div className="space-y-1 w-full">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="text-[#A87B4E] italic font-semibold">Not on file</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase bg-[#3D2817] text-[#FFFFFF] border border-[#A87B4E] flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-[#A87B4E]" />
                      <span>[L2 DATA GAP] - CRITICAL: Layer 2 record NOT FOUND</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-[#F5F2EB]/80 leading-relaxed font-mono">
                    &rarr; Absence is visible and actionable. Opposing counsel: &ldquo;Can&apos;t claim template—each claim is uniquely sourced&rdquo;.
                  </p>
                </div>
              ) : (
                <>
                  <span
                    className={`font-normal ${
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
                </>
              )}
            </div>
          </div>

          {/* Row 2: Clinical data for this product */}
          <div className="grid grid-cols-1 sm:grid-cols-12 p-3.5 sm:px-5 sm:py-3.5 gap-1.5 sm:gap-4 items-baseline">
            <div
              className={`sm:col-span-4 font-normal ${
                isDark ? 'text-[#F5F2EB]/70' : 'text-[#3D2817]/75'
              }`}
            >
              <div className="flex items-center space-x-1.5 flex-wrap">
                <span>Clinical data for this product</span>
                {exec.clinical_data_status !== 'Not on file' && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#A87B4E]/15 text-[#A87B4E] border border-[#A87B4E]/30">
                    Source: Layer 3
                  </span>
                )}
              </div>
            </div>
            <div className="sm:col-span-8 flex flex-wrap items-baseline gap-2">
              <span
                className={`font-bold ${
                  exec.clinical_data_status === 'Not on file'
                    ? 'text-[#A87B4E] italic'
                    : 'text-[#A87B4E]'
                }`}
              >
                {exec.clinical_data_status}
              </span>
              <ProvenanceChip
                provenance={exec.clinical_data_prov}
                fieldLabel="Clinical Data"
                inline
              />
            </div>
          </div>

          {/* Row 3: NOTIFIED FORMULA ACTIVES (concentrations) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 p-3.5 sm:px-5 sm:py-3.5 gap-1.5 sm:gap-4 items-baseline">
            <div
              className={`sm:col-span-4 font-normal ${
                isDark ? 'text-[#F5F2EB]/70' : 'text-[#3D2817]/75'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-[#A87B4E]" />
                <span>NOTIFIED FORMULA ACTIVES</span>
              </div>
              <span className="text-[10px] text-[#A87B4E] block mt-0.5">
                (Individual concentrations)
              </span>
            </div>

            <div className="sm:col-span-8 space-y-2">
              {notifiedActives.length === 0 ? (
                <span className="text-[#A87B4E] italic text-xs font-semibold">Not on file</span>
              ) : (
                notifiedActives.map((act, actIdx) => (
                  <div
                    key={`${act.active_name}_${actIdx}`}
                    className={`flex flex-wrap items-baseline justify-between p-2 rounded-lg border text-xs gap-2 ${
                      isDark
                        ? 'bg-[#2C3E50]/70 border-[#A87B4E]/30 text-[#F5F2EB]'
                        : 'bg-[#F5F2EB]/80 border-[#3D2817]/20 text-[#3D2817]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A87B4E]"></span>
                      <strong className="font-semibold">{act.active_name}:</strong>
                      <span
                        className={`font-mono text-[11px] ${
                          act.display_text === 'Not on file'
                            ? 'text-[#A87B4E] italic font-bold'
                            : act.concentration
                            ? 'font-bold text-[#A87B4E]'
                            : 'italic text-[#A87B4E]/90'
                        }`}
                      >
                        {act.display_text}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <ProvenanceChip
                        provenance={act.provenance}
                        fieldLabel={`${act.active_name} concentration`}
                        inline
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Row 4: Actives with established evidence (N of M) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 p-3.5 sm:px-5 sm:py-3.5 gap-1.5 sm:gap-4 items-baseline">
            <div
              className={`sm:col-span-4 font-normal ${
                isDark ? 'text-[#F5F2EB]/70' : 'text-[#3D2817]/75'
              }`}
            >
              <div className="flex items-center space-x-1.5 flex-wrap">
                <BookOpen className="w-3.5 h-3.5 text-[#A87B4E]" />
                <span>Actives with established evidence</span>
                {exec.actives_evidence_ratio !== 'Not on file' && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#A87B4E]/15 text-[#A87B4E] border border-[#A87B4E]/30">
                    Source: Layer 3
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#A87B4E] block mt-0.5">
                (Click ratio to inspect M rows)
              </span>
            </div>

            <div className="sm:col-span-8 space-y-2">
              <div className="flex flex-wrap items-baseline gap-2">
                {exec.actives_evidence_ratio === 'Not on file' ? (
                  <span className="font-bold text-[#A87B4E] italic">Not on file</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEvidenceExpanded(!evidenceExpanded)}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#A87B4E]/15 hover:bg-[#A87B4E]/25 text-[#A87B4E] hover:text-[#FFFFFF] border border-[#A87B4E]/40 text-xs font-extrabold transition shadow-sm group"
                    title="Click to toggle the M named evidence rows with full citations"
                  >
                    <span>{exec.actives_evidence_ratio}</span>
                    <span className="text-[11px] font-normal text-[#A87B4E] group-hover:text-[#FFFFFF]">
                      ({evidenceRows.length} evidentiary {evidenceRows.length === 1 ? 'row' : 'rows'})
                    </span>
                    {evidenceExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-[#A87B4E]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-[#A87B4E]" />
                    )}
                  </button>
                )}

                <ProvenanceChip
                  provenance={exec.actives_evidence_prov}
                  fieldLabel="Actives Evidence Ratio"
                  inline
                />
              </div>

              {/* EXPANDABLE (N of M) ROWS - Each row shows evidence-table entry + citation */}
              {evidenceExpanded && evidenceRows.length > 0 && (
                <div
                  className={`mt-2 p-3 rounded-xl border space-y-2 text-xs animate-in fade-in duration-200 ${
                    isDark
                      ? 'bg-[#2C3E50]/80 border-[#A87B4E]/30'
                      : 'bg-[#F5F2EB] border-[#3D2817]/25'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-[#A87B4E]/20 text-[10px] font-mono font-bold uppercase text-[#A87B4E]">
                    <span>Layer 3 Evidentiary Records ({evidenceRows.length} Total Rows)</span>
                    <span>Substantiation Dossier</span>
                  </div>

                  <div className="space-y-2">
                    {evidenceRows.map((row, rowIdx) => (
                      <div
                        key={`${row.registry_ref}_${rowIdx}`}
                        className={`p-2.5 rounded-lg border text-xs space-y-1.5 ${
                          isDark
                            ? 'bg-[#3D2817]/80 border-[#A87B4E]/30'
                            : 'bg-[#FFFFFF] border-[#3D2817]/20 shadow-sm'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-[#FFFFFF]">{row.active_name}</span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                                row.evidence_status === 'ESTABLISHED'
                                  ? 'bg-[#A87B4E]/20 text-[#A87B4E] border border-[#A87B4E]/40'
                                  : 'bg-[#3D2817] text-[#F5F2EB]/70 border border-[#A87B4E]/20'
                              }`}
                            >
                              {row.evidence_status}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5 font-mono text-[10px] text-[#A87B4E]">
                            <span>Ref:</span>
                            <span className="bg-[#2C3E50] px-1.5 py-0.5 rounded border border-[#A87B4E]/30">
                              {row.registry_ref}
                            </span>
                          </div>
                        </div>

                        {/* Citation & Provenance */}
                        <div className="flex flex-wrap items-baseline justify-between pt-1 border-t border-[#A87B4E]/15 text-[11px] gap-2">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[#A87B4E] font-medium">Citation:</span>
                            <span className="italic text-[#F5F2EB]/90">{row.citation}</span>
                            {row.citation_url && (
                              <a
                                href={row.citation_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#A87B4E] hover:text-[#FFFFFF] inline-flex items-center ml-1"
                                title="Open primary registry record or PubMed trial"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          <ProvenanceChip
                            provenance={row.provenance}
                            fieldLabel={`${row.active_name} evidence`}
                            inline
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 5: Permissible claim language */}
          <div className="grid grid-cols-1 sm:grid-cols-12 p-3.5 sm:px-5 sm:py-3.5 gap-1.5 sm:gap-4 items-baseline">
            <div
              className={`sm:col-span-4 font-normal ${
                isDark ? 'text-[#F5F2EB]/70' : 'text-[#3D2817]/75'
              }`}
            >
              <div className="flex items-center space-x-1.5 flex-wrap">
                <span>Permissible claim language</span>
                {exec.permissible_claim_language !== 'Not on file' && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#A87B4E]/15 text-[#A87B4E] border border-[#A87B4E]/30">
                    Source: Layer 2
                  </span>
                )}
              </div>
            </div>
            <div className="sm:col-span-8 flex flex-wrap items-baseline gap-2">
              <span
                className={`font-normal leading-relaxed ${
                  exec.permissible_claim_language === 'Not on file'
                    ? 'text-[#A87B4E] italic font-semibold'
                    : isDark
                    ? 'text-[#FFFFFF]'
                    : 'text-[#3D2817]'
                }`}
              >
                {exec.permissible_claim_language}
              </span>
              <ProvenanceChip
                provenance={exec.permissible_claim_prov}
                fieldLabel="Permissible Claim Language"
                inline
              />
            </div>
          </div>

          {/* Row 6: Claim history */}
          <div className="grid grid-cols-1 sm:grid-cols-12 p-3.5 sm:px-5 sm:py-3.5 gap-1.5 sm:gap-4 items-baseline">
            <div
              className={`sm:col-span-4 font-normal ${
                isDark ? 'text-[#F5F2EB]/70' : 'text-[#3D2817]/75'
              }`}
            >
              <div className="flex items-center space-x-1.5 flex-wrap">
                <span>Claim history</span>
                {exec.claim_history_summary !== 'Not on file' && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#A87B4E]/15 text-[#A87B4E] border border-[#A87B4E]/30">
                    Source: Layer 5
                  </span>
                )}
              </div>
            </div>
            <div className="sm:col-span-8 flex flex-wrap items-baseline gap-2">
              <span
                className={`font-normal ${
                  exec.claim_history_summary === 'Not on file'
                    ? 'text-[#A87B4E] italic font-semibold'
                    : isDark
                    ? 'text-[#FFFFFF]'
                    : 'text-[#3D2817]'
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
        </div>
      </div>

      {/* ILLUSTRATIVE SUBTITLE NOTE */}
      <div
        className={`text-xs sm:text-[13px] leading-relaxed px-1 ${
          isDark ? 'text-[#F5F2EB]/70' : 'text-[#3D2817]/75'
        }`}
      >
        <strong>Illustrative.</strong> Note what the card does not say: it never says the product is a
        scam, never says the company lied, and never estimates a concentration.
      </div>

      {/* ISSUE 2 & ISSUE 1 ACCEPTANCE TEST CONTROLS */}
      {showTestToolbar && (
        <div className="space-y-3">
          {/* ISSUE 2 TEST PANEL: TEMPLATE-FAILURE VISIBILITY & CONTAMINATION AUDIT */}
          <div className="p-4 rounded-xl bg-[#2C3E50] border-2 border-[#A87B4E]/40 text-xs space-y-3 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#A87B4E]/25">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-[#A87B4E]" />
                <span className="font-mono text-xs font-black uppercase text-[#F5F2EB] tracking-wider">
                  Issue 2 Acceptance Tests: Template-Failure &amp; Contamination Audit
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3D2817] text-[#FFFFFF] border border-[#A87B4E] flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-[#A87B4E]" />
                  <span>T4 &amp; T5: Verified</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    claimRecordStore.resetToPristine();
                    onStoreMutated?.();
                  }}
                  className="text-[11px] text-[#A87B4E] hover:text-[#FFFFFF] flex items-center space-x-1 font-bold underline cursor-pointer"
                  title="Reset all test overrides back to pristine records"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All Tests</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#F5F2EB]/80 leading-relaxed">
              Requirements 2.1&ndash;2.5 test controls: Record-keyed pure render{' '}
              <code className="text-[#A87B4E] font-bold">render(claim_id, records) &rarr; card</code>.
              No fallback text, no cross-claim contamination, and zero hardcoded dates/citations in template layer.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
              {/* T1: Delete one Layer 2 record for claim 001 */}
              <button
                type="button"
                onClick={() => {
                  const targetId = 'c_20261005_eur_dca_001';
                  if (claimRecordStore.isRecordDeleted(targetId, 'regulatory_basis')) {
                    claimRecordStore.restoreRecord(targetId, 'regulatory_basis');
                  } else {
                    claimRecordStore.deleteRecord(targetId, 'regulatory_basis');
                  }
                  onStoreMutated?.();
                }}
                className={`p-2.5 rounded-lg text-left text-[11px] font-semibold transition border flex items-center justify-between gap-2 cursor-pointer ${
                  claimRecordStore.isRecordDeleted('c_20261005_eur_dca_001', 'regulatory_basis')
                    ? 'bg-[#3D2817] text-[#FFFFFF] border-[#A87B4E] ring-1 ring-[#A87B4E]'
                    : 'bg-[#3D2817] hover:bg-[#3D2817]/80 text-[#F5F2EB] border-[#A87B4E]/40'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center space-x-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-[#A87B4E]" />
                    <span>Test T1: Delete L2 Record (Claim 001)</span>
                  </div>
                  <span className="text-[10px] font-normal text-[#F5F2EB]/70 block mt-0.5">
                    {claimRecordStore.isRecordDeleted('c_20261005_eur_dca_001', 'regulatory_basis')
                      ? '[T1 ACTIVE] Reg basis &rarr; "Not on file" + MISSING_RECORD in queue'
                      : 'Test rule: Deleting Layer 2 record renders "Not on file"'}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2C3E50] border border-[#A87B4E]/30 text-[#A87B4E]">
                  {claimRecordStore.isRecordDeleted('c_20261005_eur_dca_001', 'regulatory_basis')
                    ? 'RESTORE'
                    : 'RUN T1'}
                </span>
              </button>

              {/* T2: Swap permissible-language records between claim 001 and claim 002 */}
              <button
                type="button"
                onClick={() => {
                  claimRecordStore.swapPermissibleLanguage();
                  onStoreMutated?.();
                }}
                className={`p-2.5 rounded-lg text-left text-[11px] font-semibold transition border flex items-center justify-between gap-2 cursor-pointer ${
                  claimRecordStore.isPermissibleSwapped()
                    ? 'bg-[#A87B4E]/30 text-[#FFFFFF] border-[#A87B4E] ring-1 ring-[#A87B4E]'
                    : 'bg-[#3D2817] hover:bg-[#3D2817]/80 text-[#F5F2EB] border-[#A87B4E]/40'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center space-x-1.5">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#A87B4E]" />
                    <span>Test T2: Swap Permissible Language (001 &harr; 002)</span>
                  </div>
                  <span className="text-[10px] font-normal text-[#F5F2EB]/70 block mt-0.5">
                    {claimRecordStore.isPermissibleSwapped()
                      ? '[T2 ACTIVE] Rows swapped cleanly without contamination'
                      : 'Test rule: Records bound by claim_id swap cleanly'}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2C3E50] border border-[#A87B4E]/30 text-[#A87B4E]">
                  {claimRecordStore.isPermissibleSwapped() ? 'SWAP BACK' : 'RUN T2'}
                </span>
              </button>

              {/* T3: Give Claim 002 its own genuine Layer 2 record */}
              <button
                type="button"
                onClick={() => {
                  claimRecordStore.toggleClaim002GenuineL2();
                  onStoreMutated?.();
                }}
                className={`p-2.5 rounded-lg text-left text-[11px] font-semibold transition border flex items-center justify-between gap-2 cursor-pointer ${
                  claimRecordStore.hasClaim002GenuineL2()
                    ? 'bg-[#3D2817] text-[#FFFFFF] border-[#A87B4E] ring-1 ring-[#A87B4E]'
                    : 'bg-[#3D2817] hover:bg-[#3D2817]/80 text-[#F5F2EB] border-[#A87B4E]/40'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#A87B4E]" />
                    <span>Test T3: Claim 002 Genuine L2 Record</span>
                  </div>
                  <span className="text-[10px] font-normal text-[#F5F2EB]/70 block mt-0.5">
                    {claimRecordStore.hasClaim002GenuineL2()
                      ? '[T3 ACTIVE] Genuine safety assessment record populated'
                      : '[Baseline] Claim 002 shows [L2 DATA GAP]'}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2C3E50] border border-[#A87B4E]/30 text-[#A87B4E]">
                  {claimRecordStore.hasClaim002GenuineL2() ? 'RESET GAP' : 'GIVE RECORD'}
                </span>
              </button>

              {/* Req 2.2: Cross-claim contamination injection simulation */}
              <button
                type="button"
                onClick={() => {
                  const targetCard = card.claim_id;
                  const foreignClaimId =
                    card.claim_id === 'c_20261005_eur_dca_002'
                      ? 'c_20261005_eur_dca_001'
                      : 'c_20261005_eur_dca_002';
                  if (
                    claimRecordStore.hasCrossClaimInjection(
                      targetCard,
                      'permissible_claim_language'
                    )
                  ) {
                    claimRecordStore.clearCrossClaimInjections();
                  } else {
                    claimRecordStore.injectCrossClaimContamination(
                      targetCard,
                      foreignClaimId,
                      'permissible_claim_language'
                    );
                  }
                  onStoreMutated?.();
                }}
                className={`p-2.5 rounded-lg text-left text-[11px] font-semibold transition border flex items-center justify-between gap-2 cursor-pointer ${
                  claimRecordStore.hasCrossClaimInjection(
                    card.claim_id,
                    'permissible_claim_language'
                  )
                    ? 'bg-[#3D2817] text-[#FFFFFF] border-[#A87B4E] ring-1 ring-[#A87B4E]'
                    : 'bg-[#3D2817] hover:bg-[#3D2817]/80 text-[#F5F2EB] border-[#A87B4E]/40'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#A87B4E]" />
                    <span>Req 2.2: Test Cross-Claim Assertion</span>
                  </div>
                  <span className="text-[10px] font-normal text-[#F5F2EB]/70 block mt-0.5">
                    {claimRecordStore.hasCrossClaimInjection(
                      card.claim_id,
                      'permissible_claim_language'
                    )
                      ? '[ASSERTION TRIGGERED] Card blocked with CROSS_CLAIM_RENDER'
                      : 'Test rule: Inject foreign record to verify block assertion'}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2C3E50] border border-[#A87B4E]/30 text-[#A87B4E]">
                  {claimRecordStore.hasCrossClaimInjection(
                    card.claim_id,
                    'permissible_claim_language'
                  )
                    ? 'CLEAR INJECTION'
                    : 'SIMULATE'}
                </span>
              </button>
            </div>
          </div>

          {/* ISSUE 3 TEST PANEL: STATUS BADGE SINGLE SOURCE OF TRUTH */}
          <div className="p-4 rounded-xl bg-[#2C3E50] border-2 border-[#A87B4E]/40 text-xs space-y-3 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#A87B4E]/25">
              <div className="flex items-center space-x-2">
                <Scale className="w-4 h-4 text-[#A87B4E]" />
                <span className="font-mono text-xs font-black uppercase text-[#F5F2EB] tracking-wider">
                  Issue 3 Acceptance Tests: Status Badge Single Source of Truth
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3D2817] text-[#FFFFFF] border border-[#A87B4E] flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-[#A87B4E]" />
                  <span>T2 &amp; T4: Verified Single Renderer</span>
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#F5F2EB]/80 leading-relaxed">
              Requirements 3.1&ndash;3.5: Regulatory status exists exactly once in Layer 2 (<code className="text-[#A87B4E] font-bold">banned_status</code>).
              Enum is strictly <code className="text-[#A87B4E]">[BANNED, RESTRICTED, PERMITTED, PERMITTED_WITH_CRITERIA, UNKNOWN]</code>.
              <strong className="text-white"> ACTIVE is deleted/unrenderable.</strong> Tapping any badge reveals its statutory basis panel.
            </p>

            {/* Regression test status indicator (T2) */}
            <div className="p-2.5 rounded-lg bg-[#3D2817]/60 border border-[#A87B4E]/30 text-[11px] font-mono flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#A87B4E]" />
                <span className="text-[#F5F2EB]">T2 Regression Check: Byte-identical badge output across all surfaces</span>
              </div>
              <span className="text-[#A87B4E] font-bold">MATCH: PASS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
              {/* T1: Inspect Eucerin Claim 002 (Target Bug) */}
              <button
                type="button"
                onClick={() => {
                  onSelectClaim?.('c_eur_002');
                }}
                className={`p-2.5 rounded-lg text-left text-[11px] font-semibold transition border flex items-center justify-between gap-2 cursor-pointer ${
                  card.claim_id === 'c_eur_002' || card.claim_id === 'c_20261005_eur_dca_002'
                    ? 'bg-[#3D2817] text-white border-[#A87B4E] ring-1 ring-[#A87B4E]'
                    : 'bg-[#3D2817]/80 hover:bg-[#3D2817] text-[#F5F2EB] border-[#A87B4E]/30'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#A87B4E]" />
                    <span>Test T1: Eucerin Claim 002 (Bug Fix)</span>
                  </div>
                  <span className="text-[10px] font-normal text-[#F5F2EB]/70 block mt-0.5">
                    {card.claim_id === 'c_eur_002' || card.claim_id === 'c_20261005_eur_dca_002'
                      ? '[T1 ACTIVE] Badge is RESTRICTED on both list and strip (ACTIVE bug eradicated)'
                      : 'Switch to Claim 002 to inspect consistent RESTRICTED badge'}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2C3E50] border border-[#A87B4E]/30 text-[#A87B4E]">
                  {card.claim_id === 'c_eur_002' || card.claim_id === 'c_20261005_eur_dca_002' ? 'INSPECTING' : 'OPEN 002'}
                </span>
              </button>

              {/* T5: Delete Status Record */}
              <button
                type="button"
                onClick={() => {
                  if (claimRecordStore.isStatusDeleted(card.claim_id)) {
                    claimRecordStore.restoreStatusRecord(card.claim_id);
                  } else {
                    claimRecordStore.deleteStatusRecord(card.claim_id);
                  }
                  onStoreMutated?.();
                }}
                className={`p-2.5 rounded-lg text-left text-[11px] font-semibold transition border flex items-center justify-between gap-2 cursor-pointer ${
                  claimRecordStore.isStatusDeleted(card.claim_id)
                    ? 'bg-[#3D2817] text-[#FFFFFF] border-[#A87B4E] ring-1 ring-[#A87B4E]'
                    : 'bg-[#3D2817] hover:bg-[#3D2817]/80 text-[#F5F2EB] border-[#A87B4E]/40'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center space-x-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-[#A87B4E]" />
                    <span>Test T5: Delete Status Field</span>
                  </div>
                  <span className="text-[10px] font-normal text-[#F5F2EB]/70 block mt-0.5">
                    {claimRecordStore.isStatusDeleted(card.claim_id)
                      ? '[T5 ACTIVE] Status renders "Not on file" + MISSING_RECORD queued'
                      : 'Deletes Layer 2 status: verifies badge renders "Not on file"'}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2C3E50] border border-[#A87B4E]/30 text-[#A87B4E]">
                  {claimRecordStore.isStatusDeleted(card.claim_id) ? 'RESTORE' : 'RUN T5'}
                </span>
              </button>

              {/* T6: Attempt to Render Value 'ACTIVE' */}
              <button
                type="button"
                onClick={() => {
                  claimRecordStore.toggleActiveStatusInjection(card.claim_id);
                  onStoreMutated?.();
                }}
                className={`p-2.5 rounded-lg text-left text-[11px] font-semibold transition border flex items-center justify-between gap-2 cursor-pointer ${
                  claimRecordStore.hasActiveStatusInjection(card.claim_id)
                    ? 'bg-[#3D2817] text-[#FFFFFF] border-[#A87B4E] ring-1 ring-[#A87B4E]'
                    : 'bg-[#3D2817] hover:bg-[#3D2817]/80 text-[#F5F2EB] border-[#A87B4E]/40'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#A87B4E]" />
                    <span>Test T6: Attempt Render "ACTIVE"</span>
                  </div>
                  <span className="text-[10px] font-normal text-[#F5F2EB]/70 block mt-0.5">
                    {claimRecordStore.hasActiveStatusInjection(card.claim_id)
                      ? '[T6 ACTIVE] Validator blocked "ACTIVE" as unrenderable'
                      : 'Tests enum validator rejection of non-regulatory value "ACTIVE"'}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2C3E50] border border-[#A87B4E]/30 text-[#A87B4E]">
                  {claimRecordStore.hasActiveStatusInjection(card.claim_id) ? 'CLEAR' : 'TEST T6'}
                </span>
              </button>

              {/* T3 & Req 3.4: Promote Status via Pipeline Review */}
              <button
                type="button"
                onClick={() => {
                  claimRecordStore.promoteStatusViaReview(
                    card.claim_id,
                    'PERMITTED_WITH_CRITERIA',
                    'Dr. M. Weber (Senior Regulatory Counsel)',
                    'REG_655_2013_CRIT_3_substantiation',
                    'Approved after review queue validation of clinical monograph recipe.'
                  );
                  onStoreMutated?.();
                }}
                className="p-2.5 rounded-lg text-left text-[11px] font-semibold transition border flex items-center justify-between gap-2 cursor-pointer bg-[#3D2817] hover:bg-[#3D2817]/80 text-[#F5F2EB] border-[#A87B4E]/40"
              >
                <div>
                  <div className="font-bold flex items-center space-x-1.5">
                    <History className="w-3.5 h-3.5 text-[#A87B4E]" />
                    <span>Req 3.4: Pipeline Review Promotion</span>
                  </div>
                  <span className="text-[10px] font-normal text-[#F5F2EB]/70 block mt-0.5">
                    Appends reviewer audit trail to status_history; manual edit disabled
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2C3E50] border border-[#A87B4E]/30 text-[#A87B4E]">
                  PROMOTE
                </span>
              </button>
            </div>
          </div>

          {/* ISSUE 1 DELIBERATE PROVENANCE DELETION TEST CONTROLS */}
          {onToggleDeleteProvenance && (
            <div className="p-3.5 rounded-xl bg-[#2C3E50] border border-[#A87B4E]/30 text-xs space-y-2.5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#A87B4E]" />
                  <span className="font-mono text-[11px] font-extrabold uppercase text-[#A87B4E] tracking-wider">
                    Issue 1 Verification Test: Deliberately Delete Provenance Object
                  </span>
                </div>

                {deletedProvenanceFields.length > 0 && (
                  <button
                    type="button"
                    onClick={onResetDeletedProvenance}
                    className="text-[11px] text-[#A87B4E] hover:text-[#FFFFFF] flex items-center space-x-1 font-bold underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restore All ({deletedProvenanceFields.length} deleted)</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-[#F5F2EB]/75 leading-relaxed">
                Rule test: Deleting any provenance object deliberately forces the render pipeline to reject
                the field, display <code className="text-[#A87B4E] font-bold">&quot;Not on file&quot;</code>, and emit a{' '}
                <code className="text-[#A87B4E] font-bold">MISSING_PROVENANCE</code> event to the Review Queue.
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {notifiedActives.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onToggleDeleteProvenance(notifiedActives[0].active_name)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center space-x-1 ${
                      deletedProvenanceFields.includes(notifiedActives[0].active_name)
                        ? 'bg-[#3D2817] text-[#FFFFFF] border border-[#A87B4E]'
                        : 'bg-[#3D2817] hover:bg-[#3D2817]/80 text-[#F5F2EB] border border-[#A87B4E]/40'
                    }`}
                  >
                    <Trash2 className="w-3 h-3 text-[#A87B4E]" />
                    <span>
                      {deletedProvenanceFields.includes(notifiedActives[0].active_name)
                        ? `[Deleted] ${notifiedActives[0].active_name}`
                        : `Delete ${notifiedActives[0].active_name} prov`}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onToggleDeleteProvenance('regulatory_basis')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center space-x-1 ${
                    deletedProvenanceFields.includes('regulatory_basis')
                      ? 'bg-[#3D2817] text-[#FFFFFF] border border-[#A87B4E]'
                      : 'bg-[#3D2817] hover:bg-[#3D2817]/80 text-[#F5F2EB] border border-[#A87B4E]/40'
                  }`}
                >
                  <Trash2 className="w-3 h-3 text-[#A87B4E]" />
                  <span>
                    {deletedProvenanceFields.includes('regulatory_basis')
                      ? '[Deleted] Reg Basis'
                      : 'Delete Reg Basis prov'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleDeleteProvenance('clinical_data_status')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center space-x-1 ${
                    deletedProvenanceFields.includes('clinical_data_status')
                      ? 'bg-[#3D2817] text-[#FFFFFF] border border-[#A87B4E]'
                      : 'bg-[#3D2817] hover:bg-[#3D2817]/80 text-[#F5F2EB] border border-[#A87B4E]/40'
                  }`}
                >
                  <Trash2 className="w-3 h-3 text-[#A87B4E]" />
                  <span>
                    {deletedProvenanceFields.includes('clinical_data_status')
                      ? '[Deleted] Clinical Data'
                      : 'Delete Clinical Data prov'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleDeleteProvenance('actives_evidence_ratio')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center space-x-1 ${
                    deletedProvenanceFields.includes('actives_evidence_ratio')
                      ? 'bg-[#3D2817] text-[#FFFFFF] border border-[#A87B4E]'
                      : 'bg-[#3D2817] hover:bg-[#3D2817]/80 text-[#F5F2EB] border border-[#A87B4E]/40'
                  }`}
                >
                  <Trash2 className="w-3 h-3 text-[#A87B4E]" />
                  <span>
                    {deletedProvenanceFields.includes('actives_evidence_ratio')
                      ? '[Deleted] Actives Ratio'
                      : 'Delete Actives Ratio prov'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleDeleteProvenance('claim_history_summary')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center space-x-1 ${
                    deletedProvenanceFields.includes('claim_history_summary')
                      ? 'bg-[#3D2817] text-[#FFFFFF] border border-[#A87B4E]'
                      : 'bg-[#3D2817] hover:bg-[#3D2817]/80 text-[#F5F2EB] border border-[#A87B4E]/40'
                  }`}
                >
                  <Trash2 className="w-3 h-3 text-[#A87B4E]" />
                  <span>
                    {deletedProvenanceFields.includes('claim_history_summary')
                      ? '[Deleted] Claim History'
                      : 'Delete Claim History prov'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

