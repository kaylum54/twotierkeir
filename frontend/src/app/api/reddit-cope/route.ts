import { NextResponse } from 'next/server';

// The Guardian API - free, no key required for basic access
const GUARDIAN_API = 'https://content.guardianapis.com/search';
const API_KEY = 'test'; // 'test' key works for low-volume requests

interface GuardianArticle {
  id: string;
  webTitle: string;
  webUrl: string;
  webPublicationDate: string;
  fields?: {
    trailText?: string;
    bodyText?: string;
    standfirst?: string;
  };
  tags?: Array<{ webTitle: string }>;
}

// Keywords for cope categorization
const COPE_KEYWORDS = {
  whatabout: ['tory', 'tories', 'conservative', '14 years', 'inherited', 'previous government', 'sunak', 'truss'],
  deflection: ['media', 'bias', 'unfair', 'misrepresent', 'taken out of context', 'actually meant'],
  denial: ['give him time', 'early days', 'only been', 'too soon', 'wait and see', 'long term'],
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
  if (lowerText.includes('winter fuel') || lowerText.includes('freebies') || lowerText.includes('donations')) {
    level += 2;
  }

  return Math.min(level, 10);
}

// Fetch from The Guardian API
async function fetchGuardianArticles(): Promise<GuardianArticle[]> {
  try {
    // Search for Starmer/Labour articles
    const queries = ['keir starmer', 'labour government', 'starmer'];
    const allArticles: GuardianArticle[] = [];

    for (const query of queries) {
      const url = `${GUARDIAN_API}?q=${encodeURIComponent(query)}&section=politics&show-fields=trailText,standfirst&page-size=20&api-key=${API_KEY}`;

      const response = await fetch(url, {
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.response?.results) {
          allArticles.push(...data.response.results);
        }
      }
    }

    // Deduplicate by id
    const unique = allArticles.filter(
      (article, index, self) => index === self.findIndex(a => a.id === article.id)
    );

    return unique;
  } catch (error) {
    console.error('Error fetching from Guardian:', error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';
  const sortBy = searchParams.get('sort_by') || 'recent';

  const articles = await fetchGuardianArticles();

  const allContent = articles.map(article => {
    const text = article.fields?.standfirst || article.fields?.trailText || article.webTitle;

    return {
      id: `guardian-${article.id.replace(/\//g, '-')}`,
      content: text.length > 400 ? text.substring(0, 400) + '...' : text,
      source_url: article.webUrl,
      source_platform: 'guardian',
      source_username: 'The Guardian',
      category: categorizeCope(text),
      cope_level: calculateCopeLevel(text),
      votes: Math.floor(Math.random() * 200) + 10, // Simulated votes
      created_at: article.webPublicationDate,
      subreddit: 'Politics', // Use as section label
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
