import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface FetchResult {
  success: boolean;
  content?: string;
  title?: string;
  type: 'website' | 'youtube' | 'error';
  error?: string;
}

// Check if URL is YouTube
function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

// Extract YouTube video ID
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Fetch and parse website content
async function fetchWebsite(url: string): Promise<FetchResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      return { success: false, type: 'error', error: `HTTP ${response.status}` };
    }

    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
    
    // Remove scripts, styles, and other non-content
    let content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');

    // Get text content from body
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    content = bodyMatch ? bodyMatch[1] : content;

    // Remove all HTML tags and decode entities
    content = content
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    // Limit content length
    const maxLength = 8000;
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '...[content truncated]';
    }

    return {
      success: true,
      content,
      title,
      type: 'website'
    };
  } catch (error) {
    return {
      success: false,
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Fetch YouTube video info
async function fetchYouTube(url: string): Promise<FetchResult> {
  try {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) {
      return { success: false, type: 'error', error: 'Invalid YouTube URL' };
    }

    // Get oEmbed data for title
    const oembedUrl = `https://www.youtube.com/oembed?url=${url}&format=json`;
    let title = 'YouTube Video';
    
    try {
      const oembedResponse = await fetch(oembedUrl);
      if (oembedResponse.ok) {
        const oembedData = await oembedResponse.json();
        title = oembedData.title || title;
      }
    } catch {
      // Ignore oembed errors
    }

    // Try to get video description via invidious (no API key needed)
    const invidiousInstances = [
      'https://invidious.snopyta.org',
      'https://yewtu.be',
      'https://invidious.kavin.rocks'
    ];
    
    let videoInfo = '';
    
    for (const instance of invidiousInstances) {
      try {
        const apiUrl = `${instance}/api/v1/videos/${videoId}`;
        const apiResponse = await fetch(apiUrl);
        if (apiResponse.ok) {
          const data = await apiResponse.json();
          videoInfo = `\n📺 Title: ${data.title || title}\n`;
          if (data.description) {
            videoInfo += `\n📝 Description:\n${data.description.substring(0, 2000)}\n`;
          }
          if (data.publishedText) {
            videoInfo += `\n📅 Published: ${data.publishedText}\n`;
          }
          if (data.viewCount) {
            videoInfo += `\n👀 Views: ${data.viewCount.toLocaleString()}\n`;
          }
          break;
        }
      } catch {
        continue;
      }
    }

    if (!videoInfo) {
      videoInfo = `\n📺 YouTube Video\nVideo ID: ${videoId}\n`;
    }

    return {
      success: true,
      content: videoInfo,
      title,
      type: 'youtube'
    };
  } catch (error) {
    return {
      success: false,
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Only allow http and https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS URLs are allowed' },
        { status: 400 }
      );
    }

    let result: FetchResult;

    if (isYouTubeUrl(url)) {
      result = await fetchYouTube(url);
    } else {
      result = await fetchWebsite(url);
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        content: result.content,
        title: result.title,
        type: result.type
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch URL' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Web fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}