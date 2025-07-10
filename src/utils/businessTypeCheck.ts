import { BusinessModel } from '../models/BusinessModel';

/**
 * Check if a business is of restaurant type
 * @param businessId - The business ID to check
 * @returns Promise<boolean> - True if business is restaurant type
 */
export async function isRestaurantBusiness(businessId: number): Promise<boolean> {
  const business = await BusinessModel.findByPk(businessId);
  return business?.type === 'restaurant';
}

/**
 * Ensure a business is of restaurant type, throw error if not
 * @param businessId - The business ID to check
 * @throws Error if business is not restaurant type
 */
export async function requireRestaurantBusiness(businessId: number): Promise<void> {
  const isRestaurant = await isRestaurantBusiness(businessId);
  if (!isRestaurant) {
    throw new Error('This feature is only available for restaurant businesses');
  }
}

/**
 * Get business type for a given business ID
 * @param businessId - The business ID
 * @returns Promise<string> - The business type ('generic' or 'restaurant')
 */
export async function getBusinessType(businessId: number): Promise<string> {
  const business = await BusinessModel.findByPk(businessId);
  return business?.type || 'generic';
}

/**
 * Check if a feature is available for a business type
 * @param businessId - The business ID
 * @param feature - The feature name to check
 * @returns Promise<boolean> - True if feature is available
 */
export async function isFeatureAvailable(businessId: number, feature: string): Promise<boolean> {
  const businessType = await getBusinessType(businessId);
  
  const featureAvailability: Record<string, string[]> = {
    'generic': [
      'split_billing',
      'basic_pos',
      'inventory_management',
      'sales_tracking',
      'user_management'
    ],
    'restaurant': [
      'split_billing',
      'basic_pos',
      'inventory_management',
      'sales_tracking',
      'user_management',
      'table_management',
      'order_management',
      'kitchen_display',
      'reservation_system',
      'menu_management',
      'customer_management'
    ]
  };
  
  return featureAvailability[businessType]?.includes(feature) || false;
} 