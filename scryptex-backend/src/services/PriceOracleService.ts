
import { BigNumber } from 'ethers';
import { logger } from '../utils/logger';
import { redis } from '../config/redis';
import { databaseService } from './DatabaseService';
import { enhancedWeb3Service } from './enhancedWeb3Service';

interface PriceSource {
  id: string;
  name: string;
  type: 'chainlink' | 'pyth' | 'dex' | 'cex' | 'custom';
  weight: number;
  latency: number;
  reliability: number;
}

interface PriceData {
  symbol: string;
  price: BigNumber;
  timestamp: number;
  source: string;
  confidence: number;
  volume24h?: BigNumber;
  marketCap?: BigNumber;
}

interface AggregatedPrice {
  symbol: string;
  price: BigNumber;
  timestamp: number;
  confidence: number;
  sources: PriceSource[];
  deviation: number;
  volume24h?: BigNumber;
  chainPrices: { [chainId: number]: { price: BigNumber; liquidity: BigNumber } };
  qualityScore: number;
  manipulationRisk: number;
}

export class PriceOracleService {
  private priceCache: Map<string, AggregatedPrice> = new Map();
  private priceSources: Map<string, PriceSource> = new Map();
  private priceStreams: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializePriceOracle();
  }

  private async initializePriceOracle(): Promise<void> {
    logger.info('Initializing Price Oracle Service');
    
    // Register price sources
    await this.registerPriceSources();
    
    // Start price feeds
    await this.startPriceFeeds();
    
    // Start background processes
    this.startPriceAggregation();
    this.startArbitrageDetection();
    this.startManipulationDetection();
    
    logger.info('Price Oracle Service initialized');
  }

  private async registerPriceSources(): Promise<void> {
    const sources: PriceSource[] = [
      {
        id: 'chainlink_eth',
        name: 'Chainlink ETH',
        type: 'chainlink',
        weight: 0.3,
        latency: 300000, // 5 minutes
        reliability: 0.99
      },
      {
        id: 'uniswap_v3',
        name: 'Uniswap V3',
        type: 'dex',
        weight: 0.25,
        latency: 12000, // 12 seconds
        reliability: 0.95
      },
      {
        id: 'pyth_network',
        name: 'Pyth Network',
        type: 'pyth',
        weight: 0.2,
        latency: 1000, // 1 second
        reliability: 0.97
      },
      {
        id: 'coingecko',
        name: 'CoinGecko',
        type: 'cex',
        weight: 0.15,
        latency: 60000, // 1 minute
        reliability: 0.93
      },
      {
        id: 'binance',
        name: 'Binance',
        type: 'cex',
        weight: 0.1,
        latency: 1000, // 1 second
        reliability: 0.98
      }
    ];

    for (const source of sources) {
      this.priceSources.set(source.id, source);
    }
  }

  async getCurrentPrices(symbols?: string[], chainId?: number): Promise<{ [symbol: string]: AggregatedPrice }> {
    try {
      const prices: { [symbol: string]: AggregatedPrice } = {};
      
      if (symbols && symbols.length > 0) {
        for (const symbol of symbols) {
          const price = await this.getAggregatedPrice(symbol, chainId);
          if (price) {
            prices[symbol] = price;
          }
        }
      } else {
        // Return all cached prices
        for (const [symbol, price] of this.priceCache) {
          if (!chainId || price.chainPrices[chainId]) {
            prices[symbol] = price;
          }
        }
      }

      return prices;
    } catch (error) {
      logger.error('Failed to get current prices', {
        symbols,
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return {};
    }
  }

  async getAggregatedPrice(symbol: string, chainId?: number): Promise<AggregatedPrice | null> {
    try {
      const cacheKey = `price:${symbol}:${chainId || 'all'}`;
      
      // Check cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        const price = JSON.parse(cached) as AggregatedPrice;
        return {
          ...price,
          price: BigNumber.from(price.price),
          volume24h: price.volume24h ? BigNumber.from(price.volume24h) : undefined,
          chainPrices: Object.fromEntries(
            Object.entries(price.chainPrices).map(([chainId, data]) => [
              chainId,
              {
                price: BigNumber.from(data.price),
                liquidity: BigNumber.from(data.liquidity)
              }
            ])
          )
        };
      }

      // Fetch from sources
      const sourceData = await this.fetchFromAllSources(symbol, chainId);
      if (sourceData.length === 0) {
        return null;
      }

      // Aggregate prices
      const aggregated = await this.aggregatePrices(symbol, sourceData, chainId);
      
      // Cache the result
      await redis.setex(cacheKey, 30, JSON.stringify({
        ...aggregated,
        price: aggregated.price.toString(),
        volume24h: aggregated.volume24h?.toString(),
        chainPrices: Object.fromEntries(
          Object.entries(aggregated.chainPrices).map(([chainId, data]) => [
            chainId,
            {
              price: data.price.toString(),
              liquidity: data.liquidity.toString()
            }
          ])
        )
      }));

      return aggregated;
    } catch (error) {
      logger.error('Failed to get aggregated price', {
        symbol,
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  async getPriceHistory(symbol: string, timeframe: string, limit: number): Promise<PriceData[]> {
    try {
      const query = `
        SELECT * FROM price_feeds 
        WHERE token_id = (SELECT id FROM tokens WHERE symbol = $1 LIMIT 1)
        ORDER BY timestamp DESC 
        LIMIT $2
      `;
      
      const history = await databaseService.query<PriceData>(query, [symbol, limit]);
      
      return history.map(item => ({
        ...item,
        price: BigNumber.from(item.price),
        volume24h: item.volume24h ? BigNumber.from(item.volume24h) : undefined,
        marketCap: item.marketCap ? BigNumber.from(item.marketCap) : undefined
      }));
    } catch (error) {
      logger.error('Failed to get price history', {
        symbol,
        timeframe,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }

  async detectArbitrageOpportunities(): Promise<any[]> {
    try {
      const opportunities: any[] = [];
      const symbols = ['ETH', 'USDC', 'USDT', 'WBTC', 'DAI'];
      
      for (const symbol of symbols) {
        const chainPrices = await this.getCrossChainPrices(symbol);
        const arbitrageOps = this.calculateArbitrageOpportunities(symbol, chainPrices);
        opportunities.push(...arbitrageOps);
      }
      
      // Filter by minimum profit threshold
      return opportunities.filter(op => op.profitPercentage > 0.5); // 0.5% minimum
    } catch (error) {
      logger.error('Failed to detect arbitrage opportunities', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }

  async validatePriceData(priceData: PriceData): Promise<{ valid: boolean; reasons: string[] }> {
    const reasons: string[] = [];
    let valid = true;

    // Check timestamp freshness (shouldn't be older than 10 minutes)
    if (Date.now() - priceData.timestamp > 600000) {
      valid = false;
      reasons.push('Price data is too old');
    }

    // Check price reasonableness (shouldn't deviate more than 20% from cached price)
    const cached = this.priceCache.get(priceData.symbol);
    if (cached) {
      const deviation = Math.abs(
        priceData.price.sub(cached.price).mul(100).div(cached.price).toNumber()
      );
      if (deviation > 20) {
        valid = false;
        reasons.push(`Price deviation too high: ${deviation.toFixed(2)}%`);
      }
    }

    // Check confidence level
    if (priceData.confidence < 0.7) {
      valid = false;
      reasons.push('Confidence level too low');
    }

    return { valid, reasons };
  }

  async detectPriceManipulation(symbol: string): Promise<{ detected: boolean; confidence: number; evidence: string[] }> {
    try {
      const evidence: string[] = [];
      let manipulationScore = 0;

      // Get recent price history
      const history = await this.getPriceHistory(symbol, '1m', 60);
      if (history.length < 10) {
        return { detected: false, confidence: 0, evidence: [] };
      }

      // Check for sudden price spikes
      for (let i = 1; i < history.length; i++) {
        const current = history[i - 1];
        const previous = history[i];
        const change = current.price.sub(previous.price).mul(100).div(previous.price).toNumber();
        
        if (Math.abs(change) > 10) { // 10% change in 1 minute
          manipulationScore += 0.3;
          evidence.push(`Sudden ${change > 0 ? 'spike' : 'drop'} of ${change.toFixed(2)}%`);
        }
      }

      // Check volume anomalies
      const avgVolume = history.reduce((sum, item) => {
        return sum.add(item.volume24h || BigNumber.from(0));
      }, BigNumber.from(0)).div(history.length);

      const recentVolume = history[0].volume24h || BigNumber.from(0);
      if (recentVolume.gt(avgVolume.mul(5))) { // 5x average volume
        manipulationScore += 0.4;
        evidence.push('Abnormally high trading volume');
      }

      // Check cross-source deviation
      const sourceDeviation = await this.calculateSourceDeviation(symbol);
      if (sourceDeviation > 5) { // 5% deviation between sources
        manipulationScore += 0.3;
        evidence.push(`High deviation between price sources: ${sourceDeviation.toFixed(2)}%`);
      }

      const detected = manipulationScore > 0.7;
      return {
        detected,
        confidence: Math.min(manipulationScore, 1),
        evidence
      };
    } catch (error) {
      logger.error('Failed to detect price manipulation', {
        symbol,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { detected: false, confidence: 0, evidence: [] };
    }
  }

  // Price feed integration methods
  private async startPriceFeeds(): Promise<void> {
    const symbols = ['ETH', 'BTC', 'USDC', 'USDT', 'DAI', 'LINK', 'UNI', 'AAVE'];
    
    for (const symbol of symbols) {
      this.startPriceFeed(symbol);
    }
  }

  private startPriceFeed(symbol: string): void {
    const interval = setInterval(async () => {
      try {
        await this.updatePrice(symbol);
      } catch (error) {
        logger.error('Price feed update failed', {
          symbol,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }, 5000); // Update every 5 seconds

    this.priceStreams.set(symbol, interval);
  }

  private async updatePrice(symbol: string): Promise<void> {
    const aggregated = await this.getAggregatedPrice(symbol);
    if (aggregated) {
      this.priceCache.set(symbol, aggregated);
      
      // Save to database
      await this.savePriceToDatabase(aggregated);
      
      // Emit price update event (for WebSocket clients)
      await this.emitPriceUpdate(aggregated);
    }
  }

  private async fetchFromAllSources(symbol: string, chainId?: number): Promise<PriceData[]> {
    const promises: Promise<PriceData | null>[] = [];
    
    for (const [sourceId, source] of this.priceSources) {
      promises.push(this.fetchFromSource(symbol, source, chainId));
    }
    
    const results = await Promise.allSettled(promises);
    const priceData: PriceData[] = [];
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        priceData.push(result.value);
      }
    }
    
    return priceData;
  }

  private async fetchFromSource(symbol: string, source: PriceSource, chainId?: number): Promise<PriceData | null> {
    try {
      switch (source.type) {
        case 'chainlink':
          return await this.fetchFromChainlink(symbol, source, chainId);
        case 'pyth':
          return await this.fetchFromPyth(symbol, source);
        case 'dex':
          return await this.fetchFromDEX(symbol, source, chainId);
        case 'cex':
          return await this.fetchFromCEX(symbol, source);
        default:
          return null;
      }
    } catch (error) {
      logger.debug('Failed to fetch from source', {
        symbol,
        source: source.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  private async fetchFromChainlink(symbol: string, source: PriceSource, chainId?: number): Promise<PriceData | null> {
    // Implementation for Chainlink price feeds
    // This would integrate with Chainlink oracles on each chain
    return null;
  }

  private async fetchFromPyth(symbol: string, source: PriceSource): Promise<PriceData | null> {
    // Implementation for Pyth Network price feeds
    // This would integrate with Pyth's price feeds
    return null;
  }

  private async fetchFromDEX(symbol: string, source: PriceSource, chainId?: number): Promise<PriceData | null> {
    // Implementation for DEX price feeds (Uniswap, SushiSwap, etc.)
    // This would query DEX pools for current prices
    return null;
  }

  private async fetchFromCEX(symbol: string, source: PriceSource): Promise<PriceData | null> {
    // Implementation for centralized exchange APIs (Binance, Coinbase, etc.)
    // This would query CEX APIs for current prices
    return null;
  }

  private async aggregatePrices(symbol: string, sourceData: PriceData[], chainId?: number): Promise<AggregatedPrice> {
    // Calculate weighted average price
    let totalWeight = 0;
    let weightedSum = BigNumber.from(0);
    let totalVolume = BigNumber.from(0);
    const sources: PriceSource[] = [];

    for (const data of sourceData) {
      const source = this.priceSources.get(data.source);
      if (!source) continue;

      const weight = source.weight * data.confidence * source.reliability;
      totalWeight += weight;
      weightedSum = weightedSum.add(data.price.mul(Math.floor(weight * 1000000)));
      
      if (data.volume24h) {
        totalVolume = totalVolume.add(data.volume24h);
      }
      
      sources.push(source);
    }

    const aggregatedPrice = totalWeight > 0 
      ? weightedSum.div(Math.floor(totalWeight * 1000000))
      : BigNumber.from(0);

    // Calculate deviation
    const deviation = this.calculateDeviation(sourceData, aggregatedPrice);

    // Calculate quality metrics
    const qualityScore = this.calculateQualityScore(sourceData, sources);
    const manipulationRisk = await this.assessManipulationRisk(symbol, sourceData);

    return {
      symbol,
      price: aggregatedPrice,
      timestamp: Date.now(),
      confidence: totalWeight / sources.length,
      sources,
      deviation,
      volume24h: totalVolume.gt(0) ? totalVolume : undefined,
      chainPrices: await this.getChainSpecificPrices(symbol, sourceData),
      qualityScore,
      manipulationRisk
    };
  }

  private calculateDeviation(sourceData: PriceData[], aggregatedPrice: BigNumber): number {
    if (sourceData.length < 2) return 0;

    const deviations = sourceData.map(data => {
      const diff = data.price.sub(aggregatedPrice).abs();
      return diff.mul(100).div(aggregatedPrice).toNumber();
    });

    return Math.max(...deviations);
  }

  private calculateQualityScore(sourceData: PriceData[], sources: PriceSource[]): number {
    if (sourceData.length === 0) return 0;

    let totalScore = 0;
    for (let i = 0; i < sourceData.length; i++) {
      const data = sourceData[i];
      const source = sources[i];
      
      // Age penalty (fresher is better)
      const agePenalty = Math.min((Date.now() - data.timestamp) / 300000, 1); // 5 minutes max
      
      // Confidence and reliability
      const score = data.confidence * source.reliability * (1 - agePenalty);
      totalScore += score;
    }

    return totalScore / sourceData.length;
  }

  private async assessManipulationRisk(symbol: string, sourceData: PriceData[]): Promise<number> {
    if (sourceData.length < 2) return 1; // High risk if only one source

    // Check deviation between sources
    const prices = sourceData.map(data => data.price);
    const maxPrice = prices.reduce((max, price) => price.gt(max) ? price : max, BigNumber.from(0));
    const minPrice = prices.reduce((min, price) => price.lt(min) ? price : min, maxPrice);
    
    const spreadPercentage = maxPrice.sub(minPrice).mul(100).div(maxPrice).toNumber();
    
    // High spread indicates potential manipulation
    if (spreadPercentage > 5) return 0.8;
    if (spreadPercentage > 2) return 0.5;
    if (spreadPercentage > 1) return 0.3;
    
    return 0.1; // Low risk
  }

  private async getChainSpecificPrices(symbol: string, sourceData: PriceData[]): Promise<{ [chainId: number]: { price: BigNumber; liquidity: BigNumber } }> {
    // This would fetch chain-specific price data from DEXes on each chain
    const chainPrices: { [chainId: number]: { price: BigNumber; liquidity: BigNumber } } = {};
    
    // For now, return empty object - would be implemented with actual DEX integrations
    return chainPrices;
  }

  private async getCrossChainPrices(symbol: string): Promise<{ [chainId: number]: BigNumber }> {
    const prices: { [chainId: number]: BigNumber } = {};
    
    // This would fetch prices from all supported chains
    for (const chainId of [1, 137, 56, 42161, 10, 11155111]) {
      const price = await this.getAggregatedPrice(symbol, chainId);
      if (price) {
        prices[chainId] = price.price;
      }
    }
    
    return prices;
  }

  private calculateArbitrageOpportunities(symbol: string, chainPrices: { [chainId: number]: BigNumber }): any[] {
    const opportunities: any[] = [];
    const chainIds = Object.keys(chainPrices).map(Number);
    
    for (let i = 0; i < chainIds.length; i++) {
      for (let j = i + 1; j < chainIds.length; j++) {
        const sourceChain = chainIds[i];
        const targetChain = chainIds[j];
        const sourcePrice = chainPrices[sourceChain];
        const targetPrice = chainPrices[targetChain];
        
        if (sourcePrice && targetPrice) {
          const priceDiff = targetPrice.sub(sourcePrice);
          const profitPercentage = priceDiff.mul(100).div(sourcePrice).toNumber();
          
          if (Math.abs(profitPercentage) > 0.5) { // 0.5% minimum
            opportunities.push({
              symbol,
              sourceChain,
              targetChain,
              sourcePrice: sourcePrice.toString(),
              targetPrice: targetPrice.toString(),
              profitPercentage: Math.abs(profitPercentage),
              direction: profitPercentage > 0 ? 'buy_source_sell_target' : 'buy_target_sell_source'
            });
          }
        }
      }
    }
    
    return opportunities;
  }

  private async calculateSourceDeviation(symbol: string): Promise<number> {
    const sourceData = await this.fetchFromAllSources(symbol);
    if (sourceData.length < 2) return 0;

    const prices = sourceData.map(data => data.price.toNumber());
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const maxDeviation = Math.max(...prices.map(price => Math.abs((price - avgPrice) / avgPrice * 100)));
    
    return maxDeviation;
  }

  private async savePriceToDatabase(price: AggregatedPrice): Promise<void> {
    try {
      const query = `
        INSERT INTO price_feeds (token_id, price_usd, price_source, confidence, volume_24h, timestamp)
        VALUES (
          (SELECT id FROM tokens WHERE symbol = $1 LIMIT 1),
          $2, $3, $4, $5, $6
        )
        ON CONFLICT (token_id, timestamp) DO UPDATE SET
          price_usd = EXCLUDED.price_usd,
          confidence = EXCLUDED.confidence,
          volume_24h = EXCLUDED.volume_24h
      `;
      
      await databaseService.query(query, [
        price.symbol,
        price.price.toString(),
        'aggregated',
        price.confidence,
        price.volume24h?.toString() || '0',
        new Date(price.timestamp)
      ]);
    } catch (error) {
      logger.error('Failed to save price to database', {
        symbol: price.symbol,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async emitPriceUpdate(price: AggregatedPrice): Promise<void> {
    // This would emit price updates to WebSocket clients
    // Implementation depends on WebSocket setup
  }

  // Background processes
  private startPriceAggregation(): void {
    setInterval(async () => {
      try {
        // Update all cached prices
        for (const [symbol] of this.priceCache) {
          await this.updatePrice(symbol);
        }
      } catch (error) {
        logger.error('Price aggregation error', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }, 10000); // Every 10 seconds
  }

  private startArbitrageDetection(): void {
    setInterval(async () => {
      try {
        await this.detectArbitrageOpportunities();
      } catch (error) {
        logger.error('Arbitrage detection error', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }, 30000); // Every 30 seconds
  }

  private startManipulationDetection(): void {
    setInterval(async () => {
      try {
        for (const [symbol] of this.priceCache) {
          const manipulation = await this.detectPriceManipulation(symbol);
          if (manipulation.detected) {
            logger.warn('Price manipulation detected', {
              symbol,
              confidence: manipulation.confidence,
              evidence: manipulation.evidence
            });
            
            // Could trigger alerts or protective measures
          }
        }
      } catch (error) {
        logger.error('Manipulation detection error', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }, 60000); // Every minute
  }

  async cleanup(): Promise<void> {
    // Stop all price streams
    for (const [symbol, interval] of this.priceStreams) {
      clearInterval(interval);
    }
    this.priceStreams.clear();
    
    logger.info('Price Oracle Service cleaned up');
  }
}

export const priceOracleService = new PriceOracleService();
