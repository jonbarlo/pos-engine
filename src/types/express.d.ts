import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      t: (key: string, options?: any) => any;
      language: string;
    }
  }
}

export {}; 