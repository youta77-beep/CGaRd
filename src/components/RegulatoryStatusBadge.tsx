import React, { useState } from 'react';
import { claimRecordStore } from '../data/claimRecords';
import {
  RegulatoryStatus,
  RegulatoryStatusBasis,
  StatusHistoryEntry,
  isValidRegulatoryStatus,
} from '../types/schema';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Scale,
  FileText,
  History,
  Lock,
  ExternalLink,
  X,
  Info,
} from 'lucide-react';

export interface RegulatoryStatusBadgeProps {
  claimId: string;
  size?: 'xs' | 'sm' | 'md';
  surfaceName?: string;
  interactive?: boolean;
  className?: string;
  onStoreMutated?: () => void;
}

/**
 * Deterministic HTML generator for byte-identical regression validation (T2).
 */
export function renderRegulatoryStatusBadgeHTML(claimId: string): string {
  const info = claimRecordStore.getStatus(claimId);
  if (!info.isValid || info.isMissing || info.isUnrenderable) {
    if (info.isUnrenderable || (info.rawStatus && info.rawStatus !== 'UNKNOWN' && !isValidRegulatoryStatus(info.rawStatus))) {
      return `<span data-status="UNRENDERABLE" class="badge-status-unrenderable">UNRENDERABLE: ${info.rawStatus}</span>`;
    }
    return `<span data-status="NOT_ON_FILE" class="badge-status-not-on-file">Not on file</span>`;
  }
  return `<span data-status="${info.status}" class="badge-status-${info.status.toLowerCase()}">${info.status}</span>`;
}

/**
 * Requirement 3.5: Single Source of Truth Status Badge Renderer.
 *
 * Every surface (dossier list, product strip, card header, exports)
 * MUST call this exact component bound to the claim's Layer 2 record.
 */
export const RegulatoryStatusBadge: React.FC<RegulatoryStatusBadgeProps> = ({
  claimId,
  size = 'xs',
  surfaceName = 'surface',
  interactive = true,
  className = '',
  onStoreMutated,
}) => {
  const [showBasisModal, setShowBasisModal] = useState(false);

  // Requirement 3.1 & 3.3: Lookup single source of truth field (banned_status)
  const statusInfo = claimRecordStore.getStatus(claimId);

  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.5',
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }[size];

  // Render UNRENDERABLE state (Requirement 3.2: e.g. 'ACTIVE' rejected by enum validator)
  if (
    statusInfo.isUnrenderable ||
    (!statusInfo.isValid &&
      !statusInfo.isMissing &&
      statusInfo.rawStatus &&
      statusInfo.rawStatus !== 'UNKNOWN')
  ) {
    return (
      <>
        <button
          type="button"
          onClick={() => interactive && setShowBasisModal(true)}
          className={`inline-flex items-center font-mono font-bold uppercase rounded border bg-red-950/90 text-red-200 border-red-500 shadow-sm transition hover:bg-red-900 cursor-pointer ${sizeClasses} ${className}`}
          title={`UNRENDERABLE: "${statusInfo.rawStatus}" is not a valid regulatory status. Click to inspect basis failure.`}
          data-surface={surfaceName}
          data-claim-id={claimId}
          data-status="UNRENDERABLE"
        >
          <XCircle className="w-2.5 h-2.5 mr-1 text-red-400 flex-shrink-0" />
          <span>UNRENDERABLE: {statusInfo.rawStatus}</span>
        </button>

        {showBasisModal && (
          <BasisModal
            claimId={claimId}
            statusInfo={statusInfo}
            onClose={() => setShowBasisModal(false)}
          />
        )}
      </>
    );
  }

  // Render "Not on file" state (Requirement 3.1: UNKNOWN or missing record or missing basis)
  if (!statusInfo.isValid || statusInfo.isMissing) {
    return (
      <>
        <button
          type="button"
          onClick={() => interactive && setShowBasisModal(true)}
          className={`inline-flex items-center font-mono font-bold uppercase rounded border bg-[#3D2817] text-[#FFFFFF] border-[#A87B4E] shadow-sm transition hover:bg-[#3D2817]/90 cursor-pointer ${sizeClasses} ${className}`}
          title="Regulatory status 'Not on file'. Click to inspect missing Layer 2 record / basis."
          data-surface={surfaceName}
          data-claim-id={claimId}
          data-status="NOT_ON_FILE"
        >
          <AlertTriangle className="w-2.5 h-2.5 mr-1 text-[#A87B4E] flex-shrink-0" />
          <span>Not on file</span>
        </button>

        {showBasisModal && (
          <BasisModal
            claimId={claimId}
            statusInfo={statusInfo}
            onClose={() => setShowBasisModal(false)}
          />
        )}
      </>
    );
  }

  // Valid Regulatory Status rendering
  const getBadgeStyle = () => {
    switch (statusInfo.status) {
      case 'BANNED':
        return {
          bg: 'bg-[#3D2817] text-[#FFFFFF] border-[#A87B4E] hover:bg-[#3D2817]/90',
          icon: <XCircle className="w-2.5 h-2.5 mr-1 text-[#A87B4E] flex-shrink-0" />,
        };
      case 'RESTRICTED':
        return {
          bg: 'bg-[#A87B4E]/25 text-[#F5F2EB] border-[#A87B4E]/60 hover:bg-[#A87B4E]/35',
          icon: <AlertTriangle className="w-2.5 h-2.5 mr-1 text-[#A87B4E] flex-shrink-0" />,
        };
      case 'RESTRICTED_WITH_CRITERIA':
        return {
          bg: 'bg-[#3D2817] text-[#F5F2EB] border-[#A87B4E]/40 hover:bg-[#3D2817]/80',
          icon: <Scale className="w-2.5 h-2.5 mr-1 text-[#A87B4E] flex-shrink-0" />,
        };
      case 'PERMITTED':
        return {
          bg: 'bg-[#A87B4E]/25 text-[#F5F2EB] border-[#A87B4E]/60 hover:bg-[#A87B4E]/35',
          icon: <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-[#A87B4E] flex-shrink-0" />,
        };
      case 'PERMITTED_WITH_CRITERIA':
        return {
          bg: 'bg-[#3D2817] text-[#A87B4E] border-[#A87B4E]/60 hover:bg-[#3D2817]/90',
          icon: <Scale className="w-2.5 h-2.5 mr-1 text-[#A87B4E] flex-shrink-0" />,
        };
      default:
        return {
          bg: 'bg-[#3D2817] text-[#F5F2EB] border-[#A87B4E]/50',
          icon: <AlertTriangle className="w-2.5 h-2.5 mr-1 text-[#A87B4E] flex-shrink-0" />,
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <>
      <button
        type="button"
        onClick={() => interactive && setShowBasisModal(true)}
        className={`inline-flex items-center font-mono font-bold uppercase rounded border shadow-sm transition cursor-pointer select-none ${style.bg} ${sizeClasses} ${className}`}
        title={`Status: ${statusInfo.status}. Tapping reveals regulatory basis panel (Requirement 3.3).`}
        data-surface={surfaceName}
        data-claim-id={claimId}
        data-status={statusInfo.status}
      >
        {style.icon}
        <span>{statusInfo.status}</span>
      </button>

      {showBasisModal && (
        <BasisModal
          claimId={claimId}
          statusInfo={statusInfo}
          onClose={() => setShowBasisModal(false)}
        />
      )}
    </>
  );
};

/**
 * Requirement 3.3: Regulatory Basis & Audit Trail Panel
 */
interface BasisModalProps {
  claimId: string;
  statusInfo: ReturnType<typeof claimRecordStore.getStatus>;
  onClose: () => void;
}

const BasisModal: React.FC<BasisModalProps> = ({ claimId, statusInfo, onClose }) => {
  const basis = statusInfo.basis;
  const history = statusInfo.history || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#2C3E50] border-2 border-[#A87B4E] rounded-2xl p-6 shadow-2xl text-[#F5F2EB] space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#A87B4E]/30">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-[#A87B4E]" />
            <div>
              <h3 className="text-sm font-extrabold text-[#FFFFFF] tracking-tight">
                Layer 2 Regulatory Status Basis
              </h3>
              <span className="font-mono text-[10px] text-[#A87B4E]">
                Claim ID: {claimId}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#F5F2EB]/60 hover:text-[#FFFFFF] hover:bg-[#3D2817] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Status Display */}
        <div className="p-3 rounded-xl bg-[#3D2817]/60 border border-[#A87B4E]/30 flex items-center justify-between">
          <span className="text-xs text-[#F5F2EB]/70 font-medium">
            Active Regulatory Status:
          </span>
          <span
            className={`font-mono text-xs font-black uppercase px-2 py-0.5 rounded border ${
              statusInfo.status === 'BANNED'
                ? 'bg-[#3D2817] text-[#FFFFFF] border-[#A87B4E]'
                : statusInfo.status === 'RESTRICTED'
                ? 'bg-[#A87B4E]/25 text-[#F5F2EB] border-[#A87B4E]'
                : statusInfo.status === 'RESTRICTED_WITH_CRITERIA'
                ? 'bg-[#3D2817] text-[#F5F2EB] border-[#A87B4E]/50'
                : statusInfo.status === 'PERMITTED'
                ? 'bg-[#A87B4E]/25 text-[#F5F2EB] border-[#A87B4E]'
                : statusInfo.status === 'PERMITTED_WITH_CRITERIA'
                ? 'bg-[#3D2817] text-[#A87B4E] border-[#A87B4E]'
                : 'bg-[#3D2817] text-[#F5F2EB] border-[#A87B4E]'
            }`}
          >
            {statusInfo.rawStatus || 'Not on file'}
          </span>
        </div>

        {/* Unrenderable error or missing record notice */}
        {!statusInfo.isValid && (
          <div className="p-3 bg-[#3D2817] border border-[#A87B4E] rounded-xl text-[#F5F2EB] text-xs space-y-1">
            <div className="font-bold flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#A87B4E]" />
              <span>Status Validation Failure (Requirement 3.1 &amp; 3.3)</span>
            </div>
            <p className="text-[11px] text-[#F5F2EB]/90 leading-relaxed font-mono">
              {statusInfo.unrenderableReason}
            </p>
          </div>
        )}

        {/* Requirement 3.3 Basis Details */}
        {basis && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-[#3D2817]/40 rounded-xl border border-[#A87B4E]/20 space-y-1">
                <span className="text-[10px] text-[#A87B4E] uppercase font-bold block">
                  Matched Provision Ref
                </span>
                <span className="font-mono text-xs font-semibold text-white">
                  {basis.matched_provision_ref}
                </span>
              </div>

              <div className="p-2.5 bg-[#3D2817]/40 rounded-xl border border-[#A87B4E]/20 space-y-1">
                <span className="text-[10px] text-[#A87B4E] uppercase font-bold block">
                  Match Confidence
                </span>
                <span className="font-mono text-xs font-semibold text-white">
                  {Math.round(basis.match_confidence * 100)}% (HIGH)
                </span>
              </div>
            </div>

            {basis.reviewer && (
              <div className="p-2.5 bg-[#3D2817]/40 rounded-xl border border-[#A87B4E]/20 space-y-1">
                <span className="text-[10px] text-[#A87B4E] uppercase font-bold block">
                  Legal Reviewer / Sign-off
                </span>
                <span className="text-xs text-white font-medium">
                  {basis.reviewer}
                </span>
              </div>
            )}

            {/* Exception text (RESTRICTED) */}
            {basis.exception_text && (
              <div className="p-3 bg-[#3D2817]/60 rounded-xl border border-[#A87B4E]/30 space-y-1">
                <span className="text-[10px] text-[#A87B4E] uppercase font-bold block">
                  Statutory Exception &amp; Conditions
                </span>
                <p className="text-[11px] text-[#F5F2EB]/90 leading-relaxed italic">
                  &ldquo;{basis.exception_text}&rdquo;
                </p>
              </div>
            )}

            {/* Criteria ref & satisfaction (PERMITTED_WITH_CRITERIA) */}
            {basis.criteria_ref && (
              <div className="p-3 bg-[#3D2817]/60 rounded-xl border border-[#A87B4E]/30 space-y-1">
                <span className="text-[10px] text-[#A87B4E] uppercase font-bold block">
                  Required Criteria &amp; Evidentiary Satisfaction
                </span>
                <span className="font-semibold text-white block">
                  {basis.criteria_ref}
                </span>
                {basis.evidence_satisfaction_note && (
                  <p className="text-[11px] text-[#F5F2EB]/80 leading-relaxed mt-1">
                    {basis.evidence_satisfaction_note}
                  </p>
                )}
              </div>
            )}

            {/* Source quote (BANNED) */}
            {basis.source_quote && (
              <div className="p-3 bg-[#3D2817] rounded-xl border border-[#A87B4E]/60 space-y-1">
                <span className="text-[10px] text-[#A87B4E] uppercase font-bold block">
                  Statutory Prohibition Quote
                </span>
                <p className="text-[11px] text-[#F5F2EB] leading-relaxed italic font-mono">
                  &ldquo;{basis.source_quote}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}

        {/* Requirement 3.4: Status History Audit Log */}
        <div className="space-y-2 pt-2 border-t border-[#A87B4E]/25 text-xs">
          <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#A87B4E] uppercase">
            <History className="w-3.5 h-3.5" />
            <span>Status Audit Trail (Requirement 3.4)</span>
          </div>

          {history.length === 0 ? (
            <p className="text-[11px] text-[#F5F2EB]/60 italic">
              No historical status changes on file. Initial pipeline match.
            </p>
          ) : (
            <div className="space-y-1.5">
              {history.map((entry, idx) => (
                <div
                  key={`${entry.date}_${idx}`}
                  className="p-2 rounded-lg bg-[#3D2817]/40 border border-[#A87B4E]/20 text-[11px] flex flex-wrap items-center justify-between gap-1.5 font-mono"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#A87B4E]">{entry.status}</span>
                    <span className="text-[#F5F2EB]/60">via {entry.set_by}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-[#F5F2EB]/50">
                    <span>{entry.date}</span>
                    <span>·</span>
                    <span className="text-[#A87B4E]/90">{entry.basis_ref}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Requirement 3.4 Immutability Note */}
        <div className="p-2.5 rounded-xl bg-[#3D2817]/40 border border-[#A87B4E]/30 text-[10px] text-[#F5F2EB]/70 flex items-start space-x-2">
          <Lock className="w-3.5 h-3.5 text-[#A87B4E] flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>System Rule (3.4):</strong> Status values are set strictly by the registry-matching pipeline and promoted only via legal reviewer sign-off. Manual arbitrary status entry anywhere in the UI is disabled by system construction.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#A87B4E] hover:bg-[#A87B4E]/80 text-[#3D2817] font-bold text-xs transition shadow cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
