import { SaleAttributes, SaleCreationAttributes } from '../../models/SaleModel';

export interface ISaleRepository {
  findAllByBusiness(businessId: number): Promise<SaleAttributes[]>;
  findById(id: number, businessId: number): Promise<SaleAttributes | null>;
  create(saleData: SaleCreationAttributes): Promise<SaleAttributes>;
  update(id: number, businessId: number, updateData: Partial<SaleAttributes>): Promise<SaleAttributes | null>;
  delete(id: number, businessId: number): Promise<boolean>;
  findByStatus(businessId: number, status: string): Promise<SaleAttributes[]>;
  search(businessId: number, searchTerm: string): Promise<SaleAttributes[]>;
  countByBusiness(businessId: number): Promise<number>;
  getTotalRevenue(businessId: number): Promise<number>;
} 