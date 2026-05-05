import { NextRequest } from 'next/server'
import { db } from '@/db'
import { ingredients } from '@/db/schema'
import { isNull, desc } from 'drizzle-orm'
import { calcCostPerUnit } from '@/lib/calculations'

export async function GET() {
  try {
    const result = await db
      .select()
      .from(ingredients)
      .where(isNull(ingredients.deletedAt))
      .orderBy(desc(ingredients.createdAt))

    return Response.json(result)
  } catch (error) {
    console.error('Error fetching ingredients:', error)
    return Response.json({ error: 'Failed to fetch ingredients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, unit, purchasePrice, purchaseQuantity } = body

    if (!name || !unit || purchasePrice == null || purchaseQuantity == null) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (purchaseQuantity <= 0) {
      return Response.json({ error: 'Purchase quantity must be greater than 0' }, { status: 400 })
    }

    const costPerUnit = calcCostPerUnit(Number(purchasePrice), Number(purchaseQuantity))

    const [inserted] = await db
      .insert(ingredients)
      .values({
        name,
        unit,
        purchasePrice: Number(purchasePrice),
        purchaseQuantity: Number(purchaseQuantity),
        costPerUnit,
      })
      .returning()

    return Response.json(inserted, { status: 201 })
  } catch (error) {
    console.error('Error creating ingredient:', error)
    return Response.json({ error: 'Failed to create ingredient' }, { status: 500 })
  }
}
