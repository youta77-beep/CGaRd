import React from 'react';
import { ExternalLink, FlaskConical, History, Scale, BookOpen, MessageSquareQuote } from 'lucide-react';
import type { CardSection, ClaimCard, SectionState, SourceRef } from '../data/sheetCards';

const STATE_LABEL: Record<SectionState, string> = {
  verified: 'Verified',
  published_unverified: 'Published · sources not verified',
  draft: 'Draft · under review',
  not_on_file: 'Not on file',
};

const STATE_CLASS: Record<SectionState, string> = {
  verified: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  published_unverified: 'bg-amber-100 text-amber-800 border-amber-300',
  draft: 'bg-[#F5F2EB] text-[#3D2817]/80 border-[#3D2817]/25',
  not_on_file: 'bg-white text-[#3D2817]/50 border-[#3D2817]/15',
};

const STATUS_CLASS: Record<string, string> = {
  BANNED: 'bg-red-100 text-red-800 border-red-300',
  RESTRICTED: 'bg-orange-100 text-orange-800 border-orange-300',
  PERMITTED_WITH_CRITERIA: 'bg-amber-100 text-amber-800 border-amber-300',
  PERMITTED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  UNKNOWN: 'bg-slate-100 text-slate-700 border-slate-300',
};

const ICONS = {
  regulatory_basis: Scale,
  clinical_data: FlaskConical,
  actives_evidence: BookOpen,
  permissible_claim_language: MessageSquareQuote,
  claim_history: History,
};

export const RegulatoryStatusPill: React.FC<{ status: string; verified?: boolean }> = ({ status, verified }) => (
  <span
    className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
      STATUS_CLASS[status] || STATUS_CLASS.UNKNOWN
    }`}
    title={verified ? 'Regulatory status' : 'Regulatory status from imported data; not yet verified'}
  >
    {status.replace(/_/g, ' ')}
    {!verified && <span className="font-normal normal-case">(unverified)</span>}
  </span>
);

const SourceLinks: React.FC<{ sources: SourceRef[] }> = ({ sources }) => {
  if (sources.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1">
      {sources.map((s) => (
        <li key={s.sourceId} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
          {s.url ? (
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#2C3E50] underline decoration-[#A87B4E]/60 hover:text-[#A87B4E] break-all"
            >
              {s.title}
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          ) : (
            <span className="text-[#3D2817]/70">{s.title} (no link on file)</span>
          )}
          <span
            className={`rounded px-1.5 py-px font-mono text-[9px] uppercase border ${
              s.verified ? 'border-emerald-300 text-emerald-700' : 'border-amber-300 text-amber-700'
            }`}
          >
            {s.verified ? 'Verified' : `Reference — ${s.statusLabel.toLowerCase()}`}
          </span>
        </li>
      ))}
    </ul>
  );
};

const Empty: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <p className="italic text-[#3D2817]/55">{children || 'No data on file.'}</p>
);

function SectionBody({ section }: { section: CardSection }) {
  switch (section.key) {
    case 'regulatory_basis':
      if (section.state === 'not_on_file') return <Empty>Regulatory assessment not on file.</Empty>;
      return (
        <div className="space-y-2">
          {section.entries.map((e, i) => (
            <div key={i} className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <RegulatoryStatusPill status={e.status} verified={section.state === 'verified'} />
                <span className="font-mono text-[10px] text-[#3D2817]/60">{e.jurisdiction}</span>
              </div>
              {e.legalBasis && <p>{e.legalBasis}</p>}
            </div>
          ))}
        </div>
      );
    case 'clinical_data':
      if (section.state === 'not_on_file') return <Empty>No product-level clinical data on file.</Empty>;
      return (
        <ul className="space-y-1.5">
          {section.entries.map((e, i) => (
            <li key={i}>
              <span className="font-mono text-[10px] uppercase font-bold text-[#A87B4E] mr-2">{e.status.replace(/_/g, ' ')}</span>
              {e.summary}
              {e.studyType && <span className="text-[#3D2817]/55"> · {e.studyType.replace(/_/g, ' ')}</span>}
            </li>
          ))}
        </ul>
      );
    case 'actives_evidence':
      if (section.state === 'not_on_file') return <Empty>No formula actives on file for this product.</Empty>;
      return (
        <div className="space-y-2">
          <p className="font-bold">
            {section.summary.label}
            {section.summary.label === 'Not assessed' && (
              <span className="font-normal text-[#3D2817]/65">
                {' '}
                — {section.summary.listed} active{section.summary.listed === 1 ? '' : 's'} listed; notification not yet verified
              </span>
            )}
          </p>
          <ul className="space-y-1">
            {section.actives.map((a) => (
              <li key={a.ingredientId} className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-semibold">{a.name}</span>
                {a.concentration && <span className="font-mono text-[11px]">{a.concentration}</span>}
                <span className="text-[11px] text-[#3D2817]/60">
                  notification {a.notifiedVerified ? 'verified' : a.notificationStatus.toLowerCase()} · AGA evidence:{' '}
                  {a.agaEvidence ? a.agaEvidence.toLowerCase() : 'not on file'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    case 'permissible_claim_language':
      if (section.state === 'not_on_file') return <Empty>No permissible wording on file.</Empty>;
      return (
        <ul className="space-y-1">
          {section.entries.map((e, i) => (
            <li key={i}>
              <span className="font-mono text-[10px] text-[#3D2817]/60 mr-2">{e.jurisdiction}</span>
              {e.text}
            </li>
          ))}
        </ul>
      );
    case 'claim_history':
      if (section.state === 'not_on_file') return <Empty>No changes or enforcement on file.</Empty>;
      return (
        <div className="space-y-2">
          {section.versions.length > 0 && (
            <ol className="space-y-1">
              {section.versions.map((v) => (
                <li key={v.versionNumber}>
                  <span className="font-mono text-[10px] font-bold text-[#A87B4E] mr-2">
                    v{v.versionNumber}
                    {v.date && ` · ${v.date}`}
                  </span>
                  {v.text}
                  {v.reason && <span className="text-[11px] text-[#3D2817]/60"> — {v.reason}</span>}
                </li>
              ))}
            </ol>
          )}
          {section.events.length > 0 && (
            <ul className="space-y-1">
              {section.events.map((e, i) => (
                <li key={i}>
                  <span className="font-mono text-[10px] font-bold text-[#A87B4E] mr-2">
                    {e.date} · {e.authority}
                  </span>
                  {e.outcome}
                  {e.basis && <span className="text-[11px] text-[#3D2817]/60"> — {e.basis}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
  }
}

/**
 * The public claim card: always the same five sections, in the same order.
 * `notes` columns in the Sheet are for editors and are never rendered here.
 */
export const SheetClaimCard: React.FC<{ card: ClaimCard }> = ({ card }) => {
  const reg = card.sections[0];
  return (
    <article className="rounded-2xl border border-[#3D2817]/25 bg-white text-[#3D2817] shadow-2xl overflow-hidden">
      <header className="border-b border-[#3D2817]/15 bg-[#F5F2EB] px-5 py-4 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase font-bold text-[#A87B4E]">
              {card.product.brand} · {card.product.name}
            </p>
            <h3 className="text-sm sm:text-base font-extrabold leading-snug">&ldquo;{card.claim.text}&rdquo;</h3>
          </div>
          <RegulatoryStatusPill status={card.claim.regulatoryStatus} verified={reg.state === 'verified'} />
        </div>
        <p className="text-[11px] text-[#3D2817]/60">
          Claim as stated by the brand; not an endorsement of efficacy.
          {card.claim.captureDate && ` Captured ${card.claim.captureDate}.`}
        </p>
        <SourceLinks sources={card.claimSources} />
      </header>

      <div className="divide-y divide-[#3D2817]/10 text-xs sm:text-[13px] leading-relaxed">
        {card.sections.map((section, index) => {
          const Icon = ICONS[section.key];
          return (
            <section key={section.key} className="grid grid-cols-1 sm:grid-cols-[minmax(0,13rem)_1fr] gap-2 sm:gap-4 px-5 py-4" aria-label={section.label}>
              <div className="space-y-1.5">
                <h4 className="flex items-start gap-1.5 font-bold text-[#2C3E50]">
                  <Icon className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#A87B4E]" />
                  <span>
                    <span className="font-mono text-[10px] text-[#A87B4E] mr-1">{index + 1}.</span>
                    {section.label}
                  </span>
                </h4>
                <span className={`inline-block rounded border px-1.5 py-px font-mono text-[9px] uppercase ${STATE_CLASS[section.state]}`}>
                  {STATE_LABEL[section.state]}
                </span>
              </div>
              <div className="min-w-0">
                <SectionBody section={section} />
                <SourceLinks sources={section.sources} />
              </div>
            </section>
          );
        })}
      </div>
    </article>
  );
};
