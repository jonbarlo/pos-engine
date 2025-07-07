import { Request, Response, RequestHandler } from 'express';
import { logger } from '../utils/logger';

export class ItemController {

    // regular function
    public static getAll: RequestHandler = async (req: Request, res: Response) => {
        logger('API endpoint /items was called...');
        res.send('List of items');
    };
}