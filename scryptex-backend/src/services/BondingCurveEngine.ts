
import { BigNumber } from 'ethers';
import { logger } from '../utils/logger';

export interface CurveParameters {
  curveType: 'linear' | 'exponential' | 'logarithmic' | 'sigmoid' | 'polynomial';
  // Linear: y = mx + b
  slope?: string;
  intercept?: string;
  // Exponential: y = a * e^(bx)
  base?: string;
  exponent?: string;
  // Logarithmic: y = a * ln(x + 1) + b
  coefficient?: string;
  constant?: string;
  // Sigmoid: y = L / (1 + e^(-k(x - x0)))
  L?: string; // Maximum value
  k?: string; // Steepness
  x0?: string; // Midpoint
  // Polynomial: y = a*x^n + b*x^(n-1) + ... + z
  coefficients?: string[];
  degree?: number;
  // Common parameters
  maxSupply: string;
  initialSupply?: string;
}

export interface PriceCalculation {
  currentPrice: string;
  priceImpact: string;
  slippage: string;
  totalCost: string;
  tokensReceived: string;
  marketCap: string;
}

export interface CurveSimulation {
  points: Array<{
    supply: string;
    price: string;
    marketCap: string;
  }>;
  totalVolume: string;
  averagePrice: string;
  priceRange: {
    min: string;
    max: string;
  };
  complexityScore: number;
}

export class BondingCurveEngine {
  private readonly PRECISION = 18;
  private readonly WAD = BigNumber.from(10).pow(this.PRECISION);
  
  // Mathematical constants
  private readonly E = '2718281828459045235'; // e * 10^18
  private readonly LN2 = '693147180559945309'; // ln(2) * 10^18

  async calculateLinearPrice(supply: string, slope: string, intercept: string): Promise<string> {
    try {
      const supplyBN = BigNumber.from(supply);
      const slopeBN = BigNumber.from(slope);
      const interceptBN = BigNumber.from(intercept);
      
      // price = slope * supply + intercept
      const price = slopeBN.mul(supplyBN).div(this.WAD).add(interceptBN);
      
      return price.toString();
    } catch (error) {
      logger.error('Error calculating linear price', { supply, slope, intercept, error });
      throw new Error('Failed to calculate linear price');
    }
  }

  async calculateExponentialPrice(supply: string, base: string, exponent: string): Promise<string> {
    try {
      const supplyBN = BigNumber.from(supply);
      const baseBN = BigNumber.from(base);
      const exponentBN = BigNumber.from(exponent);
      
      // Simplified exponential: price = base * (1 + exponent/WAD)^(supply/WAD)
      // Using Taylor series approximation for computational efficiency
      const scaledSupply = supplyBN.mul(exponentBN).div(this.WAD);
      const exponentialTerm = this.approximateExp(scaledSupply.toString());
      const price = baseBN.mul(BigNumber.from(exponentialTerm)).div(this.WAD);
      
      return price.toString();
    } catch (error) {
      logger.error('Error calculating exponential price', { supply, base, exponent, error });
      throw new Error('Failed to calculate exponential price');
    }
  }

  async calculateLogarithmicPrice(supply: string, coefficient: string, constant: string): Promise<string> {
    try {
      const supplyBN = BigNumber.from(supply);
      const coefficientBN = BigNumber.from(coefficient);
      const constantBN = BigNumber.from(constant);
      
      // price = coefficient * ln(supply + 1) + constant
      const lnValue = this.approximateLn(supplyBN.add(this.WAD).toString());
      const price = coefficientBN.mul(BigNumber.from(lnValue)).div(this.WAD).add(constantBN);
      
      return price.toString();
    } catch (error) {
      logger.error('Error calculating logarithmic price', { supply, coefficient, constant, error });
      throw new Error('Failed to calculate logarithmic price');
    }
  }

  async calculateSigmoidPrice(supply: string, L: string, k: string, x0: string): Promise<string> {
    try {
      const supplyBN = BigNumber.from(supply);
      const LBN = BigNumber.from(L);
      const kBN = BigNumber.from(k);
      const x0BN = BigNumber.from(x0);
      
      // price = L / (1 + e^(-k * (supply - x0)))
      const exponent = kBN.mul(x0BN.sub(supplyBN)).div(this.WAD);
      const expValue = this.approximateExp(exponent.toString());
      const denominator = this.WAD.add(BigNumber.from(expValue));
      const price = LBN.mul(this.WAD).div(denominator);
      
      return price.toString();
    } catch (error) {
      logger.error('Error calculating sigmoid price', { supply, L, k, x0, error });
      throw new Error('Failed to calculate sigmoid price');
    }
  }

  async calculatePolynomialPrice(supply: string, coefficients: string[]): Promise<string> {
    try {
      const supplyBN = BigNumber.from(supply);
      let price = BigNumber.from(0);
      
      for (let i = 0; i < coefficients.length; i++) {
        const coefficient = BigNumber.from(coefficients[i]);
        const power = coefficients.length - 1 - i;
        
        if (power === 0) {
          price = price.add(coefficient);
        } else {
          const term = coefficient.mul(this.power(supplyBN, power)).div(this.WAD.pow(power - 1));
          price = price.add(term);
        }
      }
      
      return price.toString();
    } catch (error) {
      logger.error('Error calculating polynomial price', { supply, coefficients, error });
      throw new Error('Failed to calculate polynomial price');
    }
  }

  async calculatePrice(supply: string, curveParams: CurveParameters): Promise<string> {
    switch (curveParams.curveType) {
      case 'linear':
        return this.calculateLinearPrice(supply, curveParams.slope!, curveParams.intercept!);
      case 'exponential':
        return this.calculateExponentialPrice(supply, curveParams.base!, curveParams.exponent!);
      case 'logarithmic':
        return this.calculateLogarithmicPrice(supply, curveParams.coefficient!, curveParams.constant!);
      case 'sigmoid':
        return this.calculateSigmoidPrice(supply, curveParams.L!, curveParams.k!, curveParams.x0!);
      case 'polynomial':
        return this.calculatePolynomialPrice(supply, curveParams.coefficients!);
      default:
        throw new Error(`Unsupported curve type: ${curveParams.curveType}`);
    }
  }

  async calculatePriceImpact(
    buyAmount: string, 
    currentSupply: string, 
    curveParams: CurveParameters
  ): Promise<PriceCalculation> {
    try {
      const currentPrice = await this.calculatePrice(currentSupply, curveParams);
      const newSupply = BigNumber.from(currentSupply).add(buyAmount);
      const newPrice = await this.calculatePrice(newSupply.toString(), curveParams);
      
      const currentPriceBN = BigNumber.from(currentPrice);
      const newPriceBN = BigNumber.from(newPrice);
      
      // Calculate price impact: (newPrice - currentPrice) / currentPrice * 100
      const priceImpact = newPriceBN.sub(currentPriceBN).mul(10000).div(currentPriceBN); // Basis points
      
      // Calculate total cost using integral approximation
      const averagePrice = currentPriceBN.add(newPriceBN).div(2);
      const totalCost = averagePrice.mul(buyAmount).div(this.WAD);
      
      // Calculate market cap
      const marketCap = newPriceBN.mul(newSupply).div(this.WAD);
      
      return {
        currentPrice,
        priceImpact: priceImpact.toString(),
        slippage: priceImpact.toString(), // Simplified slippage calculation
        totalCost: totalCost.toString(),
        tokensReceived: buyAmount,
        marketCap: marketCap.toString()
      };
    } catch (error) {
      logger.error('Error calculating price impact', { buyAmount, currentSupply, error });
      throw new Error('Failed to calculate price impact');
    }
  }

  async simulateCurve(curveParams: CurveParameters, steps = 100): Promise<CurveSimulation> {
    try {
      const maxSupplyBN = BigNumber.from(curveParams.maxSupply);
      const stepSize = maxSupplyBN.div(steps);
      const points: Array<{ supply: string; price: string; marketCap: string }> = [];
      
      let minPrice = BigNumber.from(0);
      let maxPrice = BigNumber.from(0);
      let totalVolume = BigNumber.from(0);
      
      for (let i = 0; i <= steps; i++) {
        const supply = stepSize.mul(i);
        const price = await this.calculatePrice(supply.toString(), curveParams);
        const priceBN = BigNumber.from(price);
        const marketCap = priceBN.mul(supply).div(this.WAD);
        
        points.push({
          supply: supply.toString(),
          price: price.toString(),
          marketCap: marketCap.toString()
        });
        
        if (i === 0) {
          minPrice = priceBN;
          maxPrice = priceBN;
        } else {
          if (priceBN.lt(minPrice)) minPrice = priceBN;
          if (priceBN.gt(maxPrice)) maxPrice = priceBN;
        }
        
        totalVolume = totalVolume.add(marketCap);
      }
      
      const averagePrice = totalVolume.div(points.length);
      const complexityScore = this.calculateComplexityScore(curveParams);
      
      return {
        points,
        totalVolume: totalVolume.toString(),
        averagePrice: averagePrice.toString(),
        priceRange: {
          min: minPrice.toString(),
          max: maxPrice.toString()
        },
        complexityScore
      };
    } catch (error) {
      logger.error('Error simulating curve', { curveParams, error });
      throw new Error('Failed to simulate bonding curve');
    }
  }

  private calculateComplexityScore(curveParams: CurveParameters): number {
    let score = 0;
    
    switch (curveParams.curveType) {
      case 'linear':
        score = 1;
        break;
      case 'exponential':
        score = 3;
        break;
      case 'logarithmic':
        score = 3;
        break;
      case 'sigmoid':
        score = 4;
        break;
      case 'polynomial':
        score = 2 + (curveParams.degree || 1);
        break;
    }
    
    return score;
  }

  // Mathematical helper functions
  private approximateExp(x: string): string {
    // Taylor series approximation: e^x ≈ 1 + x + x²/2! + x³/3! + x⁴/4! + x⁵/5!
    const xBN = BigNumber.from(x);
    const WAD = this.WAD;
    
    let result = WAD; // 1
    let term = WAD;
    
    // Add up to 5 terms for reasonable accuracy
    for (let i = 1; i <= 5; i++) {
      term = term.mul(xBN).div(BigNumber.from(i)).div(WAD);
      result = result.add(term);
    }
    
    return result.toString();
  }

  private approximateLn(x: string): string {
    // Natural logarithm approximation using Taylor series around 1
    // ln(x) ≈ (x-1) - (x-1)²/2 + (x-1)³/3 - (x-1)⁴/4 + (x-1)⁵/5
    const xBN = BigNumber.from(x);
    const WAD = this.WAD;
    
    if (xBN.lte(0)) {
      throw new Error('Logarithm undefined for non-positive values');
    }
    
    const diff = xBN.sub(WAD); // x - 1
    let result = BigNumber.from(0);
    let term = diff;
    
    for (let i = 1; i <= 5; i++) {
      if (i % 2 === 1) {
        result = result.add(term.div(i));
      } else {
        result = result.sub(term.div(i));
      }
      term = term.mul(diff).div(WAD);
    }
    
    return result.toString();
  }

  private power(base: BigNumber, exponent: number): BigNumber {
    if (exponent === 0) return this.WAD;
    if (exponent === 1) return base;
    
    let result = this.WAD;
    for (let i = 0; i < exponent; i++) {
      result = result.mul(base).div(this.WAD);
    }
    
    return result;
  }

  async validateCurveParameters(curveParams: CurveParameters): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Validate max supply
      const maxSupplyBN = BigNumber.from(curveParams.maxSupply);
      if (maxSupplyBN.lte(0)) {
        errors.push('Max supply must be greater than 0');
      }
      
      // Validate curve-specific parameters
      switch (curveParams.curveType) {
        case 'linear':
          if (!curveParams.slope || !curveParams.intercept) {
            errors.push('Linear curve requires slope and intercept parameters');
          } else {
            const slope = BigNumber.from(curveParams.slope);
            if (slope.lte(0)) {
              warnings.push('Linear curve with non-positive slope will decrease over time');
            }
          }
          break;
          
        case 'exponential':
          if (!curveParams.base || !curveParams.exponent) {
            errors.push('Exponential curve requires base and exponent parameters');
          }
          break;
          
        case 'sigmoid':
          if (!curveParams.L || !curveParams.k || !curveParams.x0) {
            errors.push('Sigmoid curve requires L, k, and x0 parameters');
          }
          break;
          
        case 'polynomial':
          if (!curveParams.coefficients || curveParams.coefficients.length === 0) {
            errors.push('Polynomial curve requires coefficients array');
          }
          break;
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Invalid curve parameters format'],
        warnings: []
      };
    }
  }
}

export const bondingCurveEngine = new BondingCurveEngine();
