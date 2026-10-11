import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  DollarSign,
  Calendar,
  Mail,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';
import { SponsorshipDeal, HubDatabase } from '../types/hub';
import { api } from '../api/client';

interface SponsorshipsViewProps {
  database: HubDatabase;
  onRefresh: () => void;
}

export const SponsorshipsView: React.FC<SponsorshipsViewProps> = ({
  database,
  onRefresh,
}) => {
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [showMediaKitModal, setShowMediaKitModal] = useState(false);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [pitchText, setPitchText] = useState('');
  const [copied, setCopied] = useState(false);

  // New deal form state
  const [brand, setBrand] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [fee, setFee] = useState(350);
  const [deliverables, setDeliverables] = useState('60-second integrated mid-roll segment + link in description');
  const [followUp, setFollowUp] = useState('2026-10-22');

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim()) return;

    const deal: SponsorshipDeal = {
      id: `spon-${Date.now()}`,
      brandName: brand.trim(),
      contactName: contact.trim() || 'Partnership Manager',
      contactEmail: email.trim() || 'contact@brand.co.uk',
      website: '',
      opportunityDescription: `Integration in Charlie Hughes travel/work vlog`,
      proposedFeeGbp: Number(fee),
      actualReceivedGbp: 0,
      expectedDeliverables: deliverables,
      dateContacted: new Date().toISOString().split('T')[0],
      followUpDate: followUp,
      status: 'contacted',
      asaComplianceReminder: 'UK ASA / CAP Code: Clear upfront #AD in title/description and spoken disclosure required.',
      outreachNotes: '',
      createdAt: new Date().toISOString(),
    };

    try {
      await api.createItem('sponsorships', deal);
      setShowNewDealModal(false);
      setBrand('');
      onRefresh();
    } catch (err: any) {
      alert(`Error creating deal: ${err.message}`);
    }
  };

  const handleUpdateStatus = async (id: string, status: SponsorshipDeal['status']) => {
    try {
      await api.updateItem('sponsorships', id, { status });
      onRefresh();
    } catch (err: any) {
      alert(`Error updating deal: ${err.message}`);
    }
  };

  const handleGeneratePitch = (deal: SponsorshipDeal) => {
    const pitch = `
Subject: Collaboration Opportunity: Charlie Hughes (@charliehughe5) x ${deal.brandName}

Hi ${deal.contactName || 'Team'},

My name is Charlie Hughes. I host the weekly British travel and professional life vlog "Work. Travel. Real Life." on YouTube (@charliehughe5).

Each week I document driving hundreds of miles across the UK and Ireland, inspecting commercial sites, staying in hotels, and maintaining fitness and routine on the road.

I really admire what you're doing at ${deal.brandName}. Given our active, mobile UK professional audience (76% UK based, highly engaged on travel and practical routines), I would love to integrate ${deal.brandName} naturally into an upcoming vlog episode.

Deliverable proposal:
• ${deal.expectedDeliverables}
• Clear UK ASA-compliant sponsorship transparency

Would you be open to exploring this for our upcoming UK road trip episodes?

Kind regards,
Charlie Hughes
YouTube: https://www.youtube.com/@charliehughe5
    `.trim();

    setPitchText(pitch);
    setShowPitchModal(true);
  };

  const sponsorships = database.sponsorships;
  const totalPipeline = sponsorships.reduce((acc, s) => acc + s.proposedFeeGbp, 0);
  const totalReceived = sponsorships.reduce((acc, s) => acc + (s.actualReceivedGbp || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Sponsorships & Creator Income
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Brand partnership pipeline, media kit generator, and UK ASA advertising compliance tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMediaKitModal(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Media Kit</span>
          </button>

          <button
            onClick={() => setShowNewDealModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Brand Deal</span>
          </button>
        </div>
      </div>

      {/* ASA Compliance Callout */}
      <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">UK Advertising Standards (ASA / CMA / CAP Code): </span>
          <span>
            Every sponsored video or gifted integration must include prominent, upfront disclosure: e.g. '#AD' in the title, tick the YouTube 'Paid promotion' checkbox, and clearly disclose the partnership within the first 30 seconds of the vlog.
          </span>
        </div>
      </div>

      {/* Revenue Metric Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 mb-1">Actual Received Income</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            £{totalReceived.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Paid & settled invoices</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 mb-1">Active Pipeline Value</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            £{totalPipeline.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Proposed & negotiating deals</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 mb-1">Active Brand Deals</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {sponsorships.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Partnerships in progress</div>
        </div>
      </div>

      {/* Deals Pipeline Table / List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Partnership Opportunities ({sponsorships.length})
        </h3>

        <div className="space-y-3">
          {sponsorships.map((deal) => (
            <div
              key={deal.id}
              className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-slate-900 uppercase">{deal.status}</span>
                    <span aria-hidden="true">·</span>
                    <span>Contact: {deal.contactName} ({deal.contactEmail})</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">Follow-up: {deal.followUpDate}</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{deal.brandName}</h4>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    <strong>Deliverables:</strong> {deal.expectedDeliverables}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-lg font-bold font-mono text-slate-900 block">
                      £{deal.proposedFeeGbp}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Proposed Fee</span>
                  </div>

                  <button
                    onClick={() => handleGeneratePitch(deal)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Outreach Pitch</span>
                  </button>
                </div>
              </div>

              {/* Status Selector Bar */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-slate-400">Update Status:</span>
                {(['prospect', 'contacted', 'negotiating', 'agreed', 'published', 'paid'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(deal.id, st)}
                      className={`px-2 py-0.5 rounded capitalize font-medium transition-colors ${
                        deal.status === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}

          {sponsorships.length === 0 && (
            <div className="py-12 text-center bg-white border border-slate-200 rounded-xl text-slate-500 text-xs">
              No brand deals tracked yet. Click "Add Brand Deal" above.
            </div>
          )}
        </div>
      </div>

      {/* Media Kit Modal */}
      {showMediaKitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs space-y-4 animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-slate-900">
              Charlie Hughes — Channel Media Kit (2026)
            </h3>
            <p className="text-slate-500">
              Exportable one-sheet based on genuine channel analytics for brand outreach:
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 font-mono text-[11px] text-slate-800">
              <div>
                <strong>CREATOR:</strong> Charlie Hughes (@charliehughe5)<br />
                <strong>CHANNEL THEME:</strong> Work. Travel. Real Life.<br />
                <strong>LOCATION:</strong> United Kingdom (Travels UK & Ireland)<br />
                <strong>FREQUENCY:</strong> 1 Main Vlog per week (Sunday 18:00)
              </div>

              <div className="pt-2 border-t border-slate-200">
                <strong>AUDIENCE GEOGRAPHY:</strong><br />
                • United Kingdom: 76.4%<br />
                • Ireland: 12.8%<br />
                • United States / Other: 10.8%
              </div>

              <div className="pt-2 border-t border-slate-200">
                <strong>CORE AUDIENCE INTERESTS:</strong><br />
                • UK road trips and solo working travel<br />
                • Health, fitness, and gyms while traveling<br />
                • Commercial property, fire safety, and building inspections<br />
                • Authentic British working life
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowMediaKitModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outreach Pitch Generator Modal */}
      {showPitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Brand Outreach Draft Email
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pitchText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-md hover:bg-slate-50 flex items-center gap-1 font-semibold text-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Pitch'}</span>
              </button>
            </div>

            <textarea
              value={pitchText}
              onChange={(e) => setPitchText(e.target.value)}
              rows={12}
              className="w-full border border-slate-300 rounded-lg p-3 font-mono text-[11px] leading-relaxed"
            />

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setShowPitchModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Deal Modal */}
      {showNewDealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-xs animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Add Sponsorship Opportunity
            </h3>
            <p className="text-slate-500 mb-4">
              Track potential brand partners, rates in GBP (£), and deliverables.
            </p>

            <form onSubmit={handleCreateDeal} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. GymGear UK / Motorway Services"
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Sarah"
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@brand.co.uk"
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Proposed Fee (£ GBP)</label>
                  <input
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Follow-Up Date</label>
                  <input
                    type="date"
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deliverables</label>
                <input
                  type="text"
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewDealModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
