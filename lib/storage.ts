import { Feed, Article, Category } from './types';

const FEEDS_KEY = 'rss_feeds';
const ARTICLES_KEY = 'rss_articles';
const CATEGORIES_KEY = 'rss_categories';

export const storage = {
  // Feeds
  getFeeds: (): Feed[] => {
    if (typeof window === 'undefined') return [];
    const feeds = localStorage.getItem(FEEDS_KEY);
    return feeds ? JSON.parse(feeds) : [];
  },

  saveFeeds: (feeds: Feed[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(FEEDS_KEY, JSON.stringify(feeds));
  },

  addFeed: (feed: Feed) => {
    const feeds = storage.getFeeds();
    feeds.push(feed);
    storage.saveFeeds(feeds);
  },

  deleteFeed: (feedId: string) => {
    const feeds = storage.getFeeds().filter(f => f.id !== feedId);
    storage.saveFeeds(feeds);
    
    // Delete associated articles
    const articles = storage.getArticles().filter(a => a.feedId !== feedId);
    storage.saveArticles(articles);
  },

  updateFeed: (feedId: string, updates: Partial<Feed>) => {
    const feeds = storage.getFeeds().map(f => 
      f.id === feedId ? { ...f, ...updates } : f
    );
    storage.saveFeeds(feeds);
  },

  // Articles
  getArticles: (): Article[] => {
    if (typeof window === 'undefined') return [];
    const articles = localStorage.getItem(ARTICLES_KEY);
    return articles ? JSON.parse(articles) : [];
  },

  saveArticles: (articles: Article[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
  },

  addArticles: (newArticles: Article[]) => {
    const existing = storage.getArticles();
    const existingIds = new Set(existing.map(a => a.id));
    const uniqueNew = newArticles.filter(a => !existingIds.has(a.id));
    storage.saveArticles([...existing, ...uniqueNew]);
  },

  updateArticle: (articleId: string, updates: Partial<Article>) => {
    const articles = storage.getArticles().map(a => 
      a.id === articleId ? { ...a, ...updates } : a
    );
    storage.saveArticles(articles);
  },

  toggleRead: (articleId: string) => {
    const articles = storage.getArticles().map(a => 
      a.id === articleId ? { ...a, isRead: !a.isRead } : a
    );
    storage.saveArticles(articles);
  },

  toggleFavorite: (articleId: string) => {
    const articles = storage.getArticles().map(a => 
      a.id === articleId ? { ...a, isFavorite: !a.isFavorite } : a
    );
    storage.saveArticles(articles);
  },

  markAllAsRead: (feedId?: string) => {
    const articles = storage.getArticles().map(a => 
      feedId ? (a.feedId === feedId ? { ...a, isRead: true } : a) : { ...a, isRead: true }
    );
    storage.saveArticles(articles);
  },

  // Categories
  getCategories: (): Category[] => {
    if (typeof window === 'undefined') return [];
    const categories = localStorage.getItem(CATEGORIES_KEY);
    return categories ? JSON.parse(categories) : [
      { id: '1', name: 'Tecnologia', color: '#3b82f6' },
      { id: '2', name: 'News', color: '#ef4444' },
      { id: '3', name: 'Blog', color: '#10b981' },
      { id: '4', name: 'Altro', color: '#6366f1' },
    ];
  },

  saveCategories: (categories: Category[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  },

  addCategory: (category: Category) => {
    const categories = storage.getCategories();
    categories.push(category);
    storage.saveCategories(categories);
  },
};
