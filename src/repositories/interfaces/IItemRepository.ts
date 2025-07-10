import { ItemAttributes, ItemCreationAttributes } from '../../models/ItemModel';

export interface IItemRepository {
  findAllByBusiness(businessId: number): Promise<ItemAttributes[]>;
  findById(id: number, businessId: number): Promise<ItemAttributes | null>;
  create(itemData: ItemCreationAttributes): Promise<ItemAttributes>;
  update(id: number, businessId: number, updateData: Partial<ItemAttributes>): Promise<ItemAttributes | null>;
  delete(id: number, businessId: number): Promise<boolean>;
  findByCategory(businessId: number, category: string): Promise<ItemAttributes[]>;
  search(businessId: number, searchTerm: string): Promise<ItemAttributes[]>;
  updateStock(id: number, businessId: number, quantity: number): Promise<ItemAttributes | null>;
  existsBySku(sku: string, businessId: number): Promise<boolean>;
  existsByBarcode(barcode: string, businessId: number): Promise<boolean>;
  countByBusiness(businessId: number): Promise<number>;
  getLowStockItems(businessId: number, threshold?: number): Promise<ItemAttributes[]>;
} 