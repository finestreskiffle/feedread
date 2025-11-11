import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: ['media:thumbnail', 'media:content'],
  },
});

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const feed = await parser.parseURL(url);

    return NextResponse.json({
      title: feed.title || 'Unknown Feed',
      items: feed.items.map((item) => ({
        title: item.title || 'No Title',
        link: item.link || '',
        content: item.content || item.contentSnippet || '',
        contentSnippet: item.contentSnippet || '',
        author: item.creator || item.author || '',
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        guid: item.guid || item.link || '',
      })),
    });
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RSS feed' },
      { status: 500 }
    );
  }
}
