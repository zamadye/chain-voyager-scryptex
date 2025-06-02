
import { v4 as uuidv4 } from 'uuid';
import { databaseService } from './DatabaseService';
import { logger } from '../utils/logger';
import { User, UpdateUserData, ProfileData, UserWallet } from '../types/auth';

export class UserService {
  async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await databaseService.queryOne<User>(`
        SELECT * FROM users WHERE id = $1 AND is_active = TRUE
      `, [userId]);

      return user;
    } catch (error) {
      logger.error('Failed to get user by ID', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getUserByWallet(walletAddress: string): Promise<User | null> {
    try {
      const user = await databaseService.queryOne<User>(`
        SELECT u.* FROM users u
        JOIN user_wallets uw ON u.id = uw.user_id
        WHERE uw.wallet_address = $1 AND u.is_active = TRUE
      `, [walletAddress.toLowerCase()]);

      return user;
    } catch (error) {
      logger.error('Failed to get user by wallet', {
        walletAddress,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const user = await databaseService.queryOne<User>(`
        SELECT * FROM users WHERE username = $1 AND is_active = TRUE
      `, [username]);

      return user;
    } catch (error) {
      logger.error('Failed to get user by username', {
        username,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await databaseService.queryOne<User>(`
        SELECT * FROM users WHERE email = $1 AND is_active = TRUE
      `, [email]);

      return user;
    } catch (error) {
      logger.error('Failed to get user by email', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async updateUser(userId: string, updateData: UpdateUserData): Promise<User> {
    try {
      // Validate unique constraints
      if (updateData.username) {
        const existingUser = await this.getUserByUsername(updateData.username);
        if (existingUser && existingUser.id !== userId) {
          throw new Error('Username already taken');
        }
      }

      if (updateData.email) {
        const existingUser = await this.getUserByEmail(updateData.email);
        if (existingUser && existingUser.id !== userId) {
          throw new Error('Email already registered');
        }
      }

      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (updateData.username !== undefined) {
        updateFields.push(`username = $${paramCount++}`);
        updateValues.push(updateData.username);
      }

      if (updateData.email !== undefined) {
        updateFields.push(`email = $${paramCount++}`);
        updateValues.push(updateData.email);
      }

      if (updateData.bio !== undefined) {
        updateFields.push(`bio = $${paramCount++}`);
        updateValues.push(updateData.bio);
      }

      if (updateFields.length === 0) {
        throw new Error('No update data provided');
      }

      updateFields.push(`updated_at = NOW()`);
      updateValues.push(userId);

      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount} AND is_active = TRUE
        RETURNING *
      `;

      const updatedUser = await databaseService.queryOne<User>(query, updateValues);

      if (!updatedUser) {
        throw new Error('User not found or update failed');
      }

      logger.info('User updated successfully', { userId, updatedFields: Object.keys(updateData) });
      return updatedUser;
    } catch (error) {
      logger.error('Failed to update user', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async updateProfile(userId: string, profileData: ProfileData): Promise<User> {
    try {
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (profileData.username !== undefined) {
        // Validate username uniqueness
        if (profileData.username) {
          const existingUser = await this.getUserByUsername(profileData.username);
          if (existingUser && existingUser.id !== userId) {
            throw new Error('Username already taken');
          }
        }
        updateFields.push(`username = $${paramCount++}`);
        updateValues.push(profileData.username);
      }

      if (profileData.email !== undefined) {
        // Validate email uniqueness
        if (profileData.email) {
          const existingUser = await this.getUserByEmail(profileData.email);
          if (existingUser && existingUser.id !== userId) {
            throw new Error('Email already registered');
          }
        }
        updateFields.push(`email = $${paramCount++}`);
        updateValues.push(profileData.email);
      }

      if (profileData.bio !== undefined) {
        updateFields.push(`bio = $${paramCount++}`);
        updateValues.push(profileData.bio);
      }

      if (profileData.avatarUrl !== undefined) {
        updateFields.push(`avatar_url = $${paramCount++}`);
        updateValues.push(profileData.avatarUrl);
      }

      if (updateFields.length === 0) {
        throw new Error('No profile data provided');
      }

      updateFields.push(`updated_at = NOW()`);
      updateValues.push(userId);

      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount} AND is_active = TRUE
        RETURNING *
      `;

      const updatedUser = await databaseService.queryOne<User>(query, updateValues);

      if (!updatedUser) {
        throw new Error('User not found or profile update failed');
      }

      logger.info('User profile updated successfully', { userId });
      return updatedUser;
    } catch (error) {
      logger.error('Failed to update user profile', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getUserWallets(userId: string): Promise<UserWallet[]> {
    try {
      const wallets = await databaseService.query<UserWallet>(`
        SELECT * FROM user_wallets 
        WHERE user_id = $1 
        ORDER BY is_primary DESC, created_at ASC
      `, [userId]);

      return wallets;
    } catch (error) {
      logger.error('Failed to get user wallets', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getUserStats(userId: string): Promise<any> {
    try {
      const stats = await databaseService.queryOne(`
        SELECT 
          u.created_at as member_since,
          u.last_login,
          COUNT(uw.id) as wallet_count,
          COUNT(CASE WHEN uw.is_primary THEN 1 END) as primary_wallet_count,
          u.referral_code,
          COUNT(referrals.id) as referral_count
        FROM users u
        LEFT JOIN user_wallets uw ON u.id = uw.user_id
        LEFT JOIN users referrals ON u.id = referrals.referred_by
        WHERE u.id = $1 AND u.is_active = TRUE
        GROUP BY u.id, u.created_at, u.last_login, u.referral_code
      `, [userId]);

      return stats;
    } catch (error) {
      logger.error('Failed to get user stats', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async deactivateUser(userId: string): Promise<boolean> {
    try {
      const result = await databaseService.query(`
        UPDATE users 
        SET is_active = FALSE, updated_at = NOW()
        WHERE id = $1 AND is_active = TRUE
      `, [userId]);

      const success = result.length > 0;
      
      if (success) {
        logger.info('User deactivated successfully', { userId });
      }

      return success;
    } catch (error) {
      logger.error('Failed to deactivate user', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async reactivateUser(userId: string): Promise<boolean> {
    try {
      const result = await databaseService.query(`
        UPDATE users 
        SET is_active = TRUE, updated_at = NOW()
        WHERE id = $1 AND is_active = FALSE
      `, [userId]);

      const success = result.length > 0;
      
      if (success) {
        logger.info('User reactivated successfully', { userId });
      }

      return success;
    } catch (error) {
      logger.error('Failed to reactivate user', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async validateReferralCode(code: string): Promise<boolean> {
    try {
      const user = await databaseService.queryOne(`
        SELECT id FROM users WHERE referral_code = $1 AND is_active = TRUE
      `, [code]);

      return !!user;
    } catch (error) {
      logger.error('Failed to validate referral code', {
        code,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  async getUserByReferralCode(code: string): Promise<User | null> {
    try {
      const user = await databaseService.queryOne<User>(`
        SELECT * FROM users WHERE referral_code = $1 AND is_active = TRUE
      `, [code]);

      return user;
    } catch (error) {
      logger.error('Failed to get user by referral code', {
        code,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getUserReferrals(userId: string, limit: number = 50, offset: number = 0): Promise<User[]> {
    try {
      const referrals = await databaseService.query<User>(`
        SELECT * FROM users 
        WHERE referred_by = $1 AND is_active = TRUE
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      return referrals;
    } catch (error) {
      logger.error('Failed to get user referrals', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}

export const userService = new UserService();
