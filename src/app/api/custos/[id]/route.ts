import { NextRequest } from 'next/server'
import { db } from '@/db'
import { indirectCosts } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const [cost] = await db
      .select()
      .from(indirectCosts)
      .where(eq(indirectCosts.id, Number(id)))
      .limit(1)

    if (!cost || cost.deletedAt) {
      return Response.json({ error: 'Indirect cost not found' }, { status: 404 })
    }

    return Response.json(cost)
  } catch (error) {
    console.error('Error fetching indirect cost:', error)
    return Response.json({ error: 'Failed to fetch indirect cost' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, type, value } = body

    if (!name || !type || value == null) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const [updated] = await db
      .update(indirectCosts)
      .set({ name, type, value: Number(value) })
      .where(eq(indirectCosts.id, Number(id)))
      .returning()

    if (!updated) {
      return Response.json({ error: 'Indirect cost not found' }, { status: 404 })
    }

    return Response.json(updated)
  } catch (error) {
    console.error('Error updating indirect cost:', error)
    return Response.json({ error: 'Failed to update indirect cost' }, { status: 500 })
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
      .update(indirectCosts)
      .set({ deletedAt: now })
      .where(eq(indirectCosts.id, Number(id)))
      .returning()

    if (!deleted) {
      return Response.json({ error: 'Indirect cost not found' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting indirect cost:', error)
    return Response.json({ error: 'Failed to delete indirect cost' }, { status: 500 })
  }
}
