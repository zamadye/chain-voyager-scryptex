
import Joi from 'joi';

// Ethereum address validation regex
const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;

export const challengeSchema = Joi.object({
  walletAddress: Joi.string()
    .pattern(ethereumAddressRegex)
    .required()
    .messages({
      'string.pattern.base': 'Invalid Ethereum wallet address format',
      'any.required': 'Wallet address is required'
    })
});

export const verifySignatureSchema = Joi.object({
  walletAddress: Joi.string()
    .pattern(ethereumAddressRegex)
    .required()
    .messages({
      'string.pattern.base': 'Invalid Ethereum wallet address format',
      'any.required': 'Wallet address is required'
    }),
  signature: Joi.string()
    .required()
    .messages({
      'any.required': 'Signature is required'
    }),
  challenge: Joi.string()
    .required()
    .messages({
      'any.required': 'Challenge is required'
    })
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .optional()
    .messages({
      'string.base': 'Refresh token must be a string'
    })
});

export const updateProfileSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .optional()
    .messages({
      'string.alphanum': 'Username must contain only alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters'
    }),
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Invalid email format'
    }),
  bio: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Bio cannot exceed 500 characters'
    }),
  avatarUrl: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Avatar URL must be a valid URI'
    })
});

export const addWalletSchema = Joi.object({
  address: Joi.string()
    .pattern(ethereumAddressRegex)
    .required()
    .messages({
      'string.pattern.base': 'Invalid Ethereum wallet address format',
      'any.required': 'Wallet address is required'
    }),
  type: Joi.string()
    .valid('metamask', 'walletconnect', 'coinbase')
    .required()
    .messages({
      'any.only': 'Wallet type must be one of: metamask, walletconnect, coinbase',
      'any.required': 'Wallet type is required'
    }),
  chainId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Chain ID must be a number',
      'number.integer': 'Chain ID must be an integer',
      'number.positive': 'Chain ID must be positive'
    }),
  nickname: Joi.string()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Nickname cannot exceed 50 characters'
    })
});

export const walletAddressParamSchema = Joi.object({
  walletAddress: Joi.string()
    .pattern(ethereumAddressRegex)
    .required()
    .messages({
      'string.pattern.base': 'Invalid Ethereum wallet address format',
      'any.required': 'Wallet address is required'
    })
});

// General validation schemas
export const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    })
});

export const uuidParamSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Invalid UUID format',
      'any.required': 'ID is required'
    })
});

// File upload validation
export const uploadSchema = Joi.object({
  mimetype: Joi.string()
    .valid('image/jpeg', 'image/png', 'image/webp', 'image/gif')
    .required()
    .messages({
      'any.only': 'File must be a valid image format (jpeg, png, webp, gif)',
      'any.required': 'File type is required'
    }),
  size: Joi.number()
    .max(5 * 1024 * 1024) // 5MB
    .required()
    .messages({
      'number.max': 'File size cannot exceed 5MB',
      'any.required': 'File size is required'
    })
});

export const referralCodeSchema = Joi.object({
  code: Joi.string()
    .pattern(/^STEX-[A-Z0-9]{6}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid referral code format',
      'any.required': 'Referral code is required'
    })
});
