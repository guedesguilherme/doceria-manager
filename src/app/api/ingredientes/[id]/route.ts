import { NextRequest } from 'next/server'
import { db } from '@/db'
import { ingredients } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { calcCostPerUnit } from '@/lib/calculations'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const [ingredient] = await db
      .select()
      .from(ingredients)
      .where(eq(ingredients.id, Number(id)))
      .limit(1)

    if (!ingredient || ingredient.deletedAt) {
      return Response.json({ error: 'Ingredient not found' }, { status: 404 })
    }

    return Response.json(ingredient)
  } catch (error) {
    console.error('Error fetching ingredient:', error)
    return Response.json({ error: 'Failed to fetch ingredient' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, unit, purchasePrice, purchaseQuantity } = body

    if (!name || !unit || purchasePrice == null || purchaseQuantity == null) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (purchaseQuantity <= 0) {
      return Response.json({ error: 'Purchase quantity must be greater than 0' }, { status: 400 })
    }

    const costPerUnit = calcCostPerUnit(Number(purchasePrice), Number(purchaseQuantity))

    const [updated] = await db
      .update(ingredients)
      .set({
        name,
        unit,
        purchasePrice: Number(purchasePrice),
        purchaseQuantity: Number(purchaseQuantity),
        costPerUnit,
      })
      .where(eq(ingredients.id, Number(id)))
      .returning()

    if (!updated) {
      return Response.json({ error: 'Ingredient not found' }, { status: 404 })
    }

    return Response.json(updated)
  } catch (error) {
    console.error('Error updating ingredient:', error)
    return Response.json({ error: 'Failed to update ingredient' }, { status: 500 })
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
      .update(ingredients)
      .set({ deletedAt: now })
      .where(eq(ingredients.id, Number(id)))
      .returning()

    if (!deleted) {
      return Response.json({ error: 'Ingredient not found' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting ingredient:', error)
    return Response.json({ error: 'Failed to delete ingredient' }, { status: 500 })
  }
}
