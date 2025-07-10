import { Model, ModelStatic, FindOptions, CreateOptions, UpdateOptions, DestroyOptions, CountOptions } from 'sequelize';
import { IBaseRepository } from './interfaces/IBaseRepository';

/**
 * Base repository implementation providing common CRUD operations
 */
export abstract class BaseRepository<T> implements IBaseRepository<T> {
    protected model: ModelStatic<Model>;

    constructor(model: ModelStatic<Model>) {
        this.model = model;
    }

    async findAll(options?: {
        where?: any;
        include?: any[];
        order?: any[];
        limit?: number;
        offset?: number;
    }): Promise<T[]> {
        const findOptions: FindOptions = {};
        
        if (options?.where) findOptions.where = options.where;
        if (options?.include) findOptions.include = options.include;
        if (options?.order) findOptions.order = options.order;
        if (options?.limit) findOptions.limit = options.limit;
        if (options?.offset) findOptions.offset = options.offset;

        const results = await this.model.findAll(findOptions);
        return results as T[];
    }

    async findById(id: number, include?: any[]): Promise<T | null> {
        const findOptions: FindOptions = { where: { id } };
        if (include) findOptions.include = include;

        const result = await this.model.findByPk(id, findOptions);
        return result as T | null;
    }

    async findOne(where: any, include?: any[]): Promise<T | null> {
        const findOptions: FindOptions = { where };
        if (include) findOptions.include = include;

        const result = await this.model.findOne(findOptions);
        return result as T | null;
    }

    async create(data: Partial<T>): Promise<T> {
        const createOptions: CreateOptions = {};
        const result = await this.model.create(data as any, createOptions);
        return result as T;
    }

    async update(id: number, data: Partial<T>): Promise<T | null> {
        const updateOptions: UpdateOptions = { where: { id } };
        const result = await this.model.update(data as any, updateOptions);
        
        // Handle different return types from different databases
        const affectedRows = Array.isArray(result) ? result[0] : result;
        
        if (affectedRows === 0) return null;
        
        return await this.findById(id);
    }

    async delete(id: number): Promise<boolean> {
        const destroyOptions: DestroyOptions = { where: { id } };
        const affectedRows = await this.model.destroy(destroyOptions);
        return affectedRows > 0;
    }

    async count(where?: any): Promise<number> {
        const countOptions: CountOptions = {};
        if (where) countOptions.where = where;

        return await this.model.count(countOptions);
    }

    async exists(where: any): Promise<boolean> {
        const count = await this.count(where);
        return count > 0;
    }

    async findOrCreate(where: any, defaults: Partial<T>): Promise<[T, boolean]> {
        const [result, created] = await this.model.findOrCreate({
            where,
            defaults: defaults as any
        });
        return [result as T, created];
    }

    async bulkCreate(data: Partial<T>[]): Promise<T[]> {
        const results = await this.model.bulkCreate(data as any[]);
        return results as T[];
    }

    async bulkUpdate(where: any, data: Partial<T>): Promise<number> {
        const updateOptions: UpdateOptions = { where };
        const result = await this.model.update(data as any, updateOptions);
        
        // Handle different return types from different databases
        const affectedRows = Array.isArray(result) ? result[0] : result;
        return affectedRows;
    }

    async bulkDelete(where: any): Promise<number> {
        const destroyOptions: DestroyOptions = { where };
        return await this.model.destroy(destroyOptions);
    }
} 