
import { Request, Response } from 'express';
import { EnterpriseService } from '@/services/EnterpriseService';
import { databaseService } from '@/services/DatabaseService';
import { logger } from '@/utils/logger';
import { successResponse, errorResponse } from '@/utils/response';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    wallet_address?: string;
    email?: string;
    username?: string;
  };
}

export class EnterpriseController {
  private enterpriseService: EnterpriseService;

  constructor() {
    this.enterpriseService = new EnterpriseService(databaseService);
  }

  // Institutional Account Management
  async createInstitutionalAccount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return errorResponse(res, 'Authentication required', 401);
      }

      const accountData = {
        ...req.body,
        primaryContactId: userId
      };

      const account = await this.enterpriseService.createInstitutionalAccount(accountData);
      
      logger.info('Institutional account created', { 
        accountId: account.id, 
        userId,
        accountType: account.accountType 
      });

      return successResponse(res, account, 'Institutional account created successfully');
    } catch (error) {
      logger.error('Error creating institutional account', { error, userId: req.user?.id });
      return errorResponse(res, 'Failed to create institutional account');
    }
  }

  async getInstitutionalAccount(req: AuthenticatedRequest, res: Response) {
    try {
      const { accountId } = req.params;
      const userId = req.user?.id;

      const account = await databaseService.queryOne(`
        SELECT ia.*, 
               json_agg(
                 json_build_object(
                   'id', itm.id,
                   'userId', itm.user_id,
                   'role', itm.role,
                   'permissions', itm.permissions,
                   'isActive', itm.is_active
                 )
               ) as team_members
        FROM institutional_accounts ia
        LEFT JOIN institutional_team_members itm ON ia.id = itm.institutional_account_id
        WHERE ia.id = $1
        GROUP BY ia.id
      `, [accountId]);

      if (!account) {
        return errorResponse(res, 'Institutional account not found', 404);
      }

      return successResponse(res, account);
    } catch (error) {
      logger.error('Error fetching institutional account', { error, accountId: req.params.accountId });
      return errorResponse(res, 'Failed to fetch institutional account');
    }
  }

  async addTeamMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { accountId } = req.params;
      const { userId, role, permissions, tradingLimits } = req.body;

      const member = await this.enterpriseService.addTeamMember(
        accountId, 
        userId, 
        role, 
        { ...permissions, tradingLimits }
      );

      return successResponse(res, member, 'Team member added successfully');
    } catch (error) {
      logger.error('Error adding team member', { error, accountId: req.params.accountId });
      return errorResponse(res, 'Failed to add team member');
    }
  }

  // Compliance Management
  async checkTradeCompliance(req: AuthenticatedRequest, res: Response) {
    try {
      const tradeData = req.body;
      const result = await this.enterpriseService.checkTradeCompliance(tradeData);

      return successResponse(res, result);
    } catch (error) {
      logger.error('Error checking trade compliance', { error });
      return errorResponse(res, 'Failed to check trade compliance');
    }
  }

  async getComplianceStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { accountId } = req.params;

      const complianceRecords = await databaseService.query(`
        SELECT * FROM compliance_records 
        WHERE institutional_account_id = $1 
        ORDER BY last_assessment DESC
      `, [accountId]);

      const overallScore = complianceRecords.reduce((sum, record) => sum + (100 - record.risk_score), 0) / complianceRecords.length;

      return successResponse(res, {
        overallScore: Math.round(overallScore),
        records: complianceRecords,
        summary: {
          compliant: complianceRecords.filter(r => r.compliance_status === 'compliant').length,
          warning: complianceRecords.filter(r => r.compliance_status === 'warning').length,
          nonCompliant: complianceRecords.filter(r => r.compliance_status === 'non_compliant').length
        }
      });
    } catch (error) {
      logger.error('Error fetching compliance status', { error, accountId: req.params.accountId });
      return errorResponse(res, 'Failed to fetch compliance status');
    }
  }

  async generateRegulatoryReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { accountId } = req.params;
      const { reportType, period } = req.body;

      const report = await this.enterpriseService.generateRegulatoryReport(accountId, reportType, period);

      return successResponse(res, report, 'Regulatory report generated successfully');
    } catch (error) {
      logger.error('Error generating regulatory report', { error, accountId: req.params.accountId });
      return errorResponse(res, 'Failed to generate regulatory report');
    }
  }

  async getAuditTrail(req: AuthenticatedRequest, res: Response) {
    try {
      const { accountId } = req.params;
      const { page = 1, limit = 50, riskLevel, activityType } = req.query;

      let query = `
        SELECT ar.*, u.username
        FROM audit_records ar
        LEFT JOIN users u ON ar.user_id = u.id
        WHERE ar.institutional_account_id = $1
      `;
      const params = [accountId];

      if (riskLevel) {
        query += ` AND ar.risk_level = $${params.length + 1}`;
        params.push(riskLevel as string);
      }

      if (activityType) {
        query += ` AND ar.activity_type = $${params.length + 1}`;
        params.push(activityType as string);
      }

      query += ` ORDER BY ar.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit as string, ((Number(page) - 1) * Number(limit)).toString());

      const auditRecords = await databaseService.query(query, params);

      return successResponse(res, {
        records: auditRecords,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: auditRecords.length
        }
      });
    } catch (error) {
      logger.error('Error fetching audit trail', { error, accountId: req.params.accountId });
      return errorResponse(res, 'Failed to fetch audit trail');
    }
  }

  // AI/ML Trading
  async createQuantStrategy(req: AuthenticatedRequest, res: Response) {
    try {
      const { accountId } = req.params;
      const strategyConfig = {
        ...req.body,
        createdBy: req.user?.id
      };

      const strategy = await this.enterpriseService.createQuantStrategy(accountId, strategyConfig);

      return successResponse(res, strategy, 'Quantitative strategy created successfully');
    } catch (error) {
      logger.error('Error creating quant strategy', { error, accountId: req.params.accountId });
      return errorResponse(res, 'Failed to create quantitative strategy');
    }
  }

  async getQuantStrategies(req: AuthenticatedRequest, res: Response) {
    try {
      const { accountId } = req.params;

      const strategies = await databaseService.query(`
        SELECT qs.*, u.username as created_by_name
        FROM quant_strategies qs
        LEFT JOIN users u ON qs.created_by = u.id
        WHERE qs.institutional_account_id = $1
        ORDER BY qs.created_at DESC
      `, [accountId]);

      return successResponse(res, strategies);
    } catch (error) {
      logger.error('Error fetching quant strategies', { error, accountId: req.params.accountId });
      return errorResponse(res, 'Failed to fetch quantitative strategies');
    }
  }

  async backtestStrategy(req: AuthenticatedRequest, res: Response) {
    try {
      const { strategyId } = req.params;
      const { startDate, endDate, initialCapital } = req.body;

      // Mock backtest results
      const backtestResult = {
        strategyId,
        period: { startDate, endDate },
        initialCapital,
        finalValue: initialCapital * (1 + 0.15), // 15% return
        totalReturn: 0.15,
        sharpeRatio: 1.2,
        maxDrawdown: 0.08,
        winRate: 0.65,
        totalTrades: 150,
        profitableTrades: 98,
        averageWin: 0.025,
        averageLoss: 0.015
      };

      // Update strategy with backtest results
      await databaseService.query(`
        UPDATE quant_strategies 
        SET backtest_results = $1, status = 'backtesting'
        WHERE id = $2
      `, [JSON.stringify(backtestResult), strategyId]);

      return successResponse(res, backtestResult, 'Backtest completed successfully');
    } catch (error) {
      logger.error('Error running backtest', { error, strategyId: req.params.strategyId });
      return errorResponse(res, 'Failed to run backtest');
    }
  }

  async trainMLModel(req: AuthenticatedRequest, res: Response) {
    try {
      const { accountId } = req.params;
      const modelConfig = {
        ...req.body,
        createdBy: req.user?.id
      };

      const model = await this.enterpriseService.trainMLModel(accountId, modelConfig);

      return successResponse(res, model, 'ML model training started');
    } catch (error) {
      logger.error('Error training ML model', { error, accountId: req.params.accountId });
      return errorResponse(res, 'Failed to start ML model training');
    }
  }

  async getMLModels(req: AuthenticatedRequest, res: Response) {
    try {
      const { accountId } = req.params;

      const models = await databaseService.query(`
        SELECT ml.*, u.username as created_by_name
        FROM ml_models ml
        LEFT JOIN users u ON ml.created_by = u.id
        WHERE ml.institutional_account_id = $1
        ORDER BY ml.created_at DESC
      `, [accountId]);

      return successResponse(res, models);
    } catch (error) {
      logger.error('Error fetching ML models', { error, accountId: req.params.accountId });
      return errorResponse(res, 'Failed to fetch ML models');
    }
  }

  // Market Making
  async createMarketMakingStrategy(req: AuthenticatedRequest, res: Response) {
    try {
      const { accountId } = req.params;
      const strategyConfig = {
        ...req.body,
        createdBy: req.user?.id
      };

      const strategy = await this.enterpriseService.createMarketMakingStrategy(accountId, strategyConfig);

      return successResponse(res, strategy, 'Market making strategy created successfully');
    } catch (error) {
      logger.error('Error creating market making strategy', { error, accountId: req.params.accountId });
      return errorResponse(res, 'Failed to create market making strategy');
    }
  }

  async getMarketMakingQuotes(req: AuthenticatedRequest, res: Response) {
    try {
      const { strategyId } = req.params;
      const { market } = req.query;

      const quotes = await this.enterpriseService.generateQuotes(strategyId, market as string);

      return successResponse(res, quotes);
    } catch (error) {
      logger.error('Error generating quotes', { error, strategyId: req.params.strategyId });
      return errorResponse(res, 'Failed to generate quotes');
    }
  }

  // White-Label Platform
  async createWhiteLabelInstance(req: AuthenticatedRequest, res: Response) {
    try {
      const partnerConfig = req.body;
      const instance = await this.enterpriseService.createWhiteLabelInstance(partnerConfig);

      return successResponse(res, instance, 'White-label instance created successfully');
    } catch (error) {
      logger.error('Error creating white-label instance', { error });
      return errorResponse(res, 'Failed to create white-label instance');
    }
  }

  async getWhiteLabelInstances(req: AuthenticatedRequest, res: Response) {
    try {
      const instances = await databaseService.query(`
        SELECT * FROM white_label_instances 
        ORDER BY created_at DESC
      `);

      return successResponse(res, instances);
    } catch (error) {
      logger.error('Error fetching white-label instances', { error });
      return errorResponse(res, 'Failed to fetch white-label instances');
    }
  }

  async getPartnerRevenue(req: AuthenticatedRequest, res: Response) {
    try {
      const { instanceId } = req.params;
      const { period } = req.query;

      const revenue = await databaseService.query(`
        SELECT * FROM partner_revenue 
        WHERE white_label_instance_id = $1 
        AND ($2::text IS NULL OR reporting_period = $2)
        ORDER BY reporting_period DESC
      `, [instanceId, period]);

      return successResponse(res, revenue);
    } catch (error) {
      logger.error('Error fetching partner revenue', { error, instanceId: req.params.instanceId });
      return errorResponse(res, 'Failed to fetch partner revenue');
    }
  }

  // Business Intelligence
  async getExecutiveDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const { accountId } = req.params;
      const dashboard = await this.enterpriseService.generateExecutiveDashboard(accountId);

      return successResponse(res, dashboard);
    } catch (error) {
      logger.error('Error generating executive dashboard', { error, accountId: req.params.accountId });
      return errorResponse(res, 'Failed to generate executive dashboard');
    }
  }

  async createCustomReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { accountId } = req.params;
      const { reportName, reportType, reportConfig, generatedForPeriod } = req.body;

      const report = await databaseService.queryOne(`
        INSERT INTO bi_reports (
          institutional_account_id, report_name, report_type, 
          report_config, generated_for_period, generated_by, report_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        accountId,
        reportName,
        reportType,
        JSON.stringify(reportConfig),
        generatedForPeriod,
        req.user?.id,
        JSON.stringify({ status: 'generating' })
      ]);

      // Generate report data asynchronously
      setTimeout(async () => {
        try {
          let reportData = {};
          
          switch (reportType) {
            case 'portfolio_attribution':
              reportData = await this.generatePortfolioAttribution(accountId, generatedForPeriod);
              break;
            case 'risk_metrics':
              reportData = await this.generateRiskMetrics(accountId, generatedForPeriod);
              break;
            case 'performance_analysis':
              reportData = await this.generatePerformanceAnalysis(accountId, generatedForPeriod);
              break;
            default:
              reportData = { message: 'Report type not implemented' };
          }

          await databaseService.query(`
            UPDATE bi_reports SET report_data = $1 WHERE id = $2
          `, [JSON.stringify(reportData), report.id]);
        } catch (error) {
          logger.error('Error generating report data', { error, reportId: report.id });
        }
      }, 1000);

      return successResponse(res, report, 'Custom report generation started');
    } catch (error) {
      logger.error('Error creating custom report', { error, accountId: req.params.accountId });
      return errorResponse(res, 'Failed to create custom report');
    }
  }

  // Helper methods for report generation
  private async generatePortfolioAttribution(accountId: string, period: string): Promise<any> {
    // Mock portfolio attribution analysis
    return {
      totalReturn: 0.15,
      assetAllocationEffect: 0.08,
      securitySelectionEffect: 0.05,
      interactionEffect: 0.02,
      benchmark: 'S&P 500',
      activeReturn: 0.03
    };
  }

  private async generateRiskMetrics(accountId: string, period: string): Promise<any> {
    // Mock risk metrics
    return {
      var95: 0.02,
      var99: 0.035,
      expectedShortfall: 0.025,
      maxDrawdown: 0.08,
      sharpeRatio: 1.5,
      sortinoRatio: 1.8,
      beta: 0.95,
      alpha: 0.03
    };
  }

  private async generatePerformanceAnalysis(accountId: string, period: string): Promise<any> {
    // Mock performance analysis
    return {
      cumulativeReturn: 0.15,
      annualizedReturn: 0.18,
      volatility: 0.12,
      informationRatio: 1.2,
      trackingError: 0.04,
      uptureCapture: 1.1,
      downturnCapture: 0.85
    };
  }
}
