import { UserModel, UserAttributes, UserCreationAttributes } from '../models';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';

export type UserWithoutPassword = Omit<UserAttributes, 'password'>;

export class UserService {
  /**
   * Get all users for a specific business without passwords
   */
  static async getAllUsers(businessId: number): Promise<UserWithoutPassword[]> {
    try {
      logger(`Getting all users for business: ${businessId}`);
      const users = await UserModel.findAll({
        where: { businessId, isActive: true },
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
      });
      return users.map((user: UserModel) => {
        const userData = user.toJSON();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = userData;
        return userWithoutPassword as UserWithoutPassword;
      });
    } catch (error) {
      logger(`Error getting users for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get user by ID within a business without password
   */
  static async getUserById(id: number, businessId: number): Promise<UserWithoutPassword | null> {
    try {
      logger(`Getting user ${id} for business: ${businessId}`);
      const user = await UserModel.findOne({
        where: { id, businessId, isActive: true },
        attributes: { exclude: ['password'] },
      });
      if (!user) return null;
      const userData = user.toJSON();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = userData;
      return userWithoutPassword as UserWithoutPassword;
    } catch (error) {
      logger(`Error getting user ${id} for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get user by email within a business (includes password for authentication)
   */
  static async getUserByEmail(email: string, businessId: number): Promise<UserModel | null> {
    try {
      logger(`Getting user by email ${email} for business: ${businessId}`);
      return await UserModel.findOne({
        where: { email, businessId, isActive: true },
      });
    } catch (error) {
      logger(`Error getting user by email ${email} for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Create a new user for a business
   */
  static async createUser(userData: UserCreationAttributes): Promise<UserWithoutPassword> {
    try {
      logger(`Creating user for business: ${userData.businessId}`);
      // Allow admin user to be created without a businessId
      const user = await UserModel.create(userData.role === 'admin' ? { ...userData, businessId: userData.businessId ?? null } : userData);
      const userDataJson = user.toJSON();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = userDataJson;
      return userWithoutPassword as UserWithoutPassword;
    } catch (error) {
      logger(`Error creating user for business ${userData.businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Update user by ID within a business
   */
  static async updateUser(id: number, businessId: number, updateData: Partial<UserAttributes>): Promise<UserWithoutPassword | null> {
    try {
      logger(`Updating user ${id} for business: ${businessId}`);
      const user = await UserModel.findOne({
        where: { id, businessId, isActive: true }
      });
      if (!user) {
        return null;
      }

      // If password is being updated, hash it
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      await user.update(updateData);
      const userData = user.toJSON();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = userData;
      return userWithoutPassword as UserWithoutPassword;
    } catch (error) {
      logger(`Error updating user ${id} for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Delete user by ID within a business (soft delete)
   */
  static async deleteUser(id: number, businessId: number): Promise<boolean> {
    try {
      logger(`Deleting user ${id} for business: ${businessId}`);
      const user = await UserModel.findOne({
        where: { id, businessId, isActive: true }
      });
      if (!user) {
        return false;
      }

      await user.update({ isActive: false });
      return true;
    } catch (error) {
      logger(`Error deleting user ${id} for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Check if user exists by email within a business
   */
  static async userExists(email: string, businessId: number): Promise<boolean> {
    try {
      const count = await UserModel.count({
        where: { email, businessId, isActive: true },
      });
      return count > 0;
    } catch (error) {
      logger(`Error checking if user exists ${email} for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get users by role within a business
   */
  static async getUsersByRole(businessId: number, role: string): Promise<UserWithoutPassword[]> {
    try {
      logger(`Getting users with role ${role} for business: ${businessId}`);
      const users = await UserModel.findAll({
        where: { businessId, role, isActive: true },
        attributes: { exclude: ['password'] },
        order: [['name', 'ASC']],
      });
      return users.map((user: UserModel) => {
        const userData = user.toJSON();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = userData;
        return userWithoutPassword as UserWithoutPassword;
      });
    } catch (error) {
      logger(`Error getting users by role ${role} for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Search users within a business
   */
  static async searchUsers(businessId: number, query: string): Promise<UserWithoutPassword[]> {
    try {
      logger(`Searching users with query "${query}" for business: ${businessId}`);
      const { Op } = require('sequelize');
      const users = await UserModel.findAll({
        where: {
          businessId,
          isActive: true,
          [Op.or]: [
            { name: { [Op.iLike]: `%${query}%` } },
            { email: { [Op.iLike]: `%${query}%` } }
          ]
        },
        attributes: { exclude: ['password'] },
        order: [['name', 'ASC']],
      });
      return users.map((user: UserModel) => {
        const userData = user.toJSON();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = userData;
        return userWithoutPassword as UserWithoutPassword;
      });
    } catch (error) {
      logger(`Error searching users for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get user count by business
   */
  static async getUserCount(businessId: number): Promise<number> {
    try {
      return await UserModel.count({
        where: { businessId, isActive: true }
      });
    } catch (error) {
      logger(`Error getting user count for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Find any admin user in the system
   */
  static async findAnyAdmin(): Promise<UserWithoutPassword | null> {
    const user = await UserModel.findOne({ where: { role: 'admin' } });
    if (!user) return null;
    const userData = user.toJSON();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = userData;
    return userWithoutPassword as UserWithoutPassword;
  }
} 