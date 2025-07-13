import { SaleService } from './saleService';
import { SaleAttributes, SaleCreationAttributes } from '../models/SaleModel';
import { RepositoryFactory } from '../repositories/RepositoryFactory';

jest.mock('../utils/logger', () => ({
  logger: jest.fn(),
}));

describe('SaleService', () => {
  let mockSaleRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSaleRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAllByBusiness: jest.fn(),
    };
    jest.spyOn(RepositoryFactory, 'getInstance').mockReturnValue({ getSaleRepository: () => mockSaleRepository } as any);
  });

  it('should create a sale', async () => {
    const saleData = { userId: 1, businessId: 1, totalAmount: 100 } as SaleCreationAttributes;
    const created = { id: 1, saleNumber: 'SALE-BIZ-2024-001', ...saleData, isActive: true } as any;
    mockSaleRepository.create.mockResolvedValue(created);
    const result = await SaleService.createSale(saleData);
    expect(mockSaleRepository.create).toHaveBeenCalledWith(saleData);
    expect(result).toEqual(created);
  });

  it('should get sale by id with business id', async () => {
    const sale = { id: 1, businessId: 1, userId: 1, saleNumber: 'SALE-BIZ-2024-001', isActive: true } as any;
    mockSaleRepository.findById.mockResolvedValue(sale);
    const result = await SaleService.getSaleById(1, 1);
    expect(mockSaleRepository.findById).toHaveBeenCalledWith(1, 1);
    expect(result).toEqual(sale);
  });

  it('should update a sale', async () => {
    const updated = { id: 1, businessId: 1, userId: 1, saleNumber: 'SALE-BIZ-2024-001', isActive: true } as any;
    mockSaleRepository.update.mockResolvedValue(updated);
    const result = await SaleService.updateSale(1, 1, { userId: 1 });
    expect(mockSaleRepository.update).toHaveBeenCalledWith(1, 1, { userId: 1 });
    expect(result).toEqual(updated);
  });

  it('should delete a sale', async () => {
    mockSaleRepository.delete.mockResolvedValue(true);
    const result = await SaleService.deleteSale(1, 1);
    expect(mockSaleRepository.delete).toHaveBeenCalledWith(1, 1);
    expect(result).toBe(true);
  });

  it('should get sales by user', async () => {
    const sales = [
      { id: 1, businessId: 1, userId: 1, saleNumber: 'SALE-BIZ-2024-001', isActive: true },
      { id: 2, businessId: 1, userId: 1, saleNumber: 'SALE-BIZ-2024-002', isActive: true }
    ] as any[];
    mockSaleRepository.findAllByBusiness.mockResolvedValue(sales);
    const result = await SaleService.getSalesByUser(1, 1);
    expect(mockSaleRepository.findAllByBusiness).toHaveBeenCalledWith(1);
    expect(result).toEqual(sales);
  });

  it('should get sales by date range', async () => {
    const sales = [
      { id: 1, businessId: 1, userId: 1, saleNumber: 'SALE-BIZ-2024-001', createdAt: new Date('2023-01-01'), isActive: true }
    ] as any[];
    mockSaleRepository.findAllByBusiness.mockResolvedValue(sales);
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-01-31');
    const result = await SaleService.getSalesByDateRange(startDate, endDate, 1);
    expect(mockSaleRepository.findAllByBusiness).toHaveBeenCalledWith(1);
    expect(result).toEqual(sales);
  });
}); 