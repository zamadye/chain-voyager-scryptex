
export interface InstitutionalAccount {
  id: string;
  accountName: string;
  accountType: 'hedge_fund' | 'family_office' | 'asset_manager' | 'pension_fund' | 'bank' | 'broker_dealer';
  legalName: string;
  jurisdiction: string;
  complianceLevel: 'standard' | 'enhanced' | 'institutional';
  totalAUM: number;
  serviceTier: 'standard' | 'premium' | 'enterprise';
  kycStatus: 'pending' | 'approved' | 'rejected' | 'expired';
  teamMembers: InstitutionalTeamMember[];
  riskProfile: any;
  regulatoryIdentifiers: any;
}

export interface InstitutionalTeamMember {
  id: string;
  userId: string;
  role: 'admin' | 'trader' | 'compliance_officer' | 'risk_manager' | 'viewer' | 'portfolio_manager';
  permissions: any;
  tradingLimits: any;
  isActive: boolean;
}

export interface ComplianceRecord {
  id: string;
  institutionalAccountId: string;
  complianceType: string;
  regulationName: string;
  jurisdiction: string;
  complianceStatus: 'compliant' | 'non_compliant' | 'pending' | 'warning';
  complianceData: any;
  riskScore: number;
  lastAssessment: Date;
  nextReviewDate: Date;
}

export interface QuantStrategy {
  id: string;
  institutionalAccountId: string;
  strategyName: string;
  strategyType: 'mean_reversion' | 'momentum' | 'arbitrage' | 'market_neutral' | 'pairs_trading' | 'statistical_arbitrage';
  description: string;
  strategyConfig: any;
  riskParameters: any;
  backtestResults: any;
  isLive: boolean;
  allocatedCapital: number;
  currentPnl: number;
  sharpeRatio: number;
  status: 'draft' | 'backtesting' | 'approved' | 'live' | 'paused' | 'terminated';
}

export interface MLModel {
  id: string;
  institutionalAccountId: string;
  modelName: string;
  modelType: 'lstm' | 'random_forest' | 'svm' | 'ensemble' | 'transformer' | 'cnn';
  features: string[];
  hyperparameters: any;
  performanceMetrics: any;
  deploymentStatus: 'training' | 'trained' | 'deployed' | 'retired' | 'failed';
  accuracyScore: number;
}

export interface MarketMakingStrategy {
  id: string;
  institutionalAccountId: string;
  strategyName: string;
  targetMarkets: string[];
  baseSpread: number;
  orderSize: number;
  inventoryLimits: any;
  riskControls: any;
  isActive: boolean;
  totalVolume: number;
  totalPnl: number;
}

export interface WhiteLabelInstance {
  id: string;
  partnerId: string;
  partnerName: string;
  instanceName: string;
  customDomain: string;
  brandingConfig: BrandingConfig;
  enabledFeatures: string[];
  revenueSharePercentage: number;
  status: 'pending' | 'active' | 'suspended' | 'terminated';
}

export interface BrandingConfig {
  companyName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  customCSS?: string;
  favicon: string;
}

export interface RegulatoryReport {
  id: string;
  institutionalAccountId: string;
  reportType: 'form_13f' | 'form_pf' | 'emir' | 'mifid_ii' | 'cftc_lar' | 'sec_13h';
  reportingPeriod: string;
  jurisdiction: string;
  reportData: any;
  status: 'draft' | 'validated' | 'submitted' | 'accepted' | 'rejected' | 'amended';
  submissionDeadline: Date;
}

export interface ExecutiveDashboard {
  totalAUM: number;
  netPnL: number;
  riskMetrics: RiskSummary;
  complianceScore: number;
  systemUptime: number;
  activeUsers: number;
  tradingVolume: VolumeMetrics;
}

export interface RiskSummary {
  var95: number;
  expectedShortfall: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface VolumeMetrics {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface AuditRecord {
  id: string;
  institutionalAccountId?: string;
  userId?: string;
  activityType: string;
  resourceType: string;
  resourceId: string;
  action: string;
  oldValues?: any;
  newValues?: any;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceFlags: string[];
}

export interface BusinessIntelligenceReport {
  id: string;
  institutionalAccountId?: string;
  reportName: string;
  reportType: 'executive_dashboard' | 'portfolio_attribution' | 'risk_metrics' | 'compliance_summary' | 'performance_analysis';
  reportConfig: any;
  reportData: any;
  generatedForPeriod: string;
  isScheduled: boolean;
}
