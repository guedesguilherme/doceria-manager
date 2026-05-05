import { NextRequest } from 'next/server'
import { db } from '@/db'
import { recipes, recipeIngredients, ingredients } from '@/db/schema'
import { eq, isNull, and } from 'drizzle-orm'
import { calcRecipeCost } from '@/lib/calculations'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const [recipe] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, Number(id)))
      .limit(1)

    if (!recipe || recipe.deletedAt) {
      return Response.json({ error: 'Recipe not found' }, { status: 404 })
    }

    const items = await db
      .select({
        id: recipeIngredients.id,
        ingredientId: recipeIngredients.ingredientId,
        subRecipeId: recipeIngredients.subRecipeId,
        quantity: recipeIngredients.quantity,
        ingredientName: ingredients.name,
        ingredientUnit: ingredients.unit,
        ingredientCostPerUnit: ingredients.costPerUnit,
      })
      .from(recipeIngredients)
      .leftJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
      .where(and(eq(recipeIngredients.recipeId, Number(id)), isNull(recipeIngredients.deletedAt)))

    const subRecipeDetails = await Promise.all(
      items
        .filter(i => i.subRecipeId)
        .map(async (i) => {
          const [sr] = await db.select().from(recipes).where(eq(recipes.id, i.subRecipeId!)).limit(1)
          return { id: i.subRecipeId, name: sr?.name, yieldQuantity: sr?.yieldQuantity, totalCost: sr?.totalCost }
        })
    )

    const enrichedItems = items.map(item => {
      if (item.subRecipeId) {
        const sr = subRecipeDetails.find(s => s.id === item.subRecipeId)
        return { ...item, subRecipeName: sr?.name, subRecipeYieldQuantity: sr?.yieldQuantity, subRecipeTotalCost: sr?.totalCost }
      }
      return item
    })

    return Response.json({ ...recipe, items: enrichedItems })
  } catch (error) {
    console.error('Error fetching recipe:', error)
    return Response.json({ error: 'Failed to fetch recipe' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, yieldQuantity, yieldUnit, items } = body

    if (!name || !yieldQuantity || !yieldUnit) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await db
      .update(recipes)
      .set({ name, yieldQuantity: Number(yieldQuantity), yieldUnit })
      .where(eq(recipes.id, Number(id)))

    // Soft delete old items and re-insert
    const now = new Date().toISOString()
    await db
      .update(recipeIngredients)
      .set({ deletedAt: now })
      .where(eq(recipeIngredients.recipeId, Number(id)))

    if (items && Array.isArray(items) && items.length > 0) {
      await db.insert(recipeIngredients).values(
        items.map((item: { ingredientId?: number; subRecipeId?: number; quantity: number }) => ({
          recipeId: Number(id),
          ingredientId: item.ingredientId || null,
          subRecipeId: item.subRecipeId || null,
          quantity: Number(item.quantity),
        }))
      )
    }

    const totalCost = await calcRecipeCost(Number(id))
    const [updated] = await db
      .update(recipes)
      .set({ totalCost })
      .where(eq(recipes.id, Number(id)))
      .returning()

    return Response.json(updated)
  } catch (error) {
    console.error('Error updating recipe:', error)
    return Response.json({ error: 'Failed to update recipe' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const now = new Date().toISOString()

    const [deleted] = await db
      .update(recipes)
      .set({ deletedAt: now })
      .where(eq(recipes.id, Number(id)))
      .returning()

    if (!deleted) {
      return Response.json({ error: 'Recipe not found' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting recipe:', error)
    return Response.json({ error: 'Failed to delete recipe' }, { status: 500 })
  }
}
