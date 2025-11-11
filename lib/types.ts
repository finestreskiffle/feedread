export interface Feed {
  id: string;
  title: string;
  url: string;
  category: string;
  lastFetched?: Date;
}

export interface Article {
  id: string;
  feedId: string;
  title: string;
  link: string;
  content?: string;
  contentSnippet?: string;
  author?: string;
  pubDate?: Date;
  isRead: boolean;
  isFavorite: boolean;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
}
