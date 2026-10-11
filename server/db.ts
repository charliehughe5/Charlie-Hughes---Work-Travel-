/**
 * Charlie Creator Hub - Persistent Database Engine
 * File-backed JSON storage with atomic writes and schema durability.
 */

import fs from 'fs';
import path from 'path';
import { HubDatabase, ChannelSettings, VideoProject, VideoIdea, WorkTrip, ScriptRecord, NewsResearchItem, CalendarItem, SponsorshipDeal, GoogleAdsPromotion, IntroOutroAsset, ThumbnailConcept, AuditLogEntry } from '../src/types/hub';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'hub-database.json');

// Initial seed data reflecting Charlie Hughes' authentic channel
const defaultChannel: ChannelSettings = {
  channelName: 'Charlie Hughes',
  channelHandle: '@charliehughe5',
  channelUrl: 'https://www.youtube.com/@charliehughe5',
  tagline: 'Work. Travel. Real Life.',
  creatorName: 'Charlie Hughes',
  primaryLocation: 'United Kingdom',
  currency: 'GBP (£)',
  timezone: 'Europe/London',
  language: 'British English',
  publishingTarget: 'One main video per week',
  weeklyPublishDay: 'Sunday 18:00',
  preferredVideoLength: '10–15 minutes',
  scriptStyle: 'Conversational, authentic, direct and occasionally humorous',
  defaultCategory: 'Travel & Events / People & Blogs',
  freeTierCostGoal: true,
  ownerPinHash: '2026', // Default creator PIN for private access
};

const defaultProjects: VideoProject[] = [
  {
    id: 'proj-1',
    title: 'The Reality of a 5-Storey Leisure Centre Fire Survey in Manchester',
    workingTitle: 'Manchester Leisure Centre Vlog + Travel',
    status: 'editing',
    publishDate: '2026-10-18',
    targetRuntimeMinutes: 14,
    description: "Join me on a 3-day work trip to Manchester inspecting a major multi-level leisure facility and gym. Road trip reflections, hotel life, and what a fire risk assessor actually looks for behind the scenes (where filming is authorised!).",
    tags: ['Charlie Hughes', 'Work Vlog', 'UK Road Trip', 'Fire Safety Assessor', 'Manchester', 'Hotel Life', 'Real Life'],
    category: 'Travel & Work Life',
    tripId: 'trip-1',
    privacyStatus: 'private',
    editingNotes: 'Rough cut assembled. Need to colour grade the M6 motorway sunset clip and insert B-roll over the fire damper explanation.',
    shortClipsIdeas: [
      'The #1 mistake people make with fire doors in public buildings',
      'My 15-minute hotel room workout when arriving at 9pm',
      'Driving through Manchester rush hour on a rainy Tuesday'
    ],
    chapters: [
      { title: 'The 6am Departure & M6 Journey', timestamp: '00:00' },
      { title: 'Coffee Stop & Week Briefing', timestamp: '02:45' },
      { title: 'Arriving in Manchester: Site First Impressions', timestamp: '04:15' },
      { title: 'Leisure Centre Walkthrough (Authorised Areas)', timestamp: '06:30' },
      { title: 'The Hotel Reality: Premier Inn Salford Quays', timestamp: '09:20' },
      { title: 'Evening Gym Session & Working Week Reflections', timestamp: '11:15' },
      { title: 'What I Learned This Week', timestamp: '13:00' }
    ],
    editingChecklist: [
      { id: 'ec-1', text: 'Blur out all proprietary fire alarm panel passcodes', done: true },
      { id: 'ec-2', text: 'Check client permission for leisure pool plant corridor shot', done: true },
      { id: 'ec-3', text: 'Add chapter cards and subtle lower thirds', done: false },
      { id: 'ec-4', text: 'Master audio to -14 LUFS', done: false }
    ],
    createdAt: '2026-10-02T10:00:00Z',
    updatedAt: '2026-10-10T16:30:00Z'
  },
  {
    id: 'proj-2',
    title: 'North Wales Road Trip: Surviving Hotel Living & Scenic Travel',
    workingTitle: 'North Wales Coastal Drive + Work Routine',
    status: 'ready_to_film',
    publishDate: '2026-10-25',
    targetRuntimeMinutes: 12,
    description: "Heading along the North Wales coast for a series of commercial compliance visits. Spectacular coastal drives, exploring local spots, and how I maintain fitness while living out of a suitcase.",
    tags: ['North Wales', 'Road Trip', 'Vlog', 'Travel UK', 'Hotel Living', 'Fitness on the Road'],
    category: 'Travel & Lifestyle',
    tripId: 'trip-2',
    privacyStatus: 'unlisted',
    editingNotes: 'Will capture morning drone / dashcam along the A55 coastal expressway if weather permits.',
    shortClipsIdeas: [
      'Scenic North Wales coastline driving clip',
      'How to eat clean at UK motorway service stations'
    ],
    chapters: [
      { title: 'Hitting the Road Early', timestamp: '00:00' },
      { title: 'The A55 Coastline Drive', timestamp: '03:10' },
      { title: 'Site Visit Debrief', timestamp: '06:00' },
      { title: 'Finding a Local Independent Gym', timestamp: '08:45' },
      { title: 'Final Thoughts & Next Stop', timestamp: '11:00' }
    ],
    editingChecklist: [
      { id: 'ec-10', text: 'Capture dashcam intro', done: false },
      { id: 'ec-11', text: 'Confirm site authorization paperwork', done: true }
    ],
    createdAt: '2026-10-08T09:00:00Z',
    updatedAt: '2026-10-10T14:00:00Z'
  }
];

const defaultTrips: WorkTrip[] = [
  {
    id: 'trip-1',
    title: 'Manchester & Salford Leisure Compliance Audits',
    destination: 'Manchester & Salford, UK',
    dates: '14–16 October 2026',
    durationDays: 3,
    purpose: 'Commercial fire risk assessments and workplace health and safety compliance for 2 regional leisure facilities.',
    transportMode: 'Driving',
    hotelDetails: 'Premier Inn Salford Quays (booked 2 nights, gym nearby)',
    stopsAlongWay: ['Sandbach Services (Coffee & laptop catch-up)', 'Castlefield Canal Basin (Evening walk)'],
    filmingAuthorisedAtSite: 'Restricted',
    permittedFilmingNotes: 'Filming strictly permitted in public concourses and exterior approach only. No filming in plant rooms with security locks or client office desks.',
    observations: 'Busy driving week on the M6. Great contrast between industrial urban locations and modern fitness facilities.',
    cameraGear: 'iPhone 15 Pro on DJI Osmo Mobile gimbal, DJI Mic 2 wireless lapel, dashcam.',
    status: 'in_progress',
    linkedProjectId: 'proj-1',
    createdAt: '2026-10-02T08:00:00Z'
  },
  {
    id: 'trip-2',
    title: 'North Wales Coastal Health & Safety Tour',
    destination: 'Llandudno & Conwy, North Wales',
    dates: '21–23 October 2026',
    durationDays: 3,
    purpose: 'Site assessments across coastal hospitality venues and leisure facilities.',
    transportMode: 'Driving',
    hotelDetails: 'Seaside hotel in Llandudno',
    stopsAlongWay: ['Chester bypass', 'Conwy Castle viewpoint (scenic break)', 'Great Orme scenic drive'],
    filmingAuthorisedAtSite: 'Restricted',
    permittedFilmingNotes: 'Authorised in front-of-house hotel corridors and reception areas with manager consent.',
    observations: 'Incredible autumn landscape. Perfect opportunity for conversational road-trip commentary on work-life balance.',
    cameraGear: 'Phone + Wireless lavalier mic + compact suction mount for windscreen.',
    status: 'planning',
    linkedProjectId: 'proj-2',
    createdAt: '2026-10-07T11:00:00Z'
  }
];

const defaultIdeas: VideoIdea[] = [
  {
    id: 'idea-1',
    title: 'Why Most Fire Doors I Inspect Are Actually Non-Compliant',
    titleVariations: {
      curiosity: 'The Small Detail in Every Building That Will Shock You',
      authentic: 'What 10 Years as a Safety Assessor Has Taught Me About Fire Doors',
      search: 'Fire Door Compliance UK: Common Mistakes Landlords & Managers Make',
      story: 'The £50,000 Mistake I Kept Spotting Across UK Leisure Centres',
      straightforward: 'Fire Doors Explained: Regulations, Gaps & Real Life Checks'
    },
    hook: "Every week I walk through hundreds of fire doors in gyms, hotels, and offices. 80% of them have one common flaw that invalidates their protection.",
    whyItMatters: "Educates landlords, gym owners, and curious viewers without boring technical jargon. Combines real authority with genuine relatable vlog storytelling.",
    targetAudience: "Property owners, facility managers, curious adults, UK road-trip fans.",
    suggestedOpening: "Holding up a 3mm coin gap gauge against a door frame in a hotel corridor: 'If this slips through here, this door is useless in a real fire.'",
    thumbnailConcept: "Charlie pointing at a fire door gap with high-contrast text: 'FAILS 80% OF THE TIME' and subtle warning indicator.",
    suggestedStructure: [
      'Hook with coin test in hotel',
      'Driving commentary on why compliance matters',
      '3 real examples seen this week (authorised footage)',
      'The law vs reality (Regulatory Reform Order 2005)',
      'Closing takeaway over an evening coffee'
    ],
    filmingOpportunities: ['Hotel corridor door check', 'Car commentary on the M6', 'Local gym entrance'],
    estimatedEffort: 'Medium',
    category: 'Fire Safety / Survey',
    rating: 5,
    status: 'shortlisted',
    createdAt: '2026-10-09T09:00:00Z'
  },
  {
    id: 'idea-2',
    title: '48 Hours Living Out of My Car & Budget Hotels: Is It Worth It?',
    titleVariations: {
      curiosity: 'The Reality of UK Traveling Work Nobody Talks About',
      authentic: 'My 500-Mile Working Week: The Honest Truth of Solo Travel',
      search: 'UK Work Travel Vlog: Hotel Living, Fitness Routine & Driving Tips',
      story: 'Driving 500 Miles in 48 Hours: What My Typical Work Week Looks Like',
      straightforward: 'A Week in the Life of a Traveling UK Health & Safety Assessor'
    },
    hook: "5am alarm. 200 miles on the motorway. A Premier Inn room key. This is what work travel in the UK really feels like behind the scenes.",
    whyItMatters: "Extremely relatable to millions of traveling professionals, contractors, and road-trippers across Britain and Ireland.",
    targetAudience: "UK professionals, road trippers, van life and hotel life enthusiasts.",
    suggestedOpening: "Packing the overnight bag at 5:15am, boiling the kettle, checking Google Maps traffic alert.",
    thumbnailConcept: "Split frame: Left side rainy motorway windscreen, Right side hotel room desk with laptop and safety clipboard.",
    suggestedStructure: [
      '5am packing routine and road essentials',
      'The drive & motorway service station realities',
      'First site walkthrough & customer interactions',
      'Hotel room check-in & staying sane',
      'Finding a gym at 8pm & road trip reflections'
    ],
    filmingOpportunities: ['Car dashcam', 'Service station break', 'Hotel room setup', 'Gym workout'],
    estimatedEffort: 'Low',
    category: 'Work Travel',
    rating: 4,
    status: 'shortlisted',
    createdAt: '2026-10-08T15:00:00Z'
  }
];

const defaultScripts: ScriptRecord[] = [
  {
    id: 'script-1',
    projectId: 'proj-1',
    title: 'The Reality of a 5-Storey Leisure Centre Fire Survey',
    workingTitle: 'Manchester Leisure Centre Vlog Script',
    targetRuntime: '12–15 minutes',
    openingHook: "Right now it is twenty past six on a rather damp Tuesday morning. I'm packing up the car because today we have a 180-mile drive up to Manchester for a full fire safety audit of a multi-storey leisure facility.",
    intro: "Welcome back to the channel. If you're new here, my name is Charlie Hughes. I travel all over the UK and Ireland for work — assessing buildings, inspecting fire safety, testing gyms, and sharing the real life that happens between the motorway services and hotel rooms.",
    sections: [
      {
        title: 'Section 1: The Motorway Journey & Road Coffee',
        bullets: [
          'Brief the day: 2 leisure centres, high footfall, public safety critical',
          'M6 road condition and early morning traffic check',
          'Why travelling for work is both a blessing and exhausting'
        ],
        spokenText: "We are currently just north of Birmingham on the M6. The rain is holding off for now. Today's job is interesting because leisure facilities have unique challenges: wet areas, high-voltage plant rooms, hundreds of people in unfamiliar layouts, and fire exits that cannot simply be locked up.",
        bRollNotes: 'Dashcam footage of misty motorway, coffee cup on dashboard mount, navigation map'
      },
      {
        title: 'Section 2: Arriving at the Facility (Authorised Footage)',
        bullets: [
          'Signing in with building manager',
          'Explain what we are authorised to film (public concourse, exterior escape routes)',
          'The first thing an assessor checks when walking through the doors'
        ],
        spokenText: "We have arrived. As always on this channel, professional confidentiality comes first. Filming is strictly limited to the areas authorised by the client, with zero private client documents or access codes on camera. But let's talk about what I look for first: escape signage visibility from the pool viewing deck.",
        bRollNotes: 'Exterior building shot, sign-in clipboard, wide shot of exit signage'
      },
      {
        title: 'Section 3: Hotel Life & Evening Routine',
        bullets: [
          'Checking into Premier Inn Salford Quays',
          'How I unpack to keep the room organised',
          'Getting an evening workout in to reset the mind after 4 hours driving'
        ],
        spokenText: "It is now 7:30pm. Site surveys are wrapped for the day, and report write-ups are done. Time to hit the local gym nearby. When you spend hours in the car, moving your body isn't optional — it keeps you grounded.",
        bRollNotes: 'Room key swipe, gym dumbbell rack, night lights across Salford Quays'
      }
    ],
    callToAction: "If you enjoy honest, behind-the-scenes vlogs combining UK travel, real working life, and practical safety discoveries, hit subscribe. We drop a brand new video every single Sunday.",
    closingReflection: "Work hard, stay curious about the places you visit, and take care of yourselves out there. See you in the next one.",
    bulletTalkingPrompts: [
      '6:20am start: set the scene and weather',
      'Explain the purpose of the Manchester trip',
      'Address safety & confidentiality up front',
      'Key insight: fire doors in high-footfall sports facilities',
      'Check-in at Salford Quays & evening fitness routine',
      'Sunday weekly upload reminder'
    ],
    fullSpokenScript: "Right now it is twenty past six on a rather damp Tuesday morning. I'm packing up the car because today we have a 180-mile drive up to Manchester for a full fire safety audit of a multi-storey leisure facility. Welcome back to the channel. My name is Charlie Hughes. On this channel we explore Work, Travel, and Real Life — documenting what it actually takes to travel across the UK, inspect complex sites, and live out of a suitcase while staying healthy...",
    factualVerificationNotes: [
      'Regulatory Reform (Fire Safety) Order 2005 applies to commercial premises in England and Wales.',
      'Fire Safety Act 2021 clarified structure and external walls responsibilities.',
      'Fire door gap tolerances are generally 3mm to 4mm (BS 8214:2016).'
    ],
    complianceSafetyNotes: [
      'Never show client proprietary site security schematics or alarm codes.',
      'Ensure member privacy is respected in leisure concourse footage.',
      'State clearly that professional observations in vlogs do not constitute formal client audits.'
    ],
    createdAt: '2026-10-04T12:00:00Z',
    updatedAt: '2026-10-10T11:00:00Z'
  }
];

const defaultResearch: NewsResearchItem[] = [
  {
    id: 'res-1',
    headline: 'UK Fire Safety (England) Regulations 2022: Ongoing Enforcement Insights',
    factualSummary: 'Responsible persons for high-rise and multi-occupied commercial and residential buildings must share building plans, check fire doors quarterly, and inspect lifts monthly.',
    publicationDate: '2026-09-15',
    location: 'United Kingdom',
    whyGoodVideo: 'Practical, myth-busting breakdown showing what landlords get right vs what they overlook on real site audits.',
    suggestedAngle: 'Conversational explanation comparing regulatory requirements with practical on-site realities.',
    sourceName: 'GOV.UK / Home Office',
    sourceUrl: 'https://www.gov.uk/government/publications/fire-safety-england-regulations-2022',
    reliabilityLevel: 'Official UK Govt / HSE / Fire Authority',
    verificationRequired: false,
    category: 'Fire & Workplace Safety',
    savedAsIdea: true,
    createdAt: '2026-10-05T10:00:00Z'
  },
  {
    id: 'res-2',
    headline: 'UK Motorway Service Areas Ranked: Best and Worst Rest Stops for Drivers',
    factualSummary: 'Annual survey of motorway service areas evaluating EV charging, food options, cleanliness, and quiet work spaces for long-distance drivers across the M6, M1, and M4.',
    publicationDate: '2026-10-01',
    location: 'England & Wales',
    whyGoodVideo: 'Directly relates to Charlie’s weekly road trips. Great topic for driving commentary while stopping at Tebay or Gloucester services.',
    suggestedAngle: 'The honest assessment of where UK travelling professionals actually like to stop.',
    sourceName: 'Transport Focus UK',
    sourceUrl: 'https://www.transportfocus.org.uk',
    reliabilityLevel: 'Reputable National News',
    verificationRequired: false,
    category: 'Travel & Roads',
    savedAsIdea: false,
    createdAt: '2026-10-06T14:30:00Z'
  }
];

const defaultCalendar: CalendarItem[] = [
  {
    id: 'cal-1',
    title: 'Manchester Leisure Centre - Filming (Day 1)',
    date: '2026-10-14',
    type: 'filming',
    projectId: 'proj-1',
    tripId: 'trip-1',
    completed: false
  },
  {
    id: 'cal-2',
    title: 'Manchester Leisure Centre - Filming (Day 2)',
    date: '2026-10-15',
    type: 'filming',
    projectId: 'proj-1',
    tripId: 'trip-1',
    completed: false
  },
  {
    id: 'cal-3',
    title: 'Edit & Polish Manchester Vlog',
    date: '2026-10-17',
    type: 'editing',
    projectId: 'proj-1',
    completed: false
  },
  {
    id: 'cal-4',
    title: 'Publish: Manchester Leisure Vlog (Sunday 18:00)',
    date: '2026-10-18',
    type: 'publishing',
    projectId: 'proj-1',
    completed: false
  },
  {
    id: 'cal-5',
    title: 'North Wales Coastal Trip Travel & Filming',
    date: '2026-10-21',
    type: 'travel',
    tripId: 'trip-2',
    completed: false
  }
];

const defaultSponsorships: SponsorshipDeal[] = [
  {
    id: 'spon-1',
    brandName: 'TravellerFit UK',
    contactName: 'Sarah Jenkins',
    contactEmail: 'partnerships@travellerfit.co.uk',
    website: 'https://travellerfit.co.uk',
    opportunityDescription: 'Portable resistance bands and gym travel kit integration in hotel workout vlog segment.',
    proposedFeeGbp: 350,
    actualReceivedGbp: 0,
    expectedDeliverables: '60-second integrated mid-roll segment + link in description + pinned comment',
    relevantVideoTitle: 'Staying Fit While Living in Premier Inns',
    dateContacted: '2026-10-04',
    followUpDate: '2026-10-16',
    status: 'negotiating',
    asaComplianceReminder: 'UK ASA / CAP Code requires clear upfront #AD or [Paid Partnership] disclosure at the beginning of video and in video description.',
    outreachNotes: 'Positive initial response. Sent channel media kit with UK demographics.',
    createdAt: '2026-10-04T16:00:00Z'
  }
];

const defaultAds: GoogleAdsPromotion[] = [
  {
    id: 'ad-1',
    campaignName: 'Charlie Hughes - North Wales Vlog Discovery',
    promotedVideoId: 'video-pending-01',
    promotedVideoTitle: 'North Wales Road Trip: Surviving Hotel Living & Scenic Travel',
    campaignObjective: 'Video Views (CPV)',
    targetLocations: ['United Kingdom', 'Ireland'],
    languages: ['English'],
    totalBudgetGbp: 50,
    dailyBudgetGbp: 10,
    startDate: '2026-10-26',
    endDate: '2026-10-31',
    biddingStrategy: 'Maximum CPV',
    maxCpvGbp: 0.03,
    status: 'draft',
    isLiveInGoogleAds: false,
    actualSpendGbp: 0,
    impressions: 0,
    paidViews: 0,
    clicks: 0,
    avgCpvGbp: 0,
    userExplicitlyConfirmed: false,
    createdAt: '2026-10-10T12:00:00Z'
  }
];

const defaultAuditLogs: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-11T05:59:00Z',
    action: 'SYSTEM_BOOT',
    details: 'Charlie Creator Hub initialized. Persistent storage loaded for @charliehughe5.'
  }
];

class DatabaseEngine {
  private data: HubDatabase;

  constructor() {
    this.ensureDirectory();
    this.data = this.load();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): HubDatabase {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all collections exist
        return {
          channel: parsed.channel || defaultChannel,
          credentials: parsed.credentials || {},
          projects: parsed.projects || defaultProjects,
          ideas: parsed.ideas || defaultIdeas,
          trips: parsed.trips || defaultTrips,
          scripts: parsed.scripts || defaultScripts,
          research: parsed.research || defaultResearch,
          calendar: parsed.calendar || defaultCalendar,
          sponsorships: parsed.sponsorships || defaultSponsorships,
          adsCampaigns: parsed.adsCampaigns || defaultAds,
          introOutros: parsed.introOutros || [],
          thumbnails: parsed.thumbnails || [],
          auditLogs: parsed.auditLogs || defaultAuditLogs,
        };
      }
    } catch (err) {
      console.error('Error loading database file, falling back to defaults:', err);
    }

    const initial: HubDatabase = {
      channel: defaultChannel,
      credentials: {},
      projects: defaultProjects,
      ideas: defaultIdeas,
      trips: defaultTrips,
      scripts: defaultScripts,
      research: defaultResearch,
      calendar: defaultCalendar,
      sponsorships: defaultSponsorships,
      adsCampaigns: defaultAds,
      introOutros: [],
      thumbnails: [],
      auditLogs: defaultAuditLogs,
    };
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(dataToSave: HubDatabase) {
    try {
      this.ensureDirectory();
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public getDatabase(): HubDatabase {
    return this.data;
  }

  public save() {
    this.saveDirect(this.data);
  }

  public logAudit(action: string, details: string) {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
    };
    this.data.auditLogs.unshift(entry);
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 200);
    }
    this.save();
  }
}

export const db = new DatabaseEngine();
