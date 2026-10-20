import React, { useState, useMemo } from 'react';
import { ALL_PRODUCTS } from './data/registryProducts';
import { ProductRecord, Layer1Claim, ReviewQueueItem, Layer6Correction, Confidence } from './types/schema';
import { buildDatabase, buildCard, toJson, toMarkdown } from './engine/cardBuilder';
import { Header } from './components/Header';
import { ProductCatalog } from './components/ProductCatalog';
import { AuditCardView } from './components/AuditCardView';
import { PipelineRunner } from './components/PipelineRunner';
import { ReviewQueueManager } from './components/ReviewQueueManager';
import { RegulatoryProvisionsView } from './components/RegulatoryProvisionsView';
import { PipelineExecutionReport } from './engine/pipelineEngine';
import { ProductShowcaseView } from './components/ProductShowcaseView';
import { DirectLinksView } from './components/DirectLinksView';
import { LayoutGrid, Layers } from 'lucide-react';
import { CGaRdLogo } from './components/CGaRdLogo';
import { WhatCGaRdDoesPage } from './components/WhatCGaRdDoesPage';

export default function App() {
  const [productsList, setProductsList] = useState<ProductRecord[]>(ALL_PRODUCTS);
  const [selectedClaimId, setSelectedClaimId] = useState<string>('c_dcy_001');
  const [activeTab, setActiveTab] = useState<'cards' | 'pipeline' | 'review' | 'provisions' | 'links' | 'how-it-works'>(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('cards') || path.includes('products') || hash.includes('cards')) {
        return 'cards';
      }
      if (path.includes('sources') || path.includes('links') || hash.includes('sources')) {
        return 'links';
      }
    } catch {}
    // First thing the consumer sees: What CGaRd does
    return 'how-it-works';
  });
  const [cardsViewMode, setCardsViewMode] = useState<'showcase' | 'workbench'>('showcase');
  const [externalMode, setExternalMode] = useState<boolean>(false);
  const [deletedProvenanceFields, setDeletedProvenanceFields] = useState<string[]>([]);

  // Developer vs Normal User mode: defaults to false (clean user view)
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('claimguard_dev_mode') === 'true';
    } catch {
      return false;
    }
  });

  const handleSetDeveloperMode = (val: boolean) => {
    setIsDeveloperMode(val);
    try {
      localStorage.setItem('claimguard_dev_mode', String(val));
    } catch {}
    if (!val && (activeTab === 'pipeline' || activeTab === 'review' || activeTab === 'provisions')) {
      setActiveTab('cards');
    }
  };

  // Seeded review queue items (e.g. from initial audit gaps)
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([
    {
      id: 'rev_init_001',
      stage: 'substantiation',
      claim_text: 'Gentle flake removal for sensitive and dry scalps',
      reason: 'Product efficacy trial not found in public registries; clinical file unverified.',
      confidence: 0.45,
      payload: { claim_id: 'c_20261005_eur_dca_001' },
      created_at: '2026-10-05T09:00:00Z',
    },
    {
      id: 'rev_init_002',
      stage: 'classification',
      claim_text: 'Dermatological formula for sensitive scalps',
      reason: 'Classification between medical positioning vs cosmetic targeting requires advisory sign-off.',
      confidence: 0.55,
      payload: { claim_id: 'c_20261005_eur_dca_002' },
      created_at: '2026-10-05T10:30:00Z',
    },
    {
      id: 'rev_init_003',
      stage: 'matching',
      claim_text: 'Normalizes scalp condition for long-term flake control',
      reason: 'German UWG §5 scrutiny on "normalization" wording borderline medicinal.',
      confidence: 0.52,
      payload: { claim_id: 'c_20261005_alp_a3_003' },
      created_at: '2026-10-05T11:15:00Z',
    },
  ]);

  // Build reactive in-memory database
  const db = useMemo(() => {
    return buildDatabase(productsList);
  }, [productsList]);

  // Aggregate all corrections across products
  const allCorrections = useMemo(() => {
    return productsList.flatMap((p) => p.corrections);
  }, [productsList]);

  // Total claims count
  const totalClaimsCount = useMemo(() => {
    return productsList.reduce((acc, p) => acc + p.claims.length, 0);
  }, [productsList]);

  // Toggle deliberate deletion of a provenance field (Issue 1 Verification Test)
  const handleToggleDeleteProvenance = (fieldKey: string) => {
    setDeletedProvenanceFields((prev) => {
      if (prev.includes(fieldKey)) {
        return prev.filter((k) => k !== fieldKey);
      } else {
        return [...prev, fieldKey];
      }
    });
  };

  // Restore all deliberately deleted provenance objects
  const handleResetDeletedProvenance = () => {
    setDeletedProvenanceFields([]);
    setReviewQueue((prev) =>
      prev.map((i) =>
        i.stage === 'provenance'
          ? {
              ...i,
              resolved_at: new Date().toISOString(),
              resolution: 'Restored original primary provenance dossier.',
            }
          : i
      )
    );
  };

  // Build currently selected audit card
  const currentCard = useMemo(() => {
    try {
      return buildCard(db, selectedClaimId, externalMode, deletedProvenanceFields);
    } catch {
      // Fallback to first available claim
      const firstClaim = productsList[0]?.claims[0]?.claim_id;
      if (firstClaim) {
        return buildCard(db, firstClaim, externalMode, deletedProvenanceFields);
      }
      return null;
    }
  }, [db, selectedClaimId, externalMode, productsList, deletedProvenanceFields]);

  // Issue 1 Validation Rule: Emit MISSING_PROVENANCE to Review Queue when provenance is missing
  React.useEffect(() => {
    if (currentCard?.executive_summary.missing_provenance_events?.length) {
      const newItems: ReviewQueueItem[] = currentCard.executive_summary.missing_provenance_events.map((ev) => ({
        id: `rev_prov_${ev.claim_id}_${ev.field_key}`,
        stage: 'provenance',
        claim_text: currentCard.claim_text,
        reason: `MISSING_PROVENANCE: Field "${ev.field_label}" (${ev.field_key}) lacks valid provenance. Reason: ${ev.reason}`,
        confidence: 0.0,
        payload: {
          claim_id: ev.claim_id,
          field_key: ev.field_key,
          field_label: ev.field_label,
          reason: ev.reason,
          detected_at: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      }));

      setReviewQueue((prev) => {
        const existingIds = new Set(prev.map((i) => i.id));
        const toAdd = newItems.filter((i) => !existingIds.has(i.id));
        return toAdd.length > 0 ? [...toAdd, ...prev] : prev;
      });
    }
  }, [currentCard]);

  // Handler: Promote new claim from Pipeline to active registry
  const handlePromoteClaim = (newClaim: Layer1Claim, report: PipelineExecutionReport) => {
    setProductsList((prev) => {
      // Find matching product or append to first
      const updated = [...prev];
      const prodIndex = updated.findIndex((p) => p.company.toLowerCase().includes(newClaim.brand.toLowerCase()));
      const targetIndex = prodIndex >= 0 ? prodIndex : 0;

      const targetProduct = { ...updated[targetIndex] };
      targetProduct.claims = [newClaim, ...targetProduct.claims];

      // Add corresponding Layer 2 regulatory entry
      const match = report.matches.find((m) => m.claim_text === newClaim.claim_text);
      if (match) {
        targetProduct.regulatory = [
          {
            claim_id: newClaim.claim_id,
            banned_status: match.banned
              ? 'BANNED'
              : match.match
              ? 'PERMITTED_WITH_CRITERIA'
              : 'PERMITTED',
            banned_under: match.matched_provision?.source || 'Reg. 655/2013 Common Criteria',
            match_confidence: (match.confidence >= 0.85 ? 'HIGH' : match.confidence >= 0.6 ? 'MEDIUM' : 'LOW') as Confidence,
            exception_exists: match.exception_applies,
            exception_text: match.matched_provision?.exception_criteria || null,
            jurisdiction: newClaim.jurisdiction,
            effective_date: '2026-09-27',
            fine_ceiling_percent: match.banned ? 10.0 : 4.0,
            notes: `Promoted from pipeline on ${new Date().toISOString().split('T')[0]}.`,
            status: 'POPULATED',
          },
          ...targetProduct.regulatory,
        ];
      }

      // Add Layer 3 substantiation baseline
      targetProduct.substantiation = [
        {
          registry_entry_id: `sub_${newClaim.claim_id.substring(2, 8)}_01`,
          claim_id: newClaim.claim_id,
          substantiation_type: 'product_efficacy_trial',
          registry_name: 'Finished Formula Dossier',
          entry_status: 'ACTIVE',
          confidence_level: 'MEDIUM',
          data_source_url: newClaim.source_url,
          notes: 'Substantiation verified upon pipeline promotion.',
          status: 'POPULATED',
        },
        ...targetProduct.substantiation,
      ];

      updated[targetIndex] = targetProduct;
      return updated;
    });

    setSelectedClaimId(newClaim.claim_id);
    setActiveTab('cards');
  };

  // Handler: Enqueue reviews from pipeline execution
  const handleEnqueueReviews = (newItems: ReviewQueueItem[]) => {
    setReviewQueue((prev) => [...newItems, ...prev]);
  };

  // Handler: Resolve review queue item & write to Layer 6
  const handleResolveReview = (
    itemId: string,
    resolution: string,
    correctionNote: string,
    confidenceAfter: Confidence
  ) => {
    // If resolving a provenance item, restore the deleted field
    const targetItem = reviewQueue.find((i) => i.id === itemId);
    if (targetItem?.stage === 'provenance' && targetItem.payload?.field_key) {
      const key = targetItem.payload.field_key;
      setDeletedProvenanceFields((prev) => prev.filter((k) => k !== key && !key.includes(k)));
    }

    setReviewQueue((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            resolved_at: new Date().toISOString(),
            resolution,
          };
        }
        return item;
      })
    );

    // Append to Layer 6 of the currently selected product
    const newCorrection: Layer6Correction = {
      correction_id: `corr_${Date.now()}`,
      claim_id: [selectedClaimId],
      flag_type: targetItem?.stage === 'provenance' ? 'provenance_remediation' : 'human_review_resolution',
      flagged_by: 'Compliance Auditor',
      flagged_date: new Date().toISOString().split('T')[0],
      issue_description: correctionNote,
      correction_made: resolution,
      confidence_after_correction: confidenceAfter,
    };

    setProductsList((prev) => {
      return prev.map((p) => {
        const hasClaim = p.claims.some((c) => c.claim_id === selectedClaimId);
        if (hasClaim) {
          return {
            ...p,
            corrections: [newCorrection, ...p.corrections],
          };
        }
        return p;
      });
    });
  };

  // Handler: Export all generated cards as downloadable JSON bundle with complete provenance dossiers
  const handleExportAll = () => {
    const allCards = productsList.flatMap((p) =>
      p.claims.map((c) => buildCard(db, c.claim_id, externalMode, deletedProvenanceFields))
    );
    const bundleStr = JSON.stringify(allCards, null, 2);
    const blob = new Blob([bundleStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cgard_registry_export_${externalMode ? 'external' : 'internal'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle browser back/forward and URL route changes
  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('cards') || path.includes('products') || hash.includes('cards')) {
        setActiveTab('cards');
      } else if (path.includes('sources') || path.includes('links') || hash.includes('sources')) {
        setActiveTab('links');
      } else {
        setActiveTab('how-it-works');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const pendingReviewCount = reviewQueue.filter((i) => !i.resolved_at).length;

  // Standalone "What CGaRd does" Page (/how-it-works or /about)
  if (activeTab === 'how-it-works') {
    return (
      <WhatCGaRdDoesPage
        onNavigateToRegistry={() => {
          setActiveTab('cards');
          try {
            window.history.pushState({}, '', '/');
          } catch {}
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#2C3E50] text-[#F5F2EB] flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        externalMode={externalMode}
        setExternalMode={setExternalMode}
        reviewQueueCount={pendingReviewCount}
        totalClaimsCount={totalClaimsCount}
        onExportAll={handleExportAll}
        isDeveloperMode={isDeveloperMode}
        setIsDeveloperMode={handleSetDeveloperMode}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pt-6 sm:pt-8">
        {activeTab === 'cards' && (
          <div className="space-y-6">


            {/* View Mode Switcher Header: Only visible for Developer */}
            {isDeveloperMode ? (
              <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#3D2817]">
                <div>
                  <h2 className="text-xl font-extrabold text-[#FFFFFF] flex items-center space-x-2.5">
                    <span>Cosmetic Claims Audit</span>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#A87B4E]/20 text-[#F5F2EB] border border-[#A87B4E]/40">
                      {productsList.length} Products Indexed
                    </span>
                  </h2>
                  <p className="text-xs text-[#F5F2EB]/75 mt-1">
                    {cardsViewMode === 'showcase'
                      ? 'Big screen 2-in-a-row product showcase with active developer test toolbars and provenance injection controls.'
                      : '6-Layer regulatory workbench with field completeness tracker, statutory matching, and legal dossier.'}
                  </p>
                </div>

                <div className="flex items-center bg-[#3D2817]/50 border border-[#A87B4E]/30 p-1 rounded-xl shadow-lg">
                  <button
                    onClick={() => setCardsViewMode('showcase')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                      cardsViewMode === 'showcase'
                        ? 'bg-[#A87B4E] text-[#FFFFFF] shadow-sm'
                        : 'text-[#F5F2EB]/70 hover:text-[#FFFFFF]'
                    }`}
                    title="2-in-a-row big screen showcase with click-to-reveal claim cards"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>2-in-a-Row Showcase</span>
                  </button>
                  <button
                    onClick={() => setCardsViewMode('workbench')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                      cardsViewMode === 'workbench'
                        ? 'bg-[#A87B4E] text-[#FFFFFF] shadow-sm'
                        : 'text-[#F5F2EB]/70 hover:text-[#FFFFFF]'
                    }`}
                    title="Full 6-layer audit workbench with claim tree"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>6-Layer Workbench</span>
                  </button>
                </div>
              </div>
            ) : null}

            {/* MAIN CONTENT: Normal users always get the clean Showcase; Developer gets Showcase or Workbench */}
            {!isDeveloperMode || cardsViewMode === 'showcase' ? (
              <ProductShowcaseView
                products={productsList}
                db={db}
                isExternalMode={externalMode}
                selectedClaimId={selectedClaimId}
                onSelectClaim={(id) => setSelectedClaimId(id)}
                onInspectDossier={(id) => {
                  setSelectedClaimId(id);
                  setCardsViewMode('workbench');
                }}
                deletedProvenanceFields={deletedProvenanceFields}
                onToggleDeleteProvenance={handleToggleDeleteProvenance}
                onResetDeletedProvenance={handleResetDeletedProvenance}
                isDeveloperMode={isDeveloperMode}
              />
            ) : (
              /* SPLIT WORKBENCH VIEW (DEVELOPER ONLY) */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Product & Claim Catalog (4 cols) */}
                <div className="lg:col-span-4">
                  <ProductCatalog
                    products={productsList}
                    selectedClaimId={selectedClaimId}
                    onSelectClaim={(id) => setSelectedClaimId(id)}
                  />
                </div>

                {/* Right: Selected Deterministic Audit Card (8 cols) */}
                <div className="lg:col-span-8">
                  {currentCard ? (
                    <AuditCardView
                      card={currentCard}
                      isExternalMode={externalMode}
                      onSelectClaim={(id) => setSelectedClaimId(id)}
                      allProducts={productsList}
                      deletedProvenanceFields={deletedProvenanceFields}
                      onToggleDeleteProvenance={handleToggleDeleteProvenance}
                      onResetDeletedProvenance={handleResetDeletedProvenance}
                      isDeveloperMode={isDeveloperMode}
                    />
                  ) : (
                    <div className="bg-[#3D2817]/40 border border-[#A87B4E]/30 rounded-2xl p-12 text-center text-[#F5F2EB]/60">
                      Select a claim from the left catalog to inspect its 6-layer regulatory card.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DEVELOPER-ONLY TABS */}
        {isDeveloperMode && activeTab === 'pipeline' && (
          <PipelineRunner
            onPromoteClaim={handlePromoteClaim}
            onEnqueueReviews={handleEnqueueReviews}
          />
        )}

        {isDeveloperMode && activeTab === 'review' && (
          <ReviewQueueManager
            queue={reviewQueue}
            onResolveItem={handleResolveReview}
            allCorrections={allCorrections}
          />
        )}

        {isDeveloperMode && activeTab === 'provisions' && <RegulatoryProvisionsView />}

        {activeTab === 'links' && (
          <DirectLinksView
            products={productsList}
            onSelectProductClaim={(id) => {
              setSelectedClaimId(id);
              setActiveTab('cards');
            }}
          />
        )}
      </main>

      {/* Global CGaRd Brand Footer */}
      <footer className="mt-12 border-t border-[#A87B4E]/20 bg-[#3D2817]/40 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <CGaRdLogo size="sm" isDeveloperMode={isDeveloperMode} />
          <p className="text-xs text-[#F5F2EB]/50 font-mono text-center sm:text-right">
            CGaRd Engine • Cosmetic Regulatory Verification
          </p>
        </div>
      </footer>
    </div>
  );
}
