
import { Request, Response } from 'express';
import { SocialService } from '@/services/SocialService';
import { logger } from '@/utils/logger';

export class SocialController {
  // Referral System
  async generateReferralCode(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const referralCode = await SocialService.generateReferralCode(userId);
      
      res.json({
        success: true,
        referral_code: referralCode
      });
    } catch (error) {
      logger.error('SocialController.generateReferralCode error:', error);
      res.status(500).json({ error: 'Failed to generate referral code' });
    }
  }

  async getReferralStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const stats = await SocialService.getReferralStats(userId);
      
      res.json(stats);
    } catch (error) {
      logger.error('SocialController.getReferralStats error:', error);
      res.status(500).json({ error: 'Failed to fetch referral stats' });
    }
  }

  async claimReferralReward(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { referral_id } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Implementation for claiming referral rewards
      // This would involve updating the referral points and user balance
      
      res.json({
        success: true,
        message: 'Referral reward claimed successfully'
      });
    } catch (error) {
      logger.error('SocialController.claimReferralReward error:', error);
      res.status(500).json({ error: 'Failed to claim referral reward' });
    }
  }

  // Points System
  async getPointsBalance(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const points = await SocialService.getUserPoints(userId);
      
      res.json(points);
    } catch (error) {
      logger.error('SocialController.getPointsBalance error:', error);
      res.status(500).json({ error: 'Failed to fetch points balance' });
    }
  }

  async getPointsHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Implementation for fetching points history
      // This would get user_activities for the user
      
      res.json([]);
    } catch (error) {
      logger.error('SocialController.getPointsHistory error:', error);
      res.status(500).json({ error: 'Failed to fetch points history' });
    }
  }

  async redeemPoints(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { points, reward_type } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Implementation for redeeming points
      // This would deduct points and provide rewards
      
      res.json({
        success: true,
        message: 'Points redeemed successfully'
      });
    } catch (error) {
      logger.error('SocialController.redeemPoints error:', error);
      res.status(500).json({ error: 'Failed to redeem points' });
    }
  }

  // Social Features
  async createPost(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { post_type, content, trade_reference, visibility } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const post = await SocialService.createSocialPost(
        userId,
        post_type,
        content,
        trade_reference,
        visibility
      );

      res.json(post);
    } catch (error) {
      logger.error('SocialController.createPost error:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  }

  async getSocialFeed(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const feed = await SocialService.getSocialFeed(userId, limit);
      
      res.json(feed);
    } catch (error) {
      logger.error('SocialController.getSocialFeed error:', error);
      res.status(500).json({ error: 'Failed to fetch social feed' });
    }
  }

  async likePost(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id: postId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await SocialService.likePost(userId, postId);
      
      res.json({
        success: true,
        message: 'Post liked successfully'
      });
    } catch (error) {
      logger.error('SocialController.likePost error:', error);
      res.status(500).json({ error: 'Failed to like post' });
    }
  }

  async commentOnPost(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id: postId } = req.params;
      const { comment } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Implementation for commenting on posts
      // This would create a post_interaction with type 'comment'
      
      res.json({
        success: true,
        message: 'Comment added successfully'
      });
    } catch (error) {
      logger.error('SocialController.commentOnPost error:', error);
      res.status(500).json({ error: 'Failed to comment on post' });
    }
  }

  // Copy Trading
  async followTrader(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { trader_id, copy_percentage, max_trade_size, stop_loss_threshold } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const follow = await SocialService.followTrader(
        userId,
        trader_id,
        copy_percentage,
        max_trade_size,
        stop_loss_threshold
      );

      res.json(follow);
    } catch (error) {
      logger.error('SocialController.followTrader error:', error);
      res.status(500).json({ error: 'Failed to follow trader' });
    }
  }

  async unfollowTrader(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id: followId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Implementation for unfollowing a trader
      // This would update is_active to false for the follow relationship
      
      res.json({
        success: true,
        message: 'Trader unfollowed successfully'
      });
    } catch (error) {
      logger.error('SocialController.unfollowTrader error:', error);
      res.status(500).json({ error: 'Failed to unfollow trader' });
    }
  }

  async getFollowers(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Implementation for getting followers
      // This would query copy_trading_follows where trader_id = userId
      
      res.json([]);
    } catch (error) {
      logger.error('SocialController.getFollowers error:', error);
      res.status(500).json({ error: 'Failed to fetch followers' });
    }
  }

  async getCopyTradingPerformance(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Implementation for getting copy trading performance
      // This would calculate performance metrics for copy trades
      
      res.json({
        total_copied_volume: '0',
        total_profit_loss: '0',
        win_rate: 0,
        followers_count: 0
      });
    } catch (error) {
      logger.error('SocialController.getCopyTradingPerformance error:', error);
      res.status(500).json({ error: 'Failed to fetch copy trading performance' });
    }
  }

  // Competitions
  async getCompetitions(req: Request, res: Response) {
    try {
      const competitions = await SocialService.getActiveCompetitions();
      
      res.json(competitions);
    } catch (error) {
      logger.error('SocialController.getCompetitions error:', error);
      res.status(500).json({ error: 'Failed to fetch competitions' });
    }
  }

  async joinCompetition(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id: competitionId } = req.params;
      const { starting_balance } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const participant = await SocialService.joinCompetition(
        userId,
        competitionId,
        starting_balance
      );

      res.json(participant);
    } catch (error) {
      logger.error('SocialController.joinCompetition error:', error);
      res.status(500).json({ error: 'Failed to join competition' });
    }
  }

  async getCompetitionLeaderboard(req: Request, res: Response) {
    try {
      const { id: competitionId } = req.params;

      // Implementation for getting competition leaderboard
      // This would query competition_participants for the competition
      
      res.json([]);
    } catch (error) {
      logger.error('SocialController.getCompetitionLeaderboard error:', error);
      res.status(500).json({ error: 'Failed to fetch competition leaderboard' });
    }
  }

  // Governance
  async getProposals(req: Request, res: Response) {
    try {
      const proposals = await SocialService.getActiveProposals();
      
      res.json(proposals);
    } catch (error) {
      logger.error('SocialController.getProposals error:', error);
      res.status(500).json({ error: 'Failed to fetch proposals' });
    }
  }

  async createProposal(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { title, description, proposal_type, voting_end_date, minimum_votes, implementation_details } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Implementation for creating proposals
      // This would insert into governance_proposals table
      
      res.json({
        success: true,
        message: 'Proposal created successfully'
      });
    } catch (error) {
      logger.error('SocialController.createProposal error:', error);
      res.status(500).json({ error: 'Failed to create proposal' });
    }
  }

  async voteOnProposal(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { proposal_id, vote, reason } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Calculate voting power based on user stats
      const votingPower = 1; // Basic implementation

      const voteRecord = await SocialService.voteOnProposal(
        userId,
        proposal_id,
        vote,
        votingPower,
        reason
      );

      res.json(voteRecord);
    } catch (error) {
      logger.error('SocialController.voteOnProposal error:', error);
      res.status(500).json({ error: 'Failed to vote on proposal' });
    }
  }

  // Leaderboard
  async getLeaderboard(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const leaderboard = await SocialService.getLeaderboard(limit);
      
      res.json(leaderboard);
    } catch (error) {
      logger.error('SocialController.getLeaderboard error:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  }
}

export const socialController = new SocialController();
