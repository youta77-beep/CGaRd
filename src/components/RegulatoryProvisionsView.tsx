import React from 'react';
import {
  REGULATORY_PROVISIONS,
  KEY_DIRECTIVE_RECORDS,
  LANDMARK_PRECEDENT_RECORDS,
} from '../data/regulatoryProvisions';
import {
  Scale,
  ShieldAlert,
  AlertTriangle,
  FileText,
  ExternalLink,
  BookOpen,
  Gavel,
  Calendar,
  Globe2,
} from 'lucide-react';

export const RegulatoryProvisionsView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#3D2817]/60 border border-[#A87B4E]/25 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[#3D2817] border border-[#A87B4E]/30/40 flex items-center justify-center text-[#A87B4E]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#FFFFFF]">
              Statutory Provisions &amp; Enforcement Precedents
            </h2>
            <p className="text-xs text-[#F5F2EB]/70">
              Direct legal mandates and European regulatory case-law codifying the 6-layer audit engine.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Key Directives - Dynamically mapped from data layer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {KEY_DIRECTIVE_RECORDS.map((dir) => (
          <div key={dir.id} className="bg-[#3D2817]/60 border border-[#A87B4E]/25 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#A87B4E]/15 text-[#F5F2EB] border border-[#A87B4E]/30">
                {dir.badge}
              </span>
              <span className="text-[11px] font-mono text-[#F5F2EB]/50">{dir.statusDate}</span>
            </div>
            <h4 className="text-sm font-bold text-[#FFFFFF]">{dir.title}</h4>
            <p className="text-xs text-[#F5F2EB]/90 leading-relaxed">
              {dir.summary}{' '}
              {dir.fineCeiling && (
                <>
                  Fine ceiling up to{' '}
                  <strong className="text-[#A87B4E]">{dir.fineCeiling}</strong>.
                </>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Enforcement Precedent Cases - Dynamically mapped from data layer */}
      <div className="bg-[#3D2817]/60 border border-[#A87B4E]/25 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F2EB]/90 flex items-center space-x-2">
          <Gavel className="w-4 h-4 text-[#A87B4E]" />
          <span>Major Landmark Case Law &amp; Precedents</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LANDMARK_PRECEDENT_RECORDS.map((prec) => (
            <div key={prec.id} className="p-4 bg-[#2C3E50] rounded-xl border border-[#A87B4E]/25 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#FFFFFF]">{prec.authority}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#A87B4E]/25 text-[#F5F2EB] border border-[#A87B4E]/30 font-semibold">
                  {prec.statusBadge}
                </span>
              </div>
              <div className="text-[#F5F2EB]/70">
                <strong>Target: </strong> {prec.target}
              </div>
              <p className="text-[#F5F2EB]/90 leading-relaxed">
                {prec.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Regulatory Provisions Table */}
      <div className="bg-[#3D2817]/60 border border-[#A87B4E]/25 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F2EB]/90 flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-[#A87B4E]" />
          <span>Statutory Provision Database (Match Index)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#2C3E50] text-[#F5F2EB]/70 font-mono text-[11px] uppercase border-b border-[#A87B4E]/25">
              <tr>
                <th className="py-3 px-3">Provision ID</th>
                <th className="py-3 px-3">Statutory Source</th>
                <th className="py-3 px-3">Matched Term / Claim</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Jurisdiction</th>
                <th className="py-3 px-3">Exception Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#A87B4E]/20 font-sans">
              {REGULATORY_PROVISIONS.map((p) => (
                <tr key={p.provision_id} className="hover:bg-[#3D2817]/30 transition">
                  <td className="py-3 px-3 font-mono text-[#F5F2EB] font-semibold">
                    {p.provision_id}
                  </td>
                  <td className="py-3 px-3 text-[#F5F2EB]/90 max-w-[200px]">{p.source}</td>
                  <td className="py-3 px-3 font-medium text-[#FFFFFF]">{p.text}</td>
                  <td className="py-3 px-3">
                    {p.banned ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#3D2817] text-[#F5F2EB] border border-[#A87B4E]/30">
                        Banned
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#A87B4E]/25 text-[#F5F2EB] border border-[#A87B4E]/40/30">
                        Restricted
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#F5F2EB]/70">{p.jurisdiction}</td>
                  <td className="py-3 px-3 text-[#F5F2EB]/70 max-w-[280px] leading-relaxed">
                    {p.exception_criteria || 'Strict statutory ban without derogation.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
