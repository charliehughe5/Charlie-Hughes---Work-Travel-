/**
 * Charlie Creator Hub - Typed API Client
 */

import { HubDatabase, IntegrationDiagnostics, VideoIdea, ScriptRecord, TripFilmingPlan } from '../types/hub';

let sessionToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('cch_session_token') : null;

export function setClientToken(token: string | null) {
  sessionToken = token;
  if (token) {
    localStorage.setItem('cch_session_token', token);
  } else {
    localStorage.removeItem('cch_session_token');
  }
}

export function getClientToken() {
  return sessionToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (sessionToken) {
    headers.set('Authorization', `Bearer ${sessionToken}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const data = await response.json();
      if (data.error) errorMsg = data.error;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (pin: string) => request<{ success: boolean; token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ pin }) }),
  logout: () => request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
  updatePin: (currentPin: string, newPin: string) => request<{ success: boolean }>('/api/auth/update-pin', { method: 'POST', body: JSON.stringify({ currentPin, newPin }) }),

  // Status & Diagnostics
  getStatus: () => request<IntegrationDiagnostics>('/api/status'),

  // Database
  getDatabase: () => request<HubDatabase>('/api/data/db'),
  updateChannel: (channel: any) => request<any>('/api/data/channel', { method: 'PUT', body: JSON.stringify(channel) }),
  getCredentials: () => request<any>('/api/data/credentials'),
  updateCredentials: (credentials: any) => request<any>('/api/data/credentials', { method: 'PUT', body: JSON.stringify(credentials) }),

  createItem: <T>(collection: string, item: T) => request<T>(`/api/data/${collection}`, { method: 'POST', body: JSON.stringify(item) }),
  updateItem: <T>(collection: string, id: string, updates: Partial<T>) => request<T>(`/api/data/${collection}/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteItem: (collection: string, id: string) => request<{ success: boolean }>(`/api/data/${collection}/${id}`, { method: 'DELETE' }),

  // Gemini AI Creative Tools
  generateIdeas: (params: { topicOrContext?: string; category?: string; tripContext?: string }) =>
    request<VideoIdea[]>('/api/gemini/generate-ideas', { method: 'POST', body: JSON.stringify(params) }),

  generateScript: (params: { title: string; runtime?: string; contextNotes?: string; targetTone?: string; includeSafetyNotes?: boolean }) =>
    request<Partial<ScriptRecord>>('/api/gemini/generate-script', { method: 'POST', body: JSON.stringify(params) }),

  generateTripFilmingPlan: (params: any) =>
    request<TripFilmingPlan>('/api/gemini/trip-to-content', { method: 'POST', body: JSON.stringify(params) }),

  researchTopic: (params: { query?: string; category?: string }) =>
    request<any[]>('/api/gemini/research', { method: 'POST', body: JSON.stringify(params) }),

  askAssistant: (question: string, conversationHistory?: any[]) =>
    request<{ answer: string }>('/api/gemini/assistant', { method: 'POST', body: JSON.stringify({ question, conversationHistory }) }),

  generateVeoVideo: (prompt: string, aspectRatio: '16:9' | '9:16') =>
    request<{ operationName: string; model: string }>('/api/gemini/veo-generate', { method: 'POST', body: JSON.stringify({ prompt, aspectRatio }) }),

  pollVeoStatus: (operationName: string) =>
    request<{ done: boolean; response?: any; error?: any }>('/api/gemini/veo-status', { method: 'POST', body: JSON.stringify({ operationName }) }),

  // YouTube Channel & Analytics
  getYoutubeStatus: () => request<any>('/api/youtube/status'),
  getYoutubeChannel: () => request<any>('/api/youtube/channel'),
  getYoutubeVideos: () => request<any[]>('/api/youtube/videos'),
  getYoutubeAnalytics: (timeframe?: string) => request<any>(`/api/youtube-analytics/overview?timeframe=${timeframe || 'last_28_days'}`),
  disconnectYoutube: () => request<{ success: boolean }>('/api/youtube/disconnect', { method: 'POST' }),

  // Google Ads
  getGoogleAdsStatus: () => request<any>('/api/google-ads/status'),
  getGoogleAdsCampaigns: () => request<any[]>('/api/google-ads/campaigns'),
  createGoogleAdsCampaign: (campaign: any) => request<any>('/api/google-ads/create', { method: 'POST', body: JSON.stringify(campaign) }),
  confirmGoogleAdsCampaign: (id: string) => request<any>(`/api/google-ads/confirm/${id}`, { method: 'POST' }),

  // Backup
  exportBackupUrl: '/api/backup/export',
  importBackup: (data: HubDatabase) => request<{ success: boolean }>('/api/backup/import', { method: 'POST', body: JSON.stringify(data) }),
};
