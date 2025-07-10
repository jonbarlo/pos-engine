import { ItemModel, ItemAttributes, ItemCreationAttributes } from '../models/ItemModel';
import { logger } from '../utils/logger';

export class ItemService {
  /**
   * Get all active items for a specific business
   */
  static async getAllItems(businessId: number): Promise<ItemAttributes[]> {
    try {
      logger(`Getting all items for business: ${businessId}`);
      const items = await ItemModel.findAll({
        where: { businessId, isActive: true },
        order: [['createdAt', 'DESC']],
      });
      return items.map((item: ItemModel) => item.toJSON());
    } catch (error) {
      logger(`Error getting items for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get item by ID within a business
   */
  static async getItemById(id: number, businessId: number): Promise<ItemAttributes | null> {
    try {
      logger(`Getting item ${id} for business: ${businessId}`);
      const item = await ItemModel.findOne({
        where: { id, businessId, isActive: true }
      });
      if (!item) return null;
      return item.toJSON();
    } catch (error) {
      logger(`Error getting item ${id} for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Create a new item for a business
   */
  static async createItem(itemData: ItemCreationAttributes): Promise<ItemAttributes> {
    try {
      logger(`Creating item for business: ${itemData.businessId}`);
      const item = await ItemModel.create(itemData);
      return item.toJSON();
    } catch (error) {
      logger(`Error creating item for business ${itemData.businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Update item by ID within a business
   */
  static async updateItem(id: number, businessId: number, updateData: Partial<ItemAttributes>): Promise<ItemAttributes | null> {
    try {
      logger(`Updating item ${id} for business: ${businessId}`);
      const item = await ItemModel.findOne({
        where: { id, businessId, isActive: true }
      });
      if (!item) {
        return null;
      }

      await item.update(updateData);
      return item.toJSON();
    } catch (error) {
      logger(`Error updating item ${id} for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Delete item by ID within a business (soft delete)
   */
  static async deleteItem(id: number, businessId: number): Promise<boolean> {
    try {
      logger(`Deleting item ${id} for business: ${businessId}`);
      const item = await ItemModel.findOne({
        where: { id, businessId, isActive: true }
      });
      if (!item) {
        return false;
      }

      await item.update({ isActive: false });
      return true;
    } catch (error) {
      logger(`Error deleting item ${id} for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get items by category within a business
   */
  static async getItemsByCategory(businessId: number, category: string): Promise<ItemAttributes[]> {
    try {
      logger(`Getting items by category ${category} for business: ${businessId}`);
      const items = await ItemModel.findAll({
        where: { 
          businessId,
          category,
          isActive: true 
        },
        order: [['name', 'ASC']],
      });
      return items.map((item: ItemModel) => item.toJSON());
    } catch (error) {
      logger(`Error getting items by category ${category} for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Search items by name or description within a business
   */
  static async searchItems(businessId: number, searchTerm: string): Promise<ItemAttributes[]> {
    try {
      logger(`Searching items with term "${searchTerm}" for business: ${businessId}`);
      const { Op } = require('sequelize');
      const items = await ItemModel.findAll({
        where: {
          businessId,
          isActive: true,
          [Op.or]: [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { description: { [Op.like]: `%${searchTerm}%` } }
          ]
        },
        order: [['name', 'ASC']],
      });
      return items.map((item: ItemModel) => item.toJSON());
    } catch (error) {
      logger(`Error searching items for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Update stock quantity within a business
   */
  static async updateStock(id: number, businessId: number, quantity: number): Promise<ItemAttributes | null> {
    try {
      logger(`Updating stock for item ${id} in business: ${businessId}`);
      const item = await ItemModel.findOne({
        where: { id, businessId, isActive: true }
      });
      if (!item) {
        return null;
      }

      const newStock = Math.max(0, item.stock + quantity);
      await item.update({ stock: newStock });
      return item.toJSON();
    } catch (error) {
      logger(`Error updating stock for item ${id} in business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Check if item exists by SKU within a business
   */
  static async itemExistsBySku(sku: string, businessId: number): Promise<boolean> {
    try {
      const count = await ItemModel.count({
        where: { sku, businessId, isActive: true },
      });
      return count > 0;
    } catch (error) {
      logger(`Error checking if item exists by SKU ${sku} in business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Check if item exists by barcode within a business
   */
  static async itemExistsByBarcode(barcode: string, businessId: number): Promise<boolean> {
    try {
      const count = await ItemModel.count({
        where: { barcode, businessId, isActive: true },
      });
      return count > 0;
    } catch (error) {
      logger(`Error checking if item exists by barcode ${barcode} in business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get item count by business
   */
  static async getItemCount(businessId: number): Promise<number> {
    try {
      return await ItemModel.count({
        where: { businessId, isActive: true }
      });
    } catch (error) {
      logger(`Error getting item count for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get low stock items for a business
   */
  static async getLowStockItems(businessId: number, threshold: number = 10): Promise<ItemAttributes[]> {
    try {
      logger(`Getting low stock items (threshold: ${threshold}) for business: ${businessId}`);
      const items = await ItemModel.findAll({
        where: { 
          businessId,
          isActive: true,
          stock: { [require('sequelize').Op.lte]: threshold }
        },
        order: [['stock', 'ASC']],
      });
      return items.map((item: ItemModel) => item.toJSON());
    } catch (error) {
      logger(`Error getting low stock items for business ${businessId}: ${error}`);
      throw error;
    }
  }
} 