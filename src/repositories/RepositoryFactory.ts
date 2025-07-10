import { UserRepository } from './UserRepository';
import { BusinessRepository } from './BusinessRepository';
import { ItemRepository } from './ItemRepository';
import { SaleRepository } from './SaleRepository';
import { IUserRepository } from './interfaces/IUserRepository';
import { IBusinessRepository } from './interfaces/IBusinessRepository';
import { IItemRepository } from './interfaces/IItemRepository';
import { ISaleRepository } from './interfaces/ISaleRepository';

/**
 * Repository factory for managing repository instances
 */
export class RepositoryFactory {
    private static instance: RepositoryFactory;
    private userRepository: IUserRepository;
    private businessRepository: IBusinessRepository;
    private itemRepository: IItemRepository | null = null;
    private saleRepository: ISaleRepository | null = null;

    private constructor() {
        this.userRepository = new UserRepository();
        this.businessRepository = new BusinessRepository();
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): RepositoryFactory {
        if (!RepositoryFactory.instance) {
            RepositoryFactory.instance = new RepositoryFactory();
        }
        return RepositoryFactory.instance;
    }

    /**
     * Get user repository
     */
    public getUserRepository(): IUserRepository {
        return this.userRepository;
    }

    /**
     * Get business repository
     */
    public getBusinessRepository(): IBusinessRepository {
        return this.businessRepository;
    }

    /**
     * Get item repository
     */
    public getItemRepository(): IItemRepository {
        if (!this.itemRepository) {
            this.itemRepository = new ItemRepository();
        }
        return this.itemRepository;
    }

    /**
     * Get sale repository
     */
    public getSaleRepository(): ISaleRepository {
        if (!this.saleRepository) {
            this.saleRepository = new SaleRepository();
        }
        return this.saleRepository;
    }

    /**
     * Reset factory (useful for testing)
     */
    public static reset(): void {
        RepositoryFactory.instance = new RepositoryFactory();
    }
}

/**
 * Convenience function to get user repository
 */
export function getUserRepository(): IUserRepository {
    return RepositoryFactory.getInstance().getUserRepository();
}

/**
 * Convenience function to get business repository
 */
export function getBusinessRepository(): IBusinessRepository {
    return RepositoryFactory.getInstance().getBusinessRepository();
}

/**
 * Convenience function to get item repository
 */
export function getItemRepository(): IItemRepository {
    return RepositoryFactory.getInstance().getItemRepository();
}

/**
 * Convenience function to get sale repository
 */
export function getSaleRepository(): ISaleRepository {
    return RepositoryFactory.getInstance().getSaleRepository();
} 