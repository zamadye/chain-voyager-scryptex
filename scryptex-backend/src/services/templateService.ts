
import { prisma } from '@/config/database';
import { redis } from '@/config/redis';
import { logger } from '@/utils/logger';

export interface CreateTemplateParams {
  name: string;
  description: string;
  category: string;
  solidityCode: string;
  parameters: any[];
  tags?: string[];
  isActive?: boolean;
}

export class TemplateService {
  /**
   * Get all contract templates
   */
  async getAllTemplates(includeInactive = false) {
    try {
      const cacheKey = `templates:all:${includeInactive}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const templates = await prisma.contractTemplate.findMany({
        where: includeInactive ? {} : { isActive: true },
        include: {
          _count: {
            select: {
              deployments: true
            }
          }
        },
        orderBy: [
          { category: 'asc' },
          { name: 'asc' }
        ]
      });

      const result = templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        parameters: template.parameters,
        tags: template.tags,
        isActive: template.isActive,
        deploymentCount: template._count.deployments,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      }));

      // Cache for 10 minutes
      await redis.setex(cacheKey, 600, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error('Error getting all templates', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId: string) {
    try {
      const cacheKey = `template:${templateId}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const template = await prisma.contractTemplate.findUnique({
        where: { id: templateId },
        include: {
          _count: {
            select: {
              deployments: true
            }
          }
        }
      });

      if (!template) {
        return null;
      }

      const result = {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        solidityCode: template.solidityCode,
        parameters: template.parameters,
        tags: template.tags,
        isActive: template.isActive,
        deploymentCount: template._count.deployments,
        gasEstimate: template.gasEstimate,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      };

      // Cache for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error('Error getting template by ID', {
        templateId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string) {
    try {
      const cacheKey = `templates:category:${category}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const templates = await prisma.contractTemplate.findMany({
        where: {
          category,
          isActive: true
        },
        include: {
          _count: {
            select: {
              deployments: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      const result = templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        parameters: template.parameters,
        tags: template.tags,
        deploymentCount: template._count.deployments,
        gasEstimate: template.gasEstimate
      }));

      // Cache for 15 minutes
      await redis.setex(cacheKey, 900, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error('Error getting templates by category', {
        category,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Create new template
   */
  async createTemplate(params: CreateTemplateParams) {
    try {
      const template = await prisma.contractTemplate.create({
        data: {
          name: params.name,
          description: params.description,
          category: params.category,
          solidityCode: params.solidityCode,
          parameters: params.parameters,
          tags: params.tags || [],
          isActive: params.isActive ?? true
        }
      });

      // Invalidate cache
      await this.invalidateTemplateCache();

      logger.info('Template created successfully', {
        templateId: template.id,
        name: template.name,
        category: template.category
      });

      return template;
    } catch (error) {
      logger.error('Error creating template', {
        name: params.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Update template
   */
  async updateTemplate(templateId: string, updates: Partial<CreateTemplateParams>) {
    try {
      const template = await prisma.contractTemplate.update({
        where: { id: templateId },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });

      // Invalidate cache
      await this.invalidateTemplateCache(templateId);

      logger.info('Template updated successfully', {
        templateId,
        updates: Object.keys(updates)
      });

      return template;
    } catch (error) {
      logger.error('Error updating template', {
        templateId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId: string) {
    try {
      // Soft delete by setting isActive to false
      const template = await prisma.contractTemplate.update({
        where: { id: templateId },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

      // Invalidate cache
      await this.invalidateTemplateCache(templateId);

      logger.info('Template deleted successfully', {
        templateId
      });

      return template;
    } catch (error) {
      logger.error('Error deleting template', {
        templateId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Search templates
   */
  async searchTemplates(query: string, category?: string) {
    try {
      const where = {
        isActive: true,
        ...(category && { category }),
        OR: [
          { name: { contains: query, mode: 'insensitive' as const } },
          { description: { contains: query, mode: 'insensitive' as const } },
          { tags: { has: query } }
        ]
      };

      const templates = await prisma.contractTemplate.findMany({
        where,
        include: {
          _count: {
            select: {
              deployments: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      return templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        parameters: template.parameters,
        tags: template.tags,
        deploymentCount: template._count.deployments,
        gasEstimate: template.gasEstimate
      }));
    } catch (error) {
      logger.error('Error searching templates', {
        query,
        category,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get template categories
   */
  async getCategories() {
    try {
      const cacheKey = 'template:categories';
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const categories = await prisma.contractTemplate.groupBy({
        by: ['category'],
        where: { isActive: true },
        _count: {
          id: true
        },
        orderBy: {
          category: 'asc'
        }
      });

      const result = categories.map(cat => ({
        name: cat.category,
        count: cat._count.id
      }));

      // Cache for 1 hour
      await redis.setex(cacheKey, 3600, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error('Error getting template categories', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Invalidate template cache
   */
  private async invalidateTemplateCache(templateId?: string) {
    try {
      const keys = [
        'templates:all:true',
        'templates:all:false',
        'template:categories'
      ];

      if (templateId) {
        keys.push(`template:${templateId}`);
      }

      // Get all category cache keys
      const categoryKeys = await redis.keys('templates:category:*');
      keys.push(...categoryKeys);

      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.warn('Error invalidating template cache', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const templateService = new TemplateService();
