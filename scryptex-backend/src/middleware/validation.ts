
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { logger } from '../utils/logger';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation failed', {
      errors: errors.array(),
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params
    });

    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
    return;
  }

  next();
};

export const validateWalletAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const validateBridgeAmount = (amount: string): boolean => {
  try {
    const num = BigInt(amount);
    return num > 0;
  } catch {
    return false;
  }
};

export const validateChainId = (chainId: number): boolean => {
  const supportedChains = [1, 11155111, 6342, 11155931]; // Ethereum, Sepolia, MegaETH, RiseChain
  return supportedChains.includes(chainId);
};
