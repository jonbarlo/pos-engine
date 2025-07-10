import { ItemAttributes, ItemCreationAttributes } from '../models/ItemModel';
import { logger } from '../utils/logger';
import { RepositoryFactory } from '../repositories/RepositoryFactory';

export class ItemService {
  static async getAllItems(businessId: number): Promise<ItemAttributes[]> {
    try {
      logger(`Getting all items for business: ${businessId}`);
      return await RepositoryFactory.getInstance().getItemRepository().findAllByBusiness(businessId);
    } catch (error) {
      logger(`Error getting items for business ${businessId}: ${error}`);
      throw error;
    }
  }

  static async getItemById(id: number, businessId: number): Promise<ItemAttributes | null> {
    try {
      logger(`Getting item ${id} for business: ${businessId}`);
      return await RepositoryFactory.getInstance().getItemRepository().findById(id, businessId);
    } catch (error) {
      logger(`Error getting item ${id} for business ${businessId}: ${error}`);
      throw error;
    }
  }

  static async createItem(itemData: ItemCreationAttributes): Promise<ItemAttributes> {
    try {
      logger(`Creating item for business: ${itemData.businessId}`);
      return await RepositoryFactory.getInstance().getItemRepository().create(itemData);
    } catch (error) {
      logger(`Error creating item for business ${itemData.businessId}: ${error}`);
      throw error;
    }
  }

  static async updateItem(id: number, businessId: number, updateData: Partial<ItemAttributes>): Promise<ItemAttributes | null> {
    try {
      logger(`Updating item ${id} for business: ${businessId}`);
      return await RepositoryFactory.getInstance().getItemRepository().update(id, businessId, updateData);
    } catch (error) {
      logger(`Error updating item ${id} for business ${businessId}: ${error}`);
      throw error;
    }
  }

  static async deleteItem(id: number, businessId: number): Promise<boolean> {
    try {
      logger(`Deleting item ${id} for business: ${businessId}`);
      return await RepositoryFactory.getInstance().getItemRepository().delete(id, businessId);
    } catch (error) {
      logger(`Error deleting item ${id} for business ${businessId}: ${error}`);
      throw error;
    }
  }

  static async getItemsByCategory(businessId: number, category: string): Promise<ItemAttributes[]> {
    try {
      logger(`Getting items by category ${category} for business: ${businessId}`);
      return await RepositoryFactory.getInstance().getItemRepository().findByCategory(businessId, category);
    } catch (error) {
      logger(`Error getting items by category ${category} for business ${businessId}: ${error}`);
      throw error;
    }
  }

  static async searchItems(businessId: number, searchTerm: string): Promise<ItemAttributes[]> {
    try {
      logger(`Searching items with term "${searchTerm}" for business: ${businessId}`);
      return await RepositoryFactory.getInstance().getItemRepository().search(businessId, searchTerm);
    } catch (error) {
      logger(`Error searching items for business ${businessId}: ${error}`);
      throw error;
    }
  }

  static async updateStock(id: number, businessId: number, quantity: number): Promise<ItemAttributes | null> {
    try {
      logger(`Updating stock for item ${id} in business: ${businessId}`);
      return await RepositoryFactory.getInstance().getItemRepository().updateStock(id, businessId, quantity);
    } catch (error) {
      logger(`Error updating stock for item ${id} in business ${businessId}: ${error}`);
      throw error;
    }
  }

  static async itemExistsBySku(sku: string, businessId: number): Promise<boolean> {
    try {
      return await RepositoryFactory.getInstance().getItemRepository().existsBySku(sku, businessId);
    } catch (error) {
      logger(`Error checking if item exists by SKU ${sku} in business ${businessId}: ${error}`);
      throw error;
    }
  }

  static async itemExistsByBarcode(barcode: string, businessId: number): Promise<boolean> {
    try {
      return await RepositoryFactory.getInstance().getItemRepository().existsByBarcode(barcode, businessId);
    } catch (error) {
      logger(`Error checking if item exists by barcode ${barcode} in business ${businessId}: ${error}`);
      throw error;
    }
  }

  static async getItemCount(businessId: number): Promise<number> {
    try {
      return await RepositoryFactory.getInstance().getItemRepository().countByBusiness(businessId);
    } catch (error) {
      logger(`Error getting item count for business ${businessId}: ${error}`);
      throw error;
    }
  }

  static async getLowStockItems(businessId: number, threshold: number = 10): Promise<ItemAttributes[]> {
    try {
      return await RepositoryFactory.getInstance().getItemRepository().getLowStockItems(businessId, threshold);
    } catch (error) {
      logger(`Error getting low stock items for business ${businessId}: ${error}`);
      throw error;
    }
  }
} 