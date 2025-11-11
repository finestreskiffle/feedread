import { sql } from '@vercel/postgres';
import { Feed, Article, Category } from './types';

export const db = {
  // Categories
  async getCategories(): Promise<Category[]> {
    const { rows } = await sql`SELECT * FROM categories ORDER BY name`;
    return rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      color: row.color,
    }));
  },

  // Feeds
  async getFeeds(): Promise<Feed[]> {
    const { rows } = await sql`
      SELECT f.*, c.name as category_name 
      FROM feeds f
      LEFT JOIN categories c ON f.category_id = c.id
      ORDER BY f.created_at DESC
    `;
    return rows.map(row => ({
      id: row.id.toString(),
      title: row.title,
      url: row.url,
      category: row.category_name || 'Altro',
      lastFetched: row.last_fetched ? new Date(row.last_fetched) : undefined,
    }));
  },

  async addFeed(feed: Omit<Feed, 'id'>): Promise<Feed> {
    // Get category ID
    const { rows: categoryRows } = await sql`
      SELECT id FROM categories WHERE name = ${feed.category} LIMIT 1
    `;
    const categoryId = categoryRows[0]?.id || null;

    let lastFetched = null;
    if (feed.lastFetched) {
      lastFetched = typeof feed.lastFetched === 'string' 
        ? feed.lastFetched 
        : feed.lastFetched.toISOString();
    }
    
    const { rows } = await sql`
      INSERT INTO feeds (title, url, category_id, last_fetched)
      VALUES (${feed.title}, ${feed.url}, ${categoryId}, ${lastFetched})
      RETURNING *
    `;
    
    return {
      id: rows[0].id.toString(),
      title: rows[0].title,
      url: rows[0].url,
      category: feed.category,
      lastFetched: rows[0].last_fetched ? new Date(rows[0].last_fetched) : undefined,
    };
  },

  async updateFeed(feedId: string, updates: Partial<Feed>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }
    if (updates.lastFetched !== undefined) {
      fields.push(`last_fetched = $${paramCount++}`);
      let lastFetched = null;
      if (updates.lastFetched) {
        lastFetched = typeof updates.lastFetched === 'string'
          ? updates.lastFetched
          : updates.lastFetched.toISOString();
      }
      values.push(lastFetched);
    }
    if (updates.category !== undefined) {
      const { rows: categoryRows } = await sql`
        SELECT id FROM categories WHERE name = ${updates.category} LIMIT 1
      `;
      const categoryId = categoryRows[0]?.id || null;
      fields.push(`category_id = $${paramCount++}`);
      values.push(categoryId);
    }

    if (fields.length > 0) {
      values.push(feedId);
      await sql.query(
        `UPDATE feeds SET ${fields.join(', ')} WHERE id = $${paramCount}`,
        values
      );
    }
  },

  async deleteFeed(feedId: string): Promise<void> {
    await sql`DELETE FROM feeds WHERE id = ${feedId}`;
  },

  // Articles
  async getArticles(feedId?: string): Promise<Article[]> {
    const { rows } = feedId
      ? await sql`
          SELECT * FROM articles 
          WHERE feed_id = ${feedId}
          ORDER BY pub_date DESC NULLS LAST
        `
      : await sql`
          SELECT * FROM articles 
          ORDER BY pub_date DESC NULLS LAST
        `;

    return rows.map(row => ({
      id: row.id.toString(),
      feedId: row.feed_id.toString(),
      title: row.title,
      link: row.link,
      content: row.content || undefined,
      contentSnippet: row.content_snippet || undefined,
      author: row.author || undefined,
      pubDate: row.pub_date ? new Date(row.pub_date) : undefined,
      isRead: row.is_read,
      isFavorite: row.is_favorite,
    }));
  },

  async addArticles(articles: Omit<Article, 'id'>[]): Promise<void> {
    for (const article of articles) {
      try {
        let pubDate = null;
        if (article.pubDate) {
          pubDate = typeof article.pubDate === 'string'
            ? article.pubDate
            : article.pubDate.toISOString();
        }
        
        await sql`
          INSERT INTO articles (
            feed_id, title, link, content, content_snippet, 
            author, pub_date, is_read, is_favorite, guid
          )
          VALUES (
            ${article.feedId}, ${article.title}, ${article.link}, 
            ${article.content || null}, ${article.contentSnippet || null},
            ${article.author || null}, ${pubDate},
            ${article.isRead}, ${article.isFavorite},
            ${article.link}
          )
          ON CONFLICT (feed_id, guid) DO NOTHING
        `;
      } catch (error) {
        console.error('Error adding article:', error);
      }
    }
  },

  async updateArticle(articleId: string, updates: Partial<Article>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.isRead !== undefined) {
      fields.push(`is_read = $${paramCount++}`);
      values.push(updates.isRead);
    }
    if (updates.isFavorite !== undefined) {
      fields.push(`is_favorite = $${paramCount++}`);
      values.push(updates.isFavorite);
    }

    if (fields.length > 0) {
      values.push(articleId);
      await sql.query(
        `UPDATE articles SET ${fields.join(', ')} WHERE id = $${paramCount}`,
        values
      );
    }
  },

  async markAllAsRead(feedId?: string): Promise<void> {
    if (feedId) {
      await sql`UPDATE articles SET is_read = true WHERE feed_id = ${feedId}`;
    } else {
      await sql`UPDATE articles SET is_read = true`;
    }
  },

  async getUnreadCounts(): Promise<Record<string, number>> {
    const { rows } = await sql`
      SELECT feed_id, COUNT(*) as count
      FROM articles
      WHERE is_read = false
      GROUP BY feed_id
    `;
    
    const counts: Record<string, number> = {};
    rows.forEach(row => {
      counts[row.feed_id.toString()] = parseInt(row.count);
    });
    return counts;
  },
};
