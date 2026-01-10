import axios from 'axios';
import {
  ArticleListResponse,
  Article,
  PromiseListResponse,
  Poll,
  PollHistoryResponse,
  TierListResponse,
  DashboardStats,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Articles
export async function getArticles(params?: {
  limit?: number;
  offset?: number;
  category?: string;
  sort_by?: string;
}): Promise<ArticleListResponse> {
  const response = await api.get('/articles', { params });
  return response.data;
}

export async function getArticle(id: number): Promise<Article> {
  const response = await api.get(`/articles/${id}`);
  return response.data;
}

// Promises
export async function getPromises(): Promise<PromiseListResponse> {
  const response = await api.get('/promises');
  return response.data;
}

// Polls
export async function getLatestPoll(): Promise<Poll> {
  const response = await api.get('/polls/latest');
  return response.data;
}

export async function getPollHistory(days: number = 90): Promise<PollHistoryResponse> {
  const response = await api.get('/polls/history', { params: { days } });
  return response.data;
}

// Tier List
export async function getTierList(): Promise<TierListResponse> {
  const response = await api.get('/tier-list');
  return response.data;
}

export async function voteOnTierItem(itemId: number, voteValue: number): Promise<{
  success: boolean;
  new_average: number;
  total_votes: number;
}> {
  const response = await api.post('/tier-list/vote', {
    item_id: itemId,
    vote_value: voteValue,
  });
  return response.data;
}

// Dashboard Stats
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get('/stats');
  return response.data;
}

// Utility function to get sentiment level
export function getSentimentLevel(score: number | null): string {
  if (score === null) return 'neutral';
  if (score < -0.5) return 'very-negative';
  if (score < -0.2) return 'negative';
  if (score > 0.2) return 'positive';
  return 'neutral';
}

// Format relative time
export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return 'Unknown';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}
