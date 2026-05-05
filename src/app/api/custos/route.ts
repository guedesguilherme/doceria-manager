import { NextRequest } from 'next/server'
import { db } from '@/db'
import { indirectCosts } from '@/db/schema'
import { isNull, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const result = await db
      .select()
      .from(indirectCosts)
      .where(isNull(indirectCosts.deletedAt))
      .orderBy(desc(indirectCosts.createdAt))

    return Response.json(result)
  } catch (error) {
    console.error('Error fetching indirect costs:', error)
    return Response.json({ error: 'Failed to fetch indirect costs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, value } = body

    if (!name || !type || value == null) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['fixo_mensal', 'por_unidade'].includes(type)) {
      return Response.json({ error: 'Invalid type' }, { status: 400 })
    }

    const [inserted] = await db
      .insert(indirectCosts)
      .values({ name, type, value: Number(value) })
      .returning()

    return Response.json(inserted, { status: 201 })
  } catch (error) {
    console.error('Error creating indirect cost:', error)
    return Response.json({ error: 'Failed to create indirect cost' }, { status: 500 })
  }
}
