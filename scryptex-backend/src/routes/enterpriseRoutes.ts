
import { Router } from 'express';
import { EnterpriseController } from '@/controllers/EnterpriseController';
import { authMiddleware } from '@/middleware/authMiddleware';
import { validateRequest } from '@/middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();
const enterpriseController = new EnterpriseController();

// Apply authentication to all enterprise routes
router.use(authMiddleware.authenticate);

// Institutional Account Management Routes
router.post('/accounts',
  [
    body('accountName').notEmpty().withMessage('Account name is required'),
    body('accountType').isIn(['hedge_fund', 'family_office', 'asset_manager', 'pension_fund', 'bank', 'broker_dealer']).withMessage('Invalid account type'),
    body('legalName').notEmpty().withMessage('Legal name is required'),
    body('jurisdiction').notEmpty().withMessage('Jurisdiction is required'),
    validateRequest
  ],
  enterpriseController.createInstitutionalAccount.bind(enterpriseController)
);

router.get('/accounts/:accountId',
  [
    param('accountId').isUUID().withMessage('Valid account ID required'),
    validateRequest
  ],
  enterpriseController.getInstitutionalAccount.bind(enterpriseController)
);

router.post('/accounts/:accountId/members',
  [
    param('accountId').isUUID().withMessage('Valid account ID required'),
    body('userId').isUUID().withMessage('Valid user ID required'),
    body('role').isIn(['admin', 'trader', 'compliance_officer', 'risk_manager', 'viewer', 'portfolio_manager']).withMessage('Invalid role'),
    validateRequest
  ],
  enterpriseController.addTeamMember.bind(enterpriseController)
);

// Compliance Routes
router.post('/compliance/check-trade',
  [
    body('tradeData').isObject().withMessage('Trade data is required'),
    validateRequest
  ],
  enterpriseController.checkTradeCompliance.bind(enterpriseController)
);

router.get('/accounts/:accountId/compliance/status',
  [
    param('accountId').isUUID().withMessage('Valid account ID required'),
    validateRequest
  ],
  enterpriseController.getComplianceStatus.bind(enterpriseController)
);

router.post('/accounts/:accountId/compliance/reports',
  [
    param('accountId').isUUID().withMessage('Valid account ID required'),
    body('reportType').isIn(['form_13f', 'form_pf', 'emir', 'mifid_ii', 'cftc_lar', 'sec_13h']).withMessage('Invalid report type'),
    body('period').notEmpty().withMessage('Reporting period is required'),
    validateRequest
  ],
  enterpriseController.generateRegulatoryReport.bind(enterpriseController)
);

router.get('/accounts/:accountId/audit-trail',
  [
    param('accountId').isUUID().withMessage('Valid account ID required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Valid page number required'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Valid limit required'),
    validateRequest
  ],
  enterpriseController.getAuditTrail.bind(enterpriseController)
);

// AI/ML Trading Routes
router.post('/accounts/:accountId/quant-strategies',
  [
    param('accountId').isUUID().withMessage('Valid account ID required'),
    body('name').notEmpty().withMessage('Strategy name is required'),
    body('type').isIn(['mean_reversion', 'momentum', 'arbitrage', 'market_neutral', 'pairs_trading', 'statistical_arbitrage']).withMessage('Invalid strategy type'),
    validateRequest
  ],
  enterpriseController.createQuantStrategy.bind(enterpriseController)
);

router.get('/accounts/:accountId/quant-strategies',
  [
    param('accountId').isUUID().withMessage('Valid account ID required'),
    validateRequest
  ],
  enterpriseController.getQuantStrategies.bind(enterpriseController)
);

router.post('/quant-strategies/:strategyId/backtest',
  [
    param('strategyId').isUUID().withMessage('Valid strategy ID required'),
    body('startDate').isISO8601().withMessage('Valid start date required'),
    body('endDate').isISO8601().withMessage('Valid end date required'),
    body('initialCapital').isNumeric().withMessage('Valid initial capital required'),
    validateRequest
  ],
  enterpriseController.backtestStrategy.bind(enterpriseController)
);

router.post('/accounts/:accountId/ml-models',
  [
    param('accountId').isUUID().withMessage('Valid account ID required'),
    body('name').notEmpty().withMessage('Model name is required'),
    body('type').isIn(['lstm', 'random_forest', 'svm', 'ensemble', 'transformer', 'cnn']).withMessage('Invalid model type'),
    body('features').isArray().withMessage('Features array is required'),
    validateRequest
  ],
  enterpriseController.trainMLModel.bind(enterpriseController)
);

router.get('/accounts/:accountId/ml-models',
  [
    param('accountId').isUUID().withMessage('Valid account ID required'),
    validateRequest
  ],
  enterpriseController.getMLModels.bind(enterpriseController)
);

// Market Making Routes
router.post('/accounts/:accountId/market-making-strategies',
  [
    param('accountId').isUUID().withMessage('Valid account ID required'),
    body('name').notEmpty().withMessage('Strategy name is required'),
    body('targetMarkets').isArray().withMessage('Target markets array is required'),
    body('baseSpread').isNumeric().withMessage('Valid base spread required'),
    body('orderSize').isNumeric().withMessage('Valid order size required'),
    validateRequest
  ],
  enterpriseController.createMarketMakingStrategy.bind(enterpriseController)
);

router.get('/market-making/:strategyId/quotes',
  [
    param('strategyId').isUUID().withMessage('Valid strategy ID required'),
    query('market').notEmpty().withMessage('Market parameter is required'),
    validateRequest
  ],
  enterpriseController.getMarketMakingQuotes.bind(enterpriseController)
);

// White-Label Platform Routes
router.post('/white-label/instances',
  [
    body('partnerId').isUUID().withMessage('Valid partner ID required'),
    body('partnerName').notEmpty().withMessage('Partner name is required'),
    body('instanceName').notEmpty().withMessage('Instance name is required'),
    body('customDomain').optional().isURL().withMessage('Valid custom domain required'),
    validateRequest
  ],
  enterpriseController.createWhiteLabelInstance.bind(enterpriseController)
);

router.get('/white-label/instances',
  enterpriseController.getWhiteLabelInstances.bind(enterpriseController)
);

router.get('/white-label/:instanceId/revenue',
  [
    param('instanceId').isUUID().withMessage('Valid instance ID required'),
    query('period').optional().notEmpty().withMessage('Valid period required'),
    validateRequest
  ],
  enterpriseController.getPartnerRevenue.bind(enterpriseController)
);

// Business Intelligence Routes
router.get('/accounts/:accountId/dashboard',
  [
    param('accountId').isUUID().withMessage('Valid account ID required'),
    validateRequest
  ],
  enterpriseController.getExecutiveDashboard.bind(enterpriseController)
);

router.post('/accounts/:accountId/reports',
  [
    param('accountId').isUUID().withMessage('Valid account ID required'),
    body('reportName').notEmpty().withMessage('Report name is required'),
    body('reportType').isIn(['executive_dashboard', 'portfolio_attribution', 'risk_metrics', 'compliance_summary', 'performance_analysis']).withMessage('Invalid report type'),
    body('generatedForPeriod').notEmpty().withMessage('Reporting period is required'),
    validateRequest
  ],
  enterpriseController.createCustomReport.bind(enterpriseController)
);

export default router;
