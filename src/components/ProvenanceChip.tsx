import React, { useState } from 'react';
import { ProvenanceObject, ProvenanceSourceType } from '../types/schema';
import { validateProvenance } from '../engine/provenanceEngine';
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Table,
  Search,
  AlertTriangle,
  Building,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface ProvenanceChipProps {
  provenance?: ProvenanceObject<any> | null;
  fieldLabel?: string;
  defaultExpanded?: boolean;
  inline?: boolean;
  onDeliberateDelete?: () => void;
}

export const ProvenanceChip: React.FC<ProvenanceChipProps> = ({
  provenance,
  fieldLabel,
  defaultExpanded = false,
  inline = false,
  onDeliberateDelete,
}) => {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  const validation = validateProvenance(provenance);

  // If provenance is completely missing or invalid, render 'Not on file'
  if (!validation.isValid || !provenance) {
    return (
      <div className="inline-flex items-center space-x-1.5 py-0.5">
        <span className="text-xs font-semibold italic text-[#F5F2EB]/50 bg-[#3D2817]/40 px-2 py-0.5 rounded border border-[#A87B4E]/20">
          Not on file
        </span>
        <span
          className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#3D2817] text-[#A87B4E] border border-[#A87B4E]/40"
          title={validation.errorReason || 'Missing provenance object'}
        >
          MISSING_PROVENANCE
        </span>
      </div>
    );
  }

  const { source_type, source_url, source_quote, registry_ref, study_design_fields, search_scope, search_date, captured_date } = provenance;

  // Render badge by source_type enum according to Issue 1 spec
  const renderSourceBadge = () => {
    switch (source_type) {
      case 'public_registry':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2C3E50] text-[#F5F2EB] border border-[#A87B4E]/40">
            <FileCheck2 className="w-3 h-3 text-[#A87B4E]" />
            <span>public registry</span>
            {source_url && <ExternalLink className="w-2.5 h-2.5 text-[#A87B4E]" />}
          </span>
        );

      case 'brand_stated':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#A87B4E]/20 text-[#F5F2EB] border border-[#A87B4E]/40">
            <Building className="w-3 h-3 text-[#A87B4E]" />
            <span>brand-stated</span>
          </span>
        );

      case 'curated_evidence_table':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2C3E50] text-[#F5F2EB] border border-[#A87B4E]/40">
            <Table className="w-3 h-3 text-[#A87B4E]" />
            <span>curated table</span>
          </span>
        );

      case 'company_filed_study':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#3D2817] text-[#F5F2EB] border border-[#A87B4E]/50">
            <CheckCircle className="w-3 h-3 text-[#A87B4E]" />
            <span>company-reported</span>
          </span>
        );

      case 'search_negative':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#2C3E50] text-[#F5F2EB]/80 border border-[#A87B4E]/30">
            <Search className="w-3 h-3 text-[#A87B4E]" />
            <span>checked: {search_scope || 'registries'}, {search_date || captured_date}</span>
          </span>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`relative ${inline ? 'inline-block align-middle ml-1.5' : 'mt-1'}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-center space-x-1.5 text-left cursor-pointer group rounded-lg hover:ring-1 hover:ring-[#A87B4E] transition focus:outline-none"
        title="Click to inspect provenance (source quote, URL, and captured date)"
      >
        {renderSourceBadge()}
        <span className="text-[10px] text-[#A87B4E] group-hover:text-[#F5F2EB] flex items-center transition">
          {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </span>
      </button>

      {/* Expanded Provenance Drawer */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-2 p-3 rounded-xl bg-[#2C3E50] border border-[#A87B4E] shadow-2xl text-xs space-y-2 max-w-lg z-20 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-1 border-b border-[#A87B4E]/25">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A87B4E] flex items-center space-x-1.5">
              <span>Provenance Dossier</span>
              {fieldLabel && <span className="text-[#F5F2EB]/60">· {fieldLabel}</span>}
            </span>
            <span className="text-[10px] font-mono text-[#F5F2EB]/60">
              Captured: <strong className="text-[#F5F2EB]">{captured_date}</strong>
            </span>
          </div>

          {/* Quoted Source Text */}
          {source_quote && (
            <div className="bg-[#3D2817]/60 p-2 rounded-lg border border-[#A87B4E]/20 text-[11px] leading-relaxed">
              <span className="text-[9px] font-extrabold uppercase text-[#A87B4E] block mb-0.5 tracking-wider">
                Verbatim Primary Disclosure:
              </span>
              <p className="italic text-[#F5F2EB]">&ldquo;{source_quote}&rdquo;</p>
            </div>
          )}

          {/* Source URL Deep Link */}
          {source_url && (
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-[#F5F2EB]/70">Source Record:</span>
              <a
                href={source_url}
                target="_blank"
                rel="noreferrer"
                className="text-[#A87B4E] hover:text-[#FFFFFF] underline flex items-center space-x-1 font-mono text-[10px] truncate max-w-[280px]"
              >
                <span className="truncate">{source_url}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          )}

          {/* Registry Ref (Curated Evidence Table) */}
          {registry_ref && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#F5F2EB]/70">Evidence Table Entry ID:</span>
              <span className="font-mono text-[#F5F2EB] bg-[#3D2817] px-1.5 py-0.5 rounded border border-[#A87B4E]/30 text-[10px]">
                {registry_ref}
              </span>
            </div>
          )}

          {/* Study Design (Company Filed Study) */}
          {study_design_fields && (
            <div className="bg-[#3D2817]/50 p-2 rounded-lg border border-[#A87B4E]/20 text-[10px] space-y-1">
              <span className="font-bold text-[#A87B4E] block">Study Design Profile:</span>
              {typeof study_design_fields === 'string' ? (
                <p className="text-[#F5F2EB]">{study_design_fields}</p>
              ) : (
                <div className="grid grid-cols-2 gap-1 text-[#F5F2EB]/80 font-mono">
                  {study_design_fields.study_type && <div>Type: {study_design_fields.study_type}</div>}
                  {study_design_fields.sample_size && <div>N: {study_design_fields.sample_size}</div>}
                  {study_design_fields.duration && <div>Duration: {study_design_fields.duration}</div>}
                  {study_design_fields.blinding && <div>Blinding: {study_design_fields.blinding}</div>}
                  {study_design_fields.endpoints && <div className="col-span-2">Endpoints: {study_design_fields.endpoints}</div>}
                </div>
              )}
            </div>
          )}

          {/* Search Negative scope & date */}
          {source_type === 'search_negative' && (
            <div className="text-[10px] text-[#F5F2EB]/80 bg-[#3D2817]/60 p-2 rounded-lg border border-[#A87B4E]/20">
              <div><strong>Registry Scope:</strong> {search_scope}</div>
              <div><strong>Search Date:</strong> {search_date || captured_date}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
