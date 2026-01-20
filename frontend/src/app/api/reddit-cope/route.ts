import { NextResponse } from 'next/server';

interface RedditComment {
  data: {
    id: string;
    body: string;
    author: string;
    subreddit: string;
    score: number;
    created_utc: number;
    permalink: string;
  };
}

interface RedditPost {
  data: {
    id: string;
    title: string;
    selftext: string;
    author: string;
    subreddit: string;
    score: number;
    created_utc: number;
    permalink: string;
    num_comments: number;
  };
}

// Keywords that indicate "cope" - defensive arguments for Starmer
const COPE_KEYWORDS = [
  'give him time',
  'give him a chance',
  'only been',
  'inherited',
  'tory mess',
  'tory',
  'tories',
  '14 years',
  'blame',
  'not his fault',
  'media bias',
  'media',
  'right wing',
  'actually good',
  'actually',
  'strategic',
  'long term',
  'context',
  'out of context',
  'misrepresented',
  'meant',
  'understand',
  'complicated',
  'nuance',
  'pragmatic',
  'realistic',
  'electable',
  'difficult',
  'tough',
  'not that bad',
  'could be worse',
  'at least',
  'better than',
  'compared to',
  'still',
  'but',
  'however',
  'fair',
  'unfair',
  'biased',
  'wait',
  'patience',
  'time',
  'early',
  'just',
  'only',
];

// Categorize the cope
function categorizeCope(text: string): string {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('tory') || lowerText.includes('tories') || lowerText.includes('14 years') || lowerText.includes('inherited')) {
    return 'whatabout';
  }
  if (lowerText.includes('media') || lowerText.includes('bias') || lowerText.includes('misrepresent')) {
    return 'deflection';
  }
  if (lowerText.includes('give him') || lowerText.includes('only been') || lowerText.includes('time')) {
    return 'denial';
  }
  return 'copium';
}

// Calculate cope level based on content
function calculateCopeLevel(text: string): number {
  const lowerText = text.toLowerCase();
  let level = 5;

  // Increase level for multiple cope indicators
  const matches = COPE_KEYWORDS.filter(kw => lowerText.includes(kw));
  level += Math.min(matches.length, 3);

  // Increase for excessive punctuation (!!!???)
  const exclamations = (text.match(/[!?]{2,}/g) || []).length;
  level += Math.min(exclamations, 2);

  // Cap at 10
  return Math.min(level, 10);
}

// Check if content is likely "cope" - now much more lenient
function isCope(text: string): boolean {
  const lowerText = text.toLowerCase();

  // Must mention Starmer, Keir, or Labour
  const mentionsSubject =
    lowerText.includes('starmer') ||
    lowerText.includes('keir') ||
    lowerText.includes('labour') ||
    lowerText.includes('government');

  // Accept any post that mentions the subject - we'll categorize and score it
  return mentionsSubject;
}

// Fetch new/hot posts from a subreddit (more reliable than search)
async function fetchSubredditNew(subreddit: string): Promise<RedditPost[]> {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=100`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'StarmerWatch/1.0 (by /u/starmerwatch)',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error(`Reddit returned ${response.status} for r/${subreddit}`);
      return [];
    }

    const data = await response.json();
    return data?.data?.children || [];
  } catch (error) {
    console.error(`Error fetching from r/${subreddit}:`, error);
    return [];
  }
}

// Fetch posts from a subreddit search
async function fetchSubredditPosts(subreddit: string, query: string): Promise<RedditPost[]> {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=new&limit=100&restrict_sr=on`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'StarmerWatch/1.0 (by /u/starmerwatch)',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data?.data?.children || [];
  } catch (error) {
    console.error(`Error fetching posts from r/${subreddit}:`, error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';
  const sortBy = searchParams.get('sort_by') || 'recent';

  const subreddits = ['ukpolitics', 'LabourUK', 'unitedkingdom'];

  const allContent: Array<{
    id: string;
    content: string;
    source_url: string;
    source_platform: string;
    source_username: string;
    category: string;
    cope_level: number;
    votes: number;
    created_at: string;
    subreddit: string;
  }> = [];

  // Fetch new posts from each subreddit (more reliable)
  for (const subreddit of subreddits) {
    const posts = await fetchSubredditNew(subreddit);

    for (const post of posts) {
      const text = post.data.selftext || post.data.title;
      // Much more lenient: just needs to mention the subject and have some content
      if (text && isCope(text) && text.length > 20) {
        allContent.push({
          id: `reddit-post-${post.data.id}`,
          content: text.length > 400 ? text.substring(0, 400) + '...' : text,
          source_url: `https://reddit.com${post.data.permalink}`,
          source_platform: 'reddit',
          source_username: post.data.author,
          category: categorizeCope(text),
          cope_level: calculateCopeLevel(text),
          votes: post.data.score,
          created_at: new Date(post.data.created_utc * 1000).toISOString(),
          subreddit: post.data.subreddit,
        });
      }
    }

    // Also search for specific terms
    const searchPosts = await fetchSubredditPosts(subreddit, 'starmer OR keir OR labour');
    for (const post of searchPosts) {
      const text = post.data.selftext || post.data.title;
      if (text && isCope(text) && text.length > 20) {
        // Check if already added
        const exists = allContent.some(c => c.id === `reddit-post-${post.data.id}`);
        if (!exists) {
          allContent.push({
            id: `reddit-post-${post.data.id}`,
            content: text.length > 400 ? text.substring(0, 400) + '...' : text,
            source_url: `https://reddit.com${post.data.permalink}`,
            source_platform: 'reddit',
            source_username: post.data.author,
            category: categorizeCope(text),
            cope_level: calculateCopeLevel(text),
            votes: post.data.score,
            created_at: new Date(post.data.created_utc * 1000).toISOString(),
            subreddit: post.data.subreddit,
          });
        }
      }
    }
  }

  // Remove duplicates
  const uniqueContent = allContent.filter(
    (item, index, self) => index === self.findIndex((t) => t.content === item.content)
  );

  // Filter by category
  let filtered = uniqueContent;
  if (category !== 'all') {
    filtered = filtered.filter((item) => item.category === category);
  }

  // Sort
  if (sortBy === 'votes') {
    filtered.sort((a, b) => b.votes - a.votes);
  } else if (sortBy === 'cope_level') {
    filtered.sort((a, b) => b.cope_level - a.cope_level);
  } else {
    // Default: recent
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Limit results
  const results = filtered.slice(0, 30);

  return NextResponse.json(results);
}
