import { Request, Response, RequestHandler } from 'express';
import { logger } from '../utils/logger';
import { ItemService } from '../services/itemService';

interface AuthRequest extends Request {
    user?: {
        userId: number;
        businessId: number;
        email: string;
        role: string;
    };
}

export class ItemController {

    // Get all items for the current business
    public static getAll: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            logger('API endpoint /items was called...');
            
            if (!req.user?.businessId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }

            const items = await ItemService.getAllItems(req.user.businessId);
            res.json(items);
        } catch (error) {
            logger(`Error getting items: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Get item by ID within the current business
    public static getItemById: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: 'Item ID is required' });
                return;
            }
            
            if (!req.user?.businessId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            
            const itemId = parseInt(id);
            
            if (isNaN(itemId)) {
                res.status(400).json({ error: 'Invalid item ID' });
                return;
            }

            logger(`API endpoint /items/${id} was called...`);
            const item = await ItemService.getItemById(itemId, req.user.businessId);
            
            if (!item) {
                res.status(404).json({ error: 'Item not found' });
                return;
            }

            res.json(item);
        } catch (error) {
            logger(`Error getting item by ID: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Create new item in the current business
    public static createItem: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user?.businessId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }

            const { name, description, price, stock, category, sku, barcode } = req.body;

            // Validate required fields
            if (!name || !price) {
                res.status(400).json({ 
                    error: 'Name and price are required' 
                });
                return;
            }

            // Validate price
            if (price < 0) {
                res.status(400).json({ 
                    error: 'Price must be non-negative' 
                });
                return;
            }

            // Generate unique SKU if not provided
            let finalSku = sku;
            if (!finalSku) {
                const timestamp = Date.now();
                const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
                finalSku = `SKU-${timestamp}-${randomSuffix}`;
            }

            // Generate unique barcode if not provided
            let finalBarcode = barcode;
            if (!finalBarcode) {
                const timestamp = Date.now();
                const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
                finalBarcode = `BC-${timestamp}-${randomSuffix}`;
            }

            // Check if SKU already exists in this business
            const skuExists = await ItemService.itemExistsBySku(finalSku, req.user.businessId);
            if (skuExists) {
                res.status(409).json({ 
                    error: 'Item with this SKU already exists in this business' 
                });
                return;
            }

            // Check if barcode already exists in this business
            const barcodeExists = await ItemService.itemExistsByBarcode(finalBarcode, req.user.businessId);
            if (barcodeExists) {
                res.status(409).json({ 
                    error: 'Item with this barcode already exists in this business' 
                });
                return;
            }

            logger('API endpoint POST /items was called...');
            const newItem = await ItemService.createItem({
                name,
                description,
                price,
                cost: 0, // Add default cost
                stock: stock || 0,
                category: category || 'General',
                sku: finalSku,
                barcode: finalBarcode,
                unit: 'piece', // Add default unit
                minStock: 0, // Add default minStock
                maxStock: 1000, // Add default maxStock
                businessId: req.user.businessId,
                // Add dietary fields with defaults
                isVegetarian: false,
                isVegan: false,
                isGlutenFree: false,
                isSpicy: false,
                // Add new inventory management fields with defaults
                isPerishable: false,
                isUnderperforming: false,
                isExpiringSoon: false
            });
            res.status(201).json(newItem);
        } catch (error) {
            logger(`Error creating item: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Update item within the current business
    public static updateItem: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: 'Item ID is required' });
                return;
            }
            
            if (!req.user?.businessId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            
            const itemId = parseInt(id);
            
            if (isNaN(itemId)) {
                res.status(400).json({ error: 'Invalid item ID' });
                return;
            }

            const { name, description, price, stock, category, sku, barcode, isActive } = req.body;
            const updateData: any = {};
            
            if (name !== undefined) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (price !== undefined) updateData.price = price;
            if (stock !== undefined) updateData.stock = stock;
            if (category !== undefined) updateData.category = category;
            if (sku !== undefined) updateData.sku = sku;
            if (barcode !== undefined) updateData.barcode = barcode;
            if (isActive !== undefined) updateData.isActive = isActive;

            if (Object.keys(updateData).length === 0) {
                res.status(400).json({ error: 'No fields to update' });
                return;
            }

            // Validate price if being updated
            if (updateData.price !== undefined && updateData.price < 0) {
                res.status(400).json({ error: 'Price must be non-negative' });
                return;
            }

            logger(`API endpoint PUT /items/${id} was called...`);
            const updatedItem = await ItemService.updateItem(itemId, req.user.businessId, updateData);
            
            if (!updatedItem) {
                res.status(404).json({ error: 'Item not found' });
                return;
            }

            res.json(updatedItem);
        } catch (error) {
            logger(`Error updating item: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Delete item within the current business
    public static deleteItem: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: 'Item ID is required' });
                return;
            }
            
            if (!req.user?.businessId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            
            const itemId = parseInt(id);
            
            if (isNaN(itemId)) {
                res.status(400).json({ error: 'Invalid item ID' });
                return;
            }

            logger(`API endpoint DELETE /items/${id} was called...`);
            const deleted = await ItemService.deleteItem(itemId, req.user.businessId);
            
            if (!deleted) {
                res.status(404).json({ error: 'Item not found' });
                return;
            }

            res.json({ message: 'Item deleted successfully' });
        } catch (error) {
            logger(`Error deleting item: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Get items by category within the current business
    public static getItemsByCategory: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            const { category } = req.params;
            
            if (!category) {
                res.status(400).json({ error: 'Category is required' });
                return;
            }

            if (!req.user?.businessId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }

            logger(`API endpoint /items/category/${category} was called...`);
            const items = await ItemService.getItemsByCategory(req.user.businessId, category);
            res.json(items);
        } catch (error) {
            logger(`Error getting items by category: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Search items within the current business
    public static searchItems: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            const { q } = req.query;
            
            if (!q || typeof q !== 'string') {
                res.status(400).json({ error: 'Search query is required' });
                return;
            }

            if (!req.user?.businessId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }

            logger(`API endpoint /items/search?q=${q} was called...`);
            const items = await ItemService.searchItems(req.user.businessId, q);
            res.json(items);
        } catch (error) {
            logger(`Error searching items: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Update stock within the current business
    public static updateStock: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params;
            const { quantity } = req.body;
            
            if (!id) {
                res.status(400).json({ error: 'Item ID is required' });
                return;
            }
            
            if (!req.user?.businessId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            
            const itemId = parseInt(id);
            
            if (isNaN(itemId)) {
                res.status(400).json({ error: 'Invalid item ID' });
                return;
            }

            if (quantity === undefined || typeof quantity !== 'number') {
                res.status(400).json({ error: 'Quantity is required and must be a number' });
                return;
            }

            logger(`API endpoint PUT /items/${id}/stock was called...`);
            const updatedItem = await ItemService.updateStock(itemId, req.user.businessId, quantity);
            
            if (!updatedItem) {
                res.status(404).json({ error: 'Item not found' });
                return;
            }

            res.json(updatedItem);
        } catch (error) {
            logger(`Error updating stock: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Get low stock items for the current business
    public static getLowStockItems: RequestHandler = async (req: AuthRequest, res: Response) => {
        try {
            const { threshold } = req.query;
            
            if (!req.user?.businessId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }

            const thresholdValue = threshold ? parseInt(threshold as string) : 10;
            
            logger(`API endpoint /items/low-stock was called...`);
            const items = await ItemService.getLowStockItems(req.user.businessId, thresholdValue);
            res.json(items);
        } catch (error) {
            logger(`Error getting low stock items: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}