
import { mockApi } from '@/lib/api';

export interface SocialPost {
  id: string;
  userId: string;
  content: string;
  postType: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  user?: {
    username: string;
    tradingTier: string;
  };
}

export interface TraderProfile {
  userId: string;
  displayName: string;
  bio: string;
  followerCount: number;
  averageReturn: number;
  winRate: number;
  sharpeRatio: number;
  verifiedTrader: boolean;
}

export interface Competition {
  id: string;
  name: string;
  description: string;
  prizePool: number;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
}

export interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  pointsEarned: number;
  referralUrl: string;
}

export class SocialService {
  async getFeed(page: number = 1) {
    return mockApi.get<SocialPost[]>(`/api/social/feed?page=${page}`);
  }

  async createPost(content: string, postType: string = 'general') {
    return mockApi.post<SocialPost>('/api/social/posts', { content, postType });
  }

  async likePost(postId: string) {
    return mockApi.post(`/api/social/posts/${postId}/like`, {});
  }

  async getTraderProfile(userId: string) {
    return mockApi.get<TraderProfile>(`/api/social/traders/${userId}`);
  }

  async followTrader(traderId: string, copyPercentage: number = 10) {
    return mockApi.post('/api/social/copy-trading/follow', {
      traderId,
      copyPercentage,
    });
  }

  async getCompetitions() {
    return mockApi.get<Competition[]>('/api/social/competitions');
  }

  async joinCompetition(competitionId: string) {
    return mockApi.post(`/api/social/competitions/${competitionId}/join`, {});
  }

  async getReferralData() {
    return mockApi.get<ReferralData>('/api/social/referrals');
  }

  async getUserPoints() {
    return mockApi.get('/api/social/points');
  }

  async getLeaderboard(type: string = 'points') {
    return mockApi.get(`/api/social/leaderboard?type=${type}`);
  }
}

export const socialService = new SocialService();
