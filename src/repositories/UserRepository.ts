import { Model, ModelStatic, Op } from 'sequelize';
import { BaseRepository } from './BaseRepository';
import { IUserRepository } from './interfaces/IUserRepository';
import { UserModel, UserAttributes } from '../models/UserModel';
import { BusinessModel } from '../models/BusinessModel';

/**
 * User repository implementation
 */
export class UserRepository extends BaseRepository<UserModel> implements IUserRepository {
    constructor() {
        super(UserModel as ModelStatic<Model>);
    }

    async findByEmail(email: string, businessId: number): Promise<UserAttributes | null> {
        const user = await this.model.findOne({
            where: {
                email,
                businessId
            }
        });
        return user ? (user.toJSON() as UserAttributes) : null;
    }

    async findByEmailAndBusinessSlug(email: string, businessSlug: string): Promise<UserAttributes | null> {
        const user = await this.model.findOne({
            include: [{
                model: BusinessModel as ModelStatic<Model>,
                as: 'business',
                where: { slug: businessSlug }
            }],
            where: { email }
        });
        return user?.toJSON() as UserAttributes | null;
    }

    async findByBusinessId(businessId: number, options?: {
        include?: any[];
        order?: any[];
        limit?: number;
        offset?: number;
    }): Promise<UserAttributes[]> {
        const findOptions: any = {
            where: { businessId }
        };

        if (options?.include) findOptions.include = options.include;
        if (options?.order) findOptions.order = options.order;
        if (options && 'limit' in options) findOptions.limit = options.limit;
        if (options && 'offset' in options) findOptions.offset = options.offset;

        const users = await this.model.findAll(findOptions);
        return users.map(user => user.toJSON() as UserAttributes);
    }

    async findByRole(businessId: number, role: string): Promise<UserAttributes[]> {
        const users = await this.model.findAll({
            where: {
                businessId,
                role
            }
        });
        return users.map(user => user.toJSON() as UserAttributes);
    }

    async findAnyByRole(role: string): Promise<UserAttributes[]> {
        const users = await this.model.findAll({
            where: {
                role
            }
        });
        return users.map(user => user.toJSON() as UserAttributes);
    }

    async findActiveByBusinessId(businessId: number): Promise<UserAttributes[]> {
        const users = await this.model.findAll({
            where: {
                businessId,
                isActive: true
            }
        });
        return users.map(user => user.toJSON() as UserAttributes);
    }

    async updatePassword(userId: number, hashedPassword: string): Promise<boolean> {
        const result = await this.model.update(
            { password: hashedPassword },
            { where: { id: userId } }
        );
        
        // Handle different return types from different databases
        const affectedRows = Array.isArray(result) ? result[0] : result;
        return affectedRows > 0;
    }

    async emailExistsInBusiness(email: string, businessId: number): Promise<boolean> {
        const count = await this.model.count({
            where: {
                email,
                businessId
            }
        });
        return count > 0;
    }

    async countByBusiness(businessId: number): Promise<number> {
        return await this.model.count({
            where: { businessId }
        });
    }

    async countByRoleAndBusiness(businessId: number, role: string): Promise<number> {
        return await this.model.count({
            where: {
                businessId,
                role
            }
        });
    }

    // Additional methods that return UserAttributes
    async findAllUsers(options?: {
        where?: any;
        include?: any[];
        order?: any[];
        limit?: number;
        offset?: number;
    }): Promise<UserAttributes[]> {
        const users = await super.findAll(options);
        return users.map(user => user.toJSON() as UserAttributes);
    }

    async findUserById(id: number, include?: any[]): Promise<UserAttributes | null> {
        const user = await super.findById(id, include);
        return user?.toJSON() as UserAttributes | null;
    }

    async findUserOne(where: any, include?: any[]): Promise<UserAttributes | null> {
        const user = await super.findOne(where, include);
        return user?.toJSON() as UserAttributes | null;
    }

    async createUser(data: Partial<UserAttributes>): Promise<UserAttributes> {
        const user = await super.create(data);
        return user.toJSON() as UserAttributes;
    }

    async updateUser(id: number, data: Partial<UserAttributes>): Promise<UserAttributes | null> {
        const user = await super.update(id, data);
        return user?.toJSON() as UserAttributes | null;
    }

    async findOrCreateUser(where: any, defaults: Partial<UserAttributes>): Promise<[UserAttributes, boolean]> {
        const [user, created] = await super.findOrCreate(where, defaults);
        return [user.toJSON() as UserAttributes, created];
    }

    async bulkCreateUsers(data: Partial<UserAttributes>[]): Promise<UserAttributes[]> {
        const users = await super.bulkCreate(data);
        return users.map(user => user.toJSON() as UserAttributes);
    }
} 