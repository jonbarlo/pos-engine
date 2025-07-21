# Claude API Integration Guide for AI Recipe Generation

## Overview
This guide details how to integrate Anthropic's Claude API for AI-powered recipe generation in the POS Engine system.

## Why Claude for Recipe Generation?

### Advantages
✅ **Cost Effective** - 50-70% cheaper than GPT-4  
✅ **High Quality** - Excellent at creative tasks like recipe generation  
✅ **Reliable** - Stable API with good uptime  
✅ **Context Aware** - Good at understanding ingredient relationships  
✅ **Structured Output** - Can follow JSON formatting requirements well  

### Cost Comparison
| Provider | Cost per Recipe | Monthly (3,000 recipes) |
|----------|----------------|-------------------------|
| Claude 3.5 Sonnet | $0.015-0.03 | $45-90 |
| OpenAI GPT-4 | $0.03-0.06 | $90-180 |
| Local LLM | One-time setup | $0 |

## Claude API Setup

### 1. Get API Access
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create account and verify email
3. Generate API key
4. Add to environment variables

### 2. Install Dependencies
```bash
npm install @anthropic-ai/sdk
```

### 3. Environment Configuration
```env
ANTHROPIC_API_KEY=your_claude_api_key_here
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CLAUDE_MAX_TOKENS=2000
CLAUDE_TEMPERATURE=0.7
```

## Implementation

### 1. Claude Service Implementation
**File:** `src/services/aiProviders/claudeService.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { AIRecipeRequest, AIRecipeResponse } from '../aiRecipeGenerationService';

export class ClaudeRecipeService {
  private anthropic: Anthropic;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
    this.maxTokens = parseInt(process.env.CLAUDE_MAX_TOKENS || '2000');
    this.temperature = parseFloat(process.env.CLAUDE_TEMPERATURE || '0.7');
  }

  async generateRecipe(request: AIRecipeRequest): Promise<AIRecipeResponse> {
    try {
      const prompt = this.buildRecipePrompt(request);
      
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: [{
          role: "user",
          content: prompt
        }]
      });

      return this.parseRecipeResponse(response);
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`Failed to generate recipe with Claude: ${error.message}`);
    }
  }

  private buildRecipePrompt(request: AIRecipeRequest): string {
    const ingredients = request.availableIngredients
      .map(i => `${i.name} (${i.quantity} ${i.category})`)
      .join(', ');

    return `You are a professional chef and recipe developer with expertise in ${request.cuisine} cuisine.

AVAILABLE INGREDIENTS:
${ingredients}

REQUIREMENTS:
- Cuisine: ${request.cuisine}
- Difficulty: ${request.difficulty}
- Servings: ${request.servings}
- Dietary restrictions: ${request.dietaryRestrictions?.join(', ') || 'None'}

INSTRUCTIONS:
1. Create a delicious, restaurant-quality recipe using primarily the available ingredients
2. You may suggest 1-2 additional common ingredients if needed for balance
3. Provide clear, step-by-step cooking instructions
4. Include accurate prep and cook times
5. Estimate the cost based on ingredient quantities
6. Rate your confidence in the recipe (0.0-1.0)

RESPONSE FORMAT (JSON only):
{
  "recipeName": "Creative Recipe Name",
  "description": "Brief description of the dish",
  "ingredients": [
    {
      "name": "Ingredient Name",
      "quantity": 2,
      "unit": "cups",
      "notes": "Optional preparation notes"
    }
  ],
  "instructions": [
    "Step 1: First instruction",
    "Step 2: Second instruction"
  ],
  "prepTime": 15,
  "cookTime": 25,
  "difficulty": "medium",
  "estimatedCost": 12.50,
  "confidence": 0.85
}`;
  }

  private parseRecipeResponse(response: any): AIRecipeResponse {
    try {
      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      const recipe = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      const requiredFields = ['recipeName', 'description', 'ingredients', 'instructions', 'prepTime', 'cookTime', 'difficulty', 'estimatedCost', 'confidence'];
      for (const field of requiredFields) {
        if (!recipe[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      return recipe;
    } catch (error) {
      console.error('Failed to parse Claude response:', error);
      throw new Error(`Invalid recipe format from Claude: ${error.message}`);
    }
  }
}
```

### 2. Enhanced AI Recipe Generation Service
**File:** `src/services/aiRecipeGenerationService.ts`

```typescript
import { ClaudeRecipeService } from './aiProviders/claudeService';
import { OpenAIRecipeService } from './aiProviders/openaiService';

export class AIRecipeGenerationService {
  private claudeService: ClaudeRecipeService;
  private openaiService: OpenAIRecipeService;

  constructor() {
    this.claudeService = new ClaudeRecipeService();
    this.openaiService = new OpenAIRecipeService();
  }

  async generateRecipe(request: AIRecipeRequest): Promise<AIRecipeResponse> {
    try {
      // Primary: Claude
      console.log('Generating recipe with Claude...');
      return await this.claudeService.generateRecipe(request);
    } catch (error) {
      console.log('Claude failed, trying OpenAI fallback...', error.message);
      
      try {
        // Fallback: OpenAI
        return await this.openaiService.generateRecipe(request);
      } catch (fallbackError) {
        console.error('Both AI providers failed:', fallbackError);
        throw new Error('Recipe generation failed with all providers');
      }
    }
  }

  async generateMultipleRecipes(requests: AIRecipeRequest[]): Promise<AIRecipeResponse[]> {
    const recipes: AIRecipeResponse[] = [];
    
    for (const request of requests) {
      try {
        const recipe = await this.generateRecipe(request);
        recipes.push(recipe);
      } catch (error) {
        console.error(`Failed to generate recipe for ${request.cuisine}:`, error);
        // Continue with other recipes
      }
    }
    
    return recipes;
  }
}
```

### 3. Recipe Validation Enhancement
**File:** `src/services/recipeValidationService.ts`

```typescript
export class RecipeValidationService {
  async validateClaudeRecipe(recipe: AIRecipeResponse): Promise<ValidationResult> {
    const validations = await Promise.all([
      this.checkIngredientCompatibility(recipe.ingredients),
      this.validateCookingSafety(recipe.instructions),
      this.checkAllergens(recipe.ingredients),
      this.validateClaudeSpecificRules(recipe)
    ]);

    const [compatibility, safety, allergens, claudeRules] = validations;
    
    return {
      isValid: compatibility && safety && !allergens.hasAllergens && claudeRules,
      confidence: this.calculateConfidence(validations),
      warnings: allergens.warnings,
      provider: 'claude'
    };
  }

  private async validateClaudeSpecificRules(recipe: AIRecipeResponse): Promise<boolean> {
    // Claude-specific validation rules
    const rules = [
      recipe.recipeName.length > 0 && recipe.recipeName.length < 100,
      recipe.ingredients.length > 0 && recipe.ingredients.length < 20,
      recipe.instructions.length > 0 && recipe.instructions.length < 15,
      recipe.prepTime > 0 && recipe.prepTime < 180,
      recipe.cookTime > 0 && recipe.cookTime < 300,
      recipe.confidence >= 0.0 && recipe.confidence <= 1.0,
      recipe.estimatedCost > 0 && recipe.estimatedCost < 100
    ];

    return rules.every(rule => rule);
  }
}
```

## API Integration

### 1. Enhanced Smart Suggestions Controller
**File:** `src/controllers/smartRecipeSuggestionController.ts`

```typescript
export const getSmartSuggestions: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const businessId = (req as any).user?.businessId;
  if (!businessId) {
    res.status(401).json({
      success: false,
      error: 'Business ID not found in token'
    });
    return;
  }

  const criteria: SmartSuggestionCriteria = {
    businessId,
    includeExpiringItems: req.query.includeExpiringItems === 'true',
    includeUnderperformingItems: req.query.includeUnderperformingItems === 'true',
    maxDaysToExpiry: req.query.maxDaysToExpiry ? parseInt(req.query.maxDaysToExpiry as string) : 7,
    minSalesVelocity: req.query.minSalesVelocity ? parseFloat(req.query.minSalesVelocity as string) : 0.1,
    maxDaysSinceLastSale: req.query.maxDaysSinceLastSale ? parseInt(req.query.maxDaysSinceLastSale as string) : 30,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    status: req.query.status as 'pending' | 'cooked' | 'expired' | 'dismissed' || 'pending',
    includeCooked: req.query.includeCooked === 'true',
    includeAIGenerated: req.query.includeAIGenerated === 'true' // NEW
  };

  try {
    const suggestions = await SmartRecipeSuggestionService.getSmartSuggestions(criteria);

    res.json({
      success: true,
      suggestions,
      criteria,
      totalSuggestions: suggestions.length,
      aiProvider: 'claude' // Indicate which AI provider was used
    });
  } catch (error) {
    console.error('Error getting smart suggestions:', error);
    res.status(200).json({
      success: true,
      suggestions: [],
      criteria,
      totalSuggestions: 0,
      aiProvider: 'none'
    });
  }
};
```

### 2. AI Recipe Generation Endpoint
**File:** `src/controllers/aiRecipeController.ts`

```typescript
export const generateAIRecipe = async (req: Request, res: Response) => {
  const { expiringItems, cuisine, difficulty, servings, dietaryRestrictions } = req.body;
  
  try {
    // 1. Generate AI recipe with Claude
    const aiRecipe = await AIRecipeGenerationService.generateRecipe({
      availableIngredients: expiringItems,
      cuisine,
      difficulty,
      servings,
      dietaryRestrictions
    });
    
    // 2. Validate recipe
    const validation = await RecipeValidationService.validateClaudeRecipe(aiRecipe);
    
    // 3. Create approval record
    const approval = await AIRecipeApprovalModel.create({
      businessId: req.user.businessId,
      aiGeneratedRecipe: JSON.stringify(aiRecipe),
      status: validation.isValid ? 'pending' : 'rejected',
      aiProvider: 'claude',
      confidence: aiRecipe.confidence
    });
    
    res.json({
      success: true,
      recipe: aiRecipe,
      validation,
      approvalId: approval.id,
      aiProvider: 'claude'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      aiProvider: 'claude'
    });
  }
};
```

## Cost Optimization

### 1. Caching Strategy
```typescript
export class ClaudeRecipeCache {
  private cache: Map<string, AIRecipeResponse> = new Map();
  private ttl: number = 24 * 60 * 60 * 1000; // 24 hours

  async getCachedRecipe(key: string): Promise<AIRecipeResponse | null> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached;
    }
    return null;
  }

  setCachedRecipe(key: string, recipe: AIRecipeResponse): void {
    this.cache.set(key, { ...recipe, timestamp: Date.now() });
  }

  generateCacheKey(ingredients: any[], cuisine: string, difficulty: string): string {
    const sortedIngredients = ingredients
      .map(i => i.name.toLowerCase())
      .sort()
      .join(',');
    return `${sortedIngredients}-${cuisine}-${difficulty}`.replace(/[^a-z0-9,-]/g, '');
  }
}
```

### 2. Batch Processing
```typescript
export class ClaudeBatchProcessor {
  async generateBatchRecipes(requests: AIRecipeRequest[]): Promise<AIRecipeResponse[]> {
    const batchSize = 5; // Claude can handle multiple requests efficiently
    const batches = this.chunkArray(requests, batchSize);
    const results: AIRecipeResponse[] = [];

    for (const batch of batches) {
      const batchPromises = batch.map(request => 
        this.claudeService.generateRecipe(request)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        }
      }
    }

    return results;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
```

## Monitoring and Analytics

### 1. Claude Usage Tracking
```typescript
export class ClaudeUsageTracker {
  async trackRecipeGeneration(request: AIRecipeRequest, response: AIRecipeResponse, duration: number): Promise<void> {
    await UsageLogModel.create({
      provider: 'claude',
      model: 'claude-3-5-sonnet-20241022',
      requestTokens: this.estimateInputTokens(request),
      responseTokens: this.estimateOutputTokens(response),
      duration,
      cost: this.calculateCost(request, response),
      success: true,
      timestamp: new Date()
    });
  }

  private calculateCost(request: AIRecipeRequest, response: AIRecipeResponse): number {
    const inputTokens = this.estimateInputTokens(request);
    const outputTokens = this.estimateOutputTokens(response);
    
    // Claude 3.5 Sonnet pricing (as of 2024)
    const inputCost = (inputTokens / 1000000) * 3.00; // $3.00 per 1M input tokens
    const outputCost = (outputTokens / 1000000) * 15.00; // $15.00 per 1M output tokens
    
    return inputCost + outputCost;
  }
}
```

## Testing

### 1. Claude API Test
**File:** `test/automated/test-claude-recipe-generation.js`

```javascript
const axios = require('axios');

async function testClaudeRecipeGeneration() {
  console.log('🧪 Testing Claude Recipe Generation...');
  
  try {
    const response = await axios.post('http://localhost:3031/api/ai/generate-recipe', {
      expiringItems: [
        { name: 'Fresh Basil', quantity: 2, category: 'herbs' },
        { name: 'Cherry Tomatoes', quantity: 1, category: 'vegetables' },
        { name: 'Mozzarella', quantity: 200, category: 'dairy' }
      ],
      cuisine: 'Italian',
      difficulty: 'medium',
      servings: 4
    }, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Claude recipe generation successful!');
      console.log('   Recipe:', response.data.recipe.recipeName);
      console.log('   AI Provider:', response.data.aiProvider);
      console.log('   Confidence:', response.data.recipe.confidence);
      console.log('   Estimated Cost:', response.data.recipe.estimatedCost);
    }
  } catch (error) {
    console.error('❌ Claude recipe generation failed:', error.response?.data || error.message);
  }
}
```

## License and Compliance

### 1. Commercial Use
✅ **Claude API** - Commercial license included with API access  
✅ **Cursor License** - Covers development and usage  
⚠️ **Review Terms** - Check Anthropic's terms for your specific use case  

### 2. Attribution Requirements
- Include "Generated with Claude AI" in recipe descriptions
- Maintain audit trail of AI-generated recipes
- Respect Anthropic's usage guidelines

### 3. Data Privacy
- Don't send sensitive customer data to Claude
- Use ingredient names only, not personal information
- Implement proper data retention policies

## Success Metrics

### Performance Targets
- **Generation Speed:** < 3 seconds per recipe
- **Success Rate:** > 95% successful generations
- **Cost per Recipe:** < $0.02 average
- **Chef Approval Rate:** > 85% of Claude recipes approved

### Monitoring Dashboard
```typescript
interface ClaudeMetrics {
  totalRecipesGenerated: number;
  averageGenerationTime: number;
  totalCost: number;
  successRate: number;
  chefApprovalRate: number;
  popularCuisines: string[];
  costTrends: Array<{ date: string; cost: number }>;
}
```

## Conclusion

Claude API is an excellent choice for AI recipe generation, offering:
- **Cost-effectiveness** compared to other AI providers
- **High-quality output** suitable for restaurant use
- **Reliable performance** with good uptime
- **Easy integration** with existing systems

The implementation provides a robust foundation for AI-powered recipe generation while maintaining quality control through validation and chef approval workflows. 