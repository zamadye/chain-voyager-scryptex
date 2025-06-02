
import { Router } from 'express';
import { socialController } from '@/controllers/SocialController';
import { authMiddleware } from '@/middleware/authMiddleware';
import { validateRequest } from '@/middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticate);

// Referral System Routes
router.post('/referrals/generate',
  socialController.generateReferralCode.bind(socialController)
);

router.get('/referrals/stats',
  socialController.getReferralStats.bind(socialController)
);

router.post('/referrals/claim-reward',
  body('referral_id').isUUID(),
  validateRequest,
  socialController.claimReferralReward.bind(socialController)
);

// Points System Routes
router.get('/points/balance',
  socialController.getPointsBalance.bind(socialController)
);

router.get('/points/history',
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest,
  socialController.getPointsHistory.bind(socialController)
);

router.post('/points/redeem',
  body('points').isInt({ min: 1 }),
  body('reward_type').isString(),
  validateRequest,
  socialController.redeemPoints.bind(socialController)
);

// Social Features Routes
router.post('/posts',
  body('post_type').isIn(['trade_result', 'insight', 'general', 'strategy']),
  body('content').isString().isLength({ min: 1, max: 1000 }),
  body('trade_reference').optional().isUUID(),
  body('visibility').optional().isIn(['public', 'private', 'followers']),
  validateRequest,
  socialController.createPost.bind(socialController)
);

router.get('/feed',
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest,
  socialController.getSocialFeed.bind(socialController)
);

router.post('/posts/:id/like',
  param('id').isUUID(),
  validateRequest,
  socialController.likePost.bind(socialController)
);

router.post('/posts/:id/comment',
  param('id').isUUID(),
  body('comment').isString().isLength({ min: 1, max: 500 }),
  validateRequest,
  socialController.commentOnPost.bind(socialController)
);

// Copy Trading Routes
router.post('/copy-trading/follow',
  body('trader_id').isUUID(),
  body('copy_percentage').isFloat({ min: 0.1, max: 100 }),
  body('max_trade_size').optional().isString(),
  body('stop_loss_threshold').optional().isFloat({ min: 0, max: 100 }),
  validateRequest,
  socialController.followTrader.bind(socialController)
);

router.delete('/copy-trading/follow/:id',
  param('id').isUUID(),
  validateRequest,
  socialController.unfollowTrader.bind(socialController)
);

router.get('/copy-trading/followers',
  socialController.getFollowers.bind(socialController)
);

router.get('/copy-trading/performance',
  socialController.getCopyTradingPerformance.bind(socialController)
);

// Competition Routes
router.get('/competitions',
  query('status').optional().isIn(['upcoming', 'active', 'ended']),
  validateRequest,
  socialController.getCompetitions.bind(socialController)
);

router.post('/competitions/:id/join',
  param('id').isUUID(),
  body('starting_balance').isString(),
  validateRequest,
  socialController.joinCompetition.bind(socialController)
);

router.get('/competitions/:id/leaderboard',
  param('id').isUUID(),
  validateRequest,
  socialController.getCompetitionLeaderboard.bind(socialController)
);

// Governance Routes
router.get('/governance/proposals',
  query('status').optional().isIn(['active', 'passed', 'rejected', 'expired']),
  validateRequest,
  socialController.getProposals.bind(socialController)
);

router.post('/governance/proposals',
  body('title').isString().isLength({ min: 1, max: 200 }),
  body('description').isString().isLength({ min: 1, max: 2000 }),
  body('proposal_type').isString(),
  body('voting_end_date').isISO8601(),
  body('minimum_votes').optional().isInt({ min: 1 }),
  body('implementation_details').optional().isObject(),
  validateRequest,
  socialController.createProposal.bind(socialController)
);

router.post('/governance/vote',
  body('proposal_id').isUUID(),
  body('vote').isIn(['yes', 'no', 'abstain']),
  body('reason').optional().isString().isLength({ max: 500 }),
  validateRequest,
  socialController.voteOnProposal.bind(socialController)
);

// Leaderboard Routes
router.get('/leaderboard',
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['points', 'trading', 'social']),
  validateRequest,
  socialController.getLeaderboard.bind(socialController)
);

export default router;
