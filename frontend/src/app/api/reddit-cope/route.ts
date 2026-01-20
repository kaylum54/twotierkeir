import { NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3';

interface YouTubeComment {
  id: string;
  snippet: {
    topLevelComment: {
      id: string;
      snippet: {
        textDisplay: string;
        textOriginal: string;
        authorDisplayName: string;
        authorChannelUrl?: string;
        likeCount: number;
        publishedAt: string;
        videoId: string;
      };
    };
  };
}

interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
  };
}

// Keywords for cope categorization
const COPE_KEYWORDS = {
  whatabout: ['tory', 'tories', 'conservative', '14 years', 'inherited', 'previous government', 'sunak', 'truss', 'boris', 'johnson'],
  deflection: ['media', 'bias', 'unfair', 'misrepresent', 'context', 'actually meant', 'bbc', 'press'],
  denial: ['give him time', 'early days', 'only been', 'too soon', 'wait and see', 'long term', 'chance', 'months'],
};

// Categorize based on content
function categorizeCope(text: string): string {
  const lowerText = text.toLowerCase();

  for (const [category, keywords] of Object.entries(COPE_KEYWORDS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      return category;
    }
  }
  return 'copium';
}

// Calculate cope level (1-10) based on content
function calculateCopeLevel(text: string): number {
  const lowerText = text.toLowerCase();
  let level = 5;

  // Check for cope indicators
  const allKeywords = Object.values(COPE_KEYWORDS).flat();
  const matches = allKeywords.filter(kw => lowerText.includes(kw));
  level += Math.min(matches.length, 3);

  // Controversial topics boost
  if (lowerText.includes('winter fuel') || lowerText.includes('freebies') || lowerText.includes('donations') || lowerText.includes('taylor swift')) {
    level += 2;
  }

  // Exclamation marks indicate passion
  const exclamations = (text.match(/!/g) || []).length;
  level += Math.min(exclamations, 2);

  return Math.min(level, 10);
}

// Search for videos about Starmer
async function searchVideos(): Promise<YouTubeVideo[]> {
  try {
    const queries = ['keir starmer', 'labour government uk', 'starmer interview'];
    const allVideos: YouTubeVideo[] = [];

    for (const query of queries) {
      const url = `${YOUTUBE_API}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&order=date&regionCode=GB&relevanceLanguage=en&key=${YOUTUBE_API_KEY}`;

      const response = await fetch(url, { cache: 'no-store' });

      if (response.ok) {
        const data = await response.json();
        if (data.items) {
          allVideos.push(...data.items);
        }
      }
    }

    // Deduplicate
    const unique = allVideos.filter(
      (video, index, self) => index === self.findIndex(v => v.id.videoId === video.id.videoId)
    );

    return unique.slice(0, 15); // Limit to save quota
  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    return [];
  }
}

// Get comments from a video
async function getVideoComments(videoId: string): Promise<YouTubeComment[]> {
  try {
    const url = `${YOUTUBE_API}/commentThreads?part=snippet&videoId=${videoId}&maxResults=30&order=relevance&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(url, { cache: 'no-store' });

    if (response.ok) {
      const data = await response.json();
      return data.items || [];
    }
    return [];
  } catch (error) {
    console.error(`Error fetching comments for ${videoId}:`, error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';
  const sortBy = searchParams.get('sort_by') || 'recent';

  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 });
  }

  // Get recent videos about Starmer
  const videos = await searchVideos();

  // Get comments from each video
  const allComments: YouTubeComment[] = [];
  for (const video of videos.slice(0, 8)) { // Limit to save quota
    const comments = await getVideoComments(video.id.videoId);
    allComments.push(...comments);
  }

  // Transform to our format
  const allContent = allComments.map(comment => {
    const snippet = comment.snippet.topLevelComment.snippet;
    const text = snippet.textOriginal;

    return {
      id: `yt-${comment.id}`,
      content: text.length > 400 ? text.substring(0, 400) + '...' : text,
      source_url: `https://www.youtube.com/watch?v=${snippet.videoId}`,
      source_platform: 'youtube',
      source_username: snippet.authorDisplayName,
      category: categorizeCope(text),
      cope_level: calculateCopeLevel(text),
      votes: snippet.likeCount,
      created_at: snippet.publishedAt,
      subreddit: 'YouTube', // Section label
    };
  });

  // Filter by category
  let filtered = allContent;
  if (category !== 'all') {
    filtered = filtered.filter(item => item.category === category);
  }

  // Sort
  if (sortBy === 'votes') {
    filtered.sort((a, b) => b.votes - a.votes);
  } else if (sortBy === 'cope_level') {
    filtered.sort((a, b) => b.cope_level - a.cope_level);
  } else {
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return NextResponse.json(filtered.slice(0, 30));
}
