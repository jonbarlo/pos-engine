import { validateSaleNumber, extractBusinessCodeFromSaleNumber } from './saleNumberGenerator';

// Mock the entire module to avoid database connections
jest.mock('./saleNumberGenerator', () => ({
  ...jest.requireActual('./saleNumberGenerator'),
  generateSaleNumber: jest.fn()
}));

describe('Sale Number Generator', () => {
  describe('validateSaleNumber', () => {
    it('should validate correct sale number format', () => {
      expect(validateSaleNumber('SALE-IT-2024-001')).toBe(true);
      expect(validateSaleNumber('SALE-TEST-2024-123')).toBe(true);
      expect(validateSaleNumber('SALE-BIZ-2024-999')).toBe(true);
    });

    it('should reject invalid sale number formats', () => {
      expect(validateSaleNumber('SALE-IT-2024-1')).toBe(false); // Too few digits
      expect(validateSaleNumber('SALE-IT-2024-0001')).toBe(false); // Too many digits
      expect(validateSaleNumber('SALE-IT-24-001')).toBe(false); // Wrong year format
      expect(validateSaleNumber('SALE-ITALY-2024-001')).toBe(false); // Too long business code
      expect(validateSaleNumber('SALE-I-2024-001')).toBe(false); // Too short business code
      expect(validateSaleNumber('SALE-IT-2024-001-EXTRA')).toBe(false); // Extra text
    });
  });

  describe('extractBusinessCodeFromSaleNumber', () => {
    it('should extract business code from valid sale number', () => {
      expect(extractBusinessCodeFromSaleNumber('SALE-IT-2024-001')).toBe('IT');
      expect(extractBusinessCodeFromSaleNumber('SALE-TEST-2024-123')).toBe('TEST');
      expect(extractBusinessCodeFromSaleNumber('SALE-BIZ-2024-999')).toBe('BIZ');
    });

    it('should return null for invalid sale numbers', () => {
      expect(extractBusinessCodeFromSaleNumber('SALE-IT-2024-1')).toBe(null);
      expect(extractBusinessCodeFromSaleNumber('INVALID-FORMAT')).toBe(null);
      expect(extractBusinessCodeFromSaleNumber('SALE-ITALY-2024-001')).toBe(null);
    });
  });
}); 