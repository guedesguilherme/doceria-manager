import { NextRequest } from 'next/server'
import { db } from '@/db'
import { recipes, recipeIngredients, ingredients } from '@/db/schema'
import { isNull, desc, eq, and } from 'drizzle-orm'
import { calcRecipeCost } from '@/lib/calculations'

export async function GET() {
  try {
    const result = await db
      .select()
      .from(recipes)
      .where(isNull(recipes.deletedAt))
      .orderBy(desc(recipes.createdAt))

    return Response.json(result)
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return Response.json({ error: 'Failed to fetch recipes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, yieldQuantity, yieldUnit, items } = body

    if (!name || !yieldQuantity || !yieldUnit) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const [inserted] = await db
      .insert(recipes)
      .values({
        name,
        yieldQuantity: Number(yieldQuantity),
        yieldUnit,
        totalCost: 0,
      })
      .returning()

    if (items && Array.isArray(items) && items.length > 0) {
      await db.insert(recipeIngredients).values(
        items.map((item: { ingredientId?: number; subRecipeId?: number; quantity: number }) => ({
          recipeId: inserted.id,
          ingredientId: item.ingredientId || null,
          subRecipeId: item.subRecipeId || null,
          quantity: Number(item.quantity),
        }))
      )
    }

    const totalCost = await calcRecipeCost(inserted.id)
    const [updated] = await db
      .update(recipes)
      .set({ totalCost })
      .where(eq(recipes.id, inserted.id))
      .returning()

    return Response.json(updated, { status: 201 })
  } catch (error) {
    console.error('Error creating recipe:', error)
    return Response.json({ error: 'Failed to create recipe' }, { status: 500 })
  }
}
