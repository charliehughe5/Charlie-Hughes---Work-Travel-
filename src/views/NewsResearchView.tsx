import React, { useState } from 'react';
import {
  Newspaper,
  ExternalLink,
  Search,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  FileText,
  Calendar,
  Sparkles,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { NewsResearchItem, HubDatabase } from '../types/hub';
import { api } from '../api/client';

interface NewsResearchViewProps {
  database: HubDatabase;
  onRefresh: () => void;
  onNavigateToScripts?: (headline: string) => void;
}

export const NewsResearchView: React.FC<NewsResearchViewProps> = ({
  database,
  onRefresh,
  onNavigateToScripts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('UK Work & Travel');
  const [searching, setSearching] = useState(false);

  const categories = [
    'UK Work & Travel',
    'Fire & Workplace Safety',
    'Leisure & Gyms',
    'Travel & Roads',
    'Quirky Discoveries',
  ];

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearching(true);
    try {
      const items = await api.researchTopic({
        query: searchQuery.trim(),
        category: selectedCategory,
      });

      for (const item of items) {
        await api.createItem('research', {
          ...item,
          savedAsIdea: false,
        });
      }
      onRefresh();
      setSearchQuery('');
    } catch (err: any) {
      alert(`Research query error: ${err.message}`);
    } finally {
      setSearching(false);
    }
  };

  const handleSaveAsIdea = async (item: NewsResearchItem) => {
    try {
      await api.createItem('ideas', {
        title: item.headline,
        titleVariations: {
          curiosity: `What Nobody Realises About ${item.headline}`,
          authentic: `My Thoughts on ${item.headline}`,
          search: `${item.headline} Explained: UK Rules & Facts`,
          story: `The Story Behind ${item.headline}`,
          straightforward: `${item.headline}`,
        },
        hook: item.factualSummary,
        whyItMatters: item.whyGoodVideo,
        targetAudience: 'UK adults & professionals',
        suggestedOpening: `Opening with the news article headline on tablet screen...`,
        thumbnailConcept: `Headline text in bold white on black box with warning icon`,
        suggestedStructure: [
          'The news or discovery',
          'Why this matters to everyday people',
          'Professional vs public perspective',
          'Final takeaways',
        ],
        filmingOpportunities: ['Car discussion', 'Hotel review desk'],
        estimatedEffort: 'Low',
        category: 'Current News',
        rating: 4,
        status: 'shortlisted',
      });

      await api.updateItem('research', item.id, { savedAsIdea: true });
      alert('Saved to Ideas & Trends shortlist!');
      onRefresh();
    } catch (err: any) {
      alert(`Error saving idea: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            News, Local Discovery & Facts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verifiable UK stories, statutory developments, and road trip discoveries from official and reputable sources.
          </p>
        </div>
      </div>

      {/* Query Bar */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topic or location (e.g. HSE fire safety updates, M6 road works, leisure facility trends)..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 pl-9 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 disabled:opacity-50"
            >
              {searching ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching Reputable Sources...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  <span>Research Topic</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-[11px] text-slate-500 flex items-center gap-2">
          <span>Priority sources: GOV.UK, HSE UK, National Fire Chiefs Council, Transport Focus, and official UK legislation.</span>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {database.research.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                  <span className="font-semibold text-slate-900">{item.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{item.publicationDate}</span>
                  {item.location && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{item.location}</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {item.reliabilityLevel}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {item.headline}
                </h3>

                <p className="text-slate-600 mt-2 leading-relaxed">
                  <strong>Factual Summary:</strong> {item.factualSummary}
                </p>

                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200/60 text-slate-600 space-y-1">
                  <div>
                    <strong className="text-slate-800">Why It Makes a Good Vlog:</strong> {item.whyGoodVideo}
                  </div>
                  <div>
                    <strong className="text-slate-800">Suggested Creator Angle:</strong> {item.suggestedAngle}
                  </div>
                </div>
              </div>

              {/* Source & Actions */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors font-medium"
                >
                  <span>Source: {item.sourceName}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleSaveAsIdea(item)}
                    disabled={item.savedAsIdea}
                    className="px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-40 transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{item.savedAsIdea ? 'Saved in Ideas' : 'Save as Idea'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {database.research.length === 0 && (
          <div className="py-12 text-center bg-white border border-slate-200 rounded-xl">
            <Newspaper className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800">No Research Items Saved</h4>
            <p className="text-xs text-slate-500 mt-1">
              Search above for UK road, travel, and statutory health & safety developments.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
