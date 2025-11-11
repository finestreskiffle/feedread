'use client';

import { Article, Feed } from '@/lib/types';
import { Star, ExternalLink, Clock, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface ArticleListProps {
  articles: Article[];
  feeds: Feed[];
  onToggleRead: (articleId: string) => void;
  onToggleFavorite: (articleId: string) => void;
  onOpenArticle: (article: Article) => void;
}

export default function ArticleList({
  articles,
  feeds,
  onToggleRead,
  onToggleFavorite,
  onOpenArticle,
}: ArticleListProps) {
  const getFeedTitle = (feedId: string) => {
    return feeds.find((f) => f.id === feedId)?.title || 'Unknown Feed';
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: it });
    } catch {
      return '';
    }
  };

  if (articles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-xl mb-2">Nessun articolo da mostrare</p>
          <p className="text-sm">Aggiungi un feed RSS per iniziare</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        {articles.map((article) => (
          <div
            key={article.id}
            className={`bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 transition-all hover:shadow-md ${
              article.isRead ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span className="font-medium">{getFeedTitle(article.feedId)}</span>
                  {article.pubDate && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(article.pubDate)}
                      </span>
                    </>
                  )}
                  {article.author && (
                    <>
                      <span>•</span>
                      <span>{article.author}</span>
                    </>
                  )}
                </div>

                <h3
                  className="text-lg font-semibold text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => onOpenArticle(article)}
                >
                  {article.title}
                </h3>

                {article.contentSnippet && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                    {article.contentSnippet}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleRead(article.id)}
                    className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full transition-colors ${
                      article.isRead
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>{article.isRead ? 'Letto' : 'Segna come letto'}</span>
                  </button>

                  <button
                    onClick={() => onToggleFavorite(article.id)}
                    className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full transition-colors ${
                      article.isFavorite
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <Star className={`w-3 h-3 ${article.isFavorite ? 'fill-current' : ''}`} />
                    <span>Preferito</span>
                  </button>

                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!article.isRead) {
                        onToggleRead(article.id);
                      }
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Apri</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
