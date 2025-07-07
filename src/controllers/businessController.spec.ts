import { BusinessController } from './businessController';
import { Request, Response } from 'express';
import { BusinessService } from '../services/businessService';

// Mock dependencies
jest.mock('../services/businessService');
jest.mock('../utils/logger', () => ({
    logger: jest.fn(),
}));

describe('BusinessController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockSend: jest.Mock;
    let mockStatus: jest.Mock;
    let mockJson: jest.Mock;

    beforeEach(() => {
        mockSend = jest.fn();
        mockStatus = jest.fn().mockReturnThis();
        mockJson = jest.fn();
        mockRequest = {};
        mockResponse = {
            send: mockSend,
            status: mockStatus,
            json: mockJson,
        };
        
        // Clear all mocks
        jest.clearAllMocks();
    });

    describe('createBusiness', () => {
        it('should create a new business successfully', async () => {
            // Arrange
            (mockRequest as any).user = { userId: 1, role: 'admin' };
            const businessData = {
                name: 'Test Business',
                slug: 'test-business',
                description: 'A test business',
                taxRate: 8.5,
                currency: 'USD',
                timezone: 'UTC'
            };
            mockRequest.body = businessData;
            
            const mockBusiness = {
                id: 1,
                ...businessData,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            (BusinessService.createBusiness as jest.Mock).mockResolvedValue(mockBusiness);

            // Act
            await BusinessController.createBusiness(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(BusinessService.createBusiness).toHaveBeenCalledWith(businessData);
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith(mockBusiness);
        });

        it('should return error if required fields are missing', async () => {
            // Arrange
            (mockRequest as any).user = { userId: 1, role: 'admin' };
            const businessData = {
                name: 'Test Business'
                // missing slug, taxRate, currency, timezone
            };
            mockRequest.body = businessData;

            // Act
            await BusinessController.createBusiness(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Name and slug are required'
            });
        });

        it('should return error if business creation fails', async () => {
            // Arrange
            (mockRequest as any).user = { userId: 1, role: 'admin' };
            const businessData = {
                name: 'Test Business',
                slug: 'test-business',
                taxRate: 8.5,
                currency: 'USD',
                timezone: 'UTC'
            };
            mockRequest.body = businessData;
            
            const error = new Error('Database error');
            (BusinessService.createBusiness as jest.Mock).mockRejectedValue(error);

            // Act
            await BusinessController.createBusiness(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });
        });

        it('should reject business creation for non-admin users', async () => {
            // Arrange
            (mockRequest as any).user = { userId: 1, role: 'cashier' };
            const businessData = {
                name: 'Test Business',
                slug: 'test-business',
                taxRate: 8.5,
                currency: 'USD',
                timezone: 'UTC'
            };
            mockRequest.body = businessData;

            // Act
            await BusinessController.createBusiness(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(403);
            expect(mockJson).toHaveBeenCalledWith({ 
                error: 'Only admin users can create new businesses' 
            });
        });

        it('should reject business creation for manager users', async () => {
            // Arrange
            (mockRequest as any).user = { userId: 1, role: 'manager' };
            const businessData = {
                name: 'Test Business',
                slug: 'test-business',
                taxRate: 8.5,
                currency: 'USD',
                timezone: 'UTC'
            };
            mockRequest.body = businessData;

            // Act
            await BusinessController.createBusiness(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(403);
            expect(mockJson).toHaveBeenCalledWith({ 
                error: 'Only admin users can create new businesses' 
            });
        });

        it('should reject business creation for unauthenticated users', async () => {
            // Arrange
            (mockRequest as any).user = undefined;
            const businessData = {
                name: 'Test Business',
                slug: 'test-business',
                taxRate: 8.5,
                currency: 'USD',
                timezone: 'UTC'
            };
            mockRequest.body = businessData;

            // Act
            await BusinessController.createBusiness(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(403);
            expect(mockJson).toHaveBeenCalledWith({ 
                error: 'Only admin users can create new businesses' 
            });
        });

        it('should allow business creation for admin users with valid data', async () => {
            // Arrange
            (mockRequest as any).user = { userId: 1, role: 'admin' };
            const businessData = {
                name: 'Another Business',
                slug: 'another-business',
                description: 'Another test business',
                taxRate: 10.0,
                currency: 'EUR',
                timezone: 'Europe/London'
            };
            mockRequest.body = businessData;
            
            const mockBusiness = {
                id: 2,
                ...businessData,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            (BusinessService.createBusiness as jest.Mock).mockResolvedValue(mockBusiness);

            // Act
            await BusinessController.createBusiness(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(BusinessService.createBusiness).toHaveBeenCalledWith(businessData);
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith(mockBusiness);
        });
    });

    describe('getBusinessById', () => {
        it('should get business by ID successfully', async () => {
            // Arrange
            const businessId = 1;
            mockRequest.params = { id: businessId.toString() };
            
            const mockBusiness = {
                id: businessId,
                name: 'Test Business',
                slug: 'test-business',
                isActive: true
            };
            
            (BusinessService.getBusinessById as jest.Mock).mockResolvedValue(mockBusiness);

            // Act
            await BusinessController.getBusinessById(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(BusinessService.getBusinessById).toHaveBeenCalledWith(businessId);
            expect(mockJson).toHaveBeenCalledWith(mockBusiness);
        });

        it('should return error if business not found', async () => {
            // Arrange
            const businessId = 999;
            mockRequest.params = { id: businessId.toString() };
            
            (BusinessService.getBusinessById as jest.Mock).mockResolvedValue(null);

            // Act
            await BusinessController.getBusinessById(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Business not found' });
        });

        it('should return error if invalid business ID', async () => {
            // Arrange
            mockRequest.params = { id: 'invalid' };

            // Act
            await BusinessController.getBusinessById(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid business ID' });
        });
    });

    describe('getBusinessBySlug', () => {
        it('should get business by slug successfully', async () => {
            // Arrange
            const slug = 'test-business';
            mockRequest.params = { slug };
            
            const mockBusiness = {
                id: 1,
                name: 'Test Business',
                slug,
                isActive: true
            };
            
            (BusinessService.getBusinessBySlug as jest.Mock).mockResolvedValue(mockBusiness);

            // Act
            await BusinessController.getBusinessBySlug(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(BusinessService.getBusinessBySlug).toHaveBeenCalledWith(slug);
            expect(mockJson).toHaveBeenCalledWith(mockBusiness);
        });

        it('should return error if business not found by slug', async () => {
            // Arrange
            const slug = 'non-existent';
            mockRequest.params = { slug };
            
            (BusinessService.getBusinessBySlug as jest.Mock).mockResolvedValue(null);

            // Act
            await BusinessController.getBusinessBySlug(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Business not found' });
        });
    });

    describe('getAll', () => {
        it('should get all active businesses successfully', async () => {
            // Arrange
            const mockBusinesses = [
                { id: 1, name: 'Business 1', isActive: true },
                { id: 2, name: 'Business 2', isActive: true }
            ];
            
            (BusinessService.getAllActiveBusinesses as jest.Mock).mockResolvedValue(mockBusinesses);

            // Act
            await BusinessController.getAll(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(BusinessService.getAllActiveBusinesses).toHaveBeenCalled();
            expect(mockJson).toHaveBeenCalledWith(mockBusinesses);
        });

        it('should handle errors when getting businesses', async () => {
            // Arrange
            const error = new Error('Database error');
            (BusinessService.getAllActiveBusinesses as jest.Mock).mockRejectedValue(error);

            // Act
            await BusinessController.getAll(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });

    describe('updateBusiness', () => {
        it('should update business successfully', async () => {
            // Arrange
            const businessId = 1;
            const updateData = { name: 'Updated Business' };
            mockRequest.params = { id: businessId.toString() };
            mockRequest.body = updateData;
            
            const mockBusiness = {
                id: businessId,
                name: 'Updated Business',
                slug: 'test-business',
                isActive: true
            };
            
            (BusinessService.updateBusiness as jest.Mock).mockResolvedValue(mockBusiness);

            // Act
            await BusinessController.updateBusiness(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(BusinessService.updateBusiness).toHaveBeenCalledWith(businessId, updateData);
            expect(mockJson).toHaveBeenCalledWith(mockBusiness);
        });

        it('should return error if business not found for update', async () => {
            // Arrange
            const businessId = 999;
            const updateData = { name: 'Updated Business' };
            mockRequest.params = { id: businessId.toString() };
            mockRequest.body = updateData;
            
            (BusinessService.updateBusiness as jest.Mock).mockResolvedValue(null);

            // Act
            await BusinessController.updateBusiness(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Business not found' });
        });

        it('should return error if invalid business ID for update', async () => {
            // Arrange
            mockRequest.params = { id: 'invalid' };
            mockRequest.body = { name: 'Updated Business' };

            // Act
            await BusinessController.updateBusiness(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid business ID' });
        });
    });

    describe('deleteBusiness', () => {
        it('should delete business successfully', async () => {
            // Arrange
            const businessId = 1;
            mockRequest.params = { id: businessId.toString() };
            
            (BusinessService.deleteBusiness as jest.Mock).mockResolvedValue(true);

            // Act
            await BusinessController.deleteBusiness(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(BusinessService.deleteBusiness).toHaveBeenCalledWith(businessId);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Business deleted successfully' });
        });

        it('should return error if business not found for deletion', async () => {
            // Arrange
            const businessId = 999;
            mockRequest.params = { id: businessId.toString() };
            
            (BusinessService.deleteBusiness as jest.Mock).mockResolvedValue(false);

            // Act
            await BusinessController.deleteBusiness(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Business not found' });
        });

        it('should return error if invalid business ID for deletion', async () => {
            // Arrange
            mockRequest.params = { id: 'invalid' };

            // Act
            await BusinessController.deleteBusiness(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid business ID' });
        });
    });

    describe('getBusinessStats', () => {
        it('should get business statistics successfully', async () => {
            // Arrange
            const businessId = 1;
            mockRequest.params = { id: businessId.toString() };
            
            const mockStats = {
                businessId: 1,
                businessName: 'Test Business',
                totalUsers: 5,
                activeUsers: 5,
                totalItems: 20,
                activeItems: 20,
                totalSales: 100,
                completedSales: 80,
                totalRevenue: 5000.00,
                currency: 'USD',
                taxRate: 8.5
            };
            
            (BusinessService.getBusinessStats as jest.Mock).mockResolvedValue(mockStats);

            // Act
            await BusinessController.getBusinessStats(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(BusinessService.getBusinessStats).toHaveBeenCalledWith(businessId);
            expect(mockJson).toHaveBeenCalledWith(mockStats);
        });

        it('should return error if business not found for stats', async () => {
            // Arrange
            const businessId = 999;
            mockRequest.params = { id: businessId.toString() };
            
            (BusinessService.getBusinessStats as jest.Mock).mockResolvedValue(null);

            // Act
            await BusinessController.getBusinessStats(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Business not found' });
        });
    });

    describe('searchBusinesses', () => {
        it('should search businesses successfully', async () => {
            // Arrange
            const query = 'test';
            mockRequest.query = { q: query };
            
            const mockBusinesses = [
                { id: 1, name: 'Test Business 1' },
                { id: 2, name: 'Test Business 2' }
            ];
            
            (BusinessService.searchBusinesses as jest.Mock).mockResolvedValue(mockBusinesses);

            // Act
            await BusinessController.searchBusinesses(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(BusinessService.searchBusinesses).toHaveBeenCalledWith(query);
            expect(mockJson).toHaveBeenCalledWith(mockBusinesses);
        });

        it('should return error if search query is missing', async () => {
            // Arrange
            mockRequest.query = {};

            // Act
            await BusinessController.searchBusinesses(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Search query is required' });
        });
    });

    describe('getBusinessesByTimezone', () => {
        it('should get businesses by timezone successfully', async () => {
            // Arrange
            const timezone = 'America/New_York';
            mockRequest.params = { timezone };
            
            const mockBusinesses = [
                { id: 1, name: 'Business 1', timezone },
                { id: 2, name: 'Business 2', timezone }
            ];
            
            (BusinessService.getBusinessesByTimezone as jest.Mock).mockResolvedValue(mockBusinesses);

            // Act
            await BusinessController.getBusinessesByTimezone(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(BusinessService.getBusinessesByTimezone).toHaveBeenCalledWith(timezone);
            expect(mockJson).toHaveBeenCalledWith(mockBusinesses);
        });
    });

    describe('getBusinessesByCurrency', () => {
        it('should get businesses by currency successfully', async () => {
            // Arrange
            const currency = 'USD';
            mockRequest.params = { currency };
            
            const mockBusinesses = [
                { id: 1, name: 'Business 1', currency },
                { id: 2, name: 'Business 2', currency }
            ];
            
            (BusinessService.getBusinessesByCurrency as jest.Mock).mockResolvedValue(mockBusinesses);

            // Act
            await BusinessController.getBusinessesByCurrency(mockRequest as Request, mockResponse as Response, jest.fn());

            // Assert
            expect(BusinessService.getBusinessesByCurrency).toHaveBeenCalledWith(currency);
            expect(mockJson).toHaveBeenCalledWith(mockBusinesses);
        });
    });
}); 