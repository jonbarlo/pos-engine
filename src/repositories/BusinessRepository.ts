import { Model, ModelStatic, Op } from 'sequelize';
import { BaseRepository } from './BaseRepository';
import { IBusinessRepository } from './interfaces/IBusinessRepository';
import { BusinessModel, BusinessAttributes } from '../models/BusinessModel';
import { UserModel } from '../models/UserModel';

/**
 * Business repository implementation
 */
export class BusinessRepository extends BaseRepository<BusinessModel> implements IBusinessRepository {
    constructor() {
        super(BusinessModel as ModelStatic<Model>);
    }

    async findBySlug(slug: string): Promise<BusinessAttributes | null> {
        const business = await this.model.findOne({
            where: { slug }
        });
        return business?.toJSON() as BusinessAttributes | null;
    }

    async findActive(): Promise<BusinessAttributes[]> {
        const businesses = await this.model.findAll({
            where: { isActive: true }
        });
        return businesses.map(business => business.toJSON() as BusinessAttributes);
    }

    async slugExists(slug: string): Promise<boolean> {
        const count = await this.model.count({
            where: { slug }
        });
        return count > 0;
    }

    async findByType(type: string): Promise<BusinessAttributes[]> {
        const businesses = await this.model.findAll({
            where: { type }
        });
        return businesses.map(business => business.toJSON() as BusinessAttributes);
    }

    async getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byType: Record<string, number>;
    }> {
        const total = await this.model.count();
        const active = await this.model.count({ where: { isActive: true } });
        const inactive = await this.model.count({ where: { isActive: false } });

        // Get count by type
        const typeStats = await this.model.findAll({
            attributes: [
                'type',
                [this.model.sequelize!.fn('COUNT', this.model.sequelize!.col('id')), 'count']
            ],
            group: ['type'],
            raw: true
        });

        const byType: Record<string, number> = {};
        typeStats.forEach((stat: any) => {
            byType[stat.type] = parseInt(stat.count);
        });

        return {
            total,
            active,
            inactive,
            byType
        };
    }

    async search(query: string, options?: {
        limit?: number;
        offset?: number;
        includeInactive?: boolean;
    }): Promise<BusinessAttributes[]> {
        const whereClause: any = {
            [Op.or]: [
                { name: { [Op.iLike]: `%${query}%` } },
                { description: { [Op.iLike]: `%${query}%` } }
            ]
        };

        if (!options?.includeInactive) {
            whereClause.isActive = true;
        }

        const findOptions: any = { where: whereClause };
        if (options?.limit) findOptions.limit = options.limit;
        if (options?.offset) findOptions.offset = options.offset;

        const businesses = await this.model.findAll(findOptions);
        return businesses.map(business => business.toJSON() as BusinessAttributes);
    }

    async findWithUserCount(options?: {
        limit?: number;
        offset?: number;
    }): Promise<Array<BusinessAttributes & { userCount: number }>> {
        const findOptions: any = {
            include: [{
                model: UserModel as ModelStatic<Model>,
                as: 'users',
                attributes: []
            }],
            attributes: {
                include: [
                    [this.model.sequelize!.fn('COUNT', this.model.sequelize!.col('users.id')), 'userCount']
                ]
            },
            group: ['BusinessModel.id'],
            raw: true
        };

        if (options?.limit) findOptions.limit = options.limit;
        if (options?.offset) findOptions.offset = options.offset;

        const results = await this.model.findAll(findOptions);
        return results.map((result: any) => ({
            ...result,
            userCount: parseInt(result.userCount)
        })) as Array<BusinessAttributes & { userCount: number }>;
    }

    async updateStatus(id: number, isActive: boolean): Promise<boolean> {
        const result = await this.model.update(
            { isActive },
            { where: { id } }
        );
        
        // Handle different return types from different databases
        const affectedRows = Array.isArray(result) ? result[0] : result;
        return affectedRows > 0;
    }

    async findByIdWithUsers(id: number): Promise<BusinessAttributes | null> {
        const business = await this.model.findByPk(id, {
            include: [{
                model: UserModel as ModelStatic<Model>,
                as: 'users',
                attributes: { exclude: ['password'] }
            }]
        });
        return business?.toJSON() as BusinessAttributes | null;
    }

    // Additional methods that return BusinessAttributes
    async findAllBusinesses(options?: {
        where?: any;
        include?: any[];
        order?: any[];
        limit?: number;
        offset?: number;
    }): Promise<BusinessAttributes[]> {
        const businesses = await super.findAll(options);
        return businesses.map(business => business.toJSON() as BusinessAttributes);
    }

    async findBusinessById(id: number, include?: any[]): Promise<BusinessAttributes | null> {
        const business = await super.findById(id, include);
        return business?.toJSON() as BusinessAttributes | null;
    }

    async findBusinessOne(where: any, include?: any[]): Promise<BusinessAttributes | null> {
        const business = await super.findOne(where, include);
        return business?.toJSON() as BusinessAttributes | null;
    }

    async createBusiness(data: Partial<BusinessAttributes>): Promise<BusinessAttributes> {
        const business = await super.create(data);
        return business.toJSON() as BusinessAttributes;
    }

    async updateBusiness(id: number, data: Partial<BusinessAttributes>): Promise<BusinessAttributes | null> {
        const business = await super.update(id, data);
        return business?.toJSON() as BusinessAttributes | null;
    }

    async findOrCreateBusiness(where: any, defaults: Partial<BusinessAttributes>): Promise<[BusinessAttributes, boolean]> {
        const [business, created] = await super.findOrCreate(where, defaults);
        return [business.toJSON() as BusinessAttributes, created];
    }

    async bulkCreateBusinesses(data: Partial<BusinessAttributes>[]): Promise<BusinessAttributes[]> {
        const businesses = await super.bulkCreate(data);
        return businesses.map(business => business.toJSON() as BusinessAttributes);
    }
} 