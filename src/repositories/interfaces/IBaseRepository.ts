/**
 * Base repository interface defining common CRUD operations
 */
export interface IBaseRepository<T> {
    /**
     * Find all records with optional filtering and pagination
     */
    findAll(options?: {
        where?: any;
        include?: any[];
        order?: any[];
        limit?: number;
        offset?: number;
    }): Promise<T[]>;

    /**
     * Find a single record by ID
     */
    findById(id: number, include?: any[]): Promise<T | null>;

    /**
     * Find a single record by criteria
     */
    findOne(where: any, include?: any[]): Promise<T | null>;

    /**
     * Create a new record
     */
    create(data: Partial<T>): Promise<T>;

    /**
     * Update an existing record
     */
    update(id: number, data: Partial<T>): Promise<T | null>;

    /**
     * Delete a record by ID
     */
    delete(id: number): Promise<boolean>;

    /**
     * Count records matching criteria
     */
    count(where?: any): Promise<number>;

    /**
     * Check if a record exists
     */
    exists(where: any): Promise<boolean>;

    /**
     * Find or create a record
     */
    findOrCreate(where: any, defaults: Partial<T>): Promise<[T, boolean]>;

    /**
     * Bulk create records
     */
    bulkCreate(data: Partial<T>[]): Promise<T[]>;

    /**
     * Bulk update records
     */
    bulkUpdate(where: any, data: Partial<T>): Promise<number>;

    /**
     * Bulk delete records
     */
    bulkDelete(where: any): Promise<number>;
} 