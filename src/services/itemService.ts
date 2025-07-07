import { ItemModel, ItemAttributes, ItemCreationAttributes } from '../models';

export class ItemService {
  /**
   * Get all active items
   */
  static async getAllItems(): Promise<ItemAttributes[]> {
    const items = await ItemModel.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
    });
    return items.map((item: ItemModel) => item.toJSON());
  }

  /**
   * Get item by ID
   */
  static async getItemById(id: number): Promise<ItemAttributes | null> {
    const item = await ItemModel.findByPk(id);
    if (!item) return null;
    return item.toJSON();
  }

  /**
   * Create a new item
   */
  static async createItem(itemData: ItemCreationAttributes): Promise<ItemAttributes> {
    const item = await ItemModel.create(itemData);
    return item.toJSON();
  }

  /**
   * Update item by ID
   */
  static async updateItem(id: number, updateData: Partial<ItemAttributes>): Promise<ItemAttributes | null> {
    const item = await ItemModel.findByPk(id);
    if (!item) {
      return null;
    }

    await item.update(updateData);
    return item.toJSON();
  }

  /**
   * Delete item by ID (soft delete by setting isActive to false)
   */
  static async deleteItem(id: number): Promise<boolean> {
    const item = await ItemModel.findByPk(id);
    if (!item) {
      return false;
    }

    await item.update({ isActive: false });
    return true;
  }

  /**
   * Get items by category
   */
  static async getItemsByCategory(category: string): Promise<ItemAttributes[]> {
    const items = await ItemModel.findAll({
      where: { 
        category,
        isActive: true 
      },
      order: [['name', 'ASC']],
    });
    return items.map((item: ItemModel) => item.toJSON());
  }

  /**
   * Search items by name or description
   */
  static async searchItems(searchTerm: string): Promise<ItemAttributes[]> {
    const { Op } = require('sequelize');
    const items = await ItemModel.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { description: { [Op.like]: `%${searchTerm}%` } }
        ]
      },
      order: [['name', 'ASC']],
    });
    return items.map((item: ItemModel) => item.toJSON());
  }

  /**
   * Update stock quantity
   */
  static async updateStock(id: number, quantity: number): Promise<ItemAttributes | null> {
    const item = await ItemModel.findByPk(id);
    if (!item) {
      return null;
    }

    const newStock = Math.max(0, item.stock + quantity);
    await item.update({ stock: newStock });
    return item.toJSON();
  }

  /**
   * Check if item exists by SKU
   */
  static async itemExistsBySku(sku: string): Promise<boolean> {
    const count = await ItemModel.count({
      where: { sku },
    });
    return count > 0;
  }

  /**
   * Check if item exists by barcode
   */
  static async itemExistsByBarcode(barcode: string): Promise<boolean> {
    const count = await ItemModel.count({
      where: { barcode },
    });
    return count > 0;
  }
} 