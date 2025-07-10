import { ItemService } from './itemService';
import { ItemAttributes, ItemCreationAttributes } from '../models/ItemModel';
import { RepositoryFactory } from '../repositories/RepositoryFactory';

jest.mock('../utils/logger', () => ({
  logger: jest.fn(),
}));

describe('ItemService', () => {
  let mockItemRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockItemRepository = {
      findAllByBusiness: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByCategory: jest.fn(),
      search: jest.fn(),
      updateStock: jest.fn(),
      existsBySku: jest.fn(),
      existsByBarcode: jest.fn(),
      countByBusiness: jest.fn(),
      getLowStockItems: jest.fn(),
    };
    jest.spyOn(RepositoryFactory, 'getInstance').mockReturnValue({ getItemRepository: () => mockItemRepository } as any);
  });

  it('should get all items for a business', async () => {
    const businessId = 1;
    const items: ItemAttributes[] = [
      { id: 1, businessId, name: 'Item 1', isActive: true } as ItemAttributes,
      { id: 2, businessId, name: 'Item 2', isActive: true } as ItemAttributes,
    ];
    mockItemRepository.findAllByBusiness.mockResolvedValue(items);
    const result = await ItemService.getAllItems(businessId);
    expect(mockItemRepository.findAllByBusiness).toHaveBeenCalledWith(businessId);
    expect(result).toEqual(items);
  });

  it('should get item by id', async () => {
    const item = { id: 1, businessId: 1, name: 'Item 1', isActive: true } as ItemAttributes;
    mockItemRepository.findById.mockResolvedValue(item);
    const result = await ItemService.getItemById(1, 1);
    expect(mockItemRepository.findById).toHaveBeenCalledWith(1, 1);
    expect(result).toEqual(item);
  });

  it('should create an item', async () => {
    const itemData = { name: 'New Item', businessId: 1 } as ItemCreationAttributes;
    const created = { id: 1, ...itemData, isActive: true } as ItemAttributes;
    mockItemRepository.create.mockResolvedValue(created);
    const result = await ItemService.createItem(itemData);
    expect(mockItemRepository.create).toHaveBeenCalledWith(itemData);
    expect(result).toEqual(created);
  });

  it('should update an item', async () => {
    const updated = { id: 1, businessId: 1, name: 'Updated', isActive: true } as ItemAttributes;
    mockItemRepository.update.mockResolvedValue(updated);
    const result = await ItemService.updateItem(1, 1, { name: 'Updated' });
    expect(mockItemRepository.update).toHaveBeenCalledWith(1, 1, { name: 'Updated' });
    expect(result).toEqual(updated);
  });

  it('should delete an item', async () => {
    mockItemRepository.delete.mockResolvedValue(true);
    const result = await ItemService.deleteItem(1, 1);
    expect(mockItemRepository.delete).toHaveBeenCalledWith(1, 1);
    expect(result).toBe(true);
  });

  it('should get items by category', async () => {
    const items: ItemAttributes[] = [
      { id: 1, businessId: 1, name: 'Item 1', category: 'cat', isActive: true } as ItemAttributes,
    ];
    mockItemRepository.findByCategory.mockResolvedValue(items);
    const result = await ItemService.getItemsByCategory(1, 'cat');
    expect(mockItemRepository.findByCategory).toHaveBeenCalledWith(1, 'cat');
    expect(result).toEqual(items);
  });

  it('should search items', async () => {
    const items: ItemAttributes[] = [
      { id: 1, businessId: 1, name: 'Item 1', isActive: true } as ItemAttributes,
    ];
    mockItemRepository.search.mockResolvedValue(items);
    const result = await ItemService.searchItems(1, 'Item');
    expect(mockItemRepository.search).toHaveBeenCalledWith(1, 'Item');
    expect(result).toEqual(items);
  });

  it('should update stock', async () => {
    const updated = { id: 1, businessId: 1, name: 'Item 1', stock: 5, isActive: true } as ItemAttributes;
    mockItemRepository.updateStock.mockResolvedValue(updated);
    const result = await ItemService.updateStock(1, 1, 5);
    expect(mockItemRepository.updateStock).toHaveBeenCalledWith(1, 1, 5);
    expect(result).toEqual(updated);
  });

  it('should check if item exists by SKU', async () => {
    mockItemRepository.existsBySku.mockResolvedValue(true);
    const result = await ItemService.itemExistsBySku('SKU1', 1);
    expect(mockItemRepository.existsBySku).toHaveBeenCalledWith('SKU1', 1);
    expect(result).toBe(true);
  });

  it('should check if item exists by barcode', async () => {
    mockItemRepository.existsByBarcode.mockResolvedValue(false);
    const result = await ItemService.itemExistsByBarcode('BAR1', 1);
    expect(mockItemRepository.existsByBarcode).toHaveBeenCalledWith('BAR1', 1);
    expect(result).toBe(false);
  });

  it('should get item count', async () => {
    mockItemRepository.countByBusiness.mockResolvedValue(7);
    const result = await ItemService.getItemCount(1);
    expect(mockItemRepository.countByBusiness).toHaveBeenCalledWith(1);
    expect(result).toBe(7);
  });

  it('should get low stock items', async () => {
    const items: ItemAttributes[] = [
      { id: 1, businessId: 1, name: 'Low Stock', stock: 2, isActive: true } as ItemAttributes,
    ];
    mockItemRepository.getLowStockItems.mockResolvedValue(items);
    const result = await ItemService.getLowStockItems(1, 3);
    expect(mockItemRepository.getLowStockItems).toHaveBeenCalledWith(1, 3);
    expect(result).toEqual(items);
  });
}); 