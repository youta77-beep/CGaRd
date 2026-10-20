import React, { useState } from 'react';
import { ReviewQueueItem, Layer6Correction, Confidence } from '../types/schema';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface ReviewQueueManagerProps {
  queue: ReviewQueueItem[];
  onResolveItem: (
    itemId: string,
    resolution: string,
    correctionNote: string,
    confidenceAfter: Confidence
  ) => void;
  allCorrections: Layer6Correction[];
}

export const ReviewQueueManager: React.FC<ReviewQueueManagerProps> = ({
  queue,
  onResolveItem,
  allCorrections,
}) => {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [correctionNote, setCorrectionNote] = useState('');
  const [targetConfidence, setTargetConfidence] = useState<Confidence>('HIGH');

  const pendingItems = queue.filter((item) => !item.resolved_at);
  const resolvedItems = queue.filter((item) => item.resolved_at);

  const activeItem = queue.find((i) => i.id === activeItemId);

  const handleOpenResolve = (item: ReviewQueueItem) => {
    setActiveItemId(item.id);
    if (item.stage === 'provenance') {
      setResolutionText(
        `Restored valid primary provenance object (source_url, captured_date, verbatim primary quote) verified against regulatory archive.`
      );
      setCorrectionNote(
        `MISSING_PROVENANCE exception resolved: Field "${item.payload?.field_label || item.payload?.field_key || 'unknown'}" re-authenticated with primary registry evidence.`
      );
    } else {
      setResolutionText(`Approved under manual human auditor protocol with documented evidentiary basis.`);
      setCorrectionNote(`Review queue flag resolved by compliance officer.`);
    }
    setTargetConfidence('HIGH');
  };

  const handleConfirmResolve = () => {
    if (!activeItemId) return;
    onResolveItem(activeItemId, resolutionText, correctionNote, targetConfidence);
    setActiveItemId(null);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-[#3D2817]/60 border border-[#A87B4E]/25 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[#A87B4E] font-bold text-sm mb-1">
              <AlertTriangle className="w-5 h-5" />
              <span>Architectural Confidence Routing Queue</span>
            </div>
            <h2 className="text-xl font-extrabold text-[#FFFFFF]">
              Human Review &amp; Displayed Correction Log
            </h2>
            <p className="text-xs text-[#F5F2EB]/70 mt-1 max-w-3xl leading-relaxed">
              In accordance with the regulatory system commitments:{' '}
              <strong className="text-[#F5F2EB]">
                &ldquo;Below-threshold confidence goes to the human review queue, not the card.&rdquo;
              </strong>{' '}
              Every manual adjustment automatically logs to Layer 6, turning audit corrections into
              a public transparent proof asset.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/25 text-center">
              <div className="text-lg font-mono font-extrabold text-[#A87B4E]">
                {pendingItems.length}
              </div>
              <div className="text-[10px] text-[#F5F2EB]/50 uppercase tracking-wider font-semibold">
                Pending Actions
              </div>
            </div>
            <div className="p-3 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/25 text-center">
              <div className="text-lg font-mono font-extrabold text-[#A87B4E]">
                {allCorrections.length}
              </div>
              <div className="text-[10px] text-[#F5F2EB]/50 uppercase tracking-wider font-semibold">
                Audited Corrections
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Review Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Items List */}
        <div className="bg-[#3D2817]/60 border border-[#A87B4E]/25 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#A87B4E]/25">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F2EB]/90 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#A87B4E]" />
              <span>Pending Review Items ({pendingItems.length})</span>
            </h3>
            <span className="text-[11px] text-[#F5F2EB]/50 font-mono">Confidence &lt; 0.60 Gate</span>
          </div>

          {pendingItems.length === 0 ? (
            <div className="p-12 text-center text-[#F5F2EB]/50 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#A87B4E]/50 mx-auto" />
              <p className="text-xs text-[#F5F2EB]/70">No items pending human adjudication.</p>
              <p className="text-[11px] text-[#F5F2EB]/50">
                Run the pipeline with ambiguous or low-confidence claims to test automated routing.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/25 space-y-2 hover:border-[#A87B4E]/30 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    {item.event_name === 'MISSING_PROVENANCE' || item.stage === 'provenance' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#3D2817] text-[#FFFFFF] border border-[#A87B4E]/50 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-[#A87B4E]" />
                        <span>MISSING_PROVENANCE</span>
                      </span>
                    ) : item.event_name === 'MISSING_RECORD' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#3D2817] text-[#FFFFFF] border border-[#A87B4E]/50 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-[#A87B4E]" />
                        <span>MISSING_RECORD</span>
                      </span>
                    ) : item.event_name === 'CROSS_CLAIM_RENDER' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#3D2817] text-[#FFFFFF] border border-[#A87B4E] flex items-center space-x-1">
                        <XCircle className="w-3 h-3 text-[#A87B4E]" />
                        <span>CROSS_CLAIM_RENDER</span>
                      </span>
                    ) : item.event_name === 'IDENTICAL_CARD_CONTENT' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#A87B4E]/20 text-[#F5F2EB] border border-[#A87B4E]/40 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-[#A87B4E]" />
                        <span>IDENTICAL_CARD_CONTENT (WARNING)</span>
                      </span>
                    ) : item.event_name === 'EVIDENCE_TABLE_STALE' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#A87B4E]/20 text-[#F5F2EB] border border-[#A87B4E]/40 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-[#A87B4E]" />
                        <span>EVIDENCE_TABLE_STALE (WARNING)</span>
                      </span>
                    ) : item.event_name === 'COUNT_DENOMINATOR_UNRESOLVED' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#A87B4E]/20 text-[#F5F2EB] border border-[#A87B4E]/40 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-[#A87B4E]" />
                        <span>COUNT_DENOMINATOR_UNRESOLVED (WARNING)</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#A87B4E]/15 text-[#A87B4E] border border-[#A87B4E]/30">
                        Stage: {item.stage}
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-[#A87B4E] font-bold">
                      Confidence: {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <p className="text-xs font-medium text-[#F5F2EB] leading-relaxed">
                    &ldquo;{item.claim_text}&rdquo;
                  </p>

                  <div
                    className={`text-[11px] p-2 rounded border leading-relaxed ${
                      item.stage === 'provenance'
                        ? 'bg-[#3D2817] text-[#F5F2EB] border-[#A87B4E]/30'
                        : 'bg-[#3D2817]/60 text-[#F5F2EB]/90 border-[#A87B4E]/20'
                    }`}
                  >
                    <strong>Routing Reason: </strong> {item.reason}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#A87B4E]/20">
                    <span className="text-[10px] text-[#F5F2EB]/50 font-mono">
                      Queued: {item.created_at.split('T')[0]}
                    </span>
                    <button
                      onClick={() => handleOpenResolve(item)}
                      className="px-3 py-1 rounded-lg text-[#FFFFFF] text-xs font-semibold flex items-center space-x-1 shadow transition bg-[#A87B4E] hover:bg-[#8e663e]"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>{item.stage === 'provenance' ? 'Remediate Provenance' : 'Adjudicate Item'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Displayed Correction Log (LAYER 6) */}
        <div className="bg-[#3D2817]/60 border border-[#A87B4E]/25 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#A87B4E]/25">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F2EB]/90 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#A87B4E]" />
              <span>Layer 6 · Transparent Correction Log (Public Asset)</span>
            </h3>
            <span className="text-[11px] text-[#A87B4E] font-mono">
              {allCorrections.length} Audited Entries
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {allCorrections.map((corr) => (
              <div
                key={corr.correction_id}
                className="p-3.5 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/25 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#3D2817] text-[#F5F2EB] border border-[#A87B4E]/30/40">
                    {corr.flag_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] text-[#F5F2EB]/50 font-mono">
                    {corr.flagged_date}
                  </span>
                </div>

                <div className="text-[#F5F2EB]/90">
                  <strong className="text-[#F5F2EB]/70">Issue: </strong>
                  {corr.issue_description}
                </div>

                {corr.correction_made && (
                  <div className="p-2 bg-[#3D2817]/60 border border-[#A87B4E]/30 rounded text-[#F5F2EB] text-[11px]">
                    <strong>Auditor Determination: </strong>
                    {corr.correction_made}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-[#F5F2EB]/50 pt-1 border-t border-[#A87B4E]/15">
                  <span>Auditor: {corr.flagged_by}</span>
                  <span className="text-[#A87B4E] font-semibold font-mono">
                    Post-Correction: {corr.confidence_after_correction}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Adjudication Modal Dialog */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#3D2817]/60 border border-[#A87B4E]/30 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#A87B4E]/25">
              <h3 className="font-bold text-base text-[#FFFFFF] flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-[#A87B4E]" />
                <span>Adjudicate Review Queue Item</span>
              </h3>
              <button
                onClick={() => setActiveItemId(null)}
                className="text-[#F5F2EB]/70 hover:text-[#FFFFFF] text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-3 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/25 text-xs">
              <div className="text-[#F5F2EB]/70 mb-1">Claim Statement:</div>
              <div className="text-[#FFFFFF] font-medium">&ldquo;{activeItem.claim_text}&rdquo;</div>
              <div className="text-[#A87B4E] mt-2 font-mono text-[11px]">
                Reason: {activeItem.reason}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5F2EB]/90 mb-1">
                Auditor Resolution / Classification Decision
              </label>
              <textarea
                rows={2}
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                className="w-full bg-[#2C3E50] text-xs text-[#FFFFFF] p-2.5 rounded-xl border border-[#A87B4E]/25 focus:border-[#A87B4E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5F2EB]/90 mb-1">
                Correction Log Note (Public Asset Entry)
              </label>
              <input
                type="text"
                value={correctionNote}
                onChange={(e) => setCorrectionNote(e.target.value)}
                className="w-full bg-[#2C3E50] text-xs text-[#FFFFFF] p-2.5 rounded-xl border border-[#A87B4E]/25 focus:border-[#A87B4E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5F2EB]/90 mb-1">
                Post-Correction Confidence Rating
              </label>
              <select
                value={targetConfidence}
                onChange={(e) => setTargetConfidence(e.target.value as Confidence)}
                className="w-full bg-[#2C3E50] text-xs text-[#FFFFFF] p-2.5 rounded-xl border border-[#A87B4E]/25 focus:border-[#A87B4E] focus:outline-none"
              >
                <option value="HIGH">HIGH (0.95 — auto-pass to card)</option>
                <option value="MEDIUM">MEDIUM (0.75 — render with caveat)</option>
                <option value="LOW">LOW (0.45)</option>
              </select>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#A87B4E]/25">
              <button
                onClick={() => setActiveItemId(null)}
                className="px-4 py-2 rounded-xl bg-[#3D2817] hover:bg-[#A87B4E]/30 text-xs font-medium text-[#F5F2EB]/90 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolve}
                className="px-4 py-2 rounded-xl bg-[#A87B4E] hover:bg-[#8e663e] text-xs font-bold text-[#FFFFFF] shadow-lg shadow-[#3D2817]/50 transition flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Resolution to Layer 6</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
