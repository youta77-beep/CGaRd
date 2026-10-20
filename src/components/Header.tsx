import React from 'react';
import { CGaRdLogo } from './CGaRdLogo';
import {
  FileCheck2,
  Cpu,
  Layers,
  Scale,
  Eye,
  EyeOff,
  Download,
  AlertCircle,
  HelpCircle,
  Globe2,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'cards' | 'pipeline' | 'review' | 'provisions' | 'links' | 'how-it-works';
  setActiveTab: (tab: 'cards' | 'pipeline' | 'review' | 'provisions' | 'links' | 'how-it-works') => void;
  externalMode: boolean;
  setExternalMode: (val: boolean) => void;
  reviewQueueCount: number;
  totalClaimsCount: number;
  onExportAll: () => void;
  isDeveloperMode: boolean;
  setIsDeveloperMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  externalMode,
  setExternalMode,
  reviewQueueCount,
  totalClaimsCount,
  onExportAll,
  isDeveloperMode,
  setIsDeveloperMode,
}) => {
  return (
    <header className="border-b border-[#3D2817]/60 bg-[#2C3E50]/95 backdrop-blur-md sticky top-0 z-30 shadow-md">
      {/* Developer Status Top Banner (only visible in Developer Mode) */}
      {isDeveloperMode && (
        <div className="bg-[#3D2817] border-b border-[#A87B4E]/40 py-1.5 px-4 sm:px-8 text-xs text-[#F5F2EB] flex flex-wrap items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#A87B4E] animate-pulse"></span>
            <span className="font-extrabold tracking-wide uppercase text-[#FFFFFF] text-[11px]">
              CGaRd Developer Workspace Active
            </span>
            <span className="text-[#F5F2EB]/50 hidden sm:inline">|</span>
            <span className="font-mono text-[11px] bg-[#2C3E50] px-2 py-0.5 rounded text-[#F5F2EB] border border-[#A87B4E]/30">
              yousufadilelhag77@gmail.com
            </span>
            <span className="text-[#F5F2EB]/70 hidden md:inline text-[11px]">
              (6-Layer Workbench, Pipeline Runner, Review Queue &amp; Test Suites unlocked)
            </span>
          </div>
          <button
            onClick={() => setIsDeveloperMode(false)}
            className="px-2.5 py-1 rounded-lg bg-[#2C3E50] hover:bg-[#A87B4E] text-[#F5F2EB] hover:text-[#FFFFFF] text-[11px] font-semibold transition flex items-center space-x-1.5 border border-[#A87B4E]/40 shadow-sm cursor-pointer"
            title="Switch back to the simple view seen by normal users"
          >
            <Eye className="w-3 h-3 text-[#A87B4E]" />
            <span>Switch to Simple User View</span>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Identity: CGaRd */}
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('cards')}>
            <CGaRdLogo size="md" isDeveloperMode={isDeveloperMode} />
          </div>

          {/* Navigation Tabs - Role-based */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-[#3D2817]/40 p-1 rounded-xl border border-[#A87B4E]/30">
            {/* 1. What CGaRd does - FIRST THING THE CONSUMER SEES */}
            <button
              onClick={() => {
                setActiveTab('how-it-works');
                try {
                  window.history.pushState({}, '', '/how-it-works');
                } catch {}
              }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'how-it-works'
                  ? 'bg-[#A87B4E] text-[#FFFFFF] shadow-sm'
                  : 'text-[#F5F2EB]/75 hover:text-[#FFFFFF] hover:bg-[#3D2817]/50'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#F5F2EB]" />
              <span>What CGaRd does</span>
            </button>

            {/* 2. Products & Claims */}
            <button
              onClick={() => {
                setActiveTab('cards');
                try {
                  window.history.pushState({}, '', '/');
                } catch {}
              }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'cards'
                  ? 'bg-[#A87B4E] text-[#FFFFFF] shadow-sm'
                  : 'text-[#F5F2EB]/75 hover:text-[#FFFFFF] hover:bg-[#3D2817]/50'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>{isDeveloperMode ? 'Audit Cards' : 'Products & Claims'}</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-[#3D2817]/60 text-[#F5F2EB] rounded-full font-mono">
                {totalClaimsCount}
              </span>
            </button>

            {/* Direct Links visible to both Normal Users & Developer */}
            <button
              onClick={() => {
                setActiveTab('links');
                try {
                  window.history.pushState({}, '', '/sources');
                } catch {}
              }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'links'
                  ? 'bg-[#A87B4E] text-[#FFFFFF] shadow-sm'
                  : 'text-[#F5F2EB]/75 hover:text-[#FFFFFF] hover:bg-[#3D2817]/50'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>{isDeveloperMode ? 'Direct Links & URLs' : 'Verified Sources'}</span>
            </button>

            {/* DEVELOPER-ONLY TABS */}
            {isDeveloperMode && (
              <>
                <button
                  onClick={() => setActiveTab('pipeline')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'pipeline'
                      ? 'bg-[#A87B4E] text-[#FFFFFF] shadow-sm'
                      : 'text-[#F5F2EB]/75 hover:text-[#FFFFFF] hover:bg-[#3D2817]/50'
                  }`}
                  title="Run regulatory extraction regex pipeline on raw text"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Pipeline Runner</span>
                </button>

                <button
                  onClick={() => setActiveTab('review')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                    activeTab === 'review'
                      ? 'bg-[#A87B4E] text-[#FFFFFF] shadow-sm'
                      : 'text-[#F5F2EB]/75 hover:text-[#FFFFFF] hover:bg-[#3D2817]/50'
                  }`}
                  title="Human-in-the-loop review queue & Layer 6 remediation"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-[#F5F2EB]" />
                  <span>Review Queue</span>
                  {reviewQueueCount > 0 && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-[#F5F2EB] text-[#3D2817] rounded-full font-mono font-bold">
                      {reviewQueueCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('provisions')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'provisions'
                      ? 'bg-[#A87B4E] text-[#FFFFFF] shadow-sm'
                      : 'text-[#F5F2EB]/75 hover:text-[#FFFFFF] hover:bg-[#3D2817]/50'
                  }`}
                  title="EU Reg 655/2013 and FDA statutory provisions database"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Provisions &amp; Law</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action: Developer Mode Switcher & Developer Tools */}
          <div className="flex items-center space-x-3">
            {/* Developer-Only Tools: Internal/External audit mode & JSON Export */}
            {isDeveloperMode && (
              <div className="hidden lg:flex items-center space-x-2">
                <div className="flex items-center bg-[#3D2817]/50 rounded-xl p-0.5 border border-[#A87B4E]/30">
                  <button
                    onClick={() => setExternalMode(false)}
                    title="Internal Legal Mode: Reveals all 6 layers including UNKNOWN and TO_COLLECT data gaps"
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      !externalMode
                        ? 'bg-[#A87B4E] text-[#FFFFFF] shadow'
                        : 'text-[#F5F2EB]/70 hover:text-[#FFFFFF]'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Internal Audit</span>
                  </button>
                  <button
                    onClick={() => setExternalMode(true)}
                    title="External Card Mode: Strictly hides UNKNOWN and TO_COLLECT fields as per architectural rule"
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      externalMode
                        ? 'bg-[#A87B4E] text-[#FFFFFF] shadow'
                        : 'text-[#F5F2EB]/70 hover:text-[#FFFFFF]'
                    }`}
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>External Card</span>
                  </button>
                </div>

                <button
                  onClick={onExportAll}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#3D2817] hover:bg-[#3D2817]/80 text-[#F5F2EB] border border-[#A87B4E]/40 text-xs font-medium transition shadow-sm"
                  title="Export all generated cards as JSON and Markdown archive"
                >
                  <Download className="w-3.5 h-3.5 text-[#A87B4E]" />
                  <span>Export</span>
                </button>
              </div>
            )}

            {/* Mode Selector Pill: Normal User vs Developer */}
            <div className="flex items-center bg-[#3D2817]/60 rounded-xl p-1 border border-[#A87B4E]/40 shadow-sm">
              <button
                onClick={() => {
                  setIsDeveloperMode(false);
                  if (activeTab !== 'cards' && activeTab !== 'links') {
                    setActiveTab('cards');
                  }
                }}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition ${
                  !isDeveloperMode
                    ? 'bg-[#A87B4E] text-[#FFFFFF] shadow-sm'
                    : 'text-[#F5F2EB]/70 hover:text-[#FFFFFF]'
                }`}
                title="Simple interface designed for normal users"
              >
                <span>Normal User</span>
              </button>
              <button
                onClick={() => setIsDeveloperMode(true)}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition ${
                  isDeveloperMode
                    ? 'bg-[#A87B4E] text-[#FFFFFF] shadow-sm'
                    : 'text-[#F5F2EB]/70 hover:text-[#FFFFFF]'
                }`}
                title="Unlock full 6-layer workbench, pipeline runner, and test tools for developer"
              >
                <span>Developer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Mode Explanation Banner (only in Developer Mode) */}
      {isDeveloperMode && (
        externalMode ? (
          <div className="bg-[#3D2817]/70 border-t border-b border-[#A87B4E]/30 py-1.5 px-4 text-center text-xs text-[#F5F2EB] flex items-center justify-center space-x-2">
            <EyeOff className="w-3.5 h-3.5 text-[#A87B4E]" />
            <span>
              <strong className="text-[#FFFFFF]">External Rendering Rule Active:</strong> Claims with status <code className="bg-[#2C3E50] px-1 py-0.5 rounded font-mono text-[#F5F2EB] border border-[#A87B4E]/30">TO_COLLECT</code> or <code className="bg-[#2C3E50] px-1 py-0.5 rounded font-mono text-[#F5F2EB] border border-[#A87B4E]/30">UNKNOWN</code> are suppressed from card display.
            </span>
          </div>
        ) : (
          <div className="bg-[#3D2817]/70 border-t border-b border-[#A87B4E]/30 py-1.5 px-4 text-center text-xs text-[#F5F2EB] flex items-center justify-center space-x-2">
            <Eye className="w-3.5 h-3.5 text-[#A87B4E]" />
            <span>
              <strong className="text-[#FFFFFF]">Internal Legal Audit Active:</strong> Displaying full unmasked registry audit trail including verified substantiations and primary packaging dossiers.
            </span>
          </div>
        )
      )}
    </header>
  );
};
