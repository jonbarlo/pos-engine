import { BusinessModel, BusinessAttributes, BusinessCreationAttributes } from '../models/BusinessModel';
import { Op } from 'sequelize';
import { logger } from '../utils/logger';
import { getBusinessRepository } from '../repositories/RepositoryFactory';

export class BusinessService {
  // Create a new business
  static async createBusiness(businessData: BusinessCreationAttributes): Promise<BusinessAttributes> {
    try {
      logger(`Creating new business: ${businessData.name}`);
      const businessRepository = getBusinessRepository();
      const business = await businessRepository.create(businessData);
      logger(`Business created successfully with ID: ${business.id}`);
      return business;
    } catch (error) {
      logger(`Error creating business: ${error}`);
      throw error;
    }
  }

  // Get business by ID
  static async getBusinessById(id: number): Promise<BusinessAttributes | null> {
    try {
      logger(`Getting business by ID: ${id}`);
      const businessRepository = getBusinessRepository();
      return await businessRepository.findById(id);
    } catch (error) {
      logger(`Error getting business by ID: ${error}`);
      throw error;
    }
  }

  // Get business by slug
  static async getBusinessBySlug(slug: string): Promise<BusinessAttributes | null> {
    try {
      logger(`Getting business by slug: ${slug}`);
      const businessRepository = getBusinessRepository();
      return await businessRepository.findBySlug(slug);
    } catch (error) {
      logger(`Error getting business by slug: ${error}`);
      throw error;
    }
  }

  // Get all active businesses
  static async getAllActiveBusinesses(): Promise<BusinessAttributes[]> {
    try {
      logger('Getting all active businesses');
      const businessRepository = getBusinessRepository();
      return await businessRepository.findActive();
    } catch (error) {
      logger(`Error getting all businesses: ${error}`);
      throw error;
    }
  }

  // Get all businesses (including inactive)
  static async getAllBusinesses(): Promise<BusinessAttributes[]> {
    try {
      logger('Getting all businesses');
      const businessRepository = getBusinessRepository();
      return await businessRepository.findAll();
    } catch (error) {
      logger(`Error getting all businesses: ${error}`);
      throw error;
    }
  }

  // Update business
  static async updateBusiness(id: number, updateData: Partial<BusinessAttributes>): Promise<BusinessAttributes | null> {
    try {
      logger(`Updating business with ID: ${id}`);
      const businessRepository = getBusinessRepository();
      const business = await businessRepository.findById(id);
      if (!business) {
        return null;
      }
      
      const updated = await businessRepository.update(id, updateData);
      logger(`Business updated successfully: ${id}`);
      return updated;
    } catch (error) {
      logger(`Error updating business: ${error}`);
      throw error;
    }
  }

  // Delete business (soft delete by setting isActive to false)
  static async deleteBusiness(id: number): Promise<boolean> {
    try {
      logger(`Deleting business with ID: ${id}`);
      const businessRepository = getBusinessRepository();
      const business = await businessRepository.findById(id);
      if (!business) {
        return false;
      }
      
      await businessRepository.updateStatus(id, false);
      logger(`Business deleted successfully: ${id}`);
      return true;
    } catch (error) {
      logger(`Error deleting business: ${error}`);
      throw error;
    }
  }

  // Check if business exists by slug
  static async businessExistsBySlug(slug: string): Promise<boolean> {
    try {
      const businessRepository = getBusinessRepository();
      return await businessRepository.slugExists(slug);
    } catch (error) {
      logger(`Error checking if business exists by slug: ${error}`);
      throw error;
    }
  }

  // Get business statistics
  static async getBusinessStats(businessId: number): Promise<any> {
    try {
      logger(`Getting business stats for ID: ${businessId}`);
      
      // Get basic business info
      const businessRepository = getBusinessRepository();
      const business = await businessRepository.findById(businessId);
      if (!business) {
        return null;
      }

      // Get counts using separate queries for better performance
      const { UserModel, ItemModel, SaleModel } = BusinessModel.sequelize?.models as any;
      
      const userCount = await UserModel.count({ where: { businessId, isActive: true } });
      const itemCount = await ItemModel.count({ where: { businessId, isActive: true } });
      const totalSales = await SaleModel.count({ where: { businessId } });
      const completedSales = await SaleModel.count({ 
        where: { businessId, status: 'completed' } 
      });
      
      // Get total revenue
      const revenueResult = await SaleModel.findOne({
        where: { businessId, status: 'completed' },
        attributes: [
          [BusinessModel.sequelize?.fn('SUM', BusinessModel.sequelize?.col('total')), 'totalRevenue']
        ],
        raw: true
      });
      
      const totalRevenue = parseFloat(revenueResult?.totalRevenue?.toString() || '0');

      return {
        businessId,
        businessName: business.name,
        totalUsers: userCount,
        activeUsers: userCount,
        totalItems: itemCount,
        activeItems: itemCount,
        totalSales,
        completedSales,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        currencyId: business.currencyId,
        taxRate: business.taxRate
      };
    } catch (error) {
      logger(`Error getting business stats: ${error}`);
      throw error;
    }
  }

  // Search businesses
  static async searchBusinesses(query: string): Promise<BusinessAttributes[]> {
    try {
      logger(`Searching businesses with query: ${query}`);
      const businessRepository = getBusinessRepository();
      return await businessRepository.search(query);
    } catch (error) {
      logger(`Error searching businesses: ${error}`);
      throw error;
    }
  }

  // Get businesses by timezone
  static async getBusinessesByTimezone(timezone: string): Promise<BusinessAttributes[]> {
    try {
      logger(`Getting businesses by timezone: ${timezone}`);
      const businessRepository = getBusinessRepository();
      return await businessRepository.findAll({
        where: { timezone, isActive: true },
        order: [['name', 'ASC']]
      });
    } catch (error) {
      logger(`Error getting businesses by timezone: ${error}`);
      throw error;
    }
  }

  // Get businesses by currency
  static async getBusinessesByCurrency(currencyId: number): Promise<BusinessAttributes[]> {
    try {
      logger(`Getting businesses by currency ID: ${currencyId}`);
      const businessRepository = getBusinessRepository();
      return await businessRepository.findAll({
        where: { currencyId, isActive: true },
        order: [['name', 'ASC']]
      });
    } catch (error) {
      logger(`Error getting businesses by currency ID: ${error}`);
      throw error;
    }
  }

  // Get business statistics for all businesses
  static async getAllBusinessStats(): Promise<any> {
    try {
      logger('Getting statistics for all businesses');
      const businessRepository = getBusinessRepository();
      return await businessRepository.getStatistics();
    } catch (error) {
      logger(`Error getting all business stats: ${error}`);
      throw error;
    }
  }

  // Get public business information by slug (no authentication required)
  static async getPublicBusinessBySlug(slug: string): Promise<BusinessAttributes | null> {
    try {
      logger(`Getting public business info by slug: ${slug}`);
      
      const business = await BusinessModel.findOne({
        where: { 
          slug: slug,
          isActive: true 
        },
        attributes: [
          'id', 'name', 'slug', 'description', 'logo', 'primaryColor', 
          'secondaryColor', 'address', 'phone', 'email', 'website', 
          'taxRate', 'currencyId', 'timezone', 'type', 'isActive'
        ]
      });

      return business;
    } catch (error) {
      logger(`Error getting public business by slug: ${error}`);
      throw error;
    }
  }
} 