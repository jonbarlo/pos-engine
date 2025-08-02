// Valid Unsplash photo IDs organized by category
const VALID_UNSPLASH_IDS = {
  // Inventory Items (Raw Ingredients)
  inventory: {
    'Dairy': 'photo-1550583724-b2692b85b150', // milk, cheese
    'Meat': 'photo-1558030006-450675393462', // raw meat
    'Produce': 'photo-1542838132-92c53300491e', // fresh vegetables
    'Grains': 'photo-1574323347407-f5e1ad6d020b', // flour, rice
    'Spices': 'photo-1556909114-f6e7ad7d3136', // spices
    'Beverages': 'photo-1556679343-c7306c1976bc', // water, juice
    'Frozen': 'photo-1578662996442-48f60103fc96', // frozen items
    'Canned': 'photo-1556909114-f6e1ad6d3136', // canned goods
    'Bakery': 'photo-1509440159596-234908bf2d2d', // bread, dough
    'Seafood': 'photo-1558030006-450675393462', // raw fish
    'Pizza': 'photo-1565299624946-b28f40a0ca4b', // pizza ingredients
    'Pasta': 'photo-1621996346565-e3dbc353d946', // pasta ingredients
    'Rolls': 'photo-1579584425555-c3ce17fd4351', // sushi ingredients
    'Nigiri': 'photo-1579584425555-c3ce17fd4351', // sushi ingredients
    'Soup': 'photo-1547592166-23ac45744acd', // soup ingredients
    'Coffee': 'photo-1509042239860-f550ce710b93', // coffee ingredients
    'Pastry': 'photo-1571877227200-a0d98ea607e9', // pastry ingredients
    'Tea': 'photo-1541167760496-1628856ab772', // tea ingredients
    'Smoothies': 'photo-1556679343-c7306c1976bc', // smoothie ingredients
    'Desserts': 'photo-1565958011703-44f9829ba187', // dessert ingredients
    'Oils': 'photo-1553621042-f6e147245754', // oils
    'Sauces': 'photo-1547592166-23ac45744acd', // sauces
    'Herbs': 'photo-1565299624946-b28f40a0ca4b', // herbs
    'Vegetables': 'photo-1556909114-f6e7ad7d3136', // vegetables
    'Fruits': 'photo-1565299624946-b28f40a0ca4b', // fruits
    'Fish': 'photo-1579584425555-c3ce17fd4351', // fish
    'Bread': 'photo-1628840042765-356cda07504e', // bread
    'Sweeteners': 'photo-1551183053-bf91a1d81141', // sweeteners
    'Syrups': 'photo-1551024506-0bccd828d307', // syrups
    'Ingredients': 'photo-1604382354936-07c5d9983bd3', // general ingredients
    'default': 'photo-1542838132-92c53300491e' // fresh produce as default
  },
  
  // Menu Items (Finished Dishes)
  menu: {
    'Pizza': 'photo-1565299624946-b28f40a0ca4b', // finished pizza
    'Pasta': 'photo-1551183053-b3d9d9b7cde6', // cooked pasta
    'Sushi': 'photo-1579584425555-c3d17c49fabb', // sushi rolls
    'Coffee': 'photo-1509042239860-f550ce710b93', // coffee drinks
    'Dessert': 'photo-1565958011703-44f9829ba187', // desserts
    'Salad': 'photo-1512621776951-a57141f2eefd', // fresh salads
    'Soup': 'photo-1547592166-23ac45744acd', // hot soup
    'Sandwich': 'photo-1528735602787-4698ddf0a112', // sandwiches
    'Burger': 'photo-1565299624946-b28f40a0ca4b', // burgers
    'Steak': 'photo-1558030006-450675393462', // cooked steak
    'Seafood': 'photo-1579584425555-c3d17c49fabb', // cooked seafood
    'Beverage': 'photo-1509042239860-f550ce710b93', // drinks
    'Rolls': 'photo-1579584425555-c3d17c49fabb', // sushi rolls
    'Nigiri': 'photo-1579584425555-c3d17c49fabb', // sushi nigiri
    'Soups': 'photo-1547592166-23ac45744acd', // soups
    'Pastries': 'photo-1571877227200-a0d98ea607e9', // pastries
    'Tea': 'photo-1541167760496-1628856ab772', // tea
    'Smoothies': 'photo-1556679343-c7306c1976bc', // smoothies
    'Beverages': 'photo-1509042239860-f550ce710b93', // beverages
    'Desserts': 'photo-1565958011703-44f9829ba187', // desserts
    'default': 'photo-1565299624946-b28f40a0ca4b' // pizza as default
  },

  // Businesses (Restaurant/Food Business Images)
  business: {
    'italian': '1414235077428-338989a2e8c0', // Italian restaurant interior
    'pizza': '1565299624946-b28f40a0ca4b', // Pizza restaurant
    'pasta': '1551183053-b3d9d9b7cde6', // Pasta restaurant
    'restaurant': '1414235077428-338989a2e8c0', // General restaurant
    'cafe': '1509042239860-f550ce710b93', // Coffee shop
    'bakery': '1509440159596-234908bf2d2d', // Bakery
    'sushi': '1579584425555-c3d17c49fabb', // Sushi restaurant
    'default': '1414235077428-338989a2e8c0' // Restaurant interior as default
  },

  // Menu Categories (Food Category Images)
  category: {
    'Pizza': '1565299624946-b28f40a0ca4b', // Pizza category
    'Pasta': '1551183053-b3d9d9b7cde6', // Pasta category
    'Desserts': '1565958011703-44f9829ba187', // Desserts category
    'Beverages': '1509042239860-f550ce710b93', // Beverages category
    'Salads': '1512621776951-a57141f2eefd', // Salads category
    'Soups': '1547592166-23ac45744acd', // Soups category
    'Appetizers': '1565299624946-b28f40a0ca4b', // Appetizers category
    'Main Course': '1558030006-450675393462', // Main course category
    'Sides': '1542838132-92c53300491e', // Side dishes category
    'Drinks': '1509042239860-f550ce710b93', // Drinks category
    'Coffee': '1509042239860-f550ce710b93', // Coffee category
    'Tea': '1541167760496-1628856ab772', // Tea category
    'Wine': '1510812431401-41d2bd2722f3', // Wine category
    'Beer': '1556909114-f6e7ad7d3136', // Beer category
    'Cocktails': '1509042239860-f550ce710b93', // Cocktails category
    'Sushi': '1579584425555-c3d17c49fabb', // Sushi category
    'Rolls': '1579584425555-c3d17c49fabb', // Sushi rolls category
    'Nigiri': '1579584425555-c3d17c49fabb', // Sushi nigiri category
    'Pastries': '1571877227200-a0d98ea607e9', // Pastries category
    'Bread': '1628840042765-356cda07504e', // Bread category
    'default': '1565299624946-b28f40a0ca4b' // Pizza as default
  }
};

// Type definition for item data
export interface ItemData {
  name: string;
  category: string;
  businessSlug: string;
  description?: string;
}

// Type definition for business data
export interface BusinessData {
  name: string;
  slug: string;
  type: string;
  description?: string;
}

// Type definition for category data
export interface CategoryData {
  name: string;
  businessSlug: string;
  description?: string;
}

/**
 * Extracts category from item data for image selection
 */
function extractCategoryFromItem(item: ItemData): string {
  // For inventory items, use the category directly
  if (item.category) {
    return item.category;
  }
  
  // For menu items, try to extract from name or description
  const name = item.name.toLowerCase();
  const description = item.description?.toLowerCase() || '';
  
  // Check for specific food types in name/description
  if (name.includes('pizza') || description.includes('pizza')) return 'Pizza';
  if (name.includes('pasta') || description.includes('pasta')) return 'Pasta';
  if (name.includes('sushi') || description.includes('sushi')) return 'Sushi';
  if (name.includes('roll') || description.includes('roll')) return 'Rolls';
  if (name.includes('nigiri') || description.includes('nigiri')) return 'Nigiri';
  if (name.includes('coffee') || description.includes('coffee')) return 'Coffee';
  if (name.includes('dessert') || description.includes('dessert')) return 'Dessert';
  if (name.includes('salad') || description.includes('salad')) return 'Salad';
  if (name.includes('soup') || description.includes('soup')) return 'Soup';
  if (name.includes('sandwich') || description.includes('sandwich')) return 'Sandwich';
  if (name.includes('burger') || description.includes('burger')) return 'Burger';
  if (name.includes('steak') || description.includes('steak')) return 'Steak';
  if (name.includes('seafood') || description.includes('seafood')) return 'Seafood';
  if (name.includes('beverage') || description.includes('beverage')) return 'Beverage';
  if (name.includes('pastry') || description.includes('pastry')) return 'Pastries';
  if (name.includes('tea') || description.includes('tea')) return 'Tea';
  if (name.includes('smoothie') || description.includes('smoothie')) return 'Smoothies';
  if (name.includes('wine') || description.includes('wine')) return 'Beverages';
  if (name.includes('sake') || description.includes('sake')) return 'Beverages';
  if (name.includes('miso') || description.includes('miso')) return 'Soups';
  if (name.includes('latte') || description.includes('latte')) return 'Coffee';
  if (name.includes('cappuccino') || description.includes('cappuccino')) return 'Coffee';
  if (name.includes('espresso') || description.includes('espresso')) return 'Coffee';
  if (name.includes('muffin') || description.includes('muffin')) return 'Pastries';
  if (name.includes('croissant') || description.includes('croissant')) return 'Pastries';
  if (name.includes('tiramisu') || description.includes('tiramisu')) return 'Desserts';
  if (name.includes('cannoli') || description.includes('cannoli')) return 'Desserts';
  
  return 'default';
}

/**
 * Extracts business type for image selection
 */
function extractBusinessType(business: BusinessData): string {
  const name = business.name.toLowerCase();
  const slug = business.slug.toLowerCase();
  const type = business.type.toLowerCase();
  const description = business.description?.toLowerCase() || '';
  
  if (name.includes('italian') || slug.includes('italian') || description.includes('italian')) return 'italian';
  if (name.includes('pizza') || slug.includes('pizza') || description.includes('pizza')) return 'pizza';
  if (name.includes('pasta') || slug.includes('pasta') || description.includes('pasta')) return 'pasta';
  if (name.includes('sushi') || slug.includes('sushi') || description.includes('sushi')) return 'sushi';
  if (name.includes('cafe') || slug.includes('cafe') || description.includes('cafe')) return 'cafe';
  if (name.includes('coffee') || slug.includes('coffee') || description.includes('coffee')) return 'cafe';
  if (name.includes('bakery') || slug.includes('bakery') || description.includes('bakery')) return 'bakery';
  if (type === 'restaurant') return 'restaurant';
  if (type === 'cafe') return 'cafe';
  if (type === 'bakery') return 'bakery';
  
  return 'default';
}

/**
 * Extracts category name for image selection
 */
function extractCategoryName(category: CategoryData): string {
  const name = category.name.toLowerCase();
  const description = category.description?.toLowerCase() || '';
  
  if (name.includes('pizza')) return 'Pizza';
  if (name.includes('pasta')) return 'Pasta';
  if (name.includes('dessert')) return 'Desserts';
  if (name.includes('beverage')) return 'Beverages';
  if (name.includes('drink')) return 'Beverages';
  if (name.includes('salad')) return 'Salads';
  if (name.includes('soup')) return 'Soups';
  if (name.includes('appetizer')) return 'Appetizers';
  if (name.includes('main')) return 'Main Course';
  if (name.includes('side')) return 'Sides';
  if (name.includes('coffee')) return 'Coffee';
  if (name.includes('tea')) return 'Tea';
  if (name.includes('wine')) return 'Wine';
  if (name.includes('beer')) return 'Beer';
  if (name.includes('cocktail')) return 'Cocktails';
  if (name.includes('sushi')) return 'Sushi';
  if (name.includes('roll')) return 'Rolls';
  if (name.includes('nigiri')) return 'Nigiri';
  if (name.includes('pastry')) return 'Pastries';
  if (name.includes('bread')) return 'Bread';
  
  return 'default';
}

/**
 * Generates image URL for inventory items (raw ingredients)
 * Uses valid Unsplash photo IDs for reliability
 */
export function generateInventoryImageUrl(item: ItemData): string {
  const category = extractCategoryFromItem(item);
  const photoId = VALID_UNSPLASH_IDS.inventory[category as keyof typeof VALID_UNSPLASH_IDS.inventory] || 
                  VALID_UNSPLASH_IDS.inventory.default;
  
  return `https://images.unsplash.com/photo-${photoId}?w=400&h=300&fit=crop&crop=center`;
}

/**
 * Generates image URL for menu items (finished dishes)
 * Uses valid Unsplash photo IDs for reliability
 */
export function generateMenuItemImageUrl(item: ItemData): string {
  const category = extractCategoryFromItem(item);
  const photoId = VALID_UNSPLASH_IDS.menu[category as keyof typeof VALID_UNSPLASH_IDS.menu] || 
                  VALID_UNSPLASH_IDS.menu.default;
  
  return `https://images.unsplash.com/photo-${photoId}?w=400&h=300&fit=crop&crop=center`;
}

/**
 * Generates image URL for businesses (restaurant/food business images)
 * Uses valid Unsplash photo IDs for reliability
 */
export function generateBusinessImageUrl(business: BusinessData): string {
  const businessType = extractBusinessType(business);
  const photoId = VALID_UNSPLASH_IDS.business[businessType as keyof typeof VALID_UNSPLASH_IDS.business] || 
                  VALID_UNSPLASH_IDS.business.default;
  
  return `https://images.unsplash.com/photo-${photoId}?w=600&h=400&fit=crop&crop=center`;
}

/**
 * Generates image URL for menu categories (food category images)
 * Uses valid Unsplash photo IDs for reliability
 */
export function generateCategoryImageUrl(category: CategoryData): string {
  const categoryName = extractCategoryName(category);
  const photoId = VALID_UNSPLASH_IDS.category[categoryName as keyof typeof VALID_UNSPLASH_IDS.category] || 
                  VALID_UNSPLASH_IDS.category.default;
  
  return `https://images.unsplash.com/photo-${photoId}?w=400&h=300&fit=crop&crop=center`;
}

/**
 * Generates batch image URLs for multiple items
 */
export function generateBatchImageUrls(items: ItemData[], type: 'inventory' | 'menu'): string[] {
  return items.map(item => 
    type === 'inventory' ? generateInventoryImageUrl(item) : generateMenuItemImageUrl(item)
  );
}

/**
 * Validates if an Unsplash photo ID is in the correct format
 */
export function isValidUnsplashPhotoId(photoId: string): boolean {
  // Valid format: photo-xxxxxxxxxxxxxxxxxxxxxxxxxx (32 characters after photo-)
  const pattern = /^photo-[a-zA-Z0-9]{32}$/;
  return pattern.test(photoId);
}

/**
 * Extracts photo ID from a full Unsplash URL
 */
export function extractPhotoIdFromUrl(url: string): string | null {
  const match = url.match(/photo-([a-zA-Z0-9]{32})/);
  return match ? match[0] : null;
} 