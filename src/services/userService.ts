import { UserModel, UserAttributes, UserCreationAttributes } from '../models/UserModel';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';
import { getUserRepository } from '../repositories/RepositoryFactory';

export type UserWithoutPassword = Omit<UserAttributes, 'password'>;

export class UserService {
  /**
   * Get all users for a specific business without passwords
   */
  static async getAllUsers(businessId: number): Promise<UserWithoutPassword[]> {
    try {
      logger(`Getting all users for business: ${businessId}`);
      const userRepository = getUserRepository();
      const users = await userRepository.findByBusinessId(businessId);
      return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword as UserWithoutPassword);
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
      const userRepository = getUserRepository();
      const user = await userRepository.findOne({ id, businessId, isActive: true });
      if (!user) return null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as UserWithoutPassword;
    } catch (error) {
      logger(`Error getting user ${id} for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get user by email within a business (includes password for authentication)
   */
  static async getUserByEmail(email: string, businessId: number): Promise<UserAttributes | null> {
    try {
      logger(`Getting user by email ${email} for business: ${businessId}`);
      const userRepository = getUserRepository();
      return await userRepository.findByEmail(email, businessId);
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
      const userRepository = getUserRepository();
      // Allow admin user to be created without a businessId
      const data = userData.role === 'admin' ? { ...userData, businessId: userData.businessId ?? null } : userData;
      const user = await userRepository.create(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
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
      const userRepository = getUserRepository();
      const user = await userRepository.findOne({ id, businessId, isActive: true });
      if (!user) {
        return null;
      }
      // If password is being updated, hash it
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      const updated = await userRepository.update(id, updateData);
      if (!updated) return null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = updated;
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
      const userRepository = getUserRepository();
      const user = await userRepository.findOne({ id, businessId, isActive: true });
      if (!user) {
        return false;
      }
      await userRepository.update(id, { isActive: false });
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
      const userRepository = getUserRepository();
      return await userRepository.emailExistsInBusiness(email, businessId);
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
      const userRepository = getUserRepository();
      const users = await userRepository.findByRole(businessId, role);
      return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword as UserWithoutPassword);
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
      const userRepository = getUserRepository();
      const users = await userRepository.findAll({
        where: {
          businessId,
          isActive: true,
          [Op.or]: [
            { name: { [Op.iLike]: `%${query}%` } },
            { email: { [Op.iLike]: `%${query}%` } }
          ]
        },
        order: [['name', 'ASC']],
      });
      return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword as UserWithoutPassword);
    } catch (error) {
      logger(`Error searching users for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get user count for a business
   */
  static async getUserCount(businessId: number): Promise<number> {
    try {
      const userRepository = getUserRepository();
      return await userRepository.countByBusiness(businessId);
    } catch (error) {
      logger(`Error getting user count for business ${businessId}: ${error}`);
      throw error;
    }
  }

  /**
   * Find any admin user (for initial admin registration)
   */
  static async findAnyAdmin(): Promise<UserWithoutPassword | null> {
    try {
      const userRepository = getUserRepository();
      const admins = await userRepository.findAnyByRole('admin');
      if (admins.length === 0 || !admins[0]) return null;
      const { password, ...userWithoutPassword } = admins[0];
      return userWithoutPassword as UserWithoutPassword;
    } catch (error) {
      logger(`Error finding any admin: ${error}`);
      throw error;
    }
  }
} 