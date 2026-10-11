import React, { useState } from 'react';
import {
  Megaphone,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Play,
  Pause,
  ExternalLink,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { GoogleAdsPromotion, HubDatabase } from '../types/hub';
import { api } from '../api/client';

interface GoogleAdsViewProps {
  database: HubDatabase;
  onRefresh: () => void;
}

export const GoogleAdsView: React.FC<GoogleAdsViewProps> = ({
  database,
  onRefresh,
}) => {
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<GoogleAdsPromotion | null>(null);

  // Campaign builder state
  const [campName, setCampName] = useState('Charlie Hughes - Manchester Vlog Promotion');
  const [selectedVideo, setSelectedVideo] = useState(database.projects[0]?.id || '');
  const [objective, setObjective] = useState<GoogleAdsPromotion['campaignObjective']>('Video Views (CPV)');
  const [budgetGbp, setBudgetGbp] = useState(25);
  const [dailyBudget, setDailyBudget] = useState(5);
  const [startDate, setStartDate] = useState('2026-10-19');
  const [endDate, setEndDate] = useState('2026-10-24');
  const [maxCpv, setMaxCpv] = useState(0.03);

  const handleCreateCampaignDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    const proj = database.projects.find((p) => p.id === selectedVideo) || database.projects[0];

    try {
      const created = await api.createGoogleAdsCampaign({
        campaignName: campName,
        promotedVideoId: proj?.id || 'pending',
        promotedVideoTitle: proj?.title || 'Selected Video',
        campaignObjective: objective,
        targetLocations: ['United Kingdom', 'Ireland'],
        languages: ['English'],
        totalBudgetGbp: Number(budgetGbp),
        dailyBudgetGbp: Number(dailyBudget),
        startDate,
        endDate,
        biddingStrategy: 'Maximum CPV',
        maxCpvGbp: Number(maxCpv),
        userExplicitlyConfirmed: false,
      });

      setShowNewCampaignModal(false);
      onRefresh();
      // Open explicit confirmation gate
      setShowConfirmModal(created);
    } catch (err: any) {
      alert(`Error creating campaign: ${err.message}`);
    }
  };

  const handleExplicitApprove = async () => {
    if (!showConfirmModal) return;

    try {
      await api.confirmGoogleAdsCampaign(showConfirmModal.id);
      alert(
        `Campaign "${showConfirmModal.campaignName}" budget (£${showConfirmModal.totalBudgetGbp}) confirmed. Prepared in Paused state for advertising safety.`
      );
      setShowConfirmModal(null);
      onRefresh();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const campaigns = database.adsCampaigns;
  const totalSpend = campaigns.reduce((acc, c) => acc + (c.actualSpendGbp || 0), 0);
  const totalPaidViews = campaigns.reduce((acc, c) => acc + (c.paidViews || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Google Ads & Video Promotions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Targeted promotions for Charlie Hughes vlogs with strict budget caps and explicit approval gates.
          </p>
        </div>

        <button
          onClick={() => setShowNewCampaignModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Prepare Video Promotion</span>
        </button>
      </div>

      {/* Safety Protocol Warning Banner */}
      <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Strict Advertising Spending Control: </span>
          <span>
            No funds will ever be committed or spent without your explicit final confirmation. All prepared campaigns default to Paused status and respect a hard budget ceiling in GBP (£).
          </span>
        </div>
      </div>

      {/* Organic vs Paid Performance Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 mb-1">Total Advertising Spend</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            £{totalSpend.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Currency: GBP (£) · Controlled
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 mb-1">Paid Video Views</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalPaidViews.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Distinct from Organic Views
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 mb-1">Organic Channel Views</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            18,450
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Organic discovery (non-promoted)
          </div>
        </div>
      </div>

      {/* Campaigns Registry */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Configured Promotions ({campaigns.length})
        </h3>

        <div className="space-y-3">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-slate-900">{camp.campaignObjective}</span>
                    <span aria-hidden="true">·</span>
                    <span>Target: {camp.targetLocations.join(', ')}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">Budget: £{camp.totalBudgetGbp} max</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{camp.campaignName}</h4>
                  <p className="text-slate-600 mt-0.5">
                    Promoted Video: <strong>{camp.promotedVideoTitle}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase ${
                      camp.status === 'paused'
                        ? 'bg-amber-100 text-amber-800'
                        : camp.status === 'awaiting_confirmation'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {camp.status.replace(/_/g, ' ')}
                  </span>

                  {!camp.userExplicitlyConfirmed && (
                    <button
                      onClick={() => setShowConfirmModal(camp)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-2xs transition-colors"
                    >
                      Review & Approve Spend
                    </button>
                  )}
                </div>
              </div>

              {/* Metric Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 font-mono text-[11px] text-slate-600">
                <div>
                  <span className="text-slate-400 block font-sans">Spend:</span>
                  <span className="font-bold text-slate-900">£{camp.actualSpendGbp.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans">Paid Views:</span>
                  <span className="font-bold text-slate-900">{camp.paidViews}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans">Clicks:</span>
                  <span className="font-bold text-slate-900">{camp.clicks}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans">Max CPV:</span>
                  <span className="font-bold text-slate-900">£{camp.maxCpvGbp}</span>
                </div>
              </div>
            </div>
          ))}

          {campaigns.length === 0 && (
            <div className="py-12 text-center bg-white border border-slate-200 rounded-xl text-slate-500 text-xs">
              No promotions created yet. Click "Prepare Video Promotion" above.
            </div>
          )}
        </div>
      </div>

      {/* Prepare Promotion Modal */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 text-xs animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Prepare YouTube Video Promotion
            </h3>
            <p className="text-slate-500 mb-4">
              Configure target audience, objective, and budget cap in GBP (£).
            </p>

            <form onSubmit={handleCreateCampaignDraft} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Video to Promote
                </label>
                <select
                  value={selectedVideo}
                  onChange={(e) => setSelectedVideo(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
                >
                  {database.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Total Budget (£ GBP)
                  </label>
                  <input
                    type="number"
                    value={budgetGbp}
                    onChange={(e) => setBudgetGbp(Number(e.target.value))}
                    min={5}
                    max={500}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Max Bid per View (£ CPV)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={maxCpv}
                    onChange={(e) => setMaxCpv(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                Notice: Campaigns are created in Paused state first to prevent unintentional charges.
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCampaignModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Promotion Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Explicit Confirmation Gate Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Explicit Spending Confirmation
                </h3>
                <p className="text-slate-500 text-[11px]">
                  Google Ads Promotion Budget Authorization
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-slate-700">
              <div>
                Campaign: <strong>{showConfirmModal.campaignName}</strong>
              </div>
              <div>
                Promoted Video: <strong>{showConfirmModal.promotedVideoTitle}</strong>
              </div>
              <div>
                Maximum Total Spend: <strong className="text-slate-900 font-mono">£{showConfirmModal.totalBudgetGbp} GBP</strong>
              </div>
              <div>
                Target Locations: <strong>United Kingdom, Ireland</strong>
              </div>
            </div>

            <p className="text-slate-600 text-[11px] leading-relaxed">
              By confirming, you authorize Charlie Creator Hub to prepare this campaign under your connected account. It will remain in <strong>PAUSED</strong> status until you explicitly trigger live activation.
            </p>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExplicitApprove}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Explicitly Authorize Budget (£{showConfirmModal.totalBudgetGbp})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
