import { db } from '@/db'
import { ingredients, recipes, recipeIngredients, indirectCosts } from '@/db/schema'
import { eq, isNull, and } from 'drizzle-orm'

export function calcCostPerUnit(purchasePrice: number, purchaseQuantity: number): number {
  if (purchaseQuantity === 0) return 0
  return purchasePrice / purchaseQuantity
}

export async function calcRecipeCost(recipeId: number, visited: Set<number> = new Set()): Promise<number> {
  if (visited.has(recipeId)) return 0
  visited.add(recipeId)

  const items = await db
    .select()
    .from(recipeIngredients)
    .where(and(eq(recipeIngredients.recipeId, recipeId), isNull(recipeIngredients.deletedAt)))

  let totalCost = 0

  for (const item of items) {
    if (item.ingredientId) {
      const [ingredient] = await db
        .select()
        .from(ingredients)
        .where(eq(ingredients.id, item.ingredientId))
        .limit(1)

      if (ingredient) {
        totalCost += ingredient.costPerUnit * item.quantity
      }
    } else if (item.subRecipeId) {
      const [subRecipe] = await db
        .select()
        .from(recipes)
        .where(eq(recipes.id, item.subRecipeId))
        .limit(1)

      if (subRecipe) {
        const subCost = await calcRecipeCost(item.subRecipeId, new Set(visited))
        const costPerYieldUnit = subRecipe.yieldQuantity > 0 ? subCost / subRecipe.yieldQuantity : 0
        totalCost += costPerYieldUnit * item.quantity
      }
    }
  }

  return totalCost
}

export async function getIndirectCostAllocation(estimatedMonthlyProductions: number = 20): Promise<number> {
  const costs = await db
    .select()
    .from(indirectCosts)
    .where(isNull(indirectCosts.deletedAt))

  let total = 0

  for (const cost of costs) {
    if (cost.type === 'fixo_mensal') {
      total += cost.value / estimatedMonthlyProductions
    } else if (cost.type === 'por_unidade') {
      total += cost.value
    }
  }

  return total
}

export function calcSuggestedPrice(
  totalCost: number,
  markup: number = 3.5
): number {
  return totalCost * markup
}

export interface PricingBreakdown {
  ingredientCost: number
  indirectCostPerUnit: number
  totalCostPerUnit: number
  suggestedPrice: number
  markup: number
}

export async function calcPricingForRecipe(
  recipeId: number,
  markup: number = 3.5
): Promise<PricingBreakdown> {
  const [recipe] = await db
    .select()
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1)

  if (!recipe) {
    throw new Error('Recipe not found')
  }

  const ingredientCost = await calcRecipeCost(recipeId)
  const indirectCostPerUnit = await getIndirectCostAllocation()

  const totalCostPerUnit = ingredientCost / recipe.yieldQuantity + indirectCostPerUnit
  const suggestedPrice = calcSuggestedPrice(totalCostPerUnit, markup)

  return {
    ingredientCost,
    indirectCostPerUnit,
    totalCostPerUnit,
    suggestedPrice,
    markup,
  }
}
