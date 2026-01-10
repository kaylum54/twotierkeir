// API Response Types

export interface Article {
  id: number;
  title: string;
  url: string;
  source: string;
  category: string;
  published_at: string | null;
  scraped_at: string;
  sentiment_score: number | null;
  content_snippet: string | null;
  is_posted: boolean;
  posted_at: string | null;
}

export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

export interface Promise {
  id: number;
  promise_text: string;
  date_promised: string | null;
  source_url: string | null;
  status: 'broken' | 'u-turn' | 'pending' | 'kept';
  evidence_urls: string | null;
  mocking_comment: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface PromiseListResponse {
  promises: Promise[];
  total: number;
  broken_count: number;
  uturn_count: number;
  pending_count: number;
}

export interface Poll {
  id: number;
  pollster: string;
  date: string;
  approval_rating: number | null;
  disapproval_rating: number | null;
  sample_size: number | null;
  source_url: string | null;
  created_at: string;
}

export interface PollHistoryResponse {
  polls: Poll[];
  average_approval: number;
  lowest_approval: number;
  highest_approval: number;
}

export interface TierItem {
  id: number;
  description: string;
  category: string | null;
  date_occurred: string | null;
  source_url: string | null;
  created_at: string;
  is_active: boolean;
  average_vote: number | null;
  vote_count: number;
}

export interface TierListResponse {
  items: TierItem[];
  total_votes: number;
}

export interface DashboardStats {
  total_articles: number;
  negative_articles: number;
  posts_today: number;
  posts_total: number;
  broken_promises: number;
  latest_approval_rating: number | null;
  days_since_disaster: number;
}

// UI Types
export type SentimentLevel = 'very-negative' | 'negative' | 'neutral' | 'positive';

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}
