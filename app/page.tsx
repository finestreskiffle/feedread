'use client';

import { useState, useEffect } from 'react';
import { Feed, Article } from '@/lib/types';
import { storage } from '@/lib/storage';
import Sidebar from '@/components/Sidebar';
import ArticleList from '@/components/ArticleList';
import AddFeedModal from '@/components/AddFeedModal';
import { RefreshCw, Settings } from 'lucide-react';

export default function Home() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState(storage.getCategories());
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'all' | 'favorites' | 'unread'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load data on mount
  useEffect(() => {
    setFeeds(storage.getFeeds());
    setArticles(storage.getArticles());
  }, []);

  // Calculate unread counts
  const unreadCounts = feeds.reduce((acc, feed) => {
    acc[feed.id] = articles.filter((a) => a.feedId === feed.id && !a.isRead).length;
    return acc;
  }, {} as Record<string, number>);

  // Filter articles based on selection
  const filteredArticles = articles
    .filter((article) => {
      if (selectedFeed && article.feedId !== selectedFeed) return false;
      if (selectedView === 'favorites' && !article.isFavorite) return false;
      if (selectedView === 'unread' && article.isRead) return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return dateB - dateA;
    });

  const fetchFeed = async (feed: Feed) => {
    try {
      const response = await fetch('/api/fetch-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: feed.url }),
      });

      if (!response.ok) {
        throw new Error('Errore nel caricamento del feed');
      }

      const data = await response.json();

      const newArticles: Article[] = data.items.map((item: any) => ({
        id: `${feed.id}-${item.guid || item.link}`,
        feedId: feed.id,
        title: item.title,
        link: item.link,
        content: item.content,
        contentSnippet: item.contentSnippet,
        author: item.author,
        pubDate: item.pubDate ? new Date(item.pubDate) : undefined,
        isRead: false,
        isFavorite: false,
      }));

      storage.addArticles(newArticles);
      setArticles(storage.getArticles());

      storage.updateFeed(feed.id, { lastFetched: new Date() });
      setFeeds(storage.getFeeds());
    } catch (error) {
      console.error('Error fetching feed:', error);
      throw error;
    }
  };

  const handleAddFeed = async (url: string, category: string) => {
    const newFeed: Feed = {
      id: Date.now().toString(),
      title: 'Caricamento...',
      url,
      category,
    };

    storage.addFeed(newFeed);
    setFeeds(storage.getFeeds());

    try {
      const response = await fetch('/api/fetch-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Feed non valido');
      }

      const data = await response.json();

      // Update feed with actual title
      storage.updateFeed(newFeed.id, {
        title: data.title,
        lastFetched: new Date(),
      });
      setFeeds(storage.getFeeds());

      // Add articles
      const newArticles: Article[] = data.items.map((item: any) => ({
        id: `${newFeed.id}-${item.guid || item.link}`,
        feedId: newFeed.id,
        title: item.title,
        link: item.link,
        content: item.content,
        contentSnippet: item.contentSnippet,
        author: item.author,
        pubDate: item.pubDate ? new Date(item.pubDate) : undefined,
        isRead: false,
        isFavorite: false,
      }));

      storage.addArticles(newArticles);
      setArticles(storage.getArticles());
    } catch (error) {
      storage.deleteFeed(newFeed.id);
      setFeeds(storage.getFeeds());
      throw error;
    }
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      for (const feed of feeds) {
        await fetchFeed(feed);
      }
    } catch (error) {
      console.error('Error refreshing feeds:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleRead = (articleId: string) => {
    storage.toggleRead(articleId);
    setArticles(storage.getArticles());
  };

  const handleToggleFavorite = (articleId: string) => {
    storage.toggleFavorite(articleId);
    setArticles(storage.getArticles());
  };

  const handleOpenArticle = (article: Article) => {
    if (!article.isRead) {
      handleToggleRead(article.id);
    }
    window.open(article.link, '_blank');
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        feeds={feeds}
        categories={categories}
        selectedFeed={selectedFeed}
        selectedView={selectedView}
        onSelectFeed={setSelectedFeed}
        onSelectView={setSelectedView}
        onAddFeed={() => setIsAddModalOpen(true)}
        unreadCounts={unreadCounts}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedFeed
                  ? feeds.find((f) => f.id === selectedFeed)?.title
                  : selectedView === 'favorites'
                  ? 'Preferiti'
                  : selectedView === 'unread'
                  ? 'Non letti'
                  : 'Tutti gli articoli'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredArticles.length} articol{filteredArticles.length === 1 ? 'o' : 'i'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefreshAll}
                disabled={isRefreshing || feeds.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Aggiorna tutti</span>
              </button>
            </div>
          </div>
        </div>

        {/* Article List */}
        <ArticleList
          articles={filteredArticles}
          feeds={feeds}
          onToggleRead={handleToggleRead}
          onToggleFavorite={handleToggleFavorite}
          onOpenArticle={handleOpenArticle}
        />
      </div>

      <AddFeedModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddFeed}
        categories={categories}
      />
    </div>
  );
}
