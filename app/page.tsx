'use client';

import { useState, useEffect } from 'react';
import { Feed, Article } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import ArticleList from '@/components/ArticleList';
import AddFeedModal from '@/components/AddFeedModal';
import { RefreshCw } from 'lucide-react';

export default function Home() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'all' | 'favorites' | 'unread'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [feedsRes, articlesRes, categoriesRes, countsRes] = await Promise.all([
        fetch('/api/feeds'),
        fetch('/api/articles'),
        fetch('/api/categories'),
        fetch('/api/unread-counts'),
      ]);

      const feedsData = await feedsRes.json();
      const articlesData = await articlesRes.json();
      const categoriesData = await categoriesRes.json();
      const countsData = await countsRes.json();

      setFeeds(feedsData);
      setArticles(articlesData);
      setCategories(categoriesData);
      setUnreadCounts(countsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUnreadCounts = async () => {
    try {
      const res = await fetch('/api/unread-counts');
      const counts = await res.json();
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error refreshing unread counts:', error);
    }
  };

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

      const newArticles = data.items.map((item: any) => ({
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

      await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles: newArticles }),
      });

      await fetch('/api/feeds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: feed.id, lastFetched: new Date() }),
      });

      await loadData();
    } catch (error) {
      console.error('Error fetching feed:', error);
      throw error;
    }
  };

  const handleAddFeed = async (url: string, category: string) => {
    const tempFeed = {
      title: 'Caricamento...',
      url,
      category,
    };

    try {
      const addRes = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempFeed),
      });

      if (!addRes.ok) throw new Error('Failed to add feed');
      const newFeed = await addRes.json();

      const response = await fetch('/api/fetch-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        await fetch(`/api/feeds?id=${newFeed.id}`, { method: 'DELETE' });
        throw new Error('Feed non valido');
      }

      const data = await response.json();

      await fetch('/api/feeds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newFeed.id,
          title: data.title,
          lastFetched: new Date(),
        }),
      });

      const newArticles = data.items.map((item: any) => ({
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

      await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles: newArticles }),
      });

      await loadData();
    } catch (error) {
      console.error('Error adding feed:', error);
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

  const handleToggleRead = async (articleId: string) => {
    const article = articles.find((a) => a.id === articleId);
    if (!article) return;

    const updatedArticles = articles.map((a) =>
      a.id === articleId ? { ...a, isRead: !a.isRead } : a
    );
    setArticles(updatedArticles);

    try {
      await fetch('/api/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: articleId, isRead: !article.isRead }),
      });
      await refreshUnreadCounts();
    } catch (error) {
      console.error('Error toggling read:', error);
      setArticles(articles);
    }
  };

  const handleToggleFavorite = async (articleId: string) => {
    const article = articles.find((a) => a.id === articleId);
    if (!article) return;

    const updatedArticles = articles.map((a) =>
      a.id === articleId ? { ...a, isFavorite: !a.isFavorite } : a
    );
    setArticles(updatedArticles);

    try {
      await fetch('/api/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: articleId, isFavorite: !article.isFavorite }),
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setArticles(articles);
    }
  };

  const handleOpenArticle = (article: Article) => {
    if (!article.isRead) {
      handleToggleRead(article.id);
    }
    window.open(article.link, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Caricamento...</p>
        </div>
      </div>
    );
  }

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
