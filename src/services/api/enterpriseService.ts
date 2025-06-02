
import { mockApi } from '@/lib/api';

export interface InstitutionalAccount {
  id: string;
  accountName: string;
  accountType: string;
  legalName: string;
  jurisdiction: string;
  complianceLevel: string;
  totalAUM: number;
  serviceTier: string;
  teamMembers: TeamMember[];
}

export interface TeamMember {
  id: string;
  userId: string;
  role: string;
  permissions: Record<string, boolean>;
  isActive: boolean;
}

export interface ComplianceResult {
  isCompliant: boolean;
  violations: any[];
  riskScore: number;
  requiredActions: any[];
}

export interface QuantStrategy {
  id: string;
  strategyName: string;
  strategyType: string;
  status: string;
  currentPnl: number;
  sharpeRatio: number;
  allocatedCapital: number;
}

export interface MLModel {
  id: string;
  modelName: string;
  modelType: string;
  deploymentStatus: string;
  accuracyScore: number;
  features: string[];
}

export interface WhiteLabelInstance {
  id: string;
  partnerName: string;
  instanceName: string;
  customDomain: string;
  status: string;
  revenueSharePercentage: number;
}

export interface ExecutiveDashboard {
  totalAUM: number;
  netPnL: number;
  complianceScore: number;
  systemUptime: number;
  activeUsers: number;
  tradingVolume: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export class EnterpriseService {
  // Institutional Account Management
  async createInstitutionalAccount(data: Partial<InstitutionalAccount>) {
    return mockApi.post<InstitutionalAccount>('/api/enterprise/accounts', data);
  }

  async getInstitutionalAccount(accountId: string) {
    return mockApi.get<InstitutionalAccount>(`/api/enterprise/accounts/${accountId}`);
  }

  async addTeamMember(accountId: string, memberData: Partial<TeamMember>) {
    return mockApi.post(`/api/enterprise/accounts/${accountId}/members`, memberData);
  }

  // Compliance
  async checkTradeCompliance(tradeData: any) {
    return mockApi.post<ComplianceResult>('/api/compliance/check-trade', { tradeData });
  }

  async getComplianceStatus(accountId: string) {
    return mockApi.get(`/api/accounts/${accountId}/compliance/status`);
  }

  async generateRegulatoryReport(accountId: string, reportType: string, period: string) {
    return mockApi.post(`/api/accounts/${accountId}/compliance/reports`, {
      reportType,
      period,
    });
  }

  async getAuditTrail(accountId: string, page: number = 1) {
    return mockApi.get(`/api/accounts/${accountId}/audit-trail?page=${page}`);
  }

  // AI/ML Trading
  async createQuantStrategy(accountId: string, strategyData: Partial<QuantStrategy>) {
    return mockApi.post<QuantStrategy>(`/api/accounts/${accountId}/quant-strategies`, strategyData);
  }

  async getQuantStrategies(accountId: string) {
    return mockApi.get<QuantStrategy[]>(`/api/accounts/${accountId}/quant-strategies`);
  }

  async backtestStrategy(strategyId: string, config: any) {
    return mockApi.post(`/api/quant-strategies/${strategyId}/backtest`, config);
  }

  async trainMLModel(accountId: string, modelData: Partial<MLModel>) {
    return mockApi.post<MLModel>(`/api/accounts/${accountId}/ml-models`, modelData);
  }

  async getMLModels(accountId: string) {
    return mockApi.get<MLModel[]>(`/api/accounts/${accountId}/ml-models`);
  }

  // Market Making
  async createMarketMakingStrategy(accountId: string, strategyData: any) {
    return mockApi.post(`/api/accounts/${accountId}/market-making-strategies`, strategyData);
  }

  async getMarketMakingQuotes(strategyId: string, market: string) {
    return mockApi.get(`/api/market-making/${strategyId}/quotes?market=${market}`);
  }

  // White-Label
  async createWhiteLabelInstance(data: Partial<WhiteLabelInstance>) {
    return mockApi.post<WhiteLabelInstance>('/api/white-label/instances', data);
  }

  async getWhiteLabelInstances() {
    return mockApi.get<WhiteLabelInstance[]>('/api/white-label/instances');
  }

  async getPartnerRevenue(instanceId: string, period?: string) {
    const params = period ? `?period=${period}` : '';
    return mockApi.get(`/api/white-label/${instanceId}/revenue${params}`);
  }

  // Business Intelligence
  async getExecutiveDashboard(accountId: string) {
    return mockApi.get<ExecutiveDashboard>(`/api/accounts/${accountId}/dashboard`);
  }

  async createCustomReport(accountId: string, reportData: any) {
    return mockApi.post(`/api/accounts/${accountId}/reports`, reportData);
  }
}

export const enterpriseService = new EnterpriseService();
