# AI Recipe Generation Implementation Plan

## Overview
Transform the current smart recipe suggestion system from "matching existing recipes to inventory" to "AI-powered recipe generation from available ingredients."

## Current State Analysis
**What we have:** Smart matching of existing recipes to expiring inventory  
**What we need:** AI-powered recipe generation from available ingredients

## Implementation Plan

### Phase 1: AI Integration Setup

#### 1.1 AI Service Layer
**File:** `src/services/aiRecipeGenerationService.ts`

```typescript
interface AIRecipeRequest {
  availableIngredients: Array<{
    name: string;
    quantity: number;
    category: string;
    expirationDate?: Date;
  }>;
  cuisine: string;
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  dietaryRestrictions?: string[];
}

interface AIRecipeResponse {
  recipeName: string;
  description: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    notes?: string;
  }>;
  instructions: string[];
  prepTime: number;
  cookTime: number;
  difficulty: string;
  estimatedCost: number;
  confidence: number;
}
```

#### 1.2 AI Provider Integration
**Options:**
- **OpenAI GPT-4** - Most capable, expensive
- **Claude 3.5 Sonnet** - Good balance, reasonable cost
- **Local LLM** (Llama 3.1, Mistral) - Private, slower
- **Hugging Face** - Specialized recipe models

**File:** `src/services/aiProviders/openaiService.ts`
```typescript
export class OpenAIRecipeService {
  async generateRecipe(request: AIRecipeRequest): Promise<AIRecipeResponse> {
    const prompt = this.buildRecipePrompt(request);
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });
    return this.parseRecipeResponse(response);
  }
}
```

### Phase 2: Enhanced Smart Suggestions

#### 2.1 Update SmartSuggestionService
**File:** `src/services/smartRecipeSuggestionService.ts`

**Add new method:**
```typescript
static async generateAIRecipeSuggestions(
  businessId: number, 
  expiringItems: Item[]
): Promise<RecipeSuggestion[]> {
  // 1. Group items by cuisine compatibility
  const itemGroups = this.groupItemsByCuisine(expiringItems);
  
  // 2. Generate AI recipes for each group
  const aiRecipes = [];
  for (const group of itemGroups) {
    const aiRecipe = await AIRecipeGenerationService.generateRecipe({
      availableIngredients: group.items,
      cuisine: group.cuisine,
      difficulty: 'medium',
      servings: 4
    });
    aiRecipes.push(aiRecipe);
  }
  
  // 3. Convert to RecipeSuggestion format
  return aiRecipes.map(recipe => this.convertAIRecipeToSuggestion(recipe));
}
```

#### 2.2 Enhanced Suggestion Types
**Update RecipeSuggestionModel:**
```typescript
suggestionType: {
  type: DataTypes.ENUM('existing_recipe', 'ai_generated', 'ingredient_combination'),
  allowNull: false,
  defaultValue: 'existing_recipe'
},
aiGenerated: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: false
},
aiConfidence: {
  type: DataTypes.DECIMAL(3, 2),
  allowNull: true,
  validate: { min: 0.0, max: 1.0 }
}
```

### Phase 3: Recipe Validation & Safety

#### 3.1 Ingredient Safety Check
**File:** `src/services/recipeValidationService.ts`
```typescript
export class RecipeValidationService {
  async validateAIRecipe(recipe: AIRecipeResponse): Promise<ValidationResult> {
    // 1. Check ingredient compatibility
    const compatibility = await this.checkIngredientCompatibility(recipe.ingredients);
    
    // 2. Validate cooking instructions
    const safetyCheck = await this.validateCookingSafety(recipe.instructions);
    
    // 3. Check for allergens
    const allergenCheck = await this.checkAllergens(recipe.ingredients);
    
    return {
      isValid: compatibility && safetyCheck && !allergenCheck.hasAllergens,
      confidence: this.calculateConfidence(compatibility, safetyCheck, allergenCheck),
      warnings: allergenCheck.warnings
    };
  }
}
```

#### 3.2 Recipe Approval Workflow
**File:** `src/models/AIRecipeApprovalModel.ts`
```typescript
export class AIRecipeApprovalModel extends Model {
  public id!: number;
  public businessId!: number;
  public aiGeneratedRecipe!: string; // JSON
  public status: 'pending' | 'approved' | 'rejected' | 'modified';
  public approvedBy?: number;
  public approvedAt?: Date;
  public chefNotes?: string;
  public modifications?: string; // JSON
}
```

### Phase 4: API Endpoints

#### 4.1 AI Recipe Generation Endpoint
**File:** `src/controllers/aiRecipeController.ts`
```typescript
export const generateAIRecipe = async (req: Request, res: Response) => {
  const { expiringItems, cuisine, difficulty, servings } = req.body;
  
  try {
    // 1. Generate AI recipe
    const aiRecipe = await AIRecipeGenerationService.generateRecipe({
      availableIngredients: expiringItems,
      cuisine,
      difficulty,
      servings
    });
    
    // 2. Validate recipe
    const validation = await RecipeValidationService.validateAIRecipe(aiRecipe);
    
    // 3. Create approval record
    const approval = await AIRecipeApprovalModel.create({
      businessId: req.user.businessId,
      aiGeneratedRecipe: JSON.stringify(aiRecipe),
      status: validation.isValid ? 'pending' : 'rejected'
    });
    
    res.json({
      success: true,
      recipe: aiRecipe,
      validation,
      approvalId: approval.id
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

#### 4.2 Recipe Approval Endpoint
```typescript
export const approveAIRecipe = async (req: Request, res: Response) => {
  const { approvalId, action, modifications } = req.body;
  
  const approval = await AIRecipeApprovalModel.findByPk(approvalId);
  
  if (action === 'approve') {
    // Convert AI recipe to actual recipe
    const aiRecipe = JSON.parse(approval.aiGeneratedRecipe);
    const recipe = await RecipeModel.create({
      ...aiRecipe,
      businessId: req.user.businessId,
      isActive: true,
      aiGenerated: true
    });
    
    approval.update({ status: 'approved', approvedBy: req.user.id });
  }
};
```

### Phase 5: Enhanced Smart Suggestions

#### 5.1 Update Smart Suggestions Logic
**File:** `src/services/smartRecipeSuggestionService.ts`

**Enhanced getSmartSuggestions method:**
```typescript
static async getSmartSuggestions(criteria: SmartSuggestionCriteria): Promise<RecipeSuggestion[]> {
  // 1. Get existing recipe suggestions (current logic)
  const existingSuggestions = await this.getExistingSuggestions(criteria);
  
  // 2. Generate AI recipe suggestions if enabled
  if (criteria.includeAIGenerated) {
    const expiringItems = await this.getItemsNeedingAttention(criteria.businessId, criteria);
    const aiSuggestions = await this.generateAIRecipeSuggestions(criteria.businessId, expiringItems);
    existingSuggestions.push(...aiSuggestions);
  }
  
  return existingSuggestions;
}
```

### Phase 6: Mobile App Integration

#### 6.1 Enhanced API Response
```json
{
  "success": true,
  "suggestions": [
    {
      "recipeId": 15,
      "recipeName": "AI-Generated Truffle Basil Pasta",
      "suggestionType": "ai_generated",
      "aiGenerated": true,
      "aiConfidence": 0.87,
      "confidence": 0.85,
      "urgency": "high",
      "totalPotentialSavings": 45.50,
      "requiresApproval": true,
      "approvalId": 123
    }
  ]
}
```

#### 6.2 Mobile App Features
- **AI Recipe Cards** - Special styling for AI-generated recipes
- **Confidence Indicators** - Show AI confidence level
- **Approval Workflow** - Chef approval interface
- **Recipe Preview** - Show generated recipe before approval

### Phase 7: Cost Optimization

#### 7.1 Caching Strategy
```typescript
// Cache AI responses for similar ingredient combinations
const cacheKey = this.generateCacheKey(expiringItems, cuisine, difficulty);
const cachedRecipe = await this.cache.get(cacheKey);
if (cachedRecipe) return cachedRecipe;
```

#### 7.2 Batch Processing
```typescript
// Generate multiple recipes in one API call
const batchRequest = {
  requests: itemGroups.map(group => ({
    availableIngredients: group.items,
    cuisine: group.cuisine
  }))
};
```

## Implementation Timeline

**Week 1-2:** AI Service Layer & Provider Integration  
**Week 3-4:** Recipe Validation & Safety Systems  
**Week 5-6:** API Endpoints & Approval Workflow  
**Week 7-8:** Enhanced Smart Suggestions Integration  
**Week 9-10:** Mobile App Updates & Testing  

## Cost Considerations

- **OpenAI GPT-4:** ~$0.03-0.06 per recipe generation
- **Claude 3.5:** ~$0.015-0.03 per recipe generation
- **Local LLM:** One-time setup cost, no per-request fees
- **Caching:** Can reduce costs by 60-80%

## Success Metrics

- **Recipe Generation Speed:** < 5 seconds per recipe
- **Validation Accuracy:** > 95% safe recipes
- **Chef Approval Rate:** > 80% of AI recipes approved
- **Cost per Recipe:** < $0.02 average
- **Waste Reduction:** 15-25% improvement over existing system

## Technical Requirements

### Dependencies
- OpenAI API or alternative AI provider
- Recipe validation database
- Caching system (Redis recommended)
- Image generation for recipe photos (optional)

### Database Changes
- New `ai_recipe_approvals` table
- Enhanced `recipe_suggestions` table with AI fields
- New `recipe_validation_rules` table

### Security Considerations
- API key management for AI providers
- Input validation for AI prompts
- Rate limiting for AI requests
- Data privacy for generated recipes

## Risk Mitigation

### Technical Risks
- **AI Provider Downtime:** Implement fallback providers
- **Recipe Quality:** Multi-layer validation system
- **Cost Overruns:** Implement usage limits and caching

### Business Risks
- **Chef Resistance:** Gradual rollout with approval workflow
- **Food Safety:** Comprehensive validation system
- **Customer Acceptance:** Clear labeling of AI-generated recipes

## Future Enhancements

### Phase 8: Advanced Features
- **Multi-language Support** - Generate recipes in different languages
- **Dietary Restrictions** - AI-aware of allergies and preferences
- **Seasonal Adaptations** - Adjust recipes based on seasonal ingredients
- **Cultural Adaptations** - Adapt recipes to local cuisine preferences

### Phase 9: Machine Learning
- **Feedback Loop** - Learn from chef approvals/rejections
- **Personalization** - Adapt to restaurant's style and preferences
- **Predictive Analytics** - Predict which AI recipes will be approved

## Conclusion

This implementation plan transforms the system from "smart matching" to "AI-powered recipe generation" while maintaining safety and quality standards. The phased approach allows for gradual rollout and validation at each step.

The key success factors are:
1. **Safety First** - Comprehensive validation system
2. **Chef Approval** - Human oversight for quality control
3. **Cost Management** - Efficient caching and batch processing
4. **User Experience** - Seamless integration with existing workflow 