/**
 * Charlie Creator Hub - Core TypeScript Data Definitions
 * "Work. Travel. Real Life."
 */

export type ProjectStatus =
  | 'idea'
  | 'researching'
  | 'planned'
  | 'script_in_progress'
  | 'ready_to_film'
  | 'filmed'
  | 'editing'
  | 'thumbnail_and_title'
  | 'ready_to_upload'
  | 'scheduled'
  | 'published'
  | 'performance_review';

export interface ChannelSettings {
  channelName: string;
  channelHandle: string;
  channelUrl: string;
  tagline: string;
  creatorName: string;
  primaryLocation: string;
  currency: string;
  timezone: string;
  language: string;
  publishingTarget: string;
  weeklyPublishDay: string;
  preferredVideoLength: string;
  scriptStyle: string;
  defaultCategory: string;
  freeTierCostGoal: boolean;
  ownerPinHash?: string;
}

export interface VideoProject {
  id: string;
  title: string;
  workingTitle: string;
  status: ProjectStatus;
  publishDate?: string;
  targetRuntimeMinutes: number;
  description: string;
  tags: string[];
  category: string;
  tripId?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  privacyStatus: 'private' | 'unlisted' | 'public';
  thumbnailUrl?: string;
  introAssetId?: string;
  outroAssetId?: string;
  scriptId?: string;
  editingNotes: string;
  shortClipsIdeas: string[];
  chapters: { title: string; timestamp: string }[];
  editingChecklist: { id: string; text: string; done: boolean }[];
  createdAt: string;
  updatedAt: string;
}

export interface VideoIdea {
  id: string;
  title: string;
  titleVariations: {
    curiosity: string;
    authentic: string;
    search: string;
    story: string;
    straightforward: string;
  };
  hook: string;
  whyItMatters: string;
  targetAudience: string;
  suggestedOpening: string;
  thumbnailConcept: string;
  suggestedStructure: string[];
  filmingOpportunities: string[];
  estimatedEffort: 'Low' | 'Medium' | 'High';
  category: 'Work Travel' | 'Fire Safety / Survey' | 'Hotel & Stays' | 'Gym & Fitness' | 'Current News' | 'General Life' | 'Lessons Learned';
  originTripId?: string;
  rating: number; // 1-5
  status: 'inbox' | 'shortlisted' | 'scheduled' | 'converted' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

export interface WorkTrip {
  id: string;
  title: string;
  destination: string;
  dates: string;
  durationDays: number;
  purpose: string;
  transportMode: 'Driving' | 'Train' | 'Walking' | 'Flight';
  hotelDetails: string;
  stopsAlongWay: string[];
  filmingAuthorisedAtSite: 'Full' | 'Restricted' | 'Strictly Prohibited' | 'Pending Confirmation';
  permittedFilmingNotes: string;
  observations: string;
  cameraGear: string;
  filmingPlan?: TripFilmingPlan;
  status: 'planning' | 'in_progress' | 'completed' | 'converted_to_vlog';
  linkedProjectId?: string;
  createdAt: string;
}

export interface TripFilmingScene {
  id: string;
  stepNumber: number;
  stageName: string;
  whatToFilm: string;
  clipDurationSeconds: number;
  cameraAngle: string;
  talkingPoints: string[];
  suggestedNarration: string;
  essential: boolean;
  privacyWarning?: string;
  completed: boolean;
}

export interface TripFilmingPlan {
  id: string;
  tripId: string;
  title: string;
  scenes: TripFilmingScene[];
  preFilmingChecklist: { id: string; item: string; checked: boolean }[];
  generatedAt: string;
}

export interface ScriptRecord {
  id: string;
  projectId?: string;
  title: string;
  workingTitle: string;
  targetRuntime: string;
  bulletTalkingPrompts: string[];
  fullSpokenScript: string;
  openingHook: string;
  intro: string;
  sections: { title: string; bullets: string[]; spokenText: string; bRollNotes: string }[];
  callToAction: string;
  closingReflection: string;
  factualVerificationNotes: string[];
  complianceSafetyNotes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NewsResearchItem {
  id: string;
  headline: string;
  factualSummary: string;
  publicationDate: string;
  location?: string;
  whyGoodVideo: string;
  suggestedAngle: string;
  sourceName: string;
  sourceUrl: string;
  reliabilityLevel: 'Official UK Govt / HSE / Fire Authority' | 'Reputable National News' | 'Regional Press' | 'Industry Body';
  verificationRequired: boolean;
  category: 'National UK' | 'Fire & Workplace Safety' | 'Leisure & Gyms' | 'Travel & Roads' | 'Quirky Discoveries';
  savedAsIdea: boolean;
  createdAt: string;
}

export interface CalendarItem {
  id: string;
  title: string;
  date: string;
  type: 'filming' | 'editing' | 'publishing' | 'travel' | 'sponsorship_deadline';
  projectId?: string;
  tripId?: string;
  notes?: string;
  completed: boolean;
}

export interface SponsorshipDeal {
  id: string;
  brandName: string;
  contactName: string;
  contactEmail: string;
  website: string;
  opportunityDescription: string;
  proposedFeeGbp: number;
  actualReceivedGbp?: number;
  expectedDeliverables: string;
  relevantVideoTitle?: string;
  dateContacted: string;
  followUpDate: string;
  status:
    | 'prospect'
    | 'contacted'
    | 'negotiating'
    | 'agreed'
    | 'filming'
    | 'awaiting_approval'
    | 'published'
    | 'invoiced'
    | 'paid'
    | 'declined';
  invoiceReference?: string;
  paymentDueDate?: string;
  asaComplianceReminder: string;
  outreachNotes: string;
  createdAt: string;
}

export interface GoogleAdsPromotion {
  id: string;
  campaignName: string;
  promotedVideoId: string;
  promotedVideoTitle: string;
  campaignObjective: 'Video Views (CPV)' | 'Demand Gen Multi-Surface' | 'Channel Awareness';
  targetLocations: string[];
  languages: string[];
  totalBudgetGbp: number;
  dailyBudgetGbp: number;
  startDate: string;
  endDate: string;
  biddingStrategy: 'Maximum CPV' | 'Target CPV' | 'Maximize Clicks';
  maxCpvGbp: number;
  status: 'draft' | 'awaiting_confirmation' | 'paused' | 'active' | 'completed' | 'rejected';
  isLiveInGoogleAds: boolean;
  googleAdsCampaignId?: string;
  actualSpendGbp: number;
  impressions: number;
  paidViews: number;
  clicks: number;
  avgCpvGbp: number;
  userExplicitlyConfirmed: boolean;
  createdAt: string;
}

export interface IntroOutroAsset {
  id: string;
  name: string;
  type: 'intro' | 'outro' | 'subscribe_card' | 'transition';
  presetStyle: 'Cinematic Road Trip' | 'Modern Travel Vlog' | 'Minimalist Creator' | 'Workday-to-Road-Trip' | 'Clean Logo Reveal';
  aspectRatio: '16:9' | '9:16' | '1:1';
  durationSeconds: number;
  primaryText: string;
  secondaryText: string;
  accentColor: string;
  generationEngine: 'browser_canvas_renderer' | 'veo_ai_model';
  veoOperationName?: string;
  mediaUrl?: string; // Blob or static URI
  status: 'draft' | 'rendering' | 'ready' | 'failed';
  costGbp: number;
  createdAt: string;
}

export interface ThumbnailConcept {
  id: string;
  projectId?: string;
  workingTitle: string;
  conceptNotes: string;
  headlineText: string;
  subText?: string;
  compositionGuidance: string;
  facialExpressionAdvice: string;
  colorPaletteAdvice: string;
  curiosityStoryHook: string;
  aspectRatio: '16:9' | '9:16';
  generatedPreviewUrl?: string;
  selectedVersion: boolean;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  ipAddress?: string;
}

export interface IntegrationDiagnostics {
  gemini: {
    configured: boolean;
    model: string;
    status: 'connected' | 'missing_key' | 'quota_error' | 'error';
    lastTested?: string;
    details?: string;
  };
  youtube: {
    configured: boolean;
    authType: 'oauth' | 'api_key' | 'none';
    channelConnected: boolean;
    channelTitle?: string;
    channelId?: string;
    scopesGranted: string[];
    status: 'connected' | 'awaiting_oauth' | 'error';
    lastSync?: string;
    details?: string;
  };
  googleAds: {
    configured: boolean;
    customerId?: string;
    devTokenConfigured: boolean;
    status: 'connected' | 'awaiting_credentials' | 'error';
    lastSync?: string;
    details?: string;
  };
  storage: {
    provider: 'local_persistent_db' | 'firestore';
    status: 'healthy';
    totalRecords: number;
    lastSaved: string;
  };
  videoGeneration: {
    model: string;
    available: boolean;
    paidConfirmationRequired: boolean;
    status: 'ready' | 'requires_paid_approval';
  };
}

export interface IntegrationCredentials {
  youtubeApiKey?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  googleAdsCustomerId?: string;
  googleAdsDeveloperToken?: string;
}

export interface HubDatabase {
  channel: ChannelSettings;
  credentials?: IntegrationCredentials;
  projects: VideoProject[];
  ideas: VideoIdea[];
  trips: WorkTrip[];
  scripts: ScriptRecord[];
  research: NewsResearchItem[];
  calendar: CalendarItem[];
  sponsorships: SponsorshipDeal[];
  adsCampaigns: GoogleAdsPromotion[];
  introOutros: IntroOutroAsset[];
  thumbnails: ThumbnailConcept[];
  auditLogs: AuditLogEntry[];
}

