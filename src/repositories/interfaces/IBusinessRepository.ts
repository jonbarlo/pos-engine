import { IBaseRepository } from './IBaseRepository';
import { BusinessModel, BusinessAttributes } from '../../models/BusinessModel';

/**
 * Business repository interface with business-specific operations
 */
export interface IBusinessRepository extends IBaseRepository<BusinessAttributes> {
    /**
     * Find business by slug
     */
    findBySlug(slug: string): Promise<BusinessAttributes | null>;

    /**
     * Find active businesses
     */
    findActive(): Promise<BusinessAttributes[]>;

    /**
     * Check if slug exists
     */
    slugExists(slug: string): Promise<boolean>;

    /**
     * Find businesses by type
     */
    findByType(type: string): Promise<BusinessAttributes[]>;

    /**
     * Get business statistics
     */
    getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byType: Record<string, number>;
    }>;

    /**
     * Search businesses by name or description
     */
    search(query: string, options?: {
        limit?: number;
        offset?: number;
        includeInactive?: boolean;
    }): Promise<BusinessAttributes[]>;

    /**
     * Get businesses with user count
     */
    findWithUserCount(options?: {
        limit?: number;
        offset?: number;
    }): Promise<Array<BusinessAttributes & { userCount: number }>>;

    /**
     * Update business status
     */
    updateStatus(id: number, isActive: boolean): Promise<boolean>;

    /**
     * Get business by ID with users
     */
    findByIdWithUsers(id: number): Promise<BusinessAttributes | null>;
} 