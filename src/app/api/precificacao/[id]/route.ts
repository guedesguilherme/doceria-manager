import { NextRequest } from 'next/server'
import { calcPricingForRecipe } from '@/lib/calculations'
import { db } from '@/db'
import { recipes } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const markup = parseFloat(searchParams.get('markup') ?? '3.5')

    const [recipe] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, Number(id)))
      .limit(1)

    if (!recipe || recipe.deletedAt) {
      return Response.json({ error: 'Recipe not found' }, { status: 404 })
    }

    const pricing = await calcPricingForRecipe(Number(id), markup)

    return Response.json({
      recipe,
      pricing,
    })
  } catch (error) {
    console.error('Error calculating pricing:', error)
    return Response.json({ error: 'Failed to calculate pricing' }, { status: 500 })
  }
}
