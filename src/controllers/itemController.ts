import { Request, Response, RequestHandler } from 'express';
import { logger } from '../utils/logger';
import { ItemService } from '../services/itemService';

export class ItemController {

    // Get all items
    public static getAll: RequestHandler = async (req: Request, res: Response) => {
        try {
            logger('API endpoint /items was called...');
            const items = await ItemService.getAllItems();
            res.json(items);
        } catch (error) {
            logger(`Error getting items: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Get item by ID
    public static getItemById: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: 'Item ID is required' });
                return;
            }
            
            const itemId = parseInt(id);
            
            if (isNaN(itemId)) {
                res.status(400).json({ error: 'Invalid item ID' });
                return;
            }

            logger(`API endpoint /items/${id} was called...`);
            const item = await ItemService.getItemById(itemId);
            
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

    // Create new item
    public static createItem: RequestHandler = async (req: Request, res: Response) => {
        try {
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

            // Check if SKU already exists
            if (sku) {
                const skuExists = await ItemService.itemExistsBySku(sku);
                if (skuExists) {
                    res.status(409).json({ 
                        error: 'Item with this SKU already exists' 
                    });
                    return;
                }
            }

            // Check if barcode already exists
            if (barcode) {
                const barcodeExists = await ItemService.itemExistsByBarcode(barcode);
                if (barcodeExists) {
                    res.status(409).json({ 
                        error: 'Item with this barcode already exists' 
                    });
                    return;
                }
            }

            logger('API endpoint POST /items was called...');
            const newItem = await ItemService.createItem({ 
                name, 
                description, 
                price, 
                stock: stock || 0, 
                category, 
                sku, 
                barcode 
            });
            res.status(201).json(newItem);
        } catch (error) {
            logger(`Error creating item: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Update item
    public static updateItem: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: 'Item ID is required' });
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
            const updatedItem = await ItemService.updateItem(itemId, updateData);
            
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

    // Delete item
    public static deleteItem: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                res.status(400).json({ error: 'Item ID is required' });
                return;
            }
            
            const itemId = parseInt(id);
            
            if (isNaN(itemId)) {
                res.status(400).json({ error: 'Invalid item ID' });
                return;
            }

            logger(`API endpoint DELETE /items/${id} was called...`);
            const deleted = await ItemService.deleteItem(itemId);
            
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

    // Get items by category
    public static getItemsByCategory: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { category } = req.params;
            
            if (!category) {
                res.status(400).json({ error: 'Category is required' });
                return;
            }

            logger(`API endpoint /items/category/${category} was called...`);
            const items = await ItemService.getItemsByCategory(category);
            res.json(items);
        } catch (error) {
            logger(`Error getting items by category: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Search items
    public static searchItems: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { q } = req.query;
            
            if (!q || typeof q !== 'string') {
                res.status(400).json({ error: 'Search query is required' });
                return;
            }

            logger(`API endpoint /items/search?q=${q} was called...`);
            const items = await ItemService.searchItems(q);
            res.json(items);
        } catch (error) {
            logger(`Error searching items: ${error}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Update stock
    public static updateStock: RequestHandler = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { quantity } = req.body;
            
            if (!id) {
                res.status(400).json({ error: 'Item ID is required' });
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
            const updatedItem = await ItemService.updateStock(itemId, quantity);
            
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
}