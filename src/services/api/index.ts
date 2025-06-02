
export { authService, type AuthCredentials, type User, type AuthResponse } from './authService';
export { chainService, type ChainInfo, type DeploymentRequest, type DeploymentResult } from './chainService';
export { tradingService, type SwapRequest, type SwapQuote, type TradingOrder, type Portfolio } from './tradingService';
export { socialService, type SocialPost, type TraderProfile, type Competition, type ReferralData } from './socialService';
export { enterpriseService, type InstitutionalAccount, type ComplianceResult, type QuantStrategy, type ExecutiveDashboard } from './enterpriseService';

// Unified API client
export class APIClient {
  auth = authService;
  chains = chainService;
  trading = tradingService;
  social = socialService;
  enterprise = enterpriseService;
}

export const api = new APIClient();
export default api;
