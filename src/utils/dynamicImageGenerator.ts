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
  }
};

// Type definition for item data
export interface ItemData {
  name: string;
  category: string;
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