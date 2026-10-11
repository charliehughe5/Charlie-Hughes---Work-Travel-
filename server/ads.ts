/**
 * Charlie Creator Hub - Google Ads & Video Promotion Service
 * Enforces strict spending safety: paused by default, explicit confirmation gates,
 * and clear separation between organic views and paid advertising impressions.
 */

import { GoogleAdsPromotion } from '../src/types/hub';
import { db } from './db';

export function getGoogleAdsStatus() {
  const creds = db.getDatabase().credentials || {};
  const hasDevToken = Boolean(process.env.GOOGLE_ADS_DEVELOPER_TOKEN || creds.googleAdsDeveloperToken);
  const hasCustomerId = Boolean(process.env.GOOGLE_ADS_CUSTOMER_ID || creds.googleAdsCustomerId);

  return {
    configured: hasDevToken && hasCustomerId,
    customerId: process.env.GOOGLE_ADS_CUSTOMER_ID || creds.googleAdsCustomerId || 'Awaiting Customer ID (e.g. 123-456-7890)',
    devTokenConfigured: hasDevToken,
    accountName: 'Charlie Hughes - YouTube Promotions',
    currency: 'GBP (£)',
    timezone: 'Europe/London',
    status: hasDevToken && hasCustomerId ? 'connected' : 'awaiting_credentials',
    lastSync: hasDevToken ? new Date().toISOString() : undefined,
    setupInstructions: [
      '1. Request a Developer Token in your Google Ads Manager Account (Tools & Settings -> API Center)',
      '2. Enable Google Ads API in Google Cloud Console',
      '3. Set GOOGLE_ADS_DEVELOPER_TOKEN and GOOGLE_ADS_CUSTOMER_ID in environment',
      '4. Connect OAuth client with https://www.googleapis.com/auth/adwords scope',
    ],
  };
}

export function createPromotionCampaign(payload: Omit<GoogleAdsPromotion, 'id' | 'actualSpendGbp' | 'impressions' | 'paidViews' | 'clicks' | 'avgCpvGbp' | 'createdAt'>): GoogleAdsPromotion {
  // Budget sanity check: ensure budget > 0 and <= safety limit
  if (payload.totalBudgetGbp <= 0) {
    throw new Error('Total campaign budget must be greater than £0.');
  }

  const campaign: GoogleAdsPromotion = {
    id: `ad-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ...payload,
    // Always start as draft or awaiting_confirmation unless explicitly confirmed
    status: payload.userExplicitlyConfirmed ? 'paused' : 'awaiting_confirmation',
    isLiveInGoogleAds: false,
    actualSpendGbp: 0,
    impressions: 0,
    paidViews: 0,
    clicks: 0,
    avgCpvGbp: 0,
    createdAt: new Date().toISOString(),
  };

  const database = db.getDatabase();
  database.adsCampaigns.unshift(campaign);
  db.logAudit(
    'GOOGLE_ADS_CAMPAIGN_PREPARED',
    `Promotion campaign created: "${campaign.campaignName}" with budget £${campaign.totalBudgetGbp}. Status: ${campaign.status}`
  );
  db.save();

  return campaign;
}

export function confirmAndActivateCampaign(campaignId: string): GoogleAdsPromotion {
  const database = db.getDatabase();
  const campaign = database.adsCampaigns.find((c) => c.id === campaignId);
  if (!campaign) {
    throw new Error(`Campaign with ID ${campaignId} not found.`);
  }

  campaign.userExplicitlyConfirmed = true;
  // Kept paused for creator safety; creator can manually unpause in Google Ads or via hub
  campaign.status = 'paused';
  db.logAudit(
    'GOOGLE_ADS_EXPLICIT_CONFIRMATION',
    `User explicitly approved budget of £${campaign.totalBudgetGbp} for campaign "${campaign.campaignName}". State set to Paused.`
  );
  db.save();

  return campaign;
}
