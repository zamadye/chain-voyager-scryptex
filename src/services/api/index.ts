import { authService } from './authService';
import { chainService } from './chainService';
import { tradingService } from './tradingService';
import { socialService } from './socialService';
import { enterpriseService } from './enterpriseService';
import { bridgeService } from './bridgeService';
import { swapService } from './swapService';

// Export individual services
export { authService } from './authService';
export { chainService } from './chainService';
export { tradingService } from './tradingService';
export { socialService } from './socialService';
export { enterpriseService } from './enterpriseService';
export { bridgeService } from './bridgeService';
export { swapService } from './swapService';

// Export types
export type { AuthCredentials, User, AuthResponse } from './authService';
export type { ChainInfo, DeploymentRequest, DeploymentResult } from './chainService';
export type { SwapRequest, SwapQuote, TradingOrder, Portfolio } from './tradingService';
export type { SocialPost, TraderProfile, Competition, ReferralData } from './socialService';
export type { InstitutionalAccount, ComplianceResult, QuantStrategy, ExecutiveDashboard } from './enterpriseService';
export type { 
  BridgeQuoteRequest, 
  BridgeRoute, 
  BridgeInitiateRequest, 
  BridgeTransaction,
  UserBridgePoints,
  BridgeLeaderboardEntry,
  DailyBridgeTask,
  UserTaskProgress,
  BridgeAnalytics,
  BridgeQuoteResponse
} from './bridgeService';
export type {
  SwapQuoteRequest,
  SwapQuote as SwapQuoteType,
  SwapExecuteRequest,
  SwapResult,
  OptimalRouteRequest,
  OptimalRouteResponse,
  UserTradingStats,
  DailyTradingTask,
  UserTaskProgress as SwapTaskProgress,
  TradingAnalytics,
  OrderBook,
  MarketData
} from './swapService';

// Unified API client
export class APIClient {
  auth = authService;
  chains = chainService;
  trading = tradingService;
  social = socialService;
  enterprise = enterpriseService;
  bridge = bridgeService;
  swap = swapService;
}

export const api = new APIClient();
export default api;
