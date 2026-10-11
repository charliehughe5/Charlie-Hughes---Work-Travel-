import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  Plus,
  Star,
  Check,
  X,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { VideoIdea, HubDatabase } from '../types/hub';
import { api } from '../api/client';

interface IdeasViewProps {
  database: HubDatabase;
  onRefresh: () => void;
  onConvertToProject?: (idea: VideoIdea) => void;
}

export const IdeasView: React.FC<IdeasViewProps> = ({
  database,
  onRefresh,
  onConvertToProject,
}) => {
  const [topicPrompt, setTopicPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Work Travel');
  const [generating, setGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<VideoIdea[]>([]);
  const [activeTab, setActiveTab] = useState<'inbox' | 'shortlisted' | 'rejected'>('inbox');
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null);

  const categories = [
    'Work Travel',
    'Fire Safety / Survey',
    'Hotel & Stays',
    'Gym & Fitness',
    'Current News',
    'General Life',
    'Lessons Learned',
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setGenerating(true);
    try {
      const ideas = await api.generateIdeas({
        topicOrContext: topicPrompt.trim(),
        category: selectedCategory,
      });

      // Save newly generated ideas into DB inbox
      for (const item of ideas) {
        await api.createItem('ideas', {
          ...item,
          status: 'inbox',
          rating: 4,
        });
      }
      onRefresh();
      setTopicPrompt('');
    } catch (err: any) {
      alert(`AI Idea generation error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: VideoIdea['status'], reason?: string) => {
    try {
      await api.updateItem('ideas', id, { status, rejectionReason: reason });
      onRefresh();
    } catch (err: any) {
      alert(`Update error: ${err.message}`);
    }
  };

  const handleSetRating = async (id: string, rating: number) => {
    try {
      await api.updateItem('ideas', id, { rating });
      onRefresh();
    } catch (err: any) {
      alert(`Rating error: ${err.message}`);
    }
  };

  const displayedIdeas = database.ideas.filter((i) => {
    if (activeTab === 'inbox') return i.status === 'inbox';
    if (activeTab === 'shortlisted') return i.status === 'shortlisted';
    if (activeTab === 'rejected') return i.status === 'rejected';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Ideas & Trends Generator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-assisted YouTube ideation grounded in Charlie Hughes' real-life UK travel, professional surveys, and fitness.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            Shortlisted: <strong className="text-slate-900 font-mono">{database.ideas.filter(i => i.status === 'shortlisted').length}</strong>
          </span>
        </div>
      </div>

      {/* Generator Prompt Box */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4">
        <form onSubmit={handleGenerate} className="space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={topicPrompt}
                onChange={(e) => setTopicPrompt(e.target.value)}
                placeholder="Enter context, e.g. Driving to Birmingham for a leisure audit, stayed at Premier Inn, rain on motorway..."
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={generating}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Brainstorming...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate 3 Concepts</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          <span>AI outputs 5 distinct title angles (Curiosity, Authentic, Search, Story, Straightforward) with filming opportunities and zero-clickbait discipline.</span>
        </div>
      </div>

      {/* Idea Status Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'inbox' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Ideas Inbox ({database.ideas.filter((i) => i.status === 'inbox').length})
          </button>
          <button
            onClick={() => setActiveTab('shortlisted')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'shortlisted' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Shortlisted ({database.ideas.filter((i) => i.status === 'shortlisted').length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'rejected' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Rejected ({database.ideas.filter((i) => i.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Ideas Card List */}
      <div className="space-y-4">
        {displayedIdeas.map((idea) => {
          const isExpanded = expandedIdeaId === idea.id;
          return (
            <div
              key={idea.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-red-600">{idea.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>Effort: <strong>{idea.estimatedEffort}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{idea.createdAt?.split('T')[0]}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {idea.title}
                  </h3>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    <strong>The Hook:</strong> {idea.hook}
                  </p>
                </div>

                {/* Rating & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleSetRating(idea.id, star)}
                        className={`p-0.5 ${star <= (idea.rating || 0) ? 'text-amber-500' : 'text-slate-300'}`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                    ))}
                  </div>

                  {idea.status !== 'shortlisted' && (
                    <button
                      onClick={() => handleUpdateStatus(idea.id, 'shortlisted')}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200/80 transition-colors"
                      title="Shortlist this idea"
                    >
                      Shortlist
                    </button>
                  )}

                  {idea.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(idea.id, 'rejected')}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                      title="Reject idea (remembers not to repeat)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title Variations Grid */}
              {idea.titleVariations && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1.5 text-[11px]">
                  <div className="font-bold text-slate-700 mb-1">5 Verified Packaging Angles:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-800">Curiosity: </span>
                      "{idea.titleVariations.curiosity}"
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">Authentic: </span>
                      "{idea.titleVariations.authentic}"
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">Search (SEO): </span>
                      "{idea.titleVariations.search}"
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">Story: </span>
                      "{idea.titleVariations.story}"
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-semibold text-slate-800">Straightforward: </span>
                      "{idea.titleVariations.straightforward}"
                    </div>
                  </div>
                </div>
              )}

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="pt-3 border-t border-slate-100 space-y-3 text-xs animate-in fade-in duration-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold text-slate-800 block mb-1">Suggested Opening 15s:</span>
                      <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/50">
                        {idea.suggestedOpening}
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-800 block mb-1">Thumbnail Concept:</span>
                      <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/50">
                        {idea.thumbnailConcept}
                      </p>
                    </div>
                  </div>

                  {idea.suggestedStructure && (
                    <div>
                      <span className="font-semibold text-slate-800 block mb-1">Video Flow & Scenes:</span>
                      <ul className="list-disc pl-5 space-y-1 text-slate-600">
                        {idea.suggestedStructure.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {idea.filmingOpportunities && (
                    <div>
                      <span className="font-semibold text-slate-800 block mb-1">Filming Opportunities:</span>
                      <div className="flex flex-wrap gap-2">
                        {idea.filmingOpportunities.map((f, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Toggle */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <button
                  onClick={() => setExpandedIdeaId(isExpanded ? null : idea.id)}
                  className="flex items-center gap-1 font-medium text-slate-700 hover:text-slate-900"
                >
                  <span>{isExpanded ? 'Hide Details' : 'View Full Story Structure'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}

        {displayedIdeas.length === 0 && (
          <div className="py-12 text-center bg-white border border-slate-200 rounded-xl">
            <Lightbulb className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800">No ideas in {activeTab}</h4>
            <p className="text-xs text-slate-500 mt-1">
              Use the prompt box above to generate 3 concepts tailored to your working week.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
