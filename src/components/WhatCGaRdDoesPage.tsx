import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Send,
  Building2,
  Scale,
  TrendingUp,
  Landmark,
  Store,
  FileCheck2,
  Search,
  Sparkles,
} from 'lucide-react';
import { CGaRdLogo } from './CGaRdLogo';
import { AnimatedVideoPlayer } from './AnimatedVideoPlayer';

interface WhatCGaRdDoesPageProps {
  onNavigateToRegistry?: () => void;
}

export const WhatCGaRdDoesPage: React.FC<WhatCGaRdDoesPageProps> = ({ onNavigateToRegistry }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    role: 'Brand with clinical trials',
    inquiry: '',
  });
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company) return;
    setFormSubmitted(true);
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      company: '',
      role: 'Brand with clinical trials',
      inquiry: '',
    });
    setFormSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#2C3E50] text-[#F5F2EB] font-sans antialiased selection:bg-[#A87B4E]/40 selection:text-[#FFFFFF]">
      {/* Top Header matching website color pattern */}
      <header className="sticky top-0 z-40 bg-[#2C3E50]/95 backdrop-blur-md border-b border-[#3D2817] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CGaRdLogo size="md" showText={true} />
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <a
              href="#video-explainer"
              className="text-xs font-semibold text-[#F5F2EB]/75 hover:text-[#FFFFFF] hidden md:inline transition"
            >
              Watch the Video
            </a>
            <a
              href="#output-card"
              className="text-xs font-semibold text-[#F5F2EB]/75 hover:text-[#FFFFFF] hidden md:inline transition"
            >
              Audit Card
            </a>
            <a
              href="#audiences"
              className="text-xs font-semibold text-[#F5F2EB]/75 hover:text-[#FFFFFF] hidden md:inline transition"
            >
              Who It&#39;s For
            </a>
            <a
              href="#contact"
              className="text-xs font-semibold text-[#F5F2EB]/75 hover:text-[#FFFFFF] hidden sm:inline transition"
            >
              Talk to us
            </a>

            {onNavigateToRegistry && (
              <button
                onClick={onNavigateToRegistry}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#A87B4E] hover:opacity-90 text-[#FFFFFF] text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Products &amp; Claims</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16 sm:space-y-24">
        {/* ========================================================================= */}
        {/* SECTION 1: HERO                                                           */}
        {/* ========================================================================= */}
        <section className="text-center pt-4 sm:pt-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#3D2817]/70 border border-[#A87B4E]/40 text-[11px] font-mono font-semibold text-[#F5F2EB]">
            <span className="w-2 h-2 rounded-full bg-[#A87B4E] animate-pulse" />
            <span>CGaRd • Pronounced &quot;guard&quot;</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#FFFFFF] max-w-3xl mx-auto leading-tight">
            Legal is not the same as working.
          </h1>

          <p className="text-base sm:text-lg text-[#F5F2EB]/85 max-w-2xl mx-auto leading-relaxed">
            CGaRd takes advertised claims, gives them persistent IDs, and matches them against public regulatory records.
          </p>

          <p className="text-xs text-[#F5F2EB]/60 italic max-w-lg mx-auto">
            Regulatory compliance satisfies the lawyers. Efficacy satisfies the customers.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#output-card"
              className="px-6 py-3 rounded-xl bg-[#A87B4E] hover:opacity-90 text-[#FFFFFF] font-bold text-sm shadow-lg transition inline-flex items-center space-x-2 cursor-pointer"
            >
              <span>See how it works</span>
              <ArrowRight className="w-4 h-4 text-[#FFFFFF]" />
            </a>

            {onNavigateToRegistry && (
              <button
                onClick={onNavigateToRegistry}
                className="px-5 py-3 rounded-xl bg-[#3D2817]/80 hover:bg-[#3D2817] text-[#F5F2EB] border border-[#A87B4E]/40 font-semibold text-sm transition inline-flex items-center space-x-2 cursor-pointer shadow-sm"
              >
                <Search className="w-4 h-4 text-[#A87B4E]" />
                <span>Explore Products &amp; Claims</span>
              </button>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: THE GAP                                                        */}
        {/* ========================================================================= */}
        <section className="bg-[#3D2817]/60 rounded-2xl border border-[#A87B4E]/30 p-6 sm:p-8 shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-[#FFFFFF]">
              The regulatory verification gap
            </h2>
            <p className="text-xs text-[#F5F2EB]/60 mt-1 italic">
              Paperwork is quick. Real human trials take months.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-center font-bold text-[#FFFFFF] text-sm sm:text-base">
              Your label passed the paperwork. Did it pass the test?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl bg-[#2C3E50] border border-[#3D2817] p-4 text-left">
                <span className="block font-bold text-xs uppercase tracking-wider text-[#A87B4E] mb-1">
                  Legally true
                </span>
                <p className="text-xs sm:text-sm text-[#F5F2EB]/90 leading-snug">
                  Notification approved. Standard notified ingredient combinations waive product trials.
                </p>
              </div>

              <div className="rounded-xl bg-[#2C3E50] border border-[#3D2817] p-4 text-left">
                <span className="block font-bold text-xs uppercase tracking-wider text-[#F5F2EB] mb-1">
                  Actually tested
                </span>
                <p className="text-xs sm:text-sm text-[#F5F2EB]/90 leading-snug">
                  Independent clinical efficacy trials on the finished product. Rarely on file.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* VIDEO EXPLAINER SECTION (WITH AI AUDIO VOICE)                             */}
        {/* ========================================================================= */}
        <section id="video-explainer" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#FFFFFF]">
                The thirty second summary
              </h2>
              <p className="text-xs text-[#F5F2EB]/70 mt-0.5">
                Watch how every claim component sits behind official filings.
              </p>
            </div>

          </div>

          <AnimatedVideoPlayer />
        </section>

        {/* ========================================================================= */}
        {/* WHAT THE OUTPUT LOOKS LIKE (EXACT ATTACHED CARD FROM USER SCREENSHOT)     */}
        {/* ========================================================================= */}
        <section id="output-card" className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-[#FFFFFF]">
              What the output looks like
            </h2>
          </div>

          {/* Exact Replica of Attached Card */}
          <div className="bg-[#3D2817]/70 rounded-2xl border-2 border-[#A87B4E]/40 p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="rounded-xl border border-[#3D2817] bg-[#2C3E50] overflow-hidden divide-y divide-[#3D2817]">
              {/* Card Header: OO on left, "Claim Description" in center */}
              <div className="px-5 py-4 flex items-center relative bg-[#3D2817]/40">
                <div className="flex items-center space-x-1.5 text-lg font-mono text-[#F5F2EB]">
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-[#F5F2EB]" />
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-[#F5F2EB]" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#FFFFFF] tracking-tight">
                    &ldquo;Claim Description&rdquo;
                  </h3>
                </div>
              </div>

              {/* Row 1: Regulatory basis */}
              <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-5 gap-2">
                <div className="sm:col-span-1 font-semibold text-sm text-[#F5F2EB]/90">
                  Regulatory basis
                </div>
                <div className="sm:col-span-2 text-sm text-[#F5F2EB]/60">
                  {/* Clean standard public filing record */}
                </div>
              </div>

              {/* Row 2: Clinical data for this product -> Highlighted Message */}
              <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-5 gap-2 bg-[#3D2817]/80">
                <div className="sm:col-span-1 font-semibold text-sm text-[#F5F2EB]/90">
                  Clinical data for this product
                </div>
                <div className="sm:col-span-2 text-sm sm:text-base font-extrabold text-[#A87B4E] tracking-tight">
                  None on file — submission waived by use of the notified combination
                </div>
              </div>

              {/* Row 3: Notified actives with established androgenetic alopecia evidence */}
              <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-5 gap-2">
                <div className="sm:col-span-1 font-semibold text-sm text-[#F5F2EB]/90 leading-snug">
                  Notified actives with established androgenetic alopecia evidence
                </div>
                <div className="sm:col-span-2 text-sm text-[#F5F2EB]/60">
                  {/* Active ingredients record */}
                </div>
              </div>

              {/* Row 4: Permissible claim language */}
              <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-5 gap-2">
                <div className="sm:col-span-1 font-semibold text-sm text-[#F5F2EB]/90">
                  Permissible claim language
                </div>
                <div className="sm:col-span-2 text-sm text-[#F5F2EB]/60">
                  {/* Statutory permitted wording */}
                </div>
              </div>

              {/* Row 5: Claim history */}
              <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-5 gap-2">
                <div className="sm:col-span-1 font-semibold text-sm text-[#F5F2EB]/90">
                  Claim history
                </div>
                <div className="sm:col-span-2 text-sm text-[#F5F2EB]/60">
                  {/* Longitudinal revisions */}
                </div>
              </div>
            </div>

            {/* Exact Footnote Text from Screenshot 1 */}
            <p className="text-xs sm:text-sm text-[#F5F2EB]/70 italic leading-relaxed pt-1">
              Illustrative. Note what the card does not say: it never says the product is a scam, never says the company lied, and never estimates a concentration.
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: WHO IT'S FOR                                                   */}
        {/* ========================================================================= */}
        <section id="audiences" className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-[#FFFFFF]">
              Built for five professional audiences
            </h2>
            <p className="text-xs text-[#F5F2EB]/60 italic">
              We sell to professionals because consumers already spend their money on the products.
            </p>
          </div>

          <div className="text-center p-3 rounded-xl bg-[#3D2817]/70 text-[#FFFFFF] text-xs font-semibold max-w-xl mx-auto border border-[#A87B4E]/30 shadow-sm">
            Consumers are the audience, not the customer.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Brands with real trials */}
            <div className="bg-[#3D2817]/60 rounded-xl border border-[#A87B4E]/30 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#2C3E50] text-[#A87B4E] flex items-center justify-center mb-3">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-[#FFFFFF] mb-1">
                  Brands with real trials
                </h3>
                <p className="text-xs text-[#F5F2EB]/80 leading-relaxed">
                  Protect your clinical investment against competitors who merely notified paperwork.
                </p>
              </div>
            </div>

            {/* 2. Plaintiff law firms */}
            <div className="bg-[#3D2817]/60 rounded-xl border border-[#A87B4E]/30 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#2C3E50] text-[#A87B4E] flex items-center justify-center mb-3">
                  <Scale className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-[#FFFFFF] mb-1">
                  Plaintiff law firms
                </h3>
                <p className="text-xs text-[#F5F2EB]/80 leading-relaxed">
                  Access timestamped claim records and statutory filings for substantiation and consumer protection audits.
                </p>
              </div>
            </div>

            {/* 3. Institutional investors */}
            <div className="bg-[#3D2817]/60 rounded-xl border border-[#A87B4E]/30 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#2C3E50] text-[#A87B4E] flex items-center justify-center mb-3">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-[#FFFFFF] mb-1">
                  Institutional investors
                </h3>
                <p className="text-xs text-[#F5F2EB]/80 leading-relaxed">
                  Quantify regulatory and litigation risk before closing consumer healthcare acquisitions.
                </p>
              </div>
            </div>

            {/* 4. Regulators */}
            <div className="bg-[#3D2817]/60 rounded-xl border border-[#A87B4E]/30 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#2C3E50] text-[#A87B4E] flex items-center justify-center mb-3">
                  <Landmark className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-[#FFFFFF] mb-1">
                  Regulators
                </h3>
                <p className="text-xs text-[#F5F2EB]/80 leading-relaxed">
                  Cross-reference advertised marketing claims against official ingredient notifications in seconds.
                </p>
              </div>
            </div>

            {/* 5. Retail merchandising teams */}
            <div className="bg-[#3D2817]/60 rounded-xl border border-[#A87B4E]/30 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#2C3E50] text-[#A87B4E] flex items-center justify-center mb-3">
                  <Store className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-[#FFFFFF] mb-1">
                  Retail merchandising teams
                </h3>
                <p className="text-xs text-[#F5F2EB]/80 leading-relaxed">
                  Verify brand documentation and regulatory clearance before allocating shelf space.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* CALL TO ACTION ("TALK TO US" FORM)                                        */}
        {/* ========================================================================= */}
        <section id="contact" className="bg-[#3D2817]/70 rounded-2xl border border-[#A87B4E]/30 p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-[#FFFFFF]">
              Talk to the CGaRd team
            </h2>
            <p className="text-xs text-[#F5F2EB]/60 italic">
              Our squad reviewed this form. They approved every single field.
            </p>
          </div>

          {formSubmitted ? (
            <div className="p-6 rounded-xl bg-[#2C3E50] border border-[#A87B4E]/60 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#A87B4E] mx-auto" />
              <h3 className="text-base font-bold text-[#FFFFFF]">
                Inquiry received
              </h3>
              <p className="text-xs text-[#F5F2EB]/80 max-w-md mx-auto">
                Thank you, {formData.name}. Our regulatory team will cross-reference your inquiry against public filings and respond to {formData.company}.
              </p>
              <button
                onClick={handleResetForm}
                className="mt-2 px-4 py-2 rounded-lg bg-[#A87B4E] hover:opacity-90 text-[#FFFFFF] text-xs font-semibold transition cursor-pointer"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitForm} className="space-y-4 max-w-xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#F5F2EB] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#2C3E50] border border-[#A87B4E]/40 text-xs text-[#F5F2EB] placeholder:text-[#F5F2EB]/40 focus:outline-none focus:border-[#A87B4E] focus:ring-1 focus:ring-[#A87B4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#F5F2EB] mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Health Brands"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#2C3E50] border border-[#A87B4E]/40 text-xs text-[#F5F2EB] placeholder:text-[#F5F2EB]/40 focus:outline-none focus:border-[#A87B4E] focus:ring-1 focus:ring-[#A87B4E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F5F2EB] mb-1">
                  Your Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#2C3E50] border border-[#A87B4E]/40 text-xs text-[#F5F2EB] focus:outline-none focus:border-[#A87B4E] focus:ring-1 focus:ring-[#A87B4E]"
                >
                  <option value="Brand with clinical trials">Brand with clinical trials</option>
                  <option value="Plaintiff law firm">Plaintiff law firm</option>
                  <option value="Institutional investor">Institutional investor</option>
                  <option value="Regulator">Regulatory agency</option>
                  <option value="Retail merchandising">Retail merchandising team</option>
                  <option value="Other commercial interest">Other commercial inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F5F2EB] mb-1">
                  What you would like to check
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the claim, ingredient category, or regulatory filing you would like audited..."
                  value={formData.inquiry}
                  onChange={(e) => setFormData({ ...formData, inquiry: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#2C3E50] border border-[#A87B4E]/40 text-xs text-[#F5F2EB] placeholder:text-[#F5F2EB]/40 focus:outline-none focus:border-[#A87B4E] focus:ring-1 focus:ring-[#A87B4E]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#A87B4E] hover:opacity-90 text-[#FFFFFF] font-bold text-xs tracking-wide uppercase transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#FFFFFF]" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </section>
      </main>

      {/* Footer matching website pattern */}
      <footer className="mt-16 border-t border-[#3D2817] bg-[#3D2817]/60 py-8 px-4 text-center text-xs text-[#F5F2EB]/60 space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <CGaRdLogo size="sm" showText={true} />
        </div>
        <p className="font-mono text-[11px] text-[#A87B4E]">
          CGaRd Engine • Claims: certified ≠ effective.
        </p>
        <p className="text-[10px] text-[#F5F2EB]/40">
          Independent regulatory claim registry &amp; audit trail. Records without judgment.
        </p>
      </footer>
    </div>
  );
};
