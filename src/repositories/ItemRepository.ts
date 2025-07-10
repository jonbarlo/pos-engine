import { ItemModel, ItemAttributes, ItemCreationAttributes } from '../models/ItemModel';
import { IItemRepository } from './interfaces/IItemRepository';
import { Op } from 'sequelize';

export class ItemRepository implements IItemRepository {
  async findAllByBusiness(businessId: number): Promise<ItemAttributes[]> {
    const items = await ItemModel.findAll({
      where: { businessId, isActive: true },
      order: [['createdAt', 'DESC']],
    });
    return items.map(item => item.toJSON());
  }

  async findById(id: number, businessId: number): Promise<ItemAttributes | null> {
    const item = await ItemModel.findOne({ where: { id, businessId, isActive: true } });
    return item ? item.toJSON() : null;
  }

  async create(itemData: ItemCreationAttributes): Promise<ItemAttributes> {
    const item = await ItemModel.create(itemData);
    return item.toJSON();
  }

  async update(id: number, businessId: number, updateData: Partial<ItemAttributes>): Promise<ItemAttributes | null> {
    const item = await ItemModel.findOne({ where: { id, businessId, isActive: true } });
    if (!item) return null;
    await item.update(updateData);
    return item.toJSON();
  }

  async delete(id: number, businessId: number): Promise<boolean> {
    const item = await ItemModel.findOne({ where: { id, businessId, isActive: true } });
    if (!item) return false;
    await item.update({ isActive: false });
    return true;
  }

  async findByCategory(businessId: number, category: string): Promise<ItemAttributes[]> {
    const items = await ItemModel.findAll({
      where: { businessId, category, isActive: true },
      order: [['name', 'ASC']],
    });
    return items.map(item => item.toJSON());
  }

  async search(businessId: number, searchTerm: string): Promise<ItemAttributes[]> {
    const items = await ItemModel.findAll({
      where: {
        businessId,
        isActive: true,
        [Op.or]: [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { description: { [Op.like]: `%${searchTerm}%` } },
        ],
      },
      order: [['name', 'ASC']],
    });
    return items.map(item => item.toJSON());
  }

  async updateStock(id: number, businessId: number, quantity: number): Promise<ItemAttributes | null> {
    const item = await ItemModel.findOne({ where: { id, businessId, isActive: true } });
    if (!item) return null;
    const newStock = Math.max(0, item.stock + quantity);
    await item.update({ stock: newStock });
    return item.toJSON();
  }

  async existsBySku(sku: string, businessId: number): Promise<boolean> {
    const count = await ItemModel.count({ where: { sku, businessId, isActive: true } });
    return count > 0;
  }

  async existsByBarcode(barcode: string, businessId: number): Promise<boolean> {
    const count = await ItemModel.count({ where: { barcode, businessId, isActive: true } });
    return count > 0;
  }

  async countByBusiness(businessId: number): Promise<number> {
    return await ItemModel.count({ where: { businessId, isActive: true } });
  }

  async getLowStockItems(businessId: number, threshold: number = 10): Promise<ItemAttributes[]> {
    const items = await ItemModel.findAll({
      where: { businessId, isActive: true, stock: { [Op.lte]: threshold } },
      order: [['stock', 'ASC']],
    });
    return items.map(item => item.toJSON());
  }
} 