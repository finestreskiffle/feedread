'use client';

import { Feed, Category } from '@/lib/types';
import { Rss, Plus, FolderOpen, Star, Inbox } from 'lucide-react';

interface SidebarProps {
  feeds: Feed[];
  categories: Category[];
  selectedFeed: string | null;
  selectedView: 'all' | 'favorites' | 'unread';
  onSelectFeed: (feedId: string | null) => void;
  onSelectView: (view: 'all' | 'favorites' | 'unread') => void;
  onAddFeed: () => void;
  unreadCounts: Record<string, number>;
}

export default function Sidebar({
  feeds,
  categories,
  selectedFeed,
  selectedView,
  onSelectFeed,
  onSelectView,
  onAddFeed,
  unreadCounts,
}: SidebarProps) {
  const groupedFeeds = categories.map((category) => ({
    ...category,
    feeds: feeds.filter((f) => f.category === category.name),
  }));

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 h-screen overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Rss className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">My RSS Reader</h1>
        </div>
        
        <button
          onClick={onAddFeed}
          className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Aggiungi Feed</span>
        </button>
      </div>

      {/* Views */}
      <div className="p-2 border-b border-gray-200 dark:border-slate-700">
        <button
          onClick={() => {
            onSelectFeed(null);
            onSelectView('all');
          }}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            selectedView === 'all' && !selectedFeed
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
              : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span className="flex-1 text-left">Tutti gli articoli</span>
          {totalUnread > 0 && (
            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
              {totalUnread}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            onSelectFeed(null);
            onSelectView('unread');
          }}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            selectedView === 'unread' && !selectedFeed
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
              : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span className="flex-1 text-left">Non letti</span>
          {totalUnread > 0 && (
            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
              {totalUnread}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            onSelectFeed(null);
            onSelectView('favorites');
          }}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            selectedView === 'favorites' && !selectedFeed
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
              : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Star className="w-4 h-4" />
          <span className="flex-1 text-left">Preferiti</span>
        </button>
      </div>

      {/* Feeds by Category */}
      <div className="flex-1 overflow-y-auto p-2">
        {groupedFeeds.map((group) => (
          group.feeds.length > 0 && (
            <div key={group.id} className="mb-4">
              <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <span>{group.name}</span>
              </div>
              {group.feeds.map((feed) => (
                <button
                  key={feed.id}
                  onClick={() => {
                    onSelectFeed(feed.id);
                    onSelectView('all');
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedFeed === feed.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Rss className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left truncate">{feed.title}</span>
                  {unreadCounts[feed.id] > 0 && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      {unreadCounts[feed.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )
        ))}
      </div>
    </div>
  );
}
