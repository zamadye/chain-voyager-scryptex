
import { mockApi } from '@/lib/api';

export interface SwapRequest {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  minAmountOut: string;
  slippage: number;
  chainId: number;
}

export interface SwapQuote {
  amountOut: string;
  priceImpact: number;
  fee: string;
  route: SwapRoute[];
  estimatedGas: number;
}

export interface SwapRoute {
  dex: string;
  path: string[];
  fee: number;
}

export interface TradingOrder {
  id: string;
  pairId: string;
  orderType: string;
  side: string;
  quantity: string;
  price?: string;
  status: string;
  createdAt: string;
}

export interface Portfolio {
  totalValue: string;
  unrealizedPnL: string;
  realizedPnL: string;
  positions: Position[];
}

export interface Position {
  tokenSymbol: string;
  quantity: string;
  averageCost: string;
  currentPrice: string;
  unrealizedPnL: string;
}

export interface ComplianceResult {
  isCompliant: boolean;
  violations: any[];
  riskScore: number;
  requiredActions: any[];
}

export class TradingService {
  async getSwapQuote(request: SwapRequest) {
    return mockApi.post<SwapQuote>('/api/trading/quote', request);
  }

  async executeSwap(request: SwapRequest) {
    return mockApi.post('/api/trading/swap', request);
  }

  async placeOrder(order: Partial<TradingOrder>) {
    return mockApi.post<TradingOrder>('/api/trading/orders', order);
  }

  async getOrders(status?: string) {
    const params = status ? `?status=${status}` : '';
    return mockApi.get<TradingOrder[]>(`/api/trading/orders${params}`);
  }

  async cancelOrder(orderId: string) {
    return mockApi.post(`/api/trading/orders/${orderId}/cancel`, {});
  }

  async getPortfolio() {
    return mockApi.get<Portfolio>('/api/portfolio');
  }

  async getPortfolioHistory(period: string = '1M') {
    return mockApi.get(`/api/portfolio/history?period=${period}`);
  }

  async bridgeAssets(request: any) {
    return mockApi.post('/api/trading/bridge', request);
  }

  async checkTradeCompliance(tradeData: any) {
    return mockApi.post<ComplianceResult>('/api/compliance/check-trade', { tradeData });
  }
}

export const tradingService = new TradingService();
