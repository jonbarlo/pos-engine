import { BusinessModel, BusinessAttributes, BusinessCreationAttributes } from '../models';
import { Op } from 'sequelize';
import { logger } from '../utils/logger';

export class BusinessService {
  // Create a new business
  static async createBusiness(businessData: BusinessCreationAttributes): Promise<BusinessModel> {
    try {
      logger(`Creating new business: ${businessData.name}`);
      const business = await BusinessModel.create(businessData);
      logger(`Business created successfully with ID: ${business.id}`);
      return business;
    } catch (error) {
      logger(`Error creating business: ${error}`);
      throw error;
    }
  }

  // Get business by ID
  static async getBusinessById(id: number): Promise<BusinessModel | null> {
    try {
      logger(`Getting business by ID: ${id}`);
      const business = await BusinessModel.findByPk(id);
      return business;
    } catch (error) {
      logger(`Error getting business by ID: ${error}`);
      throw error;
    }
  }

  // Get business by slug
  static async getBusinessBySlug(slug: string): Promise<BusinessModel | null> {
    try {
      logger(`Getting business by slug: ${slug}`);
      const business = await BusinessModel.findOne({
        where: { slug, isActive: true }
      });
      return business;
    } catch (error) {
      logger(`Error getting business by slug: ${error}`);
      throw error;
    }
  }

  // Get all active businesses
  static async getAllActiveBusinesses(): Promise<BusinessModel[]> {
    try {
      logger('Getting all active businesses');
      const businesses = await BusinessModel.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']]
      });
      return businesses;
    } catch (error) {
      logger(`Error getting all businesses: ${error}`);
      throw error;
    }
  }

  // Get all businesses (including inactive)
  static async getAllBusinesses(): Promise<BusinessModel[]> {
    try {
      logger('Getting all businesses');
      const businesses = await BusinessModel.findAll({
        order: [['name', 'ASC']]
      });
      return businesses;
    } catch (error) {
      logger(`Error getting all businesses: ${error}`);
      throw error;
    }
  }

  // Update business
  static async updateBusiness(id: number, updateData: Partial<BusinessAttributes>): Promise<BusinessModel | null> {
    try {
      logger(`Updating business with ID: ${id}`);
      const business = await BusinessModel.findByPk(id);
      if (!business) {
        return null;
      }
      
      await business.update(updateData);
      logger(`Business updated successfully: ${id}`);
      return business;
    } catch (error) {
      logger(`Error updating business: ${error}`);
      throw error;
    }
  }

  // Delete business (soft delete by setting isActive to false)
  static async deleteBusiness(id: number): Promise<boolean> {
    try {
      logger(`Deleting business with ID: ${id}`);
      const business = await BusinessModel.findByPk(id);
      if (!business) {
        return false;
      }
      
      await business.update({ isActive: false });
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
      const business = await BusinessModel.findOne({
        where: { slug }
      });
      return !!business;
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
      const business = await BusinessModel.findByPk(businessId);
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
        currency: business.currency,
        taxRate: business.taxRate
      };
    } catch (error) {
      logger(`Error getting business stats: ${error}`);
      throw error;
    }
  }

  // Search businesses
  static async searchBusinesses(query: string): Promise<BusinessModel[]> {
    try {
      logger(`Searching businesses with query: ${query}`);
      const businesses = await BusinessModel.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${query}%` } },
            { slug: { [Op.iLike]: `%${query}%` } },
            { description: { [Op.iLike]: `%${query}%` } }
          ],
          isActive: true
        },
        order: [['name', 'ASC']]
      });
      return businesses;
    } catch (error) {
      logger(`Error searching businesses: ${error}`);
      throw error;
    }
  }

  // Get businesses by timezone
  static async getBusinessesByTimezone(timezone: string): Promise<BusinessModel[]> {
    try {
      logger(`Getting businesses by timezone: ${timezone}`);
      const businesses = await BusinessModel.findAll({
        where: { timezone, isActive: true },
        order: [['name', 'ASC']]
      });
      return businesses;
    } catch (error) {
      logger(`Error getting businesses by timezone: ${error}`);
      throw error;
    }
  }

  // Get businesses by currency
  static async getBusinessesByCurrency(currency: string): Promise<BusinessModel[]> {
    try {
      logger(`Getting businesses by currency: ${currency}`);
      const businesses = await BusinessModel.findAll({
        where: { currency, isActive: true },
        order: [['name', 'ASC']]
      });
      return businesses;
    } catch (error) {
      logger(`Error getting businesses by currency: ${error}`);
      throw error;
    }
  }
} 