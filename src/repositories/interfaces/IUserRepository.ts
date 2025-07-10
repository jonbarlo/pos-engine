import { IBaseRepository } from './IBaseRepository';
import { UserModel, UserAttributes } from '../../models/UserModel';

/**
 * User repository interface with user-specific operations
 */
export interface IUserRepository extends IBaseRepository<UserAttributes> {
    /**
     * Find user by email for a specific business
     */
    findByEmail(email: string, businessId: number): Promise<UserAttributes | null>;

    /**
     * Find user by email and business slug
     */
    findByEmailAndBusinessSlug(email: string, businessSlug: string): Promise<UserAttributes | null>;

    /**
     * Find all users for a specific business
     */
    findByBusinessId(businessId: number, options?: {
        include?: any[];
        order?: any[];
        limit?: number;
        offset?: number;
    }): Promise<UserAttributes[]>;

    /**
     * Find users by role for a specific business
     */
    findByRole(businessId: number, role: string): Promise<UserAttributes[]>;
    findAnyByRole(role: string): Promise<UserAttributes[]>;

    /**
     * Find active users for a business
     */
    findActiveByBusinessId(businessId: number): Promise<UserAttributes[]>;

    /**
     * Update user password
     */
    updatePassword(userId: number, hashedPassword: string): Promise<boolean>;

    /**
     * Check if email exists in a business
     */
    emailExistsInBusiness(email: string, businessId: number): Promise<boolean>;

    /**
     * Get user count by business
     */
    countByBusiness(businessId: number): Promise<number>;

    /**
     * Get user count by role and business
     */
    countByRoleAndBusiness(businessId: number, role: string): Promise<number>;
} 