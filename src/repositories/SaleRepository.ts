import { SaleModel, SaleAttributes, SaleCreationAttributes } from '../models/SaleModel';
import { ISaleRepository } from './interfaces/ISaleRepository';
import { Op } from 'sequelize';

export class SaleRepository implements ISaleRepository {
  async findAllByBusiness(businessId: number): Promise<SaleAttributes[]> {
    const sales = await SaleModel.findAll({
      where: { businessId, isActive: true } as any,
      order: [['createdAt', 'DESC']],
    });
    return sales.map(sale => sale.toJSON());
  }

  async findById(id: number, businessId: number): Promise<SaleAttributes | null> {
    const sale = await SaleModel.findOne({ where: { id, businessId, isActive: true } as any });
    return sale ? sale.toJSON() : null;
  }

  async create(saleData: SaleCreationAttributes): Promise<SaleAttributes> {
    const sale = await SaleModel.create(saleData);
    return sale.toJSON();
  }

  async update(id: number, businessId: number, updateData: Partial<SaleAttributes>): Promise<SaleAttributes | null> {
    const sale = await SaleModel.findOne({ where: { id, businessId, isActive: true } as any });
    if (!sale) return null;
    await sale.update(updateData);
    return sale.toJSON();
  }

  async delete(id: number, businessId: number): Promise<boolean> {
    const sale = await SaleModel.findOne({ where: { id, businessId, isActive: true } as any });
    if (!sale) return false;
    await sale.update({ isActive: false } as any);
    return true;
  }

  async findByStatus(businessId: number, status: string): Promise<SaleAttributes[]> {
    const sales = await SaleModel.findAll({
      where: { businessId, status, isActive: true } as any,
      order: [['createdAt', 'DESC']],
    });
    return sales.map(sale => sale.toJSON());
  }

  async search(businessId: number, searchTerm: string): Promise<SaleAttributes[]> {
    const sales = await SaleModel.findAll({
      where: {
        businessId,
        isActive: true,
        [Op.or]: [
          { reference: { [Op.like]: `%${searchTerm}%` } },
          { customerName: { [Op.like]: `%${searchTerm}%` } },
        ],
      } as any,
      order: [['createdAt', 'DESC']],
    });
    return sales.map(sale => sale.toJSON());
  }

  async countByBusiness(businessId: number): Promise<number> {
    return await SaleModel.count({ where: { businessId, isActive: true } as any });
  }

  async getTotalRevenue(businessId: number): Promise<number> {
    if (!SaleModel.sequelize) {
      throw new Error('Sequelize instance is not available on SaleModel');
    }
    const result = await SaleModel.findOne({
      where: { businessId, isActive: true } as any,
      attributes: [[SaleModel.sequelize.fn('SUM', SaleModel.sequelize.col('total')), 'totalRevenue']],
      raw: true,
    });
    return Number((result as any)?.totalRevenue || 0);
  }
} 